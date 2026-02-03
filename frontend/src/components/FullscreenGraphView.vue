<template>
  <div class="fullscreen-graph-container">
    <!-- 3D 圖表畫布 -->
    <div ref="graphContainer" class="graph-canvas"></div>
    
    <!-- 控制面板 (浮動) -->
    <div class="floating-controls">
      <div class="control-header">
        <span class="control-title">🌐 知識圖譜</span>
        <button class="close-btn" @click="$emit('close')" title="關閉">✕</button>
      </div>
      
      <div class="control-body">
        <!-- 統計資訊 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">節點</div>
            <div class="stat-value">{{ graphData.nodes.length }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">連結</div>
            <div class="stat-value">{{ graphData.links.length }}</div>
          </div>
        </div>
        
        <!-- 控制按鈕 -->
        <div class="control-buttons">
          <button 
            class="control-btn"
            @click="toggleAutoRotate"
            :class="{ active: autoRotate }"
          >
            {{ autoRotate ? '⏸️' : '▶️' }} 自動旋轉
          </button>
          
          <button class="control-btn" @click="resetCamera">
            🎯 重置視角
          </button>
          
          <button class="control-btn" @click="generateNewGraph">
            🔄 重新生成
          </button>
        </div>
        
        <!-- 選中節點資訊 -->
        <div v-if="selectedNode" class="node-info-card">
          <div class="node-info-header">
            <span class="node-icon">{{ selectedNode.icon }}</span>
            <span class="node-name">{{ selectedNode.name }}</span>
          </div>
          <div class="node-info-details">
            <div class="detail-row">
              <span class="detail-label">類型:</span>
              <span class="detail-value">{{ selectedNode.type }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">連結數:</span>
              <span class="detail-value">{{ selectedNode.connections }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';

// ===== Props & Emits =====
defineEmits(['close']);

// ===== State =====
const graphContainer = ref(null);
const autoRotate = ref(true);
const selectedNode = ref(null);
let graph = null;
let animationFrameId = null;

// 節點類型配置 (Anytype 風格)
const nodeTypes = [
  { type: '文件', color: '#335eea', icon: '📄', size: 6 },
  { type: '任務', color: '#ff8e3c', icon: '✓', size: 5 },
  { type: '概念', color: '#00c2a8', icon: '💡', size: 7 },
  { type: '人物', color: '#8b5cf6', icon: '👤', size: 5 },
  { type: '位置', color: '#f59e0b', icon: '📍', size: 4 },
  { type: '事件', color: '#ec4899', icon: '📅', size: 5 }
];

// ===== Mock Data 生成 =====
const generateMockData = () => {
  const nodes = [];
  const links = [];
  const nodeCount = 35;
  
  // 生成節點
  for (let i = 0; i < nodeCount; i++) {
    const typeConfig = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    nodes.push({
      id: `node-${i}`,
      name: `${typeConfig.type} ${i + 1}`,
      type: typeConfig.type,
      color: typeConfig.color,
      icon: typeConfig.icon,
      size: typeConfig.size,
      connections: 0
    });
  }
  
  // 生成連結 (模擬神經網絡)
  const linkCount = Math.floor(nodeCount * 1.5); // 每個節點平均 1.5 個連結
  for (let i = 0; i < linkCount; i++) {
    const source = nodes[Math.floor(Math.random() * nodeCount)];
    const target = nodes[Math.floor(Math.random() * nodeCount)];
    
    if (source.id !== target.id) {
      links.push({
        source: source.id,
        target: target.id
      });
      source.connections++;
      target.connections++;
    }
  }
  
  return { nodes, links };
};

const graphData = ref(generateMockData());

// ===== 3D 圖表初始化 =====
const initGraph = () => {
  if (!graphContainer.value) return;
  
  graph = ForceGraph3D()(graphContainer.value)
    .graphData(graphData.value)
    .backgroundColor('#000000')
    .nodeLabel(node => `${node.name} (${node.type})`)
    .nodeColor(node => node.color)
    .nodeVal(node => node.size)
    .nodeOpacity(0.9)
    .linkColor(() => 'rgba(255, 255, 255, 0.15)')
    .linkWidth(0.5)
    .linkOpacity(0.4)
    .linkDirectionalParticles(2)
    .linkDirectionalParticleWidth(1)
    .linkDirectionalParticleSpeed(0.005)
    .onNodeClick(node => {
      selectedNode.value = node;
      console.log('選中節點:', node);
    })
    .onBackgroundClick(() => {
      selectedNode.value = null;
    });
  
  // 設置相機初始位置
  graph.cameraPosition({ z: 300 });
  
  // 添加環境光效
  const scene = graph.scene();
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0x335eea, 1, 1000);
  pointLight.position.set(200, 200, 200);
  scene.add(pointLight);
  
  // 啟動自動旋轉
  if (autoRotate.value) {
    startAutoRotate();
  }
};

// ===== 自動旋轉 =====
const startAutoRotate = () => {
  const rotateCamera = () => {
    if (!graph || !autoRotate.value) return;
    
    const camera = graph.camera();
    const angle = Date.now() * 0.0001;
    const distance = 300;
    
    camera.position.x = distance * Math.sin(angle);
    camera.position.z = distance * Math.cos(angle);
    camera.lookAt(graph.scene().position);
    
    animationFrameId = requestAnimationFrame(rotateCamera);
  };
  
  rotateCamera();
};

const stopAutoRotate = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value;
  if (autoRotate.value) {
    startAutoRotate();
  } else {
    stopAutoRotate();
  }
};

// ===== 相機控制 =====
const resetCamera = () => {
  if (!graph) return;
  graph.cameraPosition(
    { x: 0, y: 0, z: 300 }, // 新位置
    { x: 0, y: 0, z: 0 },   // 視點
    1000                     // 過渡時間
  );
};

// ===== 重新生成圖譜 =====
const generateNewGraph = () => {
  graphData.value = generateMockData();
  selectedNode.value = null;
  if (graph) {
    graph.graphData(graphData.value);
    resetCamera();
  }
};

// ===== 生命週期 =====
onMounted(() => {
  setTimeout(() => {
    initGraph();
  }, 100);
  
  console.log('🌐 全螢幕圖譜已載入');
});

onUnmounted(() => {
  stopAutoRotate();
  if (graph) {
    graph._destructor();
  }
  console.log('🌐 全螢幕圖譜已卸載');
});
</script>

<style scoped>
/* ===== 全螢幕容器 ===== */
.fullscreen-graph-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #000000;
}

/* ===== 3D 畫布 ===== */
.graph-canvas {
  width: 100%;
  height: 100%;
}

/* ===== 浮動控制面板 ===== */
.floating-controls {
  position: absolute;
  top: 80px;
  right: 24px;
  width: 280px;
  background: rgba(17, 17, 17, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  z-index: 10;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-primary);
}

.control-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.control-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 統計卡片 ===== */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  padding: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-orange);
  font-family: 'Consolas', monospace;
}

/* ===== 控制按鈕 ===== */
.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-btn {
  width: 100%;
  padding: 10px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.control-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-focus);
  transform: translateX(2px);
}

.control-btn.active {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
  color: #ffffff;
}

/* ===== 節點資訊卡片 ===== */
.node-info-card {
  padding: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--primary-blue);
  border-radius: 8px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.node-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-primary);
}

.node-icon {
  font-size: 20px;
}

.node-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.node-info-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* ===== 響應式 ===== */
@media (max-width: 768px) {
  .floating-controls {
    width: calc(100% - 32px);
    left: 16px;
    right: 16px;
    top: 70px;
  }
}
</style>
