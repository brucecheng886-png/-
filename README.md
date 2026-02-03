# 🚀 BruV_Project

企業級 AI 服務整合平台，整合 Dify、RAGFlow 與 KuzuDB 知識圖譜。

## 📋 功能特性

- ✅ **統一啟動器** - 自動檢查環境、依賴與服務狀態
- ✅ **Dify 整合** - 對話式 AI 與 Workflow 執行
- ✅ **RAGFlow 整合** - 文檔檢索與知識管理
- ✅ **KuzuDB 知識圖譜** - 實體關係管理與查詢
- ✅ **Vue 3 前端** - 現代化 Glass UI 介面
- ✅ **Docker 部署** - 一鍵啟動所有服務

## 🛠️ 快速開始

### 1. 環境準備

```bash
# 克隆專案
cd BruV_Project

# 複製環境變數
copy .env.example .env

# 編輯 .env 並填入 API Keys
notepad .env
```

### 2. 啟動服務

```bash
# 使用統一啟動器
python launcher.py
```

啟動器會自動：
- 檢查 Python 環境與依賴
- 啟動 Docker Compose (Dify + RAGFlow)
- 啟動 FastAPI 後端服務

### 3. 訪問服務

- 🌐 **前端介面**: http://localhost:8000
- 📚 **API 文檔**: http://localhost:8000/docs
- 🤖 **Dify**: http://localhost:80
- 📄 **RAGFlow**: http://localhost:9380

## 📁 專案結構

```
BruV_Project/
├── launcher.py              # 統一啟動器
├── app_anytype.py          # FastAPI 主程式
├── backend/
│   ├── api/                # API 路由
│   │   ├── dify.py        # Dify API
│   │   ├── ragflow.py     # RAGFlow API
│   │   └── graph.py       # 知識圖譜 API
│   ├── core/               # 核心邏輯
│   │   ├── config.py      # 配置管理
│   │   └── kuzu_manager.py # KuzuDB 管理器
│   └── utils/              # 工具函式
├── frontend/               # Vue 3 前端
│   └── index.html         # 單頁應用
├── docker-compose.yml      # Docker 配置
├── requirements.txt        # Python 依賴
└── README.md              # 說明文件
```

## 🔌 API 端點

### Dify API
- `POST /api/dify/chat` - 對話
- `POST /api/dify/workflow/run` - 執行 Workflow
- `GET /api/dify/conversations/{id}` - 獲取對話

### RAGFlow API
- `POST /api/ragflow/query` - 檢索查詢
- `GET /api/ragflow/datasets` - 列出數據集
- `POST /api/ragflow/documents/upload` - 上傳文檔

### Knowledge Graph API
- `POST /api/graph/entities` - 創建實體
- `POST /api/graph/relations` - 創建關係
- `GET /api/graph/entities/{id}` - 獲取實體
- `POST /api/graph/query` - Cypher 查詢

## 🐳 Docker 管理

```bash
# 啟動所有服務
docker compose up -d

# 查看服務狀態
docker compose ps

# 停止服務
docker compose down

# 查看日誌
docker compose logs -f
```

## 📝 配置說明

在 `.env` 中配置以下參數：

```env
DIFY_API_URL=http://localhost:80/v1
DIFY_API_KEY=your_api_key

RAGFLOW_API_URL=http://localhost:9380/api/v1
RAGFLOW_API_KEY=your_api_key

KUZU_DB_PATH=./data/kuzu_db
```

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 👨‍💻 作者

Bruce - BruV_Project Team
