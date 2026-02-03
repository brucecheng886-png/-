# 系統配置 API 使用指南

## 📋 概述

系統配置 API 允許你通過 HTTP 請求動態管理 `.env` 文件中的 API Keys，無需手動編輯文件。

## 🔌 API 端點

### 1. 獲取當前配置 (GET)

**端點**: `GET /api/system/config`

**說明**: 獲取當前系統配置，API Keys 會被部分遮蔽以保護安全。

**請求示例**:
```bash
curl -X GET http://localhost:8000/api/system/config
```

**響應示例**:
```json
{
  "success": true,
  "message": "配置獲取成功",
  "config": {
    "dify_key": "app-x*****",
    "ragflow_key": "ragfl*****",
    "dify_api_url": "http://localhost:80/v1",
    "ragflow_api_url": "http://localhost:9380/api/v1",
    "env_file": "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/BruV_Project/.env"
  }
}
```

---

### 2. 更新配置 (POST)

**端點**: `POST /api/system/config`

**說明**: 更新 Dify 和/或 RAGFlow 的 API Keys。

**請求格式**:
```json
{
  "dify_key": "app-xxxxxxxxxxxxxxxxxxxxxxxx",
  "ragflow_key": "ragflow-xxxxxxxxxxxxxxxx"
}
```

**請求示例 (cURL)**:
```bash
curl -X POST http://localhost:8000/api/system/config \
  -H "Content-Type: application/json" \
  -d '{
    "dify_key": "app-abc123456789",
    "ragflow_key": "ragflow-xyz987654321"
  }'
```

**請求示例 (PowerShell)**:
```powershell
$body = @{
    dify_key = "app-abc123456789"
    ragflow_key = "ragflow-xyz987654321"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/system/config" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**請求示例 (Python)**:
```python
import requests

response = requests.post(
    "http://localhost:8000/api/system/config",
    json={
        "dify_key": "app-abc123456789",
        "ragflow_key": "ragflow-xyz987654321"
    }
)

print(response.json())
```

**響應示例**:
```json
{
  "success": true,
  "message": "配置更新成功。提示: 部分服務可能需要重啟才能完全生效",
  "config": {
    "dify_key": "app-a*****",
    "ragflow_key": "ragfl*****"
  }
}
```

---

### 3. 獲取 .env 文件位置 (GET)

**端點**: `GET /api/system/env-file`

**說明**: 獲取 `.env` 文件的路徑和狀態信息。

**請求示例**:
```bash
curl -X GET http://localhost:8000/api/system/env-file
```

**響應示例**:
```json
{
  "success": true,
  "path": "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/BruV_Project/.env",
  "exists": true,
  "writable": true
}
```

---

## 🎯 使用場景

### 場景 1: 只更新 Dify API Key

```bash
curl -X POST http://localhost:8000/api/system/config \
  -H "Content-Type: application/json" \
  -d '{"dify_key": "app-new-key-123456"}'
```

### 場景 2: 只更新 RAGFlow API Key

```bash
curl -X POST http://localhost:8000/api/system/config \
  -H "Content-Type: application/json" \
  -d '{"ragflow_key": "ragflow-new-key-789"}'
```

### 場景 3: 同時更新兩個 API Keys

```bash
curl -X POST http://localhost:8000/api/system/config \
  -H "Content-Type: application/json" \
  -d '{
    "dify_key": "app-new-key-123456",
    "ragflow_key": "ragflow-new-key-789"
  }'
```

---

## 🔒 安全特性

1. **API Key 遮蔽**: GET 請求返回的 API Keys 只顯示前 5 個字符，其餘用 `*` 遮蔽
2. **日誌記錄**: 所有操作都會記錄到後端日誌中
3. **錯誤處理**: 提供詳細的錯誤訊息

---

## 📝 .env 文件處理邏輯

### 更新現有變數

如果 `.env` 文件已存在 `DIFY_API_KEY` 或 `RAGFLOW_API_KEY`：

**修改前**:
```env
DIFY_API_KEY=app-old-key
RAGFLOW_API_KEY=ragflow-old-key
```

**API 請求**:
```json
{"dify_key": "app-new-key"}
```

**修改後**:
```env
DIFY_API_KEY=app-new-key
RAGFLOW_API_KEY=ragflow-old-key
```

### 添加新變數

如果 `.env` 文件中不存在指定的變數，會自動添加到文件末尾：

**修改前**:
```env
DEBUG=True
LOG_LEVEL=INFO
```

**API 請求**:
```json
{"dify_key": "app-new-key"}
```

**修改後**:
```env
DEBUG=True
LOG_LEVEL=INFO
DIFY_API_KEY=app-new-key
```

### 創建新文件

如果 `.env` 文件不存在，會自動創建並寫入新的配置。

---

## ⚠️ 重要提示

### 1. 即時生效

API 會嘗試將新的環境變數載入到 `os.environ`，但某些服務可能需要重啟才能完全生效：

```bash
# 重啟後端服務
python launcher.py
```

### 2. 文件權限

確保應用程序對 `.env` 文件和所在目錄有寫入權限。

### 3. 註釋和格式

API 會保留 `.env` 文件中的註釋和空行，只修改指定的變數。

---

## 🧪 測試步驟

### 步驟 1: 啟動後端服務

```powershell
cd BruV_Project
python launcher.py
```

### 步驟 2: 檢查當前配置

```bash
curl http://localhost:8000/api/system/config
```

### 步驟 3: 更新 API Keys

```bash
# 從 Dify Web UI 獲取真實的 API Key
curl -X POST http://localhost:8000/api/system/config \
  -H "Content-Type: application/json" \
  -d '{
    "dify_key": "app-從Dify獲取的真實Key"
  }'
```

### 步驟 4: 驗證更新

```bash
# 再次檢查配置
curl http://localhost:8000/api/system/config

# 查看 .env 文件
cat .env
```

### 步驟 5: 測試 Dify API

前往前端頁面 http://localhost:5173，測試 AI 對話功能是否正常工作。

---

## 📚 API 文檔

訪問 Swagger UI 查看完整的 API 文檔：

**URL**: http://localhost:8000/docs

在 Swagger UI 中，你可以：
- 查看所有端點的詳細說明
- 直接在瀏覽器中測試 API
- 查看請求/響應的 JSON Schema

---

## 🐛 故障排查

### 問題 1: "更新 .env 檔案失敗"

**原因**: 文件權限不足或路徑錯誤

**解決方案**:
```bash
# 檢查文件是否可寫
ls -l .env

# 檢查文件位置
curl http://localhost:8000/api/system/env-file
```

### 問題 2: "至少需要提供一個 API Key"

**原因**: POST 請求的 JSON 中沒有提供 `dify_key` 或 `ragflow_key`

**解決方案**:
```bash
# 確保提供至少一個 Key
curl -X POST http://localhost:8000/api/system/config \
  -H "Content-Type: application/json" \
  -d '{"dify_key": "your-key-here"}'
```

### 問題 3: 更新後仍然無法連接 Dify

**原因**: 環境變數未完全生效

**解決方案**:
```bash
# 重啟後端服務
# Ctrl+C 停止 launcher.py
python launcher.py
```

---

## 🎨 前端整合

你可以在前端創建一個設置頁面來使用這些 API：

```javascript
// 獲取當前配置
async function getConfig() {
  const response = await fetch('/api/system/config');
  const data = await response.json();
  console.log(data);
}

// 更新配置
async function updateConfig(difyKey, ragflowKey) {
  const response = await fetch('/api/system/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dify_key: difyKey,
      ragflow_key: ragflowKey
    })
  });
  const data = await response.json();
  console.log(data);
}
```

---

**需要幫助？** 查看後端日誌：`docker compose logs -f` 或檢查 FastAPI 控制台輸出。
