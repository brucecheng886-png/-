# 📤 檔案上傳功能說明

## ✅ 已完成的修改

### 1. **後端 API (app_anytype.py)**

#### 新增的 API 端點

**單檔上傳:**
```
POST /api/upload/file
Content-Type: multipart/form-data

參數:
- file: 上傳的檔案 (必填)
- target_folder: 目標資料夾 (可選，預設: C:/BruV_Data/Auto_Import)

回應:
{
  "success": true,
  "message": "檔案上傳成功",
  "filename": "example.pdf",
  "saved_path": "C:/BruV_Data/Auto_Import/example.pdf",
  "size": 1024000,
  "upload_time": "2026-02-04T12:00:00"
}
```

**批次上傳:**
```
POST /api/upload/multiple
Content-Type: multipart/form-data

參數:
- files[]: 多個上傳檔案

回應:
{
  "success": true,
  "total": 3,
  "success_count": 3,
  "error_count": 0,
  "results": [...]
}
```

#### 功能特點

- ✅ 自動創建上傳目錄
- ✅ 檔案名稱衝突處理（自動添加時間戳）
- ✅ 完整的錯誤處理
- ✅ 支援批次上傳
- ✅ 檔案大小記錄
- ✅ 上傳時間記錄

### 2. **前端介面 (FileImport.vue)**

#### 頁面路由
```
路徑: /file-import
名稱: FileImport
圖示: 📤
```

#### 功能特點

**拖曳上傳:**
- ✅ 視覺化拖曳區域
- ✅ 拖曳狀態即時反饋
- ✅ 支援多檔案拖曳

**檔案管理:**
- ✅ 檔案列表顯示（名稱、大小、圖示）
- ✅ 單檔移除功能
- ✅ 批次清空功能
- ✅ 重複檔案過濾

**上傳功能:**
- ✅ 批次上傳
- ✅ 進度條顯示
- ✅ 上傳計數器
- ✅ 即時結果反饋

**視覺效果:**
- ✅ Anytype 主題配色
- ✅ 深色模式支援
- ✅ 動畫效果（bounce、scale）
- ✅ 漸層背景
- ✅ 響應式設計

**支援格式:**
- 📕 PDF (.pdf)
- 📘 DOCX (.docx)
- 📊 XLSX (.xlsx)
- 📄 TXT (.txt)
- 📝 Markdown (.md)

### 3. **路由配置更新**

已在 `frontend/src/router/index.js` 中添加：
```javascript
{
  path: '/file-import',
  name: 'FileImport',
  component: FileImport,
  meta: {
    title: '檔案上傳',
    icon: '📤'
  }
}
```

## 🚀 使用方式

### 啟動服務

1. **啟動後端:**
```bash
cd BruV_Project
python app_anytype.py
```

2. **啟動前端:**
```bash
cd frontend
npm run dev
```

3. **訪問頁面:**
```
http://localhost:5173/file-import
```

### 操作流程

1. **拖曳上傳:**
   - 將檔案拖曳到上傳區域
   - 或點擊區域選擇檔案

2. **確認檔案:**
   - 查看已選擇的檔案列表
   - 可移除不需要的檔案

3. **執行上傳:**
   - 點擊「開始上傳」按鈕
   - 等待進度條完成

4. **查看結果:**
   - 成功/失敗的檔案清單
   - 儲存路徑資訊

## 📁 檔案存儲

**預設上傳目錄:**
```
C:/BruV_Data/Auto_Import/
```

**自動觸發監控:**
- 檔案上傳後會自動觸發監控服務
- 監控服務會將檔案上傳至 RAGFlow
- Excel 檔案會自動解析並創建圖譜節點

## 🔧 進階配置

### 修改上傳目錄

**方法 1: 前端修改**
```javascript
// 在 FileImport.vue 的 uploadFiles() 方法中
formData.append('target_folder', 'D:/CustomPath');
```

**方法 2: API 參數**
```javascript
const response = await fetch('http://localhost:8000/api/upload/file?target_folder=D:/CustomPath', {
  method: 'POST',
  body: formData
});
```

### 添加檔案類型

**後端 (app_anytype.py):**
```python
# 修改 upload_file 函數的邏輯
```

**前端 (FileImport.vue):**
```html
<!-- 修改 accept 屬性 -->
<input accept=".pdf,.txt,.md,.docx,.xlsx,.csv,.json" />
```

## 🐛 常見問題

### 1. 上傳失敗: 權限錯誤
**解決:** 確保目標目錄存在且有寫入權限
```bash
# 創建目錄
mkdir C:\BruV_Data\Auto_Import

# 檢查權限
icacls C:\BruV_Data\Auto_Import
```

### 2. CORS 錯誤
**解決:** 確認後端 CORS 配置包含前端地址
```python
# app_anytype.py 已配置
allow_origins=["*"]  # 開發環境
```

### 3. 大檔案上傳超時
**解決:** 調整 Uvicorn 超時設定
```python
uvicorn.run(
    "app_anytype:app",
    timeout_keep_alive=300  # 增加超時時間
)
```

## 📊 測試建議

### 單元測試
```bash
# 測試上傳 API
curl -X POST "http://localhost:8000/api/upload/file" \
  -F "file=@test.pdf"
```

### 功能測試
- ✅ 單檔上傳
- ✅ 多檔上傳
- ✅ 拖曳上傳
- ✅ 重複檔案處理
- ✅ 大檔案上傳（>10MB）
- ✅ 特殊字元檔名
- ✅ 中文檔名

## 🎨 UI/UX 特點

- **視覺反饋:** 拖曳時區域變色、放大
- **進度顯示:** 實時進度條和計數器
- **結果展示:** 成功/失敗清晰區分
- **響應式:** 適配桌面和平板
- **深色模式:** 完整支援深色主題
- **動畫效果:** 平滑的過渡動畫

## 🔗 相關文件

- [監控服務文件](../backend/services/watcher.py)
- [圖譜 API 文件](../backend/api/graph.py)
- [RAGFlow 整合](../backend/rag_client.py)

---

**更新日期:** 2026-02-04  
**版本:** v1.0.0  
**作者:** BruV Team
