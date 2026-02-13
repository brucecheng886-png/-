<template>
  <div class="login-container">
    <!-- Ambient glow -->
    <div class="login-ambient"></div>

    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="login-title">BruV Platform</h1>
        <p class="login-subtitle">Enterprise AI Knowledge Graph</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="token" class="form-label">API Token</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="token"
              v-model="token"
              type="password"
              class="form-input"
              placeholder="請輸入 API Token"
              autocomplete="off"
              :disabled="loading"
            />
          </div>
        </div>

        <p v-if="error" class="error-message">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ error }}
        </p>

        <button type="submit" class="login-button" :disabled="loading || !token">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '驗證中...' : '登入系統' }}
        </button>
      </form>

      <p class="login-hint">
        Token 在首次啟動後端時自動生成，請查看終端機輸出
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref('')
const error = ref('')
const loading = ref(false)

const apiBase = import.meta.env.VITE_API_BASE || ''

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    const response = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value })
    })
    
    if (response.ok) {
      // 保存 Token 到 localStorage
      localStorage.setItem('bruv_api_token', token.value)
      // 導航到主頁
      router.push('/')
    } else {
      error.value = 'Token 無效，請確認後重試'
    }
  } catch (e) {
    error.value = '無法連接到伺服器'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-main);
  overflow: hidden;
}

/* Subtle ambient glow behind card */
.login-ambient {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 600px;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2.5rem 2rem;
  background: var(--bg-card, rgba(17, 26, 46, 0.65));
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-xl, 18px);
  box-shadow: var(--shadow-glass, 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03));
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.15);
  color: var(--primary-blue, #3b82f6);
  margin-bottom: 1rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 0.35rem;
  letter-spacing: -0.01em;
}

.login-subtitle {
  color: var(--text-tertiary, #64748b);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  color: var(--text-secondary, #94a3b8);
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary, #64748b);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--bg-input, #0d1526);
  border: 1px solid var(--border-primary, rgba(148, 163, 184, 0.12));
  border-radius: var(--radius-md, 10px);
  color: var(--text-primary, #e2e8f0);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary-blue, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--text-tertiary, #64748b);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f87171;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: var(--radius-sm, 6px);
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-blue, #3b82f6);
  color: #fff;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-md, 10px);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.login-button:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
}

.login-button:active:not(:disabled) {
  background: #1d4ed8;
}

.login-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-hint {
  text-align: center;
  color: var(--text-tertiary, #64748b);
  font-size: 0.72rem;
  margin-top: 1.5rem;
  line-height: 1.5;
}
</style>
