<template>
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-value text-neon-blue">{{ nodeCount }}</span>
      <span class="stat-label">Nodes</span>
    </div>
    <div class="stat-dot"></div>
    <div class="stat-item">
      <span class="stat-value text-neon-purple">{{ linkCount }}</span>
      <span class="stat-label">Links</span>
    </div>
    <div class="stat-dot"></div>
    <div class="stat-item">
      <span class="stat-value" :class="coverageColor">{{ coverage }}%</span>
      <span class="stat-label">Coverage</span>
    </div>
    <div v-if="selectedName" class="stat-selected">
      <div class="stat-dot-active"></div>
      <span class="stat-selected-text">{{ selectedName }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGraphStore } from '../stores/graphStore';

const graphStore = useGraphStore();

const nodeCount = computed(() => graphStore.nodeCount);
const linkCount = computed(() => graphStore.linkCount);

// 連線密度 = 實際連線 / 可能連線 (n*(n-1)/2)
const coverage = computed(() => {
  const n = nodeCount.value;
  if (n < 2) return 0;
  const maxLinks = (n * (n - 1)) / 2;
  return Math.min(100, Math.round((linkCount.value / maxLinks) * 100));
});

const coverageColor = computed(() => {
  if (coverage.value >= 70) return 'text-green-400';
  if (coverage.value >= 30) return 'text-yellow-400';
  return 'text-neon-cyan';
});

const selectedName = computed(() => {
  const sel = graphStore.selectedNode;
  if (!sel) return '';
  return sel.name || sel.id;
});
</script>

<style scoped>
.stats-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 16px;
  border-radius: 10px;
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.25);
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(229, 229, 229, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.stat-selected {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-dot-active {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  animation: pulse 2s infinite;
}

.stat-selected-text {
  font-size: 11px;
  font-weight: 500;
  color: rgba(229, 229, 229, 0.6);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
