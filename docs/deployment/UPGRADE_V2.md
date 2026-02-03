# 🎨 BruV Enterprise Launcher v2.0 升級說明

## 🆕 版本更新 (v1.0 → v2.0)

**發布日期**: 2026-02-01

---

## ✨ 主要更新

### 1️⃣ **UI 視覺全面升級 - Deep Navy Theme**

#### 🎨 配色方案改革
**舊版 (Cyberpunk)** → **新版 (Deep Navy)**

| 元素 | 舊版顏色 | 新版顏色 | 變化 |
|------|----------|----------|------|
| 主視窗背景 | `#1e1e2d → #282a36` | `#0f172a → #1e293b` | 更深邃的海軍藍 |
| 側邊欄 | `rgba(30, 30, 45, 0.8)` | `rgba(15, 23, 42, 0.95)` | 更高透明度 |
| 強調色 | `#ff79c6` (粉紫) | `#6366f1` (靛藍) | 更專業的企業色 |
| 次要強調 | `#8be9fd` (青色) | `#818cf8` (淺靛藍) | 統一色系 |
| Console 背景 | `rgba(0, 0, 0, 0.7)` | `#020617` (深黑藍) | 更深的對比 |
| Console 文字 | `#00ff00` (綠色) | `#22d3ee` (螢光青) | 更柔和的視覺 |

#### 🖼️ 視覺設計優化
- ✅ 主視窗邊框從粉紫改為靛藍 (`#6366f1`)
- ✅ 標題列與網頁版配色一致
- ✅ 側邊欄使用半透明深藍（更有層次感）
- ✅ 所有按鈕改用靛藍/紫色系漸層

---

### 2️⃣ **新增功能按鈕**

#### 🚀 **[Open BruV AI]** 按鈕
**位置**: QUICK ACCESS 區域最上方  
**功能**: 一鍵開啟 BruV AI 前端 (http://localhost:5173)  
**樣式**: 
- 使用 `#primaryLinkBtn` 樣式（最顯眼）
- 靛藍色強調邊框 (`#6366f1`)
- Hover 時發光效果
- 高度 45px（比其他連結按鈕更大）

**代碼**:
```python
bruv_btn = QPushButton("🚀 Open BruV AI")
bruv_btn.setObjectName("primaryLinkBtn")
bruv_btn.setFixedHeight(45)
bruv_btn.clicked.connect(lambda: self.open_url("http://localhost:5173"))
```

#### 🛑 **[STOP SYSTEM]** 按鈕
**位置**: START SYSTEM 按鈕正下方  
**功能**: 停止所有運行中的服務  
**樣式**:
- 紅色漸層 (`#ef4444 → #b91c1c`)
- 警告色系（表示危險操作）
- 初始狀態 Disabled（灰色）
- 系統啟動後自動 Enabled

**代碼**:
```python
self.stop_btn = QPushButton("🛑 STOP SYSTEM")
self.stop_btn.setObjectName("stopBtn")
self.stop_btn.setFixedHeight(50)
self.stop_btn.setEnabled(False)  # 初始禁用
self.stop_btn.clicked.connect(self.stop_system)
```

---

### 3️⃣ **Start/Stop 邏輯優化**

#### 🟢 **start_system() 改進**
```python
def start_system(self):
    # 更新按鈕狀態
    self.start_btn.setEnabled(False)          # 禁用啟動按鈕
    self.start_btn.setText("⚙️ STARTING...")
    self.stop_btn.setEnabled(False)           # 啟動期間暫時禁用停止
    
    # ... 啟動邏輯 ...
```

#### 🔴 **stop_system() 新增**
```python
def stop_system(self):
    # 檢查系統是否運行
    if not self.worker or not self.worker.isRunning():
        self.append_log("⚠️  系統未運行...")
        return
    
    # 更新 UI
    self.stop_btn.setEnabled(False)
    self.stop_btn.setText("⏳ STOPPING...")
    
    # 停止服務
    self.worker.stop()
    self.worker.wait(5000)  # 等待 5 秒
    
    # 重置狀態燈
    self.backend_status.set_status("stopped")
    self.frontend_status.set_status("stopped")
    
    # 重置按鈕
    self.start_btn.setEnabled(True)
    self.start_btn.setText("🚀 START SYSTEM")
    self.stop_btn.setEnabled(False)
    self.stop_btn.setText("🛑 STOP SYSTEM")
```

#### ✅ **on_launch_finished() 回調優化**
```python
def on_launch_finished(self, success):
    if success:
        self.start_btn.setText("✅ RUNNING")
        self.stop_btn.setEnabled(True)  # 啟動成功後啟用停止按鈕
    else:
        self.start_btn.setText("❌ FAILED")
        self.start_btn.setEnabled(True)   # 失敗後重新啟用啟動按鈕
        self.stop_btn.setEnabled(False)   # 確保停止按鈕禁用
```

---

## 🎯 使用流程

### 標準啟動流程
1. 點擊 **[🚀 START SYSTEM]** → 按鈕變為 "⚙️ STARTING..."
2. 系統開始啟動 → 狀態燈逐漸變綠
3. 啟動完成 → 按鈕變為 "✅ RUNNING"，**[🛑 STOP SYSTEM]** 按鈕啟用

### 標準停止流程
1. 點擊 **[🛑 STOP SYSTEM]** → 按鈕變為 "⏳ STOPPING..."
2. 系統開始停止 → Console 顯示 "🛑 正在停止系統..."
3. 停止完成 → **[🚀 START SYSTEM]** 重新啟用，停止按鈕禁用

### 快速訪問流程
- 點擊 **[🚀 Open BruV AI]** → 瀏覽器開啟 http://localhost:5173
- 點擊 **[🌐 Open Dify]** → 瀏覽器開啟 http://localhost:82
- 點擊 **[🧠 Open RAGFlow]** → 瀏覽器開啟 http://localhost:81

---

## 📊 UI 佈局變化

### 舊版 v1.0
```
├─ 🚀 START SYSTEM (60px 高)
├─ ⚡ QUICK ACCESS
│  ├─ 🌐 Open Dify
│  └─ 🧠 Open RAGFlow
└─ ⚙️ SYSTEM STATUS
```

### 新版 v2.0
```
├─ 🚀 START SYSTEM (60px 高) - 靛藍漸層
├─ 🛑 STOP SYSTEM (50px 高) - 紅色漸層 [NEW]
├─ ⚡ QUICK ACCESS
│  ├─ 🚀 Open BruV AI (45px 高) - 主要強調 [NEW]
│  ├─ 🌐 Open Dify (40px 高)
│  └─ 🧠 Open RAGFlow (40px 高)
└─ ⚙️ SYSTEM STATUS
```

---

## 🎨 QSS 樣式更新摘要

### 新增樣式類別
```css
/* 停止按鈕樣式 */
#stopBtn {
    background: qlineargradient(
        x1:0, y1:0, x2:1, y2:0,
        stop:0 #ef4444, stop:1 #b91c1c
    );
    /* ... */
}

/* 主要連結按鈕樣式 */
#primaryLinkBtn {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border: 2px solid rgba(99, 102, 241, 0.5);
    /* ... */
}
```

### 修改的樣式
- `#mainWidget`: 背景從 `#1e1e2d` 改為 `#0f172a`
- `#sidebar`: 背景從 `rgba(30, 30, 45, 0.8)` 改為 `rgba(15, 23, 42, 0.95)`
- `#startBtn`: 漸層從粉紫改為靛藍紫
- `#consoleText`: 文字顏色從 `#00ff00` 改為 `#22d3ee`
- 滾動條: 顏色從青色改為靛藍色

---

## 🔧 技術實現細節

### 按鈕狀態管理
```python
# 初始狀態
self.start_btn.setEnabled(True)   # 啟動按鈕: 啟用
self.stop_btn.setEnabled(False)   # 停止按鈕: 禁用

# 啟動中
self.start_btn.setEnabled(False)  # 防止重複點擊
self.stop_btn.setEnabled(False)   # 啟動期間不可停止

# 運行中
self.start_btn.setEnabled(False)  # 已運行，不可重複啟動
self.stop_btn.setEnabled(True)    # 允許停止

# 停止中
self.start_btn.setEnabled(False)  # 停止期間不可啟動
self.stop_btn.setEnabled(False)   # 防止重複點擊

# 停止完成
self.start_btn.setEnabled(True)   # 可重新啟動
self.stop_btn.setEnabled(False)   # 停止狀態
```

### 服務停止流程
1. 呼叫 `worker.stop()` 設置停止標誌
2. `worker.wait(5000)` 等待執行緒結束（最多 5 秒）
3. 重置 Backend/Frontend 狀態燈為 "stopped"
4. 在 Console 輸出停止完成訊息
5. 重置所有按鈕到初始狀態

---

## 🚀 啟動方式

**基本啟動**:
```bash
cd "c:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\BruV_Project"
python launcher_gui.py
```

**使用虛擬環境**:
```powershell
& "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/.venv/Scripts/Activate.ps1"
python launcher_gui.py
```

---

## 📝 版本對比

| 功能 | v1.0 | v2.0 |
|------|------|------|
| 主題配色 | Cyberpunk 粉紫 | Deep Navy 靛藍 |
| 停止系統按鈕 | ❌ | ✅ |
| BruV AI 快速連結 | ❌ | ✅ |
| 按鈕狀態管理 | 基礎 | 完整邏輯 |
| Console 配色 | 綠色終端 | 螢光青終端 |
| 視窗標題 | v1.0 | v2.0 |
| 底部版本號 | v1.0.0 | v2.0.0 |

---

## 🎉 升級完成！

現在您可以：
1. ✅ 使用 Deep Navy 企業級主題
2. ✅ 一鍵啟動/停止系統
3. ✅ 快速訪問 BruV AI、Dify、RAGFlow
4. ✅ 享受更優雅的 UI 體驗

**Made with 💙 by BruV AI Team**
