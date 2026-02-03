<template>
  <div class="dify-chat-container">
    <!-- 對話區域 -->
    <div class="chat-area" ref="chatArea">
      <!-- 歡迎畫面 -->
      <div v-if="messages.length === 0" class="welcome-section">
        <div class="welcome-icon">🤖</div>
        <h2 class="welcome-title">Dify AI 助手</h2>
        <p class="welcome-subtitle">有什麼我可以幫助您的嗎？</p>
        
        <!-- 快速提示 -->
        <div class="suggestion-chips">
          <button 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            @click="sendSuggestion(suggestion)"
            class="suggestion-chip"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- 訊息列表 -->
      <div v-else class="messages-list">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-wrapper"
          :class="message.role === 'user' ? 'user-message' : 'ai-message'"
        >
          <!-- 頭像 -->
          <div 
            class="avatar"
            :class="message.role === 'user' ? 'user-avatar' : 'ai-avatar'"
          >
            {{ message.role === 'user' ? '👤' : '🤖' }}
          </div>

          <!-- 訊息氣泡 -->
          <div 
            class="message-bubble"
            :class="message.role === 'user' ? 'user-bubble' : 'ai-bubble'"
          >
            <!-- AI 模式標籤 -->
            <div v-if="message.role === 'assistant' && message.modeLabel" class="mode-label">
              {{ message.modeLabel }}
            </div>
            
            <!-- 訊息內容 -->
            <div class="message-content">
              <!-- 打字機效果顯示 -->
              <span v-if="message.typing">
                {{ message.displayText }}<span class="cursor">|</span>
              </span>
              <!-- 完整內容（支援 Markdown） -->
              <span v-else v-html="formatMessage(message.content)"></span>
            </div>
            
            <!-- RAG 模式：顯示來源文檔 -->
            <div v-if="message.role === 'assistant' && message.mode === 'rag' && message.sources?.length > 0" class="sources-section">
              <div class="sources-header">
                <span class="sources-icon">📄</span>
                <span class="sources-title">參考來源 ({{ message.sources.length }})</span>
              </div>
              <div class="sources-list">
                <div v-for="(source, index) in message.sources" :key="index" class="source-item">
                  <div class="source-header">
                    <span class="source-number">來源 {{ index + 1 }}</span>
                    <span v-if="source.score" class="source-score">相關度: {{ (source.score * 100).toFixed(1) }}%</span>
                  </div>
                  <div class="source-content">{{ source.content || source.text || '內容無法顯示' }}</div>
                  <div v-if="source.metadata" class="source-metadata">
                    <span v-if="source.metadata.file_name">檔案: {{ source.metadata.file_name }}</span>
                    <span v-if="source.metadata.page">頁碼: {{ source.metadata.page }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 自動化模式：顯示操作結果 -->
            <div v-if="message.role === 'assistant' && message.mode === 'automation' && message.actionResult" class="action-result-section">
              <div class="action-header">
                <span class="action-icon">⚙️</span>
                <span class="action-title">操作詳情</span>
              </div>
              <div class="action-content">
                <div class="action-item">
                  <span class="action-label">操作類型:</span>
                  <span class="action-value action-type">{{ message.actionResult.action }}</span>
                </div>
                <div class="action-item">
                  <span class="action-label">執行狀態:</span>
                  <span 
                    class="action-value action-status"
                    :class="`status-${message.actionResult.status}`"
                  >
                    {{ message.actionResult.status }}
                  </span>
                </div>
                <div v-if="message.actionResult.command" class="action-item">
                  <span class="action-label">執行命令:</span>
                  <code class="action-command">{{ message.actionResult.command }}</code>
                </div>
                <div v-if="message.actionResult.note" class="action-note">
                  <span class="note-icon">ℹ️</span>
                  <span>{{ message.actionResult.note }}</span>
                </div>
              </div>
            </div>
            
            <!-- 時間戳 -->
            <div class="message-time">{{ message.timestamp }}</div>
          </div>
        </div>

        <!-- AI 正在輸入指示器 -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="avatar ai-avatar">🤖</div>
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 輸入區域 -->
    <div class="input-area">
      <div class="input-container">
        <!-- 文字輸入框 -->
        <textarea
          v-model="inputMessage"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="insertNewLine"
          placeholder="輸入訊息... (Shift+Enter 換行)"
          class="message-input"
          rows="1"
          ref="inputRef"
          :disabled="isSending"
        ></textarea>

        <!-- 發送按鈕 -->
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isSending"
          class="send-button"
          :class="{ 'sending': isSending }"
        >
          <span v-if="!isSending">📤</span>
          <span v-else class="spinner">⏳</span>
        </button>
      </div>

      <!-- 工具列 -->
      <div class="toolbar">
        <span class="hint">💡 Shift + Enter 換行，Enter 發送</span>
        <button 
          @click="clearChat" 
          class="clear-button"
          :disabled="messages.length === 0"
        >
          🗑️ 清空對話
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch } from 'vue';

// API 配置
const API_BASE_URL = 'http://localhost:8000';
const DIFY_USER = 'bruce';

// 對話訊息
const messages = ref([]);

// 輸入相關
const inputMessage = ref('');
const inputRef = ref(null);
const chatArea = ref(null);

// 狀態
const isSending = ref(false);
const isTyping = ref(false);

// 建議問題
const suggestions = [
  '介紹一下 Dify 平台',
  '如何使用知識圖譜？',
  'RAGFlow 的核心功能是什麼？',
  '幫我生成一段 Python 代碼'
];

// 格式化時間
const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 簡單的 Markdown 格式化
const formatMessage = (content) => {
  if (!content) return '';
  
  let formatted = content
    // 粗體
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 斜體
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 行內代碼
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    // 換行
    .replace(/\n/g, '<br>')
    // 代碼塊（簡化版）
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  
  return formatted;
};

// 打字機效果
const typewriterEffect = async (message, fullText) => {
  message.displayText = '';
  message.typing = true;
  
  const chars = fullText.split('');
  const delay = 30; // 每個字符延遲 30ms
  
  for (let i = 0; i < chars.length; i++) {
    message.displayText += chars[i];
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // 自動滾動
    scrollToBottom();
  }
  
  message.typing = false;
  message.content = fullText;
};

// 滾動到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight;
    }
  });
};

// 發送訊息
const sendMessage = async () => {
  const trimmedMessage = inputMessage.value.trim();
  
  if (!trimmedMessage || isSending.value) return;
  
  // 添加用戶訊息
  const userMessage = {
    role: 'user',
    content: trimmedMessage,
    timestamp: formatTime(),
    typing: false,
    displayText: ''
  };
  
  messages.value.push(userMessage);
  inputMessage.value = '';
  isSending.value = true;
  
  scrollToBottom();
  
  // 顯示 AI 正在輸入
  isTyping.value = true;
  
  try {
    // 調用新的 Agent API（智能路由）
    const response = await fetch(`${API_BASE_URL}/api/dify/agent/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: trimmedMessage,
        user: DIFY_USER
      })
    });
    
    if (!response.ok) {
      // 嘗試解析後端返回的詳細錯誤訊息
      let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorDetail = errorData.detail;
        }
      } catch (parseError) {
        console.warn('無法解析錯誤回應:', parseError);
      }
      throw new Error(errorDetail);
    }
    
    const data = await response.json();
    
    // 提取 AI 回覆
    const aiResponse = data.answer || '抱歉，我無法理解您的問題。';
    
    // 添加模式標籤（顯示當前使用的模式）
    let modeLabel = '';
    if (data.detected_intent === 'rag') {
      modeLabel = '📚 知識檢索模式';
    } else if (data.detected_intent === 'automation') {
      modeLabel = '🔧 自動化模式';
    } else if (data.detected_intent === 'chat') {
      modeLabel = '💬 閒聊模式';
    }
    
    isTyping.value = false;
    
    // 添加 AI 訊息（帶打字機效果）
    const aiMessage = reactive({
      role: 'assistant',
      content: '',
      displayText: '',
      typing: false,
      timestamp: formatTime(),
      mode: data.detected_intent,
      modeLabel: modeLabel,
      sources: data.source_documents || [],
      actionResult: data.action_result || null
    });
    
    messages.value.push(aiMessage);
    
    // 執行打字機效果
    await typewriterEffect(aiMessage, aiResponse);
    
    console.log('Agent 回應:', data);
    
  } catch (error) {
    console.error('發送訊息失敗:', error);
    
    isTyping.value = false;
    
    // 添加錯誤訊息
    const errorMessage = reactive({
      role: 'assistant',
      content: '',
      displayText: '',
      typing: false,
      timestamp: formatTime()
    });
    
    messages.value.push(errorMessage);
    
    // 提取詳細錯誤訊息 (優先使用後端返回的 detail)
    const errorMsg = error.response?.data?.detail || error.message;
    
    // 顯示詳細錯誤訊息
    let errorText = `❌ **發生錯誤**\n\n${errorMsg}\n\n`;
    
    // 根據錯誤類型提供建議
    if (errorMsg.includes('Docker') || errorMsg.includes('連接')) {
      errorText += '💡 **解決方案：**\n';
      errorText += '1. 啟動 Docker Desktop\n';
      errorText += '2. 執行: `docker compose up -d`\n';
      errorText += '3. 等待 Dify 服務完全啟動（約 30 秒）';
    } else if (errorMsg.includes('API Key') || errorMsg.includes('無效')) {
      errorText += '💡 **解決方案：**\n';
      errorText += '1. 檢查 `.env` 文件是否存在\n';
      errorText += '2. 確認 `DIFY_API_KEY` 設定正確\n';
      errorText += '3. 重新啟動後端服務';
    } else if (errorMsg.includes('fetch')) {
      errorText += '💡 **解決方案：**\n';
      errorText += '1. FastAPI 服務運行在 http://localhost:8000\n';
      errorText += '2. Dify 服務配置正確\n';
      errorText += '3. CORS 設定允許跨域請求';
    } else if (errorMsg.includes('超時') || errorMsg.includes('timeout')) {
      errorText += '💡 **解決方案：**\n';
      errorText += '1. Dify 服務可能過載\n';
      errorText += '2. 請稍後重試\n';
      errorText += '3. 檢查網路連線';
    }
    
    await typewriterEffect(errorMessage, errorText);
    
  } finally {
    isSending.value = false;
    scrollToBottom();
  }
};

// 發送建議問題
const sendSuggestion = (suggestion) => {
  inputMessage.value = suggestion;
  sendMessage();
};

// 插入換行
const insertNewLine = () => {
  const textarea = inputRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  inputMessage.value = 
    inputMessage.value.substring(0, start) + 
    '\n' + 
    inputMessage.value.substring(end);
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 1;
  });
};

// 清空對話
const clearChat = () => {
  if (confirm('確定要清空所有對話記錄嗎？')) {
    messages.value = [];
  }
};

// 監聽輸入框高度自動調整
watch(inputMessage, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto';
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + 'px';
    }
  });
});

// 組件掛載時聚焦輸入框
onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
});
</script>

<style scoped>
/* ===== 容器 ===== */
.dify-chat-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

/* 背景效果 */
.dify-chat-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* ===== 對話區域 ===== */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
  position: relative;
  z-index: 1;
}

/* 自定義滾動條 */
.chat-area::-webkit-scrollbar {
  width: 8px;
}

.chat-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.chat-area::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
}

.chat-area::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* ===== 歡迎區域 ===== */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
}

.welcome-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 40px 0;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-width: 600px;
  justify-content: center;
}

.suggestion-chip {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-chip:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* ===== 訊息列表 ===== */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.user-message {
  flex-direction: row-reverse;
}

.message-wrapper.ai-message {
  flex-direction: row;
}

/* ===== 頭像 ===== */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.user-avatar {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.ai-avatar {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

/* ===== 訊息氣泡 ===== */
.message-bubble {
  max-width: 70%;
  padding: 14px 18px;
  border-radius: 18px;
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: bubbleIn 0.3s ease-out;
}

@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.user-bubble {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.ai-bubble {
  background: rgba(30, 30, 40, 0.9);
  color: #e5e7eb;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-content {
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
  text-align: right;
}

/* 打字機游標 */
.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Markdown 樣式 */
.message-content :deep(strong) {
  font-weight: 700;
  color: #ffffff;
}

.message-content :deep(em) {
  font-style: italic;
}

.message-content :deep(.inline-code) {
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #fbbf24;
}

.message-content :deep(pre) {
  background: rgba(0, 0, 0, 0.6);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-content :deep(code) {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #e5e7eb;
}

/* ===== 正在輸入指示器 ===== */
.typing-indicator {
  display: flex;
  gap: 12px;
  align-items: center;
}

.typing-dots {
  display: flex;
  gap: 6px;
  padding: 16px 20px;
  background: rgba(30, 30, 40, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* ===== 輸入區域 ===== */
.input-area {
  background: rgba(20, 20, 30, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  position: relative;
  z-index: 2;
}

.input-container {
  display: flex;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  color: #ffffff;
  font-size: 15px;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(59, 130, 246, 0.3);
}

.send-button.sending .spinner {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ===== 工具列 ===== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.clear-button {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ffffff;
}

.clear-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ===== Agent 模式標籤 ===== */
.mode-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #60a5fa;
  margin-bottom: 12px;
  width: fit-content;
}

/* ===== RAG 模式：來源文檔 ===== */
.sources-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sources-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.sources-icon {
  font-size: 16px;
}

.sources-title {
  font-size: 13px;
  font-weight: 600;
  color: #a5b4fc;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.source-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.source-item:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateX(4px);
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.source-number {
  font-size: 12px;
  font-weight: 600;
  color: #818cf8;
}

.source-score {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(99, 102, 241, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.source-content {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  max-height: 100px;
  overflow-y: auto;
  padding-right: 8px;
}

.source-content::-webkit-scrollbar {
  width: 4px;
}

.source-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.source-content::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.4);
  border-radius: 2px;
}

.source-metadata {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.source-metadata span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ===== 自動化模式：操作結果 ===== */
.action-result-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.action-icon {
  font-size: 16px;
}

.action-title {
  font-size: 13px;
  font-weight: 600;
  color: #fbbf24;
}

.action-content {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.action-item:last-child {
  margin-bottom: 0;
}

.action-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  min-width: 80px;
}

.action-value {
  font-size: 13px;
  color: #ffffff;
}

.action-type {
  background: rgba(59, 130, 246, 0.3);
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
}

.action-status {
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: capitalize;
}

.action-status.status-success {
  background: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.action-status.status-simulated {
  background: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.action-status.status-pending {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.action-status.status-failed {
  background: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.action-command {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 12px;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #a5f3fc;
  overflow-x: auto;
  white-space: nowrap;
}

.action-command::-webkit-scrollbar {
  height: 4px;
}

.action-command::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.action-command::-webkit-scrollbar-thumb {
  background: rgba(251, 191, 36, 0.4);
  border-radius: 2px;
}

.action-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 10px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.note-icon {
  flex-shrink: 0;
  font-size: 14px;
}
</style>
