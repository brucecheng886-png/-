<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useLayoutStore } from '../../stores/layoutStore';
import { ElMessage } from 'element-plus';

// ===== Props & Emits =====
const props = defineProps({
  data: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['open-terminal']);

// ===== Store =====
const layoutStore = useLayoutStore();

// ===== State =====
const systemMetrics = ref({
  cpu: 23,
  memory: 45
});

// CPU/RAM 歷史數據 (用於波形圖)
const cpuHistory = ref(Array(20).fill(0).map(() => Math.random() * 60 + 20));
const memHistory = ref(Array(20).fill(0).map(() => Math.random() * 50 + 30));

// Quick Access - 系統級操作 (移除知識庫相關按鈕)
const shortcuts = ref([
  { 
    id: 1, 
    icon: '💻', 
    label: '打開終端', 
    sublabel: 'TERMINAL', 
    action: 'openTerminal',
    style: 'warning'
  },
  { 
    id: 2, 
    icon: '💾', 
    label: '匯出報告', 
    sublabel: 'EXPORT', 
    action: 'exportReport',
    style: 'info'
  },
  { 
    id: 3, 
    icon: '🖥️', 
    label: '視圖設定', 
    sublabel: 'LAYOUT', 
    action: 'viewSettings',
    style: 'neutral'
  },
  {
    id: 4,
    icon: '🔄',
    label: '重啟服務',
    sublabel: 'RESTART',
    action: 'restartServices',
    style: 'danger'
  }
]);

// 服務狀態 (可點擊)
const services = ref([
  { name: 'Docker', status: 'RUNNING', online: true },
  { name: 'Dify', status: 'ONLINE', online: true },
  { name: 'RAGFlow', status: 'ONLINE', online: true }
]);

let metricsInterval = null;

// ===== Methods =====
const handleShortcut = (action) => {
  switch (action) {
    case 'openTerminal':
      layoutStore.openTerminal('', '~');
      break;
    case 'exportReport':
      ElMessage.success('💾 系統報告匯出中...');
      console.log('📊 匯出系統報告...');
      break;
    case 'viewSettings':
      ElMessage.info('🖥️ 視圖設定面板 (待實現)');
      console.log('⚙️ 打開視圖設定...');
      break;
    case 'restartServices':
      ElMessage.warning({
        message: '🔄 重啟所有服務...',
        duration: 2000
      });
      setTimeout(() => {
        ElMessage.success('✅ 服務已重啟');
      }, 2000);
      break;
  }
};

// 點擊服務狀態，觸發終端連動
const handleServiceClick = (serviceName) => {
  ElMessage({
    message: `🔌 連接到 ${serviceName} 服務...`,
    type: 'info',
    duration: 2000
  });
  
  // 發送事件給父組件 (預留未來終端連動)
  emit('open-terminal', serviceName.toLowerCase());
  
  // 同時打開終端面板
  layoutStore.openTerminal(`# 連接到 ${serviceName}`, '~');
};

// 展開視圖按鈕
const handleExpand = () => {
  ElMessage.info('⛶ 全螢幕視圖 (開發中)');
  console.log('🖥️ 展開 Dashboard 面板...');
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const updateMetrics = () => {
  // 模擬動態數據更新 (更平滑的隨機跳動)
  const cpuDelta = (Math.random() - 0.5) * 10;
  const memoryDelta = (Math.random() - 0.5) * 8;
  
  systemMetrics.value.cpu = Math.max(10, Math.min(80, systemMetrics.value.cpu + cpuDelta));
  systemMetrics.value.memory = Math.max(35, Math.min(75, systemMetrics.value.memory + memoryDelta));
  
  // 四捨五入到整數
  systemMetrics.value.cpu = Math.round(systemMetrics.value.cpu);
  systemMetrics.value.memory = Math.round(systemMetrics.value.memory);
  
  // 更新歷史數據 (移除第一個，添加最新值)
  cpuHistory.value.shift();
  cpuHistory.value.push(systemMetrics.value.cpu);
  memHistory.value.shift();
  memHistory.value.push(systemMetrics.value.memory);
};

// ===== Lifecycle =====
onMounted(() => {
  console.log('📊 Dashboard 面板已載入');
  
  // 每 3 秒更新一次系統指標
  metricsInterval = setInterval(updateMetrics, 3000);
});

onUnmounted(() => {
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }
});
</script>

<template>
  <div class="dashboard-panel">
    <!-- 系統監控佈局: 左側系統狀態 + 右側快速操作 -->
    <div class="dashboard-grid">
      
      <!-- 區塊 1: 系統狀態 (擴大版，包含歷史波形圖) -->
      <div class="panel-section system-status large">
        <div class="section-header">
          <span class="header-icon">💻</span>
          <h3 class="section-title">電腦資訊</h3>
          <button 
            class="expand-btn" 
            @click="handleExpand"
            title="展開視圖"
          >
            <span class="expand-icon">⛶</span>
          </button>
        </div>
        
        <div class="status-content">
          <!-- CPU 使用率 + 歷史波形圖 -->
          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-label">CPU USAGE</span>
              <span class="metric-value">{{ systemMetrics.cpu }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill cpu" 
                :style="{ width: systemMetrics.cpu + '%' }"
              ></div>
            </div>
            <!-- CPU 歷史波形圖 -->
            <div class="history-chart">
              <div 
                v-for="(value, index) in cpuHistory" 
                :key="'cpu-' + index"
                class="history-bar cpu"
                :style="{ height: value + '%' }"
                :title="`${Math.round(value)}%`"
              ></div>
            </div>
          </div>
          
          <!-- Memory 使用率 + 歷史波形圖 -->
          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-label">MEMORY USAGE</span>
              <span class="metric-value">{{ systemMetrics.memory }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill memory" 
                :style="{ width: systemMetrics.memory + '%' }"
              ></div>
            </div>
            <!-- Memory 歷史波形圖 -->
            <div class="history-chart">
              <div 
                v-for="(value, index) in memHistory" 
                :key="'mem-' + index"
                class="history-bar memory"
                :style="{ height: value + '%' }"
                :title="`${Math.round(value)}%`"
              ></div>
            </div>
          </div>
          
          <!-- 服務連線狀態 -->
          <div class="service-status">
            <div class="service-header">
              <span class="service-header-icon">🔌</span>
              <span class="service-header-text">SERVICES STATUS</span>
            </div>
            <button 
              v-for="service in services" 
              :key="service.name"
              class="service-item clickable"
              @click="handleServiceClick(service.name)"
              :title="`點擊連接到 ${service.name}`"
            >
              <span class="service-dot" :class="{ online: service.online }"></span>
              <span class="service-name">{{ service.name }}</span>
              <span class="service-label">{{ service.status }}</span>
              <span class="service-hover-icon">🔌</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 區塊 2: 快速操作 (系統級) -->
      <div class="panel-section quick-shortcuts">
        <div class="section-header">
          <span class="header-icon">⚡</span>
          <h3 class="section-title">QUICK ACCESS</h3>
        </div>
        
        <div class="shortcuts-grid">
          <button 
            v-for="shortcut in shortcuts" 
            :key="shortcut.id"
            class="shortcut-btn"
            :class="shortcut.style"
            @click="handleShortcut(shortcut.action)"
          >
            <div class="shortcut-icon">{{ shortcut.icon }}</div>
            <div class="shortcut-label">{{ shortcut.label }}</div>
            <div class="shortcut-sublabel">{{ shortcut.sublabel }}</div>
            <div class="shortcut-glow"></div>
          </button>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
/* ===== Dashboard 容器 (Anytype Space) ===== */
.dashboard-panel {
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);        /* 深空黑 #191919 */
  position: relative;
  padding: 24px;
}

.dashboard-panel::-webkit-scrollbar {
  width: 6px;                          /* 更細的滾動條 */
}

.dashboard-panel::-webkit-scrollbar-track {
  background: var(--bg-surface);
}

.dashboard-panel::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 0;                    /* 極簡風格 */
}

.dashboard-panel::-webkit-scrollbar-thumb:hover {
  background: #444444;
}

/* ===== Grid 佈局 (左右兩欄) ===== */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;  /* 左側 2/3，右側 1/3 */
  gap: 20px;
  position: relative;
  z-index: 2;
  height: 100%;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;  /* 小螢幕改為單欄 */
  }
}

/* ===== Panel Section (啞光面板) ===== */
.panel-section {
  background: var(--bg-surface);        /* 純色 #111111 */
  border: 1px solid var(--border-primary);
  border-radius: 16px;                  /* 更大圓角 */
  padding: 24px;
  box-shadow: var(--shadow-lg);         /* 懸浮陰影 */
  transition: all 0.2s ease;
}

.panel-section:hover {
  transform: translateY(-2px);          /* 輕微懸浮 */
  box-shadow: var(--shadow-xl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.header-icon {
  font-size: 24px;
  opacity: 0.9;
}

.section-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;                     /* SemiBold */
  letter-spacing: 0.05em;               /* 較寬字距 */
  text-transform: uppercase;            /* 全大寫 */
  color: var(--text-secondary);         /* 暗灰色 */
  margin: 0;
}

/* 展開按鈕 (極簡風格) */
.expand-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.expand-btn:hover {
  background: var(--bg-hover);
  border-color: var(--text-secondary);
  transform: scale(1.05);
}

.expand-btn:active {
  transform: scale(0.95);
}

.expand-icon {
  font-size: 16px;
  color: var(--text-secondary);
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.9); }
}

/* ===== 系統狀態區塊 ===== */
.system-status.large {
  grid-row: span 1;  /* 佔據左側全部空間 */
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 24px;  /* 增加間距 */
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.metric-value {
  font-size: 18px;  /* 加大字體 */
  font-weight: 600;
  font-family: 'Consolas', monospace;
  color: var(--accent-orange);
}

/* ===== 歷史波形圖 ===== */
.history-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 80px;  /* 增高顯示空間 */
  gap: 2px;
  padding: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  margin-top: 8px;
}

.history-bar {
  flex: 1;
  min-width: 4px;
  background: var(--primary-blue);
  border-radius: 2px 2px 0 0;
  transition: height 0.5s ease, opacity 0.3s ease;
  opacity: 0.7;
  position: relative;
}

.history-bar:hover {
  opacity: 1;
  transform: scaleX(1.2);
  z-index: 10;
}

.history-bar.cpu {
  background: linear-gradient(180deg, var(--primary-blue) 0%, rgba(68, 138, 255, 0.3) 100%);
}

.history-bar.memory {
  background: linear-gradient(180deg, var(--accent-orange) 0%, rgba(255, 139, 56, 0.3) 100%);
}

.progress-bar {
  height: 6px;                          /* 更細 */
  background: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.progress-fill {
  height: 100%;
  background: var(--primary-blue);      /* Anytype Blue */
  transition: width 0.5s ease;
}

.progress-fill.cpu {
  background: var(--primary-blue);
}

.progress-fill.memory {
  background: var(--accent-orange);
}

.service-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

.service-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  margin-bottom: 8px;
}

.service-header-icon {
  font-size: 14px;
  opacity: 0.8;
}

.service-header-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  position: relative;
}

/* 可點擊互動樣式 */
.service-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.service-item.clickable:hover {
  background: var(--bg-hover);
  border-color: var(--border-primary);
  transform: translateX(2px);
}

.service-item.clickable:active {
  transform: translateX(1px);
}

.service-hover-icon {
  opacity: 0;
  font-size: 14px;
  transition: opacity 0.2s ease;
  margin-left: auto;
  color: var(--text-tertiary);
}

.service-item.clickable:hover .service-hover-icon {
  opacity: 1;
}

.service-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger-red);
}

.service-dot.online {
  background: var(--success-green);
}

.service-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.service-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  padding: 3px 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
}

/* ===== 快速捷徑區塊 ===== */
.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.shortcut-btn {
  position: relative;
  padding: 20px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.shortcut-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.shortcut-btn:hover .shortcut-icon {
  transform: scale(1.15) rotate(5deg);  /* 增加互動感 */
}

.shortcut-icon {
  font-size: 36px;  /* 加大圖示 */
  margin-bottom: 12px;
  transition: transform 0.2s ease;
}

.shortcut-label {
  font-size: 14px;  /* 加大字體 */
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.shortcut-sublabel {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

/* 按鈕樣式變體 */
.shortcut-btn.warning:hover {
  border-color: var(--accent-orange);
}

.shortcut-btn.info:hover {
  border-color: var(--primary-blue);
}

.shortcut-btn.neutral:hover {
  border-color: var(--text-secondary);
}

.shortcut-btn.danger:hover {
  border-color: var(--danger-red);
}

.shortcut-glow {
  display: none;
}

/* ===== 響應式設計 ===== */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .system-status.large {
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
  
  .history-chart {
    height: 60px;
  }
}
</style>
