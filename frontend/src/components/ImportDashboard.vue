<script setup>
import { ref } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import { ElMessage } from 'element-plus';

const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

const fileInputRef = ref(null);

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
    await graphStore.importFile(file);
  }
  
  ElMessage.success(`成功匯入 ${files.length} 個檔案`);
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
    await graphStore.importFile(file);
  }
  
  ElMessage.success(`成功匯入 ${files.length} 個檔案`);
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
    'PDF': 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    'DOC': 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    'DOCX': 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    'XLS': 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    'XLSX': 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    'CSV': 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    'PPT': 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
    'PPTX': 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
    'TXT': 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400',
    'MD': 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
  };
  return colorMap[ext] || 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
}

// 檢查節點是否被選中
function isNodeSelected(file) {
  return graphStore.selectedNode?.id === file.nodeId;
}
</script>

<template>
  <div class="import-dashboard flex flex-col h-full">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-bold text-slate-700 dark:text-white">
        知識來源匯入 
        <span class="text-xs font-normal text-slate-500 dark:text-gray-400 ml-2">(AI 智慧解析)</span>
      </h3>
      <span 
        v-if="graphStore.importedFiles.length > 0"
        class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full"
      >
        {{ graphStore.importedFiles.length }}
      </span>
    </div>
    
    <!-- 上傳區域 -->
    <div 
      @click="triggerFile"
      @dragover="handleDragOver"
      @drop="handleDrop"
      class="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-colors mb-4"
    >
      <span class="text-2xl mb-1">＋</span>
      <span class="text-xs text-slate-500 dark:text-gray-400">點擊或拖放 PDF, Excel, PPT</span>
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
        class="relative flex items-center p-2 bg-white dark:bg-white/5 rounded-lg border cursor-pointer shadow-sm hover:shadow-md transition-all group"
        :class="[
          isNodeSelected(file)
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/50'
            : 'border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500'
        ]"
      >
        <div 
          class="w-8 h-8 rounded flex items-center justify-center mr-3 flex-shrink-0"
          :class="getFileColor(getFileExt(file.name))"
        >
          <span class="text-[10px] font-bold">{{ getFileExt(file.name) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-slate-700 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {{ file.name }}
          </p>
          <p class="text-[10px] text-slate-400 dark:text-gray-500">{{ file.status }}</p>
        </div>
        
        <!-- 刪除按鈕 -->
        <button
          @click="handleDeleteFile(file, $event)"
          class="w-6 h-6 flex items-center justify-center rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
          title="刪除檔案"
        >
          <span class="text-xs">✕</span>
        </button>
      </div>
      
      <!-- 空狀態 -->
      <div v-if="graphStore.importedFiles.length === 0" class="flex flex-col items-center justify-center h-full gap-3 py-8">
        <span class="text-4xl opacity-30">📂</span>
        <p class="text-xs text-slate-500 dark:text-gray-400 text-center">尚未匯入任何檔案<br/>點擊上方區域開始上傳</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-dashboard {
  position: relative;
}
</style>
