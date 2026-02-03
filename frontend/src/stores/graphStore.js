import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import crossGraphData from '../data/crossGraphTestData.js';

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
   * 跨圖譜功能 - 圖譜元數據列表
   * @type {import('vue').Ref<Array<Object>>}
   */
  const graphMetadataList = ref(JSON.parse(localStorage.getItem('graphMetadataList') || '[]'));
  
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
   * 已匯入的檔案列表
   * @type {import('vue').Ref<Array<Object>>}
   */
  const importedFiles = ref([]);
  
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
   * 獲取圖譜數據 (目前使用 Mock Data)
   * 未來可替換為實際 API 調用
   * @param {number} graphId - 圖譜 ID (1: 主腦圖譜, 2: 開發筆記, 3: 私人日記)
   */
  const fetchGraphData = async (graphId = 1) => {
    loading.value = true;
    error.value = null;
    
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`🔄 正在載入圖譜 ID: ${graphId}`);
      
      // ===== Mock Data 字典 (根據 graphId 載入不同數據集) =====
      const mockDataSets = {
        // ID 1: 主腦圖譜 (50+ 節點 - 龐大複雜的第二大腦)
        1: {
          name: '主腦圖譜',
          nodes: [
            // === AI 群組 (藍色系) ===
            { id: 'ai-1', name: 'GPT-4', type: '概念', group: 1, color: '#448aff', size: 32, description: 'OpenAI 旗艦大模型' },
            { id: 'ai-2', name: 'Claude 3.5', type: '概念', group: 1, color: '#448aff', size: 30, description: 'Anthropic 對話模型' },
            { id: 'ai-3', name: 'LangChain', type: '工具', group: 1, color: '#5a9eff', size: 28, description: 'LLM 應用開發框架' },
            { id: 'ai-4', name: 'RAG 架構', type: '概念', group: 1, color: '#448aff', size: 30, description: '檢索增強生成' },
            { id: 'ai-5', name: 'Vector DB', type: '工具', group: 1, color: '#5a9eff', size: 26, description: 'FAISS/Milvus 向量數據庫' },
            { id: 'ai-6', name: 'Prompt 工程', type: '概念', group: 1, color: '#448aff', size: 24, description: '提示詞設計技巧' },
            { id: 'ai-7', name: 'Fine-tuning', type: '概念', group: 1, color: '#448aff', size: 22, description: '模型微調' },
            { id: 'ai-8', name: 'Agent 系統', type: '概念', group: 1, color: '#448aff', size: 28, description: 'AutoGPT/BabyAGI' },
            { id: 'ai-9', name: '多模態', type: '概念', group: 1, color: '#448aff', size: 26, description: '圖文音視頻理解' },
            { id: 'ai-10', name: 'Embedding', type: '概念', group: 1, color: '#448aff', size: 24, description: '文本向量化' },
            
            // === Coding 群組 (綠色系) ===
            { id: 'code-1', name: 'Vue 3', type: '工具', group: 2, color: '#4caf50', size: 30, description: '前端框架 Composition API' },
            { id: 'code-2', name: 'React', type: '工具', group: 2, color: '#4caf50', size: 28, description: 'Facebook 前端庫' },
            { id: 'code-3', name: 'Python', type: '工具', group: 2, color: '#4caf50', size: 32, description: '後端開發語言' },
            { id: 'code-4', name: 'FastAPI', type: '工具', group: 2, color: '#4caf50', size: 28, description: '現代化 Web 框架' },
            { id: 'code-5', name: 'TypeScript', type: '工具', group: 2, color: '#4caf50', size: 26, description: 'JS 超集語言' },
            { id: 'code-6', name: 'Docker', type: '工具', group: 2, color: '#4caf50', size: 30, description: '容器化技術' },
            { id: 'code-7', name: 'Git', type: '工具', group: 2, color: '#4caf50', size: 28, description: '版本控制' },
            { id: 'code-8', name: 'PostgreSQL', type: '工具', group: 2, color: '#4caf50', size: 26, description: '關係型數據庫' },
            { id: 'code-9', name: 'Redis', type: '工具', group: 2, color: '#4caf50', size: 24, description: '緩存數據庫' },
            { id: 'code-10', name: 'Nginx', type: '工具', group: 2, color: '#4caf50', size: 22, description: '反向代理' },
            
            // === Life 群組 (橘色系) ===
            { id: 'life-1', name: '晨間儀式', type: '習慣', group: 3, color: '#ff8b38', size: 26, description: '冥想+運動+規劃' },
            { id: 'life-2', name: '番茄工作法', type: '方法', group: 3, color: '#ff8b38', size: 24, description: '25分鐘專注時段' },
            { id: 'life-3', name: 'GTD', type: '方法', group: 3, color: '#ff8b38', size: 26, description: 'Getting Things Done' },
            { id: 'life-4', name: '閱讀清單', type: '文件', group: 3, color: '#ff8b38', size: 22, description: '待讀書籍列表' },
            { id: 'life-5', name: '健身計劃', type: '任務', group: 3, color: '#ff8b38', size: 20, description: '每週3次訓練' },
            { id: 'life-6', name: '學習筆記', type: '文件', group: 3, color: '#ff8b38', size: 24, description: 'Obsidian 知識庫' },
            { id: 'life-7', name: '旅行規劃', type: '任務', group: 3, color: '#ff8b38', size: 18, description: '2026 旅遊目標' },
            { id: 'life-8', name: '財務管理', type: '文件', group: 3, color: '#ff8b38', size: 22, description: '收支記錄' },
            
            // === Projects 群組 (紫色系) ===
            { id: 'proj-1', name: 'BruV Platform', type: '任務', group: 4, color: '#ab47bc', size: 35, description: '企業級 AI 平台' },
            { id: 'proj-2', name: 'Dify 整合', type: '任務', group: 4, color: '#ab47bc', size: 28, description: 'LLMOps 集成' },
            { id: 'proj-3', name: 'RAGFlow 整合', type: '任務', group: 4, color: '#ab47bc', size: 28, description: 'RAG 引擎集成' },
            { id: 'proj-4', name: '知識圖譜', type: '任務', group: 4, color: '#ab47bc', size: 30, description: '3D 視覺化' },
            { id: 'proj-5', name: 'Anytype 風格', type: '任務', group: 4, color: '#ab47bc', size: 26, description: 'UI/UX 重構' },
            { id: 'proj-6', name: 'AI Copilot', type: '任務', group: 4, color: '#ab47bc', size: 28, description: '懸浮助手' },
            
            // === Knowledge 群組 (青色系) ===
            { id: 'know-1', name: '認知科學', type: '概念', group: 5, color: '#00bcd4', size: 28, description: '大腦運作原理' },
            { id: 'know-2', name: '系統思維', type: '概念', group: 5, color: '#00bcd4', size: 26, description: '整體性思考' },
            { id: 'know-3', name: '設計模式', type: '概念', group: 5, color: '#00bcd4', size: 24, description: '軟件工程模式' },
            { id: 'know-4', name: '微服務', type: '概念', group: 5, color: '#00bcd4', size: 26, description: '架構設計' },
            { id: 'know-5', name: 'DDD', type: '概念', group: 5, color: '#00bcd4', size: 24, description: '領域驅動設計' },
            { id: 'know-6', name: 'SOLID', type: '概念', group: 5, color: '#00bcd4', size: 22, description: '面向對象原則' },
            
            // === People 群組 (粉色系) ===
            { id: 'ppl-1', name: 'Bruce', type: '人物', group: 6, color: '#e91e63', size: 36, description: '專案負責人' },
            { id: 'ppl-2', name: 'GitHub Copilot', type: '人物', group: 6, color: '#e91e63', size: 30, description: 'AI 編程助手' },
            { id: 'ppl-3', name: 'Claude', type: '人物', group: 6, color: '#e91e63', size: 28, description: 'AI 對話助手' },
            { id: 'ppl-4', name: '開源社群', type: '人物', group: 6, color: '#e91e63', size: 24, description: 'Contributors' },
            
            // === Tags 群組 (灰色系) ===
            { id: 'tag-1', name: '#AI', type: '標籤', group: 7, color: '#9e9e9e', size: 14, description: '人工智能' },
            { id: 'tag-2', name: '#Frontend', type: '標籤', group: 7, color: '#9e9e9e', size: 14, description: '前端開發' },
            { id: 'tag-3', name: '#Backend', type: '標籤', group: 7, color: '#9e9e9e', size: 14, description: '後端開發' },
            { id: 'tag-4', name: '#DevOps', type: '標籤', group: 7, color: '#9e9e9e', size: 14, description: '運維' },
            { id: 'tag-5', name: '#Learning', type: '標籤', group: 7, color: '#9e9e9e', size: 14, description: '學習' },
            { id: 'tag-6', name: '#Life', type: '標籤', group: 7, color: '#9e9e9e', size: 14, description: '生活' }
          ],
          links: [
            // AI 群組內部連結
            { source: 'ai-1', target: 'ai-4', value: 5, label: '支持' },
            { source: 'ai-2', target: 'ai-4', value: 5, label: '支持' },
            { source: 'ai-3', target: 'ai-4', value: 4, label: '實現' },
            { source: 'ai-4', target: 'ai-5', value: 4, label: '依賴' },
            { source: 'ai-4', target: 'ai-10', value: 4, label: '使用' },
            { source: 'ai-6', target: 'ai-1', value: 3, label: '優化' },
            { source: 'ai-6', target: 'ai-2', value: 3, label: '優化' },
            { source: 'ai-7', target: 'ai-1', value: 3, label: '改進' },
            { source: 'ai-8', target: 'ai-3', value: 4, label: '基於' },
            { source: 'ai-9', target: 'ai-1', value: 3, label: '擴展' },
            
            // Coding 群組內部連結
            { source: 'code-1', target: 'code-5', value: 4, label: '配合' },
            { source: 'code-2', target: 'code-5', value: 4, label: '配合' },
            { source: 'code-3', target: 'code-4', value: 5, label: '語言' },
            { source: 'code-4', target: 'code-8', value: 4, label: '連接' },
            { source: 'code-6', target: 'code-4', value: 4, label: '容器化' },
            { source: 'code-6', target: 'code-10', value: 3, label: '部署' },
            { source: 'code-7', target: 'code-6', value: 3, label: 'CI/CD' },
            { source: 'code-8', target: 'code-9', value: 3, label: '配合' },
            
            // Life 群組內部連結
            { source: 'life-1', target: 'life-2', value: 3, label: '包含' },
            { source: 'life-3', target: 'life-2', value: 3, label: '方法' },
            { source: 'life-4', target: 'life-6', value: 4, label: '記錄於' },
            { source: 'life-5', target: 'life-1', value: 2, label: '納入' },
            
            // Projects 群組內部連結
            { source: 'proj-1', target: 'proj-2', value: 5, label: '包含' },
            { source: 'proj-1', target: 'proj-3', value: 5, label: '包含' },
            { source: 'proj-1', target: 'proj-4', value: 5, label: '包含' },
            { source: 'proj-1', target: 'proj-5', value: 4, label: '包含' },
            { source: 'proj-1', target: 'proj-6', value: 4, label: '包含' },
            { source: 'proj-2', target: 'ai-4', value: 4, label: '應用' },
            { source: 'proj-3', target: 'ai-4', value: 4, label: '應用' },
            { source: 'proj-4', target: 'code-1', value: 4, label: '使用' },
            { source: 'proj-5', target: 'code-1', value: 5, label: '重構' },
            { source: 'proj-6', target: 'ai-1', value: 4, label: '集成' },
            
            // Knowledge 群組內部連結
            { source: 'know-3', target: 'know-5', value: 3, label: '相關' },
            { source: 'know-4', target: 'know-5', value: 4, label: '應用' },
            { source: 'know-5', target: 'know-6', value: 3, label: '原則' },
            
            // 跨群組連結 (AI <-> Coding)
            { source: 'ai-1', target: 'code-3', value: 4, label: 'API 調用' },
            { source: 'ai-3', target: 'code-3', value: 5, label: '框架' },
            { source: 'ai-5', target: 'code-8', value: 3, label: '存儲' },
            
            // 跨群組連結 (Projects <-> Coding)
            { source: 'proj-1', target: 'code-1', value: 5, label: '前端' },
            { source: 'proj-1', target: 'code-4', value: 5, label: '後端' },
            { source: 'proj-1', target: 'code-6', value: 4, label: '部署' },
            
            // 跨群組連結 (People <-> Projects)
            { source: 'ppl-1', target: 'proj-1', value: 5, label: '負責' },
            { source: 'ppl-2', target: 'proj-1', value: 4, label: '協助' },
            { source: 'ppl-3', target: 'proj-6', value: 5, label: '核心' },
            
            // 跨群組連結 (Life <-> Knowledge)
            { source: 'life-6', target: 'know-1', value: 3, label: '學習' },
            { source: 'life-6', target: 'know-2', value: 3, label: '學習' },
            
            // Tags 連結
            { source: 'tag-1', target: 'ai-1', value: 1, label: '標記' },
            { source: 'tag-1', target: 'ai-4', value: 1, label: '標記' },
            { source: 'tag-2', target: 'code-1', value: 1, label: '標記' },
            { source: 'tag-3', target: 'code-4', value: 1, label: '標記' },
            { source: 'tag-4', target: 'code-6', value: 1, label: '標記' },
            { source: 'tag-5', target: 'life-6', value: 1, label: '標記' },
            { source: 'tag-6', target: 'life-1', value: 1, label: '標記' }
          ]
        },
        
        // ID 2: BruV 開發筆記 (20 節點 - 專注於技術棧)
        2: {
          name: 'BruV 開發筆記',
          nodes: [
            // Vue 生態
            { id: 'vue-1', name: 'Vue 3 核心', type: '工具', group: 1, color: '#42b883', size: 30, description: 'Composition API' },
            { id: 'vue-2', name: 'Pinia', type: '工具', group: 1, color: '#42b883', size: 24, description: '狀態管理' },
            { id: 'vue-3', name: 'Vue Router', type: '工具', group: 1, color: '#42b883', size: 22, description: '路由管理' },
            { id: 'vue-4', name: 'Vite', type: '工具', group: 1, color: '#42b883', size: 26, description: '構建工具' },
            
            // Python 生態
            { id: 'py-1', name: 'FastAPI', type: '工具', group: 2, color: '#009688', size: 28, description: 'Web 框架' },
            { id: 'py-2', name: 'Pydantic', type: '工具', group: 2, color: '#009688', size: 22, description: '數據驗證' },
            { id: 'py-3', name: 'SQLAlchemy', type: '工具', group: 2, color: '#009688', size: 24, description: 'ORM' },
            { id: 'py-4', name: 'Uvicorn', type: '工具', group: 2, color: '#009688', size: 20, description: 'ASGI 服務器' },
            
            // Docker 生態
            { id: 'dk-1', name: 'Docker', type: '工具', group: 3, color: '#2496ed', size: 30, description: '容器技術' },
            { id: 'dk-2', name: 'Docker Compose', type: '工具', group: 3, color: '#2496ed', size: 26, description: '多容器編排' },
            { id: 'dk-3', name: 'Dockerfile', type: '文件', group: 3, color: '#2496ed', size: 20, description: '鏡像定義' },
            { id: 'dk-4', name: 'Nginx', type: '工具', group: 3, color: '#2496ed', size: 24, description: '反向代理' },
            
            // AI 服務
            { id: 'ai-1', name: 'Dify', type: '工具', group: 4, color: '#ff6b6b', size: 28, description: 'LLMOps 平台' },
            { id: 'ai-2', name: 'RAGFlow', type: '工具', group: 4, color: '#ff6b6b', size: 28, description: 'RAG 引擎' },
            { id: 'ai-3', name: 'OpenAI API', type: '工具', group: 4, color: '#ff6b6b', size: 26, description: 'GPT 接口' },
            
            // 數據庫
            { id: 'db-1', name: 'PostgreSQL', type: '工具', group: 5, color: '#336791', size: 26, description: '關係型數據庫' },
            { id: 'db-2', name: 'Redis', type: '工具', group: 5, color: '#dc382d', size: 24, description: '緩存數據庫' },
            { id: 'db-3', name: 'Kùzu', type: '工具', group: 5, color: '#336791', size: 22, description: '圖數據庫' },
            
            // 其他
            { id: 'misc-1', name: 'Git', type: '工具', group: 6, color: '#f05032', size: 24, description: '版本控制' },
            { id: 'misc-2', name: 'VS Code', type: '工具', group: 6, color: '#007acc', size: 22, description: '開發工具' }
          ],
          links: [
            // Vue 生態內部
            { source: 'vue-1', target: 'vue-2', value: 4, label: '使用' },
            { source: 'vue-1', target: 'vue-3', value: 4, label: '使用' },
            { source: 'vue-4', target: 'vue-1', value: 5, label: '構建' },
            
            // Python 生態內部
            { source: 'py-1', target: 'py-2', value: 5, label: '依賴' },
            { source: 'py-1', target: 'py-3', value: 4, label: '集成' },
            { source: 'py-4', target: 'py-1', value: 5, label: '運行' },
            
            // Docker 生態內部
            { source: 'dk-2', target: 'dk-1', value: 5, label: '基於' },
            { source: 'dk-3', target: 'dk-1', value: 4, label: '定義' },
            { source: 'dk-4', target: 'dk-1', value: 3, label: '容器化' },
            
            // AI 服務內部
            { source: 'ai-1', target: 'ai-3', value: 4, label: '調用' },
            { source: 'ai-2', target: 'ai-3', value: 4, label: '調用' },
            
            // 跨群組連結
            { source: 'vue-1', target: 'py-1', value: 5, label: '前後端' },
            { source: 'dk-1', target: 'vue-4', value: 4, label: '部署' },
            { source: 'dk-1', target: 'py-1', value: 4, label: '部署' },
            { source: 'dk-2', target: 'ai-1', value: 5, label: '編排' },
            { source: 'dk-2', target: 'ai-2', value: 5, label: '編排' },
            { source: 'py-3', target: 'db-1', value: 5, label: '連接' },
            { source: 'py-1', target: 'db-2', value: 3, label: '緩存' },
            { source: 'misc-1', target: 'vue-1', value: 3, label: '管理' },
            { source: 'misc-1', target: 'py-1', value: 3, label: '管理' },
            { source: 'misc-2', target: 'vue-1', value: 4, label: '開發' },
            { source: 'misc-2', target: 'py-1', value: 4, label: '開發' }
          ]
        },
        
        // ID 3: 私人日記 (10 節點 - 線性/小型數據集)
        3: {
          name: '私人日記',
          nodes: [
            { id: 'diary-1', name: '2026-01-01 新年目標', type: '文件', group: 1, color: '#e91e63', size: 24, description: '年度規劃與願景' },
            { id: 'diary-2', name: '2026-01-15 專案啟動', type: '事件', group: 1, color: '#e91e63', size: 22, description: 'BruV 平台開發開始' },
            { id: 'diary-3', name: '2026-01-20 技術選型', type: '文件', group: 1, color: '#e91e63', size: 20, description: 'Vue3 + FastAPI 決策' },
            { id: 'diary-4', name: '2026-01-25 首次部署', type: '事件', group: 1, color: '#e91e63', size: 22, description: 'Docker 環境搭建完成' },
            { id: 'diary-5', name: '2026-02-01 UI 重構', type: '事件', group: 1, color: '#e91e63', size: 24, description: 'Anytype 風格改造' },
            { id: 'diary-6', name: '2026-02-02 圖譜功能', type: '事件', group: 1, color: '#e91e63', size: 26, description: '3D 知識圖譜上線' },
            { id: 'diary-7', name: '學習筆記', type: '文件', group: 1, color: '#9c27b0', size: 20, description: 'AI 技術學習記錄' },
            { id: 'diary-8', name: '健身記錄', type: '文件', group: 1, color: '#ff9800', size: 18, description: '運動打卡日誌' },
            { id: 'diary-9', name: '閱讀清單', type: '文件', group: 1, color: '#03a9f4', size: 18, description: '書籍與文章收藏' },
            { id: 'diary-10', name: '靈感筆記', type: '文件', group: 1, color: '#4caf50', size: 20, description: '創意想法記錄' }
          ],
          links: [
            // 時間線性連結
            { source: 'diary-1', target: 'diary-2', value: 3, label: '之後' },
            { source: 'diary-2', target: 'diary-3', value: 3, label: '之後' },
            { source: 'diary-3', target: 'diary-4', value: 3, label: '之後' },
            { source: 'diary-4', target: 'diary-5', value: 3, label: '之後' },
            { source: 'diary-5', target: 'diary-6', value: 3, label: '之後' },
            
            // 相關連結
            { source: 'diary-7', target: 'diary-2', value: 2, label: '相關' },
            { source: 'diary-7', target: 'diary-3', value: 2, label: '相關' },
            { source: 'diary-10', target: 'diary-6', value: 2, label: '靈感來源' },
            { source: 'diary-1', target: 'diary-8', value: 1, label: '包含' },
            { source: 'diary-1', target: 'diary-9', value: 1, label: '包含' }
          ]
        }
      };
      
      // 根據 graphId 獲取對應的數據集
      const dataSet = mockDataSets[graphId];
      
      if (!dataSet) {
        throw new Error(`圖譜 ID ${graphId} 不存在`);
      }
      
      const mockNodes = dataSet.nodes;
      const mockLinks = dataSet.links;
      
      // 更新狀態
      nodes.value = mockNodes;
      links.value = mockLinks;
      lastUpdate.value = new Date();
      
      // 自動註冊圖譜到元數據列表（用於跨圖譜功能）
      const graphIconMap = {
        'main': '🌐',
        'tech': '🧠',
        'knowledge': '📚',
        'diary': '📔',
        'private': '🔒'
      };
      
      const graphDescriptionMap = {
        'main': '當前工作檯的主圖譜',
        'tech': 'AI 與開發技術知識體系',
        'knowledge': '知識庫與文檔系統',
        'diary': '個人日記與生活記錄',
        'private': '私人日記與回憶'
      };
      
      const graphMetadata = {
        id: graphId,
        name: dataSet.name || '主圖譜',
        description: graphDescriptionMap[graphId] || dataSet.description || '當前工作檯的圖譜',
        icon: graphIconMap[graphId] || '🌐',
        color: '#3b82f6',
        nodeCount: mockNodes.length,
        linkCount: mockLinks.length,
        lastUpdate: new Date().toISOString()
      };
      
      // 檢查是否已存在
      const existingIndex = graphMetadataList.value.findIndex(g => g.id === graphId);
      if (existingIndex >= 0) {
        graphMetadataList.value[existingIndex] = graphMetadata;
        console.log('📝 更新圖譜元數據:', graphMetadata.name);
      } else {
        graphMetadataList.value.push(graphMetadata);
        console.log('➕ 註冊新圖譜:', graphMetadata.name);
      }
      
      // 持久化保存到 localStorage
      localStorage.setItem('graphMetadataList', JSON.stringify(graphMetadataList.value));
      console.log('💾 圖譜元數據已保存到 localStorage');
      
      console.log(`📊 圖譜數據已加載: ${dataSet.name}`, {
        graphId: graphId,
        nodes: mockNodes.length,
        links: mockLinks.length,
        timestamp: lastUpdate.value
      });
      
      return { nodes: mockNodes, links: mockLinks };
      
    } catch (err) {
      error.value = err.message || '數據加載失敗';
      console.error('❌ 圖譜數據加載錯誤:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * 初始化所有可用圖譜的元數據（不載入實際數據）
   */
  const initializeGraphMetadata = () => {
    // 定義所有可用的圖譜（對應 fetchGraphData 中的 mockDataSets）
    const allGraphs = [
      {
        id: 1,
        name: '主腦圖譜',
        description: '當前工作檯的主圖譜',
        icon: '🌐',
        color: '#3b82f6',
        nodeCount: 50,
        linkCount: 83
      },
      {
        id: 2,
        name: 'BruV 開發筆記',
        description: 'AI 與開發技術知識體系',
        icon: '🧠',
        color: '#4caf50',
        nodeCount: 20,
        linkCount: 25
      },
      {
        id: 'knowledge',
        name: '圖際共享知識庫',
        description: '知識庫與文檔系統',
        icon: '📚',
        color: '#00bcd4',
        nodeCount: 30,
        linkCount: 40
      },
      {
        id: 'diary',
        name: '私人日記',
        description: '個人日記與生活記錄',
        icon: '📔',
        color: '#e91e63',
        nodeCount: 10,
        linkCount: 12
      }
    ];
    
    // 只註冊尚未存在的圖譜
    allGraphs.forEach(graph => {
      const exists = graphMetadataList.value.some(g => g.id === graph.id);
      if (!exists) {
        graphMetadataList.value.push({
          ...graph,
          lastUpdate: new Date().toISOString()
        });
        console.log('📋 註冊圖譜元數據:', graph.name);
      }
    });
    
    // 持久化保存
    localStorage.setItem('graphMetadataList', JSON.stringify(graphMetadataList.value));
    console.log('💾 所有圖譜元數據已初始化:', graphMetadataList.value.length, '個圖譜');
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

    nodeArray.forEach(node => {
      try {
        if (!node.id) {
          console.warn('⚠️ 跳過無 id 的節點:', node);
          stats.failed++;
          return;
        }

        const exists = nodes.value.some(n => n.id === node.id);
        if (exists) {
          console.warn('⚠️ 節點已存在，跳過:', node.id);
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
    
    // 同步更新選中節點
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = nodes.value[nodeIndex];
    }
    
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
  const importFile = async (file) => {
    try {
      console.log('📥 開始匯入檔案:', file.name);
      
      // 創建 FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // TODO: 實際調用後端 API
      // const response = await fetch('/api/graph/import/file', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      
      // 模擬 API 回應
      const newNode = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        label: file.name,
        group: 'file',
        type: file.type || 'document',
        fileType: file.name.split('.').pop()?.toLowerCase(),
        color: '#3b82f6',
        size: 1.2,
        timestamp: Date.now(),
        aiStatus: 'linked',
        description: `從檔案 ${file.name} 匯入`
      };
      
      // 添加節點到圖譜
      addNode(newNode);
      
      // 添加到匯入檔案列表
      importedFiles.value.unshift({
        id: Date.now(),
        nodeId: newNode.id,
        name: file.name,
        ext: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        status: 'AI 已關聯',
        timestamp: Date.now()
      });
      
      // 自動選中新節點
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
        // 持久化保存
        localStorage.setItem('graphMetadataList', JSON.stringify(graphMetadataList.value));
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
  
  // ===== 返回 Store API =====
  return {
    // State
    nodes,
    links,
    selectedNode,
    viewMode,
    loading,
    error,
    lastUpdate,
    filterMode,
    importedFiles,
    
    // 跨圖譜狀態
    graphMetadataList,
    aiLinks,
    activeGraphIds,
    isCrossGraphMode,
    
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
    initializeGraphMetadata,
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
    
    // 跨圖譜 Actions
    loadCrossGraphData,
    exitCrossGraphMode,
    toggleGraphVisibility,
    getNodeGraph,
    getAILinkStats,
    snapshotWorkspaceGraph,
    clearGraphMetadata
  };
});
