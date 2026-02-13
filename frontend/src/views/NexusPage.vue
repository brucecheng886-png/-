<template>
  <div class="min-h-screen bg-nexus-bg overflow-hidden relative">
    <!-- 背景粒子效果 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="stars"></div>
      <div class="stars2"></div>
    </div>

    <!-- 主容器 -->
    <div class="relative z-10 flex flex-col h-screen">
      <!-- 頂部標題區 -->
      <header class="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
            <span class="text-xl">✦</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight">Nexus</h1>
            <p class="text-xs text-text-secondary uppercase tracking-wider">LOCAL KNOWLEDGE BASE</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg class="w-5 h-5 text-text-secondary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </header>

      <!-- 圖譜網格 -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div class="max-w-7xl mx-auto">
          <draggable 
            v-model="sortedGraphList"
            item-key="id"
            handle=".drag-handle"
            ghost-class="drag-ghost"
            chosen-class="drag-chosen"
            animation="300"
            class="grid grid-cols-1 md:grid-cols-2 gap-6"
            @end="onDragEnd"
          >
            <template #item="{ element: graph }">
              <div 
                @click="openGraph(graph.id)"
                class="group relative bg-nexus-surface rounded-2xl p-6 border border-white/5 hover:border-neon-blue/50 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <!-- 拖拽把手 -->
                <div class="drag-handle absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all z-10" @click.stop>
                  <span class="text-text-tertiary text-sm">⠿</span>
                </div>

                <!-- 背景光暈 -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <!-- 迷你圖譜預覽 -->
                <div class="relative h-32 mb-4 rounded-xl bg-black/20 border border-white/5 overflow-hidden">
                  <div class="absolute inset-0 flex items-center justify-center">
                    <!-- 中心節點 -->
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-neon-blue/30 border-2 border-neon-blue shadow-neon-blue animate-pulse-glow"></div>
                    <!-- 衛星節點 -->
                    <div class="absolute top-4 right-8 w-6 h-6 rounded-full bg-neon-purple/30 border border-neon-purple"></div>
                    <div class="absolute bottom-6 left-10 w-6 h-6 rounded-full bg-neon-cyan/30 border border-neon-cyan"></div>
                    <div class="absolute top-1/2 right-4 w-4 h-4 rounded-full bg-neon-pink/30 border border-neon-pink"></div>
                  </div>
                </div>

                <!-- 圖譜信息 -->
                <div class="relative space-y-3">
                  <div class="flex items-start justify-between">
                    <h3 class="text-lg font-semibold text-white">{{ graph.name }}</h3>
                    <span v-if="graph.defaultView" class="px-2 py-0.5 text-xs font-medium uppercase tracking-wider rounded bg-neon-blue/20 text-neon-blue border border-neon-blue/30">
                      {{ graph.defaultView }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 pt-2">
                    <div class="flex items-center gap-2">
                      <span class="text-neon-blue">✦</span>
                      <span class="text-sm text-text-tertiary">{{ graph.nodeCount }} Nodes</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-text-tertiary">⏱</span>
                      <span class="text-xs text-text-tertiary">{{ graph.lastUpdate }}</span>
                    </div>
                  </div>
                </div>

                <!-- Hover 效果 -->
                <div class="absolute inset-0 flex items-center justify-center bg-neon-blue/0 group-hover:bg-neon-blue/10 transition-all duration-300 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none">
                  <span class="text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Open Graph</span>
                </div>
              </div>
            </template>
            <template #footer>
              <div 
                @click="createNewGraph"
                class="group relative bg-nexus-surface/30 rounded-2xl p-6 border-2 border-dashed border-white/10 hover:border-neon-blue/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[280px]"
              >
                <div class="w-16 h-16 rounded-full bg-white/5 group-hover:bg-neon-blue/10 border border-white/10 group-hover:border-neon-blue/30 flex items-center justify-center transition-all duration-300">
                  <span class="text-3xl text-text-tertiary group-hover:text-neon-blue transition-colors">+</span>
                </div>
                <div class="text-center">
                  <h3 class="text-base font-medium text-white mb-1">Create New Universe</h3>
                  <p class="text-sm text-text-tertiary">Start a fresh knowledge graph</p>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- 底部導航 -->
      <footer class="flex items-center justify-center gap-12 px-8 py-4 border-t border-white/5">
        <button class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
          <span class="text-xl">▦</span>
          <span class="text-xs text-neon-blue font-medium uppercase tracking-wider">Universes</span>
        </button>
        <button class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
          <span class="text-xl text-text-tertiary">🔍</span>
          <span class="text-xs text-text-tertiary font-medium uppercase tracking-wider">Search</span>
        </button>
        <button class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
          <svg class="w-5 h-5 text-text-tertiary" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
          <span class="text-xs text-text-tertiary font-medium uppercase tracking-wider">Settings</span>
        </button>
      </footer>
    </div>

    <!-- 建立新圖譜對話框 -->
    <div 
      v-if="showCreateDialog"
      @click.self="closeCreateDialog"
      class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
    >
      <div class="bg-nexus-surface rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-white/10 animate-slide-up">
        <!-- 對話框標題 -->
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">Create New Graph</h2>
          <button 
            @click="closeCreateDialog"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-text-tertiary hover:text-white"
          >
            ✕
          </button>
        </div>

        <!-- 對話框內容 -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">Graph Name</label>
            <input
              v-model="newGraphData.name"
              type="text"
              placeholder="e.g., Project Notes, Research Hub..."
              class="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder-text-tertiary focus:outline-none focus:border-neon-blue transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea
              v-model="newGraphData.description"
              placeholder="Brief description of this graph..."
              rows="3"
              class="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder-text-tertiary focus:outline-none focus:border-neon-blue transition-colors resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-secondary mb-2">Icon</label>
            <div class="grid grid-cols-8 gap-2">
              <button
                v-for="icon in iconOptions"
                :key="icon"
                @click="newGraphData.icon = icon"
                class="w-12 h-12 flex items-center justify-center text-2xl rounded-lg border transition-all"
                :class="newGraphData.icon === icon ? 'bg-neon-blue/20 border-neon-blue' : 'bg-black/20 border-white/10 hover:border-white/20'"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <!-- 檔案上傳區域 -->
          <div 
            @drop.prevent="handleFileDrop"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            class="border-2 border-dashed rounded-lg p-6 text-center transition-all"
            :class="isDragging ? 'border-neon-blue bg-neon-blue/5' : 'border-white/20 hover:border-neon-blue/50 hover:bg-black/10'"
          >
            <input 
              type="file"
              @change="handleFileSelect"
              ref="fileInputRef"
              class="hidden"
              accept=".xlsx,.xls,.pdf,.docx,.txt,.md"
            />
            <div v-if="!uploadedFile" @click="$refs.fileInputRef.click()" class="cursor-pointer">
              <div class="text-4xl mb-2">📁</div>
              <p class="text-sm text-text-secondary">Drop file here or click to browse</p>
              <p class="text-xs text-text-tertiary mt-1">Supports: Excel, PDF, Word, Text, Markdown</p>
            </div>
            <div v-else class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">📄</span>
                <span class="text-sm text-white">{{ uploadedFile.name }}</span>
              </div>
              <button @click="uploadedFile = null" class="text-danger hover:text-red-400">✕</button>
            </div>
          </div>

          <div class="flex items-center gap-2 p-3 bg-black/20 border border-white/10 rounded-lg">
            <input
              v-model="useRAGFlow"
              type="checkbox"
              id="ragflow-upload"
              class="w-4 h-4 rounded border-white/20"
            />
            <label for="ragflow-upload" class="text-sm text-text-secondary">Upload to RAGFlow dataset</label>
          </div>

          <Transition name="dropdown">
          <div v-if="useRAGFlow">
            <div class="relative" ref="nexusDatasetDropdownRef">
              <button
                @click="nexusDatasetDropdownOpen = !nexusDatasetDropdownOpen"
                class="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-left focus:outline-none focus:border-neon-blue transition-all flex items-center justify-between"
                :class="selectedDataset ? 'text-white' : 'text-text-secondary'"
              >
                <span v-if="selectedDataset">
                  {{ ragflowDatasets.find(d => d.id === selectedDataset)?.name || selectedDataset }}
                </span>
                <span v-else>Choose a dataset...</span>
                <svg 
                  class="w-4 h-4 flex-shrink-0 transition-transform duration-300 ease-out opacity-60" 
                  :class="{ 'rotate-180': nexusDatasetDropdownOpen }" 
                  viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L2 4h8L6 8z"/>
                </svg>
              </button>
              <Transition name="dropdown">
                <div 
                  v-show="nexusDatasetDropdownOpen" 
                  class="absolute left-0 right-0 mt-1 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-2xl shadow-black/40 overflow-hidden z-50"
                >
                  <div class="max-h-48 overflow-y-auto custom-scrollbar py-1">
                    <div 
                      v-for="dataset in ragflowDatasets" 
                      :key="dataset.id" 
                      class="px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 hover:bg-white/10"
                      :class="selectedDataset === dataset.id ? 'text-blue-400 bg-blue-500/10 font-semibold' : 'text-gray-300'"
                      @click="selectedDataset = dataset.id; nexusDatasetDropdownOpen = false"
                    >
                      {{ dataset.name }}
                    </div>
                    <div v-if="ragflowDatasets.length === 0" class="px-4 py-2.5 text-sm text-gray-500 text-center">
                      No datasets available
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
          </Transition>
        </div>

        <!-- 對話框操作 -->
        <div class="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <button
            @click="closeCreateDialog"
            class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            @click="handleCreateGraph"
            :disabled="!newGraphData.name || isCreating"
            class="px-6 py-2 rounded-lg bg-neon-blue hover:bg-neon-blue/80 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-blue"
          >
            {{ isCreating ? 'Creating...' : 'Create Graph' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onBeforeUnmount, watch, Transition } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGraphStore } from '../stores/graphStore';
import { ElMessage } from 'element-plus';
import draggable from 'vuedraggable';

const router = useRouter();
const route = useRoute();
const graphStore = useGraphStore();

// State
const showCreateDialog = ref(false);
const isCreating = ref(false);
const isDragging = ref(false);
const uploadedFile = ref(null);
const fileInputRef = ref(null);
const useRAGFlow = ref(false);
const selectedDataset = ref('');
const ragflowDatasets = computed(() => graphStore.ragflowDatasets);
const nexusDatasetDropdownOpen = ref(false);
const nexusDatasetDropdownRef = ref(null);

const newGraphData = ref({
  name: '',
  description: '',
  icon: '🧠'
});

const iconOptions = ['🧠', '📚', '🎯', '💡', '🌟', '🚀', '🎨', '⚡', '🔮', '🎪', '🌈', '🎭', '🎪', '🎬', '🎮', '🎲'];

// Methods（必須在 computed 之前定義，因為 computed 會引用）
const formatLastUpdate = (lastUpdate) => {
  if (!lastUpdate) return '尚未載入';
  const now = new Date();
  const updateTime = new Date(lastUpdate);
  const diffMins = Math.floor((now - updateTime) / 60000);
  if (diffMins < 1) return '剛剛更新';
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} 小時前`;
  return updateTime.toLocaleDateString('zh-TW');
};

// Computed——從 graphStore.graphMetadataList 讀取真實圖譜列表
const graphList = computed(() => {
  const list = graphStore.graphMetadataList;
  if (list && list.length > 0) {
    return list.map(g => ({
      id: g.id,
      name: g.name || `圖譜 ${g.id}`,
      icon: g.icon || '🌐',
      nodeCount: g.nodeCount || g.node_count || 0,
      linkCount: g.linkCount || g.link_count || 0,
      lastUpdate: formatLastUpdate(g.lastUpdate || g.last_update || g.updated_at),
      defaultView: g.defaultView || '2D',
      description: g.description || ''
    }));
  }
  // fallback: store 已載入節點但元數據列表為空
  if (graphStore.nodeCount > 0) {
    return [{
      id: graphStore.currentGraphId,
      name: `圖譜 ${graphStore.currentGraphId}`,
      icon: '🌐',
      nodeCount: graphStore.nodeCount,
      linkCount: graphStore.linkCount,
      lastUpdate: formatLastUpdate(graphStore.lastUpdate),
      defaultView: graphStore.viewMode === '3d' ? '3D' : '2D'
    }];
  }
  return [];
});

// 拖拽排序：維護可排序列表
const sortedGraphList = ref([]);

// 監聽 graphList 變化同步
watch(graphList, (newList) => {
  const savedOrder = JSON.parse(localStorage.getItem('nexus_graph_order') || '[]');
  if (savedOrder.length > 0) {
    // 根據保存的順序排列
    const sorted = [];
    savedOrder.forEach(id => {
      const graph = newList.find(g => g.id === id);
      if (graph) sorted.push(graph);
    });
    // 添加新圖譜（不在排序列表中的）
    newList.forEach(g => {
      if (!sorted.find(s => s.id === g.id)) sorted.push(g);
    });
    sortedGraphList.value = sorted;
  } else {
    sortedGraphList.value = [...newList];
  }
}, { immediate: true });

// 拖拽結束回調
const onDragEnd = () => {
  const order = sortedGraphList.value.map(g => g.id);
  localStorage.setItem('nexus_graph_order', JSON.stringify(order));
  ElMessage({ message: '排序已儲存', type: 'success', duration: 1200 });
};

const openGraph = async (graphId) => {
  try {
    await graphStore.fetchGraphData(graphId);
    const graph = graphList.value.find(g => g.id === graphId);
    ElMessage.success({
      message: `正在開啟「${graph.name}」`,
      duration: 1500
    });
    setTimeout(() => router.push('/graph-page'), 500);
  } catch (error) {
    ElMessage.error('圖譜載入失敗: ' + error.message);
  }
};

const createNewGraph = () => {
  showCreateDialog.value = true;
  newGraphData.value = { name: '', description: '', icon: '🧠' };
  uploadedFile.value = null;
  useRAGFlow.value = false;
  selectedDataset.value = '';
};

const closeCreateDialog = () => {
  showCreateDialog.value = false;
  isDragging.value = false;
};

const handleFileDrop = (e) => {
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) uploadedFile.value = files[0];
};

const handleFileSelect = (e) => {
  const files = e.target.files;
  if (files.length > 0) uploadedFile.value = files[0];
};

const uploadFileToGraph = async (graphId) => {
  if (!uploadedFile.value) return;
  try {
    const result = await graphStore.uploadFileToGraph(uploadedFile.value, graphId, 'existing');
    if (result.success) {
      ElMessage.success(`📤 文件「${uploadedFile.value.name}」上傳成功`);
    }
  } catch (error) {
    ElMessage.error(`文件上傳失敗: ${error.message}`);
  }
};

const handleCreateGraph = async () => {
  if (!newGraphData.value.name) {
    ElMessage.warning('請輸入圖譜名稱');
    return;
  }
  isCreating.value = true;
  try {
    // 將 RAGFlow dataset ID 附加到圖譜元數據
    const graphPayload = { ...newGraphData.value };
    if (useRAGFlow.value && selectedDataset.value) {
      graphPayload.ragflow_dataset_id = selectedDataset.value;
    }
    const createdGraph = await graphStore.createGraph(graphPayload);
    ElMessage.success(`✅ 圖譜「${createdGraph.name}」創建成功！`);
    // 切換到新建的圖譜
    graphStore.currentGraphId = createdGraph.id;
    if (uploadedFile.value) {
      await uploadFileToGraph(createdGraph.id);
    }
    closeCreateDialog();
    // 載入新圖譜數據再跳轉
    await graphStore.fetchGraphData(createdGraph.id);
    setTimeout(() => router.push('/graph-page'), 300);
  } catch (error) {
    ElMessage.error(`創建失敗: ${error.message}`);
  } finally {
    isCreating.value = false;
  }
};

// 🌟 統一的數據載入函數
const loadGraphData = async (forceRefresh = false) => {
  // ✨ 優先加載圖譜元數據列表（確保卡片顯示）
  try {
    await graphStore.loadGraphMetadataList({ forceRefresh });
    console.log('✅ NexusPage: 圖譜列表已重新載入', graphStore.graphMetadataList.length);
  } catch (error) {
    console.warn('⚠️ 圖譜列表載入失敗:', error.message);
  }
};

onMounted(async () => {
  await loadGraphData();
  await graphStore.fetchRAGFlowDatasets();
  document.addEventListener('click', handleNexusClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleNexusClickOutside);
});

const handleNexusClickOutside = (e) => {
  if (nexusDatasetDropdownRef.value && !nexusDatasetDropdownRef.value.contains(e.target)) {
    nexusDatasetDropdownOpen.value = false;
  }
};

// 🔄 監聽頁面激活（從其他頁面返回時重新載入）
onActivated(async () => {
  console.log('🔄 NexusPage 已激活，重新載入圖譜列表');
  await loadGraphData(true);  // 強制刷新
});

// 🔄 監聽路由變化（確保進入 Nexus 頁面時更新數據）
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/nexus') {
      console.log('🔄 路由切換到 Nexus，重新載入圖譜列表');
      loadGraphData(true);  // 強制刷新
    }
  }
);
</script>

<style scoped>
/* ═══════════════════════════════════════════════════
   Nexus Universe — Starfield & Animations
   ═══════════════════════════════════════════════════ */

/* Starfield layers */
.stars {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at  10%  20%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at  30%  50%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at  50%  10%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at  70%  80%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at  90%  40%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 15% 65%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 45% 85%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 75% 25%, rgba(255,255,255,0.35) 0%, transparent 100%);
  background-size: 200px 200px;
  animation: starsMove 120s linear infinite;
  pointer-events: none;
  z-index: 0;
}

.stars2 {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at  20%  70%, rgba(147,197,253,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at  60%  30%, rgba(196,181,253,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at  80%  60%, rgba(147,197,253,0.35) 0%, transparent 100%),
    radial-gradient(1px 1px at  40%  90%, rgba(196,181,253,0.3) 0%, transparent 100%);
  background-size: 300px 300px;
  animation: starsMove 180s linear infinite reverse;
  pointer-events: none;
  z-index: 0;
}

@keyframes starsMove {
  from { background-position: 0 0; }
  to   { background-position: 200px 200px; }
}

/* Fade-in / slide-up entrance */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out both;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Card glow on hover */
.card-glow {
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.group:hover .card-glow {
  opacity: 1;
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(59,130,246,0.3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(59,130,246,0.5);
}

/* Floating animation for hero icon */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Neon border pulse */
@keyframes neon-pulse {
  0%, 100% { box-shadow: 0 0 5px rgba(59,130,246,0.3), 0 0 20px rgba(59,130,246,0.1); }
  50%      { box-shadow: 0 0 10px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.2); }
}

/* Drag & Drop styles */
.drag-ghost {
  opacity: 0.4;
  border: 2px dashed rgba(59, 130, 246, 0.5) !important;
  background: rgba(59, 130, 246, 0.05) !important;
}

.drag-chosen {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5);
  border-color: rgba(59, 130, 246, 0.5) !important;
  transform: scale(1.02);
}

/* Dropdown animation */
.dropdown-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scaleY(0.95);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scaleY(0.98);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}
</style>
