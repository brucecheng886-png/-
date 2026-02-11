<template>
  <transition name="slide-in">
    <div v-if="show" class="ai-copilot">
      <!-- 頂部標題列 -->
      <div class="copilot-header">
        <div class="header-left">
          <span class="ai-avatar">🤖</span>
          <div class="header-info">
            <h3 class="header-title">AI 助手</h3>
            <p class="header-status">
              <span class="status-dot"></span>
              線上服務中
            </p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')" title="關閉">
          ✕
        </button>
      </div>

      <!-- 對話區域 -->
      <div class="chat-area" ref="chatArea">
        <!-- 歡迎畫面 -->
        <div v-if="messages.length === 0" class="welcome-section">
          <div class="welcome-icon">✨</div>
          <h4 class="welcome-title">嗨！我是 AI 助手</h4>
          <p class="welcome-subtitle">有什麼需要幫助的嗎？</p>
        </div>

        <!-- 訊息列表 -->
        <div v-else class="messages-list">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-item"
            :class="message.role === 'user' ? 'user-message' : 'ai-message'"
          >
            <!-- 訊息氣泡 -->
            <div class="message-bubble">
              <!-- AI 模式標籤 -->
              <div v-if="message.role === 'assistant' && message.modeLabel" class="mode-badge">
                {{ message.modeLabel }}
              </div>
              
              <!-- 訊息內容 -->
              <div class="message-content">
                <!-- 打字機效果 -->
                <span v-if="message.typing">
                  {{ message.displayText }}<span class="cursor">|</span>
                </span>
                <!-- 完整內容 (支援 Markdown) -->
                <span v-else v-html="formatMessage(message.content)"></span>
              </div>
              
              <!-- 時間戳 -->
              <div class="message-time">{{ message.timestamp }}</div>
            </div>
          </div>
        </div>

        <!-- AI 正在輸入 -->
        <div v-if="isTyping" class="typing-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <!-- 輸入區域 -->
      <div class="input-area">
        <textarea
          ref="inputRef"
          v-model="inputMessage"
          class="input-box"
          placeholder="輸入訊息... (Shift + Enter 換行)"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="insertNewLine"
          rows="1"
        ></textarea>
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isSending"
          :title="isSending ? '發送中...' : '發送訊息'"
        >
          <span v-if="!isSending">📤</span>
          <span v-else class="spinner">⏳</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue';
import { authFetch } from '../services/apiClient';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['close']);

// API 配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
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
  const delay = 20; // 更快的打字速度
  
  for (let i = 0; i < chars.length; i++) {
    message.displayText += chars[i];
    await new Promise(resolve => setTimeout(resolve, delay));
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
    // 調用 Agent API
    const response = await authFetch(`${API_BASE_URL}/api/dify/agent/chat`, {
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
    
    // 添加模式標籤
    let modeLabel = '';
    if (data.detected_intent === 'rag') {
      modeLabel = '📚 知識檢索';
    } else if (data.detected_intent === 'automation') {
      modeLabel = '🔧 自動化';
    } else if (data.detected_intent === 'chat') {
      modeLabel = '💬 閒聊';
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
      modeLabel: modeLabel
    });
    
    messages.value.push(aiMessage);
    
    // 執行打字機效果
    await typewriterEffect(aiMessage, aiResponse);
    
    console.log('AI 回應:', data);
    
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
    
    const errorMsg = error.message || '未知錯誤';
    let errorText = `❌ **發生錯誤**\n\n${errorMsg}`;
    
    await typewriterEffect(errorMessage, errorText);
    
  } finally {
    isSending.value = false;
    scrollToBottom();
  }
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
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 80) + 'px';
    }
  });
});

// 監聽顯示狀態，顯示時聚焦輸入框
watch(() => props.show, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus();
      }
    });
  }
});
</script>

<style scoped>
/* ===== AI Copilot 容器 ===== */
.ai-copilot {
  position: fixed;
  top: 80px;
  right: 16px;
  bottom: 16px;
  width: 420px;
  max-width: 90vw;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 2px solid var(--primary-blue);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 80px rgba(68, 138, 255, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 50;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 滑入動畫 */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-in-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* ===== 頂部標題列 ===== */
.copilot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(68, 138, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  font-size: 32px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-status {
  margin: 0;
  font-size: 12px;
  color: var(--success-green);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success-green);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(0, 194, 168, 0.7);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 4px rgba(0, 194, 168, 0);
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(200, 200, 200, 0.2);
  border-radius: 8px;
  color: rgba(100, 100, 100, 0.8);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(200, 200, 200, 0.3);
  color: rgba(80, 80, 80, 1);
}

/* Dark mode 調整 */
@media (prefers-color-scheme: dark) {
  .close-btn {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 1);
  }
}

/* ===== 對話區域 ===== */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 自定義滾動條 */
.chat-area::-webkit-scrollbar {
  width: 6px;
}

.chat-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.chat-area::-webkit-scrollbar-thumb {
  background: rgba(68, 138, 255, 0.3);
  border-radius: 3px;
}

.chat-area::-webkit-scrollbar-thumb:hover {
  background: rgba(68, 138, 255, 0.5);
}

/* ===== 歡迎區域 ===== */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
}

.welcome-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* ===== 訊息列表 ===== */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.user-message .message-bubble {
  background: linear-gradient(135deg, var(--primary-blue), #5a9eff);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message .message-bubble {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom-left-radius: 4px;
}

/* 模式標籤 */
.mode-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(68, 138, 255, 0.2);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--primary-blue);
  margin-bottom: 8px;
}

/* 訊息內容 */
.message-content {
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-content :deep(strong) {
  font-weight: 700;
}

.message-content :deep(em) {
  font-style: italic;
}

.message-content :deep(.inline-code) {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.message-content :deep(pre) {
  margin: 8px 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  overflow-x: auto;
}

.message-content :deep(code) {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.4;
}

/* 游標閃爍 */
.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 時間戳 */
.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
  text-align: right;
}

/* AI 正在輸入 */
.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: fit-content;
  border-bottom-left-radius: 4px;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-blue);
  animation: typing 1.4s infinite;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* ===== 輸入區域 ===== */
.input-area {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.input-box {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: none;
  max-height: 80px;
  overflow-y: auto;
  transition: all 0.2s ease;
}

.input-box:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: rgba(255, 255, 255, 0.15);
}

.input-box::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border: none;
  background: linear-gradient(135deg, var(--primary-blue), #5a9eff);
  border-radius: 12px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(68, 138, 255, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ===== 響應式設計 ===== */
@media (max-width: 768px) {
  .ai-copilot {
    top: 60px;
    right: 8px;
    bottom: 8px;
    width: calc(100vw - 16px);
  }
}
</style>
