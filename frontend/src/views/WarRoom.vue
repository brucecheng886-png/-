<template>
  <div class="war-room">
    <!-- 頂部標題列 (窗口拖曳區) -->
    <div class="war-room-header" :class="{ 'transparent-header': isGraphFullscreen }">
      <!-- AI 頭像與名稱 (居中) -->
      <div class="header-center">
        <div class="ai-avatar-wrapper">
          <div class="ai-avatar">
            <span class="avatar-icon">🤖</span>
          </div>
          <h1 class="ai-name">BruV AI</h1>
        </div>
      </div>
      
      <!-- 面板切換器 (右側) -->
      <div class="header-right">
        <div class="panel-switcher">
          <button 
            v-for="panel in availablePanels" 
            :key="panel.mode"
            :class="['panel-btn', { active: rightPanelMode === panel.mode }]"
            @click="switchPanel(panel.mode)"
            :title="panel.description"
          >
            <span class="icon">{{ panel.icon }}</span>
            <span class="label">{{ panel.label }}</span>
          </button>
          
          <!-- 全螢幕圖譜按鈕 -->
          <button 
            :class="['panel-btn', { active: isGraphFullscreen }]"
            @click="toggleGraphFullscreen"
            title="全螢幕知識圖譜"
          >
            <span class="icon">🌐</span>
            <span class="label">圖譜</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 全螢幕圖譜模式 -->
    <div v-if="isGraphFullscreen" class="fullscreen-graph-overlay">
      <FullscreenGraphView @close="toggleGraphFullscreen" />
    </div>

    <!-- 分屏容器 -->
    <Splitpanes 
      v-else
      class="war-room-splitpanes"
      @resize="handleResize"
    >
      <!-- 左側面板：AI 對話 -->
      <Pane 
        :size="leftPaneSize" 
        :min-size="15" 
        :max-size="60"
        class="left-pane"
      >
        <div class="pane-content">
          <div class="pane-header">
            <h2 class="pane-title">💬 AI 對話</h2>
          </div>
          <div class="chat-container">
            <!-- 使用 DifyChat 組件 -->
            <DifyChat v-if="chatReady" />
            <div v-else class="loading-placeholder">
              <div class="spinner"></div>
              <p>載入對話系統中...</p>
            </div>
          </div>
        </div>
      </Pane>

      <!-- 右側面板：動態內容 -->
      <Pane 
        :size="100 - leftPaneSize" 
        class="right-pane"
      >
        <div class="pane-content">
          <div class="pane-header">
            <h2 class="pane-title">{{ currentPanelTitle() }}</h2>
            <div class="pane-actions">
              <!-- 全屏按鈕 -->
              <button class="action-btn" @click="toggleFullscreen" title="全屏">
                🔳
              </button>
            </div>
          </div>
          
          <div class="panel-container">
            <!-- 動態組件切換 -->
            <component 
              :is="currentViewComponent" 
              :data="rightPanelData"
            />
          </div>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useLayoutStore } from '../stores/layoutStore';
import DifyChat from './DifyChat.vue';
import FullscreenGraphView from '../components/FullscreenGraphView.vue';

// 動態導入面板組件
import DashboardPanel from '../components/panels/DashboardPanel.vue';
// import PdfPanel from '../components/panels/PdfPanel.vue';  // 暫時註解（Debug）
import GraphPanel from '../components/panels/GraphPanel.vue';
import TerminalPanel from '../components/panels/TerminalPanel.vue';

// PDF Panel 臨時佔位符組件
const PdfPanelPlaceholder = {
  template: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: #000000;
      color: #ff00ff;
      font-family: 'Courier New', monospace;
    ">
      <div style="font-size: 60px; margin-bottom: 20px;">📄</div>
      <h2 style="font-size: 24px; margin: 0 0 10px 0; text-shadow: 0 0 10px rgba(255, 0, 255, 0.8);">
        PDF PANEL - MAINTENANCE MODE
      </h2>
      <p style="font-size: 14px; color: rgba(255, 255, 255, 0.6); margin: 0;">
        組件正在維護中，即將恢復服務...
      </p>
      <div style="
        margin-top: 30px;
        padding: 12px 24px;
        border: 2px solid rgba(255, 0, 255, 0.5);
        background: rgba(255, 0, 255, 0.1);
        font-size: 12px;
        letter-spacing: 2px;
      ">
        COMING SOON
      </div>
    </div>
  `
};

// ===== Store =====
const layoutStore = useLayoutStore();
const { 
  rightPanelMode, 
  rightPanelData, 
  leftPaneSize,
  setRightPanel,
  goBack,
  canGoBack,
  currentPanelTitle,
  setLeftPaneSize
} = layoutStore;

// ===== State =====
const chatReady = ref(false);
const isGraphFullscreen = ref(false);

// 可用面板配置
const availablePanels = [
  { mode: 'dashboard', icon: '📊', label: '儀表板', description: '系統總覽' },
  { mode: 'pdf', icon: '📄', label: 'PDF', description: '文件預覽' },
  { mode: 'graph', icon: '🌐', label: '圖譜', description: '知識圖譜' },
  { mode: 'terminal', icon: '💻', label: '終端', description: '命令終端' }
];

// ===== Computed =====
const currentViewComponent = computed(() => {
  const components = {
    dashboard: markRaw(DashboardPanel),
    pdf: markRaw(PdfPanelPlaceholder),  // 使用佔位符（Debug）
    graph: markRaw(GraphPanel),
    terminal: markRaw(TerminalPanel)
  };
  return components[rightPanelMode.value] || components.dashboard;
});

// ===== Methods =====
const switchPanel = (mode) => {
  setRightPanel(mode);
};

const toggleGraphFullscreen = () => {
  isGraphFullscreen.value = !isGraphFullscreen.value;
};

const handleResize = (event) => {
  // event 是一個包含每個 pane 大小的陣列
  if (event && event[0]) {
    setLeftPaneSize(event[0].size);
  }
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// ===== Lifecycle =====
onMounted(() => {
  // 延遲加載對話組件以提升初始渲染性能
  setTimeout(() => {
    chatReady.value = true;
  }, 100);
  
  console.log('⚔️ 戰情室已就緒');
});
</script>

<style scoped>
/* ===== 戰情室容器 ===== */
.war-room {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

/* ===== 頂部工具列 ===== */
.war-room-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  height: 56px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-primary);
  position: relative;
  z-index: 100;
  -webkit-app-region: drag; /* 允許視窗拖曳 (Electron/Tauri) */
}

.war-room-header.transparent-header {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* AI 頭像與名稱 (居中) */
.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  -webkit-app-region: drag;
}

.ai-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-orange));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(51, 94, 234, 0.4);
  animation: avatar-glow 3s ease-in-out infinite;
}

@keyframes avatar-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(51, 94, 234, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(51, 94, 234, 0.6), 0 0 40px rgba(255, 142, 60, 0.3);
  }
}

.avatar-icon {
  font-size: 20px;
}

.ai-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em;
}

/* 右側面板切換器 */
.header-right {
  position: absolute;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag; /* 按鈕可點擊 */
}

/* ===== 面板切換器 ===== */
.panel-switcher {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--bg-elevated);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.panel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.panel-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.panel-btn.active {
  background: var(--bg-elevated);
  color: var(--primary-blue);
  border-left: 3px solid var(--primary-blue);
  font-weight: 600;
}

.panel-btn .icon {
  font-size: 16px;
}

.panel-btn .label {
  font-weight: 500;
}

/* 全螢幕圖譜覆蓋層 */
.fullscreen-graph-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bg-void);
  z-index: 999;
}

/* ===== Splitpanes 容器 ===== */
.war-room-splitpanes {
  flex: 1;
  overflow: hidden;
}

/* 覆蓋 splitpanes 默認樣式 */
:deep(.splitpanes__splitter) {
  background: var(--border-primary);
  border-left: 1px solid var(--border-subtle);
  border-right: 1px solid var(--border-subtle);
  transition: all 0.3s ease;
  position: relative;
}

:deep(.splitpanes__splitter:hover) {
  background: var(--border-focus);
  border-left-color: var(--border-focus);
  border-right-color: var(--border-focus);
}

:deep(.splitpanes__splitter:before) {
  content: '⋮';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  color: var(--text-tertiary);
  pointer-events: none;
}

/* ===== 面板樣式 ===== */
.left-pane,
.right-pane {
  height: 100%;
  overflow: hidden;
}

.pane-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-primary);
}

.pane-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.pane-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--bg-hover);
  transform: scale(1.05);
}

/* ===== 聊天容器 ===== */
.chat-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* ===== 面板容器 ===== */
.panel-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* ===== 載入佔位符 ===== */
.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-primary);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 響應式設計 ===== */
@media (max-width: 768px) {
  .war-room-header {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .panel-btn .label {
    display: none;
  }
}
</style>
