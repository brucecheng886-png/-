<template>
  <div class="settings-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">⚙️</span>
        系統設定
      </h1>
      <p class="page-subtitle">管理 API Keys 和系統配置</p>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>載入配置中...</p>
    </div>

    <!-- 設定表單 -->
    <div v-else class="settings-card">
      <!-- Dify 配置區塊 -->
      <div class="config-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">🤖</span>
            Dify 配置
          </h2>
          <span class="section-badge">AI 對話服務</span>
        </div>

        <!-- Dify API URL -->
        <div class="form-group">
          <label class="form-label">
            API URL
            <span class="label-badge">唯讀</span>
          </label>
          <input
            v-model="config.dify_api_url"
            type="text"
            class="form-input readonly"
            readonly
            placeholder="http://localhost:80/v1"
          />
        </div>

        <!-- Dify API Key -->
        <div class="form-group">
          <label class="form-label">
            API Key
            <span class="label-badge required">必填</span>
          </label>
          <div class="input-with-toggle">
            <input
              v-model="config.dify_key"
              :type="showDifyKey ? 'text' : 'password'"
              class="form-input"
              placeholder="app-xxxxxxxxxxxxxxxx"
              @input="hasChanges = true"
            />
            <button 
              class="toggle-visibility-btn"
              @click="showDifyKey = !showDifyKey"
              type="button"
              :title="showDifyKey ? '隱藏' : '顯示'"
            >
              {{ showDifyKey ? '👁️' : '🙈' }}
            </button>
          </div>
          <p class="form-hint">
            從 Dify Web UI (http://localhost:80) 創建應用後獲取
          </p>
        </div>
      </div>

      <!-- 分隔線 -->
      <div class="divider"></div>

      <!-- RAGFlow 配置區塊 -->
      <div class="config-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">📚</span>
            RAGFlow 配置
          </h2>
          <span class="section-badge">知識檢索服務</span>
        </div>

        <!-- RAGFlow API URL -->
        <div class="form-group">
          <label class="form-label">
            API URL
            <span class="label-badge">唯讀</span>
          </label>
          <input
            v-model="config.ragflow_api_url"
            type="text"
            class="form-input readonly"
            readonly
            placeholder="http://localhost:81/api/v1"
          />
        </div>

        <!-- RAGFlow API Key -->
        <div class="form-group">
          <label class="form-label">
            API Key
            <span class="label-badge required">必填</span>
          </label>
          <div class="input-with-toggle">
            <input
              v-model="config.ragflow_key"
              :type="showRagflowKey ? 'text' : 'password'"
              class="form-input"
              placeholder="ragflow-xxxxxxxxxxxxxxxx"
              @input="hasChanges = true"
            />
            <button 
              class="toggle-visibility-btn"
              @click="showRagflowKey = !showRagflowKey"
              type="button"
              :title="showRagflowKey ? '隱藏' : '顯示'"
            >
              {{ showRagflowKey ? '👁️' : '🙈' }}
            </button>
          </div>
          <p class="form-hint">
            從 RAGFlow Web UI (http://localhost:81) 設定頁面獲取
          </p>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="form-actions">
        <button 
          class="btn btn-secondary"
          @click="loadConfig"
          :disabled="saving"
        >
          <span class="btn-icon">🔄</span>
          重新載入
        </button>
        <button 
          class="btn btn-primary"
          @click="saveConfig"
          :disabled="saving || !hasChanges"
        >
          <span v-if="saving" class="btn-spinner">⏳</span>
          <span v-else class="btn-icon">💾</span>
          {{ saving ? '儲存中...' : '儲存設定' }}
        </button>
      </div>

      <!-- 提示訊息 -->
      <div class="info-box">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <h4>重要提示</h4>
          <ul>
            <li>修改 API Key 後，建議重啟後端服務以確保完全生效</li>
            <li>API Keys 將儲存在 <code>.env</code> 文件中</li>
            <li>請妥善保管 API Keys，不要分享給他人</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// API 基礎路徑
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// 狀態管理
const loading = ref(true);
const saving = ref(false);
const hasChanges = ref(false);

// 表單數據
const config = ref({
  dify_key: '',
  ragflow_key: '',
  dify_api_url: '',
  ragflow_api_url: ''
});

// 密碼顯示/隱藏
const showDifyKey = ref(false);
const showRagflowKey = ref(false);

// Toast 通知
const toast = ref({
  show: false,
  type: 'success',
  message: ''
});

// 顯示 Toast
const showToast = (type, message) => {
  toast.value = { show: true, type, message };
  setTimeout(() => {
    toast.value.show = false;
  }, 5000);
};

// 載入配置
const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/system/config`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.config) {
      // 注意：後端返回的 key 是遮蔽過的（app-x*****），這裡只用於顯示
      config.value = {
        dify_key: '', // 不顯示遮蔽的 key，讓用戶重新輸入
        ragflow_key: '',
        dify_api_url: data.config.dify_api_url || '',
        ragflow_api_url: data.config.ragflow_api_url || ''
      };
      
      console.log('配置載入成功:', data);
    }
    
  } catch (error) {
    console.error('載入配置失敗:', error);
    showToast('error', `載入配置失敗: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 儲存配置
const saveConfig = async () => {
  // 驗證至少有一個 key
  if (!config.value.dify_key && !config.value.ragflow_key) {
    showToast('error', '請至少填寫一個 API Key');
    return;
  }
  
  saving.value = true;
  
  try {
    const payload = {};
    
    // 只發送有值的 key
    if (config.value.dify_key) {
      payload.dify_key = config.value.dify_key;
    }
    if (config.value.ragflow_key) {
      payload.ragflow_key = config.value.ragflow_key;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/system/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      showToast('success', '✅ 設定已更新！建議重啟後端服務以確保生效');
      hasChanges.value = false;
      
      // 清空輸入框（因為已儲存）
      config.value.dify_key = '';
      config.value.ragflow_key = '';
    } else {
      throw new Error(data.message || '更新失敗');
    }
    
  } catch (error) {
    console.error('儲存配置失敗:', error);
    showToast('error', `儲存失敗: ${error.message}`);
  } finally {
    saving.value = false;
  }
};

// 組件掛載時載入配置
onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 80px;
}

/* 頁面標題 */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.title-icon {
  font-size: 36px;
}

.page-subtitle {
  font-size: 16px;
  color: #9ca3af;
  margin: 0;
}

/* 載入狀態 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 設定卡片 */
.settings-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 配置區塊 */
.config-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.section-icon {
  font-size: 28px;
}

.section-badge {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

/* 分隔線 */
.divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent
  );
  margin: 32px 0;
}

/* 表單組 */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
  margin-bottom: 8px;
}

.label-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.label-badge.required {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* 輸入框 */
.form-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 15px;
  font-family: 'Monaco', 'Courier New', monospace;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.readonly {
  cursor: not-allowed;
  opacity: 0.7;
}

.form-input::placeholder {
  color: #6b7280;
}

/* 帶切換按鈕的輸入框 */
.input-with-toggle {
  position: relative;
}

.input-with-toggle .form-input {
  padding-right: 50px;
}

.toggle-visibility-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: rgba(59, 130, 246, 0.2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.toggle-visibility-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-50%) scale(1.05);
}

/* 表單提示 */
.form-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #9ca3af;
}

.form-hint code {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  color: #60a5fa;
}

/* 操作按鈕 */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-icon, .btn-spinner {
  font-size: 18px;
}

/* 提示訊息框 */
.info-box {
  display: flex;
  gap: 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.info-content h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #60a5fa;
}

.info-content ul {
  margin: 0;
  padding-left: 20px;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.8;
}

.info-content code {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  color: #60a5fa;
}

/* Toast 通知 */
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  max-width: 400px;
}

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.toast-message {
  color: #e5e7eb;
  font-size: 14px;
  line-height: 1.5;
}

/* Toast 動畫 */
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .settings-container {
    padding: 24px 16px;
  }

  .settings-card {
    padding: 24px;
  }

  .page-title {
    font-size: 28px;
  }

  .section-title {
    font-size: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .toast {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
}
</style>
