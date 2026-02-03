<script setup>
import { ref, computed, watch, markRaw, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 動態導入圖譜組件（需要時才加載）
// import GraphView from '../../views/GraphView.vue';
// import Graph3D from '../../views/Graph3D.vue';

// 臨時佔位符組件
const GraphPlaceholder2D = {
  template: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'Courier New', monospace;
    ">
      <div style="font-size: 60px; margin-bottom: 20px;">📊</div>
      <h2 style="font-size: 24px; margin: 0 0 10px 0; color: var(--primary-blue); letter-spacing: -0.02em;">
        2D GRAPH VIEW
      </h2>
      <p style="font-size: 14px; color: var(--text-secondary); margin: 0;">
        2D 知識圖譜視圖正在開發中...
      </p>
    </div>
  `
};

const GraphPlaceholder3D = {
  template: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'Courier New', monospace;
    ">
      <div style="font-size: 60px; margin-bottom: 20px;">🌐</div>
      <h2 style="font-size: 24px; margin: 0 0 10px 0; color: var(--primary-blue); letter-spacing: -0.02em;">
        3D GRAPH VIEW
      </h2>
      <p style="font-size: 14px; color: var(--text-secondary); margin: 0;">
        3D 知識圖譜視圖正在開發中...
      </p>
      <div style="
        margin-top: 30px;
        padding: 12px 24px;
        border: 1px solid var(--border-primary);
        background: var(--bg-elevated);
        font-size: 12px;
        letter-spacing: 2px;
        color: var(--text-secondary);
      ">
        FORCE-DIRECTED GRAPH ENGINE
      </div>
    </div>
  `
};

// ===== Props =====
const props = defineProps({
  data: {
    type: Object,
    default: () => ({ graphId: 'default', type: '3d' })
  }
});

// ===== State =====
const currentView = ref(props.data?.type || '3d');
const graphId = ref(props.data?.graphId || 'default');
const graphRef = ref(null);

const graphStats = ref({
  nodes: 156,
  links: 342,
  clusters: 8
});

// ===== Computed =====
const currentGraphComponent = computed(() => {
  if (currentView.value === '2d') {
    return markRaw(GraphPlaceholder2D);
  } else {
    return markRaw(GraphPlaceholder3D);
  }
});

// ===== Watch =====
watch(() => props.data, (newData) => {
  if (newData) {
    if (newData.type) {
      currentView.value = newData.type;
    }
    if (newData.graphId) {
      graphId.value = newData.graphId;
    }
  }
}, { deep: true, immediate: true });

// ===== Methods =====
const switchView = (mode) => {
  currentView.value = mode;
  ElMessage.success(`切換到 ${mode.toUpperCase()} 視圖`);
};

const resetView = () => {
  ElMessage.info('重置圖譜視圖');
  // 這裡可以添加重置邏輯
};

const exportGraph = () => {
  ElMessage.success('匯出圖譜數據');
  // 這裡可以添加匯出邏輯
};

// ===== Lifecycle =====
onMounted(() => {
  console.log('🌐 GraphPanel 已載入');
  console.log('當前視圖:', currentView.value);
  console.log('圖譜 ID:', graphId.value);
});
</script>

<template>
  <div class="graph-panel">
    <!-- Cyberpunk 工具列 -->
    <div class="graph-toolbar">
      <div class="toolbar-left">
        <span class="graph-icon">🌐</span>
        <div class="graph-info">
          <span class="graph-title">KNOWLEDGE GRAPH</span>
          <span class="graph-mode">{{ currentView.toUpperCase() }} MODE</span>
        </div>
      </div>
      <div class="toolbar-center">
        <button 
          :class="['view-toggle', { active: currentView === '2d' }]"
          @click="switchView('2d')"
        >
          <span class="toggle-icon">📊</span>
          <span class="toggle-label">2D</span>
        </button>
        <div class="toggle-divider"></div>
        <button 
          :class="['view-toggle', { active: currentView === '3d' }]"
          @click="switchView('3d')"
        >
          <span class="toggle-icon">🌐</span>
          <span class="toggle-label">3D</span>
        </button>
      </div>
      <div class="toolbar-right">
        <button class="cyber-tool-btn" @click="resetView" title="重置視圖">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">RESET</span>
        </button>
        <button class="cyber-tool-btn" @click="exportGraph" title="匯出圖譜">
          <span class="btn-icon">💾</span>
          <span class="btn-text">EXPORT</span>
        </button>
      </div>
    </div>
    
    <!-- 圖譜容器 -->
    <div class="graph-container">
      <component 
        :is="currentGraphComponent" 
        :graphId="graphId"
        ref="graphRef"
      />
    </div>
    
    <!-- 圖譜統計面板 -->
    <div class="graph-stats">
      <div class="stat-item">
        <span class="stat-label">NODES</span>
        <span class="stat-value">{{ graphStats.nodes }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">LINKS</span>
        <span class="stat-value">{{ graphStats.links }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">CLUSTERS</span>
        <span class="stat-value">{{ graphStats.clusters }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

/* ===== 工具列 ===== */
.graph-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-primary);
  z-index: 10;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.graph-icon {
  font-size: 24px;
}

.graph-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.graph-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.graph-mode {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--accent-orange);
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.view-toggle.active {
  background: var(--bg-elevated);
  color: var(--primary-blue);
  border-left: 3px solid var(--primary-blue);
  font-weight: 600;
}

.toggle-icon {
  font-size: 16px;
}

.toggle-label {
  font-weight: 700;
  letter-spacing: 1px;
}

.toggle-divider {
  width: 1px;
  height: 24px;
  background: var(--border-primary);
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.cyber-tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cyber-tool-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-focus);
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  letter-spacing: 1px;
}

/* ===== 圖譜容器 ===== */
.graph-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* ===== 圖譜統計面板 ===== */
.graph-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-primary);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: var(--accent-orange);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border-primary);
}
</style>
