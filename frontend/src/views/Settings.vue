<template>
  <div class="settings-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon"><svg class="w-6 h-6 inline-block align-middle" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg></span>
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
          <div class="section-actions">
            <span class="section-badge">AI 對話服務</span>
            <a href="http://localhost:82" target="_blank" class="manage-link">
              <span class="link-icon">🔗</span>
              管理介面
            </a>
          </div>
        </div>

        <!-- Dify API URL -->
        <div class="form-group">
          <label class="form-label">
            API URL
            <span class="label-badge">可編輯</span>
          </label>
          <input
            v-model="config.dify_api_url"
            type="text"
            class="form-input"
            placeholder="http://localhost:5001/v1"
            @input="hasChanges = true"
          />
          <p class="form-hint">
            Dify 服務的 API 端點（例如：http://localhost:5001/v1）
          </p>
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
              type="button" 
              class="toggle-password-btn"
              @click="showDifyKey = !showDifyKey"
              :title="showDifyKey ? '隱藏' : '顯示'"
            >
              <svg v-if="showDifyKey" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
            </button>
          </div>
          <p class="form-hint">
            從 Dify Web UI (http://localhost:82) 創建應用後獲取
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
          <div class="section-actions">
            <span class="section-badge">知識檢索服務</span>
            <a href="http://localhost:81" target="_blank" class="manage-link">
              <span class="link-icon">🔗</span>
              管理介面
            </a>
          </div>
        </div>

        <!-- RAGFlow API URL -->
        <div class="form-group">
          <label class="form-label">
            API URL
            <span class="label-badge">可編輯</span>
          </label>
          <input
            v-model="config.ragflow_api_url"
            type="text"
            class="form-input"
            placeholder="http://localhost:9380/api/v1"
            @input="hasChanges = true"
          />
          <p class="form-hint">
            RAGFlow 服務的 API 端點（例如：http://localhost:9380/api/v1）
          </p>
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
              type="button" 
              class="toggle-password-btn"
              @click="showRagflowKey = !showRagflowKey"
              :title="showRagflowKey ? '隱藏' : '顯示'"
            >
              <svg v-if="showRagflowKey" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
            </button>
          </div>
          <p class="form-hint">
            從 RAGFlow Web UI (http://localhost:81) 設定頁 → API Token 獲取
          </p>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="form-actions">
        <button 
          class="btn btn-test"
          @click="testConnection"
          :disabled="testing"
        >
          <span v-if="testing" class="btn-spinner">⏳</span>
          <span v-else class="btn-icon">🔍</span>
          {{ testing ? '測試中...' : '測試連接' }}
        </button>
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

      <!-- 連接測試結果 -->
      <div v-if="testResult" class="test-result-box">
        <h4>連接測試結果</h4>
        
        <!-- Dify 測試結果 -->
        <div class="service-test-result">
          <div class="service-header">
            <span class="service-icon">🤖</span>
            <span class="service-name">Dify</span>
            <span 
              class="status-badge" 
              :class="testResult.dify.status"
            >
              {{ testResult.dify.status === 'ok' ? '✅ 正常' : testResult.dify.status === 'warning' ? '⚠ 警告' : '❌ 錯誤' }}
            </span>
          </div>
          <div class="service-details">
            <p><strong>URL:</strong> {{ testResult.dify.url }}</p>
            <p><strong>狀態:</strong> {{ testResult.dify.message }}</p>
            <p><strong>API Key:</strong> {{ testResult.dify.api_key_configured ? '已配置' : '未配置' }}</p>
          </div>
        </div>

        <!-- RAGFlow 測試結果 -->
        <div class="service-test-result">
          <div class="service-header">
            <span class="service-icon">📚</span>
            <span class="service-name">RAGFlow</span>
            <span 
              class="status-badge" 
              :class="testResult.ragflow.status"
            >
              {{ testResult.ragflow.status === 'ok' ? '✅ 正常' : testResult.ragflow.status === 'warning' ? '⚠ 警告' : '❌ 錯誤' }}
            </span>
          </div>
          <div class="service-details">
            <p><strong>URL:</strong> {{ testResult.ragflow.url }}</p>
            <p><strong>狀態:</strong> {{ testResult.ragflow.message }}</p>
            <p><strong>API Key:</strong> {{ testResult.ragflow.api_key_configured ? '已配置' : '未配置' }}</p>
          </div>
        </div>
      </div>

      <!-- 提示訊息 -->
      <div class="info-box">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <h4>重要提示</h4>
          <ul>
            <li>所有配置將保存在 <code>C:/BruV_Data/config.json</code> 文件中</li>
            <li>修改配置後將立即生效，無需重啟後端服務</li>
            <li>配置優先級：config.json > 環境變數 > 默認值</li>
            <li>請妥善保管 API Keys，不要分享給他人</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ==================== 使用者管理區塊 ==================== -->
    <div class="settings-card" style="margin-top: 24px;">
      <div class="config-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">👥</span>
            使用者管理
          </h2>
          <button class="btn btn-primary" style="flex:0;white-space:nowrap;padding:10px 20px;" @click="openUserDialog()">
            <span class="btn-icon">➕</span>
            新增使用者
          </button>
        </div>
        <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">每位使用者可設定獨立的密碼與 Dify API Key，登入後自動使用其專屬 Key 對話。</p>

        <!-- 使用者列表 -->
        <div v-if="users.length === 0" style="text-align:center;padding:32px;color:#6b7280;">
          <p>尚無使用者，請點擊「新增使用者」</p>
        </div>
        <div v-else class="user-table-container">
          <table class="user-table">
            <thead>
              <tr>
                <th>使用者</th>
                <th>角色</th>
                <th>Dify Key</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.user">
                <td>
                  <span class="user-name">{{ u.user }}</span>
                </td>
                <td>
                  <span class="role-badge" :class="u.role">{{ u.role }}</span>
                </td>
                <td>
                  <span v-if="u.has_dify_key" class="key-badge has-key">{{ u.dify_key_preview }}</span>
                  <span v-else class="key-badge no-key">未設定（用全域）</span>
                </td>
                <td style="color:#9ca3af;font-size:13px;">{{ formatDate(u.created_at) }}</td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="action-btn edit" @click="openUserDialog(u)" title="編輯">✏️</button>
                    <button class="action-btn delete" @click="deleteUser(u.user)" :disabled="u.user === 'admin'" title="刪除">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== 新增/編輯使用者 Dialog ==================== -->
    <transition name="modal">
      <div v-if="userDialog.show" class="modal-overlay" @click.self="userDialog.show = false">
        <div class="modal-card">
          <h3 class="modal-title">{{ userDialog.isEdit ? '編輯使用者' : '新增使用者' }}</h3>
          
          <div class="form-group">
            <label class="form-label">使用者名稱</label>
            <input
              v-model="userDialog.username"
              type="text"
              class="form-input"
              placeholder="例：alice"
              :disabled="userDialog.isEdit"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              密碼
              <span v-if="userDialog.isEdit" class="label-badge">留空不修改</span>
              <span v-else class="label-badge required">必填</span>
            </label>
            <input
              v-model="userDialog.password"
              type="password"
              class="form-input"
              :placeholder="userDialog.isEdit ? '留空則不修改密碼' : '至少 4 碼'"
            />
          </div>

          <div class="form-group">
            <label class="form-label">角色</label>
            <select v-model="userDialog.role" class="form-input">
              <option value="admin">admin（管理員）</option>
              <option value="user">user（一般使用者）</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              Dify API Key
              <span class="label-badge">選填</span>
            </label>
            <input
              v-model="userDialog.dify_api_key"
              type="text"
              class="form-input"
              placeholder="app-xxxxxxxx（空白則用全域 Key）"
            />
            <p class="form-hint">留空時使用系統全域 Dify Key，填入後此使用者將用自己的 Key 與 AI 對話。</p>
          </div>

          <div class="form-actions" style="border-top:none;margin-top:16px;padding-top:0;">
            <button class="btn btn-secondary" @click="userDialog.show = false">取消</button>
            <button class="btn btn-primary" @click="saveUser" :disabled="userSaving">
              {{ userSaving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

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
import { apiGet, apiPost, authFetch } from '../services/apiClient';

// 狀態管理
const loading = ref(true);
const saving = ref(false);
const testing = ref(false);
const hasChanges = ref(false);

// 顯示/隱藏密碼狀態
const showDifyKey = ref(false);
const showRagflowKey = ref(false);

// 表單數據
const config = ref({
  dify_key: '',
  ragflow_key: '',
  dify_api_url: '',
  ragflow_api_url: ''
});

// 測試結果
const testResult = ref(null);

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
    const data = await apiGet('/api/system/config');
    
    if (data.success && data.config) {
      config.value = {
        dify_key: data.config.dify_key || '',
        ragflow_key: data.config.ragflow_key || '',
        dify_api_url: data.config.dify_api_url || '',
        ragflow_api_url: data.config.ragflow_api_url || ''
      };
      console.log('配置載入成功');
    }
  } catch (error) {
    console.error('載入配置失敗:', error);
    showToast('error', `載入配置失敗: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 檢測是否為遮罩後的 API Key（包含連續 ***）
const isMaskedKey = (key) => key && key.includes('***');

// 儲存配置
const saveConfig = async () => {
  saving.value = true;
  try {
    const payload = {};
    // 跳過遮罩 key（代表使用者未修改，不應回傳覆蓋真實金鑰）
    if (config.value.dify_key && !isMaskedKey(config.value.dify_key)) payload.dify_key = config.value.dify_key;
    if (config.value.ragflow_key && !isMaskedKey(config.value.ragflow_key)) payload.ragflow_key = config.value.ragflow_key;
    if (config.value.dify_api_url) payload.dify_api_url = config.value.dify_api_url;
    if (config.value.ragflow_api_url) payload.ragflow_api_url = config.value.ragflow_api_url;
    
    if (Object.keys(payload).length === 0) {
      showToast('error', '請至少填寫一個設定項目');
      saving.value = false;
      return;
    }
    
    const data = await apiPost('/api/system/config', payload);
    
    if (data.success) {
      showToast('success', '✅ 設定已保存到 config.json！修改將立即生效');
      hasChanges.value = false;
      await loadConfig();
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

// 測試連接
const testConnection = async () => {
  testing.value = true;
  testResult.value = null;
  try {
    const data = await apiPost('/api/system/test-connection', {});
    testResult.value = data;
    if (data.success) {
      showToast('success', '✅ 所有服務連接正常！');
    } else {
      showToast('error', '⚠️ 部分服務連接失敗，請檢查測試結果');
    }
  } catch (error) {
    console.error('測試連接失敗:', error);
    showToast('error', `測試失敗: ${error.message}`);
  } finally {
    testing.value = false;
  }
};

// 組件掛載時載入配置
onMounted(() => {
  loadConfig();
  loadUsers();
});

// ==================== 使用者管理 ====================
const users = ref([]);
const userSaving = ref(false);
const userDialog = ref({
  show: false,
  isEdit: false,
  username: '',
  password: '',
  role: 'user',
  dify_api_key: ''
});

const openUserDialog = (user = null) => {
  if (user) {
    userDialog.value = {
      show: true,
      isEdit: true,
      username: user.user,
      password: '',
      role: user.role,
      dify_api_key: ''
    };
  } else {
    userDialog.value = {
      show: true,
      isEdit: false,
      username: '',
      password: '',
      role: 'user',
      dify_api_key: ''
    };
  }
};

const loadUsers = async () => {
  try {
    const data = await apiGet('/api/auth/users');
    if (data.success) {
      users.value = data.users;
    }
  } catch (e) {
    console.error('載入使用者失敗:', e);
  }
};

const saveUser = async () => {
  userSaving.value = true;
  try {
    if (userDialog.value.isEdit) {
      const payload = {};
      if (userDialog.value.password) payload.password = userDialog.value.password;
      if (userDialog.value.role) payload.role = userDialog.value.role;
      if (userDialog.value.dify_api_key !== undefined) payload.dify_api_key = userDialog.value.dify_api_key;
      const resp = await authFetch(`/api/auth/users/${encodeURIComponent(userDialog.value.username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || '更新失敗');
      showToast('success', `✅ 使用者 '${userDialog.value.username}' 已更新`);
    } else {
      if (!userDialog.value.username || !userDialog.value.password) {
        showToast('error', '使用者名稱與密碼不可為空');
        userSaving.value = false;
        return;
      }
      const data = await apiPost('/api/auth/users', {
        username: userDialog.value.username,
        password: userDialog.value.password,
        role: userDialog.value.role,
        dify_api_key: userDialog.value.dify_api_key
      });
      if (!data.success) throw new Error(data.detail || '建立失敗');
      showToast('success', `✅ 使用者 '${userDialog.value.username}' 已建立`);
    }
    userDialog.value.show = false;
    await loadUsers();
  } catch (e) {
    showToast('error', e.message);
  } finally {
    userSaving.value = false;
  }
};

const deleteUser = async (username) => {
  if (!confirm(`確定要刪除使用者 '${username}'？此操作無法復原。`)) return;
  try {
    const resp = await authFetch(`/api/auth/users/${encodeURIComponent(username)}`, { method: 'DELETE' });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || '刪除失敗');
    showToast('success', `✅ 使用者 '${username}' 已刪除`);
    await loadUsers();
  } catch (e) {
    showToast('error', e.message);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  return new Date(dateStr).toLocaleDateString('zh-TW');
};
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
  height: 100vh;
  overflow-y: auto;
  padding-bottom: 80px;
  background: var(--bg-main);
}

/* 自訂滾動條樣式 */
.settings-container::-webkit-scrollbar {
  width: 6px;
}

.settings-container::-webkit-scrollbar-track {
  background: transparent;
}

.settings-container::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.15);
  border-radius: 3px;
}

.settings-container::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.25);
}

/* 頁面標題 */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
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
  color: #6b7280;
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

/* 設定卡片 (企業級毛玻璃) */
.settings-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid var(--border-primary);
  border-radius: 18px;
  padding: 32px;
  box-shadow: var(--shadow-glass);
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
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.section-icon {
  font-size: 24px;
}

.section-badge {
  background: rgba(59, 130, 246, 0.12);
  color: var(--accent-blue);
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manage-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.manage-link:hover {
  background: rgba(148, 163, 184, 0.06);
  border-color: rgba(148, 163, 184, 0.25);
  color: var(--text-primary);
}

.link-icon {
  font-size: 16px;
}

/* 分隔線 */
.divider {
  height: 1px;
  background: var(--border-primary);
  border: none;
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
  background: rgba(148, 163, 184, 0.08);
  color: var(--text-tertiary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.label-badge.required {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* 輸入框 */
.form-input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'Inter', 'Monaco', 'Courier New', monospace;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: rgba(13, 21, 38, 0.9);
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
  display: flex;
  align-items: center;
}

.input-with-toggle .form-input {
  padding-right: 50px;
  flex: 1;
}

.toggle-password-btn {
  position: absolute;
  right: 8px;
  width: 34px;
  height: 34px;
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid var(--border-primary);
  border-radius: 7px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.toggle-password-btn:hover {
  background: rgba(148, 163, 184, 0.12);
  border-color: rgba(148, 163, 184, 0.2);
  color: var(--text-primary);
}

.toggle-password-btn:active {
  transform: scale(0.95);
}

/* 表單提示 */
.form-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #9ca3af;
}

.form-hint code {
  background: rgba(148, 163, 184, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  color: var(--accent-blue);
}

/* 操作按鈕 */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-primary);
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
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
  background: var(--primary-blue);
  color: #ffffff;
  border: 1px solid rgba(59, 130, 246, 0.5);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.06);
  border-color: rgba(148, 163, 184, 0.2);
  color: var(--text-primary);
}

.btn-test {
  background: var(--success-green);
  color: white;
  border: 1px solid rgba(34, 197, 94, 0.5);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
}

.btn-test:hover:not(:disabled) {
  background: #16a34a;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.35);
}

.btn-icon, .btn-spinner {
  font-size: 18px;
}

/* 測試結果框 */
.test-result-box {
  background: rgba(17, 26, 46, 0.5);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  padding: 24px;
  margin-top: 24px;
}

.test-result-box h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--accent-blue);
}

.service-test-result {
  background: rgba(11, 18, 34, 0.5);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
}

.service-test-result:last-child {
  margin-bottom: 0;
}

.service-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.service-icon {
  font-size: 20px;
}

.service-name {
  font-weight: 600;
  color: #e5e7eb;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.ok {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.warning {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.status-badge.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.service-details {
  font-size: 14px;
  color: #9ca3af;
  line-height: 1.8;
}

.service-details p {
  margin: 4px 0;
}

.service-details strong {
  color: #d1d5db;
  margin-right: 8px;
}

.btn-icon, .btn-spinner {
  font-size: 18px;
}

/* 提示訊息框 */
.info-box {
  display: flex;
  gap: 16px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 14px;
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
  background: rgba(148, 163, 184, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  color: var(--accent-blue);
}

/* Toast 通知 */
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: rgba(11, 18, 34, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);
  z-index: 1000;
  max-width: 400px;
}

.toast.success {
  border-left: 3px solid var(--success-green);
}

.toast.error {
  border-left: 3px solid var(--danger-red);
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

/* ==================== 使用者管理樣式 ==================== */
.user-table-container {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid var(--border-primary);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.user-table th {
  background: rgba(148, 163, 184, 0.04);
  padding: 12px 16px;
  text-align: left;
  color: var(--text-tertiary);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border-primary);
}

.user-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.user-table tr:last-child td {
  border-bottom: none;
}

.user-table tr:hover td {
  background: rgba(148, 163, 184, 0.03);
}

.user-name {
  font-weight: 600;
  color: white;
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}
.role-badge.admin {
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.15);
}
.role-badge.user {
  background: rgba(59, 130, 246, 0.08);
  color: var(--accent-blue);
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.key-badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
}
.key-badge.has-key {
  background: rgba(34, 197, 94, 0.08);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.15);
}
.key-badge.no-key {
  background: rgba(148, 163, 184, 0.06);
  color: var(--text-tertiary);
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-primary);
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(148, 163, 184, 0.06);
  border-color: rgba(148, 163, 184, 0.2);
}
.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}
.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: 18px;
  padding: 32px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 24px;
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
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
