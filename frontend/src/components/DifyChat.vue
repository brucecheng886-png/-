<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
    <!-- 聊天區域 -->
    <div class="flex-1 overflow-y-auto p-6 scroll-smooth" ref="chatArea">
      <!-- 歡迎訊息 -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center animate-fade-in">
        <div class="text-6xl mb-4 animate-bounce">🤖</div>
        <h2 class="text-3xl font-bold text-white mb-2">Dify AI 助手</h2>
        <p class="text-white/80 mb-8">開始對話，我會盡力協助您</p>
        
        <!-- 建議問題 -->
        <div class="flex flex-wrap gap-3 max-w-2xl justify-center">
          <button 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            @click="sendSuggestion(suggestion)"
            class="px-5 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm hover:bg-white/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- 對話訊息列表 -->
      <div v-else class="flex flex-col gap-4 max-w-4xl mx-auto">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex gap-3 animate-slide-in"
          :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
        >
          <!-- AI 頭像 -->
          <div 
            v-if="message.role === 'assistant'" 
            class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0"
          >
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
          </div>

          <!-- 訊息氣泡 -->
          <div 
            class="max-w-[70%] px-4 py-3 rounded-2xl shadow-lg backdrop-blur-md animate-bubble-in"
            :class="message.role === 'user' 
              ? 'bg-blue-500/90 text-white rounded-br-sm' 
              : 'bg-gray-800/90 text-gray-100 border border-white/10 rounded-bl-sm'"
          >
            <!-- 訊息內容 -->
            <div class="text-base leading-relaxed break-words">
              <span v-if="message.role === 'assistant' && message.typing">
                {{ message.displayText }}<span class="animate-blink">|</span>
              </span>
              <span v-else v-html="formatMessage(message.content)"></span>
            </div>
            
            <!-- 時間戳 -->
            <div class="text-xs text-white/60 mt-1.5 text-right">
              {{ message.timestamp }}
            </div>
          </div>

          <!-- 用戶頭像 -->
          <div 
            v-if="message.role === 'user'" 
            class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0"
          >
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <!-- AI 正在輸入指示器 -->
        <div v-if="isTyping" class="flex gap-3 animate-slide-in">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
          </div>
          <div class="flex gap-1 px-5 py-4 bg-gray-800/90 rounded-2xl rounded-bl-sm backdrop-blur-md border border-white/10">
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-typing"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-typing animation-delay-200"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-typing animation-delay-400"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 輸入區域 -->
    <div class="bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4">
      <div class="flex gap-3 max-w-4xl mx-auto items-end">
        <!-- 文字輸入框 -->
        <textarea
          v-model="inputMessage"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="insertNewLine"
          placeholder="輸入訊息... (Shift+Enter 換行)"
          class="flex-1 px-4 py-3 bg-gray-800/80 border border-white/20 rounded-xl text-white text-base resize-none min-h-[48px] max-h-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
          rows="1"
          ref="inputRef"
          :disabled="isSending"
        ></textarea>

        <!-- 發送按鈕 -->
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isSending"
          class="w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          :class="inputMessage.trim() && !isSending 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg shadow-indigo-500/40' 
            : 'bg-gray-700/50 text-white/50 border border-white/10'"
        >
          <svg v-if="!isSending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>

      <!-- 工具列 -->
      <div class="flex justify-between items-center max-w-4xl mx-auto mt-3 pt-3 border-t border-white/5">
        <span class="text-xs text-white/50">💡 提示：Shift + Enter 換行，Enter 發送</span>
        <button 
          @click="clearChat" 
          class="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-white/10 rounded-lg text-white/70 text-xs hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="messages.length === 0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          清空對話
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch } from 'vue';
import MarkdownIt from 'markdown-it';

// Markdown 解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

// API 基礎 URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// 對話訊息列表
const messages = ref([]);

// 輸入相關
const inputMessage = ref('');
const inputRef = ref(null);
const chatArea = ref(null);

// 狀態
const isSending = ref(false);
const isTyping = ref(false);

// Conversation ID 用於保持對話上下文
const conversationId = ref(null);

// 建議問題
const suggestions = [
  '介紹一下你自己',
  '如何使用知識圖譜？',
  '解釋 RAGFlow 的工作原理',
  '幫我生成一段代碼'
];

// 格式化時間
const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 格式化訊息內容（使用 Markdown 渲染）
const formatMessage = (content) => {
  if (!content) return '';
  
  try {
    // 使用 markdown-it 渲染
    return md.render(content);
  } catch (error) {
    console.error('Markdown 渲染錯誤:', error);
    // 降級處理：簡單的文本格式化
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br>');
  }
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
    
    // 自動滾動到底部
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
    timestamp: formatTime()
  };
  
  messages.value.push(userMessage);
  inputMessage.value = '';
  isSending.value = true;
  
  // 滾動到底部
  scrollToBottom();
  
  // 顯示 AI 正在輸入
  isTyping.value = true;
  
  try {
    // 調用後端 Dify API
    const response = await fetch(`${API_BASE_URL}/api/dify/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: trimmedMessage,
        user: 'web_user',
        conversation_id: conversationId.value,
        inputs: {}
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: '未知錯誤' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 保存 conversation_id 以維持對話上下文
    if (data.conversation_id) {
      conversationId.value = data.conversation_id;
    }
    
    // 提取 AI 回覆內容
    const aiResponse = data.answer || data.output || data.text || '抱歉，我無法理解您的問題。';
    
    isTyping.value = false;
    
    // 添加 AI 訊息（帶打字機效果）
    const aiMessage = reactive({
      role: 'assistant',
      content: '',
      displayText: '',
      typing: false,
      timestamp: formatTime()
    });
    
    messages.value.push(aiMessage);
    
    // 執行打字機效果
    await typewriterEffect(aiMessage, aiResponse);
    
    console.log('Dify API 回應:', data);
    
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
    
    let errorText = '❌ **發生錯誤**\n\n';
    
    if (error.message.includes('fetch')) {
      errorText += '無法連接到後端服務。請確認：\n\n';
      errorText += '1. FastAPI 服務是否運行在 http://127.0.0.1:8000\n';
      errorText += '2. CORS 設定是否正確\n';
      errorText += '3. Dify API 配置是否完整\n\n';
      errorText += `錯誤詳情：${error.message}`;
    } else {
      errorText += `${error.message}\n\n`;
      errorText += '請檢查 Dify API Key 和端點設定是否正確。';
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
    conversationId.value = null; // 重置對話 ID
  }
};

// 監聽輸入框高度自動調整
watch(inputMessage, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto';
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 150) + 'px';
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
/* 自定義動畫 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bubble-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.animate-bubble-in {
  animation: bubble-in 0.3s ease-out;
}

.animate-blink {
  animation: blink 1s infinite;
}

.animate-typing {
  animation: typing 1.4s infinite;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

/* 自定義滾動條 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 訊息內容樣式 - Markdown 渲染支持 */
:deep(strong) {
  font-weight: 700;
  color: #ffffff;
}

:deep(em) {
  font-style: italic;
  color: #e5e7eb;
}

:deep(.inline-code) {
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #fbbf24;
}

:deep(code) {
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #fbbf24;
}

:deep(pre) {
  background: rgba(0, 0, 0, 0.6);
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(pre code) {
  background: transparent;
  padding: 0;
  color: #e5e7eb;
  font-size: 0.875em;
  line-height: 1.5;
}

:deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
  list-style-type: disc;
}

:deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
  list-style-type: decimal;
}

:deep(li) {
  margin: 4px 0;
  line-height: 1.6;
}

:deep(p) {
  margin: 8px 0;
  line-height: 1.6;
}

:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  font-weight: 700;
  margin: 12px 0 8px 0;
  color: #ffffff;
}

:deep(h1) { font-size: 1.5em; }
:deep(h2) { font-size: 1.3em; }
:deep(h3) { font-size: 1.1em; }

:deep(blockquote) {
  border-left: 4px solid rgba(59, 130, 246, 0.5);
  padding-left: 12px;
  margin: 8px 0;
  color: #9ca3af;
  font-style: italic;
}

:deep(a) {
  color: #60a5fa;
  text-decoration: underline;
  transition: color 0.2s;
}

:deep(a:hover) {
  color: #93c5fd;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
  font-size: 0.9em;
}

:deep(th), :deep(td) {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  text-align: left;
}

:deep(th) {
  background: rgba(59, 130, 246, 0.3);
  font-weight: 600;
}

:deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 16px 0;
}
</style>

<style>
/* 全局滾動條樣式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.3s;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>

  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-content :deep(strong) {
  font-weight: 600;
  color: #ffffff;
}

.message-content :deep(em) {
  font-style: italic;
}

.message-content :deep(.inline-code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 6px;
  text-align: right;
}

/* 打字機游標 */
.typing-cursor {
  animation: blink 1s infinite;
  font-weight: 100;
}

/* 正在輸入指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
  background: rgba(30, 30, 40, 0.9);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

/* ===== 輸入區域 ===== */
.input-area {
  background: rgba(20, 20, 30, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
}

.input-container {
  display: flex;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(30, 30, 40, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #ffffff;
  font-size: 15px;
  resize: none;
  min-height: 48px;
  max-height: 150px;
  transition: all 0.3s;
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
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
  background: rgba(100, 100, 120, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.send-button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

/* 工具列 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 12px auto 0;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.toolbar-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.toolbar-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.toolbar-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ===== 滾動條樣式 ===== */
.chat-area::-webkit-scrollbar {
  width: 8px;
}

.chat-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.chat-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.chat-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* ===== 動畫 ===== */
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

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
