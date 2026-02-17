<template>
  <div class="settings-container" @click="showUrlSuggestions = false">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">系統設定</h1>
      <p class="page-subtitle">管理服務連線、API Keys 和系統配置</p>
    </div>

    <!-- 分頁標籤 -->
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'connections' }" @click="activeTab = 'connections'">
        連線管理
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
        使用者管理
      </button>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>載入配置中...</p>
    </div>

    <!-- ==================== Tab: 連線管理 ==================== -->
    <div v-show="!loading && activeTab === 'connections'" class="settings-card">
      <div class="section-header">
        <h2 class="section-title">連線管理</h2>
        <div class="section-actions">
          <button class="btn btn-test" @click="detectServices" :disabled="detecting">
            {{ detecting ? '偵測中...' : '自動偵測' }}
          </button>
          <button class="btn btn-primary" @click="openConnDialog()">
            新增連線
          </button>
        </div>
      </div>
      <p class="section-desc">
        管理所有服務連線。Key 和 URL 完整顯示，不做遮罩。可自行新增、編輯、刪除任何連線。
      </p>

      <!-- 自動偵測結果面板 -->
      <transition name="slide">
        <div v-if="detectResults.length > 0" class="detect-panel">
          <div class="detect-header">
            <h3>偵測結果</h3>
            <button class="btn-close" @click="detectResults = []" title="關閉">✕</button>
          </div>
          <div class="detect-list">
            <div
              v-for="(result, idx) in detectResults"
              :key="idx"
              class="detect-item"
              :class="{ available: result.available === true, unavailable: result.available === false, suggested: result.suggested }"
            >
              <div class="detect-row">
                <span class="detect-dot" :class="result.available === true ? 'green' : result.available === false ? 'red' : 'gray'">●</span>
                <span class="detect-name">{{ result.name }}</span>
                <span class="detect-type-chip">{{ result.type }}</span>
              </div>
              <div class="detect-url">{{ result.url }}</div>
              <div class="detect-info" v-if="result.info">{{ result.info }}</div>
              <div class="detect-actions">
                <button
                  v-if="result.available !== false && !isUrlConfigured(result.url)"
                  class="btn btn-sm btn-primary"
                  @click="addFromDetect(result)"
                >
                  加入
                </button>
                <span v-else-if="isUrlConfigured(result.url)" class="detect-badge existing">已配置</span>
                <span v-else class="detect-badge offline">不可用</span>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 空狀態 -->
      <div v-if="connections.length === 0 && detectResults.length === 0" class="empty-state">
        <p class="empty-title">尚無連線配置</p>
        <p class="empty-hint">點擊「自動偵測」探索可用服務，或點擊「新增連線」手動添加</p>
      </div>

      <!-- 連線卡片列表 -->
      <div v-if="connections.length > 0" class="conn-list">
        <div
          v-for="conn in connections"
          :key="conn.id"
          class="conn-card"
          :class="{ disabled: !conn.enabled }"
        >
          <div class="conn-top">
            <div class="conn-identity">
              <span class="conn-type-badge" :class="conn.type">{{ typeLetter(conn.type) }}</span>
              <span class="conn-name">{{ conn.name }}</span>
              <span class="conn-type-chip">{{ conn.type }}</span>
            </div>
            <div class="conn-badges">
              <span class="conn-status-badge" :class="conn.enabled ? 'active' : 'inactive'">
                {{ conn.enabled ? '● 已啟用' : '○ 已停用' }}
              </span>
              <span
                v-if="conn._testStatus"
                class="conn-test-status"
                :class="conn._testStatus"
              >
                {{ conn._testStatus === 'ok' ? '正常' : conn._testStatus === 'testing' ? '測試中' : conn._testStatus === 'warning' ? '警告' : '異常' }}
              </span>
            </div>
          </div>

          <div class="conn-body">
            <div class="conn-field">
              <span class="conn-field-label">URL</span>
              <span class="conn-field-value mono">{{ conn.url }}</span>
            </div>
            <div class="conn-field" v-if="needsApiKey(conn.type)">
              <span class="conn-field-label">Key</span>
              <span class="conn-field-value mono">{{ getDisplayKey(conn) || '(未設定)' }}</span>
              <span v-if="!conn.remember_key" class="conn-field-tag warn">瀏覽器保存</span>
            </div>
            <div v-if="conn.note" class="conn-note">{{ conn.note }}</div>
            <div v-if="conn._testMessage" class="conn-test-msg" :class="conn._testStatus">
              {{ conn._testMessage }}
            </div>
          </div>

          <div class="conn-actions">
            <button
              class="action-btn test"
              @click="testSingleConnection(conn)"
              :disabled="conn._testStatus === 'testing'"
              title="測試連線"
            ><svg viewBox="0 0 20 20" fill="currentColor" class="action-svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>測試</button>
            <button class="action-btn edit" @click="openConnDialog(conn)" title="編輯"><svg viewBox="0 0 20 20" fill="currentColor" class="action-svg"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>編輯</button>
            <button class="action-btn delete" @click="deleteConnection(conn.id)" title="刪除"><svg viewBox="0 0 20 20" fill="currentColor" class="action-svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>刪除</button>
          </div>
        </div>
      </div>

      <!-- 提示框 -->
      <div class="info-box">
        <div class="info-content">
          <h4>使用提示</h4>
          <ul>
            <li>配置保存在 <code>C:/BruV_Data/config.json</code>，修改立即生效</li>
            <li>各類型第一個啟用的連線會自動同步為系統預設連線</li>
            <li>選擇「不記住 Key」時，Key 僅保存在瀏覽器，不寫入伺服器磁碟</li>
            <li>Docker 容器間建議使用 <code>ollama:11434</code> 或 <code>host.docker.internal:11434</code></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ==================== Tab: 使用者管理 ==================== -->
    <div v-show="!loading && activeTab === 'users'" class="settings-card">
      <div class="config-section">
        <div class="section-header">
          <h2 class="section-title">使用者管理</h2>
          <button class="btn btn-primary" style="flex:0;white-space:nowrap;padding:10px 20px;" @click="openUserDialog()">
            新增使用者
          </button>
        </div>
        <p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">
          每位使用者可設定獨立的密碼與 Dify API Key，登入後自動使用其專屬 Key 對話。
        </p>

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
                <td><span class="user-name">{{ u.user }}</span></td>
                <td><span class="role-badge" :class="u.role">{{ u.role }}</span></td>
                <td>
                  <span v-if="u.has_dify_key" class="key-badge has-key">{{ u.dify_key_preview }}</span>
                  <span v-else class="key-badge no-key">未設定（用全域）</span>
                </td>
                <td style="color:#9ca3af;font-size:13px;">{{ formatDate(u.created_at) }}</td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="action-btn edit" @click="openUserDialog(u)" title="編輯"><svg viewBox="0 0 20 20" fill="currentColor" class="action-svg"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>編輯</button>
                    <button class="action-btn delete" @click="deleteUser(u.user)" :disabled="u.user === 'admin'" title="刪除"><svg viewBox="0 0 20 20" fill="currentColor" class="action-svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>刪除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== 連線 Dialog ==================== -->
    <transition name="modal">
      <div v-if="connDialog.show" class="modal-overlay" @click.self="connDialog.show = false">
        <div class="modal-card modal-wide" @click.stop>
          <h3 class="modal-title">{{ connDialog.isEdit ? '編輯連線' : '新增連線' }}</h3>

          <div class="form-group">
            <label class="form-label">連線名稱</label>
            <input v-model="connDialog.name" type="text" class="form-input" placeholder="例：Dify AI 服務" />
          </div>

          <div class="form-group">
            <label class="form-label">服務類型</label>
            <select v-model="connDialog.type" class="form-input" @change="onTypeChange">
              <option value="dify">Dify — AI 對話</option>
              <option value="ragflow">RAGFlow — 知識檢索</option>
              <option value="ollama">Ollama — LLM 引擎</option>
              <option value="openai">OpenAI — 遠端 LLM</option>
              <option value="custom">自訂服務</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              URL
              <span v-if="suggestedUrls.length" class="label-badge clickable" @click.stop="showUrlSuggestions = !showUrlSuggestions">
                ▼ {{ suggestedUrls.length }} 個建議
              </span>
            </label>
            <input
              v-model="connDialog.url"
              type="text"
              class="form-input mono"
              :placeholder="urlPlaceholder"
              @focus.stop="showUrlSuggestions = true"
            />
            <!-- URL 建議下拉選單 -->
            <transition name="dropdown">
              <div v-if="showUrlSuggestions && suggestedUrls.length" class="url-suggestions" @click.stop>
                <div
                  v-for="s in suggestedUrls"
                  :key="s.url"
                  class="url-suggestion-item"
                  @click="selectUrl(s)"
                >
                  <span class="suggestion-dot" :class="s.available === true ? 'green' : s.available === false ? 'red' : 'gray'">●</span>
                  <div class="suggestion-info">
                    <div class="suggestion-url">{{ s.url }}</div>
                    <div class="suggestion-note">{{ s.note }}</div>
                  </div>
                </div>
              </div>
            </transition>
            <p class="form-hint">{{ typeHint }}</p>
          </div>

          <div class="form-group" v-if="needsApiKey(connDialog.type)">
            <label class="form-label">
              API Key
              <span class="label-badge">完整顯示</span>
            </label>
            <input
              v-model="connDialog.api_key"
              type="text"
              class="form-input mono"
              placeholder="完整輸入 API Key，不做遮罩"
            />
            <div class="remember-key-row">
              <label class="checkbox-label">
                <input type="checkbox" v-model="connDialog.remember_key" />
                <span>記住此 Key</span>
                <span class="remember-hint">
                  {{ connDialog.remember_key ? '（儲存至伺服器 config.json）' : '（僅保存在瀏覽器，不寫入磁碟）' }}
                </span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">備註</label>
            <textarea
              v-model="connDialog.note"
              class="form-input"
              rows="2"
              placeholder="選填：描述此連線的用途、版本等"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="connDialog.enabled" />
              <span>啟用此連線</span>
            </label>
          </div>

          <!-- Dialog 內測試結果 -->
          <div v-if="connDialogTestResult" class="test-result-inline" :class="connDialogTestResult.status">
            <span class="test-result-dot" :class="connDialogTestResult.status"></span>
            {{ connDialogTestResult.message }}
          </div>

          <div class="form-actions" style="border-top:none;margin-top:20px;padding-top:0;">
            <button class="btn btn-secondary" @click="connDialog.show = false">取消</button>
            <button class="btn btn-test" @click="testDialogConnection" :disabled="connDialogTesting || !connDialog.url">
              {{ connDialogTesting ? '測試中...' : '測試連線' }}
            </button>
            <button class="btn btn-primary" @click="saveConnection" :disabled="connSaving || !connDialog.name || !connDialog.url">
              {{ connSaving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ==================== 使用者 Dialog ==================== -->
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
        <span class="toast-dot" :class="toast.type"></span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { apiGet, apiPost, authFetch } from '../services/apiClient';

// ==================== 共用狀態 ====================
const loading = ref(true);
const activeTab = ref('connections');

// Toast
const toast = ref({ show: false, type: 'success', message: '' });
const showToast = (type, message) => {
  toast.value = { show: true, type, message };
  setTimeout(() => { toast.value.show = false; }, 5000);
};

// ==================== 連線管理 ====================
const connections = ref([]);
const detecting = ref(false);
const detectResults = ref([]);
const showUrlSuggestions = ref(false);

// localStorage key prefix for non-remembered keys
const LOCAL_KEY_PREFIX = 'bruv_conn_key_';

const getLocalKey = (connId) => localStorage.getItem(LOCAL_KEY_PREFIX + connId) || '';
const setLocalKey = (connId, key) => {
  if (key) localStorage.setItem(LOCAL_KEY_PREFIX + connId, key);
  else localStorage.removeItem(LOCAL_KEY_PREFIX + connId);
};

// 載入連線
const loadConnections = async () => {
  try {
    const data = await apiGet('/api/system/connections');
    if (data.success) {
      connections.value = data.connections.map(c => {
        // 對於不記住 Key 的連線，從 localStorage 讀取
        if (!c.remember_key && !c.api_key) {
          c.api_key = getLocalKey(c.id);
        }
        // 添加響應式測試狀態
        c._testStatus = '';
        c._testMessage = '';
        return c;
      });
    }
  } catch (e) {
    console.error('載入連線失敗:', e);
    showToast('error', `載入連線失敗: ${e.message}`);
  }
};

// 類型字母徽章
const typeLetter = (type) => {
  const letters = { dify: 'D', ragflow: 'R', ollama: 'O', openai: 'A', custom: 'C' };
  return letters[type] || '?';
};

// 是否需要 API Key
const needsApiKey = (type) => !['ollama'].includes(type);

// 取得顯示用的 Key
const getDisplayKey = (conn) => {
  if (conn.api_key) return conn.api_key;
  if (!conn.remember_key) return getLocalKey(conn.id);
  return '';
};

// URL 是否已配置
const isUrlConfigured = (url) => connections.value.some(c => c.url === url);

// ---- 連線 Dialog ----
const connDialog = ref({
  show: false, isEdit: false, editId: '',
  name: '', type: 'dify', url: '', api_key: '',
  note: '', remember_key: true, enabled: true,
});
const connSaving = ref(false);
const connDialogTesting = ref(false);
const connDialogTestResult = ref(null);

const openConnDialog = (conn = null) => {
  connDialogTestResult.value = null;
  showUrlSuggestions.value = false;
  if (conn) {
    connDialog.value = {
      show: true, isEdit: true, editId: conn.id,
      name: conn.name, type: conn.type, url: conn.url,
      api_key: getDisplayKey(conn),
      note: conn.note || '', remember_key: conn.remember_key !== false,
      enabled: conn.enabled !== false,
    };
  } else {
    connDialog.value = {
      show: true, isEdit: false, editId: '',
      name: '', type: 'dify', url: '', api_key: '',
      note: '', remember_key: true, enabled: true,
    };
  }
};

// 從偵測結果快速加入
const addFromDetect = (result) => {
  connDialog.value = {
    show: true, isEdit: false, editId: '',
    name: result.name, type: result.type, url: result.url,
    api_key: result.existing_key || '',
    note: result.note || '', remember_key: true, enabled: true,
  };
  connDialogTestResult.value = null;
  showUrlSuggestions.value = false;
};

// 類型切換時更新 URL placeholder
const onTypeChange = () => {
  connDialogTestResult.value = null;
};

const urlPlaceholder = computed(() => {
  const p = {
    dify: 'http://localhost:82/v1',
    ragflow: 'http://localhost:9380/api/v1',
    ollama: 'http://localhost:11434',
    openai: 'https://api.openai.com/v1',
    custom: 'http://...',
  };
  return p[connDialog.value.type] || 'http://...';
});

const typeHint = computed(() => {
  const h = {
    dify: 'Dify API 端點，通常為 http://localhost:82/v1',
    ragflow: 'RAGFlow API 端點，通常為 http://localhost:9380/api/v1',
    ollama: 'Ollama 服務位址。Docker 容器可用 http://ollama:11434 或 http://host.docker.internal:11434',
    openai: 'OpenAI 相容 API（如 https://api.openai.com/v1）',
    custom: '自訂服務的完整 URL',
  };
  return h[connDialog.value.type] || '';
});

// URL 建議清單（依類型 + 偵測結果）
const suggestedUrls = computed(() => {
  const type = connDialog.value.type;
  const defaults = {
    dify: [
      { url: 'http://localhost:82/v1', note: '本地 Dify (Port 82)', available: null },
      { url: 'http://localhost:5001/v1', note: 'Dify 備用 (Port 5001)', available: null },
    ],
    ragflow: [
      { url: 'http://localhost:9380/api/v1', note: '本地 RAGFlow (Port 9380)', available: null },
      { url: 'http://localhost:81/api/v1', note: 'RAGFlow Nginx (Port 81)', available: null },
    ],
    ollama: [
      { url: 'http://localhost:11434', note: '本地 Ollama', available: null },
      { url: 'http://ollama:11434', note: 'Docker 容器 DNS', available: null },
      { url: 'http://host.docker.internal:11434', note: 'Docker → 主機', available: null },
    ],
    openai: [
      { url: 'https://api.openai.com/v1', note: 'OpenAI 官方', available: null },
    ],
    custom: [],
  };

  const suggestions = [...(defaults[type] || [])];

  // 合併偵測結果
  for (const r of detectResults.value) {
    if (r.type === type) {
      const existing = suggestions.find(s => s.url === r.url);
      if (existing) {
        existing.available = r.available;
        existing.note = r.info || existing.note;
      } else {
        suggestions.push({ url: r.url, note: r.info || r.note, available: r.available });
      }
    }
  }

  return suggestions;
});

const selectUrl = (suggestion) => {
  connDialog.value.url = suggestion.url;
  showUrlSuggestions.value = false;
};

// 儲存連線
const saveConnection = async () => {
  connSaving.value = true;
  try {
    const payload = {
      name: connDialog.value.name,
      type: connDialog.value.type,
      url: connDialog.value.url,
      api_key: connDialog.value.api_key,
      note: connDialog.value.note,
      remember_key: connDialog.value.remember_key,
      enabled: connDialog.value.enabled,
    };

    let data;
    if (connDialog.value.isEdit) {
      const resp = await authFetch(`/api/system/connections/${connDialog.value.editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || '更新失敗');
    } else {
      data = await apiPost('/api/system/connections', payload);
    }

    if (data.success) {
      // 處理不記住 Key 的邏輯
      const connId = data.connection?.id || connDialog.value.editId;
      if (!connDialog.value.remember_key && connDialog.value.api_key) {
        setLocalKey(connId, connDialog.value.api_key);
      } else {
        // 記住 Key 時清除 localStorage 的備份
        localStorage.removeItem(LOCAL_KEY_PREFIX + connId);
      }

      showToast('success', data.message || '連線已儲存');
      connDialog.value.show = false;
      await loadConnections();
    } else {
      throw new Error(data.detail || data.message || '儲存失敗');
    }
  } catch (e) {
    showToast('error', e.message);
  } finally {
    connSaving.value = false;
  }
};

// 刪除連線
const deleteConnection = async (connId) => {
  if (!confirm('確定要刪除此連線？此操作無法復原。')) return;
  try {
    const resp = await authFetch(`/api/system/connections/${connId}`, { method: 'DELETE' });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || '刪除失敗');
    localStorage.removeItem(LOCAL_KEY_PREFIX + connId);
    showToast('success', '連線已刪除');
    await loadConnections();
  } catch (e) {
    showToast('error', e.message);
  }
};

// 測試單個連線
const testSingleConnection = async (conn) => {
  conn._testStatus = 'testing';
  conn._testMessage = '測試中...';
  try {
    const apiKey = getDisplayKey(conn);
    const data = await apiPost('/api/system/test-connection-inline', {
      type: conn.type, url: conn.url, api_key: apiKey,
    });
    if (data.success) {
      conn._testStatus = data.result.status;
      conn._testMessage = data.result.message;
    }
  } catch (e) {
    conn._testStatus = 'error';
    conn._testMessage = `測試失敗: ${e.message}`;
  }
};

// Dialog 內測試
const testDialogConnection = async () => {
  connDialogTesting.value = true;
  connDialogTestResult.value = null;
  try {
    const data = await apiPost('/api/system/test-connection-inline', {
      type: connDialog.value.type,
      url: connDialog.value.url,
      api_key: connDialog.value.api_key,
    });
    if (data.success) {
      connDialogTestResult.value = data.result;
    }
  } catch (e) {
    connDialogTestResult.value = { status: 'error', message: `測試失敗: ${e.message}` };
  } finally {
    connDialogTesting.value = false;
  }
};

// 自動偵測
const detectServices = async () => {
  detecting.value = true;
  detectResults.value = [];
  try {
    const data = await apiPost('/api/system/detect-services', {});
    if (data.success) {
      detectResults.value = data.services;
      showToast('success', `偵測完成，發現 ${data.services.filter(s => s.available).length} 個可用服務`);
    }
  } catch (e) {
    showToast('error', `偵測失敗: ${e.message}`);
  } finally {
    detecting.value = false;
  }
};

// ==================== 使用者管理 ====================
const users = ref([]);
const userSaving = ref(false);
const userDialog = ref({
  show: false, isEdit: false,
  username: '', password: '', role: 'user', dify_api_key: '',
});

const openUserDialog = (user = null) => {
  if (user) {
    userDialog.value = {
      show: true, isEdit: true,
      username: user.user, password: '', role: user.role, dify_api_key: '',
    };
  } else {
    userDialog.value = {
      show: true, isEdit: false,
      username: '', password: '', role: 'user', dify_api_key: '',
    };
  }
};

const loadUsers = async () => {
  try {
    const data = await apiGet('/api/auth/users');
    if (data.success) users.value = data.users;
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
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || '更新失敗');
      showToast('success', `使用者 '${userDialog.value.username}' 已更新`);
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
        dify_api_key: userDialog.value.dify_api_key,
      });
      if (!data.success) throw new Error(data.detail || '建立失敗');
      showToast('success', `使用者 '${userDialog.value.username}' 已建立`);
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
    showToast('success', `使用者 '${username}' 已刪除`);
    await loadUsers();
  } catch (e) {
    showToast('error', e.message);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  return new Date(dateStr).toLocaleDateString('zh-TW');
};

// ==================== 初始化 ====================
onMounted(async () => {
  loading.value = true;
  await Promise.all([loadConnections(), loadUsers()]);
  loading.value = false;
});
</script>

<style scoped>
.settings-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px;
  height: 100vh;
  overflow-y: auto;
  padding-bottom: 80px;
  background: var(--bg-main);
}

.settings-container::-webkit-scrollbar { width: 6px; }
.settings-container::-webkit-scrollbar-track { background: transparent; }
.settings-container::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 3px; }
.settings-container::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.25); }

/* 頁面標題 */
.page-header { margin-bottom: 24px; }
.page-title {
  font-size: 24px; font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px 0;
}
.page-subtitle { font-size: 14px; color: #6b7280; margin: 0; }

/* 分頁標籤 */
.tab-bar {
  display: flex; gap: 4px; margin-bottom: 24px;
  background: var(--bg-card); border-radius: 12px; padding: 4px;
  border: 1px solid var(--border-primary);
}
.tab-btn {
  flex: 1; padding: 10px 16px; border: none; border-radius: 8px;
  background: transparent; color: var(--text-secondary);
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.tab-btn:hover { background: rgba(148,163,184,0.06); color: var(--text-primary); }
.tab-btn.active {
  background: var(--primary-blue); color: #fff;
  box-shadow: 0 2px 8px rgba(59,130,246,0.3);
}

/* 載入狀態 */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 20px; color: #9ca3af;
}
.spinner {
  width: 48px; height: 48px;
  border: 4px solid rgba(59,130,246,0.2); border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 設定卡片 */
.settings-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid var(--border-primary);
  border-radius: 18px; padding: 32px;
  box-shadow: var(--shadow-glass);
  margin-bottom: 24px;
}

/* 區塊 */
.config-section { margin-bottom: 32px; }
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
}
.section-title {
  font-size: 18px; font-weight: 600; color: var(--text-primary);
  margin: 0;
}
.section-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.section-desc { color: #9ca3af; font-size: 14px; margin-bottom: 20px; line-height: 1.6; }

/* ==================== 偵測面板 ==================== */
.detect-panel {
  background: rgba(59,130,246,0.04); border: 1px solid rgba(59,130,246,0.12);
  border-radius: 14px; padding: 20px; margin-bottom: 24px;
}
.detect-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
}
.detect-header h3 { margin: 0; font-size: 16px; color: #60a5fa; font-weight: 600; }
.btn-close {
  background: transparent; border: 1px solid rgba(148,163,184,0.15);
  border-radius: 6px; width: 28px; height: 28px; cursor: pointer;
  color: var(--text-secondary); font-size: 14px; display: flex;
  align-items: center; justify-content: center; transition: all 0.2s;
}
.btn-close:hover { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.2); }
.detect-list { display: flex; flex-direction: column; gap: 10px; }
.detect-item {
  background: rgba(11,18,34,0.4); border: 1px solid var(--border-primary);
  border-radius: 10px; padding: 14px 16px;
  display: grid; grid-template-columns: 1fr auto; gap: 6px; align-items: center;
}
.detect-item.available { border-color: rgba(34,197,94,0.2); }
.detect-item.unavailable { opacity: 0.5; }
.detect-item.suggested { border-style: dashed; }
.detect-row { display: flex; align-items: center; gap: 10px; grid-column: 1; }
.detect-dot { font-size: 10px; }
.detect-dot.green { color: #22c55e; }
.detect-dot.red { color: #ef4444; }
.detect-dot.gray { color: #6b7280; }
.detect-name { font-weight: 600; color: var(--text-primary); font-size: 14px; }
.detect-type-chip {
  font-size: 11px; padding: 2px 8px; border-radius: 6px;
  background: rgba(148,163,184,0.08); color: var(--text-tertiary);
  text-transform: uppercase; font-weight: 600;
}
.detect-url { font-family: 'Monaco','Courier New',monospace; font-size: 13px; color: #9ca3af; grid-column: 1; }
.detect-info { font-size: 13px; color: #6b7280; grid-column: 1; }
.detect-actions { grid-column: 2; grid-row: 1 / span 3; display: flex; align-items: center; }
.detect-badge {
  font-size: 12px; padding: 4px 10px; border-radius: 6px; font-weight: 500;
}
.detect-badge.existing { background: rgba(59,130,246,0.08); color: var(--accent-blue); }
.detect-badge.offline { background: rgba(148,163,184,0.06); color: #6b7280; }

/* ==================== 連線卡片 ==================== */
.conn-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
.conn-card {
  background: rgba(11,18,34,0.4); border: 1px solid var(--border-primary);
  border-radius: 14px; padding: 20px; transition: all 0.2s;
}
.conn-card:hover { border-color: rgba(148,163,184,0.25); }
.conn-card.disabled { opacity: 0.5; }
.conn-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
}
.conn-identity { display: flex; align-items: center; gap: 10px; }
.conn-type-badge {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; font-size: 14px; font-weight: 700;
  color: #fff; flex-shrink: 0; letter-spacing: 0;
}
.conn-type-badge.dify { background: #6366f1; }
.conn-type-badge.ragflow { background: #0ea5e9; }
.conn-type-badge.ollama { background: #8b5cf6; }
.conn-type-badge.openai { background: #10b981; }
.conn-type-badge.custom { background: #64748b; }
.conn-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.conn-type-chip {
  font-size: 11px; padding: 2px 8px; border-radius: 6px;
  background: rgba(148,163,184,0.08); color: var(--text-tertiary);
  text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em;
}
.conn-badges { display: flex; gap: 8px; align-items: center; }
.conn-status-badge {
  font-size: 12px; padding: 4px 10px; border-radius: 8px; font-weight: 500;
}
.conn-status-badge.active { background: rgba(34,197,94,0.08); color: #4ade80; border: 1px solid rgba(34,197,94,0.15); }
.conn-status-badge.inactive { background: rgba(148,163,184,0.06); color: #6b7280; border: 1px solid rgba(148,163,184,0.1); }
.conn-test-status {
  font-size: 12px; padding: 4px 10px; border-radius: 8px; font-weight: 500;
}
.conn-test-status.ok { background: rgba(34,197,94,0.08); color: #22c55e; }
.conn-test-status.warning { background: rgba(234,179,8,0.08); color: #eab308; }
.conn-test-status.error { background: rgba(239,68,68,0.08); color: #ef4444; }
.conn-test-status.testing { background: rgba(59,130,246,0.08); color: #60a5fa; }
.conn-body { margin-bottom: 14px; }
.conn-field {
  display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;
}
.conn-field-label {
  font-size: 12px; font-weight: 600; color: var(--text-tertiary);
  min-width: 32px; text-transform: uppercase; letter-spacing: 0.05em;
}
.conn-field-value {
  font-size: 14px; color: #d1d5db; word-break: break-all;
}
.conn-field-tag {
  font-size: 11px; padding: 2px 7px; border-radius: 4px;
}
.conn-field-tag.warn { background: rgba(234,179,8,0.08); color: #eab308; }
.conn-note {
  margin-top: 8px; font-size: 13px; color: #9ca3af; line-height: 1.5;
}
.conn-test-msg {
  margin-top: 8px; font-size: 13px; padding: 8px 12px; border-radius: 8px;
}
.conn-test-msg.ok { background: rgba(34,197,94,0.05); color: #4ade80; }
.conn-test-msg.warning { background: rgba(234,179,8,0.05); color: #eab308; }
.conn-test-msg.error { background: rgba(239,68,68,0.05); color: #f87171; }
.conn-test-msg.testing { background: rgba(59,130,246,0.05); color: #60a5fa; }
.conn-actions {
  display: flex; gap: 8px; justify-content: flex-end;
  border-top: 1px solid var(--border-subtle); padding-top: 14px;
}

/* 空狀態 */
.empty-state {
  text-align: center; padding: 48px 20px; color: #6b7280;
}
.empty-title { font-size: 15px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
.empty-hint { font-size: 13px; color: #9ca3af; margin-top: 0; }

/* ==================== 表單元素 ==================== */
.form-group { margin-bottom: 20px; }
.form-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 500; color: #e5e7eb; margin-bottom: 8px;
}
.label-badge {
  background: rgba(148,163,184,0.08); color: var(--text-tertiary);
  padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;
}
.label-badge.required { background: rgba(239,68,68,0.1); color: #f87171; }
.label-badge.clickable { cursor: pointer; transition: all 0.2s; }
.label-badge.clickable:hover { background: rgba(59,130,246,0.12); color: var(--accent-blue); }
.form-input {
  width: 100%; padding: 12px 14px;
  background: var(--bg-input); border: 1px solid var(--border-primary);
  border-radius: 10px; color: var(--text-primary); font-size: 14px;
  transition: all 0.2s;
}
.form-input:focus {
  outline: none; border-color: var(--primary-blue);
  background: rgba(13,21,38,0.9); box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.form-input::placeholder { color: #6b7280; }
select.form-input { cursor: pointer; }
textarea.form-input { resize: vertical; min-height: 60px; font-family: inherit; }
.mono { font-family: 'Monaco','Courier New',monospace; }
.form-hint { margin-top: 8px; font-size: 13px; color: #9ca3af; }
.form-hint code {
  background: rgba(148,163,184,0.08); padding: 2px 6px; border-radius: 4px;
  font-family: 'Monaco','Courier New',monospace; color: var(--accent-blue);
}

/* Remember Key */
.remember-key-row { margin-top: 10px; }
.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: #d1d5db; cursor: pointer;
}
.checkbox-label input[type="checkbox"] {
  width: 18px; height: 18px; accent-color: var(--primary-blue); cursor: pointer;
}
.remember-hint { font-size: 12px; color: #9ca3af; }

/* URL 建議下拉 */
.url-suggestions {
  position: relative; margin-top: 6px;
  background: var(--bg-surface); border: 1px solid var(--border-primary);
  border-radius: 10px; overflow: hidden; z-index: 50;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.url-suggestion-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; cursor: pointer; transition: background 0.15s;
  border-bottom: 1px solid var(--border-subtle);
}
.url-suggestion-item:last-child { border-bottom: none; }
.url-suggestion-item:hover { background: rgba(59,130,246,0.06); }
.suggestion-dot { font-size: 10px; flex-shrink: 0; }
.suggestion-dot.green { color: #22c55e; }
.suggestion-dot.red { color: #ef4444; }
.suggestion-dot.gray { color: #6b7280; }
.suggestion-info { flex: 1; min-width: 0; }
.suggestion-url { font-size: 13px; color: var(--text-primary); font-family: 'Monaco','Courier New',monospace; }
.suggestion-note { font-size: 12px; color: #9ca3af; margin-top: 2px; }

/* Dialog 測試結果 */
.test-result-inline {
  padding: 12px 16px; border-radius: 10px; font-size: 14px;
  margin-bottom: 8px; display: flex; align-items: center; gap: 10px;
}
.test-result-inline.ok { background: rgba(34,197,94,0.06); color: #4ade80; border: 1px solid rgba(34,197,94,0.15); }
.test-result-inline.warning { background: rgba(234,179,8,0.06); color: #eab308; border: 1px solid rgba(234,179,8,0.15); }
.test-result-inline.error { background: rgba(239,68,68,0.06); color: #f87171; border: 1px solid rgba(239,68,68,0.15); }
.test-result-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.test-result-dot.ok { background: #22c55e; }
.test-result-dot.warning { background: #eab308; }
.test-result-dot.error { background: #ef4444; }

/* ==================== 按鈕 ==================== */
.form-actions {
  display: flex; gap: 12px; margin-top: 32px;
  padding-top: 24px; border-top: 1px solid var(--border-primary);
}
.btn {
  flex: 1; padding: 10px 18px; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary {
  background: rgba(59,130,246,0.15); color: #93b4f5;
  border: 1px solid rgba(59,130,246,0.25);
}
.btn-primary:hover:not(:disabled) { background: rgba(59,130,246,0.25); color: #b0cbf9; }
.btn-secondary {
  background: transparent; color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}
.btn-secondary:hover:not(:disabled) { background: rgba(148,163,184,0.06); border-color: rgba(148,163,184,0.2); color: var(--text-primary); }
.btn-test {
  background: rgba(34,197,94,0.12); color: #6dd4a0;
  border: 1px solid rgba(34,197,94,0.22);
}
.btn-test:hover:not(:disabled) { background: rgba(34,197,94,0.22); color: #86e4b8; }
.btn-sm { flex: 0; padding: 6px 14px; font-size: 13px; }

/* Action SVG icons */
.action-svg { width: 16px; height: 16px; }

/* 操作按鈕 (卡片內) */
.action-btn {
  height: 32px; padding: 0 12px;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  border: 1px solid var(--border-primary); border-radius: 6px;
  background: transparent; cursor: pointer;
  font-size: 12px; font-weight: 500; color: var(--text-secondary);
  transition: all 0.2s; white-space: nowrap;
}
.action-btn:hover { background: rgba(148,163,184,0.06); border-color: rgba(148,163,184,0.2); color: var(--text-primary); }
.action-btn.delete:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); color: #f87171; }
.action-btn.test:hover { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2); color: #4ade80; }
.action-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ==================== 提示框 ==================== */
.info-box {
  display: flex; gap: 16px;
  background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.1);
  border-radius: 14px; padding: 20px;
  border-left: 3px solid rgba(59,130,246,0.4);
}
.info-content h4 { margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #60a5fa; }
.info-content ul { margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.8; }

/* ==================== 使用者表格 ==================== */
.user-table-container { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border-primary); }
.user-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.user-table th {
  background: rgba(148,163,184,0.04); padding: 12px 16px; text-align: left;
  color: var(--text-tertiary); font-weight: 600; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border-primary);
}
.user-table td { padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); color: var(--text-primary); }
.user-table tr:last-child td { border-bottom: none; }
.user-table tr:hover td { background: rgba(148,163,184,0.03); }
.user-name { font-weight: 600; color: white; }
.role-badge { display: inline-block; padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.role-badge.admin { background: rgba(239,68,68,0.08); color: #f87171; border: 1px solid rgba(239,68,68,0.15); }
.role-badge.user { background: rgba(59,130,246,0.08); color: var(--accent-blue); border: 1px solid rgba(59,130,246,0.15); }
.key-badge { font-size: 12px; padding: 3px 8px; border-radius: 6px; font-family: 'Monaco','Courier New',monospace; }
.key-badge.has-key { background: rgba(34,197,94,0.08); color: #4ade80; border: 1px solid rgba(34,197,94,0.15); }
.key-badge.no-key { background: rgba(148,163,184,0.06); color: var(--text-tertiary); }

/* ==================== Modal ==================== */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 999;
}
.modal-card {
  background: var(--bg-surface); border: 1px solid var(--border-primary);
  border-radius: 18px; padding: 32px; width: 480px; max-width: 90vw;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5); max-height: 90vh; overflow-y: auto;
}
.modal-card.modal-wide { width: 560px; }
.modal-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 24px; }
.modal-card::-webkit-scrollbar { width: 4px; }
.modal-card::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 2px; }

/* ==================== Toast ==================== */
.toast {
  position: fixed; bottom: 32px; right: 32px;
  background: rgba(11,18,34,0.95); backdrop-filter: blur(20px);
  border-radius: 12px; padding: 14px 20px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: var(--shadow-lg); border: 1px solid var(--border-primary);
  z-index: 1000; max-width: 400px;
}
.toast.success { border-left: 3px solid var(--success-green); }
.toast.error { border-left: 3px solid var(--danger-red); }
.toast-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.toast-dot.success { background: var(--success-green); }
.toast-dot.error { background: var(--danger-red); }
.toast-message { color: #e5e7eb; font-size: 14px; line-height: 1.5; }

/* ==================== 動畫 ==================== */
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.68,-0.55,0.265,1.55); }
.toast-enter-from { transform: translateX(400px); opacity: 0; }
.toast-leave-to { transform: translateY(100px); opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; padding: 0 20px; margin-bottom: 0; }
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }

/* ==================== 響應式 ==================== */
@media (max-width: 768px) {
  .settings-container { padding: 24px 16px; }
  .settings-card { padding: 24px; }
  .page-title { font-size: 24px; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .section-actions { width: 100%; }
  .form-actions { flex-direction: column; }
  .conn-top { flex-direction: column; align-items: flex-start; }
  .toast { bottom: 16px; right: 16px; left: 16px; max-width: none; }
  .tab-bar { flex-direction: column; }
}
</style>
