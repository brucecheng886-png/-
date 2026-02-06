<template>
  <div class="density-slider">
    <div class="ds-header">
      <span class="ds-icon">◉</span>
      <span class="ds-title">Density</span>
    </div>

    <!-- 垂直滑桿 -->
    <div class="ds-track-wrap">
      <input 
        type="range"
        :value="modelValue"
        min="0" max="100" step="1"
        class="ds-range"
        @input="$emit('update:modelValue', Number($event.target.value))"
      />
      <div class="ds-fill" :style="{ height: modelValue + '%' }"></div>
    </div>

    <span class="ds-value">{{ modelValue }}%</span>

    <!-- 快捷按鈕 -->
    <div class="ds-presets">
      <button 
        v-for="p in presets" :key="p.value"
        class="ds-preset-btn"
        :class="{ active: modelValue === p.value }"
        :title="p.label"
        @click="$emit('update:modelValue', p.value)"
      >{{ p.icon }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: 0 },
});

defineEmits(['update:modelValue']);

const presets = [
  { value: 0,  icon: '🌐', label: '全部' },
  { value: 30, icon: '◐',  label: '中等密度' },
  { value: 60, icon: '◑',  label: '高密度' },
  { value: 85, icon: '●',  label: '核心節點' },
];
</script>

<style scoped>
.density-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  border-radius: 12px;
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  width: 44px;
}

.ds-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ds-icon {
  font-size: 14px;
  color: #06b6d4;
}

.ds-title {
  font-size: 8px;
  font-weight: 700;
  color: rgba(229, 229, 229, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* 垂直滑桿容器 */
.ds-track-wrap {
  position: relative;
  width: 20px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 填充條（跟隨值） */
.ds-fill {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(to top, #06b6d4, #3b82f6);
  pointer-events: none;
  transition: height 0.15s ease;
}

/* 原生 range 旋轉為垂直 */
.ds-range {
  writing-mode: vertical-lr;
  direction: rtl;
  appearance: none;
  -webkit-appearance: none;
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  transform: rotate(180deg);
}

.ds-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  transition: transform 0.15s;
}

.ds-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.ds-value {
  font-size: 10px;
  font-weight: 700;
  color: rgba(229, 229, 229, 0.5);
  font-family: 'JetBrains Mono', monospace;
}

.ds-presets {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ds-preset-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(229, 229, 229, 0.5);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.ds-preset-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.ds-preset-btn.active {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
}
</style>
