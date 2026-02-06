# 腎臟圖譜完整展示測試指南

## 📋 已完成的修改

### 1. **前端 (Frontend)**

#### 1.1 圖譜 Store 增強
- ✅ 添加 `currentGraphId` 狀態跟蹤當前選中的圖譜
- ✅ 修改 `fetchGraphData()` 傳遞 `graph_id` 參數給後端
- ✅ 前端請求格式: `GET /api/graph/data?graph_id={graphId}`

**文件**: `frontend/src/stores/graphStore.js`

```javascript
// 新增狀態
const currentGraphId = ref(1);

// 修改後的 API 調用
const fetchGraphData = async (graphId = 1) => {
  currentGraphId.value = graphId;
  const response = await fetch(`/api/graph/data?graph_id=${encodeURIComponent(graphId)}`);
  // ...
};
```

#### 1.2 圖譜選擇器修復
- ✅ NexusPanel 動態顯示所有圖譜（包括用戶創建的）
- ✅ 支持字符串和數字 ID
- ✅ GraphPage 切換圖譜時正確傳遞 ID

**文件**: 
- `frontend/src/components/NexusPanel.vue`
- `frontend/src/views/GraphPage.vue`

```vue
<!-- 動態圖譜列表 -->
<option value="1">🧠 主腦圖譜</option>
<option 
  v-for="graph in graphStore.graphMetadataList.filter(g => g.id !== 1 && g.id !== '1')" 
  :key="graph.id" 
  :value="graph.id"
>
  {{ graph.icon }} {{ graph.name }}
</option>
```

#### 1.3 上傳功能擴展
- ✅ ImportPage 支持選擇目標圖譜
- ✅ 上傳時傳遞 `graph_id`, `graph_mode`, `graph_name` 參數

**文件**: `frontend/src/views/ImportPage.vue`

---

### 2. **後端 (Backend)**

#### 2.1 KuzuDB Schema 更新
- ✅ Entity 表新增 `graph_id` 字段
- ✅ `add_entity()` 方法支持 `graph_id` 參數

**文件**: `backend/core/kuzu_manager.py`

```python
# 新 Schema
CREATE NODE TABLE IF NOT EXISTS Entity(
    id STRING,
    name STRING,
    type STRING,
    properties STRING,
    graph_id STRING,  # 新增字段
    PRIMARY KEY(id)
)

# 修改後的方法
def add_entity(self, entity_id: str, name: str, entity_type: str, 
               properties: Dict = None, graph_id: str = "1") -> bool:
    # ...
```

#### 2.2 API 端點更新
- ✅ `GET /api/graph/data?graph_id={id}` 支持圖譜隔離
- ✅ 根據 graph_id 過濾節點和連接
- ✅ 主腦圖譜 (ID=1): 查詢未標記或標記為 "1" 的節點
- ✅ 用戶圖譜: 只查詢對應 graph_id 的節點

**文件**: `app_anytype.py`

```python
@app.get("/api/graph/data")
async def get_graph_data(graph_id: str = "1"):
    if str(graph_id) == "1":
        nodes_query = "MATCH (n:Entity) WHERE n.graph_id IS NULL OR n.graph_id = '1' RETURN n"
    else:
        nodes_query = f"MATCH (n:Entity) WHERE n.graph_id = '{graph_id}' RETURN n"
    # ...
```

#### 2.3 上傳 API 擴展
- ✅ 接受 `graph_id`, `graph_mode`, `graph_name` 參數

**文件**: `app_anytype.py`

```python
@app.post("/api/system/upload")
async def upload_file(
    file: UploadFile = File(...),
    graph_id: str = Form("1"),
    graph_mode: str = Form("existing"),
    graph_name: str = Form(None)
):
    # ...
```

---

## 🧪 測試步驟

### 前置準備

1. **清除舊的 KuzuDB 數據庫**（應用新 Schema）
   ```powershell
   Remove-Item -Path "C:\BruV_Data\kuzu_db" -Recurse -Force -ErrorAction SilentlyContinue
   ```

2. **重啟後端服務**
   ```powershell
   cd BruV_Project
   & "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/.venv/Scripts/python.exe" app_anytype.py
   ```

3. **啟動前端**（如果還沒運行）
   ```powershell
   cd frontend
   npm run dev
   ```

---

### 測試場景 1: 創建腎臟圖譜

1. 訪問 ImportPage: `http://localhost:5173/import`
2. 選擇「建立新圖譜」模式
3. 輸入圖譜名稱: `腎臟圖譜`
4. 選擇圖譜圖標: 🫘
5. 上傳測試文件（例如 kidney.txt）
6. **預期結果**:
   - ✅ 圖譜創建成功
   - ✅ 文件上傳成功
   - ✅ `graphMetadataList` 中新增腎臟圖譜

---

### 測試場景 2: 在 NexusPanel 切換到腎臟圖譜

1. 訪問 GraphPage: `http://localhost:5173/graph`
2. 打開左側邊欄（NexusPanel）
3. 在圖譜選擇器中查看選項
4. **預期結果**:
   - ✅ 下拉列表顯示「🧠 主腦圖譜」
   - ✅ 下拉列表顯示「🫘 腎臟圖譜」
5. 選擇「腎臟圖譜」
6. **預期結果**:
   - ✅ 控制台輸出: `📊 [GraphPage] 切換圖譜: graph_xxx`
   - ✅ 前端發送請求: `GET /api/graph/data?graph_id=graph_xxx`
   - ✅ 後端日志: `📊 請求圖譜數據: graph_id=graph_xxx`

---

### 測試場景 3: 2D 視圖顯示腎臟圖譜

1. 在 GraphPage 切換到腎臟圖譜後
2. 切換到 2D 視圖
3. **預期結果**:
   - ✅ 2D 圖表顯示腎臟圖譜的節點和連接
   - ✅ 控制台輸出: `🔄 [2D] 偵測到數據更新`
   - ✅ 只顯示 `graph_id = 'graph_xxx'` 的節點

---

### 測試場景 4: 3D 視圖顯示腎臟圖譜

1. 在 GraphPage 切換到腎臟圖譜後
2. 切換到 3D 視圖
3. **預期結果**:
   - ✅ 3D 圖表顯示腎臟圖譜的節點和連接
   - ✅ 控制台輸出: `🔄 [3D] 偵測到數據更新`
   - ✅ 只顯示 `graph_id = 'graph_xxx'` 的節點

---

### 測試場景 5: 圖譜之間相互獨立

1. 切換到主腦圖譜
2. 觀察節點數據
3. 切換到腎臟圖譜
4. 觀察節點數據
5. **預期結果**:
   - ✅ 兩個圖譜的節點數據完全不同
   - ✅ 主腦圖譜顯示 `graph_id IS NULL` 或 `graph_id = '1'` 的節點
   - ✅ 腎臟圖譜只顯示 `graph_id = 'graph_xxx'` 的節點

---

## 🔍 調試技巧

### 前端調試

1. **檢查當前圖譜 ID**
   ```javascript
   console.log('Current Graph ID:', graphStore.currentGraphId);
   ```

2. **檢查圖譜列表**
   ```javascript
   console.log('Graph List:', graphStore.graphMetadataList);
   ```

3. **檢查節點數據**
   ```javascript
   console.log('Nodes:', graphStore.nodes);
   console.log('Links:', graphStore.links);
   ```

### 後端調試

1. **檢查數據庫內容**
   ```python
   # 查詢所有節點及其 graph_id
   result = kuzu_manager.query("MATCH (n:Entity) RETURN n.id, n.name, n.graph_id")
   ```

2. **檢查請求參數**
   - 查看後端日誌中的 `graph_id` 參數

3. **檢查返回數據**
   - 確認 API 響應中的 `metadata.graph_id`

---

## ❗ 已知限制

### 1. WatcherService 未完全整合
- ⚠️ 自動監控文件夾上傳的文件暫時不會自動分配 graph_id
- 🔧 **臨時解決**: 使用 ImportPage 手動上傳並選擇圖譜

### 2. 批量導入需要更新
- ⚠️ `importMultipleFiles()` 方法需要支持 graph_id 參數
- 🔧 **計劃**: 下一階段更新

---

## 📝 總結

### 已實現功能
- ✅ 圖譜選擇器動態顯示所有圖譜
- ✅ 支持字符串和數字 ID
- ✅ 前端正確傳遞 graph_id 參數
- ✅ 後端根據 graph_id 過濾數據
- ✅ KuzuDB Schema 支持圖譜隔離
- ✅ 2D/3D 視圖響應圖譜切換

### 測試重點
1. 創建腎臟圖譜
2. 在選擇器中看到腎臟圖譜
3. 切換圖譜時數據正確更新
4. 2D 和 3D 都顯示正確的數據

### 成功標準
- ✅ 圖譜選擇器顯示「🫘 腎臟圖譜」
- ✅ 切換到腎臟圖譜時只顯示對應節點
- ✅ 2D/3D 視圖數據一致
- ✅ 控制台無錯誤
