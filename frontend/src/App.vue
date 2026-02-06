<template>
  <div class="app-container bg-nexus-bg">
    <!-- 漢堡選單按鈕 -->
    <button
      @click="layoutStore.toggleSidebarCollapse"
      class="hamburger-btn fixed left-4 top-4 z-[100] flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-nexus-surface/90 hover:bg-nexus-elevated border border-white/10 transition-all duration-300"
      :title="layoutStore.isSidebarCollapsed ? '展開側邊欄' : '收起側邊欄'"
    >
      <span class="hamburger-line bg-white"></span>
      <span class="hamburger-line my-1.5 bg-white"></span>
      <span class="hamburger-line bg-white"></span>
    </button>

    <!-- 側邊欄組件 -->
    <Sidebar />

    <!-- 主內容區 -->
    <main 
      class="main-content w-full transition-all duration-300"
      :style="{ marginLeft: layoutStore.isSidebarCollapsed ? '0' : '280px' }"
    >
      <!-- 頂部導航列 -->
      <header class="top-bar">
        <NexusBreadcrumb />

        <div class="top-bar-actions">
          <CollaborationBar />

          <div class="w-px h-5 bg-white/10"></div>

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

    <!-- 圖譜數據管理器調試面板 (僅開發模式) -->
    <GraphDebugPanel v-if="isDev" />
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
import NexusBreadcrumb from './components/NexusBreadcrumb.vue';
import CollaborationBar from './components/CollaborationBar.vue';
import GraphDebugPanel from './components/GraphDebugPanel.vue';

const router = useRouter();
const route = useRoute();
const layoutStore = useLayoutStore();
const graphStore = useGraphStore();

const currentRouteMeta = computed(() => route.meta || {});
const isDev = import.meta.env.DEV; // 開發模式標誌

onMounted(() => {
  layoutStore.initTheme();
});
</script>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.hamburger-btn {
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.hamburger-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
.hamburger-btn:active { transform: scale(0.95); }

.hamburger-line {
  width: 24px;
  height: 2.5px;
  border-radius: 2px;
}

.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  height: 100vh;
}

.top-bar {
  height: 56px;
  background: rgba(26, 29, 58, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: relative;
  z-index: 90;
}

.top-bar-actions { display: flex; gap: 12px; }

.ai-copilot-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none; border-radius: 10px;
  color: white; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
.ai-copilot-btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
.ai-copilot-btn.active { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3); }

.ai-icon { font-size: 18px; }
.ai-label { font-size: 13px; letter-spacing: 0.02em; }

.router-view-container { flex: 1; overflow: hidden; position: relative; width: 100%; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateX(20px); }
.fade-leave-to { opacity: 0; transform: translateX(-20px); }

@media (max-width: 768px) { .top-bar { padding: 0 16px; } }
</style>
