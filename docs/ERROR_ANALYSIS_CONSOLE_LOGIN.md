# 錯誤分析報告

## ❌ 錯誤訊息

```
POST http://localhost:5001/console/api/login
Status: 500 (INTERNAL SERVER ERROR)
Response: {type: 'cors', url: 'http://localhost:5001/console/api/login', redirected: false, status: 500, ok: false}
```

## 🔍 根本原因

這個錯誤來自 **Dify 管理控制台 (Console)** 而非應用 API：

1. `/console/api/login` 是 Dify Web UI 的登錄端點
2. 正確的應用 API 端點應該是 `/v1/chat-messages`
3. 表示瀏覽器正在嘗試訪問 Dify 的管理界面，而非通過 API 調用

## 📌 相關配置代碼

### 1. 當前配置 (C:/BruV_Data/config.json)

```json
{
  "dify_api_key": "app-9DZjjvZF4MzGSN4y9KBBmP60",
  "dify_api_url": "http://localhost:5001/v1",
  "ragflow_api_key": "ragflow-***",
  "ragflow_api_url": "http://localhost:9380/api/v1"
}
```

**注意**：配置中的 URL 是 `/v1`，這是正確的應用 API 端點。

### 2. Docker Compose 配置 (docker-compose.yml:1-35)

```yaml
version: '3.8'

services:
  # Dify Web UI
  dify:
    image: langgenius/dify-web:0.6.16
    container_name: bruv_dify
    ports:
      - "82:3000"  # Web UI 端口
    environment:
      - API_URL=http://localhost:5001
      - CONSOLE_API_URL=http://localhost:5001  # ← Console API 配置
      - APP_API_URL=http://localhost:5001
    depends_on:
      - dify-api

  # Dify API 服務
  dify-api:
    image: langgenius/dify-api:0.6.16
    container_name: bruv_dify_api
    ports:
      - "5001:5001"  # API 端口
    environment:
      - MODE=api
      - LOG_LEVEL=INFO
      # ... 其他配置
```

**端口說明**：
- `5001` - Dify API 服務（包含 Console API 和 App API）
- `82` - Dify Web UI（管理界面）

### 3. 後端 Dify 配置 (backend/core/config.py:56-108)

```python
class Settings(BaseSettings):
    """應用設置"""
    
    # API 配置
    DIFY_API_URL: str = "http://localhost:80/v1"  # 默認值
    DIFY_API_KEY: str = ""
    DIFY_SECRET_KEY: str = ""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # 載入 config.json 配置（優先級最高）
        file_config = load_config_from_file()
        if file_config:
            if 'dify_api_url' in file_config:
                self.DIFY_API_URL = file_config['dify_api_url']
            if 'dify_api_key' in file_config:
                self.DIFY_API_KEY = file_config['dify_api_key']


def get_current_api_keys() -> Dict[str, str]:
    """動態獲取當前的 API Keys"""
    file_config = load_config_from_file()
    
    return {
        'DIFY_API_KEY': file_config.get('dify_api_key') or os.getenv('DIFY_API_KEY'),
        'DIFY_API_URL': file_config.get('dify_api_url') or os.getenv('DIFY_API_URL')
    }
```

### 4. Dify API 調用 (backend/api/dify.py:18-76)

```python
def get_dify_config():
    """動態獲取 Dify 配置"""
    api_keys = get_current_api_keys()
    return {
        'api_key': api_keys['DIFY_API_KEY'],
        'api_url': api_keys['DIFY_API_URL']  # http://localhost:5001/v1
    }


@router.post("/chat")
async def chat_with_dify(request: DifyRequest):
    """與 Dify 對話"""
    config = get_dify_config()
    
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            # 正確的應用 API 端點
            response = await client.post(
                f"{config['api_url']}/chat-messages",  # /v1/chat-messages
                headers={
                    "Authorization": f"Bearer {config['api_key']}",
                    "Content-Type": "application/json"
                },
                json={
                    "query": request.query,
                    "user": request.user,
                    "conversation_id": request.conversation_id,
                    "inputs": request.inputs,
                    "response_mode": "blocking"
                }
            )
            response.raise_for_status()
            return response.json()
```

**正確端點**：`http://localhost:5001/v1/chat-messages` ✅

### 5. Settings 頁面配置顯示 (frontend/src/views/Settings.vue:36-50)

```vue
<!-- Dify API URL -->
<div class="form-group">
  <label class="form-label">
    API URL
    <span class="label-badge">可編輯</span>
  </label>
  <input
    v-model="config.dify_api_url"
    type="text"
    class="form-input"
    placeholder="http://localhost:80/v1"
    @input="hasChanges = true"
  />
  <p class="form-hint">
    Dify 服務的 API 端點（例如：http://localhost:80/v1 或 http://172.19.0.2:3000/v1）
  </p>
</div>
```

## 🎯 可能的原因

### 原因 1：直接訪問 Dify Web UI

用戶可能在瀏覽器中直接打開了：
- `http://localhost:5001` - 這會重定向到 Console 登錄頁面
- `http://localhost:82` - Dify Web UI 管理界面

**解決方案**：不要直接訪問這些 URL，而是通過前端應用訪問。

### 原因 2：瀏覽器緩存了舊的重定向

瀏覽器可能緩存了之前訪問 Dify 的記錄。

**解決方案**：清除瀏覽器緩存或使用無痕模式。

### 原因 3：Dify 服務內部錯誤

Dify API 服務本身可能有問題。

**檢查方法**：
```powershell
# 查看 Dify API 容器日誌
docker logs bruv_dify_api --tail 50

# 查看 Dify Web 容器日誌
docker logs bruv_dify --tail 50
```

### 原因 4：前端有隱藏的 iframe 或鏈接

前端代碼中可能有嵌入 Dify UI 的地方（已檢查，未發現）。

## 🔧 診斷步驟

### 1. 檢查 Docker 容器狀態

```powershell
docker ps --filter "name=dify"
```

**當前狀態**：
```
NAMES             STATUS          PORTS
bruv_dify_api     Up 21 minutes   0.0.0.0:5001->5001/tcp
bruv_dify         Up 24 minutes   0.0.0.0:82->3000/tcp
bruv_dify_db      Up 9 hours      5432/tcp
bruv_dify_redis   Up 9 hours      6379/tcp
```

✅ 所有容器正常運行

### 2. 測試 Dify API 端點

```powershell
# 測試應用 API（正確）
curl -X POST http://localhost:5001/v1/chat-messages `
  -H "Authorization: Bearer app-9DZjjvZF4MzGSN4y9KBBmP60" `
  -H "Content-Type: application/json" `
  -d '{"query":"Hello","user":"test","response_mode":"blocking"}'

# 測試 Console API（會觸發錯誤）
curl -X POST http://localhost:5001/console/api/login
```

### 3. 檢查瀏覽器網絡請求

在瀏覽器開發者工具中查看：
1. Network 標籤
2. 找到 `console/api/login` 請求
3. 查看 **Initiator** 欄位，確認是哪個文件/代碼觸發的

### 4. 查看 Dify 服務日誌

```powershell
# Dify API 日誌
docker logs bruv_dify_api --tail 100 --follow

# 過濾錯誤日誌
docker logs bruv_dify_api 2>&1 | Select-String -Pattern "error|Error|ERROR|500"
```

## ✅ 解決方案

### 方案 1：確認訪問正確的 URL

確保用戶訪問的是：
- ✅ `http://localhost:5173` - 前端應用（推薦）
- ✅ `http://localhost:8000` - 後端 API
- ❌ `http://localhost:5001` - Dify API（不要直接訪問）
- ❌ `http://localhost:82` - Dify Web UI（僅用於管理）

### 方案 2：清除瀏覽器緩存

```javascript
// 在瀏覽器控制台執行
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### 方案 3：檢查 Dify 服務配置

如果 Dify 服務有問題，重啟容器：
```powershell
docker restart bruv_dify_api bruv_dify
```

### 方案 4：檢查 CORS 配置

確認 Dify API 允許跨域請求：

在 `docker-compose.yml` 中添加：
```yaml
dify-api:
  environment:
    - CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:8000
```

## 📊 API 端點對比

| 端點 | 用途 | 狀態 |
|------|------|------|
| `/console/api/login` | Dify 管理控制台登錄 | ❌ 錯誤來源 |
| `/v1/chat-messages` | Dify 應用 API（對話） | ✅ 正確使用 |
| `/v1/workflows/run` | Dify Workflow API | ✅ 正確使用 |
| `/api/v1/documents` | RAGFlow 文檔 API | ✅ 正確使用 |

## 💡 重要提示

1. **不要直接訪問** `http://localhost:5001`，這會觸發 Console API
2. **應該訪問** `http://localhost:5173`（前端應用）
3. 前端應用會通過後端 API 與 Dify 通信
4. 配置中的 `/v1` 端點是正確的

## 🔗 相關文件位置

```
BruV_Project/
├── C:/BruV_Data/config.json          # 配置文件（Dify URL: /v1）
├── docker-compose.yml                # Docker 配置
├── backend/
│   ├── core/config.py               # 配置管理
│   └── api/dify.py                  # Dify API 調用
└── frontend/
    └── src/views/Settings.vue       # Settings 頁面
```

## 📝 總結

**錯誤原因**：瀏覽器嘗試訪問 Dify 的管理控制台登錄端點 `/console/api/login`，而不是通過正確的應用 API `/v1/...`。

**正確流程**：
```
用戶 → 前端(5173) → 後端API(8000) → Dify API(/v1/chat-messages)
```

**錯誤流程**：
```
瀏覽器 → 直接訪問 Dify(5001) → /console/api/login ❌
```

**立即行動**：
1. 確認用戶訪問 `http://localhost:5173`
2. 檢查瀏覽器開發者工具的 Network 標籤
3. 查看是什麼觸發了 `/console/api/login` 請求
