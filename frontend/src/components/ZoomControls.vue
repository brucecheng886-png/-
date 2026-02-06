<template>
  <div class="zoom-controls">
    <!-- 放大 -->
    <button 
      @click="$emit('zoom-in')" 
      class="zoom-btn" 
      title="放大"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 縮放比例 -->
    <div class="zoom-level" :title="`${zoomPercent}%`">
      {{ zoomPercent }}%
    </div>

    <!-- 縮小 -->
    <button 
      @click="$emit('zoom-out')" 
      class="zoom-btn" 
      title="縮小"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 分隔線 -->
    <div class="zoom-sep"></div>

    <!-- 適配全覽 -->
    <button 
      @click="$emit('zoom-fit')" 
      class="zoom-btn" 
      title="畫面適配"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 6V3a1 1 0 011-1h3M10 2h3a1 1 0 011 1v3M14 10v3a1 1 0 01-1 1h-3M6 14H3a1 1 0 01-1-1v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 重置 -->
    <button 
      @click="$emit('zoom-reset')" 
      class="zoom-btn" 
      title="重置視圖"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8a6 6 0 0110.47-4M14 2v4h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 8a6 6 0 01-10.47 4M2 14v-4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 佈局切換 -->
    <div class="zoom-sep"></div>
    <button 
      @click="$emit('toggle-layout')" 
      class="zoom-btn"
      :class="{ 'active': is3D }"
      :title="is3D ? '切回 2D' : '切到 3D'"
    >
      <span class="text-[11px] font-bold">{{ is3D ? '3D' : '2D' }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  zoomPercent: { type: Number, default: 100 },
  is3D: { type: Boolean, default: false },
});

defineEmits(['zoom-in', 'zoom-out', 'zoom-fit', 'zoom-reset', 'toggle-layout']);
</script>

<style scoped>
.zoom-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: rgba(229, 229, 229, 0.7);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e5e5;
}

.zoom-btn:active {
  transform: scale(0.9);
}

.zoom-btn.active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}

.zoom-level {
  font-size: 10px;
  font-weight: 600;
  color: rgba(229, 229, 229, 0.5);
  font-family: 'JetBrains Mono', monospace;
  padding: 2px 0;
  user-select: none;
}

.zoom-sep {
  width: 20px;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 2px 0;
}
</style>
