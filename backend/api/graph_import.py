"""
圖譜導入 API - Excel/CSV 檔案智能解析
整合 LLM 進行自動化標題生成、描述撰寫與關係推薦

v5.0 — 3000 筆一次性分析:
- 自適應批次大小: 根據文字長度動態調整 BATCH_SIZE (5~50)
- 大量模式: >100 筆啟用 fast-mode prompt (省略 suggested_links, 精簡輸出)
- 文字截斷: 每筆 ≤500 字送 LLM，原文保留在 raw_data
- 高併發: MAX_CONCURRENCY=8, BATCH_DELAY=0.3s
- ETA 追蹤: 即時回報預計剩餘時間 + 吞吐量
- 背景任務 + 斷點續傳 + 指數退避重試
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import logging
import json
import asyncio
import random
import uuid
import time
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)
router = APIRouter()

# ===== 可調參數 =====
MAX_CONCURRENCY = 2     # 最大並行 LLM 請求數 (本地 Ollama 單 GPU: 2 即可)
LLM_TIMEOUT = 300       # 單次 LLM 呼叫超時 (秒, 本地模型較慢需加長)
MAX_RETRIES = 3         # 每批最大重試次數
RETRY_BASE_DELAY = 3    # 重試基礎延遲 (秒)
BATCH_DELAY = 1.0       # 批次間延遲 (秒), 讓 GPU 喘口氣
MAX_TEXT_LEN = 500      # 每筆送 LLM 的最大字數 (原文保留在 raw_data)
FAST_MODE_THRESHOLD = 100  # 資料筆數超過此值啟用 fast-mode prompt
TARGET_BATCH_TOKENS = 2000  # 每批目標 input token 數 (小批次避免 GPU OOM)

# ===== Checkpoint 路徑 =====
CHECKPOINT_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "import_checkpoints"
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

# ===== 全域任務追蹤器 =====
_import_tasks: Dict[str, Dict[str, Any]] = {}
_TASK_EXPIRY_SECONDS = 3600  # 完成的任務保留 1 小時後自動清理


def _cleanup_expired_tasks():
    """清理已過期的完成任務（釋放記憶體，特別是 3000 節點的 nodes 陣列）"""
    now = datetime.now()
    expired = []
    for tid, task in _import_tasks.items():
        if task.get("status") in ("done", "error"):
            finished_str = task.get("finished_at")
            if finished_str:
                try:
                    finished = datetime.fromisoformat(finished_str)
                    if (now - finished).total_seconds() > _TASK_EXPIRY_SECONDS:
                        expired.append(tid)
                except (ValueError, TypeError):
                    pass
    for tid in expired:
        del _import_tasks[tid]
    if expired:
        logger.info(f"🗑️ 已清理 {len(expired)} 個過期任務")


# ===== Token 估算 & 自適應批次大小 =====

def _estimate_tokens(text: str) -> int:
    """粗估 token 數：中文字 ≈ 1 token / 字，英文 ≈ 1 token / 4 字元"""
    if not text:
        return 0
    cn = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
    return cn + (len(text) - cn) // 4


def _compute_adaptive_batch_size(row_texts: List[str]) -> int:
    """
    根據平均文字長度自適應調整 BATCH_SIZE
    - 短文本 (推文、標題): batch=40~50
    - 中文本 (摘要): batch=15~30
    - 長文本 (文章): batch=5~10
    """
    if not row_texts:
        return 10
    # 取前 50 筆樣本估算 (已截斷)
    sample = row_texts[:50]
    avg_tokens = sum(_estimate_tokens(t[:MAX_TEXT_LEN]) for t in sample) / len(sample)
    batch_size = max(5, min(50, int(TARGET_BATCH_TOKENS / max(avg_tokens, 10))))
    return batch_size


def _truncate_text(text: str, max_len: int = MAX_TEXT_LEN) -> str:
    """截斷文字至指定長度（附省略號）"""
    if len(text) <= max_len:
        return text
    return text[:max_len] + "..."


# ===== LLM Prompt 配置 =====

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


# ===== Fast-mode Prompt（大量資料 > FAST_MODE_THRESHOLD 筆啟用） =====

SYSTEM_ROLE_FAST = """你是知識圖譜架構師。快速為每筆記錄歸類。

規則：回傳 JSON 陣列，每元素對應一筆輸入。不要 Markdown，只有純 JSON。"""

NODE_SCHEMA_FAST = """{
  "label": "3-8字標題",
  "description": "30-80字摘要",
  "type": "分類(2-4字)",
  "keywords": ["關鍵詞1", "關鍵詞2"]
}"""


def build_batch_prompt_fast(rows: List[str]) -> str:
    """
    大量模式 Prompt — 省略 suggested_links，精簡 description
    輸出 token 約為完整模式的 1/3，適合 30~50 筆/批
    """
    numbered = "\n".join([f"[{i}] {row}" for i, row in enumerate(rows)])
    return f"""{SYSTEM_ROLE_FAST}

Schema:
{NODE_SCHEMA_FAST}

{len(rows)} 筆資料:
{numbered}

輸出 JSON 陣列 (長度={len(rows)})："""


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
    # 嘗試從常見別名提取 label（LLM 可能回傳不同欄位名）
    if 'label' not in data:
        for alt in ['title', 'name', '標題', '名稱']:
            if alt in data and data[alt]:
                data['label'] = str(data[alt])[:50]
                break
    
    required = ['label', 'description', 'type']
    for f in required:
        if f not in data or not data[f]:
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
    fast_mode: bool = False,
) -> List[Dict[str, Any]]:
    """
    批次呼叫 Dify LLM — 一次送 N 筆資料，回傳 N 個節點分析結果
    
    Args:
        rows: 每筆資料的文字描述 (已截斷)
        existing_node_names: 現有節點名稱列表
        fast_mode: True = 使用精簡 prompt（大量模式）
    
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

    # 根據模式選擇 prompt
    if fast_mode:
        prompt = build_batch_prompt_fast(rows)
    else:
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

        logger.info(f"Dify LLM 回應（前 300 字）: {answer[:300]}")
        results = parse_llm_response(answer)
        
        # 統計解析後的有效 label 數
        valid_labels = sum(1 for r in results if r.get("label") not in ("未提供", None, ""))
        logger.info(f"📊 批次解析結果: {len(results)} 個節點, {valid_labels} 個有效 label")

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


async def call_llm_batch_with_retry(
    rows: List[str],
    existing_node_names: Optional[List[str]] = None,
    max_retries: int = MAX_RETRIES,
    fast_mode: bool = False,
) -> List[Dict[str, Any]]:
    """
    帶指數退避重試的批次 LLM 呼叫
    
    - 失敗時最多重試 max_retries 次
    - 每次重試延遲: base * 2^attempt + random(0,1)
    - 若結果全部為「LLM 分析失敗」預設節點也視為失敗觸發重試
    """
    for attempt in range(max_retries):
        try:
            result = await call_llm_batch(rows, existing_node_names, fast_mode=fast_mode)
            
            # 檢查是否全部回傳預設失敗節點
            all_failed = all(
                r.get("label") == _DEFAULT_NODE["label"] for r in result
            )
            if all_failed and len(rows) > 0:
                raise ValueError("全部回傳預設失敗節點，視為失敗")
            
            return result
            
        except Exception as e:
            if attempt < max_retries - 1:
                delay = RETRY_BASE_DELAY * (2 ** attempt) + random.uniform(0, 1)
                logger.warning(
                    f"⚠️ 批次 LLM 失敗 (第 {attempt + 1}/{max_retries} 次)，"
                    f"{delay:.1f}s 後重試: {e}"
                )
                await asyncio.sleep(delay)
            else:
                logger.error(
                    f"❌ 批次 LLM 重試 {max_retries} 次仍失敗: {e}"
                )
                return [dict(_DEFAULT_NODE) for _ in rows]
    
    # 理論上不會到這裡
    return [dict(_DEFAULT_NODE) for _ in rows]


async def call_llm_analysis(prompt: str) -> Dict[str, Any]:
    """向下相容：單筆 LLM 分析（內部調用 call_llm_batch_with_retry）"""
    results = await call_llm_batch_with_retry([prompt])
    return results[0]


# ===== Checkpoint 管理 =====

def _save_checkpoint(task_id: str, completed_batches: set, partial_nodes: List[Dict]):
    """儲存任務 checkpoint"""
    checkpoint_file = CHECKPOINT_DIR / f"{task_id}.json"
    try:
        checkpoint_file.write_text(json.dumps({
            "task_id": task_id,
            "completed_batches": sorted(completed_batches),
            "partial_nodes_count": len(partial_nodes),
            "last_update": datetime.now().isoformat(),
        }, ensure_ascii=False), encoding="utf-8")
    except Exception as e:
        logger.warning(f"Checkpoint 儲存失敗: {e}")


def _load_checkpoint(task_id: str) -> set:
    """載入已完成的批次索引"""
    checkpoint_file = CHECKPOINT_DIR / f"{task_id}.json"
    if checkpoint_file.exists():
        try:
            data = json.loads(checkpoint_file.read_text(encoding="utf-8"))
            return set(data.get("completed_batches", []))
        except Exception as e:
            logger.warning(f"Checkpoint 讀取失敗: {e}")
    return set()


def _cleanup_checkpoint(task_id: str):
    """任務完成後清理 checkpoint"""
    checkpoint_file = CHECKPOINT_DIR / f"{task_id}.json"
    try:
        if checkpoint_file.exists():
            checkpoint_file.unlink()
    except Exception as e:
        logger.warning(f"Checkpoint 清理失敗: {e}")


# ===== 背景匯入任務 =====

async def _run_import(
    task_id: str,
    row_texts: List[str],
    row_names: List[str],
    df: pd.DataFrame,
    existing_names: Optional[List[str]] = None,
    graph_id: Optional[str] = None,
    ragflow_dataset_id: Optional[str] = None,
    kuzu_manager=None,
):
    """
    背景執行 Excel 匯入 — 分批呼叫 LLM + 逐批更新進度
    
    策略:
    - 用 Semaphore 控制最大併發數
    - 每批完成後更新 _import_tasks 進度
    - 每批完成後寫入 checkpoint
    - 批次間加入延遲防止 rate limit
    """
    task = _import_tasks[task_id]
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    
    try:
        total_rows = len(row_texts)
        
        # ---- 自適應批次大小 ----
        batch_size = _compute_adaptive_batch_size(row_texts)
        
        # ---- 大量模式判定 ----
        fast_mode = total_rows > FAST_MODE_THRESHOLD
        mode_label = "⚡ Fast" if fast_mode else "📝 Full"
        
        # ---- 文字截斷 (送 LLM 的版本) ----
        truncated_texts = [_truncate_text(t, MAX_TEXT_LEN) for t in row_texts]
        
        # ---- 分批 ----
        batches: List[List[int]] = []
        for i in range(0, total_rows, batch_size):
            batches.append(list(range(i, min(i + batch_size, total_rows))))
        
        total_batches = len(batches)
        logger.info(
            f"📦 任務 {task_id[:8]}... {mode_label} 模式: {total_rows} 行 → "
            f"{total_batches} 批 (batch_size={batch_size}, concurrency={MAX_CONCURRENCY})"
        )
        
        # ---- 更新 task 中的策略資訊 ----
        task["batch_size"] = batch_size
        task["total_batches"] = total_batches
        task["completed_batches"] = 0
        task["fast_mode"] = fast_mode
        task["eta_seconds"] = None
        task["rows_per_sec"] = 0
        
        # ---- 載入 checkpoint (斷點續傳) ----
        completed_batches = _load_checkpoint(task_id)
        if completed_batches:
            logger.info(f"🔄 從 checkpoint 恢復: 已完成 {len(completed_batches)} 批")
        
        # ---- 儲存每批的 LLM 結果 ----
        llm_results: List[Optional[List[Dict]]] = [None] * total_batches
        
        # ---- ETA 追蹤 ----
        batch_times: List[float] = []
        task_start_time = time.monotonic()
        
        # ---- 定義批次處理函式 ----
        async def process_batch(batch_idx: int, indices: List[int]):
            async with semaphore:
                # 跳過已完成的批次 (斷點續傳)
                if batch_idx in completed_batches:
                    logger.info(f"⏭️ 批次 {batch_idx + 1}/{total_batches} 已完成，跳過")
                    return
                
                # 批次間延遲 (rate limit 保護)
                if batch_idx > 0:
                    await asyncio.sleep(BATCH_DELAY)
                
                texts = [truncated_texts[i] for i in indices]
                
                batch_start = time.monotonic()
                result = await call_llm_batch_with_retry(
                    texts, existing_names, fast_mode=fast_mode
                )
                batch_elapsed = time.monotonic() - batch_start
                batch_times.append(batch_elapsed)
                
                llm_results[batch_idx] = result
                
                # 更新進度
                completed_batches.add(batch_idx)
                completed_count = sum(
                    len(batches[bi]) for bi in completed_batches
                )
                task["completed"] = completed_count
                task["progress_pct"] = round(
                    completed_count / task["total"] * 100, 1
                )
                task["completed_batches"] = len(completed_batches)
                
                # ETA 計算
                if batch_times:
                    avg_batch_time = sum(batch_times) / len(batch_times)
                    remaining_batches = total_batches - len(completed_batches)
                    # 考慮併發: 每輪跑 MAX_CONCURRENCY 個批次
                    remaining_rounds = max(1, remaining_batches / MAX_CONCURRENCY)
                    eta = avg_batch_time * remaining_rounds
                    task["eta_seconds"] = round(eta, 1)
                    
                    elapsed = time.monotonic() - task_start_time
                    task["rows_per_sec"] = round(
                        completed_count / max(elapsed, 0.1), 1
                    )
                
                # 儲存 checkpoint
                _save_checkpoint(task_id, completed_batches, [])
                
                logger.info(
                    f"✅ 批次 {batch_idx + 1}/{total_batches} 完成 "
                    f"({batch_elapsed:.1f}s, 進度: {task['progress_pct']}%, "
                    f"ETA: {task.get('eta_seconds', '?')}s)"
                )
        
        # ---- 並行執行批次 (Semaphore 限制併發) ----
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
                    "raw_data": {
                        k: (None if pd.isna(v) else v)
                        for k, v in df.iloc[global_i].to_dict().items()
                    },
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
        
        # ---- 計算失敗數 ----
        failed_count = sum(
            1 for n in nodes if n.get("label") == _DEFAULT_NODE["label"]
        )
        
        # ---- 階段: 寫入 KuzuDB ----
        kuzu_saved = 0
        if kuzu_manager and graph_id:
            logger.info(f"📝 開始寫入 KuzuDB (graph_id={graph_id}, {len(nodes)} 個節點)...")
            for node in nodes:
                try:
                    props = {
                        "description": node.get("description", ""),
                        "keywords": json.dumps(node.get("keywords", []), ensure_ascii=False),
                        "raw_data": json.dumps(node.get("raw_data", {}), ensure_ascii=False, default=str),
                        "source": "excel_import",
                        "import_task_id": task_id,
                    }
                    success = kuzu_manager.add_entity(
                        entity_id=node["id"],
                        name=node.get("label", node.get("name", "未命名")),
                        entity_type=node.get("type", "未分類"),
                        properties=props,
                        graph_id=graph_id,
                    )
                    if success:
                        kuzu_saved += 1
                except Exception as e:
                    logger.warning(f"⚠️ KuzuDB 節點寫入失敗 ({node.get('id')}): {e}")
            logger.info(f"✅ KuzuDB 寫入完成: {kuzu_saved}/{len(nodes)} 個節點")
            
            # 寫入節點間的 suggested_links 為 Relation
            links_created = 0
            for node in nodes:
                for link in node.get("links", []):
                    try:
                        target_id = link.get("target_id")
                        if target_id:
                            kuzu_manager.add_relation(
                                from_id=node["id"],
                                to_id=target_id,
                                relation_type=link.get("relation", "complement"),
                                properties={"reason": link.get("reason", "")}
                            )
                            links_created += 1
                    except Exception:
                        pass
            if links_created:
                logger.info(f"🔗 已建立 {links_created} 條連線")
        
        # ---- 階段: 合併上傳 RAGFlow ----
        ragflow_uploaded = 0
        if ragflow_dataset_id:
            try:
                from backend.rag_client import RAGFlowClient
                from backend.core.config import get_current_api_keys, settings
                import tempfile
                import httpx
                
                api_keys = get_current_api_keys()
                if api_keys.get('RAGFLOW_API_KEY'):
                    rag_client = RAGFlowClient(
                        api_key=api_keys['RAGFLOW_API_KEY'],
                        base_url=api_keys['RAGFLOW_API_URL']
                    )
                    ragflow_api_url = api_keys.get('RAGFLOW_API_URL', 'http://localhost:9380/api/v1')
                    
                    logger.info(f"📚 合併 {len(nodes)} 個節點為單一文件上傳 RAGFlow...")
                    task["ragflow_stage"] = "uploading"
                    
                    # ---- 按類型分組，每組合併為一個 Markdown 文件 ----
                    from collections import defaultdict
                    type_groups = defaultdict(list)
                    for ri, (row_text, node) in enumerate(zip(row_texts, nodes)):
                        node_type = node.get("type", "未分類")
                        type_groups[node_type].append((ri, row_text, node))
                    
                    temp_dir = Path(tempfile.gettempdir()) / f"ragflow_merged_{task_id[:8]}"
                    temp_dir.mkdir(exist_ok=True)
                    uploaded_doc_ids = []
                    
                    try:
                        for type_name, group_items in type_groups.items():
                            # 構建合併 Markdown 內容
                            sections = []
                            for ri, row_text, node in group_items:
                                label = node.get("label", f"row_{ri}")
                                desc = node.get("description", "")
                                keywords = ", ".join(node.get("keywords", []))
                                section = f"## {label}\n\n"
                                if desc:
                                    section += f"{desc}\n\n"
                                if keywords:
                                    section += f"**關鍵詞**: {keywords}\n\n"
                                section += f"**原始資料**: {row_text}\n\n---\n"
                                sections.append(section)
                            
                            # 檔名使用原始 Excel 名 + 類型
                            original_name = task.get("filename", "import").rsplit(".", 1)[0]
                            safe_type = type_name.replace("/", "_").replace("\\", "_")[:20]
                            merged_filename = f"{original_name}_{safe_type}_{len(group_items)}筆.md"
                            
                            merged_content = f"# {original_name} — {type_name}\n\n"
                            merged_content += f"> 共 {len(group_items)} 筆資料，來源: Excel 批次匯入\n\n"
                            merged_content += "\n".join(sections)
                            
                            tmp_file = temp_dir / merged_filename
                            tmp_file.write_text(merged_content, encoding='utf-8')
                            
                            try:
                                upload_result = await rag_client.async_upload_file(
                                    dataset_id=ragflow_dataset_id,
                                    file_path=str(tmp_file)
                                )
                                ragflow_uploaded += len(group_items)
                                
                                # 提取 document_id
                                docs = upload_result.get('data', [])
                                if isinstance(docs, list):
                                    for doc in docs:
                                        if isinstance(doc, dict) and doc.get('id'):
                                            uploaded_doc_ids.append(doc['id'])
                                elif isinstance(docs, dict) and docs.get('id'):
                                    uploaded_doc_ids.append(docs['id'])
                                
                                logger.info(
                                    f"📄 已上傳: {merged_filename} "
                                    f"({len(group_items)} 筆, {len(merged_content)} 字)"
                                )
                            except Exception as e:
                                logger.warning(f"⚠️ RAGFlow 合併文件上傳失敗 ({type_name}): {e}")
                        
                        # 觸發所有已上傳文件的解析
                        if uploaded_doc_ids:
                            try:
                                async with httpx.AsyncClient(timeout=300) as parse_client:
                                    await parse_client.post(
                                        f"{ragflow_api_url}/datasets/{ragflow_dataset_id}/chunks",
                                        headers={
                                            "Authorization": f"Bearer {api_keys['RAGFLOW_API_KEY']}",
                                            "Content-Type": "application/json"
                                        },
                                        json={"document_ids": uploaded_doc_ids}
                                    )
                                logger.info(
                                    f"🔄 已觸發 {len(uploaded_doc_ids)} 個合併文件的解析 "
                                    f"(原 {len(nodes)} 行 → {len(uploaded_doc_ids)} 個文件)"
                                )
                            except Exception as parse_err:
                                logger.warning(f"⚠️ 觸發解析失敗: {parse_err}")
                        
                        logger.info(
                            f"✅ RAGFlow 合併上傳完成: {len(nodes)} 行 → "
                            f"{len(uploaded_doc_ids)} 個文件 (按類型分組)"
                        )
                    finally:
                        # 清理臨時目錄
                        import shutil
                        shutil.rmtree(temp_dir, ignore_errors=True)
                else:
                    logger.warning("⚠️ RAGFlow API Key 未配置，跳過 RAGFlow 上傳")
            except Exception as e:
                logger.error(f"❌ RAGFlow 逐行上傳失敗: {e}")
        
        # ---- 更新任務狀態為完成 ----
        total_elapsed = time.monotonic() - task_start_time
        task.update({
            "status": "done",
            "completed": len(row_texts),
            "failed": failed_count,
            "progress_pct": 100.0,
            "nodes": nodes,
            "kuzu_saved": kuzu_saved,
            "ragflow_uploaded": ragflow_uploaded,
            "finished_at": datetime.now().isoformat(),
            "eta_seconds": 0,
            "elapsed_seconds": round(total_elapsed, 1),
            "rows_per_sec": round(len(row_texts) / max(total_elapsed, 0.1), 1),
        })
        
        # 清理 checkpoint
        _cleanup_checkpoint(task_id)
        
        logger.info(
            f"🎉 任務 {task_id[:8]}... 完成: "
            f"{len(nodes)} 個節點, {kuzu_saved} 寫入 KuzuDB, "
            f"{ragflow_uploaded} 上傳 RAGFlow, {failed_count} 個失敗"
        )
        
    except Exception as e:
        logger.error(f"❌ 任務 {task_id[:8]}... 失敗: {e}", exc_info=True)
        task.update({
            "status": "error",
            "error": str(e),
            "finished_at": datetime.now().isoformat(),
        })


# ===== API 端點 =====
@router.post("/import/excel")
async def import_excel(
    request: Request,
    file: UploadFile = File(...),
    graph_id: str = Form(None),
    ragflow_dataset_id: str = Form(None),
):
    """
    導入 Excel/CSV 檔案並使用 LLM 智能解析（v5.0 完整整合版）
    
    功能:
    - 立即回傳 task_id，不再同步等待所有批次完成
    - 用 GET /import/status/{task_id} 查詢進度
    - 支援 3000+ 筆資料穩定處理
    - 自動寫入 KuzuDB 圖譜節點
    - 逐行上傳 RAGFlow 知識庫 (可選)
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
        
        logger.info(
            f"成功讀取檔案: {file.filename}, "
            f"行數: {len(df)}, 欄位: {list(df.columns)}, "
            f"graph_id={graph_id}, ragflow_dataset_id={ragflow_dataset_id}"
        )
        
        if df.empty:
            raise HTTPException(status_code=400, detail="檔案內容為空")
        
        # ---- 取得 KuzuDB Manager ----
        kuzu_manager = None
        if graph_id and hasattr(request.app.state, 'kuzu_manager'):
            kuzu_manager = request.app.state.kuzu_manager
        
        # ---- 準備每行的文字描述 ----
        row_texts: List[str] = []
        row_names: List[str] = []
        first_col = str(df.columns[0])
        
        for row_idx, (idx, row) in enumerate(df.iterrows()):
            raw = " | ".join(
                f"{col}: {row[col]}" for col in df.columns if pd.notna(row[col])
            )
            row_texts.append(raw)
            name = (
                str(row[first_col])
                if first_col in row and pd.notna(row[first_col])
                else f"節點 {row_idx + 1}"
            )
            row_names.append(name)
        
        # ---- 計算預估批次大小 (先算再啟動背景) ----
        est_batch_size = _compute_adaptive_batch_size(row_texts)
        est_batches = (len(row_texts) + est_batch_size - 1) // est_batch_size
        fast_mode = len(row_texts) > FAST_MODE_THRESHOLD

        # ---- 建立背景任務 ----
        task_id = str(uuid.uuid4())
        _import_tasks[task_id] = {
            "status": "running",
            "total": len(row_texts),
            "completed": 0,
            "failed": 0,
            "progress_pct": 0.0,
            "started_at": datetime.now().isoformat(),
            "finished_at": None,
            "filename": file.filename,
            "graph_id": graph_id,
            "nodes": None,
            "error": None,
            # v5.0 新欄位
            "batch_size": est_batch_size,
            "total_batches": est_batches,
            "completed_batches": 0,
            "fast_mode": fast_mode,
            "eta_seconds": None,
            "rows_per_sec": 0,
            "elapsed_seconds": None,
        }
        
        # 啟動背景任務 (含 KuzuDB + RAGFlow 整合)
        asyncio.create_task(_run_import(
            task_id, row_texts, row_names, df,
            graph_id=graph_id,
            ragflow_dataset_id=ragflow_dataset_id,
            kuzu_manager=kuzu_manager,
        ))
        
        mode_desc = "⚡快速模式" if fast_mode else "📝完整模式"
        logger.info(
            f"📤 匯入任務已啟動: task_id={task_id[:8]}..., "
            f"total={len(row_texts)}, batch_size={est_batch_size}, "
            f"batches={est_batches}, mode={mode_desc}"
        )
        
        return {
            "task_id": task_id,
            "total": len(row_texts),
            "graph_id": graph_id,
            "batch_size": est_batch_size,
            "total_batches": est_batches,
            "fast_mode": fast_mode,
            "message": f"匯入任務已啟動 ({mode_desc})，共 {len(row_texts)} 筆 → {est_batches} 批",
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="檔案內容為空或格式錯誤")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"導入失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"導入失敗: {str(e)}")


@router.get("/import/status/{task_id}")
async def get_import_status(task_id: str):
    """
    查詢匯入任務即時狀態
    
    回傳:
    - status: running | done | error
    - total: 總資料筆數
    - completed: 已完成筆數
    - failed: 失敗筆數
    - progress_pct: 完成百分比 (0-100)
    - eta_seconds: 預估剩餘秒數
    - rows_per_sec: 處理吞吐量
    - batch_size: 每批大小
    - total_batches / completed_batches: 批次進度
    - fast_mode: 是否使用精簡模式
    - nodes: 完整節點結果 (僅在 status=done 時回傳)
    - error: 錯誤訊息 (僅在 status=error 時回傳)
    """
    # 每次查詢時順便清理過期任務
    _cleanup_expired_tasks()
    
    task = _import_tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任務不存在或已過期")
    
    # 構建回應（running 時不回傳完整 nodes 以節省頻寬）
    response = {
        "task_id": task_id,
        "status": task["status"],
        "total": task["total"],
        "completed": task["completed"],
        "failed": task["failed"],
        "progress_pct": task["progress_pct"],
        "filename": task.get("filename", ""),
        "graph_id": task.get("graph_id", ""),
        "kuzu_saved": task.get("kuzu_saved", 0),
        "ragflow_uploaded": task.get("ragflow_uploaded", 0),
        "started_at": task.get("started_at"),
        "finished_at": task.get("finished_at"),
        # v5.0 新欄位
        "eta_seconds": task.get("eta_seconds"),
        "rows_per_sec": task.get("rows_per_sec", 0),
        "batch_size": task.get("batch_size", 0),
        "total_batches": task.get("total_batches", 0),
        "completed_batches": task.get("completed_batches", 0),
        "fast_mode": task.get("fast_mode", False),
        "elapsed_seconds": task.get("elapsed_seconds"),
    }
    
    if task["status"] == "done" and task.get("nodes"):
        response["nodes"] = task["nodes"]
    
    if task["status"] == "error":
        response["error"] = task.get("error", "未知錯誤")
    
    return response


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


@router.get("/import/tasks")
async def list_import_tasks():
    """
    列出所有匯入任務（用於管理/除錯）
    """
    tasks_summary = []
    for tid, task in _import_tasks.items():
        tasks_summary.append({
            "task_id": tid,
            "status": task["status"],
            "total": task["total"],
            "completed": task["completed"],
            "progress_pct": task["progress_pct"],
            "filename": task.get("filename", ""),
            "started_at": task.get("started_at"),
            "finished_at": task.get("finished_at"),
        })
    
    return {
        "tasks": tasks_summary,
        "count": len(tasks_summary),
    }
