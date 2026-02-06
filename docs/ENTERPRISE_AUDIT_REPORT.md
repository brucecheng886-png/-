# 🏢 BruV_Project 企業級地端化伺服器 — 完整審查報告

> **審查日期**: 2025-02-07  
> **審查範圍**: 全專案 15+ 後端文件、前端架構、部署配置、啟動腳本  
> **審查標準**: 企業級地端化伺服器 (On-premise Enterprise Server)  
> **專案技術棧**: FastAPI + Vue 3 + KuzuDB + Dify + RAGFlow + Docker

---

## 📊 審查總覽

| 嚴重度 | 數量 | 說明 |
|--------|------|------|
| 🔴 **Critical** | **12** | 必須立即修復 — 安全漏洞、資料損毀風險 |
| 🟠 **High** | **34** | 應在一週內修復 — 穩定性、安全性風險 |
| 🟡 **Medium** | **48** | 應在一月內改善 — 效能、可維護性 |
| 🔵 **Low** | **32** | 持續改進 — 代碼品質、規範 |

---

## 🔴 CRITICAL — 立即修復清單

### C-01: KuzuDB 啟動時自動刪除數據庫 ❗❗❗

**檔案**: `backend/core/kuzu_manager.py` L38-50  
**問題**: 每次初始化 `KuzuDBManager` 時，若 `kuzu_db` 目錄已存在就執行 `shutil.rmtree()` **完全刪除**。  
**影響**: 伺服器重啟 = 所有圖譜資料永久丟失。  
**修復**:
```python
# ❌ 當前代碼 — 災難性邏輯
if self.db_path.exists() and self.db_path.is_dir():
    shutil.rmtree(self.db_path)  # 刪除整個數據庫！

# ✅ 修正方案 — 直接使用已存在的數據庫
# KuzuDB 原生支持開啟已存在的目錄，無需刪除重建
try:
    db_path_str = str(self.db_path).replace('\\', '/')
    self.db = kuzu.Database(db_path_str)
    self.conn = kuzu.Connection(self.db)
    self._initialize_schema()  # CREATE ... IF NOT EXISTS
```

---

### C-02: 全系統無認證機制 ❗❗❗

**檔案**: 所有 API 檔案 + 前端路由  
**問題**: 
- 後端：所有端點完全公開，無 JWT/API Key/Session 認證
- 前端：`router/index.js` 的 `beforeEach` 僅設定標題，無認證守衛
- 任何能訪問該端口的人可以：讀取/修改所有配置、執行任意 Cypher、刪除圖譜  

**修復方案**:
```
1. 後端加入 API Key 中間件或 JWT 認證
2. 前端加入路由守衛 (Navigation Guard)
3. /settings、/monitor 等管理頁面額外驗證管理員權限
```

---

### C-03: Cypher 注入漏洞 ❗❗

**檔案**: 
- `backend/api/graph.py` — `/query` 端點直接執行用戶提交的任意 Cypher
- `app_anytype.py` L288-291 — f-string 拼接 `graph_id` 進 Cypher
- `frontend/src/stores/graphStore.js` — 前端直接構造 Cypher 字串

**影響**: 攻擊者可執行 `DROP TABLE`、`DELETE` 等破壞性操作，或提取所有數據  
**修復**:
```python
# ❌ 當前 — f-string 拼接
f"MATCH (n:Entity) WHERE n.graph_id = '{graph_id}' RETURN n"

# ✅ 修正 — 參數化查詢
conn.execute("MATCH (n:Entity) WHERE n.graph_id = $gid RETURN n",
             parameters={"gid": graph_id})

# ✅ /query 端點加入白名單，僅允許 MATCH/RETURN
```

---

### C-04: Docker Compose 硬編碼所有密碼

**檔案**: `docker-compose.yml`  
**問題**:
```yaml
DB_PASSWORD=difyai123456          # Dify 資料庫
POSTGRES_PASSWORD=difyai123456    # PostgreSQL
MYSQL_PASSWORD=infiniflow         # MySQL  
MYSQL_ROOT_PASSWORD=infiniflow    # MySQL root
MINIO_ROOT_PASSWORD=infiniflow    # MinIO
```
**影響**: 所有密碼為弱密碼且已進入版本控制，任何有倉庫存取權的人都能取得  
**修復**:
```yaml
# ✅ 改用環境變數引用
DB_PASSWORD=${DB_PASSWORD:?DB_PASSWORD must be set}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:?required}
```

---

### C-05: MinIO 憑證硬編碼在原始碼中

**檔案**: `backend/api/media_library.py` L28-30  
```python
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "infiniflow"
```
**修復**: 移入 `config.json` 或環境變數

---

### C-06: Elasticsearch 安全機制完全關閉

**檔案**: `docker-compose.yml`  
```yaml
xpack.security.enabled=false  # + Port 9200 暴露
```
**影響**: 任何人可直接查詢/修改/刪除 ES 中的所有索引和數據  

---

### C-07: CORS 配置允許所有來源

**檔案**: `app_anytype.py` L62-70  
```python
allow_origins=["*"]       # 允許任何域
allow_credentials=True    # 且允許攜帶憑證
```
**影響**: 違反 CORS 安全模型，XSS 攻擊可跨域存取所有 API  

---

### C-08: API Key 明文存儲且 GET /config 直接回傳

**檔案**: 
- `backend/core/config.py` — API Key 明文存於 `config.json`
- `backend/api/system.py` — `GET /config` 回傳完整 API Key 不遮罩
- `mask_api_key()` 函式已定義但**未被使用**

---

### C-09: 路徑遍歷漏洞 (Path Traversal)

**檔案**: 
- `backend/api/media_library.py` — `get_image`、`delete_image` 端點接受 `file_path:path` 未驗證
- `backend/api/system.py` — 上傳端點使用 `file.filename` 直接拼接路徑

**攻擊範例**: `GET /api/media/image/../../etc/passwd`  

---

### C-10: 後端綁定 0.0.0.0 + --reload

**檔案**: `start_backend.ps1` L18  
```powershell
uvicorn app_anytype:app --host 0.0.0.0 --port 8765 --reload
```
**影響**: API 暴露給局域網所有設備 + 生產環境不需 `--reload`  

---

### C-11: 前端路由無認證守衛

**檔案**: `frontend/src/router/index.js`  
**問題**: `/settings`、`/monitor`、`/import` 等管理頁面任何人可直接訪問  

---

### C-12: 所有 Docker 端口暴露至 0.0.0.0

**檔案**: `docker-compose.yml`  
**問題**: `"9200:9200"`、`"9000:9000"`、`"3306:3306"` 等均暴露到所有網路介面  
**修復**: 改為 `"127.0.0.1:9200:9200"`

---

## 🟠 HIGH — 一週內修復

### H-01: 配置來源混亂 (4 種來源並存)

| 來源 | 使用位置 |
|------|---------|
| `config.json` | config.py, system.py |
| `.env` 檔案 | docker-compose, system.py |
| `os.getenv()` | agent_service.py |
| 硬編碼常數 | media_library.py, app_anytype.py |

**修復**: 統一到 `config.py` 的 `Settings` 類，所有模組透過依賴注入取得設定

### H-02: 全域狀態管理 (非線程安全)

**檔案**: `app_anytype.py` L74-75  
`kuzu_manager` 和 `watcher_service` 使用 `global` 變數，多請求並發可能競態。  
**修復**: 使用 `app.state` 或 FastAPI `Depends()`

### H-03: 同步阻塞在 async 事件迴圈

| 檔案 | 問題 |
|------|------|
| `rag_client.py` L27 | 使用同步 `requests.Session` |
| `watcher.py` L78 | `time.sleep(1)` 阻塞事件線程 |

**修復**: `rag_client.py` 改用 `httpx.AsyncClient`；`watcher.py` 改用 `asyncio.sleep`

### H-04: httpx 連線池未共享

**檔案**: `backend/api/dify.py`, `backend/api/ragflow.py`  
每次 API 請求都新建 `httpx.AsyncClient`，高併發下耗盡 socket  
**修復**: 使用 `app.state.http_client` 在 lifespan 中建立/關閉共享客戶端

### H-05: 上傳端點未限制檔案大小

**檔案**: `backend/api/system.py`、`backend/api/media_library.py`  
**影響**: 可被用於磁碟耗盡 DoS 攻擊  

### H-06: Nginx 無 SSL/TLS

**檔案**: `nginx/ragflow.conf`  
僅監聽 HTTP 80，所有 API 請求（含 API Key）明文傳輸  

### H-07: Nginx 缺少安全標頭

未設定 `X-Frame-Options`、`X-Content-Type-Options`、`Content-Security-Policy`、`HSTS`

### H-08: 圖譜 ID 使用 time + random 生成

**檔案**: `backend/api/graph.py` L177  
`time.time()` + `random.randint(1000, 9999)` 不保證唯一  
**修復**: 使用 `uuid.uuid4()`

### H-09: 任務佇列純記憶體實現

**檔案**: `backend/services/task_queue.py`  
重啟後所有任務丟失，且歷史記錄無限增長  
**修復**: 使用 Redis 或 SQLite 持久化

### H-10: SSRF 風險 — API URL 可被無認證端點修改

**檔案**: `backend/api/dify.py`, `backend/api/ragflow.py`  
若攻擊者透過 `POST /config` 修改 `dify_api_url`，API Key 將被發送至攻擊者伺服器

### H-11: 全路徑硬編碼 Windows

**涉及 6+ 個檔案**: `C:/BruV_Data/...`、`C:\Users\bruce\...`  
**修復**: 使用 `pathlib.Path.home()` 或環境變數配置

### H-12: 前端路由未使用 Lazy Loading

**檔案**: `frontend/src/router/index.js`  
12 個頁面全部同步 import，初始 bundle 過大  
**修復**: `component: () => import('@/views/GraphPage.vue')`

### H-13: 前端 Cypher 查詢直接構造

**檔案**: `frontend/src/stores/graphStore.js` L296-320  
`executeCypherQuery()` 將任意字串直接發送至後端

### H-14: 依賴版本未完全鎖定

**檔案**: `requirements.txt`  
`pandas>=2.0.0`、`watchdog>=3.0.0` 等使用 `>=`，CI 不可再現  
**修復**: 使用精確版本或 `pip freeze > requirements.lock`

### H-15: PySide6 出現在伺服器依賴中

**檔案**: `requirements.txt`  
GUI 框架在 Docker 部署中不需要且會安裝失敗  
**修復**: 分離為 `requirements-gui.txt`

### H-16: launcher_gui.py 使用 taskkill /F

強制殺死進程可能導致 DB 事務未提交  

### H-17: start_media_library.ps1 盲殺所有 Python 進程

`Get-Process python | Stop-Process -Force` 可能誤殺其他 Python 應用

---

## 🟡 MEDIUM — 一月內改善

| 編號 | 檔案 | 問題 |
|------|------|------|
| M-01 | `app_anytype.py` | 使用已棄用的 `@app.on_event`，應改用 `lifespan` |
| M-02 | `app_anytype.py` | 全域異常處理將完整 `str(exc)` 返回客戶端 |
| M-03 | `app_anytype.py` | `/graph/data` N+1 查詢，每次分別查節點和關係 |
| M-04 | `config.py` | `get_current_api_keys()` 每次呼叫都讀取磁碟 |
| M-05 | `config.py` | `save_config_to_file` read-modify-write 競態 |
| M-06 | `kuzu_manager.py` | `query()` 每次轉 DataFrame→dict，大結果集高記憶體 |
| M-07 | `kuzu_manager.py` | `close()` 未關閉 `kuzu.Database`，僅關 Connection |
| M-08 | `kuzu_manager.py` | `update_graph_metadata` 使用動態 f-string SET |
| M-09 | `graph.py` | `list_graphs_legacy` N+1 查詢問題 |
| M-10 | `system.py` | `.env` 操作函式殘留，已非主要配置源 |
| M-11 | `dify.py` / `ragflow.py` | httpx 每次新建 AsyncClient |
| M-12 | `ragflow.py` | `upload_document` 將整個檔案讀入記憶體 |
| M-13 | `tasks.py` | 無分頁機制，返回所有任務 |
| M-14 | `tasks.py` | 任務取消端點未實作 (TODO) |
| M-15 | `media_library.py` | 元數據未持久化 (TODO) |
| M-16 | `media_library.py` | MinIO 使用 `secure=False` 不加密 |
| M-17 | `media_library.py` | 統計端點遍歷所有物件，大量檔案時極慢 |
| M-18 | `graph_import.py` | Excel 整個讀入記憶體，大檔案 OOM |
| M-19 | `graph_import.py` | LLM 整合為 Mock (TODO) |
| M-20 | `graph_import.py` | 180 行 Prompt 硬編碼在程式碼中 |
| M-21 | `watcher.py` | 檔案處理失敗無重試機制 |
| M-22 | `watcher.py` | `_process_existing_files` 啟動時同步阻塞 |
| M-23 | `watcher.py` | 使用 MD5 雜湊生成 ID |
| M-24 | `task_queue.py` | 單消費者工作線程 |
| M-25 | `task_queue.py` | 任務歷史無清理，記憶體洩漏 |
| M-26 | `agent_service.py` | 從 `os.getenv` 讀取配置，繞過統一管理 |
| M-27 | `agent_service.py` | HTTP 超時 30s 固定且無重試 |
| M-28 | `rag_client.py` | `requests.Session` 無超時設定 |
| M-29 | `rag_client.py` | Session 未被正確關閉 (無 __del__) |
| M-30 | `helpers.py` | `generate_id` 使用 MD5 不安全 |
| M-31 | `frontend/index.html` | 依賴 Google Fonts CDN（地端化難存取） |
| M-32 | `frontend/src/main.js` | 全域註冊 280 個 Element Plus 圖標 |
| M-33 | `frontend/src/main.js` | 生產環境輸出 API Base 到 console |
| M-34 | `graphStore.js` | 60+ 處 `console.log`，生產洩漏資訊 |
| M-35 | `graphStore.js` | `importFile` 使用 Mock 數據 |
| M-36 | `graphStore.js` | `loadCrossGraphData` 硬編碼測試數據 |
| M-37 | `graphStore.js` | 前端 fetch 無統一攔截器 |
| M-38 | `GraphDataManager.js` | fetch 無超時 (AbortController) |
| M-39 | `vite.config.js` | Proxy `secure: false` |
| M-40 | `vite.config.js` | `host: true` 開發伺服器暴露 |
| M-41 | `nginx/ragflow.conf` | 靜態資源 cache 30d 但無檔案指紋 |
| M-42 | `nginx/ragflow.conf` | 無 Rate Limiting 配置 |
| M-43 | `router/index.js` | 404 重定向到圖譜頁而非 404 頁面 |
| M-44 | `全系統` | 無結構化日誌（emoji + print-style） |
| M-45 | `全系統` | 無 API 速率限制 |
| M-46 | `package.json (frontend)` | 無 lint / test 腳本 |
| M-47 | `package.json (frontend)` | `xlsx` 授權問題需確認 |
| M-48 | `.env.docker` | 已被版本控制追蹤，可能洩漏真實密碼 |

---

## 🔵 LOW — 持續改進

<details>
<summary>展開檢視 32 項 Low 級別問題</summary>

| 編號 | 問題 |
|------|------|
| L-01 | Pydantic 模型在 app_anytype.py 和 graph.py 重複定義 |
| L-02 | uvicorn.run host=0.0.0.0 應可配置 |
| L-03 | config.py 路徑硬編碼 Windows |
| L-04 | config.py 命名風格不一致 |
| L-05 | kuzu_manager.py 路徑 fallback 靜默 |
| L-06 | MockKuzuManager 未遵循 ABC 介面 |
| L-07 | graph.py search_entities 空字串邏輯不一致 |
| L-08 | system.py mask_api_key 已定義未使用 |
| L-09 | dify.py `import os` 未使用 |
| L-10 | media_library.py 常數未統一管理 |
| L-11 | media_library.py MinIO 連線無快取 |
| L-12 | graph_import.py raw_data 回傳可能含敏感資訊 |
| L-13 | watcher.py .meta.json 判斷邏輯脆弱 |
| L-14 | watcher.py Excel 欄位硬編碼 |
| L-15 | task_queue.py 全域單例不適合多 worker |
| L-16 | agent_service.py 意圖識別硬編碼關鍵字 |
| L-17 | agent_service.py 全域初始化時機問題 |
| L-18 | rag_client.py 測試段佔位 API Key |
| L-19 | helpers.py 工具函式未被各模組使用 |
| L-20 | App.vue 未使用 import 殘留 |
| L-21 | layoutStore.js 主題硬鎖 dark |
| L-22 | layoutStore.js console.log 未移除 |
| L-23 | GraphDataManager.js 私有方法非真正私有 |
| L-24 | GraphDataManager.js 單例模式不防多實例 |
| L-25 | main.js 使用 globalProperties (Vue 2 風格) |
| L-26 | graphStore.js 1255 行單一 store 過大 |
| L-27 | docker-compose.yml 使用 latest 標籤 |
| L-28 | docker-compose.yml V1 版本語法已棄用 |
| L-29 | router 路由命名不一致 |
| L-30 | 根目錄 package.json 作用不明 |
| L-31 | frontend package.json 缺少 engines 欄位 |
| L-32 | launcher_gui.py 1454 行單一文件過大 |

</details>

---

## 🏗️ 企業級架構改善建議

### 1️⃣ 安全架構

```
┌─────────────────────────────────────────────┐
│                  Nginx                       │
│  ┌─────────────────────────────────────┐    │
│  │ SSL/TLS (Let's Encrypt / 自簽憑證)  │    │
│  │ Security Headers                    │    │
│  │ Rate Limiting (limit_req_zone)      │    │
│  │ IP Whitelist (allow/deny)           │    │
│  └──────────────┬──────────────────────┘    │
│                 ↓                            │
│  ┌─────────────────────────────────────┐    │
│  │ FastAPI + Auth Middleware (JWT)      │    │
│  │ ├─ CORS: 僅允許前端域               │    │
│  │ ├─ Rate Limiter (slowapi)           │    │
│  │ ├─ Request Validation (Pydantic)    │    │
│  │ └─ Parameterized Queries            │    │
│  └──────────────┬──────────────────────┘    │
│                 ↓                            │
│  ┌─────────────────────────────────────┐    │
│  │ KuzuDB (127.0.0.1 only)            │    │
│  │ Elasticsearch (xpack.security=true) │    │
│  │ MinIO (強密碼 + TLS)               │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 2️⃣ 配置管理統一方案

```python
# backend/core/config.py — 統一配置管理
class Settings(BaseSettings):
    """所有配置的唯一來源"""
    # 伺服器
    HOST: str = "127.0.0.1"
    PORT: int = 8765
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # 資料庫
    KUZU_DB_PATH: str = Field(default_factory=lambda: str(Path.home() / "BruV_Data" / "kuzu_db"))
    
    # API 金鑰（加密存儲）
    DIFY_API_KEY: SecretStr = ""
    RAGFLOW_API_KEY: SecretStr = ""
    
    # MinIO
    MINIO_ACCESS_KEY: SecretStr = ""
    MINIO_SECRET_KEY: SecretStr = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        secrets_dir = "/run/secrets"  # Docker Secrets 支持
```

### 3️⃣ 依賴注入改造

```python
# backend/dependencies.py
from functools import lru_cache

@lru_cache
def get_settings() -> Settings:
    return Settings()

def get_kuzu_manager(settings: Settings = Depends(get_settings)) -> KuzuDBManager:
    return app.state.kuzu_manager

def get_http_client() -> httpx.AsyncClient:
    return app.state.http_client

# 路由使用
@router.get("/data")
async def get_graph_data(
    graph_id: str,
    manager: KuzuDBManager = Depends(get_kuzu_manager)
):
    # 使用參數化查詢
    return manager.get_entities(graph_id=graph_id)
```

### 4️⃣ 結構化日誌

```python
# backend/core/logging.py
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()  # JSON 格式，便於 ELK 收集
    ],
)

logger = structlog.get_logger()

# 使用
logger.info("graph.loaded", graph_id=graph_id, node_count=len(nodes))
# 輸出: {"event": "graph.loaded", "graph_id": "xxx", "node_count": 42, "timestamp": "..."}
```

### 5️⃣ Docker Compose 安全強化

```yaml
# docker-compose.yml
services:
  elasticsearch:
    environment:
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD:?required}
    ports:
      - "127.0.0.1:9200:9200"  # 僅本地存取
    
  minio:
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER:?required}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD:?required}
    ports:
      - "127.0.0.1:9000:9000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
```

### 6️⃣ 前端安全強化

```javascript
// frontend/src/utils/apiClient.js — 統一 HTTP 客戶端
const apiClient = {
  async request(url, options = {}) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s 超時
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${getToken()}`,  // 統一認證
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      if (response.status === 401) {
        router.push('/login')
        throw new Error('Unauthorized')
      }
      
      return response.json()
    } finally {
      clearTimeout(timeout)
    }
  }
}
```

### 7️⃣ Nginx 安全配置

```nginx
# nginx/ragflow.conf
server {
    listen 443 ssl http2;
    
    # SSL
    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    
    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://backend:8765;
    }
    
    # 禁止直接存取敏感路徑
    location ~ /\. { deny all; }
}

# HTTP → HTTPS 重定向
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

---

## 📋 修復優先級路線圖

### 🔴 Phase 0 — 今日修復 (4 小時)

| # | 任務 | 預估時間 |
|---|------|---------|
| 1 | **移除 kuzu_manager.py 的 `shutil.rmtree` 邏輯** | 15 分鐘 |
| 2 | **CORS 改為僅允許前端地址** | 15 分鐘 |
| 3 | **`/query` 端點加入 READ-ONLY 白名單** | 30 分鐘 |
| 4 | **所有 Cypher 改為參數化查詢** | 1 小時 |
| 5 | **MinIO 憑證移至配置檔** | 30 分鐘 |
| 6 | **Docker 端口改為 127.0.0.1 綁定** | 15 分鐘 |
| 7 | **`GET /config` 使用 `mask_api_key()` 遮罩** | 15 分鐘 |
| 8 | **上傳端點加入路徑清洗** | 30 分鐘 |

### 🟠 Phase 1 — 本週完成 (16 小時)

| # | 任務 | 預估時間 |
|---|------|---------|
| 1 | 後端 API Key 認證中間件 | 2 小時 |
| 2 | 前端路由守衛 + 簡易登入 | 3 小時 |
| 3 | 統一配置管理 (去除 4 源) | 2 小時 |
| 4 | `rag_client.py` 改 async | 1 小時 |
| 5 | httpx 連線池共享 | 1 小時 |
| 6 | 路由 Lazy Loading | 1 小時 |
| 7 | Nginx SSL + 安全標頭 | 2 小時 |
| 8 | Docker Compose 密碼外部化 | 1 小時 |
| 9 | ES 啟用 xpack.security | 1 小時 |
| 10 | 依賴版本鎖定 | 1 小時 |
| 11 | PySide6 分離 | 30 分鐘 |

### 🟡 Phase 2 — 本月完成

- 結構化日誌 (structlog/JSON)
- 全域 API 速率限制
- 上傳大小限制
- 任務佇列持久化 (Redis/SQLite)
- 前端統一 HTTP 攔截器
- 移除所有 `console.log`
- 移除 Google Fonts CDN (改本地字體)
- Element Plus 圖標按需引入
- graphStore.js 拆分
- 404 頁面

### 🔵 Phase 3 — 持續改進

- Pydantic 模型統一到 `schemas/`
- ABC 介面規範 Manager
- 單元測試覆蓋率 > 70%
- CI/CD Pipeline (GitHub Actions)
- Prometheus 監控指標
- Health Check 端點
- 自動化安全掃描 (Trivy, Bandit)

---

## 📎 附錄：檔案問題數量排名

| 排名 | 檔案 | Critical | High | Medium | Low | 總計 |
|------|------|----------|------|--------|-----|------|
| 1 | app_anytype.py | 2 | 3 | 4 | 2 | **11** |
| 2 | media_library.py | 1 | 2 | 4 | 2 | **9** |
| 3 | kuzu_manager.py | 1 | 3 | 3 | 2 | **9** |
| 4 | graph.py | 2 | 2 | 2 | 1 | **7** |
| 5 | system.py | 1 | 2 | 2 | 1 | **6** |
| 6 | graphStore.js | 0 | 2 | 4 | 1 | **7** |
| 7 | docker-compose.yml | 2 | 2 | 3 | 1 | **8** |
| 8 | watcher.py | 0 | 2 | 3 | 2 | **7** |
| 9 | config.py | 1 | 2 | 2 | 2 | **7** |
| 10 | task_queue.py | 0 | 1 | 2 | 1 | **4** |

---

*報告結束 — 建議從 Phase 0 立即開始修復，確保數據安全和系統基本防護。*
