<template>
  <aside 
    class="fixed left-0 top-[56px] z-40 overflow-hidden"
    :style="{ width: layoutStore.isSidebarCollapsed ? '0' : '280px', height: 'calc(100vh - 56px)', transition: 'width 0.3s ease' }"
  >
    <div class="h-full w-[280px] flex flex-col border-r border-white/[0.06] px-4 py-6" style="background: rgba(11, 18, 34, 0.92); backdrop-filter: blur(24px) saturate(1.2); -webkit-backdrop-filter: blur(24px) saturate(1.2);">
      <!-- Logo 區域 -->
      <div class="flex items-center gap-3 px-2 pb-5 border-b border-white/[0.06] mb-5">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--primary-blue); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
          <svg class="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2L2 7v6l8 5 8-5V7l-8-5zM10 4.5L15 7.5v5L10 15.5 5 12.5v-5L10 4.5z"/>
          </svg>
        </div>
        <div>
          <h1 class="m-0 text-sm font-bold text-white tracking-tight leading-tight">BruV AI NEXUS</h1>
          <p class="mt-0.5 text-[10px] uppercase tracking-[0.12em]" style="color: var(--text-tertiary)">ENTERPRISE PLATFORM</p>
        </div>
      </div>

      <!-- 導航選單 -->
      <nav class="flex-1 overflow-y-auto custom-scrollbar">
        <!-- 知識圖譜分組 -->
        <div class="mb-5">
          <div class="flex items-center gap-2 px-3 py-2 mb-1">
            <span class="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Knowledge</span>
          </div>
          
          <router-link to="/nexus" class="nav-item" active-class="nav-item-active">
            <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span class="nav-label">主頁</span>
          </router-link>
          
          <div class="nav-group">
            <div class="nav-item nav-item-expandable" :class="{ 'expanded': expandedMenus.has('graph-page') }" @click="toggleSubmenu('graph-page')">
              <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span class="nav-label">圖譜工作台</span>
              <span class="expand-arrow" :class="{ 'rotated': expandedMenus.has('graph-page') }">▶</span>
            </div>
            <transition name="submenu">
              <div v-show="expandedMenus.has('graph-page')" class="submenu">
                <router-link to="/graph-page" class="nav-item nav-subitem" active-class="nav-item-active">
                  <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>
                  </svg>
                  <span class="nav-label">圖譜視圖</span>
                </router-link>
                <router-link to="/file-import" class="nav-item nav-subitem" active-class="nav-item-active">
                  <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="nav-label">檔案匯入</span>
                </router-link>
              </div>
            </transition>
          </div>
          
          <router-link to="/timeline" class="nav-item" active-class="nav-item-active">
            <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <span class="nav-label">時間軸</span>
          </router-link>

          <router-link to="/cross-graph" class="nav-item" active-class="nav-item-active">
            <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
            </svg>
            <span class="nav-label">跨圖譜連接</span>
          </router-link>
        </div>

        <!-- AI 助手分組 -->
        <div class="mb-5">
          <div class="flex items-center gap-2 px-3 py-2 mb-1">
            <span class="text-xs font-semibold text-text-tertiary uppercase tracking-wider">AI</span>
          </div>
          <router-link to="/chat" class="nav-item" active-class="nav-item-active">
            <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
            </svg>
            <span class="nav-label">AI 助手</span>
          </router-link>
        </div>

        <!-- 系統分組 -->
        <div>
          <div class="flex items-center gap-2 px-3 py-2 mb-1">
            <span class="text-xs font-semibold text-text-tertiary uppercase tracking-wider">System</span>
          </div>
          <router-link to="/settings" class="nav-item" active-class="nav-item-active">
            <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
            <span class="nav-label">系統設定</span>
          </router-link>
          <router-link to="/monitor" class="nav-item" active-class="nav-item-active">
            <svg class="nav-icon-svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"/>
            </svg>
            <span class="nav-label">電腦資訊</span>
          </router-link>
        </div>
      </nav>

      <!-- 底部資訊 -->
      <div class="pt-4 border-t border-white/[0.06] mt-4">
        <div class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-2" style="background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.12);">
          <span class="status-indicator"></span>
          <span class="text-xs font-medium" style="color: #4ade80;">System Online</span>
        </div>
        <div class="text-center text-xs mt-1" style="color: var(--text-tertiary)">v1.0.0</div>
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

// System routes are now hard-coded in template with SVG icons
</script>

<style scoped>
/* 狀態指示燈 */
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5), 0 0 12px rgba(34, 197, 94, 0.2);
  position: relative;
  flex-shrink: 0;
}
.status-indicator::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1px solid rgba(34, 197, 94, 0.3);
  animation: statusPulse 2s ease-in-out infinite;
}
@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.6); }
}

.nav-icon-svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.nav-item:hover .nav-icon-svg { opacity: 1; }
.nav-item-active .nav-icon-svg { opacity: 1; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2px;
  cursor: pointer;
}

.nav-item-expandable { cursor: pointer; }

.expand-arrow {
  margin-left: auto;
  font-size: 9px;
  transition: transform 0.2s ease;
  opacity: 0.5;
}
.expand-arrow.rotated { transform: rotate(90deg); }

.submenu {
  margin-left: 20px;
  margin-top: 2px;
  margin-bottom: 6px;
  border-left: 1px solid rgba(59, 130, 246, 0.2);
  padding-left: 10px;
}

.nav-subitem {
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 1px;
}
.nav-subitem .nav-icon { font-size: 16px; }

.submenu-enter-active, .submenu-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.submenu-enter-from, .submenu-leave-to {
  opacity: 0; max-height: 0; transform: translateY(-8px);
}
.submenu-enter-to, .submenu-leave-from {
  opacity: 1; max-height: 500px; transform: translateY(0);
}

.nav-item:hover {
  background: rgba(148, 163, 184, 0.06);
  color: var(--text-primary);
}

.nav-item-active {
  background: rgba(59, 130, 246, 0.1) !important;
  color: var(--accent-blue) !important;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0; top: 25%; bottom: 25%;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--primary-blue);
  transform: scaleY(0);
  transition: transform 0.2s ease;
}
.nav-item-active::before { transform: scaleY(1); }

.nav-icon { font-size: 18px; width: 22px; text-align: center; flex-shrink: 0; }
.nav-label { flex: 1; white-space: nowrap; }

nav::-webkit-scrollbar { width: 3px; }
nav::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.15); border-radius: 2px; }
</style>
