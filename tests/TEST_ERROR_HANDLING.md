# 錯誤處理測試指南

## ✅ 已實現的改進

### 後端 (backend/api/dify.py)

已添加詳細的錯誤分類和處理：

```python
except httpx.ConnectError as e:
    raise HTTPException(
        status_code=503,
        detail=f"無法連接到 Dify API ({settings.DIFY_API_URL})。請確認 Docker 容器已啟動 (docker compose up -d)"
    )
```

### 前端 (frontend/src/views/DifyChat.vue)

已正確提取後端返回的 `detail` 字段：

```javascript
if (!response.ok) {
  let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
  try {
    const errorData = await response.json();
    if (errorData.detail) {
      errorDetail = errorData.detail;  // 使用後端的詳細訊息
    }
  } catch (parseError) {
    console.warn('無法解析錯誤回應:', parseError);
  }
  throw new Error(errorDetail);
}
```

## 🧪 測試步驟

### 測試 1: Docker 未啟動 (503 錯誤)

1. **停止 Dify 服務**
   ```bash
   docker compose down
   ```

2. **啟動後端**
   ```bash
   cd BruV_Project
   python launcher.py
   ```

3. **在前端發送訊息**
   - 打開 http://localhost:5173
   - 輸入任意訊息並發送

4. **預期結果**
   - 看到紅色錯誤氣泡
   - 訊息內容：
     ```
     ❌ 發生錯誤
     
     無法連接到 Dify API (http://localhost:80/v1)。請確認 Docker 容器已啟動 (docker compose up -d)
     
     💡 解決方案：
     1. 啟動 Docker Desktop
     2. 執行: `docker compose up -d`
     3. 等待 Dify 服務完全啟動（約 30 秒）
     ```

### 測試 2: API Key 無效 (401 錯誤)

1. **修改 .env 文件**
   ```bash
   DIFY_API_KEY=invalid_key_for_testing
   ```

2. **重啟後端**
   ```bash
   # Ctrl+C 停止
   python launcher.py
   ```

3. **發送訊息**

4. **預期結果**
   ```
   ❌ 發生錯誤
   
   Dify API Key 無效，請檢查 .env 文件中的 DIFY_API_KEY 設定
   
   💡 解決方案：
   1. 檢查 `.env` 文件是否存在
   2. 確認 `DIFY_API_KEY` 設定正確
   3. 重新啟動後端服務
   ```

### 測試 3: 請求超時 (504 錯誤)

1. **修改 backend/core/config.py**
   ```python
   REQUEST_TIMEOUT = 1.0  # 設定為 1 秒（測試用）
   ```

2. **重啟後端並發送訊息**

3. **預期結果**
   ```
   ❌ 發生錯誤
   
   Dify API 請求超時，請稍後再試
   
   💡 解決方案：
   1. Dify 服務可能過載
   2. 請稍後重試
   3. 檢查網路連線
   ```

## 🔍 除錯方法

### 檢查後端日誌

打開後端終端，查看詳細錯誤：

```
2026-01-31 02:02:21,382 - backend.api.dify - ERROR - Dify 連線失敗: [Errno 111] Connection refused
```

### 檢查前端 Console

按 F12 打開瀏覽器開發者工具：

```javascript
發送訊息失敗: Error: 無法連接到 Dify API (http://localhost:80/v1)。請確認 Docker 容器已啟動 (docker compose up -d)
```

### 檢查網路請求

在 Chrome DevTools Network 面板：

1. 找到 `/api/dify/chat` 請求
2. 查看 Response 標籤：
   ```json
   {
     "detail": "無法連接到 Dify API (http://localhost:80/v1)。請確認 Docker 容器已啟動 (docker compose up -d)"
   }
   ```

## 🎯 快速診斷

| 症狀 | 原因 | 解決方案 |
|------|------|----------|
| 前端顯示 "無法連接到 Dify API" | Docker 未啟動 | `docker compose up -d` |
| 前端顯示 "API Key 無效" | .env 配置錯誤 | 檢查 DIFY_API_KEY |
| 前端顯示 "請求超時" | Dify 服務過載 | 等待或重啟 Docker |
| 前端顯示 "HTTP 500" | 其他後端錯誤 | 查看後端日誌 |

## ✨ 完成指標

- ✅ 後端正確捕獲 `httpx.ConnectError`
- ✅ 後端返回狀態碼 503 和詳細 detail 訊息
- ✅ 前端正確解析 JSON response 的 detail 字段
- ✅ 前端顯示清晰的錯誤訊息和解決方案
- ✅ 錯誤訊息包含具體的 API URL
- ✅ 不再只顯示 "Service Unavailable"
