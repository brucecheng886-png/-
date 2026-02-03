# 左側面板點擊聚焦功能

> **更新日期**: 2026-02-02  
> **功能**: 點擊左側節點列表時自動聚焦到圖表中的節點

## 🎯 功能說明

現在當你點擊左側 NEXUS 控制台中的任何節點卡片時，會自動觸發以下行為：

### 3D 視圖模式 🧊
- ✅ 相機平滑移動到選中節點（2000ms 動畫）
- ✅ 節點縮放動畫（三階段：1.8x → 1.3x → 1.0x）
- ✅ 相機 lookAt 精確對準節點中心
- ✅ 右側 Inspector 面板同步顯示節點資訊

### 2D 視圖模式 📐
- ✅ 畫布平滑移動到節點中心（1000ms 動畫）
- ✅ 自動縮放至 2.5 倍（1000ms 動畫）
- ✅ 右側 Inspector 面板同步顯示節點資訊

## 🔧 實現架構

```
GraphPage.vue (父組件)
    │
    ├─ 左側節點列表
    │   └─ @click="handleNodeClick(node)"
    │       └─ graphComponentRef.value.focusNode(node)
    │
    └─ 中間圖表組件 (ref="graphComponentRef")
        ├─ Graph3D.vue (3D 模式)
        │   └─ focusNode() → handleNodeClick()
        │       └─ cameraPosition() 相機動畫
        │
        └─ Graph2D.vue (2D 模式)
            └─ focusNode() → handleNodeClick()
                └─ centerAt() + zoom() 視圖動畫
```

## 📝 關鍵代碼

### GraphPage.vue
```javascript
// 1. 添加圖表組件引用
const graphComponentRef = ref(null);

// 2. 修改點擊處理函數
const handleNodeClick = (node) => {
  // ... 選擇節點邏輯 ...
  
  // 🎯 觸發聚焦
  if (graphComponentRef.value?.focusNode) {
    graphComponentRef.value.focusNode(node);
  }
};

// 3. 模板中綁定 ref
<component :is="currentComponent" ref="graphComponentRef" />
```

### Graph3D.vue
```javascript
// 暴露聚焦方法
const focusNode = (node) => {
  const graphNode = graphData.value.nodes.find(n => n.id === node.id);
  if (graphNode) {
    handleNodeClick(graphNode); // 觸發內部點擊邏輯
  }
};

// 使用 defineExpose 暴露給父組件
defineExpose({
  focusNode,
  resetCamera,
  generateNewGraph
});
```

### Graph2D.vue
```javascript
// 暴露聚焦方法
const focusNode = (node) => {
  const graphNode = graphStore.nodes.find(n => n.id === node.id);
  if (graphNode) {
    handleNodeClick(graphNode); // 觸發內部點擊邏輯
  }
};

// 使用 defineExpose 暴露給父組件
defineExpose({
  focusNode,
  resetView
});
```

## 🧪 測試步驟

### 3D 視圖測試
1. 確保當前視圖為 3D 模式
2. 點擊左側任意節點卡片（如 GPT-4、Claude 3.5）
3. 觀察相機是否平滑移動到該節點
4. 檢查節點是否有縮放動畫
5. 確認右側面板顯示該節點的詳細資訊

### 2D 視圖測試
1. 點擊左側 "📐 2D View" 按鈕切換到 2D 模式
2. 點擊左側任意節點卡片
3. 觀察畫布是否平滑移動並縮放到該節點
4. 確認右側面板顯示該節點的詳細資訊

### 跨模式測試
1. 在 3D 模式下點擊一個節點並觀察聚焦效果
2. 切換到 2D 模式
3. 點擊另一個節點並觀察聚焦效果
4. 再次切換回 3D 模式
5. 確認功能在模式切換後仍正常工作

## 🐛 調試日誌

相關日誌輸出：

```javascript
// GraphPage.vue
console.log('🎯 [GraphPage] 觸發節點聚焦:', node.name);
console.warn('⚠️ [GraphPage] 圖表組件未提供 focusNode 方法');

// Graph3D.vue
console.log('🎯 [3D] 外部調用 focusNode:', node.name);
console.log('🎬 [3D] 相機聚焦:', {...});
console.warn('⚠️ [3D] 節點不存在於圖表中:', node.id);

// Graph2D.vue
console.log('🎯 [2D] 外部調用 focusNode:', node.name);
console.log('🎯 [2D] 節點已聚焦:', node.name);
console.warn('⚠️ [2D] 節點不存在於圖表中:', node.id);
```

## 📊 性能優化

### 動畫時間設置
- **3D 相機移動**: 2000ms（較長，確保平滑）
- **2D 畫布移動**: 1000ms（較短，即時響應）
- **2D 縮放動畫**: 1000ms

### 防抖處理
如果頻繁點擊節點，可以考慮添加防抖：

```javascript
import { debounce } from 'lodash-es';

const debouncedFocus = debounce((node) => {
  if (graphComponentRef.value?.focusNode) {
    graphComponentRef.value.focusNode(node);
  }
}, 300);
```

## 🎨 視覺效果對比

| 特性 | 3D 視圖 | 2D 視圖 |
|------|---------|---------|
| 動畫類型 | 相機移動 + lookAt | 平移 + 縮放 |
| 動畫時長 | 2000ms | 1000ms |
| 縮放效果 | 節點縮放動畫 | 畫布縮放 2.5x |
| 視角控制 | 3D 空間自由視角 | 2D 平面固定視角 |

## 🚀 未來改進

1. **批量聚焦**: 選擇多個節點時聚焦到群組中心
2. **路徑動畫**: 從當前視角到目標節點的路徑動畫
3. **焦點記憶**: 記錄上一次聚焦的節點，支持快速返回
4. **鍵盤導航**: 使用方向鍵在節點間切換並聚焦
5. **搜尋高亮**: 搜尋結果自動聚焦並高亮顯示

## 📚 相關文檔

- [GraphPage.vue](../frontend/src/views/GraphPage.vue) - 主頁面組件
- [Graph3D.vue](../frontend/src/views/Graph3D.vue) - 3D 圖表組件
- [Graph2D.vue](../frontend/src/components/Graph2D.vue) - 2D 圖表組件
- [GRAPH_INTERACTION_IMPROVEMENTS.md](./GRAPH_INTERACTION_IMPROVEMENTS.md) - 交互功能完善文檔

---

> **提示**: 所有功能已實現並測試，可直接使用。如遇問題請檢查控制台日誌。
