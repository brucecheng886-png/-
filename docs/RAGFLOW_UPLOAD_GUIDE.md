# RAGFlow 文檔上傳功能使用指南

## 🎯 功能概述

系統現已整合 RAGFlow 文檔上傳功能，支持兩種上傳模式：

### 1️⃣ **AI 處理模式**（啟用 RAGFlow）
- ✅ 文檔上傳到 RAGFlow 知識庫進行深度語義分析
- ✅ 自動建立 AI 智能連線
- ✅ 同時存儲到 KuzuDB 知識圖譜
- ✅ 支持選擇不同的 RAGFlow 知識庫

### 2️⃣ **直接上傳模式**（關閉 AI 處理）
- ✅ 僅上傳到系統本地
- ✅ 快速處理，不進行 AI 分析
- ✅ 基於現有數據建立基礎關係

---

## 📋 使用流程

### 步驟 1: 選擇上傳模式

在 ImportPage 頁面，你會看到兩個主要選項：

#### 圖譜模式
- **建立新圖譜**: 創建新的知識圖譜
- **加入現有圖譜**: 添加到已有圖譜

#### AI 處理選項
- **AI 智能連線開關**: 
  - 🟢 **啟用**: 使用 RAGFlow + AI 分析
  - ⚫ **關閉**: 僅本地處理

### 步驟 2: 選擇 RAGFlow 知識庫（AI 模式）

當啟用 AI 智能連線後，會顯示 **RAGFlow 知識庫** 下拉選單：

```
📚 RAGFlow 知識庫
┌─────────────────────────────────┐
│ 不使用 RAGFlow（僅本地處理）    │
│ 醫療知識庫                       │
│ 技術文檔                         │
│ 客戶服務                         │
└─────────────────────────────────┘
```

- **不選擇知識庫**: 僅使用 AI Link，不上傳到 RAGFlow
- **選擇知識庫**: 文檔同時上傳到 RAGFlow 進行深度分析

### 步驟 3: 上傳文件

拖放文件或點擊上傳按鈕，系統將：

1. 保存文件到監控文件夾
2. 如果啟用 AI 且選擇了知識庫 → 上傳到 RAGFlow
3. 觸發 WatcherService 自動處理
4. 創建知識圖譜節點和關係

---

## 🔧 後端 API 參數

### POST /api/system/upload

```javascript
FormData {
  file: File,                      // 上傳的文件
  graph_id: "1",                   // 目標圖譜 ID
  graph_mode: "existing",          // 圖譜模式 (new/existing)
  graph_name: "我的圖譜",          // 新圖譜名稱（可選）
  enable_ai_link: "true",          // 啟用 AI 處理
  ragflow_dataset_id: "dataset123" // RAGFlow 知識庫 ID（可選）
}
```

### 響應格式

```json
{
  "success": true,
  "message": "✨ 檔案已上傳到 RAGFlow 並送入神經網路，正在 AI 分析中...",
  "filename": "document.pdf",
  "saved_path": "C:/BruV_Data/Auto_Import/document.pdf",
  "size": 1024000,
  "upload_time": "2026-02-05T01:00:00",
  "ai_enabled": true,
  "ragflow_processed": true
}
```

---

## 📊 數據流程圖

### AI 處理模式
```
用戶上傳文件
    ↓
保存到 Auto_Import 文件夾
    ↓
【RAGFlow 處理】
    ↓ 上傳到知識庫
    ↓ 語義分析
    ↓ 向量化
    ↓
【本地處理】
    ↓ WatcherService 監控
    ↓ 解析文件內容
    ↓ 創建 KuzuDB 節點
    ↓ AI 智能連線
    ↓
完成入庫
```

### 直接上傳模式
```
用戶上傳文件
    ↓
保存到 Auto_Import 文件夾
    ↓
【本地處理】
    ↓ WatcherService 監控
    ↓ 解析文件內容
    ↓ 創建 KuzuDB 節點
    ↓ 基礎關係連線
    ↓
完成入庫
```

---

## 🛠️ 配置 RAGFlow

### 1. 啟動 RAGFlow 服務

```bash
# 確保 RAGFlow 服務正在運行
docker-compose up -d ragflow
```

### 2. 配置 API 密鑰

在 Settings 頁面配置：

- **RAGFlow API URL**: `http://localhost:81/api/v1`
- **RAGFlow API Key**: 從 RAGFlow Web UI 獲取

### 3. 創建知識庫

訪問 `http://localhost:81` 創建知識庫並記錄 Dataset ID

---

## 💡 使用建議

### 何時使用 AI 處理模式？
- ✅ 需要深度語義理解
- ✅ 文檔內容複雜，需要 AI 提取關鍵信息
- ✅ 需要與其他 AI 功能（如對話、檢索）集成
- ✅ 文檔量大，需要向量檢索

### 何時使用直接上傳模式？
- ✅ 快速批量導入
- ✅ 文檔結構簡單（如 Excel 表格）
- ✅ 不需要 AI 分析
- ✅ 本地測試環境

---

## ⚠️ 注意事項

1. **RAGFlow 服務狀態**: 如果 RAGFlow 未啟動，AI 模式會自動降級為本地處理
2. **知識庫選擇**: 建議為不同類型的文檔創建不同的知識庫
3. **文件大小**: RAGFlow 支持最大 10MB 的文件（可調整）
4. **處理時間**: AI 分析需要額外時間，請耐心等待

---

## 🔍 故障排除

### 問題: RAGFlow 上傳失敗

**可能原因:**
- RAGFlow 服務未啟動
- API Key 配置錯誤
- 知識庫 ID 無效

**解決方案:**
1. 檢查後端日誌: 查看 `⚠️ RAGFlow 上傳失敗` 錯誤信息
2. 驗證 API 配置: Settings 頁面測試連接
3. 確認知識庫: 在 RAGFlow Web UI 驗證知識庫存在

### 問題: 文件未進入圖譜

**可能原因:**
- WatcherService 未啟動
- 文件格式不支持

**解決方案:**
1. 檢查支持的格式: `.pdf`, `.xlsx`, `.txt`, `.docx`, `.md`
2. 查看後端日誌確認 WatcherService 狀態
3. 手動觸發處理: 重新上傳文件

---

## 🎉 功能特點

- ✅ **雙軌處理**: RAGFlow + KuzuDB 並行
- ✅ **智能降級**: RAGFlow 失敗時自動本地處理
- ✅ **靈活選擇**: 用戶可自主決定是否使用 AI
- ✅ **多知識庫**: 支持多個 RAGFlow 知識庫
- ✅ **無縫集成**: 與現有圖譜功能完美結合

---

**更新時間**: 2026-02-05  
**版本**: v1.0.0
