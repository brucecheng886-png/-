# Store 统一 API 架构重构文档

## 📋 概述

本次重构将分散在各组件中的 API 调用统一整合到 `graphStore.js` 中，实现全站数据同步和统一的数据管理。

**重构目标：** 让 `Graph2D.vue`、`Graph3D.vue`、`GraphView.vue` 和其他组件不再直接调用后端 API，而是通过 Store 的统一方法获取数据。

---

## 🎯 重构内容

### 1. graphStore.js 新增统一 API 方法

#### 1.1 fetchNeighbors() - 获取邻居节点

```javascript
/**
 * 獲取指定節點的鄰居節點（統一 API）
 * @param {string} entityId - 實體 ID
 * @returns {Promise<Object>} { nodes, links }
 */
const fetchNeighbors = async (entityId) => {
  // 调用 GET /api/graph/entities/{entityId}/neighbors
  // 返回节点和连线数据
}
```

**用途：**
- GraphView.vue 查询特定节点的邻居关系
- 节点详情页展示关联节点
- 图谱聚焦模式

---

#### 1.2 executeCypherQuery() - 执行 Cypher 查询

```javascript
/**
 * 執行 Cypher 查詢（統一 API）
 * @param {string} query - Cypher 查詢語句
 * @param {Object} params - 查詢參數（可選）
 * @returns {Promise<Object>} { nodes, links }
 */
const executeCypherQuery = async (query, params = {}) => {
  // 调用 POST /api/graph/query
  // 支持复杂图谱查询
}
```

**用途：**
- GraphView.vue 执行自定义 Cypher 查询
- 高级图谱筛选
- 报表数据获取

---

#### 1.3 importMultipleFiles() - 批量文件导入

```javascript
/**
 * 批量匯入檔案（統一 API）
 * @param {Array<File>} files - 檔案陣列
 * @returns {Promise<Object>} 匯入結果統計
 */
const importMultipleFiles = async (files) => {
  // 调用 POST /api/graph/import/files
  // 自动调用 addBatchNodes() 添加节点到 Store
}
```

**用途：**
- GraphPage.vue 文件上传
- ImportPage.vue 批量导入
- 自动更新图谱数据

---

### 2. 组件重构详情

#### 2.1 GraphView.vue

**修改前：**
```vue
<script setup>
// 直接调用 fetch API
const loadGraphData = async () => {
  const response = await fetch(`/api/graph/entities/${entityId}/neighbors`);
  const data = await response.json();
  // ...
}
</script>
```

**修改后：**
```vue
<script setup>
import { useGraphStore } from '../stores/graphStore';

const graphStore = useGraphStore();

const loadGraphData = async () => {
  // 🌟 使用 Store 统一 API
  const data = await graphStore.fetchNeighbors(props.entityId);
  return transformBackendData(data);
}
</script>
```

**收益：**
- ✅ 统一错误处理
- ✅ 自动更新 loading 状态
- ✅ 数据缓存复用
- ✅ 日志追踪

---

#### 2.2 Graph3D.vue

**修改前：**
```javascript
const API_BASE_URL = 'http://localhost:8000';

const loadGraphDataFromAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/graph/data`);
  const result = await response.json();
  // ...
}
```

**修改后：**
```javascript
const loadGraphDataFromAPI = async () => {
  // 🌟 使用 Store 统一 API
  console.log('📡 [Graph3D] 使用 Store.fetchGraphData() 加载数据');
  const result = await graphStore.fetchGraphData();
  // ...
}
```

**收益：**
- ✅ 移除硬编码 API URL
- ✅ 自动同步 Store 数据
- ✅ 支持跨图谱模式

---

#### 2.3 GraphPage.vue

**修改前：**
```javascript
const handleFileUploaded = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('/api/graph/import/files', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  graphStore.addBatchNodes(data);
}
```

**修改后：**
```javascript
const handleFileUploaded = async (files) => {
  // 🌟 使用 Store 统一 API
  console.log('📡 [GraphPage] 使用 Store.importMultipleFiles()');
  const stats = await graphStore.importMultipleFiles(files);
  
  ElMessage.success(`✅ 匯入成功！成功: ${stats.success}, 跳過: ${stats.skipped}`);
}
```

**收益：**
- ✅ 统一错误提示
- ✅ 自动更新图谱
- ✅ 返回详细统计

---

### 3. Graph2D.vue

**状态：** ✅ 已使用 Store

Graph2D.vue 已经通过 `watch` 监听 `graphStore.nodes` 和 `graphStore.links`，无需额外修改。

```javascript
watch(
  () => [graphStore.nodes, graphStore.links],
  ([newNodes, newLinks]) => {
    // 自动同步 Store 数据
    graphInstance.graphData({ nodes: nodesClone, links: linksClone });
  },
  { deep: true }
);
```

---

## 📊 架构对比

### 旧架构（分散调用）

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Graph2D.vue │────▶│  Backend    │     │ Graph3D.vue │────▶ Backend API
└─────────────┘     │    API      │     └─────────────┘
                    └─────────────┘
┌─────────────┐            │            ┌─────────────┐
│GraphView.vue│────────────┘            │GraphPage.vue│────▶ Backend API
└─────────────┘                         └─────────────┘

❌ 问题：
- 数据不同步
- 重复代码
- 难以维护
```

### 新架构（统一 Store）

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Graph2D.vue │────▶│             │◀────│ Graph3D.vue │
└─────────────┘     │             │     └─────────────┘
                    │  graphStore │
┌─────────────┐     │             │     ┌─────────────┐
│GraphView.vue│────▶│   (Pinia)   │◀────│GraphPage.vue│
└─────────────┘     │             │     └─────────────┘
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Backend    │
                    │    API      │
                    └─────────────┘

✅ 优势：
- 全站数据同步
- 统一错误处理
- 代码复用
- 易于测试
```

---

## 🔧 API 方法速查表

| 方法名 | 用途 | 返回值 | 组件使用 |
|--------|------|--------|----------|
| `fetchGraphData()` | 加载主图谱数据 | `{ nodes, links }` | Graph2D, Graph3D |
| `fetchNeighbors(entityId)` | 获取邻居节点 | `{ nodes, links }` | GraphView |
| `executeCypherQuery(query)` | 执行 Cypher 查询 | `{ nodes, links }` | GraphView |
| `importMultipleFiles(files)` | 批量导入文件 | `{ success, skipped, failed }` | GraphPage |
| `addNode(node)` | 添加单个节点 | `node` | 所有组件 |
| `addBatchNodes(nodes)` | 批量添加节点 | `stats` | GraphPage |
| `updateNode(id, updates)` | 更新节点属性 | `void` | Sidebar, NexusPanel |
| `selectNode(nodeId)` | 选中节点 | `void` | 所有组件 |

---

## 📝 迁移指南

### 如何将现有组件迁移到 Store API？

#### Step 1: 导入 Store

```javascript
import { useGraphStore } from '../stores/graphStore';

const graphStore = useGraphStore();
```

#### Step 2: 替换 fetch 调用

**原代码：**
```javascript
const response = await fetch('/api/graph/data');
const data = await response.json();
```

**新代码：**
```javascript
const data = await graphStore.fetchGraphData();
```

#### Step 3: 移除错误处理（Store 已处理）

**原代码：**
```javascript
try {
  const response = await fetch('/api/graph/data');
  if (!response.ok) throw new Error('...');
  // ...
} catch (error) {
  console.error(error);
  ElMessage.error('加载失败');
}
```

**新代码：**
```javascript
// Store 自动处理错误，设置 graphStore.error
const data = await graphStore.fetchGraphData();
```

#### Step 4: 监听 Store 数据变化

```javascript
watch(
  () => [graphStore.nodes, graphStore.links],
  ([newNodes, newLinks]) => {
    // 自动同步更新
    updateGraph(newNodes, newLinks);
  },
  { deep: true }
);
```

---

## 🧪 测试验证

### 1. 单元测试示例

```javascript
import { setActivePinia, createPinia } from 'pinia';
import { useGraphStore } from '@/stores/graphStore';

describe('graphStore API Methods', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  
  it('should fetch neighbors successfully', async () => {
    const store = useGraphStore();
    const data = await store.fetchNeighbors('node1');
    
    expect(data.nodes).toBeDefined();
    expect(data.links).toBeDefined();
  });
  
  it('should execute Cypher query', async () => {
    const store = useGraphStore();
    const data = await store.executeCypherQuery('MATCH (n) RETURN n LIMIT 10');
    
    expect(Array.isArray(data.nodes)).toBe(true);
  });
});
```

### 2. 集成测试

```javascript
// GraphView.vue 测试
import { mount } from '@vue/test-utils';
import GraphView from '@/components/GraphView.vue';
import { createTestingPinia } from '@pinia/testing';

describe('GraphView.vue', () => {
  it('should use Store API instead of direct fetch', async () => {
    const wrapper = mount(GraphView, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })]
      }
    });
    
    const store = useGraphStore();
    const fetchNeighborsSpy = vi.spyOn(store, 'fetchNeighbors');
    
    await wrapper.vm.loadGraphData();
    
    expect(fetchNeighborsSpy).toHaveBeenCalled();
  });
});
```

---

## 🚀 下一步优化

### 1. 数据缓存

```javascript
// graphStore.js
const cachedData = ref(new Map());

const fetchGraphData = async (graphId = 1, useCache = true) => {
  if (useCache && cachedData.value.has(graphId)) {
    console.log('📦 使用缓存数据');
    return cachedData.value.get(graphId);
  }
  
  const data = await fetch('/api/graph/data');
  cachedData.value.set(graphId, data);
  return data;
};
```

### 2. 请求去重

```javascript
// 防止重复请求
const pendingRequests = new Map();

const fetchGraphData = async (graphId) => {
  if (pendingRequests.has(graphId)) {
    console.log('⏳ 等待正在进行的请求...');
    return await pendingRequests.get(graphId);
  }
  
  const promise = fetchFromAPI(graphId);
  pendingRequests.set(graphId, promise);
  
  try {
    return await promise;
  } finally {
    pendingRequests.delete(graphId);
  }
};
```

### 3. WebSocket 实时同步

```javascript
// 监听后端推送的数据更新
const connectWebSocket = () => {
  const ws = new WebSocket('ws://localhost:8000/ws/graph');
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    
    if (update.type === 'NODE_ADDED') {
      addNode(update.node);
    } else if (update.type === 'NODE_UPDATED') {
      updateNode(update.nodeId, update.changes);
    }
  };
};
```

---

## 📚 相关文档

- [Graph Store API 文档](./graphStore_API.md)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

---

## 📌 总结

本次重构实现了以下目标：

✅ **统一数据管理** - 所有组件通过 Store 获取数据  
✅ **全站数据同步** - Store 数据变化自动同步到所有组件  
✅ **代码复用** - 减少重复的 API 调用代码  
✅ **易于维护** - API 变更只需修改 Store  
✅ **错误处理** - 统一的错误处理和日志记录  

**重构涉及文件：**
- ✏️ `frontend/src/stores/graphStore.js` - 新增 3 个统一 API 方法
- ✏️ `frontend/src/components/GraphView.vue` - 使用 Store API
- ✏️ `frontend/src/views/Graph3D.vue` - 使用 Store API
- ✏️ `frontend/src/views/GraphPage.vue` - 使用 Store API
- ✅ `frontend/src/components/Graph2D.vue` - 已使用 Store（无需修改）

---

**作者：** BruV Team  
**日期：** 2026-02-04  
**版本：** v1.0
