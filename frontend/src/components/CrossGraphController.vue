<template>
  <div class="cross-graph-controller" :class="{ 'is-dark': layoutStore.theme === 'dark' }">
    <!-- 控制器頭部 -->
    <div class="controller-header">
      <div class="header-left">
        <span class="icon">🔗</span>
        <h3 class="title">跨圖譜模式</h3>
        <el-tag 
          :type="graphStore.isCrossGraphMode ? 'success' : 'info'" 
          size="small"
          effect="dark"
        >
          {{ graphStore.isCrossGraphMode ? '已啟用' : '未啟用' }}
        </el-tag>
      </div>
      <el-button 
        v-if="graphStore.isCrossGraphMode"
        size="small" 
        type="danger"
        plain
        @click="exitCrossGraphMode"
      >
        退出跨圖譜
      </el-button>
    </div>
    
    <!-- 圖譜選擇器 -->
    <div class="graph-selector">
      <div class="selector-title">
        <span class="icon">📊</span>
        <span>選擇要顯示的圖譜</span>
      </div>
      
      <div class="graph-list">
        <div 
          v-for="graph in availableGraphs" 
          :key="graph.id"
          class="graph-item"
          :class="{ 
            'is-active': isGraphActive(graph.id),
            'is-disabled': !graphStore.isCrossGraphMode && activeGraphCount >= 2
          }"
          @click="toggleGraph(graph.id)"
        >
          <div class="graph-icon" :style="{ color: graph.color }">
            {{ graph.icon }}
          </div>
          <div class="graph-info">
            <div class="graph-name">{{ graph.name }}</div>
            <div class="graph-meta">
              {{ graph.nodeCount }} 節點 · {{ graph.linkCount }} 連接
            </div>
          </div>
          <div class="graph-status">
            <el-checkbox 
              :model-value="isGraphActive(graph.id)"
              @change="toggleGraph(graph.id)"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- AI Link 統計 -->
    <div v-if="graphStore.isCrossGraphMode && aiLinkStats" class="ai-link-stats">
      <div class="stats-title">
        <span class="icon">✨</span>
        <span>AI Link 統計</span>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">總連接</div>
          <div class="stat-value">{{ aiLinkStats.total }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">高置信度</div>
          <div class="stat-value confidence-high">{{ aiLinkStats.byConfidence.high }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">中置信度</div>
          <div class="stat-value confidence-medium">{{ aiLinkStats.byConfidence.medium }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">平均置信度</div>
          <div class="stat-value">{{ (aiLinkStats.avgConfidence * 100).toFixed(0) }}%</div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-button 
        size="small"
        type="primary"
        :disabled="selectedGraphs.length < 2"
        @click="loadSelectedGraphs"
      >
        <span class="icon">🚀</span>
        加載選中圖譜
      </el-button>
      
      <el-button 
        v-if="graphStore.isCrossGraphMode"
        size="small"
        type="warning"
        @click="regenerateAILinks"
      >
        <span class="icon">🤖</span>
        重新生成 AI Link
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import { ElMessage } from 'element-plus';

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

// ===== State =====
const selectedGraphs = ref([]);

// 可用圖譜列表（硬編碼測試數據）
const availableGraphs = ref([
  {
    id: 'graph-tech',
    name: '🧠 技術圖譜',
    icon: '🧠',
    color: '#448aff',
    nodeCount: 15,
    linkCount: 20,
    description: 'AI 與開發技術知識體系'
  },
  {
    id: 'graph-learning',
    name: '📚 學習圖譜',
    icon: '📚',
    color: '#4caf50',
    nodeCount: 12,
    linkCount: 15,
    description: '個人學習與成長記錄'
  }
]);

// ===== Computed =====
const activeGraphCount = computed(() => {
  return graphStore.activeGraphIds.length;
});

const aiLinkStats = computed(() => {
  if (!graphStore.isCrossGraphMode) return null;
  return graphStore.getAILinkStats();
});

// ===== Methods =====
const isGraphActive = (graphId) => {
  return graphStore.activeGraphIds.includes(graphId);
};

const toggleGraph = (graphId) => {
  const index = selectedGraphs.value.indexOf(graphId);
  if (index > -1) {
    selectedGraphs.value.splice(index, 1);
  } else {
    if (selectedGraphs.value.length >= 2) {
      ElMessage.warning('⚠️ 最多同時顯示 2 個圖譜');
      return;
    }
    selectedGraphs.value.push(graphId);
  }
};

const loadSelectedGraphs = async () => {
  if (selectedGraphs.value.length < 2) {
    ElMessage.warning('⚠️ 請至少選擇 2 個圖譜');
    return;
  }
  
  try {
    await graphStore.loadCrossGraphData(selectedGraphs.value);
    
    ElMessage.success({
      message: `✅ 已加載 ${selectedGraphs.value.length} 個圖譜，發現 ${aiLinkStats.value?.total || 0} 個 AI Link`,
      duration: 3000
    });
  } catch (error) {
    ElMessage.error('❌ 加載跨圖譜數據失敗: ' + error.message);
  }
};

const exitCrossGraphMode = () => {
  graphStore.exitCrossGraphMode();
  selectedGraphs.value = [];
  ElMessage.info('已退出跨圖譜模式');
};

const regenerateAILinks = () => {
  ElMessage.info('🤖 AI Link 重新生成功能開發中...');
};
</script>

<style scoped>
.cross-graph-controller {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cross-graph-controller.is-dark {
  background: #1a1a2e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 頭部 */
.controller-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.is-dark .controller-header {
  border-bottom-color: #2d2d44;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left .icon {
  font-size: 20px;
}

.header-left .title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.is-dark .header-left .title {
  color: #e5e5e5;
}

/* 圖譜選擇器 */
.graph-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.is-dark .selector-title {
  color: #94a3b8;
}

.graph-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.graph-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.is-dark .graph-item {
  background: #16213e;
}

.graph-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.is-dark .graph-item:hover {
  background: #1e293b;
  border-color: #2d2d44;
}

.graph-item.is-active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.is-dark .graph-item.is-active {
  background: #1e3a5f;
  border-color: #3b82f6;
}

.graph-item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.graph-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 10px;
}

.graph-info {
  flex: 1;
}

.graph-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.is-dark .graph-name {
  color: #e5e5e5;
}

.graph-meta {
  font-size: 12px;
  color: #64748b;
}

.is-dark .graph-meta {
  color: #94a3b8;
}

/* AI Link 統計 */
.ai-link-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 10px;
}

.is-dark .ai-link-stats {
  background: linear-gradient(135deg, #422006 0%, #713f12 100%);
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
}

.is-dark .stats-title {
  color: #fbbf24;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.is-dark .stat-item {
  background: rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 12px;
  color: #78350f;
}

.is-dark .stat-label {
  color: #fbbf24;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #92400e;
}

.is-dark .stat-value {
  color: #fef3c7;
}

.stat-value.confidence-high {
  color: #22c55e;
}

.stat-value.confidence-medium {
  color: #f59e0b;
}

/* 快速操作 */
.quick-actions {
  display: flex;
  gap: 8px;
}

.quick-actions .el-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.quick-actions .icon {
  font-size: 16px;
}
</style>
