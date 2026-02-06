<template>
  <div class="bottom-toolbar">
    <!-- Focus 模式 -->
    <button 
      class="tb-btn" 
      :class="{ 'tb-btn-active': isFocusMode }"
      @click="$emit('toggle-focus')"
      title="聚焦模式"
    >
      <span class="tb-icon">🎯</span>
      <span class="tb-label">Focus</span>
      <span v-if="isFocusMode" class="tb-badge"></span>
    </button>

    <!-- 圖層篩選 -->
    <div class="relative" ref="layerMenuRef">
      <button 
        class="tb-btn" 
        @click="showLayerMenu = !showLayerMenu"
        title="圖層切換"
      >
        <span class="tb-icon">◑</span>
        <span class="tb-label">圖層</span>
      </button>
      <transition name="pop">
        <div v-if="showLayerMenu" class="layer-menu">
          <button 
            v-for="layer in layers" 
            :key="layer.value"
            class="layer-item"
            :class="{ 'active': activeFilter === layer.value }"
            @click="$emit('set-filter', layer.value); showLayerMenu = false"
          >
            <span>{{ layer.icon }}</span>
            <span>{{ layer.label }}</span>
          </button>
        </div>
      </transition>
    </div>

    <!-- 分隔 -->
    <div class="tb-sep"></div>

    <!-- 新增節點 -->
    <button 
      class="tb-btn tb-btn-primary" 
      @click="$emit('add-node')"
      title="快速新增節點"
    >
      <span class="tb-icon">＋</span>
      <span class="tb-label">New Node</span>
    </button>

    <!-- 連線模式 -->
    <button 
      class="tb-btn" 
      :class="{ 'tb-btn-active': isLinkingMode }"
      @click="$emit('toggle-linking')"
      title="手動連線"
    >
      <span class="tb-icon">🔗</span>
      <span class="tb-label">連線</span>
    </button>

    <!-- 分隔 -->
    <div class="tb-sep"></div>

    <!-- 分享 (placeholder) -->
    <button 
      class="tb-btn" 
      @click="handleShare"
      title="分享圖譜"
    >
      <span class="tb-icon">↗</span>
      <span class="tb-label">分享</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  isFocusMode: { type: Boolean, default: false },
  isLinkingMode: { type: Boolean, default: false },
  activeFilter: { type: String, default: 'all' },
});

defineEmits(['toggle-focus', 'set-filter', 'add-node', 'toggle-linking']);

const showLayerMenu = ref(false);
const layerMenuRef = ref(null);

const layers = [
  { value: 'all',   icon: '🌐', label: '全部節點' },
  { value: 'focus', icon: '🎯', label: '焦點聚鄰' },
  { value: 'part',  icon: '📌', label: '部分顯示' },
];

const handleShare = () => {
  // 複製當前 URL
  navigator.clipboard?.writeText(window.location.href).then(() => {
    ElMessage.success('✅ 已複製圖譜連結');
  }).catch(() => {
    ElMessage.info('📋 分享功能開發中');
  });
};

// 點擊外部關閉圖層選單
const handleClickOutside = (e) => {
  if (layerMenuRef.value && !layerMenuRef.value.contains(e.target)) {
    showLayerMenu.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.bottom-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 14px;
  background: rgba(10, 14, 39, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.3);
}

.tb-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: rgba(229, 229, 229, 0.65);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.tb-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #e5e5e5;
}

.tb-btn:active {
  transform: scale(0.96);
}

.tb-btn-active {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.tb-btn-primary {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.tb-btn-primary:hover {
  background: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
}

.tb-icon {
  font-size: 14px;
  line-height: 1;
}

.tb-label {
  font-size: 12px;
  letter-spacing: 0.01em;
}

.tb-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
  animation: pulse 2s infinite;
}

.tb-sep {
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 4px;
}

/* 圖層選單 */
.layer-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(15, 18, 42, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  min-width: 140px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(229, 229, 229, 0.7);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
  white-space: nowrap;
}

.layer-item:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #e5e5e5;
}

.layer-item.active {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

/* 動畫 */
.pop-enter-active  { animation: popIn 0.2s ease-out; }
.pop-leave-active  { animation: popOut 0.15s ease-in; }

@keyframes popIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.95); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}
@keyframes popOut {
  from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  to   { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.95); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
