<template>
  <nav class="nexus-breadcrumb flex items-center gap-1.5 text-sm select-none">
    <!-- 首頁 -->
    <router-link 
      to="/nexus" 
      class="breadcrumb-item flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 transition-all group"
    >
      <span class="text-text-secondary group-hover:text-white transition-colors">Nexus</span>
    </router-link>

    <!-- 路由層級 -->
    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
      <span class="text-white/20 text-xs">›</span>
      <component
        :is="crumb.clickable ? 'router-link' : 'span'"
        :to="crumb.clickable ? crumb.path : undefined"
        class="breadcrumb-item flex items-center gap-1.5 px-2 py-1 rounded-md transition-all"
        :class="[
          index === breadcrumbs.length - 1 
            ? 'text-white font-semibold cursor-default' 
            : 'text-text-secondary hover:bg-white/5 hover:text-white cursor-pointer'
        ]"
      >
        <span>{{ crumb.label }}</span>
      </component>
    </template>

    <!-- 當前圖譜名稱標記 -->
    <template v-if="currentGraphName">
      <span class="text-white/20 text-xs">›</span>
      <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
        <span class="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse"></span>
        <span class="text-neon-blue text-xs font-semibold tracking-wide">{{ currentGraphName }}</span>
      </span>
    </template>

    <!-- 當前選中節點 -->
    <template v-if="selectedNodeName">
      <span class="text-white/20 text-xs">›</span>
      <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
        <span class="text-xs">{{ selectedNodeEmoji }}</span>
        <span class="text-neon-purple text-xs font-medium truncate max-w-[120px]">{{ selectedNodeName }}</span>
      </span>
    </template>

    <!-- 狀態標記 -->
    <div class="flex items-center gap-2 ml-3">
      <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
        <svg class="w-3 h-3 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 3a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V3zm3 1a1 1 0 000 2h4a1 1 0 100-2H6zm0 3a1 1 0 000 2h4a1 1 0 100-2H6z"/>
        </svg>
        <span class="text-emerald-400 text-[11px] font-semibold">KuzuDB</span>
      </span>
      <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
        <span class="text-[11px]">✨</span>
        <span class="text-orange-400 text-[11px] font-semibold">AI Ready</span>
      </span>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useGraphStore } from '../stores/graphStore';

const route = useRoute();
const graphStore = useGraphStore();

// 路由 → 麵包屑映射
const routeBreadcrumbMap = {
  '/nexus':        { label: '主頁', parent: null },
  '/graph-page':   { label: '圖譜工作台', parent: '/nexus' },
  '/import':       { label: '資料導入', parent: '/graph-page' },
  '/file-import':  { label: '檔案上傳', parent: '/graph-page' },
  '/cross-graph':  { label: '跨圖譜連接', parent: '/nexus' },
  '/graph-3d':     { label: '3D 圖譜', parent: '/graph-page' },
  '/batch-repair': { label: '批次修復', parent: '/nexus' },
  '/settings':     { label: '系統設定', parent: null },
  '/monitor':      { label: '電腦資訊', parent: null },
  '/create':       { label: '建立實體', parent: '/graph-page' },
  '/graph':        { label: '2D 圖譜 (舊)', parent: '/nexus' },
  '/timeline':     { label: '時間軸', parent: '/graph-page' },
};

// 構建麵包屑陣列
const breadcrumbs = computed(() => {
  const path = route.path;
  const crumbs = [];
  
  // 遞迴收集父層
  const collect = (p) => {
    const config = routeBreadcrumbMap[p];
    if (!config) return;
    if (config.parent) {
      collect(config.parent);
    }
    crumbs.push({
      path: p,
      label: config.label,
      icon: config.icon,
      clickable: p !== path // 最後一層不可點擊
    });
  };
  
  collect(path);
  return crumbs;
});

// 當前圖譜名稱
const currentGraphName = computed(() => {
  const graphPages = ['/graph-page', '/graph-3d', '/import', '/file-import', '/cross-graph'];
  if (!graphPages.includes(route.path)) return null;
  
  // 嘗試從 graphMetadataList 取得名稱
  const currentId = graphStore.currentGraphId;
  const meta = graphStore.graphMetadataList.find(g => g.id === currentId);
  if (meta?.name) return meta.name;
  
  // 若有節點數據但無圖譜名，用預設名稱
  if (graphStore.nodeCount > 0) return `圖譜 ${currentId}`;
  
  return null;
});

// 選中節點名稱
const selectedNodeName = computed(() => {
  if (!graphStore.selectedNode) return null;
  return graphStore.selectedNode.name || graphStore.selectedNode.label || null;
});

// 選中節點 Emoji
const selectedNodeEmoji = computed(() => {
  if (!graphStore.selectedNode) return '📌';
  return graphStore.selectedNode.emoji || '📌';
});
</script>

<style scoped>
.nexus-breadcrumb {
  min-height: 32px;
}

.breadcrumb-item {
  text-decoration: none;
  white-space: nowrap;
}
</style>
