<template>
  <div class="import-gallery h-full flex gap-6">
    <!-- 左側上傳區 (30%) -->
    <div class="upload-zone w-[30%] flex-shrink-0">
      <div 
        class="dropzone h-full flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer"
        :class="[
          isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
          layoutStore.theme === 'dark' 
            ? 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40' 
            : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
        ]"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <!-- 上傳圖示 -->
        <div class="text-6xl opacity-60">📁</div>
        
        <!-- 提示文字 -->
        <div class="text-center px-6">
          <p 
            class="text-base font-semibold mb-2"
            :class="layoutStore.theme === 'dark' ? 'text-white' : 'text-gray-800'"
          >
            拖放檔案至此處
          </p>
          <p 
            class="text-sm mb-4"
            :class="layoutStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'"
          >
            或點擊選擇檔案
          </p>
          
          <!-- 支援格式 -->
          <div class="flex items-center justify-center gap-3 text-2xl">
            <span title="PDF">📄</span>
            <span title="Excel">📊</span>
            <span title="PowerPoint">📽️</span>
            <span title="Word">📝</span>
            <span title="Text">📃</span>
          </div>
          
          <p 
            class="text-xs mt-4"
            :class="layoutStore.theme === 'dark' ? 'text-gray-500' : 'text-gray-500'"
          >
            支援 PDF, PPT, Excel, Word, TXT
          </p>
        </div>
        
        <!-- 隱藏的檔案輸入 -->
        <input 
          ref="fileInput"
          type="file"
          multiple
          accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx,.txt"
          style="display: none;"
          @change="handleFileSelect"
        />
      </div>
    </div>

    <!-- 右側清單區 (70%) -->
    <div class="file-list flex-1 overflow-y-auto">
      <!-- 空狀態 -->
      <div 
        v-if="importedFiles.length === 0" 
        class="h-full flex flex-col items-center justify-center gap-4"
      >
        <span class="text-6xl opacity-30">📭</span>
        <div class="text-center">
          <p 
            class="text-base font-semibold mb-1"
            :class="layoutStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'"
          >
            尚未匯入任何檔案
          </p>
          <p 
            class="text-sm"
            :class="layoutStore.theme === 'dark' ? 'text-gray-500' : 'text-gray-500'"
          >
            從左側上傳檔案開始使用
          </p>
        </div>
      </div>

      <!-- 檔案網格 -->
      <div v-else class="grid grid-cols-3 gap-4">
        <div 
          v-for="file in importedFiles" 
          :key="file.id"
          class="file-card p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg"
          :class="[
            selectedFileId === file.id
              ? layoutStore.theme === 'dark'
                ? 'bg-blue-900/30 border-blue-500'
                : 'bg-blue-50 border-blue-500'
              : layoutStore.theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : 'bg-white border-gray-200 hover:border-gray-300'
          ]"
          @click="handleFileClick(file)"
        >
          <!-- 檔案圖示 -->
          <div class="flex items-center gap-3 mb-3">
            <span class="text-4xl">{{ getFileIcon(file.type) }}</span>
            <div class="flex-1 min-w-0">
              <p 
                class="text-sm font-semibold truncate"
                :class="layoutStore.theme === 'dark' ? 'text-white' : 'text-gray-800'"
              >
                {{ file.name }}
              </p>
              <p 
                class="text-xs truncate"
                :class="layoutStore.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'"
              >
                {{ file.aiTitle || '等待 AI 生成標題...' }}
              </p>
            </div>
          </div>

          <!-- 解析狀態 -->
          <div class="flex items-center gap-2">
            <div 
              v-if="file.status === 'parsing'"
              class="flex items-center gap-2 text-xs"
              :class="layoutStore.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
            >
              <div class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>解析中...</span>
            </div>
            <div 
              v-else-if="file.status === 'completed'"
              class="flex items-center gap-2 text-xs"
              :class="layoutStore.theme === 'dark' ? 'text-green-400' : 'text-green-600'"
            >
              <span>✓</span>
              <span>已完成</span>
            </div>
            <div 
              v-else-if="file.status === 'error'"
              class="flex items-center gap-2 text-xs"
              :class="layoutStore.theme === 'dark' ? 'text-red-400' : 'text-red-600'"
            >
              <span>✗</span>
              <span>解析失敗</span>
            </div>
          </div>

          <!-- 檔案大小與日期 -->
          <div 
            class="flex items-center justify-between mt-2 pt-2 border-t text-xs"
            :class="layoutStore.theme === 'dark' ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-500'"
          >
            <span>{{ formatFileSize(file.size) }}</span>
            <span>{{ formatDate(file.uploadDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import { ElMessage } from 'element-plus';

// ===== Props & Emits =====
const emit = defineEmits(['file-click', 'file-uploaded']);

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

// ===== State =====
const fileInput = ref(null);
const isDragging = ref(false);
const selectedFileId = ref(null);

// 已匯入的檔案列表（從 graphStore 過濾出檔案類型的節點）
const importedFiles = computed(() => {
  return graphStore.nodes
    .filter(node => node.group >= 7) // group 7+ 是檔案類型
    .map(node => ({
      id: node.id,
      name: node.name || node.label || '未命名檔案',
      type: node.type || 'file',
      aiTitle: node.description || '',
      status: node.status || 'completed',
      size: node.size || 0,
      uploadDate: node.uploadDate || new Date(),
      nodeId: node.id
    }));
});

// ===== Methods =====

// 獲取檔案類型圖示
const getFileIcon = (type) => {
  const typeMap = {
    'pdf': '📄',
    'excel': '📊',
    'xlsx': '📊',
    'xls': '📊',
    'ppt': '📽️',
    'pptx': '📽️',
    'powerpoint': '📽️',
    'word': '📝',
    'doc': '📝',
    'docx': '📝',
    'txt': '📃',
    'text': '📃'
  };
  
  const lowerType = (type || '').toLowerCase();
  for (const [key, icon] of Object.entries(typeMap)) {
    if (lowerType.includes(key)) {
      return icon;
    }
  }
  
  return '📄'; // 預設圖示
};

// 格式化檔案大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  // 小於 1 分鐘
  if (diff < 60000) return '剛剛';
  
  // 小於 1 小時
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} 分鐘前`;
  }
  
  // 小於 1 天
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} 小時前`;
  }
  
  // 超過 1 天，顯示日期
  return d.toLocaleDateString('zh-TW');
};

// 觸發檔案選擇
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 拖放處理
const handleDragOver = (e) => {
  isDragging.value = true;
};

const handleDragLeave = (e) => {
  isDragging.value = false;
};

const handleDrop = (e) => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
};

// 檔案選擇處理
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  processFiles(files);
  // 清空 input，允許重複選擇同一檔案
  e.target.value = '';
};

// 處理檔案
const processFiles = (files) => {
  if (files.length === 0) return;
  
  // 驗證檔案類型
  const validExtensions = ['.pdf', '.ppt', '.pptx', '.xls', '.xlsx', '.doc', '.docx', '.txt'];
  const validFiles = files.filter(file => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    return validExtensions.includes(ext);
  });
  
  if (validFiles.length === 0) {
    ElMessage.error('請上傳支援的檔案格式（PDF, PPT, Excel, Word, TXT）');
    return;
  }
  
  if (validFiles.length < files.length) {
    ElMessage.warning(`已過濾 ${files.length - validFiles.length} 個不支援的檔案`);
  }
  
  // 通知父組件處理檔案上傳
  emit('file-uploaded', validFiles);
  
  ElMessage.success(`已選擇 ${validFiles.length} 個檔案，開始上傳...`);
};

// 點擊檔案卡片
const handleFileClick = (file) => {
  selectedFileId.value = file.id;
  
  // 通知父組件處理相機聚焦和面板顯示
  emit('file-click', {
    fileId: file.id,
    nodeId: file.nodeId
  });
  
  console.log('📂 點擊檔案:', file.name);
};
</script>

<style scoped>
.import-gallery {
  padding: 1.5rem;
}

.dropzone {
  min-height: 300px;
}

.file-card {
  position: relative;
  overflow: hidden;
}

.file-card:hover {
  transform: translateY(-2px);
}

.file-list::-webkit-scrollbar {
  width: 6px;
}

.file-list::-webkit-scrollbar-track {
  background: transparent;
}

.file-list::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
