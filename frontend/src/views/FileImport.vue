<template>
  <div class="min-h-screen h-screen overflow-y-auto bg-[#0a0e27] px-12 py-10 custom-scrollbar">
    <!-- 頁面標題 -->
    <header class="text-center mb-12">
      <div class="flex flex-col items-center gap-3">
        <h1 class="flex items-center gap-4 m-0 text-5xl font-extrabold text-white">
          <span class="text-6xl">📤</span>
          <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">檔案上傳中心</span>
        </h1>
        <p class="text-base font-medium text-gray-400 uppercase tracking-widest m-0">File Upload Center</p>
      </div>
    </header>

    <!-- 主要內容區 -->
    <div class="max-w-5xl mx-auto">
      <!-- 上傳說明卡片 -->
      <div class="mb-8 p-6 bg-blue-900/10 border-2 border-blue-500/30 rounded-2xl">
        <div class="flex items-start gap-4">
          <span class="text-4xl">💡</span>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-blue-300 mb-2">支援功能</h3>
            <ul class="space-y-2 text-gray-300">
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>拖曳上傳</strong> - 直接將檔案拖曳到上傳區域
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>批次上傳</strong> - 同時上傳多個檔案
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>自動監控</strong> - 上傳後自動觸發監控服務處理
              </li>
              <li class="flex items-center gap-2 mt-3">
                <svg class="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                <span>檔案將儲存至 <code class="px-2 py-1 bg-gray-700 rounded">C:/BruV_Data/Auto_Import</code></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 上傳操作卡片 -->
      <div class="bg-[#1a1d3a] border-2 border-[#2d3154] rounded-3xl shadow-xl">
        <!-- 卡片標題 -->
        <div class="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 border-b border-white/10">
          <h2 class="text-2xl font-bold text-white flex items-center gap-3">
            <span class="text-3xl">📁</span>
            上傳檔案
          </h2>
        </div>

        <!-- 上傳區域 -->
        <div class="p-12">
          <!-- 拖曳上傳區 -->
          <div
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @click="triggerFileInput"
            class="relative border-4 border-dashed rounded-3xl p-16 transition-all cursor-pointer"
            :class="isDragging 
              ? 'border-blue-500 bg-blue-900/20 scale-105' 
              : 'border-[#2d3154] bg-white/5 hover:border-blue-400 hover:bg-blue-900/10'"
          >
            <!-- 拖曳提示 -->
            <div class="text-center">
              <div class="mb-6">
                <span class="text-8xl animate-bounce inline-block">📎</span>
              </div>
              <p class="text-2xl font-bold text-gray-300 mb-3">
                {{ isDragging ? '放開以上傳' : '拖曳檔案到此處' }}
              </p>
              <p class="text-lg text-gray-400 mb-6">
                或點擊此處選擇檔案
              </p>
              <div class="flex justify-center gap-3 flex-wrap">
                <span class="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg text-sm font-semibold">
                  PDF
                </span>
                <span class="px-4 py-2 bg-green-900/30 text-green-300 rounded-lg text-sm font-semibold">
                  DOCX
                </span>
                <span class="px-4 py-2 bg-purple-900/30 text-purple-300 rounded-lg text-sm font-semibold">
                  XLSX
                </span>
                <span class="px-4 py-2 bg-yellow-900/30 text-yellow-300 rounded-lg text-sm font-semibold">
                  TXT
                </span>
                <span class="px-4 py-2 bg-red-900/30 text-red-300 rounded-lg text-sm font-semibold">
                  MD
                </span>
              </div>
            </div>

            <!-- 隱藏的檔案輸入 -->
            <input
              ref="fileInput"
              type="file"
              multiple
              @change="handleFileSelect"
              class="hidden"
              accept=".pdf,.txt,.md,.docx,.xlsx"
            />
          </div>

          <!-- 檔案列表 -->
          <div v-if="files.length > 0" class="mt-8">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📋</span>
              已選擇的檔案 ({{ files.length }})
            </h3>
            <div class="space-y-3">
              <div
                v-for="(file, index) in files"
                :key="index"
                class="flex items-center justify-between p-4 bg-white/5 border border-[#2d3154] rounded-xl"
              >
                <div class="flex items-center gap-3 flex-1">
                  <span class="text-3xl">{{ getFileIcon(file.name) }}</span>
                  <div class="flex-1">
                    <p class="font-semibold text-white">{{ file.name }}</p>
                    <p class="text-sm text-gray-400">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <button
                  @click="removeFile(index)"
                  class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
                >
                  移除
                </button>
              </div>
            </div>

            <!-- 上傳按鈕 -->
            <div class="mt-6 flex gap-4">
              <button
                @click="uploadFiles"
                :disabled="uploading"
                class="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all font-bold text-lg shadow-lg disabled:cursor-not-allowed"
              >
                <span v-if="!uploading">🚀 開始上傳</span>
                <span v-else>⏳ 上傳中... ({{ uploadedCount }}/{{ files.length }})</span>
              </button>
              <button
                @click="clearFiles"
                :disabled="uploading"
                class="px-8 py-4 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-bold text-lg disabled:cursor-not-allowed"
              >
                清空列表
              </button>
            </div>
          </div>

          <!-- 上傳進度 -->
          <div v-if="uploading" class="mt-6">
            <div class="bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                class="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-center text-sm text-gray-400 mt-2">
              上傳進度: {{ uploadProgress.toFixed(0) }}%
            </p>
          </div>
        </div>
      </div>

      <!-- 上傳結果 -->
      <div v-if="uploadResults.length > 0" class="mt-8">
        <div class="bg-[#1a1d3a] border-2 border-[#2d3154] rounded-3xl shadow-xl overflow-hidden">
          <div class="px-8 py-6 bg-gradient-to-r from-green-500 to-teal-500 border-b border-white/10">
            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
              <span class="text-3xl">✅</span>
              上傳結果
            </h2>
          </div>
          <div class="p-6 space-y-3">
            <div
              v-for="(result, index) in uploadResults"
              :key="index"
              class="p-4 rounded-xl border-2"
              :class="result.success 
                ? 'bg-green-900/10 border-green-500/30' 
                : 'bg-red-900/10 border-red-500/30'"
            >
              <div class="flex items-start gap-3">
                <span class="text-2xl">{{ result.success ? '✅' : '❌' }}</span>
                <div class="flex-1">
                  <p class="font-bold" :class="result.success ? 'text-green-300' : 'text-red-300'">
                    {{ result.filename }}
                  </p>
                  <p class="text-sm" :class="result.success ? 'text-green-400' : 'text-red-400'">
                    {{ result.success ? result.message : result.error }}
                  </p>
                  <p v-if="result.success" class="text-xs text-gray-400 mt-1">
                    儲存路徑: {{ result.saved_path }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authFetch } from '../services/apiClient';

export default {
  name: 'FileImport',
  data() {
    return {
      isDragging: false,
      files: [],
      uploading: false,
      uploadedCount: 0,
      uploadProgress: 0,
      uploadResults: []
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(event) {
      const selectedFiles = Array.from(event.target.files);
      this.addFiles(selectedFiles);
    },
    handleDrop(event) {
      this.isDragging = false;
      const droppedFiles = Array.from(event.dataTransfer.files);
      this.addFiles(droppedFiles);
    },
    addFiles(newFiles) {
      // 過濾已存在的檔案
      const existingNames = this.files.map(f => f.name);
      const uniqueFiles = newFiles.filter(f => !existingNames.includes(f.name));
      this.files.push(...uniqueFiles);
    },
    removeFile(index) {
      this.files.splice(index, 1);
    },
    clearFiles() {
      this.files = [];
      this.uploadResults = [];
    },
    async uploadFiles() {
      if (this.files.length === 0) {
        alert('請先選擇檔案');
        return;
      }

      this.uploading = true;
      this.uploadedCount = 0;
      this.uploadProgress = 0;
      this.uploadResults = [];

      try {
        // 逐個上傳檔案
        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i];
          
          try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await authFetch('/api/system/upload', {
              method: 'POST',
              body: formData
            });

            const result = await response.json();
            
            if (response.ok) {
              this.uploadResults.push(result);
            } else {
              this.uploadResults.push({
                success: false,
                filename: file.name,
                error: result.detail || '上傳失敗'
              });
            }
          } catch (error) {
            this.uploadResults.push({
              success: false,
              filename: file.name,
              error: error.message || '網路錯誤'
            });
          }

          this.uploadedCount++;
          this.uploadProgress = (this.uploadedCount / this.files.length) * 100;
        }

        // 上傳完成後清空檔案列表
        this.files = [];
        
        // 顯示成功訊息
        const successCount = this.uploadResults.filter(r => r.success).length;
        alert(`上傳完成！成功: ${successCount}, 失敗: ${this.files.length - successCount}`);

      } catch (error) {
        console.error('上傳錯誤:', error);
        alert('上傳過程發生錯誤');
      } finally {
        this.uploading = false;
      }
    },
    getFileIcon(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      const icons = {
        pdf: '📕',
        docx: '📘',
        xlsx: '📊',
        txt: '📄',
        md: '📝',
        default: '📎'
      };
      return icons[ext] || icons.default;
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
/* 動畫效果 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .px-12 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

/* 自訂滾動條樣式已在全域 style.css 中的 .custom-scrollbar class 定義 */
</style>
