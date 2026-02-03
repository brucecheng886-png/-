<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// ===== Props =====
const props = defineProps({
  data: {
    type: Object,
    default: () => ({ command: '', cwd: '~' })
  }
});

// ===== State =====
const command = ref('');
const currentDir = ref('~');
const outputLines = ref([
  { type: 'system', content: '<span style="color: #335eea;">System initialized successfully</span>' },
  { type: 'system', content: '<span style="color: #888888;">Type "help" for available commands</span>' },
  { type: 'info', content: '---' }
]);
const isExecuting = ref(false);
const commandHistory = ref([]);
const historyIndex = ref(-1);
const outputRef = ref(null);
const inputRef = ref(null);

// 支援的命令
const supportedCommands = {
  help: () => {
    return [
      { type: 'success', content: '<span style="color: #335eea; font-weight: bold;">═══ AVAILABLE COMMANDS ═══</span>' },
      { type: 'info', content: '<span style="color: #e5e5e5;">  help</span>     - Display this help message' },
      { type: 'info', content: '<span style="color: #e5e5e5;">  clear</span>    - Clear terminal screen' },
      { type: 'info', content: '<span style="color: #e5e5e5;">  pwd</span>      - Print working directory' },
      { type: 'info', content: '<span style="color: #e5e5e5;">  ls</span>       - List files and directories' },
      { type: 'info', content: '<span style="color: #e5e5e5;">  docker</span>   - Docker commands (ps, compose)' },
      { type: 'info', content: '<span style="color: #e5e5e5;">  echo</span>     - Echo text to terminal' },
      { type: 'info', content: '<span style="color: #e5e5e5;">  status</span>   - System status check' }
    ];
  },
  
  clear: () => {
    outputLines.value = [];
    return [];
  },
  
  pwd: () => {
    return [{ type: 'output', content: `<span style="color: #ffffff;">${currentDir.value}</span>` }];
  },
  
  ls: () => {
    return [
      { type: 'output', content: '<span style="color: #888888;">drwxr-xr-x</span> <span style="color: #335eea;">backend/</span>' },
      { type: 'output', content: '<span style="color: #888888;">drwxr-xr-x</span> <span style="color: #335eea;">frontend/</span>' },
      { type: 'output', content: '<span style="color: #888888;">-rw-r--r--</span> <span style="color: #e5e5e5;">docker-compose.yml</span>' },
      { type: 'output', content: '<span style="color: #888888;">-rw-r--r--</span> <span style="color: #e5e5e5;">launcher.py</span>' },
      { type: 'output', content: '<span style="color: #888888;">-rw-r--r--</span> <span style="color: #e5e5e5;">README.md</span>' }
    ];
  },
  
  docker: (args) => {
    if (args.includes('ps')) {
      return [
        { type: 'output', content: '<span style="color: #335eea; font-weight: bold;">CONTAINER ID   IMAGE              STATUS         PORTS</span>' },
        { type: 'output', content: '<span style="color: #888888;">a1b2c3d4e5f6</span>   <span style="color: #e5e5e5;">ragflow:latest</span>     <span style="color: #00c2a8;">Up 2 hours</span>     <span style="color: #ff8e3c;">0.0.0.0:81->80/tcp</span>' },
        { type: 'output', content: '<span style="color: #888888;">f6e5d4c3b2a1</span>   <span style="color: #e5e5e5;">dify-api:latest</span>    <span style="color: #00c2a8;">Up 2 hours</span>     <span style="color: #ff8e3c;">0.0.0.0:80->80/tcp</span>' },
        { type: 'output', content: '<span style="color: #888888;">1a2b3c4d5e6f</span>   <span style="color: #e5e5e5;">postgres:15</span>        <span style="color: #00c2a8;">Up 2 hours</span>     <span style="color: #ff8e3c;">5432/tcp</span>' }
      ];
    } else if (args.includes('compose')) {
      return [
        { type: 'success', content: '<span style="color: #00c2a8;">[✓] Docker Compose command executed successfully</span>' },
        { type: 'info', content: '<span style="color: #888888;">Services are running normally</span>' }
      ];
    }
    return [{ type: 'info', content: '<span style="color: #ff8e3c;">Docker simulator - Try: docker ps</span>' }];
  },
  
  echo: (args) => {
    return [{ type: 'output', content: `<span style="color: #ffffff;">${args.join(' ')}</span>` }];
  },
  
  status: () => {
    return [
      { type: 'success', content: '<span style="color: #335eea; font-weight: bold;">═══ SYSTEM STATUS ═══</span>' },
      { type: 'output', content: '<span style="color: #00c2a8;">[✓]</span> <span style="color: #e5e5e5;">CPU: 23%</span>' },
      { type: 'output', content: '<span style="color: #00c2a8;">[✓]</span> <span style="color: #e5e5e5;">Memory: 45%</span>' },
      { type: 'output', content: '<span style="color: #00c2a8;">[✓]</span> <span style="color: #e5e5e5;">RAGFlow: ONLINE</span>' },
      { type: 'output', content: '<span style="color: #00c2a8;">[✓]</span> <span style="color: #e5e5e5;">Dify: ONLINE</span>' },
      { type: 'output', content: '<span style="color: #00c2a8;">[✓]</span> <span style="color: #e5e5e5;">Docker: RUNNING</span>' }
    ];
  }
};

// ===== Watch =====
watch(() => props.data, (newData) => {
  if (newData) {
    if (newData.command) {
      command.value = newData.command;
    }
    if (newData.cwd) {
      currentDir.value = newData.cwd;
    }
  }
}, { deep: true, immediate: true });

// ===== Methods =====
const executeCommand = async () => {
  const cmd = command.value.trim();
  if (!cmd || isExecuting.value) return;
  
  // 添加命令到輸出
  outputLines.value.push({
    type: 'command',
    content: cmd
  });
  
  // 添加到歷史
  commandHistory.value.push(cmd);
  historyIndex.value = commandHistory.value.length;
  
  // 清空輸入
  command.value = '';
  isExecuting.value = true;
  
  // 模擬執行延遲
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // 解析命令
  const parts = cmd.split(' ');
  const baseCmd = parts[0];
  const args = parts.slice(1);
  
  // 執行命令
  if (supportedCommands[baseCmd]) {
    const result = supportedCommands[baseCmd](args);
    outputLines.value.push(...result);
  } else {
    outputLines.value.push({
      type: 'error',
      content: `<span style="color: #ff0000;">[ERROR] Command not found: ${baseCmd}</span>`
    });
    outputLines.value.push({
      type: 'info',
      content: '<span style="color: #ffff00;">Type "help" to see available commands</span>'
    });
  }
  
  isExecuting.value = false;
  
  // 滾動到底部
  await nextTick();
  scrollToBottom();
};

const clearTerminal = () => {
  outputLines.value = [];
  ElMessage.success('終端已清空');
};

const copyOutput = () => {
  const text = outputLines.value
    .map(line => {
      const temp = document.createElement('div');
      temp.innerHTML = line.content;
      return temp.textContent || temp.innerText || '';
    })
    .join('\n');
  
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已複製到剪貼簿');
  });
};

const historyUp = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--;
    command.value = commandHistory.value[historyIndex.value];
  }
};

const historyDown = () => {
  if (historyIndex.value < commandHistory.value.length - 1) {
    historyIndex.value++;
    command.value = commandHistory.value[historyIndex.value];
  } else {
    historyIndex.value = commandHistory.value.length;
    command.value = '';
  }
};

const scrollToBottom = () => {
  if (outputRef.value) {
    outputRef.value.scrollTop = outputRef.value.scrollHeight;
  }
};

// ===== Lifecycle =====
onMounted(() => {
  if (props.data?.command) {
    command.value = props.data.command;
  }
  
  // 自動聚焦輸入框
  if (inputRef.value) {
    inputRef.value.focus();
  }
});
</script>

<template>
  <div class="terminal-panel">
    <!-- Cyberpunk 終端頭部 -->
    <div class="terminal-header">
      <div class="header-left">
        <span class="terminal-icon">💻</span>
        <div class="terminal-info">
          <span class="terminal-title">CYBER TERMINAL</span>
          <span class="terminal-cwd">{{ currentDir }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="status-indicators">
          <span class="indicator online" title="ONLINE"></span>
          <span class="indicator-label">ONLINE</span>
        </div>
        <button class="cyber-header-btn" @click="clearTerminal" title="清空">
          <span class="btn-icon">🗑️</span>
        </button>
        <button class="cyber-header-btn" @click="copyOutput" title="複製">
          <span class="btn-icon">📋</span>
        </button>
      </div>
    </div>
    
    <!-- 終端輸出區域 -->
    <div class="terminal-output" ref="outputRef">
      <!-- 啟動橫幅 -->
      <div class="boot-banner">
        <pre class="banner-text">
╔═══════════════════════════════════════════════════╗
║   BruV AI CYBER TERMINAL v2.0                     ║
║   System Ready - Awaiting Commands                ║
╚═══════════════════════════════════════════════════╝
        </pre>
      </div>
      
      <!-- 輸出行 -->
      <div 
        v-for="(line, index) in outputLines" 
        :key="index"
        :class="['output-line', line.type]"
      >
        <span v-if="line.type === 'command'" class="prompt">
          <span class="prompt-user">user</span>
          <span class="prompt-separator">@</span>
          <span class="prompt-host">bruv-ai</span>
          <span class="prompt-colon">:</span>
          <span class="prompt-path">{{ currentDir }}</span>
          <span class="prompt-symbol">$</span>
        </span>
        <span class="line-content" v-html="line.content"></span>
      </div>
      
      <!-- 執行中指示器 -->
      <div v-if="isExecuting" class="executing-line">
        <span class="exec-spinner">[</span>
        <span class="exec-dots">...</span>
        <span class="exec-spinner">]</span>
        <span class="exec-text">EXECUTING...</span>
      </div>
    </div>
    
    <!-- 終端輸入區域 -->
    <div class="terminal-input-area">
      <div class="input-line">
        <span class="input-prompt">
          <span class="prompt-user">user</span>
          <span class="prompt-separator">@</span>
          <span class="prompt-host">bruv-ai</span>
          <span class="prompt-colon">:</span>
          <span class="prompt-path">{{ currentDir }}</span>
          <span class="prompt-symbol">$</span>
        </span>
        <input 
          v-model="command"
          @keydown.enter="executeCommand"
          @keydown.up="historyUp"
          @keydown.down="historyDown"
          type="text"
          class="command-input"
          placeholder="輸入命令..."
          :disabled="isExecuting"
          ref="inputRef"
        />
      </div>
      
      <!-- 命令提示 -->
      <div class="command-hints">
        <span class="hint-text">提示: help | clear | docker ps | ls</span>
        <span class="hint-shortcut">↑↓ 歷史記錄</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-void);           /* 純黑終端背景 */
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  border-radius: 12px;
}

/* ===== 終端頭部 (Anytype 風格) ===== */
.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-primary);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.terminal-icon {
  font-size: 20px;
  opacity: 0.9;
}

.terminal-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.terminal-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.terminal-cwd {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger-red);
}

.indicator.online {
  background: var(--success-green);
}

.indicator-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #00ff00;
}

.cyber-header-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 3px;
  color: #00ff00;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cyber-header-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  border-color: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

/* ===== 終端輸出區域 ===== */
.terminal-output {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #000000;
  color: #00ff00;
  font-size: 13px;
  line-height: 1.6;
  position: relative;
}

.terminal-output::-webkit-scrollbar {
  width: 8px;
}

.terminal-output::-webkit-scrollbar-track {
  background: rgba(0, 255, 0, 0.05);
}

.terminal-output::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 0, 0.3);
  border-radius: 4px;
}

.terminal-output::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 0, 0.5);
}

/* 啟動橫幅 */
.boot-banner {
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
  padding-bottom: 12px;
}

.banner-text {
  color: #00ff00;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  margin: 0;
  font-size: 12px;
}

/* 輸出行 */
.output-line {
  margin-bottom: 4px;
  word-wrap: break-word;
}

.output-line.command {
  margin-top: 8px;
  margin-bottom: 4px;
}

.output-line.output {
  color: #ffffff;
}

.output-line.success {
  color: #00ff00;
}

.output-line.error {
  color: #ff0000;
}

.output-line.info {
  color: #00ffff;
}

.output-line.system {
  color: #ffff00;
}

/* 提示符 */
.prompt {
  font-weight: 700;
  margin-right: 8px;
}

.prompt-user {
  color: #00ff00;
}

.prompt-separator {
  color: rgba(255, 255, 255, 0.5);
}

.prompt-host {
  color: #00ffff;
}

.prompt-colon {
  color: rgba(255, 255, 255, 0.5);
}

.prompt-path {
  color: #ffff00;
}

.prompt-symbol {
  color: #00ff00;
  margin-left: 4px;
}

.line-content {
  color: #ffffff;
}

/* 執行中行 */
.executing-line {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffff00;
  margin-top: 8px;
}

.exec-spinner {
  animation: blink 1s steps(2) infinite;
}

.exec-dots {
  animation: dots 1.5s steps(4) infinite;
}

.exec-text {
  font-weight: 700;
  letter-spacing: 1px;
}

@keyframes blink {
  50% { opacity: 0; }
}

@keyframes dots {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}

/* ===== 終端輸入區域 ===== */
.terminal-input-area {
  background: var(--bg-surface);
  border-top: 1px solid var(--border-primary);
  padding: 12px 16px;
}

.input-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.input-prompt {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
}

.command-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.command-input:focus {
  background: var(--bg-hover);
  border-color: var(--primary-blue);
}

.command-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.command-input::placeholder {
  color: var(--text-tertiary);
}

/* 命令提示 */
.command-hints {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: var(--text-tertiary);
}

.hint-shortcut {
  color: var(--accent-orange);
}
</style>
