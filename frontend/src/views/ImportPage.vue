<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#1a1a2e] px-12 py-10">
    <!-- 頁面標題 -->
    <header class="text-center mb-12">
      <div class="flex flex-col items-center gap-3">
        <h1 class="flex items-center gap-4 m-0 text-5xl font-extrabold text-gray-800 dark:text-white">
          <span class="text-6xl">📥</span>
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">資料導入工作台</span>
        </h1>
        <p class="text-base font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest m-0">Data Import Workbench</p>
      </div>
    </header>

    <!-- 主要內容區 -->
    <div class="max-w-5xl mx-auto">
      <!-- 導入說明卡片 -->
      <div class="mb-8 p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-2xl">
        <div class="flex items-start gap-4">
          <span class="text-4xl">💡</span>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">支援格式</h3>
            <ul class="space-y-2 text-gray-700 dark:text-gray-300">
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>CSV 檔案</strong> (.csv) - 逗號分隔值
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>Excel 檔案</strong> (.xlsx) - Microsoft Excel 格式
              </li>
              <li class="flex items-center gap-2 mt-3">
                <span class="text-blue-500">ℹ️</span>
                <span>檔案將自動解析並建立為知識節點，儲存至新圖譜</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 導入操作卡片 -->
      <div class="bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-white/10 rounded-3xl shadow-xl">
        <!-- 卡片標題 -->
        <div class="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 border-b border-white/10">
          <h2 class="text-2xl font-bold text-white flex items-center gap-3">
            <span class="text-3xl">📂</span>
            選擇檔案
          </h2>
        </div>

        <!-- 上傳區域 -->
        <div class="p-12 pb-16">
          <!-- 導入模式選擇 -->
          <div class="mb-8">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              📋 導入模式
            </label>
            <div class="flex gap-4">
              <button
                @click="importMode = 'new'"
                class="flex-1 px-6 py-4 rounded-xl border-2 transition-all"
                :class="importMode === 'new' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold' 
                  : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:border-blue-400'"
              >
                <div class="flex flex-col items-center gap-2">
                  <span class="text-2xl">✨</span>
                  <span class="text-base">建立新圖譜</span>
                </div>
              </button>
              <button
                @click="importMode = 'existing'"
                class="flex-1 px-6 py-4 rounded-xl border-2 transition-all"
                :class="importMode === 'existing' 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 font-bold' 
                  : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:border-purple-400'"
              >
                <div class="flex flex-col items-center gap-2">
                  <span class="text-2xl">📂</span>
                  <span class="text-base">加入現有圖譜</span>
                </div>
              </button>
            </div>
          </div>
          
          <!-- 新建圖譜：圖譜名稱輸入 -->
          <div v-if="importMode === 'new'" class="mb-8">
            <label class="block text-sm font-bold text-blue-700 dark:text-blue-300 mb-3">
              ✨ 新圖譜名稱
            </label>
            <input 
              v-model="graphName"
              type="text"
              placeholder="例如：2024 年度報告、產品規劃..."
              class="w-full px-6 py-4 bg-white dark:bg-white/5 border-2 border-blue-300 dark:border-blue-500/50 rounded-xl text-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <p class="mt-2 text-sm text-blue-600 dark:text-blue-400">
              💡 匯入的數據將建立為一個全新的知識圖譜
            </p>
          </div>
          
          <!-- 現有圖譜：下拉選擇 -->
          <div v-if="importMode === 'existing'" class="mb-8">
            <label class="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">
              📂 選擇圖譜
            </label>
            <div v-if="isLoadingGraphs" class="w-full px-6 py-4 bg-white dark:bg-white/5 border-2 border-purple-300 dark:border-purple-500/50 rounded-xl text-center">
              <span class="text-gray-500 dark:text-gray-400">⏳ 載入圖譜列表中...</span>
            </div>
            <select
              v-else
              v-model="selectedGraphId"
              class="w-full px-6 py-4 bg-white dark:bg-white/5 border-2 border-purple-300 dark:border-purple-500/50 rounded-xl text-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
            >
              <option :value="null" disabled>請選擇要加入的圖譜...</option>
              <option v-for="graph in existingGraphs" :key="graph.id" :value="graph.id">
                {{ graph.name }} ({{ graph.nodeCount }} 個節點)
              </option>
            </select>
            <p class="mt-2 text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>💡</span>
              <span>匯入的數據將加入到選定的圖譜中</span>
            </p>
            <button
              v-if="!isLoadingGraphs"
              @click="loadExistingGraphs"
              class="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
            >
              🔄 重新載入圖譜列表
            </button>
          </div>
          
          <div 
            class="relative flex flex-col items-center justify-center gap-6 p-16 border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer group"
            @click="triggerFileInput"
          >
            <!-- 圖示 -->
            <div class="text-8xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
              📁
            </div>

            <!-- 提示文字 -->
            <div class="text-center">
              <p class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                點擊選擇檔案
              </p>
              <p class="text-base text-gray-500 dark:text-gray-400">
                支援 CSV 或 Excel 檔案
              </p>
            </div>

            <!-- 已選檔案顯示 -->
            <div v-if="selectedFile" class="mt-4 px-6 py-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-500/40 rounded-xl flex items-center gap-3">
              <span class="text-2xl">📄</span>
              <div class="flex-1 flex flex-col items-start">
                <span class="text-sm font-bold text-blue-800 dark:text-blue-300">{{ selectedFile.name }}</span>
                <span class="text-xs text-blue-600 dark:text-blue-400">{{ formatFileSize(selectedFile.size) }}</span>
                
                <!-- 上傳進度條 -->
                <div v-if="isUploading" class="w-full mt-2">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        :style="{ width: uploadProgress + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs text-blue-600 dark:text-blue-400 font-mono">{{ Math.round(uploadProgress) }}%</span>
                  </div>
                </div>
              </div>
              <button 
                v-if="!isUploading"
                @click.stop="clearFile"
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
              >
                ✕ 取消
              </button>
            </div>

            <!-- 隱藏的檔案輸入 -->
            <input 
              ref="fileInput" 
              type="file" 
              accept=".csv, .xlsx" 
              style="display: none;" 
              @change="handleFileSelect"
            />
          </div>

          <!-- 導入按鈕 -->
          <div class="mt-8 flex justify-center">
            <button 
              :disabled="!selectedFile || (importMode === 'new' && !graphName.trim()) || (importMode === 'existing' && !selectedGraphId) || isUploading"
              @click="handleUpload"
              class="px-12 py-4 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-1 disabled:translate-y-0 disabled:shadow-none"
            >
              <span class="text-2xl">{{ isUploading ? '⏳' : '🚀' }}</span>
              <span>{{ isUploading ? '上傳中...' : '開始導入' }}</span>
            </button>
          </div>

          <!-- 檔案預覽區域 -->
          <div v-if="filePreview && filePreview.type === 'csv' && filePreview.headers" class="mt-8 p-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
            <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <span class="text-xl">👁️</span>
              檔案預覽 (前 5 列)
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-blue-100 dark:bg-blue-900/20">
                    <th v-for="(header, index) in filePreview.headers" :key="index" class="px-3 py-2 text-left text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 last:border-r-0">
                      {{ header.trim() }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in filePreview.rows" :key="rowIndex" class="border-t border-gray-200 dark:border-gray-700">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-3 py-2 text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                      {{ cell.trim() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近導入記錄 -->
      <div v-if="importHistory.length > 0" class="mt-8 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg overflow-hidden">
        <div class="px-6 py-4 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span class="text-xl">📋</span>
            導入記錄
            <span class="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-lg">{{ importHistory.length }}</span>
          </h3>
          <button 
            @click="clearAllHistory"
            class="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <span>🗑️</span>
            <span>清空全部</span>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div 
              v-for="(record, index) in importHistory" 
              :key="index"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
            >
              <div class="flex items-center gap-3 flex-1">
                <span class="text-2xl">{{ record.success ? '✅' : '❌' }}</span>
                <div class="flex-1">
                  <p class="font-semibold text-gray-800 dark:text-white">{{ record.fileName }}</p>
                  <p class="text-xs" :class="record.mode === 'new' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'" v-if="record.graphName">
                    {{ record.mode === 'new' ? '✨' : '📂' }} {{ record.graphName }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.timestamp }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <p class="text-sm font-mono text-blue-600 dark:text-blue-400">
                    成功: {{ record.stats.success }} | 跳過: {{ record.stats.skipped }} | 失敗: {{ record.stats.failed }}
                  </p>
                </div>
                <button
                  @click="deleteHistory(index)"
                  class="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs rounded transition-all"
                  title="刪除此記錄"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { ElMessage } from 'element-plus';

// ===== Stores =====
const graphStore = useGraphStore();

// ===== Refs =====
const fileInput = ref(null);
const selectedFile = ref(null);
const importMode = ref('new'); // 'new' | 'existing'
const graphName = ref('');
const selectedGraphId = ref(null);
const isUploading = ref(false);
const importHistory = ref([]);
const existingGraphs = ref([]);
const isLoadingGraphs = ref(false);
const uploadProgress = ref(0);
const filePreview = ref(null);

// ===== 載入現有圖譜列表 =====
const loadExistingGraphs = async () => {
  isLoadingGraphs.value = true;
  try {
    const response = await fetch('/api/graph/list');
    if (!response.ok) throw new Error('無法載入圖譜列表');
    
    const data = await response.json();
    existingGraphs.value = data.graphs || [];
    
    console.log('✅ 已載入現有圖譜:', existingGraphs.value.length, '個');
  } catch (error) {
    console.error('❌ 載入圖譜列表失敗:', error);
    ElMessage.warning({
      message: '⚠️ 無法載入現有圖譜列表，請稍後再試',
      duration: 3000,
    });
    // 使用預設數據作為後備
    existingGraphs.value = [
      { id: 'default', name: '預設圖譜', nodeCount: 0 },
    ];
  } finally {
    isLoadingGraphs.value = false;
  }
};

// 組件掛載時載入圖譜列表
onMounted(() => {
  loadExistingGraphs();
  
  // 從 localStorage 載入歷史記錄
  const savedHistory = localStorage.getItem('importHistory');
  if (savedHistory) {
    try {
      importHistory.value = JSON.parse(savedHistory);
    } catch (e) {
      console.error('無法載入歷史記錄:', e);
    }
  }
});

// ===== Methods =====
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const validExtensions = ['.csv', '.xlsx'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(fileExtension)) {
    ElMessage.warning({
      message: '⚠️ 僅支援 CSV 或 Excel 檔案',
      duration: 3000,
    });
    event.target.value = '';
    return;
  }

  // 檢查檔案大小 (最大 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    ElMessage.warning({
      message: '⚠️ 檔案大小超過 50MB，請選擇較小的檔案',
      duration: 3000,
    });
    event.target.value = '';
    return;
  }

  selectedFile.value = file;
  console.log('📄 已選擇檔案:', file.name, '大小:', formatFileSize(file.size));
  
  // 嘗試預覽檔案內容
  await previewFile(file);
};

const clearFile = () => {
  selectedFile.value = null;
  filePreview.value = null;
  uploadProgress.value = 0;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 檔案預覽功能
const previewFile = async (file) => {
  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      
      if (file.name.endsWith('.csv')) {
        const text = new TextDecoder('utf-8').decode(data);
        const lines = text.split('\n').slice(0, 5); // 前5行
        filePreview.value = {
          type: 'csv',
          headers: lines[0]?.split(',') || [],
          rows: lines.slice(1).map(line => line.split(',')),
        };
      } else {
        filePreview.value = {
          type: 'excel',
          message: 'Excel 檔案預覽暫不可用',
        };
      }
    };
    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.warn('檔案預覽失敗:', error);
  }
};

const handleUpload = async () => {
  if (!selectedFile.value || isUploading.value) return;
  
  // 驗證：新建模式需要圖譜名稱
  if (importMode.value === 'new' && (!graphName.value || graphName.value.trim() === '')) {
    ElMessage.warning({
      message: '⚠️ 請輸入圖譜名稱',
      duration: 3000,
    });
    return;
  }
  
  // 驗證：現有模式需要選擇圖譜
  if (importMode.value === 'existing' && !selectedGraphId.value) {
    ElMessage.warning({
      message: '⚠️ 請選擇要加入的圖譜',
      duration: 3000,
    });
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;

  const loadingMsg = ElMessage({
    message: '⏳ 正在上傳並處理檔案...',
    type: 'info',
    duration: 0,
  });

  // 模擬進度更新
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 15;
    }
  }, 300);

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('import_mode', importMode.value);
    
    if (importMode.value === 'new') {
      formData.append('graph_name', graphName.value.trim());
      console.log('🚀 開始上傳檔案:', selectedFile.value.name);
      console.log('✨ 建立新圖譜:', graphName.value.trim());
    } else {
      formData.append('graph_id', selectedGraphId.value.toString());
      const selectedGraph = existingGraphs.value.find(g => g.id === selectedGraphId.value);
      console.log('🚀 開始上傳檔案:', selectedFile.value.name);
      console.log('📂 加入圖譜:', selectedGraph?.name || selectedGraphId.value);
    }

    const response = await fetch('/api/graph/import/excel', {
      method: 'POST',
      body: formData,
    });

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 後端返回結果:', result);

    if (!result.nodes || !Array.isArray(result.nodes)) {
      throw new Error('後端返回的數據格式不正確');
    }

    const stats = graphStore.addBatchNodes(result.nodes);

    loadingMsg.close();
    
    const successMsg = importMode.value === 'new'
      ? `✅ 已建立圖譜「${graphName.value.trim()}」！成功: ${stats.success}, 跳過: ${stats.skipped}, 失敗: ${stats.failed}`
      : `✅ 已加入圖譜！成功: ${stats.success}, 跳過: ${stats.skipped}, 失敗: ${stats.failed}`;
    
    ElMessage.success({
      message: successMsg,
      duration: 4000,
    });

    // 記錄導入歷史
    const historyRecord = {
      fileName: selectedFile.value.name,
      mode: importMode.value,
      timestamp: new Date().toLocaleString('zh-TW'),
      success: true,
      stats: stats,
    };
    
    if (importMode.value === 'new') {
      historyRecord.graphName = graphName.value.trim();
    } else {
      const selectedGraph = existingGraphs.value.find(g => g.id === selectedGraphId.value);
      historyRecord.graphName = selectedGraph?.name || `圖譜 #${selectedGraphId.value}`;
    }
    
    importHistory.value.unshift(historyRecord);

    // 限制歷史記錄數量
    if (importHistory.value.length > 10) {
      importHistory.value = importHistory.value.slice(0, 10);
    }

    // 保存到 localStorage
    localStorage.setItem('importHistory', JSON.stringify(importHistory.value));

    console.log('🎉 檔案導入成功:', stats);

    // 清除選擇
    clearFile();
    graphName.value = '';
    selectedGraphId.value = null;

  } catch (error) {
    clearInterval(progressInterval);
    uploadProgress.value = 0;
    
    loadingMsg.close();
    
    // 詳細錯誤訊息
    let errorMsg = '❌ 導入失敗';
    if (error.message.includes('HTTP Error')) {
      errorMsg += ': 伺服器連線失敗，請檢查後端服務是否運行';
    } else if (error.message.includes('格式不正確')) {
      errorMsg += ': 檔案格式不正確，請檢查檔案內容';
    } else {
      errorMsg += `: ${error.message}`;
    }
    
    ElMessage.error({
      message: errorMsg,
      duration: 5000,
    });

    // 記錄失敗歷史
    importHistory.value.unshift({
      fileName: selectedFile.value.name,
      timestamp: new Date().toLocaleString('zh-TW'),
      success: false,
      stats: { success: 0, skipped: 0, failed: 0 },
    });

    // 保存失敗記錄
    localStorage.setItem('importHistory', JSON.stringify(importHistory.value));

    console.error('❌ 檔案上傳失敗:', error);
  } finally {
    clearInterval(progressInterval);
    isUploading.value = false;
  }
};

// 刪除歷史記錄
const deleteHistory = (index) => {
  importHistory.value.splice(index, 1);
  localStorage.setItem('importHistory', JSON.stringify(importHistory.value));
  ElMessage.success({
    message: '已刪除記錄',
    duration: 2000,
  });
};

// 清空所有歷史
const clearAllHistory = () => {
  importHistory.value = [];
  localStorage.removeItem('importHistory');
  ElMessage.success({
    message: '已清空所有記錄',
    duration: 2000,
  });
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
</script>

<style scoped>
/* 邊框粗細調整 */
.border-3 {
  border-width: 3px;
}

/* 動畫效果 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
