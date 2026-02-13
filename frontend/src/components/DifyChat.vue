<template>
  <div class="flex flex-col h-full" style="background: var(--bg-main);">

    <!-- ===== 聊天標題列 ===== -->
    <div class="px-5 py-3 flex items-center justify-between flex-shrink-0" style="border-bottom: 1px solid rgba(148, 163, 184, 0.08); background: rgba(11, 18, 34, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: var(--primary-blue); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
          <svg class="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-white m-0">BruV AI 助手</h3>
          <p class="text-xs text-gray-400 m-0">Powered by Dify</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- 連線狀態 -->
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs" :class="connectionStatus === 'connected' ? 'bg-green-500/10 text-green-400' : connectionStatus === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'">
          <span class="w-1.5 h-1.5 rounded-full" :class="connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'"></span>
          {{ connectionStatus === 'connected' ? '已連線' : connectionStatus === 'error' ? '離線' : '連線中...' }}
        </div>
        <!-- 清空按鈕 -->
        <button
          @click="clearConversation"
          class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="清空對話"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ===== 訊息區域 ===== -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
      <div class="max-w-3xl mx-auto space-y-5">

        <!-- 歡迎訊息 -->
        <div v-if="messages.length === 0" class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.12);">
            <svg class="w-10 h-10" style="color: var(--accent-blue);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-white mb-2">歡迎使用 BruV AI 助手</h2>
          <p class="text-sm text-gray-400 mb-8 max-w-md mx-auto">我可以協助你查詢知識庫、分析圖譜資料，或回答各種問題。試試看吧！</p>

          <!-- 建議問題 -->
          <div class="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="sendMessage(suggestion)"
              class="suggestion-btn px-4 py-2 text-sm border text-gray-300 rounded-xl transition-all"
            >{{ suggestion }}</button>
          </div>
        </div>

        <!-- 訊息列表 -->
        <div v-for="(msg, index) in messages" :key="index" class="flex gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
          <!-- 頭像 -->
          <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            :class="msg.role === 'user' ? 'bg-blue-500' : ''" :style="msg.role !== 'user' ? 'background: var(--primary-blue);' : ''">
            <svg v-if="msg.role === 'user'" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          </div>

          <!-- 訊息氣泡 -->
          <div class="max-w-[75%] min-w-0">
            <div
              class="px-4 py-3 rounded-2xl text-sm leading-relaxed"
              :class="msg.role === 'user'
                ? 'bg-blue-500/90 text-white rounded-tr-sm'
                : 'text-gray-200 rounded-tl-sm'"
              :style="msg.role !== 'user' ? 'background: var(--bg-surface); border: 1px solid ' + 'rgba(148, 163, 184, 0.1)' : ''"
            >
              <!-- Markdown 渲染 -->
              <div v-if="msg.role === 'assistant'" class="prose-chat" v-html="renderMarkdown(msg.content)"></div>
              <div v-else>{{ msg.content }}</div>
            </div>
            <div class="mt-1 text-xs text-gray-500 px-1" :class="msg.role === 'user' ? 'text-right' : ''">
              {{ formatTime(msg.timestamp) }}
            </div>
          </div>
        </div>

        <!-- Thinking 指示器 -->
        <div v-if="isLoading" class="flex gap-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--primary-blue);">
            <svg class="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          </div>
          <div class="px-4 py-3 rounded-2xl rounded-tl-sm" style="background: var(--bg-surface); border: 1px solid rgba(148, 163, 184, 0.1);">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              <span class="ml-2 text-xs text-gray-400">思考中...</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ===== 輸入區域 ===== -->
    <div class="px-4 py-4 flex-shrink-0" style="border-top: 1px solid rgba(148, 163, 184, 0.08); background: rgba(11, 18, 34, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);">
      <div class="max-w-3xl mx-auto">
        <div class="flex gap-3 items-end">
          <div class="flex-1 relative">
            <textarea
              ref="inputRef"
              v-model="inputText"
              @keydown="handleKeydown"
              :disabled="isLoading"
              rows="1"
              placeholder="輸入訊息… (Enter 發送，Shift+Enter 換行)"
              class="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-all resize-none disabled:opacity-50 custom-scrollbar"
              style="background: rgba(148, 163, 184, 0.04); border: 1px solid rgba(148, 163, 184, 0.1); max-height: 160px;"
            ></textarea>
          </div>
          <button
            @click="sendMessage()"
            :disabled="isLoading || !inputText.trim()"
            class="h-[44px] px-5 text-white rounded-xl transition-all flex items-center gap-2 font-semibold text-sm disabled:cursor-not-allowed flex-shrink-0"
            :style="isLoading || !inputText.trim() ? 'background: var(--bg-elevated); opacity: 0.5;' : 'background: var(--primary-blue); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);'"
          >
            <svg v-if="!isLoading" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-linecap="round"/>
            </svg>
            發送
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2 text-center">AI 回覆僅供參考，重要決策請自行驗證。</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import { authFetch } from '../services/apiClient';
import MarkdownIt from 'markdown-it';

// ===== Markdown 渲染器 =====
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
});

// ===== State =====
const messages = ref([]);
const inputText = ref('');
const isLoading = ref(false);
const conversationId = ref(null);
const connectionStatus = ref('connected'); // 'connected' | 'connecting' | 'error'
const messagesContainer = ref(null);
const inputRef = ref(null);

// 建議問題
const suggestions = [
  '📚 幫我總結知識庫的內容',
  '🔍 最近新增了哪些知識節點？',
  '💡 如何建立圖譜之間的關聯？',
  '🤖 你能做什麼？'
];

// ===== Methods =====

/**
 * 發送訊息到 Dify
 */
const sendMessage = async (text) => {
  const query = text || inputText.value.trim();
  if (!query || isLoading.value) return;

  // 加入使用者訊息
  messages.value.push({
    role: 'user',
    content: query,
    timestamp: new Date()
  });

  inputText.value = '';
  isLoading.value = true;
  connectionStatus.value = 'connecting';
  autoResize();
  await scrollToBottom();

  try {
    const response = await authFetch('/api/dify/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        user: 'web_user',
        conversation_id: conversationId.value,
        inputs: {}
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}`);
    }

    // 儲存 conversation_id 以維持上下文
    if (data.conversation_id) {
      conversationId.value = data.conversation_id;
    }

    // 取得 AI 回覆
    const answer = data.answer || data.message || '（無回覆內容）';

    // 打字機效果
    const aiMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    messages.value.push(aiMessage);

    await typewriterEffect(messages.value.length - 1, answer);
    connectionStatus.value = 'connected';

  } catch (error) {
    console.error('❌ Dify 聊天錯誤:', error);
    connectionStatus.value = 'error';

    messages.value.push({
      role: 'assistant',
      content: `⚠️ **發生錯誤**\n\n${error.message}\n\n請確認 Dify 服務正在運行，並檢查 API Key 設定。`,
      timestamp: new Date()
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
    inputRef.value?.focus();
  }
};

/**
 * 打字機逐字效果
 */
const typewriterEffect = async (messageIndex, fullText) => {
  const delay = 25;
  for (let i = 0; i <= fullText.length; i++) {
    if (messages.value[messageIndex]) {
      messages.value[messageIndex].content = fullText.substring(0, i);
    }
    if (i % 5 === 0) await scrollToBottom(); // 每 5 字滾動
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  await scrollToBottom();
};

/**
 * Markdown 渲染
 */
const renderMarkdown = (text) => {
  if (!text) return '';
  return md.render(text);
};

/**
 * 鍵盤事件
 */
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
  // Shift+Enter 自然換行
};

/**
 * 自動調整 textarea 高度
 */
const autoResize = () => {
  nextTick(() => {
    const el = inputRef.value;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  });
};
watch(inputText, autoResize);

/**
 * 滾動到最新訊息
 */
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

/**
 * 清空對話
 */
const clearConversation = () => {
  messages.value = [];
  conversationId.value = null;
  connectionStatus.value = 'connected';
};

/**
 * 格式化時間
 */
const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
};

// ===== Lifecycle =====
onMounted(() => {
  inputRef.value?.focus();
});
</script>

<style scoped>
/* 建議按鈕 */
.suggestion-btn {
  background: rgba(148, 163, 184, 0.04);
  border-color: rgba(148, 163, 184, 0.1);
}
.suggestion-btn:hover {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.2);
}

/* 自定義滾動條 */
.custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(148, 163, 184, 0.15) transparent; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.15); border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.25); }

/* Markdown 渲染樣式 */
.prose-chat { word-break: break-word; }
.prose-chat :deep(h1) { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0.75rem 0 0.5rem; }
.prose-chat :deep(h2) { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0.75rem 0 0.5rem; }
.prose-chat :deep(h3) { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0.5rem 0 0.25rem; }
.prose-chat :deep(p) { margin: 0.5rem 0; line-height: 1.7; }
.prose-chat :deep(ul), .prose-chat :deep(ol) { margin: 0.5rem 0; padding-left: 1.5rem; }
.prose-chat :deep(li) { margin: 0.25rem 0; line-height: 1.6; }
.prose-chat :deep(code) { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.85em; }
.prose-chat :deep(pre) { background: var(--bg-void); border: 1px solid var(--border-primary); border-radius: 0.5rem; padding: 0.75rem 1rem; overflow-x: auto; margin: 0.75rem 0; }
.prose-chat :deep(pre code) { background: none; padding: 0; color: #e6edf3; font-size: 0.82em; }
.prose-chat :deep(blockquote) { border-left: 3px solid rgba(59, 130, 246, 0.3); padding-left: 0.75rem; color: var(--text-secondary); margin: 0.5rem 0; font-style: italic; }
.prose-chat :deep(a) { color: var(--accent-blue); text-decoration: underline; text-underline-offset: 2px; }
.prose-chat :deep(a:hover) { color: #93bbfd; }
.prose-chat :deep(table) { border-collapse: collapse; margin: 0.5rem 0; width: 100%; font-size: 0.85em; }
.prose-chat :deep(th), .prose-chat :deep(td) { border: 1px solid var(--border-primary); padding: 0.4rem 0.6rem; }
.prose-chat :deep(th) { background: rgba(59, 130, 246, 0.06); font-weight: 600; color: var(--text-primary); }
.prose-chat :deep(strong) { color: var(--text-primary); font-weight: 600; }
.prose-chat :deep(em) { color: var(--accent-blue); }
.prose-chat :deep(hr) { border-color: var(--border-primary); margin: 1rem 0; }

/* 跳動點動畫 */
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
