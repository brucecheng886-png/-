"""
圖譜導入 API - Excel/CSV 檔案智能解析
整合 LLM 進行自動化標題生成、描述撰寫與關係推薦

v3.0 優化:
- 批次處理: 多行資料合併為一次 LLM 呼叫 (預設 5 行/批)
- 並行執行: asyncio.gather + Semaphore 控制併發
- 精簡 Prompt: 去除裝飾文字，降低 token 消耗
- 可配置角色: 不再寫死公司名稱
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import logging
import json
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

# ===== 可調參數 =====
BATCH_SIZE = 5          # 每批送 LLM 的資料筆數
MAX_CONCURRENCY = 3     # 最大並行 LLM 請求數
LLM_TIMEOUT = 120       # 單次 LLM 呼叫超時 (秒)


# ===== LLM Prompt 配置 (v3.0 - 精簡批次版) =====

SYSTEM_ROLE = """你是企業級知識圖譜架構師。根據輸入資料，為每筆記錄產生結構化的圖譜節點。

輸出規則：
- 回傳一個 JSON 陣列，每個元素對應一筆輸入
- 不要包含 Markdown 標記或任何額外文字
- 只輸出純 JSON"""

NODE_SCHEMA = """{
  "label": "3-10字精準標題",
  "description": "100-200字描述，含背景、核心內容、應用場景",
  "type": "技術架構|API介面|數據流程|安全規範|業務流程|最佳實踐|問題排查|配置文檔|自訂(2-4字)",
  "keywords": ["關鍵詞1", "關鍵詞2", "關鍵詞3"],
  "suggested_links": [
    {"target_index": 0, "relation": "dependency|causality|sequence|composition|complement|contrast", "reason": "連線原因(30字內)"}
  ]
}"""


def build_batch_prompt(
    rows: List[str],
    existing_node_names: Optional[List[str]] = None
) -> str:
    """
    建構批次分析 Prompt — 一次送多筆資料給 LLM
    
    Args:
        rows: 每筆資料的文字描述 (已格式化為 "col: val | col: val")
        existing_node_names: 現有節點名稱列表 (用於避免重複)
    """
    # 編號每筆資料
    numbered = "\n".join([f"[{i}] {row}" for i, row in enumerate(rows)])
    
    # 現有節點上下文 (精簡版 — 只列名稱)
    existing_ctx = ""
    if existing_node_names:
        names = ", ".join(existing_node_names[:30])
        existing_ctx = f"\n已存在的節點: {names}\n避免建立重複節點，suggested_links 的 target_index 可用 -1 代表連線到已存在的節點。\n"
    
    return f"""{SYSTEM_ROLE}

節點 Schema:
{NODE_SCHEMA}
{existing_ctx}
以下有 {len(rows)} 筆資料，請輸出 JSON 陣列（長度 = {len(rows)}）：

{numbered}

suggested_links.target_index 指向本批次內其他資料的編號 (0-based)，若無關聯則留空陣列。
輸出純 JSON 陣列，不要任何多餘文字："""


def build_node_analysis_prompt(
    raw_content: str, 
    existing_nodes: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    單筆分析 Prompt（向下相容，當批次為 1 時使用）
    """
    existing_names = None
    if existing_nodes:
        existing_names = [n.get('name', '') for n in existing_nodes if n.get('name')]
    return build_batch_prompt([raw_content], existing_names)


def _extract_json(text: str):
    """從 LLM 回應中提取 JSON（支援陣列和物件）"""
    import re
    text = text.strip()
    
    # 1. 直接解析
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # 2. 從 markdown 代碼塊提取
    md = re.search(r'```(?:json)?\s*([\[\{].*?[\]\}])\s*```', text, re.DOTALL)
    if md:
        try:
            return json.loads(md.group(1))
        except json.JSONDecodeError:
            pass
    
    # 3. 找第一個 [ ] 或 { }
    for open_ch, close_ch in [('[', ']'), ('{', '}')]:
        start = text.find(open_ch)
        end = text.rfind(close_ch)
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                continue
    
    raise ValueError("無法從 LLM 回應中解析 JSON")


def _validate_node(data: Dict[str, Any]) -> Dict[str, Any]:
    """驗證並清洗單一節點資料"""
    required = ['label', 'description', 'type']
    for f in required:
        if f not in data:
            data[f] = "未提供" if f != 'type' else "未分類"
    
    # description 截斷
    if len(data.get('description', '')) > 500:
        data['description'] = data['description'][:500] + "..."
    
    # links / suggested_links 統一為 suggested_links
    if 'links' in data and 'suggested_links' not in data:
        data['suggested_links'] = data.pop('links')
    data.setdefault('suggested_links', [])
    if len(data['suggested_links']) > 5:
        data['suggested_links'] = data['suggested_links'][:5]
    
    # keywords
    data.setdefault('keywords', [])
    
    return data


def parse_llm_response(llm_output: str) -> List[Dict[str, Any]]:
    """
    解析 LLM 回應，統一回傳 List[Dict]
    支援：純 JSON / Markdown 包裹 / 陣列或單一物件
    """
    raw = _extract_json(llm_output)
    
    # 統一為列表
    items = raw if isinstance(raw, list) else [raw]
    
    return [_validate_node(item) for item in items]


# ===== 預設回應 =====
_DEFAULT_NODE = {
    "label": "LLM 分析失敗",
    "description": "自動分析過程發生錯誤，請手動編輯此節點。",
    "type": "未分類",
    "keywords": [],
    "suggested_links": [],
}

_NO_KEY_NODE = {
    "label": "待配置 LLM",
    "description": "Dify API Key 尚未設定，請至系統設定頁面配置後重新匯入。",
    "type": "未分類",
    "keywords": [],
    "suggested_links": [],
}


async def call_llm_batch(
    rows: List[str],
    existing_node_names: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    批次呼叫 Dify LLM — 一次送 N 筆資料，回傳 N 個節點分析結果
    
    Args:
        rows: 每筆資料的文字描述
        existing_node_names: 現有節點名稱列表
    
    Returns:
        List[Dict] — 長度與 rows 相同；失敗時填入預設節點
    """
    from backend.core.config import get_current_api_keys, settings
    import httpx

    api_keys = get_current_api_keys()
    dify_api_key = api_keys.get('DIFY_API_KEY', '')
    dify_api_url = api_keys.get('DIFY_API_URL', settings.DIFY_API_URL)

    if not dify_api_key:
        logger.warning("Dify API Key 未配置，使用預設回應")
        return [dict(_NO_KEY_NODE) for _ in rows]

    prompt = build_batch_prompt(rows, existing_node_names)

    try:
        async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
            resp = await client.post(
                f"{dify_api_url}/chat-messages",
                headers={
                    "Authorization": f"Bearer {dify_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "query": prompt,
                    "user": "graph-import-system",
                    "inputs": {},
                    "response_mode": "blocking",
                },
            )
            resp.raise_for_status()
            answer = resp.json().get("answer", "")

        if not answer:
            raise ValueError("Dify 回應為空")

        logger.info(f"Dify LLM 回應（前 200 字）: {answer[:200]}")
        results = parse_llm_response(answer)

        # 若 LLM 回傳數量不足，補齊預設
        while len(results) < len(rows):
            results.append(dict(_DEFAULT_NODE))

        return results[:len(rows)]

    except httpx.HTTPStatusError as e:
        logger.error(f"Dify API HTTP 錯誤 {e.response.status_code}: {e.response.text[:300]}")
    except httpx.TimeoutException:
        logger.error(f"Dify API 請求超時 ({LLM_TIMEOUT}s)")
    except Exception as e:
        logger.error(f"LLM 批次分析失敗: {e}")

    return [dict(_DEFAULT_NODE) for _ in rows]


async def call_llm_analysis(prompt: str) -> Dict[str, Any]:
    """向下相容：單筆 LLM 分析（內部調用 call_llm_batch）"""
    results = await call_llm_batch([prompt])
    return results[0]


# ===== API 端點 =====
@router.post("/import/excel")
async def import_excel(file: UploadFile = File(...)):
    """
    導入 Excel/CSV 檔案並使用 LLM 智能解析（v3.0 批次並行版）
    
    優化策略:
    - 每 BATCH_SIZE 行合併為 1 次 LLM 呼叫（減少 ~80% API 請求）
    - 最多 MAX_CONCURRENCY 個批次同時執行
    - Prompt 從 ~2000 token 精簡至 ~500 token / 批
    """
    try:
        # 驗證檔案類型
        if not file.filename:
            raise HTTPException(status_code=400, detail="檔案名稱無效")
        
        filename = file.filename.lower()
        if not (filename.endswith('.xlsx') or filename.endswith('.csv')):
            raise HTTPException(
                status_code=400,
                detail="不支援的檔案格式，請上傳 .xlsx 或 .csv 檔案"
            )
        
        # 讀取並解析檔案
        contents = await file.read()
        if filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))
        
        logger.info(f"成功讀取檔案: {file.filename}, 行數: {len(df)}, 欄位: {list(df.columns)}")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="檔案內容為空")
        
        # ---- 準備每行的文字描述 ----
        row_texts: List[str] = []
        row_names: List[str] = []
        first_col = str(df.columns[0])
        
        for row_idx, (idx, row) in enumerate(df.iterrows()):
            raw = " | ".join(
                f"{col}: {row[col]}" for col in df.columns if pd.notna(row[col])
            )
            row_texts.append(raw)
            name = str(row[first_col]) if first_col in row and pd.notna(row[first_col]) else f"節點 {row_idx + 1}"
            row_names.append(name)
        
        # ---- 取得現有節點名稱 (用於避免重複) ----
        existing_names: Optional[List[str]] = None
        # NOTE: 現階段不傳入 existing_names，因為 import endpoint
        #       未綁定特定 graph_id。未來可加 query param 指定圖譜後啟用。
        
        # ---- 分批 ----
        batches: List[List[int]] = []
        for i in range(0, len(row_texts), BATCH_SIZE):
            batches.append(list(range(i, min(i + BATCH_SIZE, len(row_texts)))))
        
        total_batches = len(batches)
        logger.info(
            f"分批策略: {len(row_texts)} 行 → {total_batches} 批 "
            f"(BATCH_SIZE={BATCH_SIZE}, MAX_CONCURRENCY={MAX_CONCURRENCY})"
        )
        
        # ---- 並行處理各批次 ----
        semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
        llm_results: List[Optional[List[Dict]]] = [None] * total_batches
        
        async def process_batch(batch_idx: int, indices: List[int]):
            async with semaphore:
                texts = [row_texts[i] for i in indices]
                logger.info(f"批次 {batch_idx + 1}/{total_batches} 開始 ({len(texts)} 筆)")
                result = await call_llm_batch(texts, existing_names)
                llm_results[batch_idx] = result
                logger.info(f"批次 {batch_idx + 1}/{total_batches} 完成")
        
        tasks = [process_batch(bi, idxs) for bi, idxs in enumerate(batches)]
        await asyncio.gather(*tasks)
        
        # ---- 組裝節點 ----
        nodes: List[Dict[str, Any]] = []
        ts = datetime.now().timestamp()
        
        for batch_idx, indices in enumerate(batches):
            batch_results = llm_results[batch_idx] or []
            for local_i, global_i in enumerate(indices):
                if local_i < len(batch_results):
                    llm = batch_results[local_i]
                else:
                    llm = dict(_DEFAULT_NODE)
                
                node = {
                    "id": f"node_{ts}_{global_i}",
                    "name": row_names[global_i],
                    "label": llm.get("label", "未命名"),
                    "description": llm.get("description", ""),
                    "type": llm.get("type", "未分類"),
                    "group": 1,
                    "size": 20,
                    "keywords": llm.get("keywords", []),
                    "suggested_links": llm.get("suggested_links", []),
                    "raw_data": df.iloc[global_i].to_dict(),
                }
                nodes.append(node)
        
        # ---- 將 suggested_links 的 batch-local index 轉為全域 node id ----
        for batch_idx, indices in enumerate(batches):
            offset = indices[0]  # 此批次在全域 nodes 中的起始位置
            for local_i, global_i in enumerate(indices):
                node = nodes[global_i]
                resolved_links = []
                for link in node.get("suggested_links", []):
                    target_idx = link.get("target_index")
                    if target_idx is not None and isinstance(target_idx, int):
                        abs_idx = offset + target_idx
                        if 0 <= abs_idx < len(nodes) and abs_idx != global_i:
                            resolved_links.append({
                                "target_id": nodes[abs_idx]["id"],
                                "target_name": nodes[abs_idx]["name"],
                                "relation": link.get("relation", "complement"),
                                "reason": link.get("reason", ""),
                            })
                node["links"] = resolved_links
                del node["suggested_links"]
        
        logger.info(f"Excel 導入完成: {len(nodes)} 個節點, {total_batches} 批 LLM 呼叫")
        return nodes
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="檔案內容為空或格式錯誤")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"導入失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"導入失敗: {str(e)}")


@router.get("/import/template")
async def download_template():
    """
    下載 Excel 導入模板
    """
    # TODO: 實現模板下載功能
    return {
        "message": "模板下載功能開發中",
        "suggested_columns": [
            "標題",
            "內容",
            "類型",
            "標籤",
            "來源"
        ]
    }


@router.get("/import/status")
async def get_import_status():
    """
    獲取當前導入任務狀態
    """
    # TODO: 實現任務狀態追蹤
    return {
        "status": "ready",
        "message": "就緒，可開始導入"
    }
