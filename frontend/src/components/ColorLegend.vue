<template>
  <div class="color-legend">
    <!-- 摺疊切換 -->
    <button 
      @click="isExpanded = !isExpanded"
      class="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 transition-all group"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm">🎨</span>
        <span class="text-xs font-semibold text-white uppercase tracking-wider">Node Types</span>
        <span class="px-1.5 py-0.5 text-[10px] font-bold text-neon-blue bg-neon-blue/10 rounded-full">
          {{ activeTypes.length }}
        </span>
      </div>
      <span 
        class="text-text-tertiary text-xs transition-transform duration-300" 
        :class="{ 'rotate-180': isExpanded }"
      >▼</span>
    </button>

    <!-- 圖例內容 -->
    <transition name="legend-expand">
      <div v-show="isExpanded" class="mt-2 space-y-1">
        <!-- 按分組顯示 -->
        <template v-for="group in groupedTypes" :key="group.name">
          <div v-if="group.types.length > 0" class="mb-2">
            <div class="flex items-center gap-1.5 px-2 py-1 mb-1">
              <span class="text-xs">{{ group.icon }}</span>
              <span class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">{{ group.label }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 px-1">
              <button
                v-for="t in group.types"
                :key="t.type"
                @click="$emit('filter-type', t.type)"
                class="flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all hover:scale-105"
                :style="{ 
                  borderColor: t.color + '40',
                  background: t.color + '10'
                }"
                :title="`${t.label} (${t.count} 個節點)`"
              >
                <span 
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :style="{ 
                    backgroundColor: t.color,
                    boxShadow: `0 0 6px ${t.glow}`
                  }"
                ></span>
                <span class="text-[11px] font-medium text-white/80">{{ t.label }}</span>
                <span class="text-[10px] text-text-tertiary font-mono">{{ t.count }}</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 空狀態 -->
        <div v-if="activeTypes.length === 0" class="text-center py-4 text-text-tertiary text-xs">
          尚無節點數據
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { getActiveNodeTypes, getTypeGroups } from '../utils/nodeColors';

defineEmits(['filter-type']);

const graphStore = useGraphStore();
const isExpanded = ref(false);

// 獲取當前圖譜中出現的節點類型
const activeTypes = computed(() => {
  return getActiveNodeTypes(graphStore.nodes);
});

// 按分組歸類
const groupedTypes = computed(() => {
  const groups = getTypeGroups();
  const result = [];

  Object.entries(groups)
    .sort((a, b) => a[1].order - b[1].order)
    .forEach(([name, config]) => {
      const types = activeTypes.value.filter(t => t.group === name);
      if (types.length > 0) {
        result.push({
          name,
          label: config.label,
          icon: config.icon,
          types
        });
      }
    });

  return result;
});
</script>

<style scoped>
.legend-expand-enter-active,
.legend-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.legend-expand-enter-from,
.legend-expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.legend-expand-enter-to,
.legend-expand-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
