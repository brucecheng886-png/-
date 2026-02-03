# DifyChat.vue 組件使用說明

## 📋 功能概述

DifyChat.vue 是一個完整的 AI 對話介面組件，仿照 ChatGPT 風格設計，整合了 Dify API 並支援進階功能。

## ✅ 已實作功能

### 1️⃣ **API 整合**
- ✅ POST 到 `/api/dify/chat` 端點
- ✅ 符合 `DifyRequest` 模型格式：
  ```json
  {
    "query": "使用者問題",
    "user": "web_user",
    "conversation_id": "選填對話ID",
    "inputs": {}
  }
  ```
- ✅ 自動維持對話上下文 (conversation_id)
- ✅ 完整的錯誤處理和重試機制

### 2️⃣ **ChatGPT 風格 UI**
- ✅ 使用 Tailwind CSS 實作
- ✅ 用戶訊息：藍色氣泡靠右 (`bg-blue-500/90`)
- ✅ AI 訊息：深灰色氣泡靠左 (`bg-gray-800/90`)
- ✅ 頭像設計：用戶（人形圖標）、AI（鈴鐺圖標）
- ✅ 響應式佈局：`max-w-4xl mx-auto`

### 3️⃣ **體驗優化**
- ✅ **載入動畫**：三個跳動圓點 "Thinking..." 指示器
- ✅ **Markdown 渲染**：使用 `markdown-it` 庫完整支援
  - 標題 (H1-H6)
  - 粗體、斜體、行內代碼
  - 代碼塊 (```語法高亮```)
  - 列表 (有序、無序)
  - 引用塊
  - 表格
  - 連結
- ✅ **打字機效果**：30ms 字符延遲逐字顯示
- ✅ **自動滾動**：新訊息自動滾動到底部
- ✅ **快捷鍵**：
  - `Enter` - 發送訊息
  - `Shift+Enter` - 換行

### 4️⃣ **額外功能**
- ✅ 建議問題快速選擇
- ✅ 清空對話記錄
- ✅ 時間戳記錄
- ✅ 發送狀態顯示（禁用輸入、旋轉圖標）
- ✅ 玻璃擬態設計 (`backdrop-blur`)

## 📦 依賴項

### NPM 套件
```bash
npm install markdown-it
```

### CDN 引入（如果使用 CDN）
```html
<script src="https://cdn.jsdelivr.net/npm/markdown-it@13/dist/markdown-it.min.js"></script>
```

## 🚀 使用方式

### 基礎用法
```vue
<template>
  <DifyChat />
</template>

<script setup>
import DifyChat from './components/DifyChat.vue';
</script>
```

### 完整範例（帶容器）
```vue
<template>
  <div class="app-container">
    <header class="header">
      <h1>企業級 AI 助手</h1>
    </header>
    
    <main class="main-content">
      <DifyChat />
    </main>
  </div>
</template>

<script setup>
import DifyChat from './components/DifyChat.vue';
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
}

.header {
  padding: 16px;
  background: rgba(30, 30, 40, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.main-content {
  flex: 1;
  overflow: hidden;
}
</style>
```

## 🔌 API 對應

| 前端組件 | 後端路由 | 請求方法 | 功能 |
|---------|---------|---------|------|
| `DifyChat.vue` | `POST /api/dify/chat` | POST | 發送對話訊息 |
| `conversationId` | `GET /api/dify/conversations/{id}` | GET | 獲取對話歷史 |

## 🎨 UI 定制

### 修改主題顏色
```vue
<style scoped>
/* 修改用戶訊息顏色 */
.bg-blue-500\/90 {
  background: rgba(34, 211, 238, 0.9); /* 改為青色 */
}

/* 修改 AI 訊息顏色 */
.bg-gray-800\/90 {
  background: rgba(55, 65, 81, 0.9); /* 自定義灰色 */
}

/* 修改背景漸層 */
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #0f172a, #1e293b); /* 深藍主題 */
}
</style>
```

### 調整打字機速度
```javascript
// 在 typewriterEffect 函數中修改
const delay = 20; // 調整為 20ms（更快）或 50ms（更慢）
```

## 🐛 故障排除

### 1. 無法連接到後端
**症狀**：顯示「無法連接到後端服務」錯誤

**解決方案**：
```bash
# 確認 FastAPI 服務運行
cd BruV_Project
python -m uvicorn app_anytype:app --host 0.0.0.0 --port 8000 --reload

# 檢查 CORS 設定
# 在 app_anytype.py 中確認：
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Dify API 錯誤
**症狀**：收到「Dify API 請求失敗」錯誤

**解決方案**：
1. 檢查 `.env` 檔案中的 Dify 配置：
   ```env
   DIFY_API_URL=http://localhost:80/v1
   DIFY_API_KEY=your-api-key-here
   ```

2. 確認 Dify 服務運行：
   ```bash
   docker-compose up -d dify
   ```

3. 測試 API 連通性：
   ```bash
   curl -X POST http://localhost:80/v1/chat-messages \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query": "Hello", "user": "test"}'
   ```

### 3. Markdown 不顯示
**症狀**：AI 回覆的 Markdown 格式未正確渲染

**解決方案**：
```bash
# 確認已安裝 markdown-it
npm install markdown-it

# 或使用 yarn
yarn add markdown-it
```

### 4. 打字機效果卡頓
**症狀**：打字機效果不流暢或跳字

**解決方案**：
```javascript
// 調整延遲和分片大小
const typewriterEffect = async (message, fullText) => {
  message.displayText = '';
  message.typing = true;
  
  const chars = fullText.split('');
  const delay = 30; // 增加延遲
  const chunkSize = 1; // 每次渲染字符數
  
  for (let i = 0; i < chars.length; i += chunkSize) {
    message.displayText += chars.slice(i, i + chunkSize).join('');
    await new Promise(resolve => setTimeout(resolve, delay));
    scrollToBottom();
  }
  
  message.typing = false;
  message.content = fullText;
};
```

## 📊 API 請求格式範例

### 發送訊息
```javascript
POST http://127.0.0.1:8000/api/dify/chat

Request Body:
{
  "query": "如何使用知識圖譜？",
  "user": "web_user",
  "conversation_id": null,
  "inputs": {}
}

Response:
{
  "answer": "知識圖譜是一種結構化數據表示方式...",
  "conversation_id": "abc-123-def",
  "message_id": "msg-456"
}
```

## 🔐 安全性建議

1. **API Key 保護**：不要在前端代碼中直接暴露 Dify API Key
2. **CORS 限制**：生產環境應限制 CORS 來源
3. **速率限制**：實作 API 調用速率限制
4. **輸入驗證**：後端應驗證所有輸入參數

## 📈 性能優化

1. **虛擬滾動**：對話訊息超過 100 條時考慮使用虛擬滾動
2. **懶加載**：歷史訊息分頁加載
3. **WebSocket**：考慮使用 WebSocket 實現流式回覆
4. **快取**：本地緩存對話歷史

## 🎯 下一步計劃

- [ ] 支援語音輸入
- [ ] 圖片上傳和顯示
- [ ] 對話導出（Markdown/PDF）
- [ ] 多語言支援
- [ ] 深色/淺色主題切換
- [ ] 對話分支管理
- [ ] 代碼複製按鈕

## 📝 版本歷史

- **v1.0.0** (2026-01-31)
  - ✅ 初始版本
  - ✅ Dify API 整合
  - ✅ Markdown 渲染
  - ✅ 打字機效果
  - ✅ ChatGPT 風格 UI
