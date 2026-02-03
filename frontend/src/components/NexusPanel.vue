<script setup>
import { ref, computed } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';

const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

// Props
const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  selectedGraphId: {
    type: Number,
    default: 1
  },
  activeFilter: {
    type: String,
    default: 'all'
  },
  nodeViewMode: {
    type: String,
    default: 'medium'
  },
  isLinkingMode: {
    type: Boolean,
    default: false
  },
  linkingSource: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits([
  'update:searchQuery',
  'update:selectedGraphId',
  'update:activeFilter',
  'update:nodeViewMode',
  'update:isLinkingMode',
  'graph-change',
  'edit-graph',
  'create-graph',
  'delete-graph',
  'search',
  'clear-search',
  'toggle-view-mode',
  'toggle-linking-mode',
  'node-click'
]);

// Local state
const isSelectOpen = ref(false);
const searchQueryLocal = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val)
});

// Computed
const filteredNodes = computed(() => {
  let nodes = graphStore.nodes;
  
  // 應用過濾器
  if (props.activeFilter === 'focus' && graphStore.selectedNode) {
    const neighbors = graphStore.getNeighbors(graphStore.selectedNode.id);
    const neighborIds = new Set([graphStore.selectedNode.id, ...neighbors.map(n => n.id)]);
    nodes = nodes.filter(n => neighborIds.has(n.id));
  } else if (props.activeFilter === 'part') {
    nodes = nodes.filter(n => n.group === graphStore.selectedNode?.group);
  }
  
  // 應用搜尋
  if (searchQueryLocal.value) {
    const query = searchQueryLocal.value.toLowerCase();
    nodes = nodes.filter(n => 
      n.name?.toLowerCase().includes(query) ||
      n.label?.toLowerCase().includes(query) ||
      n.type?.toLowerCase().includes(query)
    );
  }
  
  return nodes;
});

const nodeStats = computed(() => ({
  total: graphStore.nodes.length,
  links: graphStore.links.length,
  filtered: filteredNodes.value.length
}));

// Methods
function handleGraphChange(event) {
  const newId = parseInt(event.target.value);
  emit('update:selectedGraphId', newId);
  emit('graph-change', newId);
}

function onSelectMouseDown() {
  isSelectOpen.value = true;
}

function onSelectBlur() {
  setTimeout(() => {
    isSelectOpen.value = false;
  }, 200);
}

function clearSearch() {
  searchQueryLocal.value = '';
  emit('clear-search');
}

function setNodeViewMode(mode) {
  emit('update:nodeViewMode', mode);
}

function setFilter(filter) {
  emit('update:activeFilter', filter);
}

function toggleViewMode() {
  emit('toggle-view-mode');
}

function toggleLinkingMode() {
  emit('update:isLinkingMode', !props.isLinkingMode);
  emit('toggle-linking-mode');
}

function handleNodeClick(node) {
  emit('node-click', node);
}

function getNodeIcon(node) {
  // 根據節點類型返回對應的圖示
  const iconMap = {
    'file': '📄',
    'document': '📝',
    'folder': '📁',
    'link': '🔗',
    'person': '👤',
    'company': '🏢',
    'project': '📊',
    'task': '✅',
    'note': '📋',
    'image': '🖼️',
    'video': '🎬',
    'audio': '🎵',
    'code': '💻',
    'database': '🗄️',
    'api': '⚡'
  };
  
  return node.emoji || iconMap[node.group] || iconMap[node.type] || '📌';
}
</script>

<template>
  <div class="nexus-panel flex flex-col h-full">
    <!-- Header -->
    <div 
      class="flex items-center justify-between px-6 py-5 border-b"
      :class="layoutStore.theme === 'dark' 
        ? 'border-white/5' 
        : 'border-gray-200'"
    >
      <h2 
        class="m-0 text-xl font-extrabold tracking-tight"
        :class="layoutStore.theme === 'dark' ? 'text-white' : 'text-slate-800'"
      >
        BruV AI <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NEXUS</span>
      </h2>
      <span class="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold uppercase tracking-wider">Admin</span>
    </div>
    
    <!-- 圖譜選擇器 -->
    <div class="px-6 py-4 select-wrapper">
      <select 
        class="w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer select-smooth"
        :class="layoutStore.theme === 'dark' 
          ? 'bg-white/5 border-white/10 text-white hover:bg-white/8 focus:bg-white/10' 
          : 'bg-gray-100 border-gray-200 text-slate-800 hover:bg-gray-200 focus:bg-white'"
        :value="selectedGraphId"
        @change="handleGraphChange"
        @mousedown="onSelectMouseDown"
        @blur="onSelectBlur"
      >
        <option value="1">🧠 主腦圖譜</option>
        <option value="2">💻 BruV 開發筆記</option>
        <option value="3">📖 私人日記</option>
        <option value="4">🏢 團隊共享知識庫</option>
      </select>
      <div class="select-arrow" :class="{ 'rotate': isSelectOpen }">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 8L2 4h8L6 8z"/>
        </svg>
      </div>
      
      <div class="flex gap-2 mt-3">
        <button 
          class="flex-1 px-3 py-2 border rounded-lg text-sm transition-all"
          :class="layoutStore.theme === 'dark' 
            ? 'bg-white/5 hover:bg-white/10 border-white/10' 
            : 'bg-gray-100 hover:bg-gray-200 border-gray-200'"
          @click="emit('edit-graph')" 
          title="編輯圖譜"
        >
          ✏️
        </button>
        <button 
          class="flex-1 px-3 py-2 border rounded-lg text-sm transition-all"
          :class="layoutStore.theme === 'dark' 
            ? 'bg-white/5 hover:bg-white/10 border-white/10' 
            : 'bg-gray-100 hover:bg-gray-200 border-gray-200'"
          @click="emit('create-graph')" 
          title="新增圖譜"
        >
          ➕
        </button>
        <button 
          class="flex-1 px-3 py-2 border rounded-lg text-sm transition-all"
          :class="layoutStore.theme === 'dark' 
            ? 'bg-white/5 hover:bg-white/10 border-white/10' 
            : 'bg-gray-100 hover:bg-gray-200 border-gray-200'"
          @click="emit('delete-graph')" 
          title="刪除圖譜"
        >
          🗑️
        </button>
      </div>
    </div>
    
    <!-- 搜尋框 -->
    <div class="relative px-6 py-2">
      <input 
        v-model="searchQueryLocal"
        type="text"
        class="w-full px-4 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        :class="layoutStore.theme === 'dark' 
          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10' 
          : 'bg-gray-100 border-gray-200 text-slate-800 placeholder-gray-500 focus:bg-white'"
        placeholder="Search nodes..."
        @keyup.enter="emit('search')"
      />
      <button 
        v-if="searchQueryLocal" 
        class="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all"
        :class="layoutStore.theme === 'dark' 
          ? 'bg-white/20 hover:bg-white/30 text-white' 
          : 'bg-gray-300 hover:bg-gray-400 text-gray-700'"
        @click="clearSearch"
      >✕</button>
    </div>
    
    <!-- 節點展示模式切換 -->
    <div class="grid grid-cols-4 gap-2 px-6 py-2">
      <button 
        class="px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white border border-gray-200 dark:border-white/10 rounded-lg text-base font-bold text-gray-700 dark:text-gray-300 transition-all"
        :class="{ 'bg-blue-600 text-white border-blue-600': nodeViewMode === 'list' }"
        @click="setNodeViewMode('list')"
        title="文字列表"
      >
        ≣
      </button>
      <button 
        class="px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white border border-gray-200 dark:border-white/10 rounded-lg text-base font-bold text-gray-700 dark:text-gray-300 transition-all"
        :class="{ 'bg-blue-600 text-white border-blue-600': nodeViewMode === 'small' }"
        @click="setNodeViewMode('small')"
        title="小圖示"
      >
        ▦
      </button>
      <button 
        class="px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white border border-gray-200 dark:border-white/10 rounded-lg text-base font-bold text-gray-700 dark:text-gray-300 transition-all"
        :class="{ 'bg-blue-600 text-white border-blue-600': nodeViewMode === 'medium' }"
        @click="setNodeViewMode('medium')"
        title="中等卡片"
      >
        ⊞
      </button>
      <button 
        class="px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white border border-gray-200 dark:border-white/10 rounded-lg text-base font-bold text-gray-700 dark:text-gray-300 transition-all"
        :class="{ 'bg-blue-600 text-white border-blue-600': nodeViewMode === 'large' }"
        @click="setNodeViewMode('large')"
        title="大型卡片"
      >
        🎆
      </button>
    </div>
    
    <!-- 過濾器網格 -->
    <div class="grid grid-cols-2 gap-2 px-6 py-2">
      <button 
        class="px-4 py-2.5 hover:bg-blue-600 hover:text-white border rounded-lg text-sm font-semibold transition-all"
        :class="activeFilter === 'all'
          ? 'bg-blue-600 text-white border-blue-600'
          : layoutStore.theme === 'dark'
            ? 'bg-white/5 border-white/10 text-gray-300'
            : 'bg-gray-100 border-gray-200 text-gray-700'"
        @click="setFilter('all')"
      >
        Show All
      </button>
      <button 
        class="px-4 py-2.5 hover:bg-blue-600 hover:text-white border rounded-lg text-sm font-semibold transition-all"
        :class="activeFilter === 'focus'
          ? 'bg-blue-600 text-white border-blue-600'
          : layoutStore.theme === 'dark'
            ? 'bg-white/5 border-white/10 text-gray-300'
            : 'bg-gray-100 border-gray-200 text-gray-700'"
        @click="setFilter('focus')"
      >
        Focus
      </button>
      <button 
        class="px-4 py-2.5 hover:bg-blue-600 hover:text-white border rounded-lg text-sm font-semibold transition-all"
        :class="activeFilter === 'part'
          ? 'bg-blue-600 text-white border-blue-600'
          : layoutStore.theme === 'dark'
            ? 'bg-white/5 border-white/10 text-gray-300'
            : 'bg-gray-100 border-gray-200 text-gray-700'"
        @click="setFilter('part')"
      >
        Show Part
      </button>
      <button 
        class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-lg text-sm font-semibold transition-all"
        @click="toggleViewMode"
      >
        {{ graphStore.viewMode === '3d' ? '🧊 3D' : '📐 2D' }} View
      </button>
    </div>
    
    <!-- Link Mode 按鈕 -->
    <div class="px-6 py-2">
      <button 
        class="w-full px-4 py-3 flex flex-col items-center gap-2 hover:bg-purple-600 hover:text-white border rounded-xl font-semibold transition-all"
        :class="isLinkingMode
          ? 'bg-purple-600 text-white border-purple-600'
          : layoutStore.theme === 'dark'
            ? 'bg-white/5 border-white/10 text-white'
            : 'bg-gray-100 border-gray-200 text-slate-800'"
        @click="toggleLinkingMode"
      >
        <span class="text-2xl">🔗</span>
        <span class="text-xs">{{ isLinkingMode ? 'Linking' : 'Link Mode' }}</span>
      </button>
    </div>
    
    <!-- 節點統計 -->
    <div 
      class="grid grid-cols-3 gap-3 px-6 py-4 border-y"
      :class="layoutStore.theme === 'dark' 
        ? 'bg-white/5 border-white/5' 
        : 'bg-gray-100 border-gray-200'"
    >
      <div class="flex flex-col items-center gap-1">
        <span class="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{{ nodeStats.total }}</span>
        <span 
          class="text-xs font-semibold uppercase tracking-wider"
          :class="layoutStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
        >NODES</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <span class="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{{ nodeStats.links }}</span>
        <span 
          class="text-xs font-semibold uppercase tracking-wider"
          :class="layoutStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
        >LINKS</span>
      </div>
      <div class="flex flex-col items-center gap-1" v-if="searchQueryLocal">
        <span class="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">{{ nodeStats.filtered }}</span>
        <span 
          class="text-xs font-semibold uppercase tracking-wider"
          :class="layoutStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
        >FILTERED</span>
      </div>
    </div>
    
    <!-- 節點列表 -->
    <div 
      class="flex-1 overflow-y-auto px-6 py-4"
      :class="`view-mode-${nodeViewMode}`"
    >
      <!-- 空狀態 -->
      <div v-if="filteredNodes.length === 0" class="flex flex-col items-center justify-center h-full gap-4 py-12">
        <span class="text-6xl opacity-30">📭</span>
        <div class="text-center">
          <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">暫無資料</p>
          <p class="text-xs text-gray-500 dark:text-gray-500">請從下方匯入檔案</p>
        </div>
      </div>

      <!-- List 模式 -->
      <template v-else-if="nodeViewMode === 'list'">
        <div class="flex flex-col gap-1">
          <div 
            v-for="node in filteredNodes.slice(0, 30)" 
            :key="node.id"
            class="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent rounded-lg cursor-pointer transition-all"
            :class="{ 
              'bg-blue-100 dark:bg-blue-900/30 border-blue-500': graphStore.selectedNode?.id === node.id,
              'bg-purple-100 dark:bg-purple-900/30 border-purple-500 animate-pulse': isLinkingMode && linkingSource?.id === node.id
            }"
            @click="handleNodeClick(node)"
          >
            <span class="text-lg">{{ getNodeIcon(node) }}</span>
            <span class="flex-1 text-sm font-medium text-gray-800 dark:text-white truncate">{{ node.name || node.label }}</span>
          </div>
        </div>
      </template>
      
      <!-- Small 模式 -->
      <template v-else-if="nodeViewMode === 'small'">
        <div class="grid grid-cols-4 gap-2">
          <div 
            v-for="node in filteredNodes.slice(0, 40)" 
            :key="node.id"
            class="aspect-square flex items-center justify-center bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border rounded-lg cursor-pointer transition-all"
            :class="{ 
              'border-blue-500 bg-blue-100 dark:bg-blue-900/30': graphStore.selectedNode?.id === node.id,
              'border-purple-500 bg-purple-100 dark:bg-purple-900/30 animate-pulse': isLinkingMode && linkingSource?.id === node.id
            }"
            @click="handleNodeClick(node)"
            :title="node.name || node.label"
          >
            <span class="text-2xl">{{ getNodeIcon(node) }}</span>
          </div>
        </div>
      </template>
      
      <!-- Medium 模式 -->
      <template v-else-if="nodeViewMode === 'medium'">
        <div class="grid grid-cols-2 gap-3">
          <div 
            v-for="node in filteredNodes.slice(0, 20)" 
            :key="node.id"
            class="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer transition-all"
            :class="{ 
              'border-blue-500 bg-blue-50 dark:bg-blue-900/20': graphStore.selectedNode?.id === node.id,
              'border-purple-500 bg-purple-50 dark:bg-purple-900/20 animate-pulse': isLinkingMode && linkingSource?.id === node.id
            }"
            @click="handleNodeClick(node)"
          >
            <div class="w-full aspect-square flex items-center justify-center rounded-lg mb-2" :style="{ background: (node.color || '#3b82f6') + '30' }">
              <span class="text-3xl">{{ getNodeIcon(node) }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ node.name || node.label }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ node.type || node.group }}</span>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Large 模式 -->
      <template v-else-if="nodeViewMode === 'large'">
        <div class="flex flex-col gap-4">
          <div 
            v-for="node in filteredNodes.slice(0, 10)" 
            :key="node.id"
            class="p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer transition-all"
            :class="{ 
              'border-blue-500 bg-blue-50 dark:bg-blue-900/20': graphStore.selectedNode?.id === node.id,
              'border-purple-500 bg-purple-50 dark:bg-purple-900/20 animate-pulse': isLinkingMode && linkingSource?.id === node.id
            }"
            @click="handleNodeClick(node)"
          >
            <div class="flex items-start gap-4 mb-3">
              <div class="w-16 h-16 flex items-center justify-center rounded-xl flex-shrink-0" :style="{ background: (node.color || '#3b82f6') + '40' }">
                <span class="text-3xl">{{ getNodeIcon(node) }}</span>
              </div>
              <div class="flex-1 flex flex-col gap-1">
                <span class="text-base font-bold text-gray-800 dark:text-white">{{ node.name || node.label }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ node.type || node.group }}</span>
              </div>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed m-0" v-if="node.description">
              {{ node.description }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.nexus-panel {
  position: relative;
}

.select-wrapper {
  position: relative;
}

.select-arrow {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: currentColor;
  opacity: 0.6;
}

.select-arrow.rotate {
  transform: translateY(-50%) rotate(180deg);
}

.select-smooth {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
  padding-right: 40px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
