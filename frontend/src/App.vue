<template>
  <div 
    class="app-container transition-colors duration-300"
    :class="layoutStore.theme === 'dark' ? 'bg-[#0a0a0a] dark' : 'bg-[#F5F7F9]'"
  >
    <!-- 漢堡選單按鈕 (固定左上角) -->
    <button
      @click="layoutStore.toggleSidebarCollapse"
      class="hamburger-btn fixed left-4 top-4 z-[100] flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300"
      :class="[
        layoutStore.theme === 'dark'
          ? 'bg-[#1a1a1a]/90 hover:bg-[#2a2a2a] border border-white/10'
          : 'bg-white/90 hover:bg-gray-50 border border-gray-200'
      ]"
      :title="layoutStore.isSidebarCollapsed ? '展開側邊欄' : '收起側邊欄'"
    >
      <span 
        class="hamburger-line transition-all duration-300"
        :class="layoutStore.theme === 'dark' ? 'bg-white' : 'bg-gray-800'"
      ></span>
      <span 
        class="hamburger-line my-1.5 transition-all duration-300"
        :class="layoutStore.theme === 'dark' ? 'bg-white' : 'bg-gray-800'"
      ></span>
      <span 
        class="hamburger-line transition-all duration-300"
        :class="layoutStore.theme === 'dark' ? 'bg-white' : 'bg-gray-800'"
      ></span>
    </button>

    <!-- 側邊欄組件 -->
    <Sidebar />

    <!-- 主內容區 (RouterView) -->
    <main 
      class="main-content w-full transition-all duration-300"
      :style="{ marginLeft: layoutStore.isSidebarCollapsed ? '0' : '280px' }"
    >
      <!-- 頂部導航列 (可選) -->
      <header class="top-bar">
        <div class="breadcrumb">
          <span class="breadcrumb-home">🏠</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ currentRouteMeta.title || '首頁' }}</span>
        </div>

        <div class="top-bar-actions">
          <!-- 呼叫 AI 助手按鈕 -->
          <button 
            class="ai-copilot-btn" 
            @click="layoutStore.toggleAssistant"
            :class="{ 'active': layoutStore.showAssistant }"
            title="呼叫 AI 助手"
          >
            <span class="ai-icon">✨</span>
            <span class="ai-label">AI 助手</span>
          </button>
        </div>
      </header>

      <!-- 路由視圖容器 -->
      <div class="router-view-container w-full">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- AI 懸浮助手 -->
    <AICopilot 
      :show="layoutStore.showAssistant" 
      @close="layoutStore.toggleAssistant"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useLayoutStore } from './stores/layoutStore';
import { useGraphStore } from './stores/graphStore';
import AICopilot from './components/AICopilot.vue';
import Sidebar from './components/Sidebar.vue';

const router = useRouter();
const route = useRoute();
const layoutStore = useLayoutStore();
const graphStore = useGraphStore();

// 當前路由的 meta 資訊
const currentRouteMeta = computed(() => route.meta || {});

// 初始化主題
onMounted(() => {
  layoutStore.initTheme();
  console.log('🎨 主題已初始化:', layoutStore.theme);
});
</script>

<style scoped>
/* ===== 全域容器 ===== */
.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background: var(--bg-void);
  overflow: hidden;
}

/* ===== 漢堡選單按鈕 ===== */
.hamburger-btn {
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.hamburger-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.hamburger-btn:active {
  transform: scale(0.95);
}

.hamburger-line {
  width: 24px;
  height: 2.5px;
  border-radius: 2px;
}

/* ===== 主內容區 ===== */
.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  height: 100vh;
}

/* 頂部導航列 */
.top-bar {
  height: 64px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  position: relative;
  z-index: 90;
}

/* 淺色模式頂部導航列 */
.app-container:not(.dark) .top-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.breadcrumb-home {
  font-size: 18px;
}

.breadcrumb-separator {
  color: var(--text-tertiary);
}

.breadcrumb-current {
  font-weight: 600;
  color: var(--text-primary);
}

/* 淺色模式麵包屑 */
.app-container:not(.dark) .breadcrumb {
  color: #64748b;
}

.app-container:not(.dark) .breadcrumb-separator {
  color: #94a3b8;
}

.app-container:not(.dark) .breadcrumb-current {
  color: #1e293b;
}

.top-bar-actions {
  position: absolute;
  right: 32px;
  display: flex;
  gap: 12px;
}

/* AI 助手按鈕 */
.ai-copilot-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-blue), #5a9eff);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(68, 138, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.ai-copilot-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.ai-copilot-btn:hover::before {
  left: 100%;
}

.ai-copilot-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(68, 138, 255, 0.4);
}

.ai-copilot-btn.active {
  background: linear-gradient(135deg, #5a9eff, var(--primary-blue));
  box-shadow: 0 0 20px rgba(68, 138, 255, 0.6),
              0 0 40px rgba(68, 138, 255, 0.3);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(68, 138, 255, 0.6),
                0 0 40px rgba(68, 138, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(68, 138, 255, 0.8),
                0 0 60px rgba(68, 138, 255, 0.5);
  }
}

.ai-icon {
  font-size: 20px;
  animation: sparkle 1.5s infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.ai-label {
  font-size: 14px;
  letter-spacing: 0.02em;
}

/* 路由視圖容器 */
.router-view-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  width: 100%;
}

/* 路由切換動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ===== 響應式設計 ===== */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .logo-text {
    font-size: 28px;
  }
  
  .nav-item {
    padding: 12px 16px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }
  
  .logo-text,
  .logo-subtitle,
  .nav-label,
  .status-text {
    display: none;
  }
  
  .logo-icon {
    font-size: 40px;
  }
  
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
  
  .top-bar {
    padding: 0 16px;
  }
}
</style>
