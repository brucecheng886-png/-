import { defineStore } from 'pinia';
import { ref, computed, type Ref } from 'vue';
import graphDataManager from '../services/GraphDataManager';
import type { GraphNode, GraphLink, BatchResult, ViewMode, FilterMode } from '@/types';

// Composable 模組
import { useImportFeatures } from './importComposable';
import { useCrossGraphFeatures } from './crossGraphComposable';
import { useRagflowFeatures } from './ragflowComposable';
import { useTagFeatures } from './tagComposable';
import { useGraphApiFeatures } from './graphApiComposable';

/**
 * Graph Store - 圖譜數據管理 (Facade)
 * 
 * 職責:
 * - 統一管理核心狀態（nodes、links、selection、viewMode）
 * - 組合所有子模組（Tag、API、Import、CrossGraph、RAGFlow）
 * - 提供單一進入點供所有元件使用
 * 
 * 子模組:
 * - tagComposable.ts       — Tag 標籤管理
 * - graphApiComposable.ts  — 後端 API 通訊（fetchGraphData、CRUD）
 * - importComposable.ts    — 檔案匯入 + Excel 非同步匯入
 * - crossGraphComposable.ts — 跨圖譜模式 + AI Link
 * - ragflowComposable.ts   — RAGFlow 知識庫管理
 * 
 * @author BruV Team
 * @date 2026-02-02
 * @updated 2026-02-23 - v5.5 Store 拆分重構
 */
export const useGraphStore = defineStore('graph', () => {
  // ===== Core State =====
  
  /** 節點數據 (支援 2D/3D 共用) */
  const nodes: Ref<GraphNode[]> = ref([]);
  
  /** 節點屬性變更版本計數器（用於觸發圖譜即時更新） */
  const nodeVersion = ref(0);
  
  /** 連線數據 (邊) */
  const links: Ref<GraphLink[]> = ref([]);
  
  /** 當前選中的節點 */
  const selectedNode: Ref<GraphNode | null> = ref(null);
  
  /** 視圖模式 ('2d' | '3d') */
  const viewMode: Ref<ViewMode> = ref((localStorage.getItem('graphViewMode') || '2d') as ViewMode);
  
  /** 加載狀態 */
  const loading = ref(false);
  
  /** 錯誤訊息 */
  const error: Ref<string | null> = ref(null);
  
  /** 數據最後更新時間 */
  const lastUpdate: Ref<Date | null> = ref(null);
  
  /** 過濾模式 ('all' | 'focus' | 'part') */
  const filterMode: Ref<FilterMode> = ref('all');

  /** 當前選中的圖譜 ID（從 localStorage 恢復，確保跨頁面一致） */
  const savedGraphId = typeof window !== 'undefined' ? localStorage.getItem('lastGraphId') : null;
  const currentGraphId: Ref<string | number | null> = ref(savedGraphId || 1);

  // ===== Core Computed =====
  
  /** 節點總數 */
  const nodeCount = computed(() => nodes.value.length);
  
  /** 連線總數 */
  const linkCount = computed(() => links.value.length);
  
  /** 是否有選中節點 */
  const hasSelection = computed(() => selectedNode.value !== null);
  
  /** 是否為 3D 模式 */
  const is3DMode = computed(() => viewMode.value === '3d');
  
  /** 是否為 2D 模式 */
  const is2DMode = computed(() => viewMode.value === '2d');
  
  /** 根據類型分組的節點統計 */
  const nodesByType = computed((): Record<string, GraphNode[]> => {
    const groups: Record<string, GraphNode[]> = {};
    nodes.value.forEach(node => {
      const type = node.type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(node);
    });
    return groups;
  });

  // ===== Graph Traversal Helpers =====
  
  /**
   * 獲取節點的所有連線
   * @param nodeId - 節點 ID
   */
  const getNodeLinks = (nodeId: string): GraphLink[] => {
    return links.value.filter(
      link => link.source === nodeId || link.target === nodeId
    );
  };
  
  /**
   * 獲取節點的鄰居節點
   * @param nodeId - 節點 ID
   */
  const getNeighbors = (nodeId: string): GraphNode[] => {
    const nodeLinks = getNodeLinks(nodeId);
    const neighborIds = new Set();
    
    nodeLinks.forEach(link => {
      if (link.source === nodeId) {
        neighborIds.add(link.target);
      } else {
        neighborIds.add(link.source);
      }
    });
    
    return nodes.value.filter(n => neighborIds.has(n.id));
  };

  // ===== Composable: Tags =====
  const tagFeatures = useTagFeatures({ nodes, nodeVersion, currentGraphId });

  // ===== Filtered Computed (依賴 tagFeatures) =====
  
  /** 過濾後的節點列表（支援 filterMode + tag 過濾） */
  const filteredNodes = computed(() => {
    let result = nodes.value;
    
    // 1️⃣ filterMode 過濾
    if (filterMode.value !== 'all' && selectedNode.value) {
      if (filterMode.value === 'focus') {
        const neighbors = getNeighbors(selectedNode.value.id);
        const neighborIds = new Set(neighbors.map(n => n.id));
        neighborIds.add(selectedNode.value.id);
        result = result.filter(n => neighborIds.has(n.id));
      } else if (filterMode.value === 'part') {
        const selectedGroup = selectedNode.value.group;
        result = result.filter(n => n.group === selectedGroup);
      }
    }
    
    // 2️⃣ Tag 過濾
    if (tagFeatures.activeTagFilter.value) {
      const filterTags = Array.isArray(tagFeatures.activeTagFilter.value) 
        ? tagFeatures.activeTagFilter.value 
        : [tagFeatures.activeTagFilter.value];
      if (filterTags.length > 0) {
        result = result.filter(n => {
          const nodeTags = n.tags || [];
          if (tagFeatures.tagFilterMode.value === 'all') {
            return filterTags.every(t => nodeTags.includes(t));
          }
          return filterTags.some(t => nodeTags.includes(t));
        });
      }
    }
    
    return result;
  });
  
  /** 過濾後的連線列表 */
  const filteredLinks = computed(() => {
    if (filterMode.value === 'all') {
      return links.value;
    }
    
    const nodeIds = new Set(filteredNodes.value.map(n => n.id));
    return links.value.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
  });

  // ===== Selection & View Actions =====
  
  /**
   * 選中節點
   * @param nodeId - 節點 ID (null 表示取消選中)
   */
  const selectNode = (nodeId: string | null) => {
    if (nodeId === null) {
      selectedNode.value = null;
      console.log('🔍 取消選中節點');
      return;
    }
    
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      selectedNode.value = node;
      console.log('🔍 選中節點:', node.name, `(${node.type})`);
    } else {
      console.warn('⚠️ 節點不存在:', nodeId);
    }
  };

  /**
   * 對焦到指定節點（設置為選中狀態）
   * 用於 ImportDashboard 檔案卡片點擊時聚焦
   * @param nodeId - 節點 ID
   */
  const focusNode = (nodeId: string) => {
    if (!nodeId) {
      console.warn('⚠️ focusNode: nodeId 不能為空');
      return;
    }
    
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      selectedNode.value = node;
      console.log('🎯 對焦節點:', node.label || node.name, `(ID: ${node.id})`);
    } else {
      console.warn('⚠️ 找不到節點:', nodeId);
    }
  };
  
  /** 切換視圖模式 (2D <-> 3D) */
  const toggleViewMode = () => {
    const newMode = viewMode.value === '3d' ? '2d' : '3d';
    viewMode.value = newMode;
    localStorage.setItem('graphViewMode', newMode);
    console.log(`🔄 視圖模式已切換至: ${newMode.toUpperCase()}`);
  };
  
  /**
   * 設置視圖模式
   * @param mode - '2d' 或 '3d'
   */
  const setViewMode = (mode: ViewMode) => {
    if (!['2d', '3d'].includes(mode)) {
      console.error('❌ 無效的視圖模式:', mode);
      return;
    }
    viewMode.value = mode;
    localStorage.setItem('graphViewMode', mode);
    console.log(`✅ 視圖模式已設置為: ${mode.toUpperCase()}`);
  };
  
  /** 根據 ID 獲取節點 */
  const getNodeById = (nodeId: string): GraphNode | undefined => {
    return nodes.value.find(n => n.id === nodeId);
  };
  
  /** 根據類型篩選節點 */
  const getNodesByType = (type: string): GraphNode[] => {
    return nodes.value.filter(n => n.type === type);
  };
  
  /** 清空選中狀態 */
  const clearSelection = () => {
    selectedNode.value = null;
  };
  
  /** 重置圖譜數據 */
  const resetGraph = () => {
    nodes.value = [];
    links.value = [];
    selectedNode.value = null;
    lastUpdate.value = null;
    error.value = null;
    console.log('🔄 圖譜數據已重置');
  };
  
  /**
   * 設定過濾模式
   * @param mode - 'all' | 'focus' | 'part'
   */
  const setFilterMode = (mode: FilterMode) => {
    if (!['all', 'focus', 'part'].includes(mode)) {
      console.error('❌ 無效的過濾模式:', mode);
      return;
    }
    filterMode.value = mode;
    console.log('🔎 過濾模式已切換:', mode);
  };

  // ===== Node Mutation Actions =====
  
  /**
   * 添加節點
   * @param node - 節點對象
   * @returns 返回添加的節點對象，失敗返回 null
   */
  const addNode = (node: Partial<GraphNode> & { id: string }): GraphNode | null => {
    if (!node.id) {
      console.error('❌ 節點必須包含 id 屬性');
      return null;
    }
    
    const exists = nodes.value.some(n => n.id === node.id);
    if (exists) {
      console.warn('⚠️ 節點已存在:', node.id);
      return null;
    }
    
    // 格式對齊：確保節點具備必要欄位
    const formattedNode = {
      id: node.id,
      name: node.name || node.label || node.id,
      label: node.label || node.name || node.id,
      type: node.type || '檔案',
      group: node.group || 7,
      color: node.color || '#9e9e9e',
      size: node.size || 24,
      description: node.description || '',
      emoji: node.emoji || '📄',
      tags: Array.isArray(node.tags) ? [...node.tags] : [],
      ...node
    };
    
    // 響應式更新：使用陣列展開確保 Vue 偵測到變化
    nodes.value = [...nodes.value, formattedNode];
    
    console.log('➕ 節點已添加:', formattedNode.name || formattedNode.id);
    
    // 預設選中：匯入成功後自動選中新節點
    selectNode(formattedNode.id);
    console.log('✨ 已自動選中新節點:', formattedNode.name);
    
    return formattedNode;
  };

  /**
   * 批量添加節點
   * @param nodeArray - 節點陣列
   * @returns 添加結果統計
   */
  const addBatchNodes = (nodeArray: Array<Partial<GraphNode> & { id: string }>): BatchResult => {
    if (!Array.isArray(nodeArray)) {
      console.error('❌ addBatchNodes 需要陣列參數');
      return { success: 0, skipped: 0, failed: 0, lastNodeId: null };
    }

    const stats: BatchResult = { success: 0, skipped: 0, failed: 0, lastNodeId: null };
    const newNodes: GraphNode[] = [];
    
    // 使用 Set 做 O(1) 去重（而非 O(N) 遍歷）
    const existingIds = new Set(nodes.value.map(n => n.id));

    nodeArray.forEach(node => {
      try {
        if (!node.id) {
          console.warn('⚠️ 跳過無 id 的節點:', node);
          stats.failed++;
          return;
        }

        if (existingIds.has(node.id)) {
          stats.skipped++;
          return;
        }

        // 格式對齊：確保節點具備必要欄位
        const formattedNode = {
          id: node.id,
          name: node.name || node.label || node.id,
          label: node.label || node.name || node.id,
          type: node.type || '檔案',
          group: node.group || 7,
          color: node.color || '#9e9e9e',
          size: node.size || 24,
          description: node.description || '',
          emoji: node.emoji || '📄',
          ...node
        };

        newNodes.push(formattedNode);
        stats.success++;
        stats.lastNodeId = formattedNode.id;
      } catch (batchError) {
        console.error('❌ 添加節點失敗:', node, batchError);
        stats.failed++;
      }
    });

    // 響應式更新：使用陣列展開一次性添加所有節點
    if (newNodes.length > 0) {
      nodes.value = [...nodes.value, ...newNodes];
      
      // 預設選中最後一個添加的節點
      if (stats.lastNodeId) {
        selectNode(stats.lastNodeId);
        console.log('✨ 已自動選中最後添加的節點:', stats.lastNodeId);
      }
    }

    console.log(`📦 批量添加節點完成: 成功 ${stats.success}, 跳過 ${stats.skipped}, 失敗 ${stats.failed}`);
    return stats;
  };
  
  /**
   * 添加連線
   * @param link - 連線對象 { source, target, value?, label? }
   */
  const addLink = (link: Partial<GraphLink> & { source: string; target: string }) => {
    if (!link.source || !link.target) {
      console.error('❌ 連線必須包含 source 和 target 屬性');
      return;
    }
    
    links.value.push(link);
    console.log('🔗 連線已添加:', `${link.source} -> ${link.target}`);
  };
  
  /**
   * 更新節點數據
   * @param nodeId - 節點 ID
   * @param updates - 要更新的屬性
   */
  const updateNode = (nodeId: string, updates: Partial<GraphNode>) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) {
      console.error('❌ 節點不存在:', nodeId);
      return;
    }
    
    // 更新節點數據
    nodes.value[nodeIndex] = {
      ...nodes.value[nodeIndex],
      ...updates
    };
    
    // 遞增版本計數器，觸發圖譜即時渲染更新
    nodeVersion.value++;
    
    // 同步更新選中節點
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = nodes.value[nodeIndex];
    }
    
    // 失效緩存，確保下次載入從後端取得最新數據
    graphDataManager.invalidateCache(currentGraphId.value);
    
    console.log('✏️ 節點已更新:', nodeId, updates);
  };
  
  /**
   * 刪除節點 (同時刪除相關連線)
   * @param nodeId - 節點 ID
   */
  const deleteNode = (nodeId: string) => {
    nodes.value = nodes.value.filter(n => n.id !== nodeId);
    links.value = links.value.filter(
      link => link.source !== nodeId && link.target !== nodeId
    );
    
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null;
    }
    
    // 失效緩存
    graphDataManager.invalidateCache(currentGraphId.value);
    
    console.log('🗑️ 節點已刪除:', nodeId);
  };

  // ===== Composable Initialization =====
  
  const crossGraphFeatures = useCrossGraphFeatures({
    nodes, links, loading, error, lastUpdate,
  });
  const ragflowFeatures = useRagflowFeatures();
  
  // 從 crossGraph composable 取出 graphMetadataList 供圖譜 CRUD 使用
  const { graphMetadataList } = crossGraphFeatures;
  
  // Graph API 模組（需要 addNode 等本地 mutation + graphMetadataList）
  const graphApiFeatures = useGraphApiFeatures({
    nodes, links, selectedNode, loading, error, lastUpdate,
    currentGraphId, graphMetadataList,
    addNode, addBatchNodes, updateNode, deleteNode,
  });
  
  // Import 模組（需要 fetchGraphData 來自 graphApiFeatures）
  const importFeatures = useImportFeatures({
    addNode, addBatchNodes, fetchGraphData: graphApiFeatures.fetchGraphData,
    selectedNode, error, loading, currentGraphId,
  });

  // ===== 返回 Store API =====
  return {
    // Core State
    nodes,
    nodeVersion,
    links,
    selectedNode,
    viewMode,
    loading,
    error,
    lastUpdate,
    filterMode,
    currentGraphId,
    
    // Core Computed
    nodeCount,
    linkCount,
    hasSelection,
    is3DMode,
    is2DMode,
    nodesByType,
    filteredNodes,
    filteredLinks,
    
    // Selection & View Actions
    selectNode,
    focusNode,
    toggleViewMode,
    setViewMode,
    getNodeById,
    getNodesByType,
    getNodeLinks,
    getNeighbors,
    clearSelection,
    resetGraph,
    setFilterMode,
    
    // Node Mutation Actions
    addNode,
    addBatchNodes,
    addLink,
    updateNode,
    deleteNode,
    
    // Composable Spread — Tag 管理
    ...tagFeatures,
    
    // Composable Spread — API 通訊
    ...graphApiFeatures,
    
    // Composable Spread — 匯入 / 跨圖譜 / RAGFlow
    ...importFeatures,
    ...crossGraphFeatures,
    ...ragflowFeatures,
  };
});