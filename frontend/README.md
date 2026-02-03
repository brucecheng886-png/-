# BruV Frontend

🚀 **BruV Platform** 前端應用 - 基於 Vue 3 + Vite + Tailwind CSS

## 技術棧

- **框架**: Vue 3 (Composition API)
- **構建工具**: Vite 5
- **路由**: Vue Router 4
- **UI 庫**: Element Plus
- **圖表**: @antv/g6 (知識圖譜可視化)
- **樣式**: Tailwind CSS (深色玻璃擬態設計)
- **工具庫**: xlsx (Excel 處理), markdown-it (Markdown 渲染)

## 專案結構

```
frontend/
├── src/
│   ├── views/              # 頁面組件
│   │   ├── DifyChat.vue    # AI 對話介面
│   │   └── BatchRepair.vue # 批量資料處理
│   ├── components/         # 公共組件
│   │   ├── GraphView.vue   # 知識圖譜視圖
│   │   └── KnowledgeForm.vue # 實體建立表單
│   ├── router/             # 路由配置
│   │   └── index.js
│   ├── App.vue             # 根組件 (包含 Sidebar)
│   ├── main.js             # 入口文件
│   └── style.css           # 全域樣式
├── index.html              # HTML 模板
├── vite.config.js          # Vite 配置 (含 Proxy)
├── tailwind.config.js      # Tailwind 配置
├── postcss.config.js       # PostCSS 配置
└── package.json            # 依賴管理

## 快速開始

### 1. 安裝依賴

```bash
cd frontend
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

預設運行在: **http://localhost:5173**

### 3. 構建生產版本

```bash
npm run build
```

構建產物位於 `dist/` 目錄

## 功能模組

### 🤖 AI 對話 (`/chat`)
- ChatGPT 風格介面
- 打字機效果
- Markdown 渲染
- 對話歷史管理

### 📊 批量處理 (`/repair`)
- Excel 拖曳上傳
- 表格單元格編輯
- 批量資料保存

### 🕸️ 知識圖譜 (`/graph`)
- 視覺化圖譜展示
- 節點關係查詢
- 圖譜交互操作

### ➕ 建立實體 (`/create`)
- 實體資訊表單
- 批量建立支援

## API 代理配置

Vite 已配置代理，前端 `/api` 請求自動轉發至後端：

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true
  }
}
```

## 主題風格

採用 **深色玻璃擬態 (Dark Glassmorphism)** 設計：

- 背景：藍色-紫色漸層
- 組件：半透明毛玻璃效果
- 主色：`#3b82f6` (藍) + `#8b5cf6` (紫)

## 環境變數

創建 `.env` 文件配置：

```env
VITE_API_BASE_URL=/api
```

## 開發建議

- 使用 Vue DevTools 進行調試
- 熱更新已啟用 (HMR)
- 確保後端服務運行在 `http://localhost:8000`

## 部署

### Nginx 配置範例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/bruv-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 故障排除

### 1. `npm install` 失敗

```bash
# 清除緩存
npm cache clean --force
# 使用淘寶鏡像
npm install --registry=https://registry.npmmirror.com
```

### 2. API 請求 404

- 確認後端服務運行中
- 檢查 `vite.config.js` proxy 配置
- 查看瀏覽器 Network 面板

### 3. 組件樣式異常

```bash
# 重建 Tailwind
npm run dev
# 清除瀏覽器緩存
Ctrl + Shift + R
```

## 授權

MIT License - bruce © 2026
