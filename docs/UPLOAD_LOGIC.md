# 📦 上傳邏輯技能包 — Upload Logic Skill Pack

> **版本**: v1.0 | **最後更新**: 2026-02-16  
> **用途**: 本文件為「上傳邏輯」的完整技術參考。  
> **指令**: 當對話中提到「上傳邏輯」時，自動調取本文件作為上下文。  
> **維護**: 任何修改上傳相關程式碼時，必須同步更新本文件。

---

## 目錄

1. [架構總覽](#1-架構總覽)
2. [前端 — ImportPage.vue](#2-前端--importpagevue)
3. [後端 — 非 Excel 上傳 (system.py)](#3-後端--非-excel-上傳-systempy)
4. [後端 — Excel 批次匯入 (graph_import.py)](#4-後端--excel-批次匯入-graph_importpy)
5. [RAGFlow 整合 (rag_client.py + ragflow.py)](#5-ragflow-整合-rag_clientpy--ragflowpy)
6. [Watcher 檔案監控 (watcher.py)](#6-watcher-檔案監控-watcherpy)
7. [TaskQueue 任務佇列 (task_queue.py)](#7-taskqueue-任務佇列-task_queuepy)
8. [API 端點總覽](#8-api-端點總覽)
9. [錯誤處理與診斷](#9-錯誤處理與診斷)
10. [已知問題與錯誤分析](#10-已知問題與錯誤分析)
11. [資料流圖](#11-資料流圖)
12. [可調參數速查表](#12-可調參數速查表)
13. [變更記錄](#13-變更記錄)

---

## 1. 架構總覽

BruV_Project 的上傳管線依檔案類型分為兩條路徑：

| 檔案類型 | 路徑 | 處理特點 |
|---------|------|---------|
| **Excel/CSV** (.xlsx/.csv) | `ImportPage → /api/graph/import/excel → graph_import.py` | 背景任務 + LLM 批次分析 + KuzuDB + RAGFlow 合併上傳 |
| **其他** (PDF/DOCX/TXT/MD) | `ImportPage → /api/system/upload → system.py → watcher.py` | 即時處理 + RAGFlow 上傳 + Watcher Saga 流程 |

兩條路徑最終都會：
1. 將節點寫入 **KuzuDB** (圖譜資料庫)
2. 將文件上傳到 **RAGFlow** (知識庫 / RAG 引擎)
3. 前端透過 `fetchGraphData()` 自動呈現新節點

---

## 2. 前端 — ImportPage.vue

**檔案**: `frontend/src/views/ImportPage.vue` (~1337 行)

### 2.1 檔案選取

| 功能 | 位置 | 說明 |
|------|------|------|
| 拖放區域 | L83-93 | `@drop.prevent="handleDrop"` / `@dragover.prevent` |
| 點擊上傳 | L86 | `@click="triggerFileInput"` 觸發隱藏 input |
| 檔案 input | L120-126 | `accept=".pdf,.txt,.md,.docx,.xlsx"`, 支援 `multiple` |
| `handleFileSelect(e)` | L672-675 | 從 `event.target.files` 取檔 |
| `handleDrop(e)` | L677-680 | 從 `event.dataTransfer.files` 取檔 |
| `addFiles(newFiles)` | L682-689 | 過濾重複檔名，推入 `files` ref |

### 2.2 上傳配置

| 配置項 | 位置 | 說明 |
|--------|------|------|
| 目標圖譜選擇 | L200-237 | 下拉選單，從 `graphStore.graphMetadataList` 載入 |
| 建立新圖譜 | L245-251 | `handleCreateGraph()` → `graphStore.createGraph()` |
| AI 智能連線 | L265-281 | `enableAILink` toggle，預設 `true` |
| RAGFlow 知識庫 | L287-313 | 僅 AI 啟用時顯示，從 `graphStore.ragflowDatasets` 載入 |

### 2.3 上傳函式 `uploadFiles()`

**位置**: L838-997

**分流邏輯**:
```
uploadFiles()
  ├── isExcelFile(file) === true
  │     → handleExcelBatchImport(file)
  │     → POST /api/graph/import/excel (FormData: file, graph_id, ragflow_dataset_id)
  │     → pollBatchProgress() 每 3s 輪詢進度
  │
  └── isExcelFile(file) === false
        → POST /api/system/upload (FormData: file, graph_mode, graph_id,
        │   graph_name, enable_ai_link, ragflow_dataset_id)
        └── pollRAGFlowProgress() 每 3s 輪詢 RAGFlow 解析狀態
```

### 2.4 進度追蹤

| 函式 | 位置 | 機制 |
|------|------|------|
| `pollBatchProgress(idx, taskId)` | L777-836 | 輪詢 `/api/graph/import/status/{taskId}`，最多 2400 次 (3s/次 = 2h)，顯示 ETA、rows/sec |
| `pollRAGFlowProgress(idx, dsId, docId)` | L1115-1175 | 輪詢 `/api/ragflow/documents/{dsId}/status/{docId}`，最多 120 次 (3s/次 = 6min) |
| `simulateLocalProcessing(idx)` | L1183-1198 | 非 RAGFlow 模式的模擬進度條 |

### 2.5 三階段進度指示器

位置: L373-402，每個上傳結果顯示：

1. ☑ 文件上傳與接收 (`stage1Done`)
2. ☑ RAGFlow 語義分析 (`stage2Done`)
3. ☑ 圖譜節點創建與連線 (`stage3Done`)

---

## 3. 後端 — 非 Excel 上傳 (system.py)

**檔案**: `backend/api/system.py`  
**端點**: `POST /api/system/upload`  
**函式**: `upload_file()` (L418-606)

### 3.1 請求參數

```python
async def upload_file(
    file: UploadFile = File(...),
    graph_id: str = Form(None),          # 目標圖譜 ID
    graph_mode: str = Form("existing"),   # "existing" | "new"
    graph_name: str = Form(None),         # 新圖譜名稱 (graph_mode=new 時)
    enable_ai_link: str = Form("false"),  # AI 智能連線
    ragflow_dataset_id: str = Form(None)  # RAGFlow 知識庫 ID
)
```

### 3.2 四階段處理流程

| 階段 | 位置 | 說明 |
|------|------|------|
| 1. 預寫 meta.json | L479-494 | 先寫 `.meta.json`（含 graph_id, ai_enabled），確保 Watcher 能讀取 |
| 2. RAGFlow 上傳 | L497-570 | `RAGFlowClient.async_upload_file()` → 設定 `chunk_token_num` → 觸發解析 |
| 3. 回填 meta | L573-593 | 將 RAGFlow doc_ids 回填 meta.json，回寫圖譜元數據 |
| 4. 寫入主檔案 | L596-598 | 寫入 `Auto_Import` 目錄，觸發 WatcherService |

### 3.3 回應格式

```json
{
  "success": true,
  "message": "檔案 test.pdf 已上傳",
  "filename": "test.pdf",
  "saved_path": "Auto_Import/test.pdf",
  "size": 12345,
  "ai_enabled": true,
  "ragflow_processed": true,
  "ragflow_dataset_id": "abc123",
  "ragflow_doc_ids": ["doc_001"]
}
```

### 3.4 錯誤處理

- 檔案大小限制 (L446-451): `settings.MAX_UPLOAD_SIZE` → HTTP 413
- 路徑遍歷防護 (L462-465): `re.sub(r'[\\/:*?"<>|]', '_', ...)`
- RAGFlow 失敗不阻塞 (L567-568): 只記 warning，繼續處理

---

## 4. 後端 — Excel 批次匯入 (graph_import.py)

**檔案**: `backend/api/graph_import.py` (~1314 行)  
**端點**: `POST /api/graph/import/excel`  
**函式**: `import_excel()` (L1123-1221)

### 4.1 請求參數

```python
async def import_excel(
    request: Request,
    file: UploadFile = File(...),
    graph_id: str = Form(None),
    ragflow_dataset_id: str = Form(None),
)
```

### 4.2 同步階段 (立即回應 task_id)

1. L1147-1163 — 驗證 `.xlsx`/`.csv` 格式，Pandas 讀取
2. L1175-1193 — 每行轉文字 `"col: val | col: val"`
3. L1200-1221 — 建立 `_import_tasks[task_id]` → `asyncio.create_task(_run_import(...))`
4. 回傳 `{"task_id": "xxx", "total_rows": 65}`

### 4.3 背景任務 `_run_import()` (L584-1035)

**三層最佳化策略**:

| 策略 | 位置 | 說明 |
|------|------|------|
| 1. 欄位智能提取 | L604-613 | `_try_extract_from_columns(df)` — 欄位名匹配別名直接提取，免 LLM |
| 2. LLM 結果快取 | L674-703 | MD5 hash 去重，用 `_llm_result_cache` 跨批次快取 |
| 3. 自適應批次 | L626-639 | 根據平均 token 數動態算 batch_size (5~50) |

**欄位別名映射** (`_COLUMN_ALIASES`, L113-120):

```python
{
    'label':       {'標題', '名稱', 'title', 'name', '主題', 'subject', '項目', '名字', '姓名'},
    'type':        {'類型', 'type', '分類', 'category', '類別', 'class', '種類'},
    'description': {'描述', 'description', '內容', 'content', '說明', '摘要', 'summary', '備註', 'note'},
    'keywords':    {'關鍵詞', 'keywords', '關鍵字'},
    'tags':        {'標籤', 'tags', '標記', 'tag', '分類標籤'},
}
```

### 4.4 LLM 呼叫

**函式**: `call_llm_batch_with_retry()` (L502-542)

- API: `POST {DIFY_API_URL}/chat-messages` (blocking mode)
- 並發: `asyncio.Semaphore(2)` (本地 Ollama GPU 限制)
- 重試: 指數退避 3 次 (delay = 3s × 2^attempt + random)
- 超時: 300 秒

**AI 提示詞 — NODE_SCHEMA** (L211-238):

```json
{
  "label": "3-10字精準標題",
  "description": "100-200字描述，含背景、核心內容、應用場景",
  "type": "技術架構|API介面|數據流程|...|自訂(2-4字)",
  "keywords": ["關鍵詞1", "關鍵詞2", "關鍵詞3"],
  "tags": ["分類標籤1", "分類標籤2", "分類標籤3"],
  "suggested_links": [
    {"target_index": 0, "relation": "dependency|...", "reason": "連線原因(30字內)"}
  ]
}
```

> tags 規則：3-5 個分類標籤，用於快速篩選與歸類。標籤應簡短(2-6字)、具體、可複用。

**Fast mode** (>100 筆啟用，NODE_SCHEMA_FAST, L268-280):  
省略 `suggested_links`，tags 減至 2-3 個，description 精簡為 30-80 字。

### 4.5 節點驗證 `_validate_node()` (L335-380)

- `label` 別名: `title`, `name`, `標題`, `名稱`
- `description` 截斷: ≤500 字
- `suggested_links` / `links` 統一為 `suggested_links`，上限 5 個
- `tags` 處理: 支援字串(逗號分隔)→陣列轉換，上限 5 個，別名 `tag`/`標籤`

### 4.6 節點組裝 (L798-822)

```python
node = {
    "id": f"node_{ts}_{global_i}",
    "name": row_names[global_i],
    "label": llm.get("label", "未命名"),
    "description": llm.get("description", ""),
    "type": llm.get("type", "未分類"),
    "group": 1, "size": 20,
    "keywords": llm.get("keywords", []),
    "tags": llm.get("tags", []),           # ← AI 自動生成
    "suggested_links": llm.get("suggested_links", []),
    "raw_data": { ... },
}
```

### 4.7 KuzuDB 寫入 (L856-893)

```python
props = {
    "description": ...,
    "keywords": json.dumps([...]),
    "tags": json.dumps([...]),              # ← 以 JSON 字串存入 properties
    "raw_data": json.dumps({...}),
    "source": "excel_import",
    "import_task_id": task_id,
}
kuzu_manager.add_entity(entity_id, name, entity_type, props, graph_id)
```

### 4.8 RAGFlow 合併上傳 (L920-1035)

1. 按 `type` 分組 → 每組合併為 Markdown 文件
2. 超過 200KB 自動分割（`MAX_RAGFLOW_FILE_BYTES`）
3. 檔名格式: `{原名}_{類型}_{筆數}.md`（如 `test_未分類_65筆.md`)
4. 編碼: UTF-8（無 BOM）
5. 上傳後觸發解析: `POST /datasets/{id}/chunks`

### 4.9 進度查詢 `GET /api/graph/import/status/{task_id}` (L1223-1281)

```json
{
  "status": "running",
  "progress_pct": 45.5,
  "processed_rows": 30,
  "total_rows": 65,
  "eta_seconds": 120,
  "rows_per_sec": 0.5,
  "elapsed_seconds": 60,
  "current_batch": 3,
  "total_batches": 7,
  "ragflow_stage": "uploading"
}
```

---

## 5. RAGFlow 整合 (rag_client.py + ragflow.py)

### 5.1 RAGFlowClient (`backend/rag_client.py`, 265 行)

| 方法 | 位置 | 說明 |
|------|------|------|
| `async_upload_file(dataset_id, file_path)` | L38-55 | POST multipart file，回傳 doc info |
| `async_update_document(dataset_id, doc_id, chunk_method, parser_config)` | L92-108 | PUT 更新解析器設定 |
| `async_list_documents(dataset_id)` | L58-63 | GET 列出文件 |
| `async_delete_document(dataset_id, doc_id)` | L65-73 | DELETE 刪除文件 |
| `_check_response(result)` | L27-33 | 檢查 `code != 0` 拋 `RAGFlowAPIError` |
| `_get_mime_type(fp)` | L250-265 | 副檔名→MIME 映射 (.md → text/markdown) |

**⚠️ 已知 bug**: `async_upload_file()` 的 `chunk_method` 和 `parser_config` 參數**從未實際傳送**給 RAGFlow API。上傳只發送 multipart file，解析器設定繼承 dataset 預設值。

### 5.2 RAGFlow API 路由 (`backend/api/ragflow.py`, 286 行)

| 端點 | 位置 | 用途 |
|------|------|------|
| `GET /api/ragflow/datasets` | L93-107 | 列出知識庫列表 |
| `POST /api/ragflow/datasets` | L110-127 | 建立新知識庫 |
| `POST /api/ragflow/documents/upload` | L131-153 | 上傳文件 |
| `POST /api/ragflow/documents/{dataset_id}/parse` | L170-196 | 觸發解析 |
| `GET /api/ragflow/documents/{dataset_id}/status/{document_id}` | L199-242 | 查詢解析狀態 |
| `DELETE /api/ragflow/documents/{dataset_id}` | L250-286 | 批量刪除文檔 |

所有請求受 `CircuitBreaker` 保護，斷路器開啟時回傳 503。

---

## 6. Watcher 檔案監控 (watcher.py)

**檔案**: `backend/services/watcher.py` (~1038 行)

### 6.1 `AIFileEventHandler` Saga 流程

| Step | 說明 | 補償 |
|------|------|------|
| A: RAGFlow 上傳 | 指數退避 3 次，失敗記 DLQ | 無 (stop) |
| B: KuzuDB 寫入 | `add_entity()` 建立節點 | 補償 A：刪除 RAGFlow 文件 |
| C: Excel 解析 | `_parse_excel_and_link()` (可選) | 不補償 |
| D: 節點互連 | `_build_inter_node_links()` (可選) | 不補償 |

### 6.2 冪等性保護

- `.meta.json` 的 `processed` 標記 + 檔案修改時間比對 (L212-228)
- 防止重複處理同一份檔案

### 6.3 Dead Letter Queue

- SQLite 持久化 (L38-127)
- 查閱端點: `GET /api/system/saga-dlq`

---

## 7. TaskQueue 任務佇列 (task_queue.py)

**檔案**: `backend/services/task_queue.py` (527 行)

- `asyncio.Queue` + SQLite 持久化
- 歷史記錄上限 500 筆
- Celery 後端預留但**未實作**

> **注意**: Excel 批次匯入使用 `graph_import.py` 自己的 `_import_tasks` dict + `asyncio.create_task()`，**不經過** TaskQueue。

---

## 8. API 端點總覽

| 呼叫端 | API 端點 | Handler | 用途 |
|--------|----------|---------|------|
| 前端 | `POST /api/system/upload` | `system.upload_file()` | 非 Excel 上傳 |
| 前端 | `POST /api/graph/import/excel` | `graph_import.import_excel()` | Excel 批次匯入 |
| 前端 | `GET /api/graph/import/status/{taskId}` | `graph_import.get_import_status()` | 進度查詢 |
| 前端 | `GET /api/ragflow/documents/{dsId}/status/{docId}` | `ragflow.get_document_status()` | RAGFlow 解析狀態 |
| 前端 | `GET /api/ragflow/datasets` | `ragflow.list_datasets()` | 知識庫列表 |
| 前端 | `GET /api/graph/data?graph_id={id}` | `app_anytype.get_graph_data()` | 載入圖譜 (含 tags) |

---

## 9. 錯誤處理與診斷

### 9.1 錯誤模式清單

| 失敗點 | 位置 | 處理方式 |
|--------|------|---------|
| RAGFlow 連線失敗 | system.py L567 | ⚠️ 警告但繼續處理 |
| RAGFlow API Key 未配 | graph_import.py L437 | 填入預設節點 `_NO_KEY_NODE` |
| LLM 超時 (300s) | graph_import.py L36 | 指數退避 3 次，失填 `_DEFAULT_NODE` |
| LLM 回傳非 JSON | graph_import.py L275-304 | `_extract_json()` 嘗試 Markdown / 正則提取 |
| KuzuDB 寫入失敗 (Watcher) | watcher.py L296-326 | **Saga 補償**: 刪除 RAGFlow 文件 |
| KuzuDB 單節點失敗 | graph_import.py L871 | warning 跳過，繼續其餘 |
| 檔案大小超限 | system.py L448 | HTTP 413 |
| 輪詢超時 | ImportPage.vue L1177 | 前端提示「到 RAGFlow 控制台查看」 |
| Saga 全域異常 | watcher.py L345-357 | 記入 DLQ |
| RAGFlow 解析觸發無回應檢查 | graph_import.py L1012-1025 | ⚠️ 靜默忽略業務錯誤 |

### 9.2 診斷工具

- `scripts/diagnose_upload.py` — 上傳流程自動診斷
- `GET /api/system/saga-dlq` — 查看死信佇列
- RAGFlow Web UI （http://localhost:9380） — 直接查看文件解析狀態

---

## 10. 已知問題與錯誤分析

### 10.1 🔴 RAGFlow 解析「失敗」(2026-02-16 截圖)

**現象**: test.xlsx 匯入 65 個節點成功 (BruV UI 顯示 0 失敗)，但 RAGFlow 中 `test_未分類_65筆.md` 顯示「失敗」。

**根因分析** (按可能性排序):

#### A. Embedding 模型不可用 (最可能)

RAGFlow chunking 完成後需呼叫 embedding 模型產生向量。若：
- Ollama embedding 模型未啟動或 OOM
- RAGFlow 設定的模型名稱與實際不符
- GPU 資源不足

任一情況導致「失敗」。

**診斷**: 打開 RAGFlow Web UI → 系統設定 → 模型管理，確認 embedding 模型狀態為綠色。

#### B. chunk_method / parser_config 未傳送 (bug)

`rag_client.py` 的 `async_upload_file()` 簽名接受 `chunk_method` 和 `parser_config`，但**HTTP 請求中完全未傳送**。文件繼承 dataset 預設的 "General" parser，可能不適合程式產生的 Markdown 格式。

**修復建議**: 上傳後、觸發解析前，呼叫 `async_update_document()` 設定 chunk_method:

```python
# graph_import.py L990 後加入
for doc_id in uploaded_doc_ids:
    await rag_client.async_update_document(
        dataset_id=ragflow_dataset_id,
        document_id=doc_id,
        chunk_method="naive",
        parser_config={"chunk_token_num": 512}
    )
```

#### C. 解析觸發後無回應檢查

`graph_import.py` L1012-1025 觸發解析後，只有 try/except，未檢查回應 body 中的 `code` 欄位。若 RAGFlow 回傳 HTTP 200 但 `code != 0`（業務錯誤），錯誤被靜默忽略。

**修復建議**: 加入回應檢查:

```python
resp = await parse_client.post(...)
result = resp.json()
if result.get('code', 0) != 0:
    logger.error(f"❌ RAGFlow 解析觸發失敗: {result.get('message')}")
```

### 10.2 🟡 瀏覽器 Console 錯誤

**現象**:
```
Uncaught (in promise) Error: A listener indicated an asynchronous response 
dataset?id=579b936c0...: by returning true, but the message channel closed 
before a response was received
```

**根因**: 這是 **Chrome 瀏覽器擴充功能** 的已知問題，**與應用程式碼完全無關**。

常見觸發來源：
- 密碼管理器 (LastPass, Bitwarden)
- 廣告攔截器 (uBlock Origin, AdBlock)
- 其他攔截 HTTP 請求的擴充功能

擴充功能透過 `chrome.runtime.onMessage` 監聽，回傳 `true` 表示異步回應，但在回應前就關閉了 message channel。

**不影響功能，可安全忽略。**

### 10.3 🟡 Excel 匯入與 TaskQueue 不統一

Excel 批次匯入使用自己的 `_import_tasks` dict + `asyncio.create_task()`，不經過 `TaskQueue`。這導致：
- 伺服器重啟後進行中的 Excel 任務丟失
- 無法透過統一的 TaskQueue 介面管理

---

## 11. 資料流圖

```
使用者拖放/選擇檔案 (ImportPage.vue)
        │
        ▼
    isExcelFile(file) ?
     ┌──否──┐        ┌──是──┐
     ▼      │        ▼      │
  POST /api/│    POST /api/  │
  system/   │    graph/      │
  upload    │    import/excel │
     │      │        │       │
     ▼      │        ▼       │
 system.py  │  graph_import.py
upload_file │  import_excel()
     │      │        │
     ├─ 1. meta.json │        ├─ 1. Pandas 讀取
     ├─ 2. RAGFlow   │        ├─ 2. asyncio 背景任務
     │    上傳+解析   │        │   ├─ 欄位智能提取 (免LLM)
     ├─ 3. 回填 meta │        │   ├─ LLM 批次分析 (Dify)
     ├─ 4. 寫入      │        │   │   └─ tags 自動生成
     │   Auto_Import │        │   ├─ KuzuDB 寫入 (含 tags)
     │      │        │        │   └─ RAGFlow 合併上傳
     │      ▼        │        │
     │  watcher.py   │        └─ 前端輪詢 /import/status
     │  Saga 流程:   │
     │  A→RAGFlow    │
     │  B→KuzuDB     │
     │  C→Excel解析  │
     │  D→節點互連   │
     │      │        │
     ▼      ▼        ▼
    前端 fetchGraphData() → 圖譜即時更新
    (tags 自動顯示在 NexusPanel / Inspector / Graph2D / Graph3D)
```

---

## 12. 可調參數速查表

| 參數 | 值 | 位置 | 說明 |
|------|-----|------|------|
| `MAX_CONCURRENCY` | 2 | graph_import.py L35 | LLM 並行請求數 |
| `LLM_TIMEOUT` | 300s | graph_import.py L36 | 單次 LLM 超時 |
| `MAX_RETRIES` | 3 | graph_import.py L37 | 每批最大重試 |
| `RETRY_BASE_DELAY` | 3s | graph_import.py L38 | 重試基礎延遲 |
| `BATCH_DELAY` | 1.0s | graph_import.py L39 | 批次間 GPU 喘息 |
| `MAX_TEXT_LEN` | 500 | graph_import.py L40 | 每筆送 LLM 最大字數 |
| `FAST_MODE_THRESHOLD` | 100 | graph_import.py L41 | Fast mode 啟用門檻 |
| `TARGET_BATCH_TOKENS` | 2000 | graph_import.py L42 | 每批目標 token 數 |
| `TARGET_BATCH_TOKENS_FAST` | 6000 | graph_import.py L43 | Fast mode 批量 token |
| `MAX_RAGFLOW_FILE_BYTES` | 200KB | graph_import.py L52 | 合併文件大小上限 |
| `MAX_UPLOAD_SIZE` | 配置檔 | system.py (settings) | 單檔上傳上限 |
| `_LLM_CACHE_MAX` | 10000 | graph_import.py L189 | LLM 快取上限 |
| `_TASK_EXPIRY_SECONDS` | 7200 | graph_import.py L51 | 完成任務保留時間 |

---

## 13. 變更記錄

| 日期 | 版本 | 變更項目 |
|------|------|---------|
| 2026-02-16 | v1.0 | 初版建立：完整上傳流程、錯誤分析、RAGFlow 整合、AI tags 流程 |
