<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import Graph2D from '../components/Graph2D.vue';
import Graph3D from './Graph3D.vue';
import NexusPanel from '../components/NexusPanel.vue';
import ClusterSettingsDialog from '../components/ClusterSettingsDialog.vue';
import NodeInspectorPanel from '../components/NodeInspectorPanel.vue';
import ColorLegend from '../components/ColorLegend.vue';
import ZoomControls from '../components/ZoomControls.vue';
import BottomToolbar from '../components/BottomToolbar.vue';
import StatsBar from '../components/StatsBar.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();
const router = useRouter();

// ===== State =====
const searchQuery = ref('');
const isLoading = ref(false);
const showRightPanel = ref(true);
const isDraggingLeft = ref(false);
const leftPanelWidth = ref(340);

// NEXUS 控制台狀態
const selectedGraphId = ref(graphStore.currentGraphId || localStorage.getItem('lastGraphId') || null);
const activeFilter = ref('all');
const nodeViewMode = ref('medium');
const isLinkingMode = ref(false);
const linkingSource = ref(null);
const isSelectOpen = ref(false);

// 圖表組件引用
const graphComponentRef = ref(null);

// 縮放比例
const zoomPercent = ref(100);
let zoomPollTimer = null;

// 密度過濾 / 叢集控制
const densityThreshold = ref(0);
const clusterEnabled = ref(true);
const nodeSpacing = ref(50);

// 星系設定面板
const showClusterSettings = ref(false);

const openClusterSettings = () => {
  showClusterSettings.value = true;
};

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

// 顏色圖例篩選
const handleFilterByType = (type) => {
  searchQuery.value = `type:${type}`;
  const matched = graphStore.nodes.filter(n => (n.type || '').toLowerCase() === type);
  if (matched.length > 0) {
    graphStore.selectNode(matched[0].id);
    ElMessage({ message: `已篩選 ${matched.length} 個「${type}」節點`, type: 'info', duration: 1500 });
  }
};

const handleNodeClick = (node) => {
  // 如果處於連線模式
  if (isLinkingMode.value) {
    handleLinkingClick(node);
    return;
  }
  
  // 正常模式：選擇節點並顯示詳情（NodeInspectorPanel 自行同步本地資料）
  graphStore.selectNode(node.id);
  showRightPanel.value = true;
  
  // 🎯 觸發聚焦：調用圖表組件的聚焦方法
  if (graphComponentRef.value?.focusNode) {
    graphComponentRef.value.focusNode(node);
  }
};

// ===== Inspector 事件處理（委派給 NodeInspectorPanel 元件） =====
const closeInspector = () => {
  showRightPanel.value = false;
  graphStore.clearSelection();
};

const handleInspectorSave = async ({ nodeData, selectedLinks }) => {
  if (!graphStore.selectedNode) return;
  try {
    await graphStore.updateEntity(nodeData.id, {
      name: nodeData.name,
      link: nodeData.link,
      description: nodeData.description,
      image: nodeData.image,
      tags: nodeData.tags || [],
    });
    if (selectedLinks.length > 0) {
      for (const link of selectedLinks) {
        graphStore.addLink({
          source: nodeData.id,
          target: link.target_id,
          relation: link.relation,
          reason: link.reason,
          value: 1,
        });
      }
      ElMessage.success(`💾 已保存節點及 ${selectedLinks.length} 個建議連線`);
    } else {
      ElMessage.success(`💾 已保存節點「${nodeData.name}」的變更`);
    }
  } catch (error) {
    ElMessage.error(`保存失敗: ${error.message}`);
  }
};

const handleInspectorDelete = async (nodeId) => {
  const nodeName = graphStore.selectedNode?.name || nodeId;
  try {
    await ElMessageBox.confirm(
      `此操作將同時刪除所有相關連接，且無法復原。`,
      `確定要刪除節點「${nodeName}」嗎？`,
      { confirmButtonText: '刪除', cancelButtonText: '取消', type: 'warning' }
    );
  } catch { return; }
  try {
    await graphStore.deleteEntity(nodeId);
    showRightPanel.value = false;
    ElMessage.success(`🗑️ 已刪除節點「${nodeName}」`);
  } catch (error) {
    ElMessage.error(`刪除失敗: ${error.message}`);
  }
};

const handleInspectorHighlight = (targetId) => {
  if (targetId) {
    graphComponentRef.value?.highlightNode?.(targetId);
  } else {
    graphComponentRef.value?.unhighlightNode?.();
  }
};

// ===== NEXUS 控制台 Methods =====
const handleGraphChange = async (graphIdOrEvent) => {
  // 🔧 支持 NexusPanel emit 的 graphId（number/string）和 DOM 事件
  let graphId;
  if (graphIdOrEvent && graphIdOrEvent.target && graphIdOrEvent.target.value !== undefined) {
    graphId = graphIdOrEvent.target.value;
  } else {
    graphId = graphIdOrEvent;
  }
  console.log('📊 [GraphPage] 切換圖譜:', graphId);
  
  selectedGraphId.value = graphId;
  localStorage.setItem('lastGraphId', String(graphId));
  
  try {
    isLoading.value = true;
    await graphStore.fetchGraphData(graphId);
    console.log('✅ [GraphPage] 圖譜切換完成:', graphStore.nodeCount, '個節點');
    ElMessage.success(`🔄 已切換到圖譜: ${graphId}`);
  } catch (error) {
    console.error('❌ [GraphPage] 圖譜切換失敗:', error);
    ElMessage.error('圖譜切換失敗: ' + error.message);
  } finally {
    isLoading.value = false;
  }
  isSelectOpen.value = false;
};

const handleEditGraph = async () => {
  const graphId = selectedGraphId.value;
  const graph = graphStore.graphMetadataList.find(g => String(g.id) === String(graphId));
  const currentName = graph?.name || '';
  
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '請輸入新的圖譜名稱',
      '編輯圖譜',
      {
        confirmButtonText: '儲存',
        cancelButtonText: '取消',
        inputValue: currentName,
        inputPattern: /\S+/,
        inputErrorMessage: '圖譜名稱不能為空',
        customClass: 'dark-message-box'
      }
    );
    
    if (newName && newName.trim() !== currentName) {
      await graphStore.updateGraph(graphId, { name: newName.trim() });
      ElMessage.success(`✅ 圖譜已重新命名為「${newName.trim()}」`);
    }
  } catch {
    // 使用者取消
  }
};

const handleCreateGraph = async () => {
  try {
    const { value: graphName } = await ElMessageBox.prompt(
      '請輸入圖譜名稱',
      '新增圖譜',
      {
        confirmButtonText: '建立',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：研究專題、專案知識庫...',
        inputPattern: /\S+/,
        inputErrorMessage: '圖譜名稱不能為空',
        customClass: 'dark-message-box'
      }
    );
    
    if (graphName && graphName.trim()) {
      const newGraph = await graphStore.createGraph({ name: graphName.trim() });
      ElMessage.success(`✅ 圖譜「${graphName.trim()}」已建立`);
      
      // 自動切換到新圖譜
      selectedGraphId.value = newGraph.id;
      await graphStore.fetchGraphData(newGraph.id);
      
      // 提示是否前往匯入資料
      try {
        await ElMessageBox.confirm(
          `圖譜「${graphName.trim()}」已建立成功，\n是否立即前往匯入資料？`,
          '📂 匯入資料',
          {
            confirmButtonText: '前往匯入',
            cancelButtonText: '稍後再說',
            type: 'info',
            customClass: 'dark-message-box'
          }
        );
        router.push({ path: '/import', query: { graphId: newGraph.id } });
      } catch {
        // 使用者選擇稍後再說，留在當前頁面
      }
    }
  } catch {
    // 使用者取消
  }
};

const handleDeleteGraph = async () => {
  const graphId = selectedGraphId.value;
  
  // 禁止刪除最後一個圖譜
  if (graphStore.graphMetadataList.length <= 1) {
    ElMessage.warning('⚠️ 至少需要保留一個圖譜，無法刪除');
    return;
  }
  
  // 取得圖譜名稱
  const graph = graphStore.graphMetadataList.find(g => String(g.id) === String(graphId));
  const graphName = graph?.name || graphId;
  const nodeCount = graphStore.nodeCount;
  const linkCount = graphStore.linkCount;
  
  // 檢查是否有 RAGFlow 知識庫關聯
  const ragflowInfo = graph?.ragflow_dataset_id 
    ? `• RAGFlow 知識庫中的所有文件\n\n` 
    : '\n';

  try {
    await ElMessageBox.confirm(
      `確定要刪除圖譜「${graphName}」嗎？\n\n` +
      `此操作將永久刪除：\n` +
      `• ${nodeCount} 個節點\n` +
      `• ${linkCount} 條連線\n` +
      ragflowInfo +
      `⚠️ 此操作無法復原！`,
      '刪除圖譜',
      {
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        customClass: 'dark-message-box'
      }
    );
    
    // 使用者確認刪除
    await graphStore.deleteGraph(graphId, true);
    
    // 切換到剩餘的第一個圖譜
    const remaining = graphStore.graphMetadataList[0];
    if (remaining) {
      selectedGraphId.value = remaining.id;
      await graphStore.fetchGraphData(remaining.id);
    }
    
    ElMessage.success(`✅ 圖譜「${graphName}」已刪除`);
    
  } catch (action) {
    // 使用者取消 或 刪除失敗
    if (action !== 'cancel') {
      ElMessage.error(`❌ 刪除失敗: ${action.message || action}`);
    }
  }
};

const setFilter = (filter) => {
  activeFilter.value = filter;
  graphStore.setFilterMode(filter);
  ElMessage.info(`🔎 已切換到: ${filter === 'all' ? '顯示全部' : filter === 'focus' ? '焦點模式' : '部分顯示'}`);
};

// ===== Zoom 控制 =====
const handleZoomIn = () => {
  graphComponentRef.value?.zoomIn?.();
  updateZoomPercent();
};

const handleZoomOut = () => {
  graphComponentRef.value?.zoomOut?.();
  updateZoomPercent();
};

const handleZoomFit = () => {
  graphComponentRef.value?.zoomToFit?.();
  setTimeout(updateZoomPercent, 900);
};

const handleZoomReset = () => {
  graphComponentRef.value?.resetView?.();
  setTimeout(updateZoomPercent, 1100);
};

const updateZoomPercent = () => {
  const z = graphComponentRef.value?.getZoom?.();
  if (z) zoomPercent.value = Math.round(z * 100);
};

// ===== Focus 模式 =====
const isFocusMode = computed(() => activeFilter.value === 'focus');

const toggleFocusMode = () => {
  const next = isFocusMode.value ? 'all' : 'focus';
  setFilter(next);
};

// ===== 快速新增節點 =====
const handleQuickAddNode = () => {
  const name = `新節點 ${graphStore.nodeCount + 1}`;
  graphStore.addNode({
    name,
    type: 'note',
    description: '',
  });
  ElMessage.success(`✅ 已新增：${name}`);
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

// ===== Lifecycle =====
onMounted(async () => {
  // 🌟 每次進入頁面都刷新數據，確保同步（Manager 自動處理緩存）
  console.log('🔄 [GraphPage] 加載圖譜數據');
  isLoading.value = true;
  
  // 決定載入哪個圖譜：優先 store > localStorage > 預設 1
  const graphIdToLoad = graphStore.currentGraphId || localStorage.getItem('lastGraphId') || 1;
  selectedGraphId.value = graphIdToLoad;
  
  try {
    // 並行載入：圖譜數據 + 元數據列表（確保圖譜選擇器有數據）
    await Promise.all([
      graphStore.fetchGraphData(graphIdToLoad),
      graphStore.loadGraphMetadataList().catch(err => {
        console.warn('⚠️ [GraphPage] 元數據列表載入失敗（不影響圖譜顯示）:', err.message);
      })
    ]);
    
    // 持久化當前圖譜 ID
    localStorage.setItem('lastGraphId', String(graphIdToLoad));
    
    console.log('✅ [GraphPage] 圖譜數據已加載:', graphStore.nodeCount, '個節點,', graphStore.linkCount, '個連接');
    // 啟動縮放比例輪詢
    zoomPollTimer = setInterval(updateZoomPercent, 2000);
  } catch (error) {
    console.error('❌ 圖譜數據加載失敗:', error);
    ElMessage.error('圖譜數據加載失敗: ' + (error.message || '未知錯誤'));
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (zoomPollTimer) clearInterval(zoomPollTimer);
});
</script>

<template>
  <div class="flex h-full w-full overflow-hidden bg-[#0a0e27]">
    <!-- 左側可拖拉欄: 預設 420px -->
    <aside 
      class="h-full flex-shrink-0 border-r bg-[#0a0e27] flex flex-col shadow-sm z-20 border-[#2d3154] relative"
      :style="{ width: leftPanelWidth + 'px' }"
    >
      <!-- 上方: NexusPanel (flex-1 可滾動) -->
      <div class="flex-1 overflow-y-auto border-b border-[#2d3154]">
        <NexusPanel 
          :search-query="searchQuery"
          v-model:selectedGraphId="selectedGraphId"
          :active-filter="activeFilter"
          v-model:nodeViewMode="nodeViewMode"
          :is-linking-mode="isLinkingMode"
          :linking-source="linkingSource"
          @graph-change="handleGraphChange"
          @edit-graph="handleEditGraph"
          @create-graph="handleCreateGraph"
          @delete-graph="handleDeleteGraph"
          @node-click="handleNodeClick"
        />
      </div>
      
      <!-- 拖動手柄 -->
      <div
        class="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-30"
        @mousedown="startDragLeft"
        title="拖動調整寬度"
      >
        <div class="h-full w-px mx-auto bg-white/20"></div>
      </div>
    </aside>

    <!-- 右側畫布區: flex-1 -->
    <main class="flex-1 relative bg-black">
      <!-- 載入動畫 -->
      <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
        <div class="w-15 h-15 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-400 m-0">載入知識圖譜中...</p>
      </div>
      
      <!-- 圖譜畫布 -->
      <keep-alive v-else>
        <component 
          :is="currentComponent" 
          :key="graphStore.viewMode" 
          ref="graphComponentRef"
          :density-threshold="densityThreshold"
          :focus-fade="isFocusMode || !!graphStore.selectedNode"
          :cluster-enabled="clusterEnabled"
          :node-spacing="nodeSpacing"
        />
      </keep-alive>

      <!-- 右側縮放控制列 (Fixed Overlay) -->
      <div class="fixed right-6 top-1/2 -translate-y-1/2 z-[55] flex flex-col gap-3 pointer-events-auto">
        <ZoomControls
          :zoom-percent="zoomPercent"
          :is3-d="graphStore.viewMode === '3d'"
          @zoom-in="handleZoomIn"
          @zoom-out="handleZoomOut"
          @zoom-fit="handleZoomFit"
          @zoom-reset="handleZoomReset"
          @toggle-layout="toggleViewMode"
        />
        <!-- 節點間距滑桿 -->
        <div class="spacing-slider-panel" v-if="graphStore.viewMode !== '3d'">
          <div class="spacing-label">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="4" cy="8" r="2.5" stroke="currentColor" stroke-width="1.2"/>
              <circle cx="12" cy="8" r="2.5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M6.5 8h3" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.5 1.5"/>
            </svg>
            <span>間距</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" step="1"
            v-model.number="nodeSpacing"
            class="spacing-range"
            title="節點間距"
          />
          <div class="spacing-value">{{ nodeSpacing }}%</div>
        </div>
      </div>

      <!-- 搜尋框 (右下角) -->
      <div class="absolute bottom-28 right-6 z-30">
        <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl"
             style="background: rgba(10, 14, 39, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM13 13l-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text"
            class="w-56 bg-transparent border-none text-sm text-white placeholder-gray-400 focus:outline-none"
            placeholder="Search nodes..."
            @keyup.enter="handleSearch"
          />
          <button 
            v-if="searchQuery" 
            class="w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all bg-white/20 hover:bg-white/30 text-white flex-shrink-0 cursor-pointer border-none"
            @click="clearSearch"
          >✕</button>
        </div>
      </div>

      <!-- 底部工具列 (固定於螢幕正中央底部) -->
      <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <BottomToolbar
          :is-focus-mode="isFocusMode"
          :is-linking-mode="isLinkingMode"
          :active-filter="activeFilter"
          @toggle-focus="toggleFocusMode"
          @set-filter="setFilter"
          @add-node="handleQuickAddNode"
          @toggle-linking="toggleLinkingMode"
          @open-cluster-settings="openClusterSettings"
        />
      </div>

      <!-- 底部統計列 (右下角) -->
      <div class="fixed bottom-3 right-6 z-40 pointer-events-auto">
        <StatsBar />
      </div>

      <!-- NODE TYPES 標記 (左下角) -->
      <div class="fixed bottom-3 z-40 pointer-events-auto" :style="{ left: layoutStore.isSidebarCollapsed ? '16px' : '296px' }">
        <div class="px-3 py-1.5">
          <ColorLegend @filter-type="handleFilterByType" />
        </div>
      </div>

      <!-- 星系圖片設定面板（已拆分為獨立元件） -->
      <ClusterSettingsDialog v-model="showClusterSettings" :graphComponentRef="graphComponentRef" />
    </main>

    <!-- 節點檢查器面板（已拆分為獨立元件） -->
    <NodeInspectorPanel
      :visible="showRightPanel && !!graphStore.selectedNode"
      :node="graphStore.selectedNode"
      :allTags="graphStore.allTags"
      :graphComponentRef="graphComponentRef"
      @close="closeInspector"
      @save="handleInspectorSave"
      @delete="handleInspectorDelete"
      @highlight-node="handleInspectorHighlight"
    />
    

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

/* ===== 節點間距滑桿面板 ===== */
.spacing-slider-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: 14px;
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.spacing-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(229, 229, 229, 0.6);
  user-select: none;
}

.spacing-range {
  -webkit-appearance: none;
  appearance: none;
  width: 32px;
  height: 100px;
  writing-mode: vertical-lr;
  direction: rtl;
  background: transparent;
  cursor: pointer;
}

.spacing-range::-webkit-slider-runnable-track {
  width: 4px;
  height: 100%;
  background: linear-gradient(to top, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
  border-radius: 2px;
}

.spacing-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  margin-left: -6px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.spacing-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.6);
}

.spacing-value {
  font-size: 10px;
  font-weight: 600;
  color: rgba(229, 229, 229, 0.45);
  font-family: 'JetBrains Mono', monospace;
  user-select: none;
}
</style>
