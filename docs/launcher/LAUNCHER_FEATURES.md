# 🚀 BruV Enterprise Desktop Launcher - 功能說明

## 📋 概述

BruV Enterprise Launcher 是一個基於 PySide6 的專業桌面啟動器，提供視覺化的系統管理介面。

## ✨ 核心功能

### 1️⃣ 智慧啟動/停止系統
- **單一按鈕切換**：自動根據系統狀態切換為「啟動」或「停止」
- **狀態視覺化**：
  - 🔵 閒置（Idle）→ 藍紫色漸層
  - 🟠 啟動中（Starting）→ 灰色禁用
  - 🔴 運行中（Running）→ 紅色漸層
  - 🟡 停止中（Stopping）→ 灰色禁用

### 2️⃣ 多語言支援
- **語言選項**：
  - 🇹🇼 中文（繁體）
  - 🇺🇸 English
- **動態切換**：即時更新所有 UI 文字
- **翻譯範圍**：按鈕、標籤、日誌、狀態訊息

### 3️⃣ 即時狀態監控
- **服務狀態燈**：
  - ● 綠色 = 運行中
  - ● 灰色 = 已停止
  - ● 紅色 = 錯誤
  - ● 橙色 = 啟動中
- **監控服務**：
  - Backend API (Port 8000)
  - Frontend (Port 5173)
  - Docker Services (Dify/RAGFlow)

### 4️⃣ 快速連結面板
- **主要服務**：
  - 🚀 BruV AI → http://localhost:5173
  - 🌐 Dify → http://localhost:82
  - 🧠 RAGFlow → http://localhost:81
- **一鍵開啟**：自動在瀏覽器中開啟對應服務

### 5️⃣ 實時控制台
- **彩色日誌輸出**：
  - 青色 (#22d3ee) Monospace 字體
  - 黑色背景 (#020617)
- **自動捲動**：新日誌自動顯示在底部
- **清空功能**：一鍵清除所有日誌

### 6️⃣ 服務自動啟動
- **啟動流程**：
  1. 檢查 Docker 服務狀態
  2. 啟動 FastAPI 後端（Port 8000）
  3. 等待後端就緒（最多 60 秒）
  4. 啟動 Vue 前端（Port 5173）
  5. 等待前端就緒（最多 60 秒）
- **智慧等待**：自動偵測端口開啟狀態
- **錯誤處理**：超時自動標記失敗

### 7️⃣ 優雅停止機制
- **進程管理**：追蹤所有子進程
- **強制終止**：Windows 使用 taskkill /F /T
- **狀態重置**：所有狀態燈恢復灰色

## 🎨 設計特色

### Deep Navy Cyberpunk 主題
- **無邊框視窗**：900x600 px
- **半透明背景**：深藍色漸層 (#0f172a → #1e293b)
- **霓虹邊框**：藍紫色 (#6366f1) 2px
- **圓角設計**：15px 邊角
- **Fusion 樣式**：現代化 Qt 介面

### 自定義標題列
- **拖曳支援**：點擊標題列任意位置拖動視窗
- **最小化按鈕**：─
- **關閉按鈕**：✕ (Hover 變紅色)

### 響應式佈局
- **左側邊欄**（30%）：控制面板
- **右側控制台**（70%）：日誌輸出

## 📦 使用方式

### 啟動 GUI 啟動器

```powershell
# 1. 切換到專案目錄
cd "c:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\BruV_Project"

# 2. 啟動虛擬環境
& "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/.venv/Scripts/Activate.ps1"

# 3. 安裝依賴（首次運行）
pip install PySide6==6.6.1

# 4. 啟動 GUI
python launcher_gui.py
```

### 使用流程

1. **啟動系統**
   - 點擊 [🚀 啟動系統] 按鈕
   - 等待所有服務就緒（約 10-30 秒）
   - 觀察狀態燈變綠

2. **開啟服務**
   - 點擊 [🚀 開啟 BruV AI] → 前端介面
   - 點擊 [🌐 開啟 Dify] → Dify 平台
   - 點擊 [🧠 開啟 RAGFlow] → RAGFlow 平台

3. **停止系統**
   - 點擊 [🛑 停止系統] 按鈕
   - 等待所有服務停止
   - 觀察狀態燈變灰

4. **切換語言**
   - 點擊語言下拉選單
   - 選擇 「中文」或「English」
   - UI 即時更新

## 🔧 技術架構

### 主要組件

#### 1. `LauncherWorker` (QThread)
- **作用**：在背景執行緒中啟動服務
- **避免**：阻塞 UI 主執行緒
- **訊號**：
  - `log_signal` → 發送日誌訊息
  - `status_signal` → 更新服務狀態
  - `finished_signal` → 啟動完成

#### 2. `StatusIndicator` (QWidget)
- **作用**：狀態指示燈組件
- **方法**：
  - `set_status(status)` → 設置顏色
  - `update_label(text)` → 更新標籤

#### 3. `BruVLauncherGUI` (QMainWindow)
- **作用**：主視窗控制器
- **屬性**：
  - `current_language` → 當前語言
  - `is_system_running` → 系統運行狀態
  - `worker` → 背景工作執行緒
- **方法**：
  - `t(key)` → 翻譯鍵值
  - `switch_language(lang_code)` → 切換語言
  - `toggle_system()` → 智慧切換啟動/停止
  - `set_button_state(state)` → 更新按鈕狀態

### 端口配置

| 服務 | 端口 | 檢查超時 |
|------|------|----------|
| Backend API | 8000 | 60s |
| Frontend | 5173 | 60s |
| Dify | 82 | N/A |
| RAGFlow | 81 | N/A |

## 📝 配置文件

### 語言字典 (LANGUAGES)
```python
LANGUAGES = {
    "zh_TW": { ... },  # 繁體中文
    "en_US": { ... }   # 英文
}
```

### QSS 樣式表
- Deep Navy 漸層背景
- 霓虹色按鈕（藍紫/紅色）
- 半透明面板
- Monospace 控制台

## 🚨 錯誤處理

### 啟動失敗處理
- 顯示 [❌ 啟動失敗]
- 3 秒後自動恢復為 [🚀 啟動系統]
- 狀態燈保持在錯誤狀態

### 超時處理
- Backend 超時：停止啟動流程
- Frontend 超時：顯示警告但繼續
- 超時日誌：紅色 ❌ 標記

### 進程管理
- 自動追蹤所有子進程
- 視窗關閉時強制停止所有服務
- Windows 使用 taskkill /F /T 強制終止

## 🎯 最佳實踐

### 1. 啟動前準備
- ✅ 確保 Docker Desktop 已運行
- ✅ 確保 .venv 虛擬環境已啟動
- ✅ 確保端口 5173/8000 未被佔用

### 2. 日常使用
- 💡 使用 GUI 啟動器代替手動命令
- 💡 觀察控制台日誌排查問題
- 💡 使用快速連結開啟服務

### 3. 問題排查
- 🔍 檢查控制台紅色錯誤訊息
- 🔍 確認 Docker 狀態燈為綠色
- 🔍 手動測試端口連接：`telnet localhost 8000`

## 🔮 未來功能計劃

- [ ] 系統資源監控（CPU/記憶體）
- [ ] 服務健康檢查（定期 Ping）
- [ ] 配置檔編輯器
- [ ] 日誌導出功能
- [ ] 多主題支援（Light/Dark/Cyberpunk）
- [ ] 托盤圖標最小化
- [ ] 開機自動啟動選項

## 📄 版本資訊

- **當前版本**：v3.0.0 企業版
- **發布日期**：2026-02-01
- **框架**：PySide6 6.6.1
- **Python 版本**：3.11+

---

**BruV Enterprise** - 打造專業級 AI 應用平台 🚀
