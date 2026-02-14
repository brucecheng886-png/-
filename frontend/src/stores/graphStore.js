import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import crossGraphData from '../data/crossGraphTestData.js';
import graphDataManager from '../services/GraphDataManager.js';
import { authFetch, apiGet, apiPost, apiPut, apiDelete, apiPostForm } from '../services/apiClient';

/**
 * Graph Store - 圖譜數據管理
 * 
 * 職責:
 * - 統一管理 2D/3D 圖譜的節點和連線數據
 * - 支持多圖譜和跨圖譜 AI Link 功能
 * - 控制視圖模式切換 (2D/3D)
 * - 管理選中節點狀態
 * - 提供數據加載接口 (目前使用 Mock Data)
 * 
 * @author BruV Team
 * @date 2026-02-02
 * @updated 2026-02-02 - 新增跨圖譜功能
 */
export const useGraphStore = defineStore('graph', () => {
  // ===== State =====
  
  /**
   * 節點數據 (支援 2D/3D 共用)
   * @type {import('vue').Ref<Array<Object>>}
   */
  const nodes = ref([]);
  
  /**
   * 節點屬性變更版本計數器（用於觸發圖譜即時更新）
   * @type {import('vue').Ref<number>}
   */
  const nodeVersion = ref(0);
  
  /**
   * 連線數據 (邊)
   * @type {import('vue').Ref<Array<Object>>}
   */
  const links = ref([]);
  
  /**
   * 當前選中的節點
   * @type {import('vue').Ref<Object|null>}
   */
  const selectedNode = ref(null);
  
  /**
   * 視圖模式 ('2d' | '3d')
   * @type {import('vue').Ref<string>}
   */
  const viewMode = ref(localStorage.getItem('graphViewMode') || '2d');
  
  /**
   * 加載狀態
   * @type {import('vue').Ref<boolean>}
   */
  const loading = ref(false);
  
  /**
   * 錯誤訊息
   * @type {import('vue').Ref<string|null>}
   */
  const error = ref(null);
  
  /**
   * 數據最後更新時間
   * @type {import('vue').Ref<Date|null>}
   */
  const lastUpdate = ref(null);
  
  /**
   * 過濾模式 ('all' | 'focus' | 'part')
   * @type {import('vue').Ref<string>}
   */
  const filterMode = ref('all');
  
  /**
   * 跨圖譜功能 - 圖譜元數據列表（從後端 API 加載）
   * @type {import('vue').Ref<Array<Object>>}
   */
  const graphMetadataList = ref([]);
  
  /**
   * 跨圖譜功能 - AI Link 連接列表
   * @type {import('vue').Ref<Array<Object>>}
   */
  const aiLinks = ref([]);
  
  /**
   * 跨圖譜功能 - 當前顯示的圖譜 ID 列表
   * @type {import('vue').Ref<Array<string>>}
   */
  const activeGraphIds = ref([]);
  
  /**
   * 跨圖譜功能 - 是否啟用跨圖譜模式
   * @type {import('vue').Ref<boolean>}
   */
  const isCrossGraphMode = ref(false);
  
  /**
   * RAGFlow 知識庫列表（集中管理，避免各頁面重複抓取）
   * @type {import('vue').Ref<Array<Object>>}
   */
  const ragflowDatasets = ref([]);
  
  /**
   * 已匯入的檔案列表
   * @type {import('vue').Ref<Array<Object>>}
   */
  const importedFiles = ref([]);
  
  // ===== Excel 匯入進度追蹤 =====
  const importTaskId = ref(null);
  const importStatus = ref('idle');  // idle | running | done | error
  const importProgress = ref(0);     // 0-100
  const importDetail = ref({
    total: 0, completed: 0, failed: 0, filename: '',
    eta_seconds: null, rows_per_sec: 0,
    batch_size: 0, total_batches: 0, completed_batches: 0,
    fast_mode: false, elapsed_seconds: null,
  });
  let _importPollTimer = null;
  
  /**
   * 當前選中的圖譜 ID（從 localStorage 恢復，確保跨頁面一致）
   * @type {import('vue').Ref<number|string>}
   */
  const savedGraphId = typeof window !== 'undefined' ? localStorage.getItem('lastGraphId') : null;
  const currentGraphId = ref(savedGraphId || 1);
  
  // ===== 初始化：加載圖譜列表（使用 Manager）=====
  const loadGraphMetadataList = async (options = {}) => {
    try {
      const graphs = await graphDataManager.loadMetadataList(options);
      graphMetadataList.value = graphs;
      console.log(`✅ [Store] 圖譜列表已加載: ${graphs.length} 個`);
      return graphs;
    } catch (error) {
      console.error('❌ [Store] 加載圖譜列表失敗:', error);
      throw error;
    }
  };
  
  // ===== Computed =====
  
  /**
   * 節點總數
   */
  const nodeCount = computed(() => nodes.value.length);
  
  /**
   * 連線總數
   */
  const linkCount = computed(() => links.value.length);
  
  /**
   * 是否有選中節點
   */
  const hasSelection = computed(() => selectedNode.value !== null);
  
  /**
   * 是否為 3D 模式
   */
  const is3DMode = computed(() => viewMode.value === '3d');
  
  /**
   * 是否為 2D 模式
   */
  const is2DMode = computed(() => viewMode.value === '2d');
  
  /**
   * 根據類型分組的節點統計
   */
  const nodesByType = computed(() => {
    const groups = {};
    nodes.value.forEach(node => {
      const type = node.type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(node);
    });
    return groups;
  });
  
  /**
   * 過濾後的節點列表
   */
  const filteredNodes = computed(() => {
    if (filterMode.value === 'all') {
      return nodes.value;
    }
    
    if (!selectedNode.value) {
      return nodes.value;
    }
    
    if (filterMode.value === 'focus') {
      // Focus: 選中節點 + 它的鄰居
      const neighbors = getNeighbors(selectedNode.value.id);
      const neighborIds = new Set(neighbors.map(n => n.id));
      neighborIds.add(selectedNode.value.id);
      return nodes.value.filter(n => neighborIds.has(n.id));
    }
    
    if (filterMode.value === 'part') {
      // Part: 同一群組的節點
      const selectedGroup = selectedNode.value.group;
      return nodes.value.filter(n => n.group === selectedGroup);
    }
    
    return nodes.value;
  });
  
  /**
   * 過濾後的連線列表
   */
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
  
  /**
   * 跨圖譜功能 - 所有連接（包含 AI Link）
   */
  const allLinks = computed(() => {
    if (!isCrossGraphMode.value) {
      return links.value;
    }
    // 合併普通連接和 AI Link
    return [...links.value, ...aiLinks.value];
  });
  
  /**
   * 跨圖譜功能 - 按圖譜分組的節點
   */
  const nodesByGraph = computed(() => {
    const groups = {};
    nodes.value.forEach(node => {
      const graphId = node.graphId || 'default';
      if (!groups[graphId]) {
        groups[graphId] = [];
      }
      groups[graphId].push(node);
    });
    return groups;
  });
  
  /**
   * 跨圖譜功能 - 圖譜統計信息
   */
  const graphStats = computed(() => {
    return {
      totalGraphs: graphMetadataList.value.length,
      activeGraphs: activeGraphIds.value.length,
      totalNodes: nodes.value.length,
      totalLinks: links.value.length,
      totalAILinks: aiLinks.value.length,
      isCrossGraphMode: isCrossGraphMode.value
    };
  });
  
  // ===== Actions =====
  
  /**
   * 獲取圖譜數據（使用 Manager - 自動去重和緩存）
   * @param {number} graphId - 圖譜 ID
   * @param {Object} options - 選項
   * @param {boolean} options.forceRefresh - 強制刷新（忽略緩存）
   */
  const fetchGraphData = async (graphId = null, options = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      // 更新當前圖譜 ID 並持久化
      currentGraphId.value = graphId;
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastGraphId', String(graphId));
      }
      
      console.log(`🔄 [Store] 加載圖譜數據: ${graphId}`);
      
      // ✨ 使用 Manager 加載（自動處理緩存和去重）
      const result = await graphDataManager.loadGraph(graphId, options);
      
      const { nodes: apiNodes, links: apiLinks, metadata } = result;
      
      // 更新 Store 數據
      nodes.value = apiNodes || [];
      links.value = apiLinks || [];
      lastUpdate.value = new Date();
      
      // 更新元數據統計
      const existingIndex = graphMetadataList.value.findIndex(g => String(g.id) === String(graphId));
      if (existingIndex >= 0) {
        graphMetadataList.value[existingIndex] = {
          ...graphMetadataList.value[existingIndex],
          nodeCount: apiNodes.length,
          linkCount: apiLinks?.length || 0,
          lastUpdate: new Date().toISOString()
        };
      } else {
        // 新圖譜建立元數據
        graphMetadataList.value.push({
          id: graphId,
          name: metadata?.note || `圖譜 ${graphId}`,
          description: '從 KuzuDB 載入的知識圖譜',
          icon: '🌐',
          color: '#3b82f6',
          nodeCount: apiNodes.length,
          linkCount: apiLinks?.length || 0,
          lastUpdate: new Date().toISOString()
        });
      }
      
      console.log(`✅ [Store] 圖譜數據已同步: ${apiNodes.length} 節點, ${apiLinks?.length || 0} 連接`);
      
      return { nodes: apiNodes, links: apiLinks || [] };
      
    } catch (err) {
      error.value = err.message || '數據加載失敗';
      console.error('❌ [Store] 圖譜數據加載錯誤:', err);
      
      // 失敗時清空數據
      nodes.value = [];
      links.value = [];
      
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * 獲取指定節點的鄰居節點（統一 API）
   * @param {string} entityId - 實體 ID
   * @returns {Promise<Object>} { nodes, links }
   */
  const fetchNeighbors = async (entityId) => {
    if (!entityId) throw new Error('entityId 不能為空');
    loading.value = true;
    error.value = null;
    try {
      const data = await apiGet(`/api/graph/entities/${entityId}/neighbors`);
      if (!data.success) throw new Error(data.message || '獲取鄰居節點失敗');
      console.log(`✅ 鄰居節點已加載:`, data.data);
      return data.data;
    } catch (err) {
      error.value = err.message || '獲取鄰居節點失敗';
      console.error('❌ 獲取鄰居節點錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Cypher 查詢安全驗證（前端防護層）
   * 後端已有 BLOCKED_KEYWORDS 白名單，此為 defense-in-depth
   */
  const CYPHER_BLOCKED = /\b(CREATE|DELETE|DETACH|SET|REMOVE|MERGE|DROP|ALTER|CALL|COPY|LOAD)\b/i;
  const MAX_CYPHER_LENGTH = 2000;

  /**
   * 執行 Cypher 查詢（統一 API）
   * @param {string} query - Cypher 查詢語句
   * @param {Object} params - 查詢參數（可選）
   * @returns {Promise<Object>} { nodes, links }
   */
  const executeCypherQuery = async (query, params = {}) => {
    if (!query || typeof query !== 'string') {
      throw new Error('query 必須為非空字串');
    }

    // 前端安全檢查
    if (query.length > MAX_CYPHER_LENGTH) {
      throw new Error(`查詢長度超過限制 (${MAX_CYPHER_LENGTH} 字元)`);
    }
    if (CYPHER_BLOCKED.test(query)) {
      throw new Error('安全限制：僅允許讀取查詢 (MATCH/RETURN)，禁止寫入操作');
    }
    
    loading.value = true;
    error.value = null;
    try {
      console.log(`🔄 Cypher 查詢:`, query);
      const data = await apiPost('/api/graph/query', { query, params });
      if (!data.success) throw new Error(data.message || 'Cypher 查詢失敗');
      console.log(`✅ Cypher 查詢結果:`, data.data);
      return data.data;
    } catch (err) {
      error.value = err.message || 'Cypher 查詢失敗';
      console.error('❌ Cypher 查詢錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * 選中節點
   * @param {string|null} nodeId - 節點 ID (null 表示取消選中)
   */
  const selectNode = (nodeId) => {
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
   * @param {string} nodeId - 節點 ID
   */
  const focusNode = (nodeId) => {
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
  
  /**
   * 切換視圖模式 (2D <-> 3D)
   */
  const toggleViewMode = () => {
    const newMode = viewMode.value === '3d' ? '2d' : '3d';
    viewMode.value = newMode;
    localStorage.setItem('graphViewMode', newMode);
    console.log(`🔄 視圖模式已切換至: ${newMode.toUpperCase()}`);
  };
  
  /**
   * 設置視圖模式
   * @param {string} mode - '2d' 或 '3d'
   */
  const setViewMode = (mode) => {
    if (!['2d', '3d'].includes(mode)) {
      console.error('❌ 無效的視圖模式:', mode);
      return;
    }
    viewMode.value = mode;
    localStorage.setItem('graphViewMode', mode);
    console.log(`✅ 視圖模式已設置為: ${mode.toUpperCase()}`);
  };
  
  /**
   * 根據 ID 獲取節點
   * @param {string} nodeId - 節點 ID
   * @returns {Object|undefined}
   */
  const getNodeById = (nodeId) => {
    return nodes.value.find(n => n.id === nodeId);
  };
  
  /**
   * 根據類型篩選節點
   * @param {string} type - 節點類型
   * @returns {Array<Object>}
   */
  const getNodesByType = (type) => {
    return nodes.value.filter(n => n.type === type);
  };
  
  /**
   * 獲取節點的所有連線
   * @param {string} nodeId - 節點 ID
   * @returns {Array<Object>}
   */
  const getNodeLinks = (nodeId) => {
    return links.value.filter(
      link => link.source === nodeId || link.target === nodeId
    );
  };
  
  /**
   * 獲取節點的鄰居節點
   * @param {string} nodeId - 節點 ID
   * @returns {Array<Object>}
   */
  const getNeighbors = (nodeId) => {
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
  
  /**
   * 清空選中狀態
   */
  const clearSelection = () => {
    selectedNode.value = null;
  };
  
  /**
   * 重置圖譜數據
   */
  const resetGraph = () => {
    nodes.value = [];
    links.value = [];
    selectedNode.value = null;
    lastUpdate.value = null;
    error.value = null;
    console.log('🔄 圖譜數據已重置');
  };
  
  /**
   * 添加節點
   * @param {Object} node - 節點對象
   * @returns {Object|null} 返回添加的節點對象，失敗返回 null
   */
  const addNode = (node) => {
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
      name: node.name || node.label || node.id, // 支持 label 別名
      label: node.label || node.name || node.id, // 確保 label 存在
      type: node.type || '檔案', // 預設類型
      group: node.group || 7, // group 7 代表檔案類型（可根據實際分類調整）
      color: node.color || '#9e9e9e', // 預設灰色
      size: node.size || 24, // 預設大小
      description: node.description || '', // 描述資訊
      emoji: node.emoji || '📄', // 預設檔案圖示
      ...node // 保留其他自定義屬性
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
   * @param {Array<Object>} nodeArray - 節點陣列
   * @returns {Object} 添加結果統計 { success: number, skipped: number, failed: number, lastNodeId: string|null }
   */
  const addBatchNodes = (nodeArray) => {
    if (!Array.isArray(nodeArray)) {
      console.error('❌ addBatchNodes 需要陣列參數');
      return { success: 0, skipped: 0, failed: 0, lastNodeId: null };
    }

    const stats = { success: 0, skipped: 0, failed: 0, lastNodeId: null };
    const newNodes = [];
    
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
        stats.lastNodeId = formattedNode.id; // 記錄最後一個成功添加的節點
      } catch (error) {
        console.error('❌ 添加節點失敗:', node, error);
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
   * @param {Object} link - 連線對象 { source, target, value?, label? }
   */
  const addLink = (link) => {
    if (!link.source || !link.target) {
      console.error('❌ 連線必須包含 source 和 target 屬性');
      return;
    }
    
    links.value.push(link);
    console.log('🔗 連線已添加:', `${link.source} -> ${link.target}`);
  };
  
  /**
   * 更新節點數據
   * @param {string} nodeId - 節點 ID
   * @param {Object} updates - 要更新的屬性
   */
  const updateNode = (nodeId, updates) => {
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
   * @param {string} nodeId - 節點 ID
   */
  const deleteNode = (nodeId) => {
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
  
  /**
   * 設定過濾模式
   * @param {string} mode - 'all' | 'focus' | 'part'
   */
  const setFilterMode = (mode) => {
    if (!['all', 'focus', 'part'].includes(mode)) {
      console.error('❌ 無效的過濾模式:', mode);
      return;
    }
    filterMode.value = mode;
    console.log('🔎 過濾模式已切換:', mode);
  };
  
  /**
   * 匯入檔案並創建節點
   * @param {File} file - 要匯入的檔案
   */
  const importFile = async (file, mode = 'single') => {
    try {
      console.log('📥 開始匯入檔案:', file.name, '模式:', mode);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isExcel = ext === 'xlsx' || ext === 'csv' || ext === 'xls';
      
      // Excel/CSV → 使用背景任務 API (支援 3000+ 筆)
      if (mode === 'multi' && isExcel) {
        return await importExcelAsync(file);
      }
      
      // 單一節點模式 — 本地建立節點
      const newNode = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        label: file.name,
        group: 'file',
        type: file.type || 'document',
        fileType: ext,
        color: '#3b82f6',
        size: 1.2,
        timestamp: Date.now(),
        aiStatus: 'linked',
        description: `從檔案 ${file.name} 匯入`
      };
      
      addNode(newNode);
      importedFiles.value.unshift({
        id: Date.now(),
        nodeId: newNode.id,
        name: file.name,
        ext: ext?.toUpperCase() || 'FILE',
        status: 'AI 已關聯',
        timestamp: Date.now()
      });
      selectedNode.value = newNode;
      console.log('✅ 檔案匯入成功:', file.name, '→', newNode.id);
      return newNode;
    } catch (err) {
      console.error('❌ 檔案匯入失敗:', err);
      error.value = '檔案匯入失敗: ' + err.message;
      throw err;
    }
  };

  /**
   * 非同步 Excel 匯入 — 使用背景任務 API
   * POST 檔案 → 取得 task_id → 輪詢進度 → 完成後加入節點
   * @param {File} file - Excel/CSV 檔案
   * @returns {Promise<Object>} { task_id, total }
   */
  const importExcelAsync = async (file) => {
    cancelImportPoll(); // 取消上一次的輪詢
    
    importStatus.value = 'running';
    importProgress.value = 0;
    importDetail.value = {
      total: 0, completed: 0, failed: 0, filename: file.name,
      eta_seconds: null, rows_per_sec: 0,
      batch_size: 0, total_batches: 0, completed_batches: 0,
      fast_mode: false, elapsed_seconds: null,
    };
    error.value = null;
    
    try {
      console.log('📤 上傳 Excel 到背景任務 API:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await apiPostForm('/api/graph/import/excel', formData);
      
      if (!result.task_id) {
        throw new Error('伺服器未回傳 task_id');
      }
      
      importTaskId.value = result.task_id;
      importDetail.value.total = result.total || 0;
      
      console.log(`✅ 匯入任務已啟動: task_id=${result.task_id}, total=${result.total}`);
      
      // 開始輪詢進度
      pollImportStatus(result.task_id);
      
      return result;
    } catch (err) {
      importStatus.value = 'error';
      error.value = '匯入啟動失敗: ' + err.message;
      console.error('❌ importExcelAsync 失敗:', err);
      throw err;
    }
  };

  /**
   * 輪詢匯入任務進度
   * @param {string} taskId - 任務 ID
   */
  const pollImportStatus = (taskId) => {
    cancelImportPoll();
    
    const POLL_INTERVAL = 3000; // 3 秒
    
    const poll = async () => {
      try {
        const data = await apiGet(`/api/graph/import/status/${taskId}`);
        
        importProgress.value = data.progress_pct || 0;
        importDetail.value = {
          total: data.total || 0,
          completed: data.completed || 0,
          failed: data.failed || 0,
          filename: data.filename || '',
          // v5.0 新欄位
          eta_seconds: data.eta_seconds ?? null,
          rows_per_sec: data.rows_per_sec || 0,
          batch_size: data.batch_size || 0,
          total_batches: data.total_batches || 0,
          completed_batches: data.completed_batches || 0,
          fast_mode: data.fast_mode || false,
          elapsed_seconds: data.elapsed_seconds ?? null,
        };
        
        if (data.status === 'done') {
          importStatus.value = 'done';
          cancelImportPoll();
          
          // 從 KuzuDB 重新載入圖譜（而非從 status API 讀取 3000 節點 JSON）
          const graphId = data.graph_id;
          if (graphId) {
            try {
              await fetchGraphData(graphId);
              console.log(`🎉 Excel 匯入完成: ${data.node_count || data.completed || 0} 個節點已載入圖譜`);
            } catch (fetchErr) {
              console.warn('⚠️ 刷新圖譜失敗:', fetchErr);
            }
          }
            
          // 加入匯入檔案列表
          importedFiles.value.unshift({
            id: Date.now(),
            nodeId: null,
            name: data.filename || 'Excel 匯入',
            ext: 'XLSX',
            status: `✅ ${data.node_count || data.completed || 0} 個節點`,
            timestamp: Date.now()
          });
          
          // 5 秒後自動重置進度狀態
          setTimeout(() => {
            if (importStatus.value === 'done') {
              importStatus.value = 'idle';
              importProgress.value = 0;
            }
          }, 5000);
          
        } else if (data.status === 'error') {
          importStatus.value = 'error';
          error.value = data.error || '匯入任務失敗';
          cancelImportPoll();
          
        } else {
          // 繼續輪詢
          _importPollTimer = setTimeout(poll, POLL_INTERVAL);
        }
        
      } catch (err) {
        console.error('⚠️ 輪詢進度失敗:', err);
        // 網路錯誤不中斷輪詢，繼續嘗試
        _importPollTimer = setTimeout(poll, POLL_INTERVAL * 2);
      }
    };
    
    // 立即執行第一次
    _importPollTimer = setTimeout(poll, 1000);
  };

  /**
   * 取消匯入進度輪詢
   */
  const cancelImportPoll = () => {
    if (_importPollTimer) {
      clearTimeout(_importPollTimer);
      _importPollTimer = null;
    }
  };
  
  /**
   * 批量匯入檔案（統一 API）
   * @param {Array<File>} files - 檔案陣列
   * @returns {Promise<Object>} 匯入結果
   */
  const importMultipleFiles = async (files) => {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('檔案陣列不能為空');
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      console.log(`🔄 正在上傳 ${files.length} 個檔案...`);
      
      // 建立 FormData
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const data = await apiPostForm('/api/graph/import/files', formData);
      
      // 驗證回傳數據
      if (!Array.isArray(data)) {
        throw new Error('伺服器回傳數據格式錯誤');
      }
      
      // 調用 addBatchNodes 添加節點
      const stats = addBatchNodes(data);
      
      console.log(`✅ 檔案匯入成功:`, stats);
      return stats;
      
    } catch (err) {
      error.value = err.message || '檔案匯入失敗';
      console.error('❌ 檔案上傳失敗:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * 跨圖譜功能 - 加載多個圖譜數據
   * @param {Array<string>} graphIds - 圖譜 ID 列表（例如: ['graph-tech', 'graph-learning']）
   */
  const loadCrossGraphData = async (graphIds = ['graph-tech', 'graph-learning']) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🔄 正在加載跨圖譜數據:', graphIds);
      
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 如果 graphMetadataList 為空，則初始化測試數據（僅用於首次加載）
      if (graphMetadataList.value.length === 0) {
        console.log('⚙️ 初始化圖譜元數據（使用測試數據）');
        graphMetadataList.value = crossGraphData.metadata;
        // 圖譜元數據已保存在 KuzuDB
      }
      
      // 如果 aiLinks 為空，則初始化測試 AI Links（僅用於首次加載）
      if (aiLinks.value.length === 0) {
        console.log('⚙️ 初始化 AI Links（使用測試數據）');
        aiLinks.value = crossGraphData.aiLinks;
      }
      
      // 從 crossGraphData 獲取圖譜實際數據（與工作檯共用）
      const allNodes = [];
      const allLinks = [];
      
      crossGraphData.graphs.forEach(graph => {
        if (graphIds.includes(graph.id)) {
          allNodes.push(...graph.nodes);
          allLinks.push(...graph.links);
        }
      });
      
      // 更新狀態 - 保留現有節點和連接，合併新加載的
      nodes.value = allNodes;
      links.value = allLinks;
      activeGraphIds.value = graphIds;
      isCrossGraphMode.value = true;
      lastUpdate.value = new Date();
      
      console.log('📊 跨圖譜數據已加載:', {
        graphs: graphIds,
        nodes: allNodes.length,
        links: allLinks.length,
        aiLinks: aiLinks.value.length
      });
      
      return {
        metadata: graphMetadataList.value,
        nodes: allNodes,
        links: allLinks,
        aiLinks: aiLinks.value
      };
      
    } catch (err) {
      error.value = err.message || '跨圖譜數據加載失敗';
      console.error('❌ 跨圖譜數據加載錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * 跨圖譜功能 - 退出跨圖譜模式，返回單圖譜模式
   */
  const exitCrossGraphMode = () => {
    isCrossGraphMode.value = false;
    aiLinks.value = [];
    activeGraphIds.value = [];
    graphMetadataList.value = [];
    console.log('✅ 已退出跨圖譜模式');
  };
  
  /**
   * 跨圖譜功能 - 切換圖譜顯示
   * @param {string} graphId - 圖譜 ID
   */
  const toggleGraphVisibility = (graphId) => {
    const index = activeGraphIds.value.indexOf(graphId);
    if (index > -1) {
      // 隱藏圖譜
      activeGraphIds.value.splice(index, 1);
    } else {
      // 顯示圖譜
      activeGraphIds.value.push(graphId);
    }
    
    // 重新加載數據
    if (activeGraphIds.value.length > 0) {
      loadCrossGraphData(activeGraphIds.value);
    } else {
      exitCrossGraphMode();
    }
  };
  
  /**
   * 跨圖譜功能 - 獲取節點所屬圖譜信息
   * @param {string} nodeId - 節點 ID
   * @returns {Object|null}
   */
  const getNodeGraph = (nodeId) => {
    const node = nodes.value.find(n => n.id === nodeId);
    if (!node || !node.graphId) return null;
    
    return graphMetadataList.value.find(g => g.id === node.graphId) || null;
  };
  
  /**
   * 跨圖譜功能 - 獲取 AI Link 統計
   * @returns {Object}
   */
  const getAILinkStats = () => {
    const stats = {
      total: aiLinks.value.length,
      byConfidence: {
        high: aiLinks.value.filter(l => l.confidence >= 0.8).length,
        medium: aiLinks.value.filter(l => l.confidence >= 0.5 && l.confidence < 0.8).length,
        low: aiLinks.value.filter(l => l.confidence < 0.5).length
      },
      avgConfidence: aiLinks.value.reduce((sum, l) => sum + l.confidence, 0) / (aiLinks.value.length || 1)
    };
    return stats;
  };
  
  /**
   * 從工作檯快照當前圖譜數據
   * @returns {Object} 圖譜快照數據
   */
  const snapshotWorkspaceGraph = () => {
    if (nodes.value.length === 0) {
      throw new Error('工作檯暫無圖譜數據');
    }
    
    const snapshot = {
      id: 'workspace-snapshot-' + Date.now(),
      name: '工作檯快照',
      description: `包含 ${nodes.value.length} 個節點，${links.value.length} 個連接`,
      icon: '🌐',
      color: '#3b82f6',
      nodeCount: nodes.value.length,
      linkCount: links.value.length,
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      links: JSON.parse(JSON.stringify(links.value)),
      timestamp: new Date().toISOString()
    };
    
    console.log('📸 工作檯圖譜快照已創建:', snapshot);
    return snapshot;
  };
  
  /**
   * 清除所有圖譜元數據（用於重置）
   */
  const clearGraphMetadata = () => {
    graphMetadataList.value = [];
    localStorage.removeItem('graphMetadataList');
    console.log('🗑️ 已清除所有圖譜元數據');
  };
  
  /**
   * 刪除圖譜（調用後端 API + 同步 store）
   * @param {string} graphId - 圖譜 ID
   * @param {boolean} cascade - 是否級聯刪除所有節點（預設 true）
   * @returns {Promise<boolean>} 是否成功
   */
  const deleteGraph = async (graphId, cascade = true) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🗑️ [Store] 刪除圖譜:', graphId, cascade ? '(級聯)' : '');
      
      await graphDataManager.deleteGraph(graphId, cascade);
      
      // 從本地列表移除
      graphMetadataList.value = graphMetadataList.value.filter(
        g => String(g.id) !== String(graphId)
      );
      
      // 如果刪除的是當前圖譜，切換到剩餘的第一個圖譜
      if (String(currentGraphId.value) === String(graphId)) {
        const remaining = graphMetadataList.value[0];
        if (remaining) {
          currentGraphId.value = remaining.id;
          localStorage.setItem('lastGraphId', String(remaining.id));
        } else {
          currentGraphId.value = null;
          localStorage.removeItem('lastGraphId');
        }
        // 清空當前節點/連線
        nodes.value = [];
        links.value = [];
        selectedNode.value = null;
      }
      
      console.log('✅ [Store] 圖譜刪除成功:', graphId);
      return true;
      
    } catch (err) {
      error.value = err.message || '圖譜刪除失敗';
      console.error('❌ [Store] 圖譜刪除錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 創建新圖譜（調用後端 API）
   * @param {Object} graphData - 圖譜數據 { name, description, icon, color }
   * @returns {Promise<Object>} 創建的圖譜元數據
   */
  const createGraph = async (graphData) => {
    if (!graphData.name || !graphData.name.trim()) {
      throw new Error('圖譜名稱不能為空');
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🔄 [Store] 創建新圖譜:', graphData.name);
      
      // ✨ 使用 Manager 創建（自動刷新緩存）
      const newGraph = await graphDataManager.createGraph(graphData);
      
      // 添加到本地圖譜列表
      graphMetadataList.value.push(newGraph);
      
      console.log('✅ [Store] 圖譜創建成功並已同步:', newGraph);
      
      return newGraph;
      
    } catch (err) {
      error.value = err.message || '圖譜創建失敗';
      console.error('❌ [Store] 圖譜創建錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新圖譜元數據（名稱、描述、圖示、顏色）
   * @param {string|number} graphId - 圖譜 ID
   * @param {Object} updates - { name?, description?, icon?, color? }
   * @returns {Promise<Object>} 更新後的圖譜元數據
   */
  const updateGraph = async (graphId, updates) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('🔄 [Store] 更新圖譜:', graphId, updates);
      
      const updatedGraph = await graphDataManager.updateGraph(graphId, updates);
      
      // 同步本地圖譜列表
      const idx = graphMetadataList.value.findIndex(g => String(g.id) === String(graphId));
      if (idx !== -1) {
        graphMetadataList.value[idx] = { ...graphMetadataList.value[idx], ...updatedGraph };
      }
      
      console.log('✅ [Store] 圖譜更新成功:', updatedGraph);
      return updatedGraph;
      
    } catch (err) {
      error.value = err.message || '圖譜更新失敗';
      console.error('❌ [Store] 圖譜更新錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 創建單一實體節點（調用後端 API + 同步 store）
   * @param {Object} entity - 實體 { id, name, type, description, properties }
   * @returns {Promise<Object>} 創建結果
   */
  const createEntity = async (entity) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await apiPost('/api/graph/create', {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        description: entity.description || '',
        properties: entity.properties || {},
        graph_id: String(currentGraphId.value)
      });
      if (!result.success) throw new Error(result.message || '創建實體失敗');
      addNode({ id: entity.id, name: entity.name, type: entity.type, description: entity.description || '', ...entity });
      console.log('✅ 實體已創建並同步到 store:', entity.name);
      return result;
    } catch (err) {
      error.value = err.message;
      console.error('❌ createEntity 錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 批量創建實體（調用後端 API + 同步 store）
   * @param {Array<Object>} entities - 實體陣列
   * @returns {Promise<Object>} 創建結果
   */
  const batchCreateEntities = async (entities) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await apiPost('/api/graph/batch-create', {
        entities: entities.map(e => ({ ...e, graph_id: String(currentGraphId.value) }))
      });
      addBatchNodes(entities);
      console.log('✅ 批量實體已創建並同步到 store:', entities.length, '筆');
      return result;
    } catch (err) {
      error.value = err.message;
      console.error('❌ batchCreateEntities 錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 上傳文件到指定圖譜（統一的上傳接口）
   * @param {File} file - 文件對象
   * @param {number|string} graphId - 目標圖譜 ID
   * @param {string} graphMode - 模式 ('existing' | 'new')
   * @returns {Promise<Object>} 上傳結果
   */
  const uploadFileToGraph = async (file, graphId, graphMode = 'existing') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('graph_id', graphId);
    formData.append('graph_mode', graphMode);
    try {
      const result = await apiPostForm('/api/system/upload', formData);
      if (result.success) {
        await fetchGraphData(currentGraphId.value);
        console.log('✅ 文件上傳成功並已重新同步圖譜');
      }
      return result;
    } catch (err) {
      console.error('❌ uploadFileToGraph 錯誤:', err);
      throw err;
    }
  };

  /**
   * 更新實體節點（調用後端 API + 同步 store）
   * @param {string} nodeId - 節點 ID
   * @param {Object} updates - 要更新的屬性 { name, link, description, image, ... }
   * @returns {Promise<Object>} 更新結果
   */
  const updateEntity = async (nodeId, updates) => {
    try {
      const result = await apiPut(`/api/graph/entities/${encodeURIComponent(nodeId)}`, updates);
      updateNode(nodeId, updates);
      console.log('✅ 實體已更新並同步到 store:', nodeId);
      return result;
    } catch (err) {
      console.error('❌ updateEntity 錯誤:', err);
      throw err;
    }
  };

  /**
   * 刪除實體節點（調用後端 API + 同步 store）
   * @param {string} nodeId - 節點 ID
   * @returns {Promise<Object>} 刪除結果
   */
  const deleteEntity = async (nodeId) => {
    try {
      const result = await apiDelete(`/api/graph/entities/${encodeURIComponent(nodeId)}`);
      deleteNode(nodeId);
      console.log('✅ 實體已刪除並同步 store:', nodeId);
      return result;
    } catch (err) {
      console.error('❌ deleteEntity 錯誤:', err);
      throw err;
    }
  };

  /**
   * 獲取 RAGFlow 知識庫列表（集中管理）
   * @returns {Promise<Array>} 知識庫列表
   */
  const fetchRAGFlowDatasets = async () => {
    try {
      const data = await apiGet('/api/ragflow/datasets');
      if (data && data.code === 0) {
        ragflowDatasets.value = data.data || [];
        console.log(`✅ 已加載 ${ragflowDatasets.value.length} 個 RAGFlow 知識庫`);
      }
      return ragflowDatasets.value;
    } catch (err) {
      console.warn('⚠️ 獲取 RAGFlow 資料集失敗:', err.message);
      return [];
    }
  };
  
  // ===== 返回 Store API =====
  return {
    // State
    nodes,
    nodeVersion,
    links,
    selectedNode,
    viewMode,
    loading,
    error,
    lastUpdate,
    filterMode,
    importedFiles,
    currentGraphId,
    
    // 匯入進度狀態
    importTaskId,
    importStatus,
    importProgress,
    importDetail,
    
    // 跨圖譜狀態
    graphMetadataList,
    aiLinks,
    activeGraphIds,
    isCrossGraphMode,
    ragflowDatasets,
    
    // Computed
    nodeCount,
    linkCount,
    hasSelection,
    is3DMode,
    is2DMode,
    nodesByType,
    filteredNodes,
    filteredLinks,
    
    // 跨圖譜 Computed
    allLinks,
    nodesByGraph,
    graphStats,
    
    // Actions
    fetchGraphData,
    fetchNeighbors,
    executeCypherQuery,
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
    addNode,
    addBatchNodes,
    addLink,
    updateNode,
    deleteNode,
    setFilterMode,
    importFile,
    importExcelAsync,
    cancelImportPoll,
    importMultipleFiles,
    
    // 跨圖譜 Actions
    loadCrossGraphData,
    exitCrossGraphMode,
    toggleGraphVisibility,
    getNodeGraph,
    getAILinkStats,
    snapshotWorkspaceGraph,
    clearGraphMetadata,
    createGraph,
    updateGraph,
    loadGraphMetadataList,
    
    // 統一 API Actions（同步 store）
    createEntity,
    batchCreateEntities,
    uploadFileToGraph,
    updateEntity,
    deleteEntity,
    fetchRAGFlowDatasets,
    deleteGraph
  };
});
