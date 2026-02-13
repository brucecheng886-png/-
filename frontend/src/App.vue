<template>
  <div class="app-container bg-nexus-bg">
    <!-- 頂部導航列 (全寬) -->
    <header class="top-bar">
      <!-- 漢堡選單按鈕 -->
      <button
        @click="layoutStore.toggleSidebarCollapse"
        class="hamburger-btn flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 mr-3 flex-shrink-0"
        :title="layoutStore.isSidebarCollapsed ? '展開側邊欄' : '收起側邊欄'"
      >
        <span class="hamburger-line bg-white"></span>
        <span class="hamburger-line my-1 bg-white"></span>
        <span class="hamburger-line bg-white"></span>
      </button>

      <NexusBreadcrumb />

      <div class="top-bar-actions">
        <CollaborationBar />

        <div class="w-px h-5 bg-white/10"></div>

        <!-- 通知鈴鐺 -->
        <button class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer relative" title="通知">
          <svg class="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
        </button>

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

    <!-- 下方內容區 -->
    <div class="app-body">
      <!-- 側邊欄組件 -->
      <Sidebar />

      <!-- 主內容區 -->
      <main 
        class="main-content w-full transition-all duration-300"
        :style="{ marginLeft: layoutStore.isSidebarCollapsed ? '0' : '280px' }"
      >
        <!-- 路由視圖容器 -->
        <div class="router-view-container w-full">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

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
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.hamburger-btn {
  cursor: pointer;
}
.hamburger-btn:hover {
  transform: scale(1.05);
}
.hamburger-btn:active { transform: scale(0.95); }

.hamburger-line {
  width: 18px;
  height: 2px;
  border-radius: 2px;
}

.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  flex: 1;
}

.top-bar {
  height: 56px;
  min-height: 56px;
  background: rgba(11, 18, 34, 0.85);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: relative;
  z-index: 100;
  width: 100%;
}

.top-bar-actions { display: flex; gap: 12px; }

.ai-copilot-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 18px;
  background: var(--primary-blue);
  border: 1px solid rgba(59, 130, 246, 0.5); border-radius: 10px;
  color: #ffffff; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s ease;
}
.ai-copilot-btn:hover { background: #2563eb; }
.ai-copilot-btn.active { background: #1d4ed8; box-shadow: 0 0 12px rgba(59, 130, 246, 0.35); border-color: #60a5fa; }

.ai-icon { font-size: 18px; }
.ai-label { font-size: 13px; letter-spacing: 0.02em; }

.router-view-container { flex: 1; overflow: hidden; position: relative; width: 100%; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateX(20px); }
.fade-leave-to { opacity: 0; transform: translateX(-20px); }

@media (max-width: 768px) { .top-bar { padding: 0 16px; } }
</style>
