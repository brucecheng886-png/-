# 🔗 API 串接說明文件

## 📡 已實現的 API 端點

### 1. 創建單個實體
```http
POST http://127.0.0.1:8000/api/graph/create
Content-Type: application/json

{
  "id": "ENT-0001",
  "name": "張三",
  "type": "Person",
  "description": "測試實體",
  "properties": {}
}
```

**響應示例:**
```json
{
  "success": true,
  "message": "實體 '張三' 創建成功",
  "entity_id": "ENT-0001",
  "data": {
    "id": "ENT-0001",
    "name": "張三",
    "type": "Person",
    "description": "測試實體"
  }
}
```

### 2. 批量創建實體
```http
POST http://127.0.0.1:8000/api/graph/batch-create
Content-Type: application/json

{
  "entities": [
    {
      "id": "ENT-0001",
      "name": "張三",
      "type": "Person",
      "description": "測試實體1"
    },
    {
      "id": "ENT-0002",
      "name": "李四",
      "type": "Person",
      "description": "測試實體2"
    }
  ]
}
```

**響應示例:**
```json
{
  "success": true,
  "message": "批量創建完成: 成功 2 個，失敗 0 個",
  "entity_id": null,
  "data": {
    "success_count": 2,
    "failed_count": 0,
    "total": 2
  }
}
```

### 3. 健康檢查
```http
GET http://127.0.0.1:8000/api/health
```

**響應示例:**
```json
{
  "status": "healthy",
  "services": {
    "fastapi": "running",
    "kuzu": "unavailable",
    "dify": "http://localhost:80/v1",
    "ragflow": "http://localhost:9380/api/v1"
  },
  "message": "KuzuDB 圖譜功能可能因 Windows 編碼問題而不可用"
}
```

## 🎨 前端組件說明

### 1. KnowledgeForm.vue - 單個實體創建表單
**位置:** `frontend/src/components/KnowledgeForm.vue`

**功能:**
- ✅ 表單驗證
- ✅ API 健康狀態檢查
- ✅ Loading 狀態管理
- ✅ 錯誤處理和提示
- ✅ 範例資料填充
- ✅ 深色玻璃擬態設計

**使用方法:**
```vue
<template>
  <KnowledgeForm />
</template>

<script setup>
import KnowledgeForm from './components/KnowledgeForm.vue';
</script>
```

### 2. BatchRepair.vue - 批量修復表格
**位置:** `frontend/src/components/BatchRepair.vue`

**功能:**
- ✅ Excel 式編輯
- ✅ 批量儲存到後端
- ✅ 10 筆假資料
- ✅ 修改追蹤
- ✅ 統計顯示
- ✅ 深色主題

**API 整合:**
- 使用 `fetch` API
- 端點: `POST http://127.0.0.1:8000/api/graph/batch-create`
- 自動處理修改的行並批量提交

### 3. GraphView.vue - 知識圖譜可視化
**位置:** `frontend/src/components/GraphView.vue`

**功能:**
- ✅ @antv/g6 圖譜渲染
- ✅ Force 力導向佈局
- ✅ 互動式拖曳和縮放
- ✅ 透明背景
- ✅ 藍色主題

## 🚀 快速測試

### 方法 1: 使用內建的簡易前端
1. 確保後端運行中: `http://127.0.0.1:8000`
2. 瀏覽器訪問: `http://127.0.0.1:8000`
3. 點擊側邊欄「知識圖譜」測試創建實體

### 方法 2: 使用 curl 測試
```bash
# 健康檢查
curl http://127.0.0.1:8000/api/health

# 創建實體
curl -X POST http://127.0.0.1:8000/api/graph/create \
  -H "Content-Type: application/json" \
  -d '{"id":"TEST-001","name":"測試實體","type":"Person","description":"測試"}'

# 批量創建
curl -X POST http://127.0.0.1:8000/api/graph/batch-create \
  -H "Content-Type: application/json" \
  -d '{"entities":[{"id":"TEST-001","name":"張三","type":"Person"},{"id":"TEST-002","name":"李四","type":"Company"}]}'
```

### 方法 3: 使用 Python requests
```python
import requests

# 創建單個實體
response = requests.post(
    'http://127.0.0.1:8000/api/graph/create',
    json={
        'id': 'ENT-0001',
        'name': '張三',
        'type': 'Person',
        'description': '測試實體'
    }
)
print(response.json())
```

## ⚙️ CORS 配置

後端已配置 CORS，允許以下來源:
- `http://localhost:8000`
- `http://127.0.0.1:8000`
- `http://localhost:8001`
- `http://127.0.0.1:8001`
- 所有其他來源 (開發環境)

## 🐛 常見問題

### 1. CORS 錯誤
**錯誤:** `Access to fetch at 'http://127.0.0.1:8000/api/graph/create' from origin 'http://localhost:8001' has been blocked by CORS policy`

**解決:** 後端已配置 CORS，如果仍有問題，請重啟後端服務。

### 2. KuzuDB 不可用
**錯誤:** `知識圖譜服務暫時不可用 (KuzuDB 未初始化)`

**說明:** Windows 上 KuzuDB 可能有編碼問題，但 API 端點仍然可用，只是實際的圖譜儲存會失敗。

**臨時解決:** API 會返回適當的錯誤訊息，前端可以正常測試請求/響應流程。

### 3. 後端連接失敗
**錯誤:** `Failed to fetch` 或 `Network Error`

**檢查:**
1. 後端是否運行: `curl http://127.0.0.1:8000/api/health`
2. 端口是否正確: 確認使用 8000
3. 防火牆設置

## 📦 完整的依賴安裝

### 前端 (如果使用 Vue CLI/Vite)
```bash
npm install element-plus @element-plus/icons-vue @antv/g6 axios
```

### 後端 (已包含在 requirements.txt)
```bash
pip install fastapi uvicorn pydantic pydantic-settings httpx
```

## 🎯 下一步

1. ✅ 前後端 API 串接完成
2. ⏳ 修復 KuzuDB Windows 編碼問題
3. ⏳ 完善圖譜查詢功能
4. ⏳ 添加關係創建 API
5. ⏳ 整合 Dify 和 RAGFlow 工作流

## 📝 API 文檔

完整的 API 文檔可在以下地址查看:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
