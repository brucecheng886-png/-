<template>
  <aside 
    class="fixed left-0 top-0 h-screen z-40 overflow-hidden"
    :style="{ width: layoutStore.isSidebarCollapsed ? '0' : '280px', transition: 'width 0.3s ease' }"
  >
    <div class="h-full w-[280px] flex flex-col border-r border-white/5 px-4 py-6 bg-nexus-bg/95 backdrop-blur-md">
      <!-- Logo 區域 -->
      <div class="text-center pb-6 border-b border-white/10 mb-5">
        <div class="text-5xl mb-3 animate-float">✦</div>
        <h1 class="m-0 text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent tracking-tight">BruV</h1>
        <p class="mt-1 text-xs text-text-tertiary uppercase tracking-[0.2em]">Nexus Platform</p>
      </div>

      <!-- 導航選單 -->
      <nav class="flex-1 overflow-y-auto custom-scrollbar">
        <!-- 知識圖譜分組 -->
        <div class="mb-5">
          <div class="flex items-center gap-2 px-3 py-2 mb-1">
            <span class="text-sm">🧠</span>
            <span class="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Knowledge</span>
          </div>
          
          <router-link to="/nexus" class="nav-item" active-class="nav-item-active">
            <span class="nav-icon">🌌</span>
            <span class="nav-label">知識中樞</span>
          </router-link>
          
          <div class="nav-group">
            <div class="nav-item nav-item-expandable" :class="{ 'expanded': expandedMenus.has('graph-page') }" @click="toggleSubmenu('graph-page')">
              <span class="nav-icon">🌐</span>
              <span class="nav-label">圖譜工作台</span>
              <span class="expand-arrow" :class="{ 'rotated': expandedMenus.has('graph-page') }">▶</span>
            </div>
            <transition name="submenu">
              <div v-show="expandedMenus.has('graph-page')" class="submenu">
                <router-link to="/graph-page" class="nav-item nav-subitem" active-class="nav-item-active">
                  <span class="nav-icon">📊</span>
                  <span class="nav-label">圖譜視圖</span>
                </router-link>
                <router-link to="/import" class="nav-item nav-subitem" active-class="nav-item-active">
                  <span class="nav-icon">📥</span>
                  <span class="nav-label">檔案匯入</span>
                </router-link>
              </div>
            </transition>
          </div>
          
          <router-link to="/timeline" class="nav-item" active-class="nav-item-active">
            <span class="nav-icon">⏳</span>
            <span class="nav-label">時間軸</span>
          </router-link>

          <router-link to="/cross-graph" class="nav-item" active-class="nav-item-active">
            <span class="nav-icon">🔗</span>
            <span class="nav-label">跨圖譜連接</span>
          </router-link>
        </div>

        <!-- 系統分組 -->
        <div>
          <div class="flex items-center gap-2 px-3 py-2 mb-1">
            <span class="text-sm">⚙️</span>
            <span class="text-xs font-semibold text-text-tertiary uppercase tracking-wider">System</span>
          </div>
          <router-link v-for="route in systemRoutes" :key="route.path" :to="route.path" class="nav-item" active-class="nav-item-active">
            <span class="nav-icon">{{ route.meta.icon }}</span>
            <span class="nav-label">{{ route.meta.title }}</span>
          </router-link>
        </div>
      </nav>

      <!-- 底部資訊 -->
      <div class="pt-4 border-t border-white/10 mt-4">
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 mb-2">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          <span class="text-xs font-medium text-green-400">System Online</span>
        </div>
        <div class="text-center text-xs text-text-tertiary mt-1">v1.0.0</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLayoutStore } from '../stores/layoutStore';

const router = useRouter();
const layoutStore = useLayoutStore();

const expandedMenus = ref(new Set(['graph-page']));

const toggleSubmenu = (menuKey) => {
  if (expandedMenus.value.has(menuKey)) {
    expandedMenus.value.delete(menuKey);
  } else {
    expandedMenus.value.add(menuKey);
  }
};

const systemRoutes = computed(() => {
  const systemPaths = ['/monitor', '/settings'];
  return router.getRoutes().filter(r => 
    r.meta && r.meta.title && systemPaths.includes(r.path)
  );
});
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-float { animation: float 3s ease-in-out infinite; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2px;
  cursor: pointer;
}

.nav-item-expandable { cursor: pointer; }

.expand-arrow {
  margin-left: auto;
  font-size: 10px;
  transition: transform 0.3s ease;
  opacity: 0.5;
}
.expand-arrow.rotated { transform: rotate(90deg); }

.submenu {
  margin-left: 20px;
  margin-top: 2px;
  margin-bottom: 6px;
  border-left: 2px solid rgba(59, 130, 246, 0.3);
  padding-left: 8px;
}

.nav-subitem {
  padding: 8px 12px;
  font-size: 14px;
  margin-bottom: 1px;
}
.nav-subitem .nav-icon { font-size: 18px; }

.submenu-enter-active, .submenu-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.submenu-enter-from, .submenu-leave-to {
  opacity: 0; max-height: 0; transform: translateY(-10px);
}
.submenu-enter-to, .submenu-leave-from {
  opacity: 1; max-height: 500px; transform: translateY(0);
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: white;
  transform: translateX(4px);
}

.nav-item-active {
  background: rgba(59, 130, 246, 0.2) !important;
  color: #60a5fa !important;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #3b82f6;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}
.nav-item:hover::before,
.nav-item-active::before { transform: scaleY(1); }

.nav-icon { font-size: 20px; width: 24px; text-align: center; flex-shrink: 0; }
.nav-label { flex: 1; white-space: nowrap; }

nav::-webkit-scrollbar { width: 4px; }
nav::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 2px; }
</style>
