# BruV Enterprise GUI Launcher

## 🚀 快速啟動

### 1️⃣ 安裝 PySide6 依賴

```bash
# 切換到專案目錄
cd "c:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\BruV_Project"

# 啟動虛擬環境
& "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/.venv/Scripts/Activate.ps1"

# 安裝 PySide6
pip install PySide6==6.6.1
```

### 2️⃣ 啟動 GUI 啟動器

```bash
python launcher_gui.py
```

## ✨ 功能特色

### 🎨 Cyberpunk 視覺設計
- **無邊框視窗** (900x600)
- **半透明深色主題** (#1e1e2d, #282a36)
- **霓虹色系** (#ff79c6 粉紫, #8be9fd 青色)
- **自定義標題列** 支援拖曳、最小化、關閉

### 🎛️ 左側控制面板 (30%)
- **Logo 區域**: "BruV ENTERPRISE"
- **啟動按鈕**: 巨大的 [🚀 START SYSTEM] 按鈕（漸層發光特效）
- **快速連結**:
  - [🌐 Open Dify] → http://localhost:82
  - [🧠 Open RAGFlow] → http://localhost:81
- **狀態指示燈**:
  - Backend API (綠色●運行中 / 灰色●停止 / 紅色●錯誤 / 橙色●啟動中)
  - Frontend (同上)
  - Docker (同上)
- **版本號**: v1.0.0 ENTERPRISE

### 📋 右側控制台 (70%)
- **黑色半透明背景**
- **綠色 Monospace 字體** (Consolas)
- **實時 Log 顯示** (ReadOnly)
- **自動滾動到底部**
- **[🗑️ Clear] 按鈕** 清空控制台

### 🧵 多線程架構
- **LauncherWorker(QThread)**: 異步執行啟動邏輯
- **Signal/Slot 機制**: 避免 UI 阻塞
  - `log_signal`: 發送 Log 訊息
  - `status_signal`: 更新服務狀態
  - `finished_signal`: 啟動完成通知

### 🔧 核心功能
1. **Docker 服務檢查**: 自動檢測 Docker Compose 狀態
2. **FastAPI 啟動**: 啟動 Uvicorn (port 8000)
3. **Vue 前端啟動**: 啟動 Vite Dev Server (port 5173)
4. **智能端口檢測**: `wait_for_port()` 函數主動偵測服務就緒
5. **外部連結**: 使用 `QDesktopServices.openUrl()` 打開瀏覽器

## 📸 UI 預覽

```
┌────────────────────────────────────────────────────────────┐
│ 🚀 BruV Enterprise Launcher              [─] [✕]          │
├──────────────┬────────────────────────────────────────────┤
│              │  📋 SYSTEM CONSOLE          [🗑️ Clear]     │
│   BruV       │ ┌──────────────────────────────────────┐   │
│ ENTERPRISE   │ │ 🎯 BruV Enterprise 啟動器            │   │
│              │ │ =============================        │   │
│ ┌──────────┐ │ │ 🐳 檢查 Docker 服務...              │   │
│ │🚀 START  │ │ │ ✅ Docker 服務運行中                │   │
│ │ SYSTEM   │ │ │ 🚀 啟動 FastAPI 後端服務...         │   │
│ └──────────┘ │ │ =============================        │   │
│              │ │ ✅ 後端服務已啟動 (PID: 12345)      │   │
│ ⚡ QUICK     │ │ ⏳ 等待服務在 localhost:8000 啟動..│   │
│   ACCESS     │ │ ✅ 服務已就緒 - 耗時 2.3s           │   │
│ ┌──────────┐ │ │ 🎨 啟動前端開發伺服器...            │   │
│ │🌐 Open   │ │ │ ✅ 前端服務已啟動 (PID: 12346)      │   │
│ │  Dify    │ │ │ ⏳ 等待服務在 localhost:5173...     │   │
│ └──────────┘ │ │ ✅ 服務已就緒 - 耗時 1.8s           │   │
│ ┌──────────┐ │ │                                      │   │
│ │🧠 Open   │ │ │ =============================        │   │
│ │ RAGFlow  │ │ │ 🎉 系統啟動完成！                   │   │
│ └──────────┘ │ │ =============================        │   │
│              │ │ 🔌 Backend:  http://localhost:8000  │   │
│ ⚙️ SYSTEM   │ │ 🎨 Frontend: http://localhost:5173  │   │
│   STATUS     │ │ 🌐 Dify:     http://localhost:82    │   │
│              │ │ 🧠 RAGFlow:  http://localhost:81    │   │
│ ● Backend    │ └──────────────────────────────────────┘   │
│ ● Frontend   │                                             │
│ ● Docker     │                                             │
│              │                                             │
│ v1.0.0       │                                             │
│ ENTERPRISE   │                                             │
└──────────────┴────────────────────────────────────────────┘
```

## 🎯 使用方式

1. **啟動系統**: 點擊 [🚀 START SYSTEM] 按鈕
2. **查看 Log**: 右側控制台實時顯示啟動過程
3. **監控狀態**: 左側狀態燈變為綠色表示服務運行中
4. **快速訪問**: 點擊 [🌐 Open Dify] 或 [🧠 Open RAGFlow] 開啟管理介面
5. **清空日誌**: 點擊 [🗑️ Clear] 清空控制台

## ⚠️ 注意事項

- **Windows 系統**: 使用 `taskkill` 停止進程
- **Unix 系統**: 使用 `SIGTERM` 信號
- **固定窗口大小**: 目前為 900x600 固定尺寸
- **無邊框拖曳**: 點擊標題列可拖曳移動視窗

## 🔄 與 CLI 版本對比

| 功能 | launcher.py (CLI) | launcher_gui.py (GUI) |
|------|-------------------|------------------------|
| 視覺化界面 | ❌ | ✅ Cyberpunk 主題 |
| 實時 Log | ✅ 控制台 | ✅ QTextEdit |
| 狀態監控 | ❌ | ✅ 狀態指示燈 |
| 快速連結 | ❌ | ✅ 按鈕一鍵開啟 |
| 多線程 | ❌ | ✅ QThread 異步 |
| 拖曳移動 | ❌ | ✅ 自定義標題列 |

## 🛠️ 技術棧

- **PySide6 6.6.1**: Qt for Python (GUI 框架)
- **Python 3.13**: 核心語言
- **QThread**: 多線程處理
- **Signal/Slot**: 異步通信
- **QSS**: 樣式表 (類似 CSS)

## 📝 開發日誌

**v1.0.0** (2026-02-01)
- ✅ 初始版本
- ✅ Cyberpunk 主題設計
- ✅ 左右分割佈局
- ✅ 多線程啟動邏輯
- ✅ 實時 Log 顯示
- ✅ 狀態指示燈
- ✅ 快速管理連結 (Dify/RAGFlow)
- ✅ 自定義標題列
- ✅ 智能端口檢測

---

**Made with 💜 by BruV AI Team**
