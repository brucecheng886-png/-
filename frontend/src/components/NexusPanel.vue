<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
    type: [String, Number],
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
  'update:selectedGraphId',
  'update:nodeViewMode',
  'graph-change',
  'edit-graph',
  'create-graph',
  'delete-graph',
  'node-click'
]);

// Local state
const isSelectOpen = ref(false);
const dropdownRef = ref(null);
const searchQueryLocal = computed(() => props.searchQuery);

// Dropdown computed
const selectedGraphLabel = computed(() => {
  if (props.selectedGraphId === 1 || props.selectedGraphId === '1') return '主腦圖譜';
  const graph = graphStore.graphMetadataList.find(g => String(g.id) === String(props.selectedGraphId));
  return graph?.name || '主腦圖譜';
});

// Click outside to close
function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isSelectOpen.value = false;
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

// Computed
const filteredNodes = computed(() => {
  let nodes = graphStore.nodes;
  
  // 應用類型過濾
  if (typeFilter.value !== 'all') {
    nodes = nodes.filter(n => (n.type || n.group || '') === typeFilter.value);
  }
  
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
  
  // 選中的節點排到最前面
  const selectedId = graphStore.selectedNode?.id;
  if (selectedId) {
    nodes = [...nodes].sort((a, b) => {
      if (a.id === selectedId) return -1;
      if (b.id === selectedId) return 1;
      return 0;
    });
  }
  
  return nodes;
});

const nodeStats = computed(() => ({
  total: graphStore.nodes.length,
  links: graphStore.links.length,
  filtered: filteredNodes.value.length
}));

// Methods
function toggleDropdown() {
  isSelectOpen.value = !isSelectOpen.value;
}

function selectGraph(id) {
  isSelectOpen.value = false;
  console.log('📊 [NexusPanel] 切換圖譜:', id);
  emit('update:selectedGraphId', id);
  emit('graph-change', id);
}



function setNodeViewMode(mode) {
  emit('update:nodeViewMode', mode);
}

function handleNodeClick(node) {
  emit('node-click', node);
}

// Type filter
const typeFilter = ref('all');
const isTypeFilterOpen = ref(false);
const typeFilterRef = ref(null);

const uniqueTypes = computed(() => {
  const types = new Set();
  graphStore.nodes.forEach(n => {
    if (n.type) types.add(n.type);
    else if (n.group) types.add(n.group);
  });
  return [...types].sort();
});

function handleClickOutsideTypeFilter(e) {
  if (typeFilterRef.value && !typeFilterRef.value.contains(e.target)) {
    isTypeFilterOpen.value = false;
  }
}
onMounted(() => document.addEventListener('click', handleClickOutsideTypeFilter));
onUnmounted(() => document.removeEventListener('click', handleClickOutsideTypeFilter));

function getNodeTypeColor(node) {
  const type = (node.type || node.group || '').toLowerCase();
  const colorMap = {
    'document': '#10b981',
    'resource': '#f43f5e',
    'person': '#3b82f6',
    'company': '#8b5cf6',
    'project': '#f59e0b',
    'file': '#6366f1',
    'image': '#ec4899',
    'video': '#ef4444',
    'task': '#14b8a6',
    'note': '#06b6d4',
    'link': '#a855f7',
    'code': '#22d3ee',
    'api': '#eab308',
  };
  return colorMap[type] || node.color || '#6b7280';
}

function getNodeIcon(node) {
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
    'image': '🖼',
    'video': '🎬',
    'audio': '🎵',
    'code': '💻',
    'database': '🗄',
    'api': '⚡'
  };
  return node.emoji || iconMap[node.group] || iconMap[node.type] || '📌';
}
</script>

<template>
  <div class="nexus-panel flex flex-col h-full">
    <!-- Header: 標題 + 類型篩選 -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-white/5">
      <h2 class="m-0 text-lg font-bold tracking-tight text-white">圖譜視圖</h2>
      <div class="relative" ref="typeFilterRef">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all cursor-pointer"
          @click="isTypeFilterOpen = !isTypeFilterOpen"
        >
          <span>{{ typeFilter === 'all' ? '全部類型' : typeFilter }}</span>
          <svg class="w-3 h-3 opacity-50 transition-transform" :class="{ 'rotate-180': isTypeFilterOpen }" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L2 4h8L6 8z"/></svg>
        </button>
        <Transition name="dropdown">
          <div v-show="isTypeFilterOpen" class="absolute right-0 mt-1 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-2xl shadow-black/40 overflow-hidden z-50 min-w-[140px]">
            <div class="max-h-48 overflow-y-auto py-1">
              <div class="px-3 py-2 text-xs cursor-pointer transition-all hover:bg-white/10" :class="typeFilter === 'all' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'" @click="typeFilter = 'all'; isTypeFilterOpen = false">全部類型</div>
              <div v-for="t in uniqueTypes" :key="t" class="px-3 py-2 text-xs cursor-pointer transition-all hover:bg-white/10" :class="typeFilter === t ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'" @click="typeFilter = t; isTypeFilterOpen = false">{{ t }}</div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 圖譜選擇器 (隱藏式) -->
    <div class="px-6 py-3 select-wrapper" ref="dropdownRef">
      <button
        class="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/8 transition-all duration-200 flex items-center justify-between"
        @click="toggleDropdown"
      >
        <span class="truncate text-xs">{{ selectedGraphLabel }}</span>
        <svg class="w-3 h-3 ml-2 flex-shrink-0 transition-transform duration-300 ease-out opacity-60" :class="{ 'rotate-180': isSelectOpen }" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L2 4h8L6 8z"/></svg>
      </button>
      <Transition name="dropdown">
        <div v-show="isSelectOpen" class="absolute left-6 right-6 mt-1 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-2xl shadow-black/40 overflow-hidden z-50">
          <div class="max-h-48 overflow-y-auto custom-scrollbar py-1">
            <div class="px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 hover:bg-white/10" :class="selectedGraphId === 1 || selectedGraphId === '1' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'" @click="selectGraph(1)">主腦圖譜</div>
            <div v-for="graph in graphStore.graphMetadataList.filter(g => g.id !== 1 && g.id !== '1')" :key="graph.id" class="px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 hover:bg-white/10" :class="String(selectedGraphId) === String(graph.id) ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'" @click="selectGraph(graph.id)">{{ graph.name }}</div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 節點統計 -->
    <div class="flex items-center gap-6 px-6 py-3">
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-blue-400 font-mono">{{ nodeStats.total }}</span>
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">NODES</span>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-blue-400 font-mono">{{ nodeStats.links }}</span>
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">LINKS</span>
      </div>
    </div>

    <!-- 操作按鈕 -->
    <div class="flex gap-2 px-6 pb-4">
      <button 
        class="flex items-center gap-1.5 px-4 py-2 border rounded-lg text-xs font-medium transition-all bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 cursor-pointer"
        @click="emit('edit-graph')" 
        title="編輯圖譜"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z"/></svg>
        <span>Edit</span>
      </button>
      <button 
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-500 text-white cursor-pointer border-none"
        @click="emit('create-graph')" 
        title="新增圖譜"
      >
        <span class="text-sm">+</span>
        <span>Add</span>
      </button>
      <button 
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all bg-red-600/80 hover:bg-red-500 text-white cursor-pointer border-none"
        @click="emit('delete-graph')" 
        title="刪除圖譜"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6 7v5M10 7v5M4 4l.8 9a1 1 0 001 .9h4.4a1 1 0 001-.9L12 4"/></svg>
        <span>Delete</span>
      </button>
    </div>
    
    <!-- 節點列表 -->
    <div 
      class="flex-1 overflow-y-auto px-6 py-4"
      :class="`view-mode-${nodeViewMode}`"
    >
      <!-- 展示模式切換 (與列表同欄) -->
      <div class="flex items-center gap-1.5 mb-3 sticky top-0 z-10 bg-[#0a0e27] pb-2">
        <!-- 小圖示 (2x2 grid) -->
        <button 
          class="flex-1 h-8 flex items-center justify-center bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg text-gray-300 transition-all cursor-pointer"
          :class="{ 'bg-blue-600 text-white border-blue-600': nodeViewMode === 'small' }"
          @click="setNodeViewMode('small')"
          title="小圖示"
        >
          <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
        </button>
        <!-- 文字列表 -->
        <button 
          class="flex-1 h-8 flex items-center justify-center bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg text-gray-300 transition-all cursor-pointer"
          :class="{ 'bg-blue-600 text-white border-blue-600': nodeViewMode === 'list' }"
          @click="setNodeViewMode('list')"
          title="文字列表"
        >
          <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="4" height="3" rx="0.75"/><rect x="7" y="1.5" width="8" height="2" rx="0.75"/><rect x="1" y="6.5" width="4" height="3" rx="0.75"/><rect x="7" y="7" width="8" height="2" rx="0.75"/><rect x="1" y="12" width="4" height="3" rx="0.75"/><rect x="7" y="12.5" width="8" height="2" rx="0.75"/></svg>
        </button>
        <!-- 中等卡片 -->
        <button 
          class="flex-1 h-8 flex items-center justify-center bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg text-gray-300 transition-all cursor-pointer"
          :class="{ 'bg-blue-600 text-white border-blue-600': nodeViewMode === 'medium' }"
          @click="setNodeViewMode('medium')"
          title="中等卡片"
        >
          <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="14" rx="1.5"/><rect x="9" y="1" width="6" height="14" rx="1.5"/></svg>
        </button>
        <!-- 大型卡片 -->
        <button 
          class="flex-1 h-8 flex items-center justify-center bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg text-gray-300 transition-all cursor-pointer"
          :class="{ 'bg-blue-600 text-white border-blue-600': nodeViewMode === 'large' }"
          @click="setNodeViewMode('large')"
          title="大型卡片"
        >
          <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2"/></svg>
        </button>
      </div>

      <!-- 空狀態 -->
      <div v-if="filteredNodes.length === 0" class="flex flex-col items-center justify-center h-full gap-4 py-12">
        <span class="text-6xl opacity-30">📭</span>
        <div class="text-center">
          <p class="text-sm font-semibold text-gray-400 mb-1">暫無資料</p>
          <p class="text-xs text-gray-500">請從下方匯入檔案</p>
        </div>
      </div>

      <!-- List 模式 -->
      <template v-else-if="nodeViewMode === 'list'">
        <div class="flex flex-col gap-1.5">
          <div 
            v-for="node in filteredNodes.slice(0, 30)" 
            :key="node.id"
            class="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-transparent rounded-xl cursor-pointer transition-all"
            :class="{ 
              'bg-blue-900/30 border-blue-500': graphStore.selectedNode?.id === node.id,
              'bg-purple-900/30 border-purple-500 animate-pulse': isLinkingMode && linkingSource?.id === node.id
            }"
            @click="handleNodeClick(node)"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: getNodeTypeColor(node) + '25' }">
              <svg class="w-4 h-4" :style="{ color: getNodeTypeColor(node) }" viewBox="0 0 16 16" fill="currentColor">
                <path v-if="(node.type||'').toLowerCase() === 'document'" d="M4 1h5.586L13 4.414V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1zm5 1v3h3L9 2z"/>
                <path v-else-if="(node.type||'').toLowerCase() === 'resource'" d="M6.354 5.5H4a1 1 0 000 2h2.354l-1.677 1.677a1 1 0 101.414 1.414L8 8.682V11a1 1 0 102 0V8.682l1.909 1.909a1 1 0 001.414-1.414L11.646 7.5H14a1 1 0 100-2h-2.354l1.677-1.677a1 1 0 10-1.414-1.414L10 4.318V2a1 1 0 10-2 0v2.318L6.091 2.409a1 1 0 10-1.414 1.414L6.354 5.5z"/>
                <path v-else d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 110 10A5 5 0 018 3z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">{{ node.name || node.label }}</div>
              <div class="text-[11px] text-gray-500 capitalize">{{ node.type || node.group || 'unknown' }}</div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Small 模式 -->
      <template v-else-if="nodeViewMode === 'small'">
        <div class="grid grid-cols-4 gap-2">
          <div 
            v-for="node in filteredNodes.slice(0, 40)" 
            :key="node.id"
            class="aspect-square flex items-center justify-center bg-white/5 hover:bg-white/10 border rounded-lg cursor-pointer transition-all"
            :class="{ 
              'border-blue-500 bg-blue-900/30': graphStore.selectedNode?.id === node.id,
              'border-purple-500 bg-purple-900/30 animate-pulse': isLinkingMode && linkingSource?.id === node.id
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
            class="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all"
            :class="{ 
              'border-blue-500 bg-blue-900/20': graphStore.selectedNode?.id === node.id,
              'border-purple-500 bg-purple-900/20 animate-pulse': isLinkingMode && linkingSource?.id === node.id
            }"
            @click="handleNodeClick(node)"
          >
            <div class="w-full aspect-square flex items-center justify-center rounded-lg mb-2" :style="{ background: (node.color || '#3b82f6') + '30' }">
              <span class="text-3xl">{{ getNodeIcon(node) }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-sm font-semibold text-white truncate">{{ node.name || node.label }}</span>
              <span class="text-xs text-gray-400 truncate">{{ node.type || node.group }}</span>
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
            class="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all"
            :class="{ 
              'border-blue-500 bg-blue-900/20': graphStore.selectedNode?.id === node.id,
              'border-purple-500 bg-purple-900/20 animate-pulse': isLinkingMode && linkingSource?.id === node.id
            }"
            @click="handleNodeClick(node)"
          >
            <div class="flex items-start gap-4 mb-3">
              <div class="w-16 h-16 flex items-center justify-center rounded-xl flex-shrink-0" :style="{ background: (node.color || '#3b82f6') + '40' }">
                <span class="text-3xl">{{ getNodeIcon(node) }}</span>
              </div>
              <div class="flex-1 flex flex-col gap-1">
                <span class="text-base font-bold text-white">{{ node.name || node.label }}</span>
                <span class="text-sm text-gray-400">{{ node.type || node.group }}</span>
              </div>
            </div>
            <p class="text-xs text-gray-300 leading-relaxed m-0" v-if="node.description">
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
