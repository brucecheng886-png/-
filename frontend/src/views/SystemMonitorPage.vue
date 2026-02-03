<script setup>
import { ref } from 'vue';
import DashboardPanel from '../components/panels/DashboardPanel.vue';

// ===== State =====
const isLoading = ref(false);
</script>

<template>
  <div class="monitor-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-accent"></div>
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">💻</span>
          電腦資訊監控
        </h1>
        <p class="page-subtitle">即時系統效能與服務狀態監控</p>
      </div>
    </div>
    
    <!-- 監控面板容器 -->
    <div class="monitor-container">
      <DashboardPanel />
    </div>
  </div>
</template>

<style scoped>
/* ===== 頁面容器 ===== */
.monitor-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--bg-void);
  padding: 32px 24px;
}

/* 自訂捲軸樣式 */
.monitor-page::-webkit-scrollbar {
  width: 8px;
}

.monitor-page::-webkit-scrollbar-track {
  background: var(--bg-surface);
  border-radius: 4px;
}

.monitor-page::-webkit-scrollbar-thumb {
  background: rgba(68, 138, 255, 0.3);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.monitor-page::-webkit-scrollbar-thumb:hover {
  background: rgba(68, 138, 255, 0.5);
}

/* ===== 頁面標題 ===== */
.page-header {
  display: flex;
  align-items: stretch;
  gap: 20px;
  margin-bottom: 32px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.header-accent {
  width: 4px;
  background: linear-gradient(180deg, var(--primary-blue), #5a9eff);
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(68, 138, 255, 0.4);
}

.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.title-icon {
  font-size: 36px;
  filter: drop-shadow(0 4px 8px rgba(68, 138, 255, 0.3));
}

.page-subtitle {
  margin: 0;
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* ===== 監控容器 ===== */
.monitor-container {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 響應式設計 ===== */
@media (max-width: 1024px) {
  .monitor-page {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .title-icon {
    font-size: 32px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .monitor-page {
    padding: 20px 12px;
  }
  
  .page-header {
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .header-accent {
    width: 3px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
}
</style>
