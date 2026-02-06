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

# 安裝 Python 依賴
pip install -r requirements.txt

# 安裝前端依賴
cd frontend
npm install
cd ..
```

### 2. 一鍵啟動 ⭐

#### 方式一：使用一鍵啟動腳本（推薦）

雙擊執行：
```
START.bat         # Windows 批次檔
START.ps1         # PowerShell 腳本
```

#### 方式二：使用 GUI 啟動器

雙擊執行：
```
start_gui_launcher.bat
```

功能：
- ✅ 圖形化界面控制
- ✅ 一鍵啟動/停止所有服務
- ✅ 實時查看服務日誌
- ✅ 中英文雙語支持

#### 方式三：手動啟動

```bash
# 啟動後端
python -m uvicorn app_anytype:app --host 127.0.0.1 --port 8000 --reload

# 啟動前端（新終端）
cd frontend
npm run dev

# 啟動 Docker 服務（可選，新終端）
docker-compose up -d
```

📖 詳細說明請查看 [快速啟動指南.md](./快速啟動指南.md)

### 3. 訪問服務

- 🌐 **前端界面**: http://localhost:5173
- 📚 **API 文檔**: http://localhost:8000/docs
- 🔗 **後端 API**: http://localhost:8000
- 🤖 **Dify**: http://localhost:3000
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
