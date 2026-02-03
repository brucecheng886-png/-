<template>
  <aside 
    class="fixed left-0 top-0 h-screen z-40 overflow-hidden"
    :style="{ width: layoutStore.isSidebarCollapsed ? '0' : '280px', transition: 'width 0.3s ease' }"
  >
    <!-- 主容器 -->
    <div 
      class="h-full w-[280px] flex flex-col backdrop-blur-md border-r transition-all duration-300 px-4 py-6"
      :class="[
        layoutStore.theme === 'dark' 
          ? 'bg-[#0a0a0a]/80 border-white/10' 
          : 'bg-white/80 border-gray-200'
      ]"
    >
      <!-- Logo 區域 -->
      <div class="text-center pb-8 border-b mb-6"
        :class="layoutStore.theme === 'dark' ? 'border-white/10' : 'border-gray-200'"
      >
        <div class="text-6xl mb-3 animate-float">🚀</div>
        <h1 class="m-0 text-4xl font-semibold text-blue-600 tracking-tight">BruV</h1>
        <p 
          class="mt-1 text-sm uppercase tracking-widest"
          :class="layoutStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
        >Enterprise AI</p>
      </div>

      <!-- 導航選單 -->
      <nav class="flex-1 overflow-y-auto">
        <!-- 知識圖譜分組 -->
        <div class="mb-6">
          <div class="flex items-center gap-2 px-3 py-2 mb-2">
            <span class="text-lg">🧠</span>
            <span 
              class="text-sm font-bold uppercase tracking-wider"
              :class="layoutStore.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'"
            >知識圖譜</span>
          </div>
          
          <router-link
            to="/nexus"
            class="nav-item"
            active-class="nav-item-active"
          >
            <span class="nav-icon">🌌</span>
            <span class="nav-label">知識中樞</span>
          </router-link>
          
          <!-- 圖譜工作台 (可展開) -->
          <div class="nav-group">
            <div 
              class="nav-item nav-item-expandable"
              :class="{ 'expanded': expandedMenus.has('graph-page') }"
              @click="toggleSubmenu('graph-page')"
            >
              <span class="nav-icon">🌐</span>
              <span class="nav-label">圖譜工作台</span>
              <span class="expand-arrow" :class="{ 'rotated': expandedMenus.has('graph-page') }">▶</span>
            </div>
            
            <!-- 子菜單 -->
            <transition name="submenu">
              <div v-show="expandedMenus.has('graph-page')" class="submenu">
                <router-link
                  to="/graph-page"
                  class="nav-item nav-subitem"
                  active-class="nav-item-active"
                >
                  <span class="nav-icon">📊</span>
                  <span class="nav-label">圖譜視圖</span>
                </router-link>
                
                <router-link
                  to="/import"
                  class="nav-item nav-subitem"
                  active-class="nav-item-active"
                >
                  <span class="nav-icon">📥</span>
                  <span class="nav-label">檔案匯入</span>
                </router-link>
              </div>
            </transition>
          </div>
          
          <router-link
            to="/cross-graph"
            class="nav-item"
            active-class="nav-item-active"
          >
            <span class="nav-icon">🔗</span>
            <span class="nav-label">跨圖譜連接</span>
          </router-link>
        </div>

        <!-- 系統分組 -->
        <div>
          <div class="flex items-center gap-2 px-3 py-2 mb-2">
            <span class="text-lg">⚙️</span>
            <span 
              class="text-sm font-bold uppercase tracking-wider"
              :class="layoutStore.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'"
            >系統</span>
          </div>
          
          <router-link
            v-for="route in systemRoutes"
            :key="route.path"
            :to="route.path"
            class="nav-item"
            active-class="nav-item-active"
          >
            <span class="nav-icon">{{ route.meta.icon }}</span>
            <span class="nav-label">{{ route.meta.title }}</span>
          </router-link>
        </div>
      </nav>

      <!-- 底部資訊 -->
      <div 
        class="pt-5 border-t mt-5"
        :class="layoutStore.theme === 'dark' ? 'border-white/10' : 'border-gray-200'"
      >
        <!-- 主題切換按鈕 -->
        <button 
          @click="handleToggleTheme"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-3"
          :class="[
            layoutStore.theme === 'dark'
              ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
              : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800'
          ]"
          :title="themeLabel"
        >
          <span class="text-xl">{{ themeIcon }}</span>
          <span class="text-base font-medium">{{ themeLabel }}</span>
        </button>
        
        <div>
          <div 
            class="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-3"
            :class="layoutStore.theme === 'dark' 
              ? 'bg-white/5 border border-white/10' 
              : 'bg-gray-100 border border-gray-200'"
          >
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span 
              class="text-sm font-medium text-green-500"
            >服務運行中</span>
          </div>
          <div 
            class="text-center text-sm mt-2"
            :class="layoutStore.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'"
          >v1.0.0</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useLayoutStore } from '../stores/layoutStore';

const router = useRouter();
const layoutStore = useLayoutStore();

// 子菜单展开状态
const expandedMenus = ref(new Set(['graph-page'])); // 默认展开图谱工作台

const toggleSubmenu = (menuKey) => {
  if (expandedMenus.value.has(menuKey)) {
    expandedMenus.value.delete(menuKey);
  } else {
    expandedMenus.value.add(menuKey);
  }
};

// 系統路由
const systemRoutes = computed(() => {
  const systemPaths = ['/monitor', '/settings'];
  return router.getRoutes().filter(r => 
    r.meta && r.meta.title && systemPaths.includes(r.path)
  );
});

// 主題相關
const themeIcon = computed(() => layoutStore.theme === 'dark' ? '☀️' : '🌙');
const themeLabel = computed(() => layoutStore.theme === 'dark' ? '淺色模式' : '深色模式');

const handleToggleTheme = () => {
  layoutStore.toggleTheme();
  ElMessage.success({
    message: `已切換至${layoutStore.theme === 'dark' ? '深色' : '淺色'}模式`,
    duration: 1500,
    showClose: false
  });
};
</script>

<style scoped>
/* 浮動動畫 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 導航項目樣式 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 4px;
  cursor: pointer;
}

/* 可展開的導航項 */
.nav-item-expandable {
  cursor: pointer;
}

.expand-arrow {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.3s ease;
  opacity: 0.6;
}

.expand-arrow.rotated {
  transform: rotate(90deg);
}

/* 子菜單容器 */
.submenu {
  margin-left: 20px;
  margin-top: 4px;
  margin-bottom: 8px;
  border-left: 2px solid rgba(59, 130, 246, 0.2);
  padding-left: 8px;
}

/* 子菜單項目 */
.nav-subitem {
  padding: 10px 14px;
  font-size: 16px;
  margin-bottom: 2px;
}

.nav-subitem .nav-icon {
  font-size: 20px;
}

/* 子菜單動畫 */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

/* 深色模式導航項目 */
html:not(.light) .nav-item {
  color: rgba(255, 255, 255, 0.85);
}

html:not(.light) .nav-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transform: translateX(4px);
}

html:not(.light) .nav-item-active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

/* 淺色模式導航項目 */
html.light .nav-item {
  color: #334155;
}

html.light .nav-item:hover {
  background: rgba(241, 245, 249, 0.9);
  color: #1e293b;
  transform: translateX(4px);
}

html.light .nav-item-active {
  background: rgba(219, 234, 254, 0.9);
  color: #2563eb;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

/* 左側指示條 */
.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #3b82f6;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.nav-item:hover::before,
.nav-item-active::before {
  transform: scaleY(1);
}

.nav-icon {
  font-size: 24px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
}

/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滾動條樣式 */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}
</style>
