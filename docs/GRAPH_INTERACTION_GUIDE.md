# Graph3D 交互邏輯完善指南

## ✅ 已完成的功能

### 1. 點擊聚焦 (Fly-to)

**功能說明：**
- 點擊任意節點時，相機會平滑移動到該節點附近
- 使用 1500ms 的動畫過渡，提供流暢的視覺體驗
- 同時會有短暫的縮放動畫作為視覺回饋

**實現位置：** `Graph3D.vue` - `handleNodeClick` 函數

**關鍵代碼：**
```javascript
// 計算相機目標位置
const distance = 120; // 相機距離
const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

const targetPosition = {
  x: node.x * distRatio,
  y: node.y * distRatio,
  z: node.z * distRatio
};

// 平滑移動相機，1500ms 動畫
graphInstance.cameraPosition(
  targetPosition,  // 相機位置
  node,            // lookAt 目標（節點位置）
  1500             // 動畫持續時間
);
```

**測試方法：**
1. 打開圖譜頁面（Graph Page）
2. 切換到 3D 視圖
3. 點擊任意節點
4. 觀察相機是否平滑移動到節點附近

---

### 2. 雙向同步

**功能說明：**
- 在右側 Inspector 面板修改節點名稱、描述、連結等屬性
- 點擊 "SAVE DATA" 按鈕保存
- 3D 圖譜中的節點標籤會即時更新

**實現位置：**
- `GraphPage.vue` - `saveChanges` 函數（觸發更新）
- `Graph3D.vue` - Watch 監聽（接收更新）
- `graphStore.js` - `updateNode` 函數（狀態管理）

**數據流：**
```
Inspector 面板 (GraphPage.vue)
    ↓ saveChanges()
graphStore.updateNode(nodeId, updates)
    ↓ reactive update
Graph3D.vue watch監聽
    ↓ 
graphInstance 重新渲染標籤
```

**關鍵代碼：**

**GraphPage.vue:**
```javascript
const saveChanges = () => {
  const updates = {
    name: localNodeData.value.name,
    link: localNodeData.value.link,
    description: localNodeData.value.description,
    image: localNodeData.value.image
  };
  
  // 調用 Store 更新節點（會觸發 Graph3D 的 watch 監聽）
  graphStore.updateNode(nodeId, updates);
};
```

**Graph3D.vue:**
```javascript
// 監聽單個節點更新（雙向同步）
watch(
  () => graphStore.nodes,
  (newNodes) => {
    newNodes.forEach(storeNode => {
      const graphNode = graphData.value.nodes.find(n => n.id === storeNode.id);
      if (graphNode) {
        // 更新節點屬性
        Object.assign(graphNode, {
          name: storeNode.name,
          description: storeNode.description,
          link: storeNode.link
        });
      }
    });
    
    // 重新渲染標籤
    graphInstance.nodeLabel('name');
  },
  { deep: true }
);
```

**測試方法：**
1. 在 3D 圖譜中點擊一個節點
2. 右側 Inspector 面板會顯示節點信息
3. 修改節點名稱（例如：將 "GPT-4" 改為 "GPT-4 Turbo"）
4. 點擊 "SAVE DATA" 按鈕
5. 觀察 3D 圖譜中的節點標籤是否立即更新

---

### 3. 模式切換

**功能說明：**
- 點擊左側面板的 "🧊 3D View" / "📐 2D View" 按鈕
- 視圖會在 2D 和 3D 模式之間切換
- 切換狀態會自動保存到 localStorage

**實現位置：**
- `GraphPage.vue` - `toggleViewMode` 函數（UI 觸發）
- `graphStore.js` - `setViewMode` 函數（狀態管理）
- `GraphPage.vue` - `currentComponent` computed（動態組件切換）

**關鍵代碼：**

**GraphPage.vue:**
```javascript
const toggleViewMode = () => {
  const currentMode = graphStore.viewMode;
  const newMode = currentMode === '2d' ? '3d' : '2d';
  
  // 調用 Store 更新視圖模式（會自動保存到 localStorage）
  graphStore.setViewMode(newMode);
  
  ElMessage.success({
    message: `✅ 已切換到 ${newMode.toUpperCase()} 視圖`,
    duration: 1500
  });
};

// 動態組件切換
const currentComponent = computed(() => {
  return graphStore.viewMode === '3d' ? Graph3D : Graph2D;
});
```

**graphStore.js:**
```javascript
const setViewMode = (mode) => {
  if (!['2d', '3d'].includes(mode)) {
    console.error('❌ 無效的視圖模式:', mode);
    return;
  }
  viewMode.value = mode;
  localStorage.setItem('graphViewMode', mode); // 持久化
  console.log(`✅ 視圖模式已設置為: ${mode.toUpperCase()}`);
};
```

**測試方法：**
1. 打開圖譜頁面
2. 觀察當前視圖模式（2D 或 3D）
3. 點擊切換按鈕
4. 確認視圖正確切換
5. 刷新頁面，確認模式保持不變（localStorage 持久化）

---

## 🔍 調試技巧

### 控制台日誌

所有交互都有詳細的日誌輸出，方便調試：

```javascript
// 節點點擊
🔍 [3D] 選中節點: { id, name, ... }
🎬 [3D] 相機已移動到: NodeName

// 數據同步
🔄 [3D] 偵測到數據更新: 50 節點
✅ [3D] 節點標籤已更新

// 模式切換
🔄 [GraphPage] 視圖模式切換: 2d → 3d
✅ 視圖模式已設置為: 3D

// 保存變更
💾 [GraphPage] 保存節點變更: nodeId, { name, link, ... }
✅ [GraphPage] 節點已更新，3D 圖譜應自動同步
```

### 常見問題排查

**Q: 點擊節點後相機沒有移動？**
- 檢查節點是否有 x, y, z 座標
- 查看控制台是否有錯誤
- 確認 graphInstance 已初始化

**Q: 修改節點名稱後 3D 圖譜沒有更新？**
- 確認已點擊 "SAVE DATA" 按鈕
- 檢查 graphStore.updateNode 是否被調用
- 查看 Graph3D.vue 的 watch 是否觸發

**Q: 切換模式後圖譜沒有變化？**
- 檢查 currentComponent 計算屬性
- 確認 graphStore.viewMode 是否正確更新
- 查看 localStorage 中的 graphViewMode 值

---

## 📚 相關文件

- `frontend/src/views/Graph3D.vue` - 3D 圖譜組件
- `frontend/src/views/Graph2D.vue` - 2D 圖譜組件
- `frontend/src/views/GraphPage.vue` - 圖譜頁面容器
- `frontend/src/stores/graphStore.js` - 圖譜數據狀態管理
- `frontend/src/stores/layoutStore.js` - 佈局狀態管理

---

## 🎯 未來改進方向

1. **節點選中視覺回饋增強**
   - 添加光暈效果
   - 添加粒子特效
   - 添加連接線高亮

2. **相機控制優化**
   - 添加雙擊節點回到俯視視角
   - 添加鍵盤快捷鍵控制相機
   - 添加預設視角書籤

3. **批量編輯功能**
   - 支持多選節點
   - 批量修改屬性
   - 批量導出/導入

4. **性能優化**
   - 虛擬化大型圖譜（1000+ 節點）
   - WebWorker 處理物理模擬
   - LOD（細節層次）優化

---

**最後更新：** 2026-02-02  
**版本：** v2.0  
**維護者：** BruV Team
