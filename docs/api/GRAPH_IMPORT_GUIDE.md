# 📥 Excel/CSV 智能導入指南

## 🎯 功能概述

本功能允許用戶上傳 Excel 或 CSV 檔案，系統會使用 LLM（大型語言模型）自動分析內容，生成結構化的知識圖譜節點，包括：

- **智能標題生成**：提取最具代表性的核心概念
- **深度描述撰寫**：包含背景、結論、應用場景的 150 字描述
- **自動關係推薦**：分析與現有節點的因果、互補或衝突關係

## 🔧 API 端點

### 1. 導入 Excel/CSV

```http
POST /api/graph/import/excel
Content-Type: multipart/form-data

file: <Excel 或 CSV 檔案>
```

**支援格式：**
- `.xlsx` (Excel)
- `.csv` (逗號分隔)

**回傳格式：**
```json
[
  {
    "id": "node_1234567890_0",
    "name": "節點名稱",
    "label": "AI 生成的標題",
    "description": "AI 生成的深度描述（150字）",
    "type": "節點類型",
    "group": 1,
    "size": 20,
    "links": [
      {
        "target_id": "existing_node_id",
        "relation": "因果關係",
        "reason": "推薦理由說明"
      }
    ],
    "raw_data": { /* 原始 Excel 數據 */ }
  }
]
```

## 🤖 LLM Prompt 架構

### 角色設定
```
你是 BruV Nexus 企業知識架構師，專精於將資訊轉化為結構化知識圖譜。
```

### 任務要求

#### 1. 標題生成 (label)
- 提取檔案中**最具代表性的核心概念**
- 標題應簡潔有力（3-8 個字）
- 優先使用專業術語或關鍵詞

#### 2. 深度描述 (description)
- 撰寫 **150 字左右**的精煉描述
- 必須包含：
  * **內容背景**：此知識來源或產生的情境
  * **核心結論**：最重要的洞見或發現
  * **應用場景**：可用於什麼場合或目的

#### 3. 自動連線推薦 (links)
- 分析新節點與現有節點間的關係
- 推薦關係類型：
  * **因果關係**：A 導致 B 或 A 是 B 的前提
  * **互補關係**：A 與 B 相輔相成，共同完成目標
  * **衝突關係**：A 與 B 存在矛盾或取捨
- 每個推薦必須附上**理由** (reason)

### 輸出格式
```json
{
  "label": "核心概念標題",
  "description": "150字深度描述，包含背景、結論、應用場景",
  "type": "知識類型（如：技術、流程、概念、案例）",
  "links": [
    {
      "target_id": "existing_node_id",
      "relation": "因果關係/互補關係/衝突關係",
      "reason": "推薦理由說明"
    }
  ]
}
```

## 🔌 LLM 整合指南

### 方式 1：整合 OpenAI API

編輯 `backend/api/graph_import.py` 的 `call_llm_analysis` 函式：

```python
import openai
from backend.core.config import settings

async def call_llm_analysis(prompt: str) -> Dict[str, Any]:
    """調用 OpenAI API 進行內容分析"""
    try:
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是 BruV Nexus 企業知識架構師"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        return parse_llm_response(result)
        
    except Exception as e:
        logger.error(f"OpenAI API 調用失敗: {e}")
        return {
            "label": "解析失敗",
            "description": f"LLM 分析失敗: {str(e)}",
            "type": "錯誤",
            "links": []
        }
```

### 方式 2：整合 Dify API

```python
import httpx

async def call_llm_analysis(prompt: str) -> Dict[str, Any]:
    """調用 Dify API 進行內容分析"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.DIFY_API_URL}/chat-messages",
                headers={
                    "Authorization": f"Bearer {settings.DIFY_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "inputs": {},
                    "query": prompt,
                    "response_mode": "blocking",
                    "user": "graph_import_system"
                }
            )
            
            data = response.json()
            result = data["answer"]
            return parse_llm_response(result)
            
    except Exception as e:
        logger.error(f"Dify API 調用失敗: {e}")
        return {
            "label": "解析失敗",
            "description": f"LLM 分析失敗: {str(e)}",
            "type": "錯誤",
            "links": []
        }
```

### 方式 3：整合本地 LLM (Ollama)

```python
async def call_llm_analysis(prompt: str) -> Dict[str, Any]:
    """調用本地 Ollama 進行內容分析"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "llama2",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30.0
            )
            
            data = response.json()
            result = data["response"]
            return parse_llm_response(result)
            
    except Exception as e:
        logger.error(f"Ollama 調用失敗: {e}")
        return {
            "label": "解析失敗",
            "description": f"LLM 分析失敗: {str(e)}",
            "type": "錯誤",
            "links": []
        }
```

## ⚙️ 環境變數配置

在 `.env` 檔案中添加：

```env
# OpenAI
OPENAI_API_KEY=sk-your-api-key

# Dify
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your-dify-api-key

# Ollama (本地)
OLLAMA_HOST=http://localhost:11434
```

## 📦 安裝依賴

```bash
# 安裝 pandas 和 openpyxl（處理 Excel）
pip install pandas openpyxl

# 安裝 OpenAI SDK（如果使用 OpenAI）
pip install openai

# 安裝 httpx（如果使用其他 API）
pip install httpx
```

依賴已添加到 `requirements.txt`：
```
pandas>=2.0.0
openpyxl>=3.1.0
```

## 🚀 使用流程

1. **前端上傳檔案**  
   用戶在 NexusPage.vue 點擊「導入圖譜」按鈕，選擇 Excel/CSV 檔案

2. **後端接收檔案**  
   FastAPI 接收 multipart/form-data 請求

3. **解析檔案**  
   使用 pandas 讀取 Excel/CSV 內容

4. **LLM 分析**  
   每一行數據調用 LLM 生成標題、描述、關係推薦

5. **返回結果**  
   回傳 JSON 陣列給前端

6. **前端渲染**  
   調用 `graphStore.addBatchNodes()` 將節點添加到圖譜

## 🧪 測試

### 1. 創建測試 Excel 檔案

| 標題 | 內容 | 類型 |
|------|------|------|
| Vue 3 Composition API | 新的組件邏輯組織方式，使用 setup() 函式 | 技術 |
| FastAPI 後端框架 | 基於 Python 的高性能 Web 框架 | 技術 |

### 2. 使用 curl 測試

```bash
curl -X POST http://localhost:8000/api/graph/import/excel \
  -F "file=@test_data.xlsx" \
  -H "Content-Type: multipart/form-data"
```

### 3. 預期回應

```json
[
  {
    "id": "node_1234567890_0",
    "name": "Vue 3 Composition API",
    "label": "Vue 3 組合式 API",
    "description": "Vue 3 引入的組合式 API 是一種新的組件邏輯組織方式...",
    "type": "技術",
    "group": 1,
    "size": 20,
    "links": []
  }
]
```

## 📝 注意事項

1. **LLM 調用成本**  
   每個節點都會調用 LLM，請注意 API 費用

2. **批次處理**  
   建議一次上傳不超過 50 行數據

3. **錯誤處理**  
   LLM 調用失敗時會創建預設節點，不會中斷整個流程

4. **安全性**  
   請限制上傳檔案大小（建議 5MB 以內）

## 🔜 未來改進

- [ ] 支援批次 LLM 調用（減少 API 請求次數）
- [ ] 添加進度條顯示處理進度
- [ ] 支援更多檔案格式（JSON, Markdown）
- [ ] 實現節點去重和合併
- [ ] 添加自定義 Prompt 模板功能
- [ ] 支援多語言內容分析

## 📚 相關文檔

- [FastAPI File Uploads](https://fastapi.tiangolo.com/tutorial/request-files/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
