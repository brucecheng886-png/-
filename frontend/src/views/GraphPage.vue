<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import Graph2D from '../components/Graph2D.vue';
import Graph3D from './Graph3D.vue';
import NexusPanel from '../components/NexusPanel.vue';
import ImportDashboard from '../components/ImportDashboard.vue';
import { ElMessage } from 'element-plus';

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

// ===== State =====
const searchQuery = ref('');
const isLoading = ref(false); // 改為 false，避免初始閃爍
const showLeftPanel = ref(true);
const showRightPanel = ref(true);
// 將預設寬度改為 420
const leftPanelWidth = ref(420);
const rightPanelWidth = ref(320);
const isDraggingRight = ref(false);
const localNodeData = ref({
  id: '',
  name: '',
  link: '',
  description: '',
  image: null
});

// AI 建議連線狀態
const suggestedLinks = ref([]);
const selectedSuggestedLinks = ref(new Set()); // 使用者選擇的連線
const hoveredLinkTarget = ref(null); // 當前suspended節點

// NEXUS 控制台狀態
const selectedGraphId = ref(1);
const activeFilter = ref('all'); // 'all', 'focus', 'part'
const nodeViewMode = ref('medium'); // 'list', 'small', 'medium', 'large'
const isLinkingMode = ref(false); // 手動連線模式
const linkingSource = ref(null); // 連線起點
const isSelectOpen = ref(false); // 下拉選單展開狀態

// 圖表組件引用（用於調用子組件方法）
const graphComponentRef = ref(null);

// ===== Computed =====
const currentComponent = computed(() => {
  return graphStore.viewMode === '3d' ? Graph3D : Graph2D;
});

const filteredNodes = computed(() => {
  // 先套用 Store 的過濾器 (all/focus/part)
  let nodes = graphStore.filteredNodes;
  
  // 再套用搜尋過濾
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    nodes = nodes.filter(node => 
      node.name.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query) ||
      (node.description && node.description.toLowerCase().includes(query))
    );
  }
  
  return nodes;
});

const nodeStats = computed(() => {
  return {
    total: graphStore.nodeCount,
    filtered: filteredNodes.value.length,
    links: graphStore.linkCount
  };
});

// ===== Methods =====
const clearSearch = () => {
  searchQuery.value = '';
};

const handleSearch = () => {
  console.log('🔍 搜尋:', searchQuery.value);
  if (filteredNodes.value.length > 0 && searchQuery.value) {
    graphStore.selectNode(filteredNodes.value[0].id);
  }
};

// 根據節點類型或 group 獲取檔案圖示
const getNodeIcon = (node) => {
  // 如果節點已有 emoji，優先使用
  if (node.emoji) {
    return node.emoji;
  }
  
  // 根據 type 或 group 映射圖示
  const type = (node.type || '').toLowerCase();
  const group = node.group;
  
  // 優先根據類型名稱匹配
  if (type.includes('pdf')) return '📄';
  if (type.includes('excel') || type.includes('xlsx') || type.includes('xls')) return '📊';
  if (type.includes('word') || type.includes('doc')) return '📝';
  if (type.includes('ppt') || type.includes('powerpoint')) return '📽️';
  if (type.includes('image') || type.includes('img') || type.includes('photo')) return '🖼️';
  if (type.includes('video') || type.includes('mp4')) return '🎬';
  if (type.includes('audio') || type.includes('music')) return '🎵';
  if (type.includes('zip') || type.includes('archive')) return '📦';
  if (type.includes('code') || type.includes('程式')) return '💻';
  if (type.includes('檔案') || type.includes('file')) return '📄';
  
  // 根據 group 映射（假設 group 7+ 是檔案類型）
  if (group >= 7) {
    const fileGroupIcons = {
      7: '📄',  // 一般檔案
      8: '📊',  // Excel
      9: '📝',  // Word
      10: '📽️', // PPT
      11: '🖼️', // 圖片
      12: '🎬', // 影片
    };
    return fileGroupIcons[group] || '📄';
  }
  
  // 預設圖示
  return '📌';
};

const handleNodeClick = (node) => {
  // 如果處於連線模式
  if (isLinkingMode.value) {
    handleLinkingClick(node);
    return;
  }
  
  // 正常模式：選擇節點並顯示詳情
  graphStore.selectNode(node.id);
  showRightPanel.value = true;
  
  // 同步到本地編輯數據 (避免直接修改 Store)
  localNodeData.value = {
    id: node.id,
    name: node.name,
    link: node.link || '',
    description: node.description || '',
    image: node.image || null
  };
  
  // 處理 AI 建議連線
  if (node.links && Array.isArray(node.links)) {
    suggestedLinks.value = node.links.map(link => ({
      ...link,
      id: `${node.id}_to_${link.target_id}` // 為每個連線生成唯一 ID
    }));
    // 預設全部勾選
    selectedSuggestedLinks.value = new Set(suggestedLinks.value.map(link => link.id));
  } else {
    suggestedLinks.value = [];
    selectedSuggestedLinks.value = new Set();
  }
  
  // 🎯 觸發聚焦：調用圖表組件的聚焦方法
  if (graphComponentRef.value && typeof graphComponentRef.value.focusNode === 'function') {
    console.log('🎯 [GraphPage] 觸發節點聚焦:', node.name);
    graphComponentRef.value.focusNode(node);
  } else {
    console.warn('⚠️ [GraphPage] 圖表組件未提供 focusNode 方法');
  }
};

const handleAutoLink = () => {
  ElMessage.info('🔗 AI 自動連結功能開發中...');
};

// ImportGallery 檔案點擊處理
const handleFileClick = ({ fileId, nodeId }) => {
  console.log('📂 檔案點擊:', { fileId, nodeId });
  
  // 選中節點
  graphStore.selectNode(nodeId);
  
  // 顯示檢查器面板
  showRightPanel.value = true;
  
  // 同步到本地編輯數據
  const node = graphStore.nodes.find(n => n.id === nodeId);
  if (node) {
    localNodeData.value = {
      id: node.id,
      name: node.name,
      link: node.link || '',
      description: node.description || '',
      image: node.image || null
    };
  }
  
  // 調用圖表組件的 focusNode 方法（Camera Fly-to）
  if (graphComponentRef.value && typeof graphComponentRef.value.focusNode === 'function') {
    graphComponentRef.value.focusNode(nodeId);
    console.log('🎯 鏡頭飛向節點:', nodeId);
  } else {
    console.warn('⚠️ 圖表組件未提供 focusNode 方法');
  }
  
  ElMessage.success(`✅ 已聲焚至檔案: ${node?.name || fileId}`);
};

// ImportGallery 檔案上傳處理
const handleFileUploaded = async (files) => {
  console.log('📥 開始上傳檔案:', files.length);
  
  const loadingMsg = ElMessage({
    message: `🚀 正在上傳 ${files.length} 個檔案...`,
    type: 'info',
    duration: 0
  });
  
  try {
    // 建立 FormData
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // 發送請求到後端 API
    const response = await fetch('/api/graph/import/files', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: '未知錯誤' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    loadingMsg.close();
    
    // 驗證回傳數據
    if (!Array.isArray(data)) {
      throw new Error('伺服器回傳數據格式錯誤');
    }
    
    // 調用 graphStore.addBatchNodes 添加節點
    const stats = graphStore.addBatchNodes(data);
    
    ElMessage.success({
      message: `✅ 匯入成功！成功: ${stats.success}, 跳過: ${stats.skipped}, 失敗: ${stats.failed}`,
      duration: 3000
    });
    
    console.log('🎉 檔案匯入成功:', stats);
    
  } catch (error) {
    loadingMsg.close();
    
    ElMessage.error({
      message: `❌ 匯入失敗: ${error.message}`,
      duration: 5000
    });
    console.error('❌ 檔案上傳失敗:', error);
  }
};

const saveChanges = () => {
  if (!graphStore.selectedNode) {
    ElMessage.warning('⚠️ 未選擇節點');
    return;
  }
  
  const nodeId = localNodeData.value.id;
  const updates = {
    name: localNodeData.value.name,
    link: localNodeData.value.link,
    description: localNodeData.value.description,
    image: localNodeData.value.image
  };
  
  console.log('💾 [GraphPage] 保存節點變更:', nodeId, updates);
  console.log('🔄 [GraphPage] 當前視圖模式:', graphStore.viewMode);
  
  // 調用 Store 更新節點（會觸發 Graph3D 的 watch 監聽）
  graphStore.updateNode(nodeId, updates);
  
  // 處理 AI 建議連線
  const selectedLinks = Array.from(selectedSuggestedLinks.value);
  if (selectedLinks.length > 0) {
    selectedLinks.forEach(linkId => {
      const link = suggestedLinks.value.find(l => l.id === linkId);
      if (link) {
        // 添加連線到 graphStore
        graphStore.addLink({
          source: nodeId,
          target: link.target_id,
          relation: link.relation,
          reason: link.reason,
          value: 1
        });
        console.log('🔗 [GraphPage] 添加建議連線:', link.target_id, link.relation);
      }
    });
    ElMessage.success(`💾 已保存節點及 ${selectedLinks.length} 個建議連線`);
  } else {
    ElMessage.success(`💾 已保存節點 "${localNodeData.value.name}" 的變更`);
  }
  
  // 確認更新
  console.log('✅ [GraphPage] 節點已更新，3D 圖譜應自動同步');
  
  // 延遲 500ms 後驗證更新
  setTimeout(() => {
    const updatedNode = graphStore.nodes.find(n => n.id === nodeId);
    if (updatedNode) {
      console.log('✅ [GraphPage] 驗證: Store 中的節點已更新:', updatedNode);
    }
  }, 500);
};

const openLink = () => {
  const url = localNodeData.value.link;
  if (!url) {
    ElMessage.warning('⚠️ 連結為空');
    return;
  }
  
  // 確保 URL 有協議
  const validUrl = url.startsWith('http://') || url.startsWith('https://') 
    ? url 
    : `https://${url}`;
  
  window.open(validUrl, '_blank');
  console.log('🔗 開啟連結:', validUrl);
};

const handleImageChange = () => {
  ElMessage.info('📷 圖片上傳功能開發中...');
};

const closeInspector = () => {
  showRightPanel.value = false;
  graphStore.clearSelection();
  suggestedLinks.value = [];
  selectedSuggestedLinks.value = new Set();
  hoveredLinkTarget.value = null;
};

// 切换建議連線的選擇狀態
const toggleSuggestedLink = (linkId) => {
  if (selectedSuggestedLinks.value.has(linkId)) {
    selectedSuggestedLinks.value.delete(linkId);
  } else {
    selectedSuggestedLinks.value.add(linkId);
  }
  // 觸發響應式更新
  selectedSuggestedLinks.value = new Set(selectedSuggestedLinks.value);
};

// 當滑鼠懸停在建議連線上
const handleLinkHover = (targetId) => {
  hoveredLinkTarget.value = targetId;
  // 通知圖表組件顯示呼吸燈效果
  if (graphComponentRef.value && typeof graphComponentRef.value.highlightNode === 'function') {
    graphComponentRef.value.highlightNode(targetId);
  }
};

// 當滑鼠離開建議連線
const handleLinkLeave = () => {
  hoveredLinkTarget.value = null;
  // 通知圖表組件取消高亮
  if (graphComponentRef.value && typeof graphComponentRef.value.unhighlightNode === 'function') {
    graphComponentRef.value.unhighlightNode();
  }
};

// 獲取目標節點名稱
const getTargetNodeName = (targetId) => {
  const node = graphStore.getNodeById(targetId);
  return node ? node.name : targetId;
};

const deleteNode = () => {
  if (!graphStore.selectedNode) {
    ElMessage.warning('⚠️ 未選擇節點');
    return;
  }
  
  const nodeId = graphStore.selectedNode.id;
  const nodeName = graphStore.selectedNode.name;
  
  // 確認刪除
  if (confirm(`確定要刪除節點「${nodeName}」嗎？\n\n此操作將同時刪除所有相關連接，且無法復原。`)) {
    console.log('🗑️ [GraphPage] 刪除節點:', nodeId, nodeName);
    
    // 調用 Store 刪除節點
    graphStore.deleteNode(nodeId);
    
    // 關閉面板
    showRightPanel.value = false;
    
    // 用戶提示
    ElMessage.success({
      message: `🗑️ 已刪除節點「${nodeName}」`,
      duration: 2000,
      showClose: true
    });
  }
};

// ===== NEXUS 控制台 Methods =====
const handleGraphChange = (event) => {
  const graphId = parseInt(event.target.value);
  selectedGraphId.value = graphId;
  graphStore.fetchGraphData(graphId);
  ElMessage.success(`🔄 已切換到圖譜 ID: ${graphId}`);
  isSelectOpen.value = false;
};

const onSelectMouseDown = () => {
  isSelectOpen.value = true;
};

const onSelectBlur = () => {
  setTimeout(() => {
    isSelectOpen.value = false;
  }, 200);
};

const handleEditGraph = () => {
  ElMessage.info('✏️ 編輯圖譜功能開發中...');
};

const handleCreateGraph = () => {
  ElMessage.info('➕ 新增圖譜功能開發中...');
};

const handleDeleteGraph = () => {
  ElMessage.warning('🗑️ 刪除圖譜功能開發中...');
};

const setFilter = (filter) => {
  activeFilter.value = filter;
  graphStore.setFilterMode(filter);
  ElMessage.info(`🔎 已切換到: ${filter === 'all' ? '顯示全部' : filter === 'focus' ? '焦點模式' : '部分顯示'}`);
};

const toggleViewMode = () => {
  const currentMode = graphStore.viewMode;
  const newMode = currentMode === '2d' ? '3d' : '2d';
  
  console.log(`🔄 [GraphPage] 視圖模式切換: ${currentMode} → ${newMode}`);
  console.log(`📊 [GraphPage] 切換前 Store 狀態:`, {
    viewMode: graphStore.viewMode,
    nodeCount: graphStore.nodeCount,
    linkCount: graphStore.linkCount
  });
  
  // 調用 Store 更新視圖模式（會自動保存到 localStorage）
  graphStore.setViewMode(newMode);
  
  // 用戶提示
  ElMessage.success({
    message: `✅ 已切換到 ${newMode.toUpperCase()} 視圖`,
    duration: 1500,
    showClose: false
  });
  
  // 確認狀態已更新
  setTimeout(() => {
    console.log('📊 [GraphPage] 切換後 Store 狀態:', {
      viewMode: graphStore.viewMode,
      component: graphStore.viewMode === '3d' ? 'Graph3D' : 'Graph2D'
    });
    console.log('✅ [GraphPage] 視圖模式切換完成');
  }, 100);
};

// ===== 節點展示模式 =====
const setNodeViewMode = (mode) => {
  nodeViewMode.value = mode;
  console.log('🎨 節點展示模式:', mode);
};

// ===== 手動連線功能 =====
const toggleLinkingMode = () => {
  isLinkingMode.value = !isLinkingMode.value;
  
  if (isLinkingMode.value) {
    linkingSource.value = null;
    ElMessage.success('🔗 連線模式已開啟，請點擊兩個節點建立連結');
  } else {
    linkingSource.value = null;
    ElMessage.info('🔗 連線模式已關閉');
  }
};

const handleLinkingClick = (node) => {
  if (!linkingSource.value) {
    // 第一次點擊：設定起點
    linkingSource.value = node;
    ElMessage.info(`📍 起點: ${node.name}，請選擇目標節點`);
  } else {
    // 第二次點擊：建立連結
    if (linkingSource.value.id === node.id) {
      ElMessage.warning('⚠️ 無法連結到自己');
      return;
    }
    
    // 檢查是否已存在連結
    const existingLink = graphStore.links.find(link => 
      (link.source === linkingSource.value.id && link.target === node.id) ||
      (link.source === node.id && link.target === linkingSource.value.id)
    );
    
    if (existingLink) {
      ElMessage.warning('⚠️ 連結已存在');
      linkingSource.value = null;
      return;
    }
    
    // 建立新連結
    graphStore.addLink({
      source: linkingSource.value.id,
      target: node.id,
      value: 3,
      label: '手動連結'
    });
    
    ElMessage.success(`✅ 已連結: ${linkingSource.value.name} → ${node.name}`);
    console.log('🔗 新連結:', linkingSource.value.id, '->', node.id);
    
    // 重置
    linkingSource.value = null;
  }
};

// ===== 拖動處理 =====
const startDragLeft = () => {
  isDraggingLeft.value = true;
  document.addEventListener('mousemove', onDragLeft);
  document.addEventListener('mouseup', stopDragLeft);
};

const onDragLeft = (e) => {
  if (!isDraggingLeft.value) return;
  // 直接使用鼠标位置作为宽度，限制在 320-700px 之间
  const newWidth = e.clientX - (layoutStore.isSidebarCollapsed ? 0 : 280);
  leftPanelWidth.value = Math.max(320, Math.min(700, newWidth));
};

const stopDragLeft = () => {
  isDraggingLeft.value = false;
  document.removeEventListener('mousemove', onDragLeft);
  document.removeEventListener('mouseup', stopDragLeft);
};

// ===== 右側拖動處理 =====
const startDragRight = () => {
  isDraggingRight.value = true;
  document.addEventListener('mousemove', onDragRight);
  document.addEventListener('mouseup', stopDragRight);
};

const onDragRight = (e) => {
  if (!isDraggingRight.value) return;
  // 從右邊緣計算寬度，限制在 280-600px 之間
  const newWidth = window.innerWidth - e.clientX;
  rightPanelWidth.value = Math.max(280, Math.min(600, newWidth));
};

const stopDragRight = () => {
  isDraggingRight.value = false;
  document.removeEventListener('mousemove', onDragRight);
  document.removeEventListener('mouseup', stopDragRight);
};

// ===== Watch: 監聽選中節點變化，自動同步到本地編輯數據 =====
watch(
  () => graphStore.selectedNode,
  (newNode) => {
    if (newNode) {
      // 同步選中節點到本地編輯數據
      localNodeData.value = {
        id: newNode.id,
        name: newNode.name || '',
        link: newNode.link || '',
        description: newNode.description || '',
        image: newNode.image || null
      };
      console.log('🔄 [GraphPage] 選中節點已同步到編輯面板:', newNode.name);
    }
  },
  { immediate: false }
);

// ===== Lifecycle =====
onMounted(async () => {
  // 只有在沒有資料時才顯示載入狀態
  if (graphStore.nodes.length === 0) {
    isLoading.value = true;
    try {
      await graphStore.fetchGraphData();
    } catch (error) {
      console.error('❌ 圖譜數據加載失敗:', error);
      ElMessage.error('圖譜數據加載失敗');
    } finally {
      isLoading.value = false;
    }
  }
});
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#F8F9FB]">
    <!-- 左側可拖拉欄: 預設 420px -->
    <aside 
      class="h-full flex-shrink-0 border-r bg-white dark:bg-[#0f0f0f] flex flex-col shadow-sm z-20 border-gray-200 dark:border-white/10 relative"
      :style="{ width: leftPanelWidth + 'px' }"
    >
      <!-- 上方: NexusPanel (flex-1 可滾動) -->
      <div class="flex-1 overflow-y-auto border-b border-gray-200 dark:border-white/10">
        <NexusPanel 
          v-model:searchQuery="searchQuery"
          v-model:selectedGraphId="selectedGraphId"
          v-model:activeFilter="activeFilter"
          v-model:nodeViewMode="nodeViewMode"
          v-model:isLinkingMode="isLinkingMode"
          :linking-source="linkingSource"
          @graph-change="handleGraphChange"
          @edit-graph="handleEditGraph"
          @create-graph="handleCreateGraph"
          @delete-graph="handleDeleteGraph"
          @search="handleSearch"
          @clear-search="clearSearch"
          @toggle-view-mode="toggleViewMode"
          @toggle-linking-mode="toggleLinkingMode"
          @node-click="handleNodeClick"
        />
      </div>
      
      <!-- 拖動手柄 -->
      <div
        class="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-30"
        @mousedown="startDragLeft"
        title="拖動調整寬度"
      >
        <div class="h-full w-px mx-auto bg-gray-300 dark:bg-white/20"></div>
      </div>
    </aside>

    <!-- 右側畫布區: flex-1 -->
    <main class="flex-1 relative bg-black">
      <!-- 載入動畫 -->
      <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
        <div class="w-15 h-15 border-4 border-blue-200 dark:border-blue-500/20 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400 m-0">載入知識圖譜中...</p>
      </div>
      
      <!-- 圖譜畫布 -->
      <keep-alive v-else>
        <component :is="currentComponent" :key="graphStore.viewMode" ref="graphComponentRef" />
      </keep-alive>
    </main>

    <!-- 右側可拖動面板: 預設 320px -->
    <aside 
      class="h-full flex-shrink-0 border-l bg-white dark:bg-[#0f0f0f] flex flex-col shadow-sm z-20 border-gray-200 dark:border-white/10 relative"
      :style="{ width: rightPanelWidth + 'px' }"
    >
      <!-- 拖動手柄 -->
      <div
        class="absolute top-0 left-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-30"
        @mousedown="startDragRight"
        title="拖動調整寬度"
      >
        <div class="h-full w-px mx-auto bg-gray-300 dark:bg-white/20"></div>
      </div>

      <!-- 面板內容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="space-y-6">
          <!-- 標題 -->
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">工具面板</h2>
            <button 
              class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              @click="showRightPanel = false"
            >
              收起 ▶
            </button>
          </div>

          <!-- 分隔線 -->
          <div class="h-px bg-gray-200 dark:bg-white/10"></div>

          <!-- 預留內容區域 -->
          <div class="space-y-4">
            <div class="p-4 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <p class="text-sm text-gray-600 dark:text-gray-400">右側工具面板內容區域</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 頂部橫向面板: 節點檢查器 (Inspector) -->
    <transition name="slide-down">
      <div 
        v-if="showRightPanel && graphStore.selectedNode" 
        class="fixed top-16 left-1/2 -translate-x-1/2 w-[950px] max-h-[85vh] z-50 backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
        :class="[
          layoutStore.theme === 'dark' 
            ? 'bg-[#0f0f0f]/95 border-white/10' 
            : 'bg-white/80 border-gray-200'
        ]"
      >
        <!-- 關閉按鈕 -->
        <button 
          class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg transition-all z-10" 
          :class="layoutStore.theme === 'dark' 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-600'"
          @click="closeInspector" 
          title="關閉"
        >✕</button>

        <!-- 橫向佈局 -->
        <div class="flex items-stretch h-full">
          <!-- 左側: 預覽圖 -->
          <div class="w-64 flex-shrink-0">
            <div class="relative group h-full bg-gray-100 dark:bg-white/5 border-r" :class="layoutStore.theme === 'dark' ? 'border-white/10' : 'border-gray-200'">
              <div v-if="!localNodeData.image" class="w-full h-full flex flex-col items-center justify-center gap-2">
                <span class="text-5xl opacity-30">🖼️</span>
                <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">No Cover</span>
              </div>
              <img 
                v-else 
                :src="localNodeData.image" 
                alt="Node Cover"
                class="w-full h-full object-cover"
              />
              <!-- Hover Overlay -->
              <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" @click="handleImageChange">
                <span class="text-3xl">📷</span>
                <span class="text-sm text-white font-semibold">Change Cover</span>
              </div>
            </div>
          </div>

          <!-- 中間: 標題、輸入框與 AI 建議連線 -->
          <div class="flex-1 flex flex-col p-5 gap-3">
            <!-- 標題 -->
            <div>
              <input 
                v-model="localNodeData.name"
                type="text"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-lg font-bold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="節點標題..."
              />
            </div>

            <!-- SRL -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SRL</label>
              <input 
                v-model="localNodeData.id"
                type="text"
                class="px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                readonly
              />
            </div>

            <!-- LINK -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">LINK</label>
              <div class="flex gap-2">
                <input 
                  v-model="localNodeData.link"
                  type="text"
                  class="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="https://..."
                />
                <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all" @click="openLink">Go</button>
              </div>
            </div>

            <!-- AI 建議連線區塊 -->
            <div v-if="suggestedLinks.length > 0" class="flex flex-col gap-2 mt-2">
              <label class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🤖</span>
                <span>AI 建議連線</span>
                <span class="text-xs font-normal text-gray-500 dark:text-gray-400">(取消勾選不儲存)</span>
              </label>
              <div class="max-h-32 overflow-y-auto space-y-2 pr-2">
                <div 
                  v-for="link in suggestedLinks" 
                  :key="link.id"
                  class="group flex items-start gap-2 p-2.5 rounded-lg border transition-all cursor-pointer"
                  :class="[
                    selectedSuggestedLinks.has(link.id)
                      ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10',
                    hoveredLinkTarget === link.target_id ? 'ring-2 ring-purple-500' : ''
                  ]"
                  @mouseenter="handleLinkHover(link.target_id)"
                  @mouseleave="handleLinkLeave"
                >
                  <!-- 勾選框 -->
                  <input 
                    type="checkbox"
                    :checked="selectedSuggestedLinks.has(link.id)"
                    @change="toggleSuggestedLink(link.id)"
                    class="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  
                  <!-- 連線資訊 -->
                  <div class="flex-1 text-sm">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-semibold text-gray-800 dark:text-white">{{ getTargetNodeName(link.target_id) }}</span>
                      <span class="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">{{ link.relation }}</span>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{{ link.reason }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按鈕列 -->
            <div class="flex gap-3 mt-auto pt-2">
              <button 
                class="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all" 
                @click="saveChanges"
              >
                <span class="text-base">💾</span>
                <span>SAVE</span>
              </button>
              <button 
                class="px-4 py-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg shadow-red-500/30 transition-all" 
                @click="deleteNode"
                title="刪除節點"
              >
                <span class="text-base">🗑️</span>
                <span>DELETE</span>
              </button>
            </div>
          </div>

          <!-- 右側: 描述區域 -->
          <div class="w-80 flex-shrink-0 p-5 border-l" :class="layoutStore.theme === 'dark' ? 'border-white/10' : 'border-gray-200'">
            <div class="flex flex-col gap-2 h-full">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DESCRIPTION</label>
              <textarea 
                v-model="localNodeData.description"
                class="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm leading-relaxed text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                placeholder="節點描述..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </transition>
    

  </div>
</template>

<style scoped>
/* ===== 工作台容器 ===== */
.graph-workspace {
  /* 佈局由 Tailwind classes 控制: flex h-screen overflow-hidden */
  position: relative;
  background: var(--bg-void);
}

/* ===== 左側 Sidebar：固定 380px ===== */
.sidebar {
  /* 佈局由 Tailwind classes 控制: w-[380px] h-full flex-shrink-0 flex flex-col border-r */
  position: relative;
}

/* ===== 右側畫布區：flex-1 填滿剩餘空間 ===== */
.graph-canvas-area {
  /* 佈局由 Tailwind classes 控制: flex-1 h-full relative */
  position: relative;
  transition: background 0.3s ease;
}

/* ===== 絲滑下拉選單 ===== */
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
  will-change: transform, box-shadow;
}

.select-smooth:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.select-smooth:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2),
              0 4px 16px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.select-smooth:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.select-smooth:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.select-smooth:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* ===== Layer 1: 圖譜畫布層 ===== */
.graph-canvas-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* 載入動畫 */
.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-void);
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(68, 138, 255, 0.2);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* ===== Layer 2: UI 控制層 ===== */
/* 左側面板: BruV AI NEXUS 控制台 */
.nexus-dock {
  position: absolute;
  left: 16px;
  top: 16px;
  bottom: 16px;
  width: 340px;
  z-index: 50;
  background: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* A. Header */
.nexus-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nexus-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.text-accent {
  background: linear-gradient(135deg, #448aff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.admin-badge {
  padding: 4px 12px;
  background: var(--primary-blue);
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* B. 圖譜選擇器 */
.graph-selector {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.graph-select {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.graph-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.graph-select:focus {
  border-color: var(--primary-blue);
}

.graph-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit {
  border-color: rgba(68, 138, 255, 0.3);
}

.action-btn.edit:hover {
  background: rgba(68, 138, 255, 0.2);
  border-color: var(--primary-blue);
}

.action-btn.create {
  border-color: rgba(34, 197, 94, 0.3);
}

.action-btn.create:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
}

.action-btn.delete {
  border-color: rgba(239, 68, 68, 0.3);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

/* C. 搜尋框 */
.nexus-search {
  position: relative;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nexus-search-input {
  width: 100%;
  padding: 10px 36px 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.nexus-search-input:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(68, 138, 255, 0.1);
}

.nexus-search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.search-clear {
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* C2. 節點展示模式切換 */
.view-mode-selector {
  display: flex;
  gap: 6px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.view-mode-btn {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-mode-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.view-mode-btn.active {
  background: rgba(68, 138, 255, 0.2);
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

/* D. 過濾器網格 (2x2) */
.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.filter-btn {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.filter-btn.active {
  background: rgba(68, 138, 255, 0.2);
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.filter-btn.view-toggle {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.3);
  color: #a78bfa;
}

.filter-btn.view-toggle:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: #a78bfa;
}

/* E. 底部大按鈕 */
.primary-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.primary-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.primary-btn.import {
  border-color: rgba(251, 191, 36, 0.3);
}

.primary-btn.import:hover {
  border-color: #fbbf24;
}

.primary-btn.link-mode {
  border-color: rgba(139, 92, 246, 0.3);
}

.primary-btn.link-mode:hover {
  border-color: #8b5cf6;
}

.primary-btn.link-mode.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.primary-btn .btn-icon {
  font-size: 24px;
}

.primary-btn .btn-label {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 節點統計 */
.nexus-stats {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(68, 138, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-blue);
  font-family: 'Consolas', monospace;
}

.stat-value.highlight {
  color: var(--accent-orange);
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* 節點列表 (簡化版) */
.nexus-node-list {
  flex: 1;
  padding: 12px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nexus-node-list::-webkit-scrollbar {
  width: 6px;
}

.nexus-node-list::-webkit-scrollbar-thumb {
  background: rgba(68, 138, 255, 0.3);
  border-radius: 3px;
}

/* ===== List 模式: 純文字列表 ===== */
.nexus-node-list.view-mode-list {
  gap: 2px;
}

.node-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.node-list-item.selected {
  background: rgba(68, 138, 255, 0.1);
  border-color: var(--primary-blue);
}

.node-list-item.linking {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
}

.node-list-item .node-icon {
  font-size: 10px;
  font-weight: bold;
}

.node-list-item .node-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== Small 模式: 純圖示網格 ===== */
.nexus-node-list.view-mode-small {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.node-small-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.node-small-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.node-small-item.selected {
  border-width: 2px;
  box-shadow: 0 0 12px currentColor;
}

.node-small-item.linking {
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.node-small-item .node-emoji {
  font-size: 24px;
}

/* ===== Medium 模式: 標準卡片 ===== */
.nexus-node-list.view-mode-medium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.node-medium-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-medium-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.node-medium-item.selected {
  background: rgba(68, 138, 255, 0.1);
  border-color: var(--primary-blue);
}

.node-medium-item.linking {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.node-medium-item .node-preview {
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-medium-item .node-emoji {
  font-size: 28px;
}

.node-medium-item .node-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-medium-item .node-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-medium-item .node-type {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
}

/* ===== Large 模式: 大型詳細卡片 ===== */
.nexus-node-list.view-mode-large {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-large-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-large-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.node-large-item.selected {
  background: rgba(68, 138, 255, 0.1);
  border-color: var(--primary-blue);
}

.node-large-item.linking {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.node-large-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.node-preview-large {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-emoji-large {
  font-size: 32px;
}

.node-info-large {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-name-large {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.node-type-large {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.node-description {
  font-size: 11px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

/* ===== 頂部面板 (Inspector Panel - 節點屬性編輯器) ===== */
/* 現在使用 Tailwind 類別進行樣式設計，無需額外 CSS */

/* B. Scrollable Content Area */
.inspector-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.inspector-content::-webkit-scrollbar {
  width: 6px;
}

.inspector-content::-webkit-scrollbar-track {
  background: transparent;
}

.inspector-content::-webkit-scrollbar-thumb {
  background: rgba(68, 138, 255, 0.3);
  border-radius: 3px;
}

.inspector-content::-webkit-scrollbar-thumb:hover {
  background: rgba(68, 138, 255, 0.5);
}

/* Title Section */
.title-section {
  margin-bottom: 4px;
}

.title-input {
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  outline: none;
  transition: all 0.2s ease;
}

.title-input:focus {
  color: var(--primary-blue);
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* Image Section */
.image-section {
  width: 100%;
}

.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.placeholder-icon {
  font-size: 40px;
  opacity: 0.3;
}

.placeholder-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 32px;
}

.overlay-text {
  font-size: 13px;
  font-weight: 600;
  color: white;
}

/* C. Properties Section */
.properties-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.property-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-orange);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.property-input,
.property-textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  outline: none;
  transition: all 0.2s ease;
  resize: none;
}

.property-input:focus,
.property-textarea:focus {
  border-color: var(--primary-blue);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.property-input::placeholder,
.property-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.property-input[readonly] {
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.property-textarea {
  min-height: 128px;
  line-height: 1.6;
}

/* Link Input Group */
.link-input-group {
  display: flex;
  gap: 0;
}

.link-input-group .property-input {
  border-radius: 8px 0 0 8px;
  flex: 1;
}

.go-btn {
  padding: 0 16px;
  background: var(--accent-orange);
  border: none;
  border-radius: 0 8px 8px 0;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.go-btn:hover {
  background: #ff8c42;
}

/* D. Footer (Fixed Bottom) */
.inspector-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.3);
}

.save-btn {
  width: 100%;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #4a90e2, #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.save-btn:hover {
  background: linear-gradient(135deg, #5a9eff, #a78bfa);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.save-btn:active {
  transform: translateY(0);
}

.save-icon {
  font-size: 16px;
}

/* ===== 動畫 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 頂部面板動畫 (Inspector Horizontal Panel) */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  transform: translate(-50%, -20px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}

/* ===== 響應式設計 ===== */
@media (max-width: 1400px) {
  .nexus-dock {
    width: 300px;
  }
  
  .inspector-panel {
    width: 320px;
  }
}

@media (max-width: 1024px) {
  .nexus-dock,
  .inspector-panel {
    width: 280px;
  }
  
  .nexus-title {
    font-size: 18px;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .primary-actions {
    grid-template-columns: 1fr;
  }
}
</style>
