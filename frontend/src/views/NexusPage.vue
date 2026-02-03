<template>
  <div class="bg-gray-50 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#1a1a2e] min-h-screen px-12 py-10 flex flex-col gap-10">
    <!-- 頂部標題 -->
    <header class="text-center py-10">
      <div class="flex flex-col items-center gap-3">
        <h1 class="flex items-center gap-4 m-0 text-6xl font-extrabold text-gray-800 dark:text-white">
          <span class="text-7xl animate-float">🌌</span>
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">圖譜控制平台</span>
        </h1>
        <p class="text-base font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest m-0">Graph Control Platform</p>
      </div>
    </header>

    <!-- 圖譜卡片網格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1">
      <div 
        v-for="graph in graphList" 
        :key="graph.id"
        class="relative p-7 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-500 dark:hover:border-blue-500 overflow-hidden flex flex-col gap-5 group"
        @click="openGraph(graph.id)"
      >
        <!-- 卡片背景動畫 -->
        <div class="card-glow"></div>
        
        <!-- 卡片內容 -->
        <div class="flex items-center gap-4">
          <span class="text-5xl drop-shadow-md">{{ graph.icon }}</span>
          <h3 class="m-0 text-2xl font-bold text-gray-800 dark:text-white">{{ graph.name }}</h3>
        </div>
        
        <div class="flex gap-4 p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-blue-500/20 rounded-xl">
          <div class="flex-1 flex flex-col items-center gap-1">
            <span class="text-xl opacity-80">🔵</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">節點數</span>
            <span class="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{{ graph.nodeCount }}</span>
          </div>
          <div class="flex-1 flex flex-col items-center gap-1">
            <span class="text-xl opacity-80">🔗</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">連結數</span>
            <span class="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{{ graph.linkCount }}</span>
          </div>
        </div>
        
        <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/5">
          <span class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="text-base">⏱️</span>
            {{ graph.lastUpdate }}
          </span>
          <span class="px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-500/30 rounded-md text-sm font-semibold text-blue-700 dark:text-blue-400 tracking-wider">{{ graph.defaultView }}</span>
        </div>
        
        <!-- Hover 特效層 -->
        <div class="absolute inset-0 flex items-center justify-center gap-3 bg-blue-600/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
          <span class="text-xl font-bold text-white tracking-wider">開啟圖譜</span>
          <span class="text-2xl text-white animate-slide-right">→</span>
        </div>
      </div>
    </div>

    <!-- 底部操作區 -->
    <footer class="flex justify-center gap-4 py-5">
      <button class="px-7 py-3.5 flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-1" @click="createNewGraph">
        <span class="text-xl">➕</span>
        建立新圖譜
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGraphStore } from '../stores/graphStore';
import { ElMessage } from 'element-plus';

// ===== Composables =====
const router = useRouter();
const graphStore = useGraphStore();

// ===== Data =====
const graphList = ref([
  {
    id: 1,
    name: '主腦圖譜',
    icon: '🧠',
    nodeCount: '50+',
    linkCount: '80+',
    lastUpdate: '2 分鐘前',
    defaultView: '3D'
  },
  {
    id: 2,
    name: 'BruV 開發筆記',
    icon: '💻',
    nodeCount: 20,
    linkCount: 25,
    lastUpdate: '10 分鐘前',
    defaultView: '2D'
  },
  {
    id: 3,
    name: '私人日記',
    icon: '📖',
    nodeCount: 10,
    linkCount: 10,
    lastUpdate: '1 小時前',
    defaultView: '2D'
  },
  {
    id: 4,
    name: '團隊共享知識庫',
    icon: '🏢',
    nodeCount: 0,
    linkCount: 0,
    lastUpdate: '從未更新',
    defaultView: '3D'
  }
]);

// ===== Methods =====
const openGraph = async (graphId) => {
  try {
    // 載入圖譜數據
    await graphStore.fetchGraphData(graphId);
    
    const graph = graphList.value.find(g => g.id === graphId);
    ElMessage.success({
      message: `正在開啟「${graph.name}」...`,
      duration: 1500
    });
    
    // 延遲導航，讓用戶看到提示
    setTimeout(() => {
      router.push('/graph-page');
    }, 500);
    
    console.log('🚀 開啟圖譜:', graphId, graph);
  } catch (error) {
    console.error('❌ 開啟圖譜失敗:', error);
    ElMessage.error('圖譜載入失敗');
  }
};

const createNewGraph = () => {
  ElMessage.info('📝 建立新圖譜功能開發中...');
};
</script>

<style scoped>
/* 自定義動畫 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes slide-right {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(8px); }
}

.animate-slide-right {
  animation: slide-right 1s ease-in-out infinite;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(68, 138, 255, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.group:hover .card-glow {
  opacity: 1;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.6; }
}
</style>
