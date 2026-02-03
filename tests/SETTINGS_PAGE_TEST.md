# 系統設定頁面測試指南

## ✅ 已完成的工作

### 1. **創建設定頁面** - `frontend/src/views/Settings.vue`

**功能特性:**
- ✅ 深色玻璃擬態設計（與整體風格一致）
- ✅ Dify API Key 輸入框（支援顯示/隱藏密碼）
- ✅ RAGFlow API Key 輸入框（支援顯示/隱藏密碼）
- ✅ API URL 顯示（唯讀）
- ✅ 載入時調用 `GET /api/system/config`
- ✅ 儲存時調用 `POST /api/system/config`
- ✅ Toast 通知（成功/錯誤）
- ✅ 表單驗證
- ✅ 重新載入按鈕
- ✅ 響應式設計

### 2. **更新路由配置** - `frontend/src/router/index.js`

- ✅ 添加 `/settings` 路由
- ✅ 導入 `Settings.vue` 組件
- ✅ 設定路由 meta（title: '系統設定', icon: '⚙️'）

### 3. **更新主應用** - `frontend/src/App.vue`

- ✅ 將齒輪圖示轉換為 `<router-link to="/settings">`
- ✅ 添加 `text-decoration: none` 樣式確保鏈接外觀一致

---

## 🧪 測試步驟

### 前置條件

確保後端服務正在運行：

```powershell
cd BruV_Project
python launcher.py
```

### 步驟 1: 訪問設定頁面

1. 打開瀏覽器訪問 http://localhost:5173
2. 點擊右上角的 **齒輪圖示 (⚙️)**
3. 應該會跳轉到 `/settings` 路由
4. 頁面應該顯示「系統設定」標題

### 步驟 2: 檢查載入功能

頁面載入時應該：
- ✅ 顯示載入動畫（旋轉的圓圈）
- ✅ 調用 `GET /api/system/config`
- ✅ 顯示當前的 API URLs（唯讀）
- ✅ API Key 輸入框為空（後端返回的是遮蔽版本，不顯示）

**驗證方法:**
```powershell
# 查看網絡請求
# 打開瀏覽器開發者工具 (F12) -> Network 標籤
# 應該看到 GET /api/system/config 請求
```

### 步驟 3: 測試顯示/隱藏密碼

1. 在 Dify API Key 輸入框中輸入測試內容：`app-test123456`
2. 點擊右側的 **👁️ 按鈕**
3. 應該切換為 **🙈**，輸入框內容變為明文
4. 再次點擊應該切換回密碼模式

### 步驟 4: 測試表單驗證

**測試案例 1: 空表單提交**
```
1. 保持所有輸入框為空
2. 點擊「儲存設定」按鈕
3. 應該顯示錯誤 Toast: "請至少填寫一個 API Key"
```

**測試案例 2: 只填寫 Dify Key**
```
1. 在 Dify API Key 輸入: app-test123456
2. RAGFlow API Key 留空
3. 點擊「儲存設定」
4. 應該成功儲存
```

### 步驟 5: 測試儲存功能

**使用測試 API Key:**
```powershell
# 方法 1: 直接在設定頁面輸入
Dify API Key: app-test-key-12345
RAGFlow API Key: ragflow-test-key-67890
```

**預期行為:**
1. 點擊「儲存設定」按鈕
2. 按鈕文字變為「儲存中...」並顯示 ⏳
3. 調用 `POST /api/system/config`
4. 成功後顯示綠色 Toast: "✅ 設定已更新！建議重啟後端服務以確保生效"
5. 輸入框清空（因為已儲存）
6. Toast 5 秒後自動消失

### 步驟 6: 驗證 .env 文件更新

```powershell
# 查看 .env 文件內容
cat BruV_Project\.env

# 應該看到更新後的內容：
# DIFY_API_KEY=app-test-key-12345
# RAGFLOW_API_KEY=ragflow-test-key-67890
```

### 步驟 7: 測試重新載入功能

1. 修改 API Key 後不儲存
2. 點擊「重新載入」按鈕
3. 應該重新調用 `GET /api/system/config`
4. 輸入框恢復為空（或之前儲存的值）

### 步驟 8: 測試錯誤處理

**模擬後端錯誤:**
```powershell
# 停止後端服務
# Ctrl+C 在 launcher.py 終端
```

然後在設定頁面：
1. 輸入 API Key
2. 點擊「儲存設定」
3. 應該顯示紅色錯誤 Toast: "儲存失敗: ..."

---

## 🎨 UI 功能檢查清單

### 視覺效果
- ✅ 深色玻璃擬態背景
- ✅ 藍紫色漸變按鈕
- ✅ 平滑的過渡動畫
- ✅ Toast 通知從右側滑入
- ✅ 輸入框 focus 狀態藍色邊框
- ✅ 按鈕 hover 效果（向上移動 + 陰影）

### 交互功能
- ✅ 密碼顯示/隱藏切換
- ✅ 表單驗證
- ✅ 載入狀態（旋轉動畫）
- ✅ 儲存狀態（按鈕禁用 + 文字變化）
- ✅ Toast 自動消失
- ✅ 響應式設計（移動端友好）

### 數據流
```
1. 頁面載入
   └→ GET /api/system/config
       └→ 顯示 API URLs（唯讀）
       └→ 輸入框準備接收新 Key

2. 用戶輸入
   └→ hasChanges = true
   └→ 啟用「儲存設定」按鈕

3. 點擊儲存
   └→ 驗證至少有一個 Key
   └→ POST /api/system/config
       └→ 成功: 顯示 Toast + 清空輸入框
       └→ 失敗: 顯示錯誤 Toast
```

---

## 📋 API 測試

### 使用瀏覽器開發者工具

```javascript
// 在 Console 中測試

// 1. 獲取當前配置
fetch('/api/system/config')
  .then(r => r.json())
  .then(console.log);

// 2. 更新配置
fetch('/api/system/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dify_key: 'app-browser-test-123',
    ragflow_key: 'ragflow-browser-test-456'
  })
})
  .then(r => r.json())
  .then(console.log);
```

### 使用 cURL

```powershell
# 獲取配置
curl http://localhost:8000/api/system/config

# 更新配置
curl -X POST http://localhost:8000/api/system/config `
  -H "Content-Type: application/json" `
  -d '{\"dify_key\": \"app-curl-test-123\"}'
```

---

## 🐛 故障排查

### 問題 1: 齒輪圖示點擊無反應

**檢查:**
```javascript
// 檢查路由是否註冊
console.log(router.getRoutes());
// 應該包含 { path: '/settings', name: 'Settings' }
```

**解決方案:**
- 確認 `router/index.js` 已導入 `Settings.vue`
- 確認路由已添加到 `routes` 數組

### 問題 2: 頁面空白或載入失敗

**檢查:**
- 打開瀏覽器開發者工具 Console 標籤
- 查看是否有 JavaScript 錯誤

**常見原因:**
- 組件導入路徑錯誤
- API 基礎路徑設置錯誤

### 問題 3: API 請求失敗

**檢查:**
```powershell
# 確認後端正在運行
netstat -ano | findstr :8000

# 確認 CORS 設置正確
curl -I http://localhost:8000/api/system/config
```

### 問題 4: Toast 不顯示

**檢查:**
- Toast 的 z-index 是否足夠高（當前設置為 1000）
- CSS transition 是否正確

---

## 🎯 實際使用場景

### 場景 1: 首次配置

```
1. 啟動 Docker: docker compose up -d
2. 訪問 Dify Web: http://localhost:80
3. 創建應用並獲取 API Key
4. 在設定頁面貼上 API Key
5. 點擊儲存
6. 重啟後端服務
```

### 場景 2: 更新過期的 Key

```
1. 在 Dify Web UI 重新生成 API Key
2. 訪問設定頁面
3. 貼上新的 Key
4. 儲存並重啟服務
```

### 場景 3: 只更新單一服務

```
1. 只填寫 Dify 或 RAGFlow 其中一個
2. 另一個留空
3. 儲存時只更新填寫的那個
```

---

## 📖 相關文檔

- **後端 API 文檔**: http://localhost:8000/docs
- **系統 API 指南**: [SYSTEM_API_GUIDE.md](./SYSTEM_API_GUIDE.md)
- **Docker 設置指南**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)

---

**需要幫助？**
- 查看瀏覽器 Console 錯誤訊息
- 查看後端日誌輸出
- 檢查 Network 標籤的 API 請求
