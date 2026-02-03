<template>
  <div class="graph-container">
    <div ref="graphContainer" class="graph-canvas"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Graph } from '@antv/g6';

const graphContainer = ref(null);
let graph = null;

// Props：可選的實體 ID，用於查詢鄰居節點
const props = defineProps({
  entityId: {
    type: String,
    default: null
  }
});

// API 基礎 URL
const API_BASE = '/api';  // 使用 Vite Proxy

// 自適應畫布大小函數
const handleResize = () => {
  if (graph && graphContainer.value) {
    const width = graphContainer.value.offsetWidth;
    const height = graphContainer.value.offsetHeight;
    graph.changeSize(width, height);
    graph.fitCenter();
  }
};

// 載入圖譜資料
const loadGraphData = async () => {
  try {
    let graphData = { nodes: [], edges: [] };

    if (props.entityId) {
      // 如果有指定 ID，查詢鄰居節點
      const response = await fetch(`${API_BASE}/api/graph/entities/${props.entityId}/neighbors`);
      if (!response.ok) throw new Error('Failed to fetch neighbors');
      const data = await response.json();
      
      // 轉換後端資料格式為 G6 格式
      graphData = transformBackendData(data);
    } else {
      // 沒有指定 ID，執行 Cypher 查詢獲取初始圖譜
      const cypherQuery = 'MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 25';
      const response = await fetch(`${API_BASE}/api/graph/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cypherQuery })
      });
      
      if (!response.ok) throw new Error('Failed to fetch graph data');
      const data = await response.json();
      
      // 轉換 Cypher 查詢結果為 G6 格式
      graphData = transformCypherResults(data);
    }

    return graphData;
  } catch (error) {
    console.error('載入圖譜資料失敗:', error);
    // 返回範例資料作為後備方案
    return {
      nodes: [
        { id: 'node1', label: '企業知識庫', type: 'circle' },
        { id: 'node2', label: 'AI 模型', type: 'circle' },
        { id: 'node3', label: 'RAG 系統', type: 'circle' }
      ],
      edges: [
        { source: 'node1', target: 'node2', label: '訓練' },
        { source: 'node2', target: 'node3', label: '支援' }
      ]
    };
  }
};

// 轉換鄰居查詢結果為 G6 格式
const transformBackendData = (data) => {
  const nodes = [];
  const edges = [];
  const nodeMap = new Map();

  // 假設後端返回 { center: {...}, neighbors: [{node: {...}, relation: {...}}] }
  if (data.center) {
    const centerNode = {
      id: data.center.id || data.center.name,
      label: data.center.name,
      type: 'circle',
      data: data.center
    };
    nodes.push(centerNode);
    nodeMap.set(centerNode.id, true);
  }

  if (data.neighbors && Array.isArray(data.neighbors)) {
    data.neighbors.forEach(neighbor => {
      const nodeId = neighbor.node?.id || neighbor.node?.name;
      if (nodeId && !nodeMap.has(nodeId)) {
        nodes.push({
          id: nodeId,
          label: neighbor.node.name || nodeId,
          type: 'circle',
          data: neighbor.node
        });
        nodeMap.set(nodeId, true);
      }

      if (neighbor.relation) {
        edges.push({
          source: data.center.id || data.center.name,
          target: nodeId,
          label: neighbor.relation.type || '關聯',
          data: neighbor.relation
        });
      }
    });
  }

  return { nodes, edges };
};

// 轉換 Cypher 查詢結果為 G6 格式
const transformCypherResults = (results) => {
  const nodes = [];
  const edges = [];
  const nodeMap = new Map();

  // 假設後端返回 { results: [{n: {...}, r: {...}, m: {...}}] }
  if (results.results && Array.isArray(results.results)) {
    results.results.forEach(row => {
      // 處理起始節點 n
      if (row.n) {
        const nId = row.n.id || row.n.name;
        if (!nodeMap.has(nId)) {
          nodes.push({
            id: nId,
            label: row.n.name || nId,
            type: 'circle',
            data: row.n
          });
          nodeMap.set(nId, true);
        }
      }

      // 處理目標節點 m
      if (row.m) {
        const mId = row.m.id || row.m.name;
        if (!nodeMap.has(mId)) {
          nodes.push({
            id: mId,
            label: row.m.name || mId,
            type: 'circle',
            data: row.m
          });
          nodeMap.set(mId, true);
        }
      }

      // 處理關係 r
      if (row.r && row.n && row.m) {
        edges.push({
          source: row.n.id || row.n.name,
          target: row.m.id || row.m.name,
          label: row.r.type || '關聯',
          data: row.r
        });
      }
    });
  }

  return { nodes, edges };
};


onMounted(async () => {
  if (!graphContainer.value) return;

  // 從後端 API 載入資料
  const graphData = await loadGraphData();
  
  // 初始化 G6 圖譜 - G6 v5 方式：直接在配置中傳入 data
  graph = new Graph({
    container: graphContainer.value,
    width: graphContainer.value.offsetWidth,
    height: graphContainer.value.offsetHeight,
    // 直接傳入資料 (G6 v5 推薦方式)
    data: graphData,
    // 透明背景配合 Glassmorphism
    renderer: 'canvas',
    // 佈局配置
    layout: {
      type: 'force2',  // G6 v5 使用 force2
      preset: {
        type: 'concentric'
      },
      animate: true,
      preventOverlap: true,
      nodeSize: 60,
      linkDistance: 150
    },
    // 節點配置
    node: (model) => {
      return {
        id: model.id,
        data: {
          ...model,
          type: 'circle-node',
          style: {
            size: 50,
            fill: '#3b82f6',
            stroke: '#60a5fa',
            lineWidth: 2,
            shadowColor: 'rgba(59, 130, 246, 0.4)',
            shadowBlur: 10
          },
          labelShape: {
            text: model.label || model.id,
            fill: '#ffffff',
            fontSize: 14,
            fontWeight: 600,
            position: 'center'
          }
        }
      };
    },
    // 邊配置
    edge: (model) => {
      return {
        id: `${model.source}-${model.target}`,
        source: model.source,
        target: model.target,
        data: {
          ...model,
          type: 'line-edge',
          style: {
            stroke: 'rgba(148, 163, 184, 0.6)',
            lineWidth: 2,
            endArrow: {
              type: 'vee',
              fill: 'rgba(148, 163, 184, 0.6)'
            }
          },
          labelShape: model.label ? {
            text: model.label,
            fill: 'rgba(255, 255, 255, 0.85)',
            fontSize: 12,
            background: {
              fill: 'rgba(0, 0, 0, 0.3)',
              padding: [4, 8],
              radius: 4
            }
          } : undefined
        }
      };
    },
    // 行為模式
    modes: {
      default: [
        'drag-canvas',
        'zoom-canvas',
        'drag-node',
        'click-select'
      ]
    },
    // 動畫
    autoFit: 'view',
    fitViewPadding: 40
  });

  // 節點點擊事件 - Console log 出節點詳細資訊
  graph.on('node:click', (e) => {
    const nodeData = e.itemId ? graph.getNodeData(e.itemId) : null;
    if (nodeData) {
      console.log('============ 節點詳細資訊 ============');
      console.log('節點 ID:', nodeData.id);
      console.log('節點標籤:', nodeData.label);
      console.log('完整資料:', nodeData);
      console.log('=====================================');
    }
  });

  // 綁定視窗大小變化事件
  window.addEventListener('resize', handleResize);

  // 延遲後自動適應視圖
  setTimeout(() => {
    if (graph) {
      graph.fitView();
    }
  }, 300);
});

onUnmounted(() => {
  if (graph) {
    graph.destroy();
  }
  window.removeEventListener('resize', handleResize);
});

// 暴露方法供外部調用
defineExpose({
  getGraph: () => graph,
  updateData: async (newData) => {
    if (graph && newData) {
      // G6 v5 更新資料方式
      graph.updateData('node', newData.nodes || []);
      graph.updateData('edge', newData.edges || []);
      graph.layout();
      setTimeout(() => graph.fitView(), 300);
    }
  },
  // 重新載入圖譜資料
  async refreshGraph(entityId = null) {
    const newData = entityId 
      ? await loadGraphDataById(entityId)
      : await loadGraphData();
    
    if (graph && newData) {
      graph.clear();
      graph.updateData('node', newData.nodes || []);
      graph.updateData('edge', newData.edges || []);
      graph.layout();
      setTimeout(() => graph.fitView(), 300);
    }
  }
});

// 根據 ID 載入圖譜資料的輔助函數
const loadGraphDataById = async (entityId) => {
  try {
    const response = await fetch(`${API_BASE}/api/graph/entities/${entityId}/neighbors`);
    if (!response.ok) throw new Error('Failed to fetch neighbors');
    const data = await response.json();
    return transformBackendData(data);
  } catch (error) {
    console.error('載入指定節點圖譜失敗:', error);
    return null;
  }
};
</script>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(20, 20, 30, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.graph-canvas {
  width: 100%;
  height: 100%;
  background: transparent;
}

/* G6 Tooltip 樣式 */
:deep(.g6-tooltip) {
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  color: #fff !important;
  font-size: 13px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}
</style>
