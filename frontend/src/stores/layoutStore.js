/**
 * Layout Store - 管理戰情室佈局狀態
 * 負責右側面板的動態切換與數據傳遞
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
  // ===== State =====
  
  /**
   * 主題模式
   * @type {Ref<'dark' | 'light'>}
   */
  const theme = ref(localStorage.getItem('theme') || 'dark');
  
  /**
   * 右側面板模式
   * @type {Ref<'dashboard' | 'pdf' | 'graph' | 'terminal'>}
   */
  const rightPanelMode = ref('dashboard');
  
  /**
   * 右側面板數據
   * - PDF 模式: { url: string, filename: string }
   * - Graph 模式: { graphId: string, type: '2d' | '3d' }
   * - Terminal 模式: { command: string, cwd: string }
   * - Dashboard 模式: null
   */
  const rightPanelData = ref(null);
  
  /**
   * 分屏比例（左側百分比）
   * @type {Ref<number>}
   */
  const leftPaneSize = ref(30);
  
  /**
   * 面板歷史記錄（用於返回上一個視圖）
   * @type {Ref<Array<{mode: string, data: any}>>}
   */
  const panelHistory = ref([]);
  
  /**
   * AI 懸浮助手顯示狀態
   * @type {Ref<boolean>}
   */
  const showAssistant = ref(false);
  
  /**
   * 側邊欄收合狀態
   * @type {Ref<boolean>}
   */
  const isSidebarCollapsed = ref(true);
  
  // ===== Actions =====
  
  /**
   * 設置右側面板
   * @param {string} mode - 面板模式
   * @param {any} data - 面板數據
   * @param {boolean} addToHistory - 是否加入歷史記錄
   */
  const setRightPanel = (mode, data = null, addToHistory = true) => {
    // 保存當前狀態到歷史
    if (addToHistory && rightPanelMode.value !== mode) {
      panelHistory.value.push({
        mode: rightPanelMode.value,
        data: rightPanelData.value
      });
      
      // 限制歷史記錄數量
      if (panelHistory.value.length > 10) {
        panelHistory.value.shift();
      }
    }
    
    rightPanelMode.value = mode;
    rightPanelData.value = data;
    
    console.log(`🎯 切換右側面板: ${mode}`, data);
  };
  
  /**
   * 返回上一個面板
   */
  const goBack = () => {
    if (panelHistory.value.length > 0) {
      const previous = panelHistory.value.pop();
      rightPanelMode.value = previous.mode;
      rightPanelData.value = previous.data;
      console.log(`↩️ 返回上一個面板: ${previous.mode}`);
    }
  };
  
  /**
   * 打開 PDF 預覽
   * @param {string} url - PDF URL
   * @param {string} filename - 檔案名稱
   */
  const openPDF = (url, filename = 'document.pdf') => {
    setRightPanel('pdf', { url, filename });
  };
  
  /**
   * 打開知識圖譜
   * @param {string} graphId - 圖譜 ID
   * @param {'2d' | '3d'} type - 圖譜類型
   */
  const openGraph = (graphId = 'default', type = '3d') => {
    setRightPanel('graph', { graphId, type });
  };
  
  /**
   * 打開終端面板
   * @param {string} command - 預設命令
   * @param {string} cwd - 工作目錄
   */
  const openTerminal = (command = '', cwd = '') => {
    setRightPanel('terminal', { command, cwd });
  };
  
  /**
   * 返回 Dashboard
   */
  const showDashboard = () => {
    setRightPanel('dashboard', null);
  };
  
  /**
   * 設置左側面板寬度
   * @param {number} size - 百分比 (0-100)
   */
  const setLeftPaneSize = (size) => {
    leftPaneSize.value = Math.max(10, Math.min(90, size));
  };
  
  /**
   * 清空歷史記錄
   */
  const clearHistory = () => {
    panelHistory.value = [];
  };
  
  /**
   * 切換主題 - 已鎖定為 Nexus 深色模式
   */
  const toggleTheme = () => {
    // 固定深色模式，不再切換
    theme.value = 'dark';
    localStorage.setItem('theme', 'dark');
    const htmlElement = document.documentElement;
    htmlElement.classList.add('dark');
    htmlElement.classList.remove('light');
    console.log('🎨 主題已鎖定為 Nexus 深色模式');
  };
  
  /**
   * 初始化主題 - 固定為 Nexus 深色模式
   */
  const initTheme = () => {
    const htmlElement = document.documentElement;
    // 確保 dark class 始終存在（Tailwind dark: 前綴需要）
    htmlElement.classList.add('dark');
    htmlElement.classList.remove('light');
    theme.value = 'dark';
  };
  
  /**
   * 切換 AI 懸浮助手顯示狀態
   */
  const toggleAssistant = () => {
    showAssistant.value = !showAssistant.value;
    console.log(`🤖 AI 助手: ${showAssistant.value ? '開啟' : '關閉'}`);
  };
  
  /**
   * 切換側邊欄收合狀態
   */
  const toggleSidebarCollapse = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    console.log(`📋 側邊欄: ${isSidebarCollapsed.value ? '收起' : '展開'}`);
  };
  
  // ===== Getters =====
  
  /**
   * 是否可以返回上一個面板
   */
  const canGoBack = () => panelHistory.value.length > 0;
  
  /**
   * 獲取當前面板標題
   */
  const currentPanelTitle = () => {
    const titles = {
      dashboard: '📊 儀表板',
      pdf: '📄 文件預覽',
      graph: '🌐 知識圖譜',
      terminal: '💻 終端面板'
    };
    return titles[rightPanelMode.value] || '未知面板';
  };
  
  return {
    // State
    theme,
    rightPanelMode,
    rightPanelData,
    leftPaneSize,
    panelHistory,
    showAssistant,
    isSidebarCollapsed,
    
    // Actions
    setRightPanel,
    goBack,
    openPDF,
    openGraph,
    openTerminal,
    showDashboard,
    setLeftPaneSize,
    clearHistory,
    toggleTheme,
    initTheme,
    toggleAssistant,
    toggleSidebarCollapse,
    
    // Getters
    canGoBack,
    currentPanelTitle
  };
});
