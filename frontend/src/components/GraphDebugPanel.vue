<template>
  <div 
    v-if="isVisible" 
    class="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-lg text-white p-4 rounded-xl shadow-2xl border border-white/10 z-[9999] max-w-md"
  >
    <!-- 標題欄 -->
    <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
      <div class="flex items-center gap-2">
        <span class="text-lg">🔧</span>
        <h3 class="text-sm font-bold">圖譜數據管理器</h3>
      </div>
      <button 
        @click="togglePanel" 
        class="text-gray-400 hover:text-white transition-colors text-xs px-2 py-1 hover:bg-white/10 rounded"
      >
        {{ isExpanded ? '收起' : '展開' }}
      </button>
    </div>

    <!-- 展開內容 -->
    <div v-if="isExpanded" class="space-y-3 text-xs">
      <!-- 緩存狀態 -->
      <div class="bg-white/5 rounded-lg p-3">
        <div class="flex items-center gap-2 mb-2">
          <span>💾</span>
          <h4 class="font-semibold text-xs">緩存狀態</h4>
        </div>
        <div class="space-y-1 text-gray-300">
          <div class="flex justify-between">
            <span>圖譜緩存:</span>
            <span class="font-mono">{{ stats.size }}/{{ stats.maxSize }}</span>
          </div>
          <div class="flex justify-between">
            <span>元數據:</span>
            <span class="font-mono">{{ stats.metadataCount }} 個</span>
          </div>
          <div v-if="stats.keys.length > 0" class="mt-2 pt-2 border-t border-white/10">
            <div class="text-gray-400 mb-1">已緩存圖譜 ID:</div>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="key in stats.keys" 
                :key="key"
                class="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-xs"
              >
                {{ key }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加載狀態 -->
      <div class="bg-white/5 rounded-lg p-3">
        <div class="flex items-center gap-2 mb-2">
          <span>⚡</span>
          <h4 class="font-semibold text-xs">加載狀態</h4>
        </div>
        <div class="space-y-1 text-gray-300">
          <div class="flex justify-between">
            <span>狀態:</span>
            <span :class="loadingState.isLoading ? 'text-yellow-400' : 'text-green-400'">
              {{ loadingState.isLoading ? '加載中...' : '空閒' }}
            </span>
          </div>
          <div v-if="loadingState.currentGraphId" class="flex justify-between">
            <span>當前圖譜:</span>
            <span class="font-mono">{{ loadingState.currentGraphId }}</span>
          </div>
          <div v-if="loadingState.error" class="text-red-400 text-xs mt-2 p-2 bg-red-500/10 rounded">
            {{ loadingState.error }}
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="flex gap-2">
        <button 
          @click="clearCache"
          class="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-xs font-medium"
        >
          清空緩存
        </button>
        <button 
          @click="refreshData"
          class="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-xs font-medium"
        >
          強制刷新
        </button>
      </div>

      <!-- 提示 -->
      <div class="text-gray-500 text-xs pt-2 border-t border-white/10">
        按 <kbd class="px-1.5 py-0.5 bg-white/10 rounded">Ctrl+Shift+D</kbd> 切換面板
      </div>
    </div>

    <!-- 收起狀態 -->
    <div v-else class="text-gray-400 text-xs">
      緩存: {{ stats.size }}/{{ stats.maxSize }} | 
      <span :class="loadingState.isLoading ? 'text-yellow-400' : 'text-green-400'">
        {{ loadingState.isLoading ? '●' : '○' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import graphDataManager from '../services/GraphDataManager.js';
import { useGraphStore } from '../stores/graphStore';
import { ElMessage } from 'element-plus';

const graphStore = useGraphStore();

// 狀態
const isVisible = ref(false);
const isExpanded = ref(true);
const stats = ref({
  size: 0,
  maxSize: 10,
  keys: [],
  metadataCount: 0,
  metadataCached: false
});
const loadingState = ref({
  isLoading: false,
  currentGraphId: null,
  progress: 0,
  error: null
});

// 更新統計數據
const updateStats = () => {
  stats.value = graphDataManager.getCacheStats();
  loadingState.value = graphDataManager.getLoadingState();
};

// 切換面板
const togglePanel = () => {
  isExpanded.value = !isExpanded.value;
};

// 清空緩存
const clearCache = () => {
  graphDataManager.invalidateCache();
  graphDataManager.invalidateMetadataCache();
  updateStats();
  ElMessage.success('緩存已清空');
};

// 強制刷新
const refreshData = async () => {
  try {
    await graphStore.fetchGraphData(graphStore.currentGraphId, { forceRefresh: true });
    await graphStore.loadGraphMetadataList({ forceRefresh: true });
    ElMessage.success('數據已刷新');
  } catch (error) {
    ElMessage.error('刷新失敗: ' + error.message);
  }
};

// 鍵盤快捷鍵
const handleKeyPress = (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    isVisible.value = !isVisible.value;
    if (isVisible.value) {
      updateStats();
    }
  }
};

// 定時更新
let updateTimer = null;

onMounted(() => {
  // 監聽鍵盤事件
  window.addEventListener('keydown', handleKeyPress);
  
  // 僅在開發模式下顯示
  if (import.meta.env.DEV) {
    isVisible.value = false; // 默認隱藏，按 Ctrl+Shift+D 顯示
  }
  
  // 定時更新統計
  updateTimer = setInterval(updateStats, 1000);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  if (updateTimer) clearInterval(updateTimer);
});
</script>

<style scoped>
kbd {
  font-family: 'Consolas', monospace;
  font-size: 0.75rem;
}
</style>
