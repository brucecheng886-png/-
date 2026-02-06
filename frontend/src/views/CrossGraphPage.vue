<template>
  <div class="cross-graph-page custom-scrollbar">
    <!-- 頁面頭部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <span class="header-icon">🔗</span>
          <div class="header-text">
            <h1 class="page-title">跨圖譜智能連接</h1>
            <p class="page-subtitle">同時管理多個知識圖譜，AI 自動發現關聯</p>
          </div>
        </div>
        <el-tag 
          :type="graphStore.isCrossGraphMode ? 'success' : 'info'" 
          size="large"
          effect="dark"
        >
          {{ graphStore.isCrossGraphMode ? '✓ 已啟用' : '未啟用' }}
        </el-tag>
      </div>
    </div>

    <!-- 主內容區 -->
    <div class="page-content">
      <!-- 左側：圖譜選擇 -->
      <div class="selection-panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <span class="icon">📊</span>
            選擇要連接的圖譜
          </h2>
          <p class="panel-desc">請選擇至少 2 個圖譜進行跨圖譜連接</p>
          <!-- 刷新按鈕 -->
          <el-button 
            type="primary"
            @click="refreshGraphList"
            class="sync-button"
            :loading="isSyncing"
          >
            <span v-if="!isSyncing">🔄 刷新圖譜列表</span>
            <span v-else>刷新中...</span>
          </el-button>
        </div>

        <!-- 空狀態提示 -->
        <div v-if="availableGraphs.length === 0" class="empty-graphs-state">
          <div class="empty-icon">📊</div>
          <h3 class="empty-title">尚無可用的圖譜</h3>
          <p class="empty-desc">
            請先在「圖譜工作檯」中載入圖譜數據，<br>
            載入後會自動註冊到此列表。
          </p>
          <el-button 
            type="primary" 
            @click="$router.push('/nexus')"
            class="goto-workspace-button"
          >
            前往圖譜工作檯
          </el-button>
        </div>

        <div class="graph-cards" v-else>
          <div 
            v-for="graph in availableGraphs" 
            :key="graph.id"
            class="graph-card"
            :class="{ 
              'is-selected': isGraphSelected(graph.id),
              'is-disabled': !isGraphSelected(graph.id) && selectedGraphs.length >= 2
            }"
            @click="toggleGraphSelection(graph.id)"
          >
            <!-- 選中指示器 -->
            <div class="card-selector">
              <div class="checkbox" :class="{ 'is-checked': isGraphSelected(graph.id) }">
                <span v-if="isGraphSelected(graph.id)" class="checkmark">✓</span>
              </div>
            </div>

            <!-- 圖譜圖標 -->
            <div class="card-icon" :style="{ background: graph.color + '20', color: graph.color }">
              <span class="icon-large">{{ graph.icon }}</span>
            </div>

            <!-- 圖譜信息 -->
            <div class="card-info">
              <h3 class="card-title">{{ graph.name }}</h3>
              <p class="card-description">{{ graph.description }}</p>
              <div class="card-stats">
                <span class="stat-item">
                  <span class="stat-icon">●</span>
                  <span class="stat-value">{{ graph.nodeCount }}</span>
                  <span class="stat-label">節點</span>
                </span>
                <span class="stat-divider">·</span>
                <span class="stat-item">
                  <span class="stat-icon">━</span>
                  <span class="stat-value">{{ graph.linkCount }}</span>
                  <span class="stat-label">連接</span>
                </span>
              </div>
            </div>

            <!-- 選中標記 -->
            <div v-if="isGraphSelected(graph.id)" class="selected-badge">
              已選擇
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="action-buttons">
          <el-button 
            type="primary"
            size="large"
            :disabled="selectedGraphs.length < 2"
            :loading="isLoading"
            @click="loadSelectedGraphs"
            class="action-button primary-button"
          >
            <span class="button-icon">🚀</span>
            <span class="button-text">
              {{ isLoading ? '加載中...' : '啟動跨圖譜連接' }}
            </span>
          </el-button>

          <el-button 
            v-if="graphStore.isCrossGraphMode"
            type="danger"
            size="large"
            plain
            @click="exitCrossGraphMode"
            class="action-button"
          >
            <span class="button-icon">✕</span>
            <span class="button-text">退出跨圖譜模式</span>
          </el-button>
        </div>
      </div>

      <!-- 右側：統計與預覽 -->
      <div class="stats-panel">
        <!-- 選擇提示 -->
        <div v-if="!graphStore.isCrossGraphMode" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3 class="empty-title">請選擇要連接的圖譜</h3>
          <p class="empty-desc">
            選擇左側的圖譜卡片，至少選擇 2 個<br>
            系統將自動分析並建立智能連接
          </p>
          <div class="selection-count">
            <span class="count-number">{{ selectedGraphs.length }}</span>
            <span class="count-label">/ 2 個圖譜已選擇</span>
          </div>
        </div>

        <!-- AI Link 統計 -->
        <div v-else class="stats-content">
          <div class="stats-header">
            <h2 class="stats-title">
              <span class="icon">✨</span>
              AI Link 統計
            </h2>
          </div>

          <div class="stats-grid">
            <div class="stat-card total">
              <div class="stat-icon">🔗</div>
              <div class="stat-info">
                <div class="stat-number">{{ aiLinkStats?.total || 0 }}</div>
                <div class="stat-name">總連接數</div>
              </div>
            </div>

            <div class="stat-card high">
              <div class="stat-icon">⭐</div>
              <div class="stat-info">
                <div class="stat-number">{{ aiLinkStats?.byConfidence.high || 0 }}</div>
                <div class="stat-name">高置信度</div>
              </div>
            </div>

            <div class="stat-card medium">
              <div class="stat-icon">💫</div>
              <div class="stat-info">
                <div class="stat-number">{{ aiLinkStats?.byConfidence.medium || 0 }}</div>
                <div class="stat-name">中置信度</div>
              </div>
            </div>

            <div class="stat-card average">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-number">{{ Math.round((aiLinkStats?.avgConfidence || 0) * 100) }}%</div>
                <div class="stat-name">平均置信度</div>
              </div>
            </div>
          </div>

          <!-- 圖譜信息 -->
          <div class="loaded-graphs">
            <h3 class="section-title">已加載的圖譜</h3>
            <div class="loaded-list">
              <div 
                v-for="graphId in graphStore.activeGraphIds" 
                :key="graphId"
                class="loaded-item"
              >
                <span class="loaded-icon">{{ getGraphIcon(graphId) }}</span>
                <span class="loaded-name">{{ getGraphName(graphId) }}</span>
                <el-tag size="small" type="success">活動中</el-tag>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions">
            <el-button 
              size="default"
              @click="viewInGraph"
              class="quick-button"
            >
              <span class="icon">🌐</span>
              在圖譜工作台查看
            </el-button>
            <el-button 
              size="default"
              @click="regenerateAILinks"
              class="quick-button"
            >
              <span class="icon">🤖</span>
              重新生成連接
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import { ElMessage } from 'element-plus';

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();
const router = useRouter();

// ===== State =====
const selectedGraphs = ref([]);
const isLoading = ref(false);
const isSyncing = ref(false);

// 可用圖譜列表 - 從 graphStore 動態獲取（與工作檯共用數據庫）
const availableGraphs = computed(() => {
  console.log('🔍 當前 graphMetadataList:', graphStore.graphMetadataList);
  
  // 過濾掉快照類型的圖譜，只顯示真實的圖譜數據
  const realGraphs = graphStore.graphMetadataList.filter(graph => {
    if (!graph || !graph.name) return false;
    
    // 確保 id 是字符串
    const graphId = String(graph.id || '');
    const graphName = String(graph.name || '');
    
    // 排除包含「快照」或以 'workspace-snapshot-' 開頭的圖譜
    return !graphName.includes('快照') && 
           !graphName.includes('snapshot') && 
           !graphId.startsWith('workspace-snapshot-');
  });
  
  console.log('✅ 過濾後的圖譜:', realGraphs);
  return realGraphs;
});

// ===== Computed =====
const aiLinkStats = computed(() => {
  if (!graphStore.isCrossGraphMode) return null;
  return graphStore.getAILinkStats();
});

// ===== Methods =====
const isGraphSelected = (graphId) => {
  return selectedGraphs.value.includes(graphId);
};

const toggleGraphSelection = (graphId) => {
  const index = selectedGraphs.value.indexOf(graphId);
  if (index > -1) {
    selectedGraphs.value.splice(index, 1);
  } else {
    if (selectedGraphs.value.length >= 2) {
      ElMessage.warning('最多同時選擇 2 個圖譜');
      return;
    }
    selectedGraphs.value.push(graphId);
  }
};

const loadSelectedGraphs = async () => {
  if (selectedGraphs.value.length < 2) {
    ElMessage.warning('請至少選擇 2 個圖譜');
    return;
  }

  isLoading.value = true;
  try {
    await graphStore.loadCrossGraphData(selectedGraphs.value);
    
    ElMessage.success({
      message: `✅ 成功加載 ${selectedGraphs.value.length} 個圖譜，發現 ${aiLinkStats.value?.total || 0} 個 AI Link`,
      duration: 3000
    });
  } catch (error) {
    ElMessage.error('加載跨圖譜數據失敗: ' + error.message);
  } finally {
    isLoading.value = false;
  }
};

const exitCrossGraphMode = () => {
  graphStore.exitCrossGraphMode();
  selectedGraphs.value = [];
  ElMessage.info('已退出跨圖譜模式');
};

const viewInGraph = () => {
  router.push('/graph-page');
};

const regenerateAILinks = () => {
  ElMessage.info('🤖 AI Link 重新生成功能開發中...');
};

const getGraphIcon = (graphId) => {
  const graph = availableGraphs.value.find(g => g.id === graphId);
  return graph?.icon || '📊';
};

const getGraphName = (graphId) => {
  const graph = availableGraphs.value.find(g => g.id === graphId);
  return graph?.name || graphId;
};

const refreshGraphList = () => {
  isSyncing.value = true;
  try {
    console.log('🔄 刷新圖譜列表...');
    
    // 從 localStorage 重新載入圖譜元數據
    const savedMetadata = localStorage.getItem('graphMetadataList');
    if (savedMetadata) {
      let metadata = JSON.parse(savedMetadata);
      
      // 清理快照類型的圖譜
      const originalCount = metadata.length;
      metadata = metadata.filter(graph => {
        if (!graph || !graph.name) return false;
        
        // 確保 id 是字符串
        const graphId = String(graph.id || '');
        const graphName = String(graph.name || '');
        
        return !graphName.includes('快照') && 
               !graphName.includes('snapshot') && 
               !graphId.startsWith('workspace-snapshot-');
      });
      
      // 如果有清理，重新保存
      if (metadata.length < originalCount) {
        graphStore.graphMetadataList = metadata;
        localStorage.setItem('graphMetadataList', JSON.stringify(metadata));
        console.log(`🗑️ 已清理 ${originalCount - metadata.length} 個快照圖譜`);
      }
      
      console.log('✅ 從 localStorage 載入', metadata.length, '個圖譜');
      
      if (metadata.length === 0) {
        ElMessage.info('尚無已註冊的圖譜，請先在圖譜工作檯載入數據');
      } else {
        ElMessage.success(`✅ 已載入 ${metadata.length} 個圖譜`);
      }
    } else {
      console.log('⚠️ localStorage 無圖譜數據');
      ElMessage.info('尚無已註冊的圖譜，請先在圖譜工作檯載入數據');
    }
    
  } catch (error) {
    console.error('❌ 刷新失敗:', error);
    ElMessage.error(error.message || '刷新失敗');
  } finally {
    isSyncing.value = false;
  }
};


// ===== Lifecycle =====
onMounted(async () => {
  console.log('🚀 CrossGraphPage mounted');
  console.log('📊 當前圖譜元數據數量:', graphStore.graphMetadataList.length);
  
  // 🌟 自動載入圖譜數據以確保同步
  try {
    console.log('🔄 [CrossGraphPage] 自動載入圖譜數據');
    await graphStore.fetchGraphData(graphStore.currentGraphId);
    console.log('✅ [CrossGraphPage] 圖譜數據已載入:', graphStore.nodeCount, '個節點');
  } catch (error) {
    console.warn('⚠️ [CrossGraphPage] 圖譜數據載入失敗:', error.message);
  }
  
  // 提示用戶
  const realGraphsCount = availableGraphs.value.length;
  if (realGraphsCount === 0) {
    console.log('⚠️ 尚無已註冊的圖譜');
    ElMessage.info('請先在「圖譜工作檯」中載入圖譜數據');
  } else {
    console.log('✅ 已有', realGraphsCount, '個圖譜可用');
  }
});
</script>

<style scoped>
.cross-graph-page {
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  background: #0a0e27;
  padding: 32px;
}

/* 滾動條樣式 */
.cross-graph-page::-webkit-scrollbar {
  width: 10px;
}

.cross-graph-page::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.cross-graph-page::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
  border-radius: 5px;
}

.cross-graph-page::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2563eb, #7c3aed);
}

/* 頁面頭部 */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a1d3a;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3154;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 48px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #e5e5e5;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #94a3b8;
}

/* 主內容區 */
.page-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

/* 左側選擇面板 */
.selection-panel {
  background: #1a1d3a;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3154;
}

.panel-header {
  margin-bottom: 32px;
  position: relative;
}

.sync-button {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 14px;
  padding: 8px 20px;
  height: auto;
  background: rgba(59, 130, 246, 0.75);
  border-color: rgba(59, 130, 246, 0.75);
  transition: all 0.3s ease;
}

.sync-button:hover {
  background: rgba(59, 130, 246, 0.9);
  border-color: rgba(59, 130, 246, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #e5e5e5;
}

.panel-title .icon {
  font-size: 24px;
}

.panel-desc {
  margin: 0;
  font-size: 16px;
  color: #94a3b8;
}

/* 圖譜卡片 */
.graph-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

/* 空狀態 */
.empty-graphs-state {
  padding: 80px 40px;
  text-align: center;
  background: rgba(26, 29, 58, 0.6);
  border-radius: 16px;
  border: 1px solid #2d3154;
  margin-bottom: 32px;
}

.empty-graphs-state .empty-icon {
  font-size: 96px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-graphs-state .empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #e5e5e5;
  margin: 0 0 16px 0;
}

.empty-graphs-state .empty-desc {
  font-size: 16px;
  color: #94a3b8;
  margin: 0 0 24px 0;
  line-height: 1.8;
}

.goto-workspace-button {
  font-size: 15px;
  padding: 12px 32px;
}

.graph-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: #252847;
  border: 3px solid #2d3154;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.graph-card:hover {
  background: #2d3154;
  border-color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.graph-card.is-selected {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.graph-card.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.graph-card.is-disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 選中指示器 */
.card-selector {
  flex-shrink: 0;
}

.checkbox {
  width: 32px;
  height: 32px;
  border: 3px solid #475569;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0e27;
  transition: all 0.3s ease;
}

.checkbox.is-checked {
  background: #3b82f6;
  border-color: #3b82f6;
  animation: checkPop 0.3s ease;
}

.checkmark {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

@keyframes checkPop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 圖譜圖標 */
.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-large {
  font-size: 48px;
}

/* 圖譜信息 */
.card-info {
  flex: 1;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #e5e5e5;
}

.card-description {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #94a3b8;
  line-height: 1.5;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #94a3b8;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-weight: 600;
  color: #3b82f6;
}

.stat-divider {
  opacity: 0.5;
}

/* 選中標記 */
.selected-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 16px;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* 操作按鈕 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
}

.primary-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.primary-button:hover {
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.5);
}

.button-icon {
  font-size: 20px;
}

/* 右側統計面板 */
.stats-panel {
  background: #1a1d3a;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3154;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 96px;
  margin-bottom: 32px;
  opacity: 0.6;
}

.empty-title {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #e5e5e5;
}

.empty-desc {
  margin: 0 0 32px 0;
  font-size: 16px;
  color: #94a3b8;
  line-height: 1.8;
}

.selection-count {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 24px;
  background: #252847;
  border-radius: 12px;
}

.count-number {
  font-size: 36px;
  font-weight: 700;
  color: #3b82f6;
}

.count-label {
  font-size: 16px;
  color: #94a3b8;
}

/* 統計內容 */
.stats-header {
  margin-bottom: 24px;
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #e5e5e5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: #252847;
}

.stat-card.total {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
}

.stat-card.high {
  background: linear-gradient(135deg, #14532d 0%, #166534 100%);
}

.stat-card.medium {
  background: linear-gradient(135deg, #422006 0%, #713f12 100%);
}

.stat-card.average {
  background: linear-gradient(135deg, #312e81 0%, #3730a3 100%);
}

.stat-card .stat-icon {
  font-size: 32px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #e5e5e5;
  margin-bottom: 4px;
}

.stat-name {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

/* 已加載圖譜 */
.loaded-graphs {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #e5e5e5;
}

.loaded-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loaded-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #252847;
  border-radius: 10px;
}

.loaded-icon {
  font-size: 24px;
}

.loaded-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #e5e5e5;
}

/* 快速操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.quick-button .icon {
  font-size: 16px;
}
</style>
