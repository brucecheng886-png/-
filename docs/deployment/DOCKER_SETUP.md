# Docker 服務啟動指南

## 📦 服務架構

### Dify 服務（端口 3000 & 5001）
- **dify-api**: Dify 後端 API (端口 5001)
- **dify-web**: Dify 前端界面 (端口 3000)
- **dify-worker**: Celery 後台任務處理
- **dify-db**: PostgreSQL 數據庫
- **dify-redis**: Redis 緩存
- **weaviate**: 向量數據庫

### RAGFlow 服務（端口 9380）
- **ragflow-server**: RAGFlow 核心服務 (端口 9380)
- **ragflow-mysql**: MySQL 數據庫
- **ragflow-minio**: MinIO 對象存儲 (端口 9000/9001)
- **ragflow-es**: Elasticsearch 搜索引擎 (端口 9200)

### 反向代理（可選）
- **nginx**: Nginx 反向代理 (端口 80)

## 🚀 快速啟動

### 1. 配置環境變數

```powershell
# 複製環境變數模板到 .env
cat .env.docker >> .env

# 或手動編輯 .env 文件，修改敏感信息
notepad .env
```

### 2. 啟動所有服務

```powershell
# 啟動所有服務（後台運行）
docker compose up -d

# 查看服務狀態
docker compose ps

# 查看服務日誌
docker compose logs -f
```

### 3. 等待服務完全啟動

首次啟動需要下載鏡像並初始化數據庫，大約需要 **3-5 分鐘**。

```powershell
# 檢查 Dify API 健康狀態
curl http://localhost:5001/health

# 檢查 RAGFlow 健康狀態
curl http://localhost:9380/api/v1/health
```

### 4. 訪問服務

| 服務 | URL | 說明 |
|------|-----|------|
| Dify Web | http://localhost:3000 | Dify 管理界面 |
| Dify API | http://localhost:5001 | Dify API 端點 |
| RAGFlow | http://localhost:9380 | RAGFlow Web UI |
| MinIO Console | http://localhost:9001 | MinIO 管理界面 |
| Elasticsearch | http://localhost:9200 | ES 健康檢查 |
| Nginx Proxy | http://localhost:80/v1 | 統一 API 入口 |

## 🔑 獲取 API Keys

### Dify API Key

1. 訪問 http://localhost:3000
2. 註冊/登入帳號
3. 創建新應用（Application）
4. 進入應用 -> **API 訪問** -> **API Keys**
5. 點擊 **創建密鑰**，複製 API Key
6. 將 API Key 填入 `.env` 文件：
   ```
   DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### RAGFlow API Key

1. 訪問 http://localhost:9380
2. 註冊/登入帳號
3. 進入 **設定** -> **API Keys**
4. 創建新的 API Key
5. 將 API Key 填入 `.env` 文件：
   ```
   RAGFLOW_API_KEY=ragflow-xxxxxxxxxxxxxxxx
   ```

## 🛠️ 常用命令

### 服務管理

```powershell
# 啟動服務
docker compose up -d

# 停止服務
docker compose down

# 重啟服務
docker compose restart

# 重啟特定服務
docker compose restart dify-api

# 查看服務狀態
docker compose ps

# 查看服務日誌
docker compose logs -f [service_name]
```

### 數據管理

```powershell
# 清理所有容器和數據卷（⚠️ 會刪除所有數據）
docker compose down -v

# 只清理容器，保留數據
docker compose down

# 重新構建並啟動
docker compose up -d --build
```

### 故障排查

```powershell
# 查看特定服務日誌
docker compose logs dify-api
docker compose logs ragflow-server

# 進入容器內部
docker compose exec dify-api bash
docker compose exec ragflow-server sh

# 查看資源使用情況
docker stats

# 清理未使用的鏡像和容器
docker system prune -a
```

## 📊 服務依賴關係

```
dify-web (3000)
    └── dify-api (5001)
        ├── dify-db (PostgreSQL)
        ├── dify-redis (Redis)
        └── weaviate (向量數據庫)

ragflow-server (9380)
    ├── ragflow-mysql (MySQL)
    ├── ragflow-minio (MinIO: 9000/9001)
    └── ragflow-es (Elasticsearch: 9200)

nginx (80)
    ├── /v1/* → dify-api:5001
    └── /ragflow/* → ragflow-server:9380
```

## ⚠️ 常見問題

### 1. 端口衝突

如果端口已被佔用，修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "5001:5001"  # 改為 "5002:5001"
```

### 2. 內存不足

Elasticsearch 需要較大內存，如果啟動失敗：

```yaml
# 在 docker-compose.yml 中減少 ES 內存
environment:
  - "ES_JAVA_OPTS=-Xms256m -Xmx256m"  # 從 512m 降到 256m
```

### 3. 數據庫初始化失敗

```powershell
# 清理並重新啟動
docker compose down -v
docker compose up -d
```

### 4. 服務無法連接

```powershell
# 確認所有服務都在同一網絡
docker network inspect bruv_bruv-network

# 檢查服務健康狀態
docker compose ps
```

## 🔄 更新服務

```powershell
# 拉取最新鏡像
docker compose pull

# 重新啟動服務
docker compose up -d
```

## 📝 環境變數說明

| 變數名 | 預設值 | 說明 |
|--------|--------|------|
| DIFY_DB_PASSWORD | dify_password_2026 | Dify PostgreSQL 密碼 |
| DIFY_REDIS_PASSWORD | dify_redis_2026 | Dify Redis 密碼 |
| DIFY_SECRET_KEY | sk-9f73... | Dify 加密密鑰 |
| DIFY_API_KEY | - | Dify API 調用密鑰 |
| RAGFLOW_MYSQL_PASSWORD | ragflow_root_2026 | RAGFlow MySQL 密碼 |
| RAGFLOW_API_KEY | ragflow-api-key-2026 | RAGFlow API 密鑰 |
| MINIO_USER | minioadmin | MinIO 管理員帳號 |
| MINIO_PASSWORD | minioadmin123 | MinIO 管理員密碼 |
| OPENAI_API_KEY | - | OpenAI API Key（可選）|

## 🎯 下一步

1. ✅ 確認所有服務啟動成功：`docker compose ps`
2. ✅ 訪問 Dify Web 並獲取 API Key
3. ✅ 訪問 RAGFlow 並獲取 API Key
4. ✅ 更新 `.env` 文件中的 API Keys
5. ✅ 重啟 Python 後端：`python launcher.py`
6. ✅ 測試 API 連接：訪問 http://localhost:5173 發送對話

---

**需要幫助？** 查看日誌：`docker compose logs -f`
