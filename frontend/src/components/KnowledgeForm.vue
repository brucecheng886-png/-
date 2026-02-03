<template>
  <div class="knowledge-form-container">
    <div class="form-card">
      <h2 class="form-title">🔮 創建知識實體</h2>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        label-position="left"
        class="entity-form"
      >
        <!-- 實體 ID -->
        <el-form-item label="實體 ID" prop="id">
          <el-input
            v-model="formData.id"
            placeholder="例如: ENT-0001"
            :prefix-icon="Key"
            clearable
          />
        </el-form-item>

        <!-- 實體名稱 -->
        <el-form-item label="名稱" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="請輸入實體名稱"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <!-- 實體類型 -->
        <el-form-item label="類型" prop="type">
          <el-select
            v-model="formData.type"
            placeholder="選擇實體類型"
            style="width: 100%"
          >
            <el-option label="👤 Person (人物)" value="Person" />
            <el-option label="🏢 Company (公司)" value="Company" />
            <el-option label="📦 Product (產品)" value="Product" />
            <el-option label="📅 Event (事件)" value="Event" />
            <el-option label="📍 Location (地點)" value="Location" />
            <el-option label="📄 Document (文檔)" value="Document" />
          </el-select>
        </el-form-item>

        <!-- 描述 -->
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入實體描述..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 操作按鈕 -->
        <el-form-item class="form-actions">
          <el-button
            type="primary"
            :icon="Check"
            :loading="loading"
            @click="submitForm"
            class="submit-btn"
          >
            {{ loading ? '創建中...' : '創建實體' }}
          </el-button>
          <el-button
            :icon="Refresh"
            @click="resetForm"
            :disabled="loading"
          >
            重置
          </el-button>
          <el-button
            :icon="MagicStick"
            @click="fillMockData"
            :disabled="loading"
          >
            填充範例
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 結果顯示 -->
      <div v-if="lastResult" class="result-card" :class="lastResult.success ? 'success' : 'error'">
        <div class="result-header">
          <el-icon :size="20">
            <SuccessFilled v-if="lastResult.success" />
            <CircleCloseFilled v-else />
          </el-icon>
          <span class="result-title">{{ lastResult.success ? '創建成功' : '創建失敗' }}</span>
        </div>
        <div class="result-content">
          <p>{{ lastResult.message }}</p>
          <pre v-if="lastResult.data" class="result-data">{{ JSON.stringify(lastResult.data, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- API 狀態指示器 -->
    <div class="api-status">
      <div class="status-dot" :class="apiStatus"></div>
      <span class="status-text">{{ apiStatusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Check, 
  Refresh, 
  MagicStick, 
  Key, 
  User,
  SuccessFilled,
  CircleCloseFilled 
} from '@element-plus/icons-vue';

// API 基礎 URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// 表單引用
const formRef = ref(null);
const loading = ref(false);
const lastResult = ref(null);
const apiStatus = ref('checking');
const apiStatusText = ref('檢查中...');

// 表單資料
const formData = reactive({
  id: '',
  name: '',
  type: '',
  description: ''
});

// 驗證規則
const rules = {
  id: [
    { required: true, message: '請輸入實體 ID', trigger: 'blur' },
    { min: 3, message: 'ID 長度至少 3 個字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入實體名稱', trigger: 'blur' },
    { min: 2, message: '名稱長度至少 2 個字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '請選擇實體類型', trigger: 'change' }
  ]
};

// 檢查 API 健康狀態
const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      apiStatus.value = data.services.kuzu === 'connected' ? 'connected' : 'warning';
      apiStatusText.value = data.services.kuzu === 'connected' 
        ? 'API 已連接 (KuzuDB 可用)' 
        : 'API 已連接 (KuzuDB 不可用)';
    } else {
      apiStatus.value = 'error';
      apiStatusText.value = 'API 連接失敗';
    }
  } catch (error) {
    apiStatus.value = 'error';
    apiStatusText.value = 'API 無法連接';
    console.error('API 健康檢查失敗:', error);
  }
};

// 提交表單
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    // 驗證表單
    await formRef.value.validate();
    
    loading.value = true;
    lastResult.value = null;
    
    // 發送 POST 請求
    const response = await fetch(`${API_BASE_URL}/api/graph/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: formData.id,
        name: formData.name,
        type: formData.type,
        description: formData.description || '',
        properties: {}
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      lastResult.value = result;
      ElMessage.success({
        message: result.message,
        duration: 3000
      });
      
      // 清空表單
      setTimeout(() => {
        resetForm();
      }, 1500);
    } else {
      lastResult.value = {
        success: false,
        message: result.detail || result.message || '創建失敗',
        data: null
      };
      ElMessage.error({
        message: result.detail || result.message || '創建失敗',
        duration: 5000
      });
    }
    
  } catch (error) {
    console.error('提交錯誤:', error);
    
    lastResult.value = {
      success: false,
      message: error.message || '請求失敗，請檢查後端服務',
      data: null
    };
    
    ElMessage.error({
      message: '請求失敗，請確認後端服務正在運行',
      duration: 5000
    });
  } finally {
    loading.value = false;
  }
};

// 重置表單
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.id = '';
  formData.name = '';
  formData.type = '';
  formData.description = '';
  lastResult.value = null;
};

// 填充範例資料
const fillMockData = () => {
  const mockData = {
    id: `ENT-${Math.floor(Math.random() * 9000 + 1000)}`,
    name: '測試實體_' + Date.now().toString().slice(-4),
    type: ['Person', 'Company', 'Product', 'Event'][Math.floor(Math.random() * 4)],
    description: '這是一個測試實體，用於驗證 API 連接'
  };
  
  Object.assign(formData, mockData);
  ElMessage.info('已填充範例資料');
};

// 組件掛載時檢查 API
onMounted(() => {
  checkApiHealth();
  // 每 30 秒檢查一次
  setInterval(checkApiHealth, 30000);
});
</script>

<style scoped>
.knowledge-form-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-card {
  background: rgba(30, 30, 40, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.form-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
}

.entity-form {
  margin-top: 24px;
}

.form-actions {
  margin-top: 32px;
}

.submit-btn {
  min-width: 140px;
}

/* 結果卡片 */
.result-card {
  margin-top: 24px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid;
}

.result-card.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.result-card.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.result-content p {
  margin: 0 0 8px 0;
  color: #e5e7eb;
  font-size: 14px;
}

.result-data {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #9ca3af;
  overflow-x: auto;
  margin: 8px 0 0 0;
}

/* API 狀態指示器 */
.api-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(30, 30, 40, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.connected {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.status-dot.warning {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.status-dot.error {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.status-dot.checking {
  background: #6b7280;
}

.status-text {
  font-size: 13px;
  color: #9ca3af;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Element Plus 深色主題 */
:deep(.el-form-item__label) {
  color: #e5e7eb !important;
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  background: rgba(20, 20, 30, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(59, 130, 246, 0.4) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6 !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
}

:deep(.el-textarea__inner) {
  background: rgba(20, 20, 30, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

:deep(.el-textarea__inner:hover) {
  border-color: rgba(59, 130, 246, 0.4) !important;
}

:deep(.el-textarea__inner:focus) {
  border-color: #3b82f6 !important;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 20, 30, 0.8) !important;
}

:deep(.el-form-item__error) {
  color: #ef4444 !important;
}
</style>
