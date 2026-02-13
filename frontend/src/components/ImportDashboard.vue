<script setup>
import { ref, computed } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import { ElMessage } from 'element-plus';

const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

const fileInputRef = ref(null);
const importMode = ref('single'); // 'single' 或 'multi'

// 切換導入模式
function toggleImportMode(mode) {
  importMode.value = mode;
}

// 觸發檔案選擇
function triggerFile() {
  fileInputRef.value?.click();
}

// 處理檔案選擇
async function onFileChange(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;
  
  event.target.value = ''; // 重置 input
  
  for (const file of files) {
    await graphStore.importFile(file, importMode.value);
  }
  
  if (importMode.value === 'single') {
    ElMessage.success(`成功匯入 ${files.length} 個檔案`);
  } else {
    ElMessage.info('Excel 匯入任務已啟動，請等待處理完成');
  }
}

// 拖放處理
function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

async function handleDrop(event) {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  if (files.length === 0) return;
  
  for (const file of files) {
    await graphStore.importFile(file, importMode.value);
  }
  
  if (importMode.value === 'single') {
    ElMessage.success(`成功匯入 ${files.length} 個檔案`);
  } else {
    ElMessage.info('Excel 匯入任務已啟動');
  }
}

// 點擊檔案卡片
function handleFileClick(file) {
  if (file.nodeId) {
    graphStore.focusNode(file.nodeId);
  }
}

// 刪除檔案
function handleDeleteFile(file, event) {
  event.stopPropagation(); // 防止觸發 click 事件
  
  // 從圖譜中移除節點
  if (file.nodeId) {
    graphStore.deleteNode(file.nodeId);
  }
  
  // 從匯入列表中移除
  const index = graphStore.importedFiles.findIndex(f => f.id === file.id);
  if (index !== -1) {
    graphStore.importedFiles.splice(index, 1);
    ElMessage.success('已刪除檔案');
  }
}

// 獲取檔案擴展名
function getFileExt(filename) {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
}

// 獲取檔案類型顏色
function getFileColor(ext) {
  const colorMap = {
    'PDF': 'bg-red-900/50 text-red-400',
    'DOC': 'bg-blue-900/50 text-blue-400',
    'DOCX': 'bg-blue-900/50 text-blue-400',
    'XLS': 'bg-green-900/50 text-green-400',
    'XLSX': 'bg-green-900/50 text-green-400',
    'CSV': 'bg-green-900/50 text-green-400',
    'PPT': 'bg-orange-900/50 text-orange-400',
    'PPTX': 'bg-orange-900/50 text-orange-400',
    'TXT': 'bg-gray-800/50 text-gray-400',
    'MD': 'bg-purple-900/50 text-purple-400'
  };
  return colorMap[ext] || 'bg-blue-900/50 text-blue-400';
}

// 檢查節點是否被選中
function isNodeSelected(file) {
  return graphStore.selectedNode?.id === file.nodeId;
}

// 計算進度條文字
const progressText = computed(() => {
  const d = graphStore.importDetail;
  if (graphStore.importStatus === 'running') {
    return `處理中 ${d.completed}/${d.total} 筆`;
  }
  if (graphStore.importStatus === 'done') {
    const elapsed = d.elapsed_seconds ? ` (${formatTime(d.elapsed_seconds)})` : '';
    return `✅ 完成！共 ${d.completed} 筆 (失敗 ${d.failed})${elapsed}`;
  }
  if (graphStore.importStatus === 'error') {
    return `❌ 匯入失敗`;
  }
  return '';
});

// ETA 格式化
const etaText = computed(() => {
  const d = graphStore.importDetail;
  if (graphStore.importStatus !== 'running') return '';
  const parts = [];
  if (d.eta_seconds != null && d.eta_seconds > 0) {
    parts.push(`預估剩餘 ${formatTime(d.eta_seconds)}`);
  }
  if (d.rows_per_sec > 0) {
    parts.push(`${d.rows_per_sec} 筆/秒`);
  }
  if (d.total_batches > 0) {
    parts.push(`批次 ${d.completed_batches}/${d.total_batches}`);
  }
  return parts.join(' · ');
});

// 大量模式標籤
const modeLabel = computed(() => {
  const d = graphStore.importDetail;
  if (!d.fast_mode) return '';
  return '⚡ 快速模式';
});

// 時間格式化
function formatTime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m${s}s`;
}

// 進度條顏色
const progressBarClass = computed(() => {
  if (graphStore.importStatus === 'done') return 'bg-emerald-500';
  if (graphStore.importStatus === 'error') return 'bg-red-500';
  return 'bg-blue-500';
});

// 是否顯示進度區塊
const showProgress = computed(() => {
  return ['running', 'done', 'error'].includes(graphStore.importStatus);
});
</script>

<template>
  <div class="import-dashboard flex flex-col h-full">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-bold text-white">
        知識來源匯入 
        <span class="text-xs font-normal text-gray-400 ml-2">(AI 智慧解析)</span>
      </h3>
      <span 
        v-if="graphStore.importedFiles.length > 0"
        class="px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-bold rounded-full"
      >
        {{ graphStore.importedFiles.length }}
      </span>
    </div>
    
    <!-- 導入模式選擇 -->
    <div class="mb-3 flex items-center gap-2">
      <span class="text-xs text-gray-400">導入模式：</span>
      <button
        @click="toggleImportMode('single')"
        class="px-3 py-1.5 text-xs rounded-md transition-all"
        :class="[
          importMode === 'single'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
        ]"
      >
        📝 單一節點
      </button>
      <button
        @click="toggleImportMode('multi')"
        class="px-3 py-1.5 text-xs rounded-md transition-all"
        :class="[
          importMode === 'multi'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
        ]"
      >
        📋 多個節點 (Excel)
      </button>
    </div>
    
    <!-- 模式說明 -->
    <div class="mb-4 px-3 py-2 bg-blue-900/20 rounded-lg border border-blue-800">
      <p class="text-xs text-blue-300">
        <span v-if="importMode === 'single'">
          📝 <strong>單一節點模式：</strong>將檔案作為一個節點導入圖譜
        </span>
        <span v-else>
          📋 <strong>多個節點模式：</strong>讀取 Excel 檔案，每一列資料創建獨立節點（支援 3000+ 筆）
        </span>
      </p>
    </div>
    
    <!-- ===== Excel 匯入進度條 ===== -->
    <div 
      v-if="showProgress" 
      class="mb-4 px-3 py-3 rounded-lg border transition-all duration-300"
      :class="{
        'bg-blue-900/20 border-blue-700': graphStore.importStatus === 'running',
        'bg-emerald-900/20 border-emerald-700': graphStore.importStatus === 'done',
        'bg-red-900/20 border-red-700': graphStore.importStatus === 'error',
      }"
    >
      <!-- 標題行 -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium" :class="{
          'text-blue-300': graphStore.importStatus === 'running',
          'text-emerald-300': graphStore.importStatus === 'done',
          'text-red-300': graphStore.importStatus === 'error',
        }">
          {{ graphStore.importDetail.filename || 'Excel 匯入' }}
        </span>
        <span class="text-[10px] font-mono" :class="{
          'text-blue-400': graphStore.importStatus === 'running',
          'text-emerald-400': graphStore.importStatus === 'done',
          'text-red-400': graphStore.importStatus === 'error',
        }">
          {{ Math.round(graphStore.importProgress) }}%
        </span>
      </div>
      
      <!-- 進度條 -->
      <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <div 
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="progressBarClass"
          :style="{ width: graphStore.importProgress + '%' }"
        ></div>
      </div>
      
      <!-- 狀態文字 -->
      <p class="text-[10px] text-gray-400">
        {{ progressText }}
      </p>
      
      <!-- ETA + 吞吐量 + 批次 -->
      <p v-if="etaText" class="text-[10px] text-gray-500 mt-0.5">
        {{ etaText }}
      </p>
      
      <!-- 跑步中的動畫指示器 -->
      <div v-if="graphStore.importStatus === 'running'" class="flex items-center gap-1 mt-1">
        <span class="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
        <span class="text-[10px] text-blue-400">
          AI 正在分析資料...
          <span v-if="modeLabel" class="ml-1 text-amber-400">{{ modeLabel }}</span>
        </span>
      </div>
    </div>
    
    <!-- 上傳區域 -->
    <div 
      @click="triggerFile"
      @dragover="handleDragOver"
      @drop="handleDrop"
      class="border-2 border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-900/20 hover:border-blue-400 transition-colors mb-4"
      :class="{ 'opacity-50 pointer-events-none': graphStore.importStatus === 'running' }"
    >
      <span class="text-2xl mb-1">＋</span>
      <span class="text-xs text-gray-400">點擊或拖放 PDF, Excel, PPT</span>
      <input 
        ref="fileInputRef" 
        type="file" 
        class="hidden" 
        @change="onFileChange" 
        multiple 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx"
      />
    </div>

    <!-- 已匯入檔案列表 -->
    <div class="flex-1 overflow-y-auto space-y-2">
      <div 
        v-for="file in graphStore.importedFiles" 
        :key="file.id" 
        @click="handleFileClick(file)"
        class="relative flex items-center p-2 bg-white/5 rounded-lg border cursor-pointer shadow-sm hover:shadow-md transition-all group"
        :class="[
          isNodeSelected(file)
            ? 'border-blue-500 bg-blue-900/20 ring-2 ring-blue-500/50'
            : 'border-white/10 hover:border-blue-500'
        ]"
      >
        <div 
          class="w-8 h-8 rounded flex items-center justify-center mr-3 flex-shrink-0"
          :class="getFileColor(getFileExt(file.name))"
        >
          <span class="text-[10px] font-bold">{{ getFileExt(file.name) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-white truncate group-hover:text-blue-400">
            {{ file.name }}
          </p>
          <p class="text-[10px] text-gray-500">{{ file.status }}</p>
        </div>
        
        <!-- 刪除按鈕 -->
        <button
          @click="handleDeleteFile(file, $event)"
          class="w-6 h-6 flex items-center justify-center rounded bg-red-900/30 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-900/50 transition-all"
          title="刪除檔案"
        >
          <span class="text-xs">✕</span>
        </button>
      </div>
      
      <!-- 空狀態 -->
      <div v-if="graphStore.importedFiles.length === 0" class="flex flex-col items-center justify-center h-full gap-3 py-8">
        <span class="text-4xl opacity-30">📂</span>
        <p class="text-xs text-gray-400 text-center">尚未匯入任何檔案<br/>點擊上方區域開始上傳</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-dashboard {
  position: relative;
}

/* 進度條閃爍動畫 */
@keyframes progress-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.bg-blue-500 {
  background-image: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.8) 0%,
    rgba(96, 165, 250, 1) 50%,
    rgba(59, 130, 246, 0.8) 100%
  );
  background-size: 200% 100%;
  animation: progress-shimmer 2s ease-in-out infinite;
}
</style>
