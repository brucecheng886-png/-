"""
圖譜導入 API - Excel/CSV 檔案智能解析
整合 LLM 進行自動化標題生成、描述撰寫與關係推薦
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import logging
import json
import os
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()


# ===== LLM Prompt 配置 =====
def build_node_analysis_prompt(
    raw_content: str, 
    existing_nodes: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    建構節點分析的 LLM Prompt
    
    角色設定：BruV Nexus 企業知識架構師
    任務：標題生成、深度描述、自動連線推薦
    """
    existing_nodes_summary = ""
    if existing_nodes:
        node_list = "\n".join([
            f"- {node.get('id', 'unknown')}: {node.get('name', 'unknown')} ({node.get('type', 'unknown')})"
            for node in existing_nodes[:20]  # 限制最多 20 個節點避免 token 過多
        ])
        existing_nodes_summary = f"""
### 現有圖譜節點
{node_list}
"""
    
    prompt = f"""你是 BruV Nexus 企業知識架構師，專精於將資訊轉化為結構化知識圖譜。

## 📋 任務要求

### 1. 標題生成 (label)
- 提取檔案中**最具代表性的核心概念**作為節點標題
- 標題應簡潔有力（3-8 個字）
- 優先使用專業術語或關鍵詞

### 2. 深度描述 (description)
- 撰寫 **150 字左右**的精煉描述
- 必須包含：
  * 內容背景：此知識來源或產生的情境
  * 核心結論：最重要的洞見或發現
  * 應用場景：可用於什麼場合或目的

### 3. 自動連線推薦 (links)
{existing_nodes_summary}

- 分析新節點與現有節點間的關係
- 推薦關係類型：
  * `因果關係`：A 導致 B 或 A 是 B 的前提
  * `互補關係`：A 與 B 相輔相成，共同完成目標
  * `衝突關係`：A 與 B 存在矛盾或取捨
- 每個推薦必須附上**理由** (reason)

## 📝 輸入內容
```
{raw_content}
```

## 🎯 輸出格式（嚴格 JSON）
請以以下格式回傳，**不要包含任何額外文字**：

{{
  "label": "核心概念標題",
  "description": "150字深度描述，包含背景、結論、應用場景",
  "type": "知識類型（如：技術、流程、概念、案例）",
  "links": [
    {{
      "target_id": "existing_node_id",
      "relation": "因果關係/互補關係/衝突關係",
      "reason": "推薦理由說明"
    }}
  ]
}}
"""
    return prompt


def parse_llm_response(llm_output: str) -> Dict[str, Any]:
    """
    解析 LLM 回應
    支援多種格式：純 JSON 或包含 markdown 代碼塊的回應
    """
    try:
        # 嘗試直接解析 JSON
        return json.loads(llm_output)
    except json.JSONDecodeError:
        # 嘗試從 markdown 代碼塊中提取 JSON
        import re
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', llm_output, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        
        # 嘗試找到第一個 { 和最後一個 }
        start = llm_output.find('{')
        end = llm_output.rfind('}')
        if start != -1 and end != -1:
            return json.loads(llm_output[start:end+1])
        
        raise ValueError("無法從 LLM 回應中解析 JSON")


async def call_llm_analysis(prompt: str) -> Dict[str, Any]:
    """
    調用 LLM 進行內容分析
    TODO: 整合實際的 LLM API（OpenAI、Claude、Dify 等）
    """
    # 這裡應該調用實際的 LLM API
    # 目前先返回模擬數據
    logger.warning("⚠️ LLM 功能尚未整合，使用模擬回應")
    
    return {
        "label": "待整合 LLM 分析",
        "description": "此節點正在等待 LLM 服務整合。完成後將自動生成深度描述，包含內容背景、核心結論與應用場景。",
        "type": "未分類",
        "links": []
    }


# ===== API 端點 =====
@router.post("/import/excel")
async def import_excel(file: UploadFile = File(...)):
    """
    導入 Excel/CSV 檔案並使用 LLM 智能解析
    
    支援格式：
    - .xlsx (Excel)
    - .csv (逗號分隔)
    
    回傳格式：
    [
        {
            "id": "node_uuid",
            "name": "節點名稱",
            "label": "AI 生成的標題",
            "description": "AI 生成的描述",
            "type": "節點類型",
            "group": 1,
            "links": [...]
        }
    ]
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
        
        # 讀取檔案內容
        contents = await file.read()
        
        # 解析檔案
        if filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))
        
        logger.info(f"📊 成功讀取檔案: {file.filename}, 行數: {len(df)}")
        
        # 檢查是否為空
        if df.empty:
            raise HTTPException(status_code=400, detail="檔案內容為空")
        
        # TODO: 獲取現有圖譜節點列表（用於 LLM 關聯分析）
        existing_nodes = []  # 從 kuzu_manager 或其他來源獲取
        
        # 處理每一行數據
        nodes = []
        for idx, row in df.iterrows():
            try:
                # 將 index 轉換為 int 避免類型錯誤
                index = int(idx) if isinstance(idx, (int, float)) else 0
                
                # 提取原始內容
                raw_content = " | ".join([
                    f"{col}: {row[col]}" 
                    for col in df.columns 
                    if pd.notna(row[col])
                ])
                
                # 建構 LLM Prompt
                prompt = build_node_analysis_prompt(raw_content, existing_nodes)
                
                # 調用 LLM 分析（目前為模擬）
                llm_result = await call_llm_analysis(prompt)
                
                # 建構節點對象
                first_column = str(df.columns[0])
                node_name = str(row[first_column]) if first_column in row and pd.notna(row[first_column]) else f"節點 {index + 1}"
                
                node = {
                    "id": f"node_{datetime.now().timestamp()}_{index}",
                    "name": node_name,
                    "label": llm_result.get("label", "未命名"),
                    "description": llm_result.get("description", ""),
                    "type": llm_result.get("type", "未分類"),
                    "group": 1,
                    "size": 20,
                    "links": llm_result.get("links", []),
                    "raw_data": row.to_dict()  # 保留原始數據
                }
                
                nodes.append(node)
                logger.info(f"✅ 節點 {index + 1} 處理完成: {node['label']}")
                
            except Exception as e:
                # 使用 idx 直接進行錯誤處理
                error_index = int(idx) if isinstance(idx, (int, float)) else 0
                logger.error(f"❌ 處理第 {error_index + 1} 行時出錯: {e}")
                # 創建最小化節點
                nodes.append({
                    "id": f"node_error_{error_index}",
                    "name": f"錯誤節點 {error_index + 1}",
                    "label": "解析失敗",
                    "description": f"處理時發生錯誤: {str(e)}",
                    "type": "錯誤",
                    "group": 1,
                    "size": 15,
                    "links": []
                })
        
        logger.info(f"🎉 Excel 導入完成，成功處理 {len(nodes)} 個節點")
        return nodes
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="檔案內容為空或格式錯誤")
    except Exception as e:
        logger.error(f"❌ 導入失敗: {e}", exc_info=True)
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
