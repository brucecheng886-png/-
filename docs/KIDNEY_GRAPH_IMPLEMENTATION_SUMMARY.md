# 腎臟圖譜 2D/3D 完整展示邏輯實現總結

## 🎯 任務目標
完成腎臟圖譜在2D和3D的完整展示邏輯，確保用戶創建的圖譜（如"腎臟圖譜"）能在圖譜選擇器中顯示，並在2D/3D視圖中正確加載對應的數據。

## ✅ 已完成的修改

### 1. 前端修改 (Frontend)

#### 1.1 圖譜 Store 增強
**文件**: `frontend/src/stores/graphStore.js`

- ✅ 添加 `currentGraphId` 狀態
- ✅ 修改 `fetchGraphData(graphId)` 傳遞 graph_id 參數
- ✅ 在 Store 導出中添加 `currentGraphId`

```javascript
// 新增
const currentGraphId = ref(1);

// 修改
const fetchGraphData = async (graphId = 1) => {
  currentGraphId.value = graphId;
  const response = await fetch(`/api/graph/data?graph_id=${encodeURIComponent(graphId)}`);
  // ...
};
```

#### 1.2 圖譜選擇器修復
**文件**: 
- `frontend/src/components/NexusPanel.vue`
- `frontend/src/views/GraphPage.vue`

- ✅ 動態顯示所有圖譜（v-for 循環）
- ✅ 支持字符串和數字 ID
- ✅ `handleGraphChange` 智能類型檢測

```javascript
// NexusPanel.vue & GraphPage.vue
function handleGraphChange(event) {
  let newId = event.target.value;
  if (!isNaN(newId) && newId.trim() !== '') {
    newId = parseInt(newId);
  }
  console.log('📊 切換圖譜:', newId);
  graphStore.fetchGraphData(newId);
}
```

#### 1.3 2D/3D 視圖自動同步
**文件**: 
- `frontend/src/components/Graph2D.vue`
- `frontend/src/views/Graph3D.vue`

- ✅ 監聽 Store 數據變化
- ✅ 自動更新圖表數據

```javascript
watch(
  () => [graphStore.nodes, graphStore.links],
  ([newNodes, newLinks]) => {
    if (graphInstance && newNodes.length > 0) {
      graphInstance.graphData({ nodes: newNodes, links: newLinks });
    }
  },
  { deep: true }
);
```

---

### 2. 後端修改 (Backend)

#### 2.1 KuzuDB Schema 更新
**文件**: `backend/core/kuzu_manager.py`

- ✅ Entity 表新增 `graph_id` 字段
- ✅ `add_entity()` 支持 `graph_id` 參數

```python
# 新 Schema
CREATE NODE TABLE IF NOT EXISTS Entity(
    id STRING,
    name STRING,
    type STRING,
    properties STRING,
    graph_id STRING,  # 新增
    PRIMARY KEY(id)
)

# 修改後的方法
def add_entity(self, entity_id: str, name: str, entity_type: str, 
               properties: Dict = None, graph_id: str = "1") -> bool:
    self.conn.execute(
        "CREATE (e:Entity {id: $id, name: $name, type: $type, properties: $props, graph_id: $graph_id})",
        parameters={..., "graph_id": graph_id}
    )
```

#### 2.2 圖譜數據 API 增強
**文件**: `app_anytype.py`

- ✅ 接受 `graph_id` 查詢參數
- ✅ 根據 graph_id 過濾節點和連接
- ✅ 主腦圖譜和用戶圖譜隔離

```python
@app.get("/api/graph/data")
async def get_graph_data(graph_id: str = "1"):
    if str(graph_id) == "1":
        # 主腦圖譜：未標記或標記為 "1" 的節點
        nodes_query = "MATCH (n:Entity) WHERE n.graph_id IS NULL OR n.graph_id = '1' RETURN n"
    else:
        # 用戶圖譜：只查詢對應 graph_id 的節點
        nodes_query = f"MATCH (n:Entity) WHERE n.graph_id = '{graph_id}' RETURN n"
    # ...
```

#### 2.3 上傳 API 擴展
**文件**: `app_anytype.py`

- ✅ 接受 `graph_id`, `graph_mode`, `graph_name` 參數
- ✅ 支持創建新圖譜和加入現有圖譜

```python
@app.post("/api/system/upload")
async def upload_file(
    file: UploadFile = File(...),
    graph_id: str = Form("1"),
    graph_mode: str = Form("existing"),
    graph_name: str = Form(None)
):
    logger.info(f"📤 收到文件上傳: {file.filename}, graph_id={graph_id}")
    # ...
```

---

## 📊 數據流程圖

```
用戶操作                前端                    後端                    KuzuDB
───────────────────────────────────────────────────────────────────────

1. 創建腎臟圖譜
   │
   ├─► createGraph()      
   │   ├─ 生成 graphId: "graph_1234567890_abc"
   │   ├─ 保存到 graphMetadataList
   │   └─ localStorage 持久化
   │
   
2. 選擇腎臟圖譜
   │
   ├─► NexusPanel         
   │   └─ handleGraphChange("graph_1234567890_abc")
   │       │
   │       └─► fetchGraphData("graph_1234567890_abc")
   │           │
   │           └─► GET /api/graph/data?graph_id=graph_1234567890_abc
   │                                       │
   │                                       └─► query(WHERE n.graph_id = 'graph_1234567890_abc')
   │                                                                          │
   │                                                                          └─► 返回腎臟圖譜節點
   │
   ├─► Store 更新
   │   ├─ nodes = 腎臟圖譜節點
   │   ├─ links = 腎臟圖譜連接
   │   └─ currentGraphId = "graph_1234567890_abc"
   │
   
3. 2D/3D 自動更新
   │
   ├─► Graph2D.vue
   │   └─ watch(nodes, links) → 更新 2D 圖表
   │
   └─► Graph3D.vue
       └─ watch(nodes, links) → 更新 3D 圖表
```

---

## 🧪 測試方法

### 自動測試
```bash
cd BruV_Project
python test_kidney_graph.py
```

### 手動測試
1. **清除舊數據庫**:
   ```powershell
   Remove-Item "C:\BruV_Data\kuzu_db" -Recurse -Force
   ```

2. **重啟後端**:
   ```powershell
   cd BruV_Project
   python app_anytype.py
   ```

3. **測試前端**:
   - 訪問 `http://localhost:5173/import`
   - 創建「腎臟圖譜」
   - 訪問 `http://localhost:5173/graph`
   - 在選擇器中切換圖譜
   - 驗證 2D/3D 顯示正確數據

### 預期結果
- ✅ 圖譜選擇器顯示「🫘 腎臟圖譜」
- ✅ 切換圖譜時 2D/3D 自動更新
- ✅ 不同圖譜的數據完全隔離
- ✅ 控制台無錯誤

---

## 📝 關鍵代碼位置

| 功能 | 文件 | 行數 |
|-----|------|------|
| currentGraphId 狀態 | `frontend/src/stores/graphStore.js` | ~105 |
| fetchGraphData 修改 | `frontend/src/stores/graphStore.js` | ~240 |
| NexusPanel 圖譜列表 | `frontend/src/components/NexusPanel.vue` | ~150 |
| handleGraphChange | `frontend/src/components/NexusPanel.vue` | ~90 |
| GraphPage 圖譜切換 | `frontend/src/views/GraphPage.vue` | ~388 |
| KuzuDB Schema | `backend/core/kuzu_manager.py` | ~69 |
| add_entity 方法 | `backend/core/kuzu_manager.py` | ~93 |
| 圖譜數據 API | `app_anytype.py` | ~299 |
| 上傳 API | `app_anytype.py` | ~474 |

---

## ⚠️ 注意事項

### 1. 清除舊數據庫
由於 Schema 變更（新增 graph_id 字段），**必須刪除舊的 KuzuDB 數據庫**：
```powershell
Remove-Item "C:\BruV_Data\kuzu_db" -Recurse -Force
```

### 2. ID 類型
- 主腦圖譜: 數字 `1`
- 用戶圖譜: 字符串 `"graph_1234567890_abc"`
- 所有處理 ID 的地方都支持兩種類型

### 3. localStorage
圖譜元數據保存在 `localStorage`，清除瀏覽器緩存會丟失：
```javascript
localStorage.getItem('graphMetadataList')
```

---

## 🚀 下一步優化

### 短期
1. ✅ 基本圖譜隔離 (已完成)
2. 🔜 WatcherService 支持 graph_id
3. 🔜 批量導入支持 graph_id

### 長期
1. 🔜 圖譜權限管理
2. 🔜 跨圖譜搜索
3. 🔜 圖譜導出/導入

---

## 📖 相關文檔
- [測試指南](./KIDNEY_GRAPH_TEST_GUIDE.md)
- [圖譜 API 文檔](./api/API_INTEGRATION.md)
- [Store 架構文檔](../frontend/README.md)

---

**實現時間**: 2026-02-04  
**狀態**: ✅ 完成  
**測試**: ⏳ 待驗證
