<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">🧠 BruV Platform</h1>
        <p class="login-subtitle">企業級 AI 知識圖譜平台</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="token" class="form-label">API Token</label>
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
        
        <p v-if="error" class="error-message">{{ error }}</p>
        
        <button type="submit" class="login-button" :disabled="loading || !token">
          {{ loading ? '驗證中...' : '登入' }}
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0f0f0f;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #888;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  color: #aaa;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #4a9eff;
}

.error-message {
  color: #ff4d4f;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #4a9eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover:not(:disabled) {
  background: #3a8eef;
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  color: #555;
  font-size: 0.75rem;
  margin-top: 1.5rem;
}
</style>
