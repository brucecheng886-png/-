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


# ===== LLM Prompt 配置 (v2.0 - 增強版) =====
def build_node_analysis_prompt(
    raw_content: str, 
    existing_nodes: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    建構節點分析的 LLM Prompt（增強版）
    
    ✨ v2.0 新增功能：
    - 領域特化：IDP 數據處理與連貫性分析
    - 質量控制：嚴格的 JSON 格式驗證
    - 多語言支持：中英文混合處理優化
    - 上下文記憶：參考現有節點避免重複
    - 增強關係類型：6 種智能連線模式
    """
    # 構建現有節點上下文（含類型統計）
    existing_nodes_summary = ""
    node_types_count = {}
    
    if existing_nodes:
        # 統計節點類型分佈
        for node in existing_nodes:
            node_type = node.get('type', 'unknown')
            node_types_count[node_type] = node_types_count.get(node_type, 0) + 1
        
        # 生成節點列表（限制 25 個最相關的節點）
        node_list = "\n".join([
            f"- [{node.get('id', 'unknown')}] {node.get('name', 'unknown')} "
            f"({node.get('type', 'unknown')}) - {node.get('description', '')[:50]}..."
            for node in existing_nodes[:25]
        ])
        
        # 類型統計摘要
        type_summary = ", ".join([f"{t}: {c}個" for t, c in node_types_count.items()])
        
        existing_nodes_summary = f"""
### 📊 現有知識圖譜概覽
**節點總數**: {len(existing_nodes)} 個
**類型分佈**: {type_summary}

**節點列表**:
{node_list}

⚠️ **重要**: 避免創建與現有節點高度相似的內容，優先建立連線關係。
"""
    
    prompt = f"""你是 IDP Co., Ltd. 的企業級知識圖譜架構師，專精於：
- 📋 **數據處理流程分析**：身份驗證、文件處理、資料連貫性
- 🔗 **跨系統整合設計**：API 串接、數據同步、流程自動化
- 🧠 **智能知識萃取**：技術文檔、業務流程、最佳實踐

## 🎯 核心任務

### 1️⃣ 標題生成 (label) - 精準命名
**要求**:
- 使用 3-10 個字的專業術語
- 支持中英文混合（如：OAuth 2.0 驗證流程）
- 優先級：技術關鍵詞 > 業務概念 > 通用描述

**範例**:
✅ 好：「JWT Token 刷新機制」、「GDPR 個資保護合規」
❌ 差：「關於系統的說明」、「文件內容」

### 2️⃣ 深度描述 (description) - 結構化闡述
**字數**: 200-250 字（更詳細的上下文）
**必須包含**:
```
【背景】此知識的來源場景、觸發條件或前置需求
【核心內容】關鍵技術點、流程步驟或業務邏輯（使用條列式）
【實際應用】可解決的問題、適用場景、預期效益
【注意事項】潛在風險、限制條件或最佳實踐建議
```

**品質標準**:
- 避免籠統描述，提供具體的技術細節或業務場景
- 使用專業術語但保持可讀性
- 標註關鍵數據、版本號、時間點等精確信息

### 3️⃣ 知識類型 (type) - 精確分類
**標準類型** (優先使用):
- `技術架構` - 系統設計、框架選型、技術棧
- `API介面` - 端點定義、參數規範、響應格式
- `數據流程` - ETL、資料轉換、處理邏輯
- `安全規範` - 驗證機制、加密方式、權限控制
- `業務流程` - 工作流、審批流程、操作指南
- `最佳實踐` - 編碼規範、設計模式、優化方案
- `問題排查` - 錯誤處理、除錯技巧、故障恢復
- `配置文檔` - 環境設定、參數說明、部署指南

**自訂類型** (若不符合上述):
- 使用簡短的專業術語（2-4 字）

### 4️⃣ 智能連線推薦 (links) - 六維關係分析
{existing_nodes_summary}

**關係類型定義** (請根據實際情況選擇):

1. **因果關係** (`causality`)
   - A 是 B 的前提條件、觸發因素或直接原因
   - 範例：「用戶認證」→「授權令牌生成」

2. **依賴關係** (`dependency`)
   - A 的運作需要 B 的支持或 A 調用 B 的功能
   - 範例：「前端登錄頁」→「身份驗證 API」

3. **時序關係** (`sequence`)
   - A 在時間順序上先於 B 執行
   - 範例：「數據採集」→「數據清洗」→「數據分析」

4. **包含關係** (`composition`)
   - A 是 B 的組成部分或子模組
   - 範例：「OAuth 系統」包含「Token 管理」、「Scope 權限」

5. **互補關係** (`complement`)
   - A 與 B 共同完成某個目標，缺一不可
   - 範例：「資料加密」←→「密鑰管理」

6. **對比關係** (`contrast`)
   - A 與 B 是不同的實現方案或存在權衡取捨
   - 範例：「Session 驗證」 vs 「JWT 驗證」

**推薦規則**:
- 每個新節點建議 **2-5 個連線**（最多 5 個）
- 優先連接高相關性節點（相同類型或業務場景）
- 必須提供 **詳細且具體的理由**（50-100 字）
- 避免建立過於泛泛或牽強的關係

## 📥 待分析內容
```text
{raw_content}
```

## 🔒 輸出格式要求（嚴格遵守）

**格式**: 純 JSON，無 Markdown 包裹，無額外註解
**編碼**: UTF-8
**結構**: 必須完全符合以下 Schema

```json
{{
  "label": "6-10字的精準標題",
  "description": "200-250字的結構化描述，包含【背景】【核心內容】【實際應用】【注意事項】四個部分",
  "type": "從標準類型中選擇或自訂（2-4字）",
  "links": [
    {{
      "target_id": "existing_node_123",
      "relation": "causality/dependency/sequence/composition/complement/contrast",
      "reason": "詳細說明為何建立此連線，包含具體的業務場景或技術邏輯（50-100字）"
    }}
  ],
  "metadata": {{
    "confidence": 0.85,
    "keywords": ["關鍵詞1", "關鍵詞2", "關鍵詞3"],
    "language": "zh-TW"
  }}
}}
```

## ⚠️ 品質檢查清單
- [ ] label 是否具備專業性且無歧義？
- [ ] description 是否包含四個必要部分且字數達標？
- [ ] type 是否使用標準類型或合理的自訂類型？
- [ ] links 的 reason 是否具體且有說服力？
- [ ] JSON 格式是否完全正確（無額外字符）？

⚡ **立即開始分析並輸出標準 JSON！**
"""
    return prompt


def parse_llm_response(llm_output: str) -> Dict[str, Any]:
    """
    解析 LLM 回應（增強版）
    
    ✨ 支援格式：
    - 純 JSON
    - Markdown 代碼塊包裹的 JSON
    - 含額外文字的 JSON（自動提取）
    
    ✅ 新增驗證：
    - 必要欄位檢查
    - 類型驗證
    - 數據清洗
    """
    try:
        # 嘗試直接解析 JSON
        data = json.loads(llm_output)
    except json.JSONDecodeError:
        # 嘗試從 markdown 代碼塊中提取 JSON
        import re
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', llm_output, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(1))
        else:
            # 嘗試找到第一個 { 和最後一個 }
            start = llm_output.find('{')
            end = llm_output.rfind('}')
            if start != -1 and end != -1:
                data = json.loads(llm_output[start:end+1])
            else:
                raise ValueError("無法從 LLM 回應中解析 JSON")
    
    # ===== 數據驗證與清洗 =====
    
    # 1. 必要欄位檢查
    required_fields = ['label', 'description', 'type']
    for field in required_fields:
        if field not in data:
            raise ValueError(f"缺少必要欄位: {field}")
    
    # 2. label 驗證（3-20 字）
    if not (3 <= len(data['label']) <= 20):
        logger.warning(f"label 長度不符合規範: {data['label']}")
    
    # 3. description 驗證（50-500 字）
    desc_len = len(data['description'])
    if desc_len < 50:
        logger.warning(f"description 過短 ({desc_len} 字)，建議至少 200 字")
    elif desc_len > 500:
        logger.warning(f"description 過長 ({desc_len} 字)，已截斷")
        data['description'] = data['description'][:500] + "..."
    
    # 4. links 驗證
    if 'links' not in data:
        data['links'] = []
    elif len(data['links']) > 5:
        logger.warning(f"links 數量過多 ({len(data['links'])}), 保留前 5 個")
        data['links'] = data['links'][:5]
    
    # 5. metadata 提取或生成
    if 'metadata' not in data:
        data['metadata'] = {
            'confidence': 0.75,
            'keywords': [],
            'language': 'zh-TW'
        }
    
    return data


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
