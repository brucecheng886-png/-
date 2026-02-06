<template>
  <nav class="nexus-breadcrumb flex items-center gap-1.5 text-sm select-none">
    <!-- 首頁 -->
    <router-link 
      to="/nexus" 
      class="breadcrumb-item flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 transition-all group"
    >
      <span class="text-base group-hover:scale-110 transition-transform">🏠</span>
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
        <span v-if="crumb.icon" class="text-base">{{ crumb.icon }}</span>
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
  '/nexus':        { label: '知識中樞', icon: '🌌', parent: null },
  '/graph-page':   { label: '圖譜工作台', icon: '🌐', parent: '/nexus' },
  '/import':       { label: '資料導入', icon: '📥', parent: '/graph-page' },
  '/file-import':  { label: '檔案上傳', icon: '📤', parent: '/graph-page' },
  '/cross-graph':  { label: '跨圖譜連接', icon: '🔗', parent: '/nexus' },
  '/graph-3d':     { label: '3D 圖譜', icon: '🧊', parent: '/graph-page' },
  '/batch-repair': { label: '批次修復', icon: '🔧', parent: '/nexus' },
  '/settings':     { label: '系統設定', icon: '⚙️', parent: null },
  '/monitor':      { label: '電腦資訊', icon: '💻', parent: null },
  '/create':       { label: '建立實體', icon: '➕', parent: '/graph-page' },
  '/graph':        { label: '2D 圖譜 (舊)', icon: '🕸️', parent: '/nexus' },
  '/timeline':     { label: '時間軸', icon: '⏳', parent: '/graph-page' },
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
  if (graphStore.nodeCount > 0) return '主腦圖譜';
  
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
