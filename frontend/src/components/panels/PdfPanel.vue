<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

// ===== Props =====
const props = defineProps({
  data: {
    type: Object,
    default: () => ({ url: '', filename: 'document.pdf' })
  }
});

// ===== State =====
const pdfUrl = ref(props.data?.url || '');
const fileName = ref(props.data?.filename || 'document.pdf');

// ===== Computed =====
const displayFileName = computed(() => {
  return fileName.value || 'document.pdf';
});

// ===== Watch =====
watch(() => props.data, (newData) => {
  if (newData) {
    pdfUrl.value = newData.url || '';
    fileName.value = newData.filename || 'document.pdf';
  }
}, { deep: true });

// ===== Methods =====
const downloadPDF = () => {
  if (!pdfUrl.value) {
    ElMessage.warning('沒有可下載的 PDF');
    return;
  }
  
  const link = document.createElement('a');
  link.href = pdfUrl.value;
  link.download = fileName.value;
  link.click();
  
  ElMessage.success('開始下載 PDF');
};

const openInNewTab = () => {
  if (!pdfUrl.value) {
    ElMessage.warning('沒有可開啟的 PDF');
    return;
  }
  
  window.open(pdfUrl.value, '_blank');
};

const selectPDF = () => {
  ElMessage.info('請從左側對話中選擇 PDF 文件');
};
</script>

<template>
  <div class="pdf-viewer-panel">
    <!-- Cyberpunk 工具列 -->
    <div class="pdf-toolbar">
      <div class="toolbar-left">
        <span class="file-icon">📄</span>
        <div class="file-info">
          <span class="file-name">{{ displayFileName }}</span>
          <span class="file-status">READY</span>
        </div>
      </div>
      <div class="toolbar-right">
        <button class="cyber-btn download" @click="downloadPDF" title="下載">
          <span class="btn-icon">⬇️</span>
          <span class="btn-label">DOWNLOAD</span>
          <span class="btn-glow"></span>
        </button>
        <button class="cyber-btn open" @click="openInNewTab" title="新分頁開啟">
          <span class="btn-icon">🔗</span>
          <span class="btn-label">OPEN</span>
          <span class="btn-glow"></span>
        </button>
      </div>
    </div>
    
    <!-- PDF 預覽區域 -->
    <div class="pdf-viewer">
      <!-- 有 PDF 時顯示 iframe -->
      <iframe 
        v-if="pdfUrl" 
        :src="pdfUrl" 
        class="pdf-iframe"
        title="PDF Viewer"
      />
      
      <!-- 無 PDF 時顯示 Cyberpunk 空狀態 -->
      <div v-else class="empty-state">
        <div class="empty-icon-container">
          <div class="icon-glow"></div>
          <div class="empty-icon">📄</div>
        </div>
        <div class="empty-text-group">
          <p class="empty-title">NO DOCUMENT LOADED</p>
          <p class="empty-subtitle">請從左側對話中選擇 PDF 文件進行預覽</p>
        </div>
        <button class="cyber-upload-btn" @click="selectPDF">
          <span class="upload-icon">📤</span>
          <span class="upload-text">SELECT FILE</span>
          <div class="btn-scan-line"></div>
        </button>
        
        <!-- 裝飾性網格 -->
        <div class="empty-grid"></div>
      </div>
    </div>
    
    <!-- Cyberpunk 邊框效果 -->
    <div class="cyber-corners">
      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>
    </div>
  </div>
</template>

<style scoped>
.pdf-viewer-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000000;
  position: relative;
  overflow: hidden;
}

/* ===== Cyberpunk 工具列 ===== */
.pdf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.95);
  border-bottom: 2px solid rgba(255, 0, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
  z-index: 10;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 24px;
  filter: drop-shadow(0 0 10px rgba(255, 0, 255, 0.8));
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.file-status {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #00ff00;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

/* Cyberpunk 按鈕 */
.cyber-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(0, 255, 255, 0.5);
  color: #00ffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.cyber-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.cyber-btn:hover::before {
  left: 100%;
}

.cyber-btn:hover {
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  transform: translateY(-2px);
}

.cyber-btn.download {
  border-color: rgba(255, 0, 255, 0.5);
  color: #ff00ff;
}

.cyber-btn.download:hover {
  border-color: #ff00ff;
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.6);
}

.btn-icon {
  font-size: 16px;
}

.btn-label {
  font-size: 11px;
}

/* ===== PDF 查看器 ===== */
.pdf-viewer {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #000000;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #1a1a1a;
}

/* ===== Cyberpunk 空狀態 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  z-index: 1;
}

.empty-icon-container {
  position: relative;
  margin-bottom: 30px;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 0, 255, 0.3) 0%, transparent 70%);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}

.empty-icon {
  font-size: 80px;
  opacity: 0.7;
  filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.8));
  position: relative;
  z-index: 2;
}

.empty-text-group {
  text-align: center;
  margin-bottom: 30px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ff00ff;
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.8);
  margin: 0 0 12px 0;
}

.empty-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Cyberpunk 上傳按鈕 */
.cyber-upload-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid rgba(255, 0, 255, 0.6);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
}

.cyber-upload-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 0, 255, 0.4) 50%, 
    transparent 100%
  );
  transition: left 0.6s ease;
}

.cyber-upload-btn:hover::before {
  left: 100%;
}

.cyber-upload-btn:hover {
  border-color: #ff00ff;
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
  transform: translateY(-3px) scale(1.05);
}

.upload-icon {
  font-size: 20px;
  filter: drop-shadow(0 0 5px rgba(255, 0, 255, 0.8));
}

.btn-scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ff00ff, transparent);
  animation: scan-btn 2s linear infinite;
}

@keyframes scan-btn {
  0% { transform: translateY(0); }
  100% { transform: translateY(60px); }
}

/* 空狀態網格 */
.empty-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255, 0, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 255, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.3;
  z-index: 0;
}

/* ===== Cyberpunk 邊框角落 ===== */
.cyber-corners {
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  z-index: 20;
}

.corner::before,
.corner::after {
  content: '';
  position: absolute;
  background: linear-gradient(135deg, #ff00ff, #00ffff);
}

.corner.top-left {
  top: 0;
  left: 0;
}

.corner.top-left::before {
  top: 0;
  left: 0;
  width: 3px;
  height: 30px;
}

.corner.top-left::after {
  top: 0;
  left: 0;
  width: 30px;
  height: 3px;
}

.corner.top-right {
  top: 0;
  right: 0;
}

.corner.top-right::before {
  top: 0;
  right: 0;
  width: 3px;
  height: 30px;
}

.corner.top-right::after {
  top: 0;
  right: 0;
  width: 30px;
  height: 3px;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
}

.corner.bottom-left::before {
  bottom: 0;
  left: 0;
  width: 3px;
  height: 30px;
}

.corner.bottom-left::after {
  bottom: 0;
  left: 0;
  width: 30px;
  height: 3px;
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
}

.corner.bottom-right::before {
  bottom: 0;
  right: 0;
  width: 3px;
  height: 30px;
}

.corner.bottom-right::after {
  bottom: 0;
  right: 0;
  width: 30px;
  height: 3px;
}
</style>
