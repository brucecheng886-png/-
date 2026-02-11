<template>
  <div class="h-screen overflow-y-auto bg-[#0a0e27] px-6 py-8 custom-scrollbar">
    <!-- 頁面標題 -->
    <header class="text-center mb-8">
      <div class="flex flex-col items-center gap-2">
        <h1 class="flex items-center gap-3 m-0 text-4xl font-extrabold text-white">
          <span class="text-5xl">📥</span>
          <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">資料導入工作台</span>
        </h1>
        <p class="text-sm font-medium text-gray-400 uppercase tracking-widest m-0">Data Import Workbench</p>
      </div>
    </header>

    <!-- 主要內容區 -->
    <div class="max-w-5xl mx-auto pb-8">
      <!-- 說明卡片 -->
      <div class="mb-6 p-5 bg-blue-900/10 border-2 border-blue-500/30 rounded-2xl">
        <div class="flex items-start gap-4">
          <span class="text-4xl">💡</span>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-blue-300 mb-2">自動處理流程</h3>
            <ul class="space-y-2 text-gray-300">
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>上傳檔案</strong> - 支援 PDF、DOCX、XLSX、TXT、MD
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>自動監控</strong> - WatcherService 自動偵測新檔案
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>RAGFlow 處理</strong> - 自動上傳至 RAGFlow 知識庫
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                <strong>圖譜建立</strong> - Excel 自動解析並創建節點連線
              </li>
              <li class="flex items-center gap-2 mt-3">
                <svg class="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                <span>上傳後無需任何操作，系統將自動完成所有處理</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 上傳區域 -->
      <div class="bg-[#1a1d3a] border-2 border-[#2d3154] rounded-3xl shadow-xl">
        <!-- 卡片標題 -->
        <div class="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 border-b border-white/10">
          <h2 class="text-2xl font-bold text-white flex items-center gap-3">
            <span class="text-3xl">📂</span>
            上傳檔案
          </h2>
        </div>

        <!-- 拖曳上傳區 -->
        <div class="p-8">
          <div
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @click="triggerFileInput"
            class="relative border-4 border-dashed rounded-3xl p-12 transition-all cursor-pointer"
            :class="[
              isDragging 
                ? 'border-blue-500 bg-blue-900/20 scale-105' 
                : 'border-[#2d3154] bg-white/5 hover:border-blue-400 hover:bg-blue-900/10',
              uploadStatus === 'uploading' ? 'pointer-events-none' : ''
            ]"
          >
            <!-- 拖曳提示 -->
            <div class="text-center">
              <div class="mb-4">
                <span class="text-7xl animate-bounce inline-block">
                  {{ uploadStatus === 'ready' ? '📎' : uploadStatus === 'uploading' ? '⏳' : '✅' }}
                </span>
              </div>
              <p class="text-2xl font-bold text-gray-300 mb-2">
                {{ getStatusText() }}
              </p>
              <p class="text-base text-gray-400 mb-4">
                {{ getStatusSubtext() }}
              </p>
              
              <!-- 支援格式標籤 -->
              <div v-if="uploadStatus === 'ready'" class="flex justify-center gap-3 flex-wrap">
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

            <!-- 圖譜選擇 -->
            <div class="mt-6 p-6 bg-white/5 border-2 border-[#2d3154] rounded-xl">
              <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📋</span>
                導入模式
              </h3>
              
              <!-- 模式選擇按鈕 -->
              <div class="flex gap-4 mb-4">
                <button
                  @click="showCreateGraphDialog = true"
                  class="flex-1 px-6 py-4 rounded-xl border-2 transition-all"
                  :class="importMode === 'new' 
                    ? 'bg-blue-900/20 border-blue-500 text-blue-300 font-bold' 
                    : 'bg-white/5 border-[#2d3154] text-gray-400 hover:border-blue-400'"
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
                    ? 'bg-purple-900/20 border-purple-500 text-purple-300 font-bold' 
                    : 'bg-white/5 border-[#2d3154] text-gray-400 hover:border-purple-400'"
                >
                  <div class="flex flex-col items-center gap-2">
                    <span class="text-2xl">📂</span>
                    <span class="text-base">加入現有圖譜</span>
                  </div>
                </button>
              </div>

              <!-- 新建圖譜：顯示已選擇的圖譜 -->
              <div v-if="importMode === 'new' && graphName" class="mt-4">
                <div class="p-4 bg-blue-900/20 border-2 border-blue-500/50 rounded-xl">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-3xl">{{ newGraphData.icon || '🌐' }}</span>
                      <div>
                        <p class="font-bold text-blue-300">{{ graphName }}</p>
                        <p class="text-sm text-blue-400">新建圖譜</p>
                      </div>
                    </div>
                    <button
                      @click="showCreateGraphDialog = true"
                      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-sm"
                    >
                      <svg class="w-4 h-4 inline mr-1" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z"/></svg>編輯
                    </button>
                  </div>
                </div>
              </div>

              <!-- 現有圖譜：選擇列表 -->
              <div v-if="importMode === 'existing'" class="mt-4">
                <label class="block text-sm font-bold text-purple-300 mb-2">
                  📂 選擇圖譜
                </label>
                <select 
                  v-model="selectedGraphId"
                  class="w-full px-4 py-3 bg-white/5 border-2 border-purple-500/50 rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                  <option value="" disabled>請選擇要加入的圖譜...</option>
                  <option 
                    v-for="graph in graphStore.graphMetadataList" 
                    :key="graph.id" 
                    :value="graph.id"
                  >
                    {{ graph.name }} (節點數: {{ graph.nodeCount || 0 }})
                  </option>
                </select>
                <p class="mt-2 text-sm text-purple-400">
                  💡 數據將加入到所選的現有圖譜中
                </p>
              </div>

              <!-- AI Link 選項 -->
              <div class="mt-6 pt-6 border-t-2 border-[#2d3154]">
                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-2 border-emerald-500/50 rounded-xl">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">🤖</span>
                    <div>
                      <p class="font-bold text-emerald-300 text-base">AI 智能連線</p>
                      <p class="text-sm text-emerald-400">自動分析並建立節點間的關聯性</p>
                    </div>
                  </div>
                  <button
                    @click="enableAILink = !enableAILink"
                    class="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    :class="enableAILink ? 'bg-emerald-500' : 'bg-gray-600'"
                  >
                    <span
                      class="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform"
                      :class="enableAILink ? 'translate-x-9' : 'translate-x-1'"
                    />
                  </button>
                </div>
                <p v-if="enableAILink" class="mt-3 text-sm text-emerald-400 flex items-start gap-2">
                  <span>✨</span>
                  <span>啟用後，系統將使用 AI 分析節點內容，自動建議並創建相關連線，提升圖譜結構的完整性</span>
                </p>
                <p v-else class="mt-3 text-sm text-gray-400 flex items-start gap-2">
                  <svg class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                  <span>關閉 AI 連線功能，僅根據現有數據建立基礎關係</span>
                </p>
                
                <!-- RAGFlow 知識庫選擇（當 AI Link 啟用時顯示） -->
                <div v-if="enableAILink" class="mt-4 p-4 bg-purple-900/20 rounded-lg border-2 border-purple-700">
                  <label class="block text-sm font-bold text-purple-300 mb-2">
                    📚 RAGFlow 知識庫
                  </label>
                  <select
                    v-model="selectedDatasetId"
                    class="w-full px-4 py-2 bg-[#1a1d3a] border-2 border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
                  >
                    <option value="">不使用 RAGFlow（僅本地處理）</option>
                    <option v-for="dataset in ragflowDatasets" :key="dataset.id" :value="dataset.id">
                      {{ dataset.name }}
                    </option>
                  </select>
                  <p class="mt-2 text-xs text-purple-400">
                    選擇知識庫後，文檔將同時上傳到 RAGFlow 進行深度語義分析
                  </p>
                </div>
              </div>
            </div>

            <!-- 上傳按鈕 -->
            <div class="mt-6 flex gap-4">
              <button
                @click="uploadFiles"
                :disabled="uploadStatus === 'uploading'"
                class="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all font-bold text-lg shadow-lg disabled:cursor-not-allowed"
              >
                <span v-if="uploadStatus !== 'uploading'">🚀 開始上傳</span>
                <span v-else>⏳ 上傳中... ({{ uploadedCount }}/{{ files.length }})</span>
              </button>
              <button
                @click="clearFiles"
                :disabled="uploadStatus === 'uploading'"
                class="px-8 py-4 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-bold text-lg disabled:cursor-not-allowed"
              >
                清空列表
              </button>
            </div>
          </div>

          <!-- 上傳進度 -->
          <div v-if="uploadStatus === 'uploading'" class="mt-6">
            <!-- 進度條 -->
            <div class="bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                class="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            
            <!-- 進度文字 -->
            <div class="mt-3 space-y-2">
              <p class="text-center text-base font-bold text-gray-300">
                上傳進度: {{ uploadProgress.toFixed(0) }}% ({{ uploadedCount }}/{{ files.length }})
              </p>
              
              <!-- 當前處理的文件 -->
              <div v-if="currentProcessingFile" class="flex items-center justify-center gap-2 text-sm text-blue-400">
                <svg class="w-4 h-4 animate-spin" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
                <span class="font-semibold">{{ currentProcessingFile }}</span>
              </div>
              
              <!-- 處理階段 -->
              <div v-if="processingStage" class="text-center text-xs text-gray-400">
                {{ processingStage }}
              </div>
            </div>
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
                    {{ result.message || result.error }}
                  </p>
                  <p v-if="result.success && result.saved_path" class="text-xs text-gray-400 mt-1">
                    儲存路徑: {{ result.saved_path }}
                  </p>
                  
                  <!-- 後台處理進度顯示 -->
                  <div v-if="result.success && uploadStatus === 'completed'" class="mt-3 space-y-2">
                    <!-- 進度條 -->
                    <div class="bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        :style="{ width: result.processingProgress || '30%' }"
                      ></div>
                    </div>
                    
                    <!-- 當前處理步驟 -->
                    <div class="flex items-center gap-2 text-xs">
                      <svg class="w-3.5 h-3.5 animate-spin text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
                      <span class="text-gray-300 font-medium">
                        {{ result.processingStage || '📥 已接收文件，等待處理...' }}
                      </span>
                    </div>
                    
                    <!-- 處理階段列表 -->
                    <div class="pl-6 space-y-1 text-xs text-gray-400">
                      <div class="flex items-center gap-2">
                        <span>{{ result.stage1Done ? '✅' : '⏳' }}</span>
                        <span>文件解析與內容提取</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span>{{ result.stage2Done ? '✅' : '⏳' }}</span>
                        <span>RAGFlow 語義分析</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span>{{ result.stage3Done ? '✅' : '⏳' }}</span>
                        <span>圖譜節點創建與連線</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 創建圖譜彈窗 -->
    <div
      v-if="showCreateGraphDialog"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="closeCreateGraphDialog"
    >
      <div class="bg-[#1a1d3a] border-2 border-[#2d3154] rounded-3xl shadow-2xl max-w-2xl w-full mx-4 p-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-white flex items-center gap-3">
            <span class="text-4xl">✨</span>
            {{ graphName ? '編輯圖譜資訊' : '創建新圖譜' }}
          </h2>
          <button
            @click="closeCreateGraphDialog"
            class="text-gray-400 hover:text-gray-200 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div class="space-y-6">
          <!-- 圖譜名稱 -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-2">
              📝 圖譜名稱 *
            </label>
            <input
              v-model="newGraphData.name"
              type="text"
              placeholder="例如：產品規劃、技術文檔、會議記錄..."
              class="w-full px-4 py-3 bg-white/5 border-2 border-[#2d3154] rounded-xl text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <!-- 圖譜描述 -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-2">
              📄 圖譜描述
            </label>
            <textarea
              v-model="newGraphData.description"
              rows="3"
              placeholder="簡單描述這個圖譜的用途和內容..."
              class="w-full px-4 py-3 bg-white/5 border-2 border-[#2d3154] rounded-xl text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            ></textarea>
          </div>

          <!-- 圖示選擇 -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-2">
              🎨 選擇圖示
            </label>
            <div class="grid grid-cols-8 gap-3">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                @click="newGraphData.icon = icon"
                class="aspect-square flex items-center justify-center text-3xl rounded-xl border-2 transition-all hover:scale-110"
                :class="newGraphData.icon === icon 
                  ? 'border-blue-500 bg-blue-900/20 shadow-lg' 
                  : 'border-[#2d3154] bg-white/5 hover:border-blue-400'"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <!-- 按鈕區 -->
          <div class="flex gap-4 pt-4">
            <button
              @click="handleCreateGraph"
              :disabled="!newGraphData.name.trim() || isCreatingGraph"
              class="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg disabled:cursor-not-allowed"
            >
              <span v-if="!isCreatingGraph">✨ 創建圖譜</span>
              <span v-else>⏳ 創建中...</span>
            </button>
            <button
              @click="closeCreateGraphDialog"
              :disabled="isCreatingGraph"
              class="px-6 py-4 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-xl font-bold text-lg transition-colors disabled:cursor-not-allowed"
            >
              取消
            </button>
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
import { authFetch } from '../services/apiClient';

// ===== Store =====
const graphStore = useGraphStore();

// ===== State =====
const isDragging = ref(false);
const files = ref([]);
const uploadStatus = ref('ready'); // 'ready', 'uploading', 'completed'
const uploadedCount = ref(0);
const uploadProgress = ref(0);
const uploadResults = ref([]);
const currentProcessingFile = ref(''); // 當前處理的文件名
const processingStage = ref(''); // 當前處理階段

// 圖譜選擇相關
const importMode = ref('new'); // 'new' | 'existing'
const graphName = ref('');
const selectedGraphId = ref('');
const enableAILink = ref(true); // AI 智能連線功能

// RAGFlow 相關
const selectedDatasetId = ref(''); // 選中的 RAGFlow 知識庫 ID
const ragflowDatasets = ref([]); // RAGFlow 知識庫列表

// 文件输入引用
const fileInput = ref(null);

// 創建圖譜相關
const showCreateGraphDialog = ref(false);
const isCreatingGraph = ref(false);
const newGraphData = ref({
  name: '',
  description: '',
  icon: '🌐',
  color: '#3b82f6'
});

const availableIcons = [
  '🌐', '🧠', '📚', '💼', '🔬', '🎯', '📊', '🗂',
  '💡', '🚀', '🎨', '📝', '🔧', '⚡', '🌟', '📱'
];

// ===== Methods =====
const getStatusText = () => {
  switch(uploadStatus.value) {
    case 'ready':
      return isDragging.value ? '放開以上傳' : '將檔案拖放到此處或點擊上傳';
    case 'uploading':
      return '上傳中...';
    case 'completed':
      return '✅ 已進入排程';
    default:
      return '準備中...';
  }
};

const getStatusSubtext = () => {
  switch(uploadStatus.value) {
    case 'ready':
      return '支援多檔案選取';
    case 'uploading':
      return '請稍候，正在處理檔案...';
    case 'completed':
      return '檔案已送入神經網路，正在解析中...';
    default:
      return '';
  }
};

const triggerFileInput = () => {
  if (uploadStatus.value === 'uploading') return;
  fileInput.value.click();
};

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files);
  addFiles(selectedFiles);
};

const handleDrop = (event) => {
  isDragging.value = false;
  const droppedFiles = Array.from(event.dataTransfer.files);
  addFiles(droppedFiles);
};

const addFiles = (newFiles) => {
  // 過濾已存在的檔案
  const existingNames = files.value.map(f => f.name);
  const uniqueFiles = newFiles.filter(f => !existingNames.includes(f.name));
  files.value.push(...uniqueFiles);
  
  // 重置狀態
  uploadStatus.value = 'ready';
  uploadResults.value = [];
};

const removeFile = (index) => {
  files.value.splice(index, 1);
};

const clearFiles = () => {
  files.value = [];
  uploadResults.value = [];
  uploadStatus.value = 'ready';
};

const uploadFiles = async () => {
  if (files.value.length === 0 || uploadStatus.value === 'uploading') return;

  // 驗證：新建模式需要圖譜名稱（如果還沒創建，先打開對話框）
  if (importMode.value === 'new' && !graphName.value.trim()) {
    ElMessage.warning('⚠️ 請先建立新圖譜');
    showCreateGraphDialog.value = true;
    return;
  }

  // 驗證：現有模式需要選擇圖譜
  if (importMode.value === 'existing' && !selectedGraphId.value) {
    ElMessage.warning('⚠️ 請選擇要加入的圖譜');
    return;
  }

  uploadStatus.value = 'uploading';
  uploadedCount.value = 0;
  uploadProgress.value = 0;
  uploadResults.value = [];

  try {
    console.log('📡 [ImportPage] 開始上傳檔案...', {
      count: files.value.length,
      mode: importMode.value,
      graphName: graphName.value,
      graphId: selectedGraphId.value
    });

    // 逐個上傳檔案
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i];
      currentProcessingFile.value = file.name;
      processingStage.value = '📤 正在上傳檔案到伺服器...';
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // 添加圖譜資訊
        if (importMode.value === 'new') {
          formData.append('graph_mode', 'new');
          formData.append('graph_name', graphName.value.trim());
          console.log('🚀 上傳檔案至新圖譜:', graphName.value.trim());
        } else {
          formData.append('graph_mode', 'existing');
          formData.append('graph_id', selectedGraphId.value);
          const selectedGraph = graphStore.graphMetadataList.find(g => g.id === selectedGraphId.value);
          console.log('🚀 上傳檔案至現有圖譜:', selectedGraph?.name || selectedGraphId.value);
        }
        
        // 添加 AI Link 設定
        formData.append('enable_ai_link', enableAILink.value ? 'true' : 'false');
        console.log('🤖 AI 智能連線:', enableAILink.value ? '啟用' : '關閉');
        
        // 添加 RAGFlow 知識庫 ID（如果選擇了）
        if (enableAILink.value && selectedDatasetId.value) {
          formData.append('ragflow_dataset_id', selectedDatasetId.value);
          const selectedDataset = ragflowDatasets.value.find(d => d.id === selectedDatasetId.value);
          console.log('📚 RAGFlow 知識庫:', selectedDataset?.name || selectedDatasetId.value);
        }

        processingStage.value = '⏳ 伺服器處理中（解析、分析、建立節點）...';
        
        const response = await authFetch('/api/system/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (result.success) {
          processingStage.value = '✅ 處理完成！';
        } else {
          processingStage.value = '❌ 處理失敗';
        }
        
        uploadResults.value.push({
          ...result,
          filename: file.name,
          processingProgress: result.ragflow_processed ? '30%' : '50%',
          processingStage: result.ragflow_processed 
            ? '📥 已送入 RAGFlow，等待解析...' 
            : '📥 已接收文件，開始後台處理...',
          stage1Done: true,
          stage2Done: false,
          stage3Done: false
        });
        
        // 啟動真實進度追蹤（如果有 RAGFlow 文檔 ID）
        if (result.success && result.ragflow_processed && result.ragflow_doc_ids?.length > 0) {
          pollRAGFlowProgress(
            uploadResults.value.length - 1,
            result.ragflow_dataset_id,
            result.ragflow_doc_ids[0]
          );
        } else if (result.success) {
          // 無 RAGFlow — 本地處理完成
          simulateLocalProcessing(uploadResults.value.length - 1);
        }

      } catch (error) {
        processingStage.value = '❌ 上傳錯誤';
        uploadResults.value.push({
          success: false,
          filename: file.name,
          error: error.message || '網路錯誤'
        });
      }

      uploadedCount.value++;
      uploadProgress.value = (uploadedCount.value / files.value.length) * 100;
      
      // 每個文件完成後暫停 500ms，讓用戶看到進度
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    uploadStatus.value = 'completed';
    currentProcessingFile.value = '';
    processingStage.value = '';
    
    // 🌟 上傳成功後刷新圖譜數據
    console.log('✅ 上傳完成，刷新圖譜數據...');
    try {
      // 根據導入模式傳入正確的圖譜 ID
      if (importMode.value === 'existing' && selectedGraphId.value) {
        await graphStore.fetchGraphData(selectedGraphId.value);
      } else {
        // 新建模式：重新載入圖譜元數據列表，然後選擇最新的圖譜
        await graphStore.fetchGraphData(graphStore.currentGraphId);
      }
    } catch (error) {
      console.warn('⚠️ 刷新圖譜數據失敗:', error);
      // 不中斷流程，繼續顯示成功消息
    }
    
    ElMessage.success(`✅ 成功上傳 ${files.value.length} 個檔案`);
    
    // 3秒後重置狀態
    setTimeout(() => {
      files.value = [];
      uploadStatus.value = 'ready';
      graphName.value = '';
      selectedGraphId.value = '';
    }, 3000);

  } catch (error) {
    console.error('❌ 上傳錯誤:', error);
    ElMessage.error('上傳失敗: ' + error.message);
    uploadStatus.value = 'ready';
  }
};

const getFileIcon = (filename) => {
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
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 處理創建圖譜
 */
const handleCreateGraph = async () => {
  if (!newGraphData.value.name.trim()) {
    ElMessage.warning('⚠️ 請輸入圖譜名稱');
    return;
  }
  
  isCreatingGraph.value = true;
  
  try {
    console.log('🔄 創建圖譜:', newGraphData.value);
    
    // 調用 Store 創建圖譜
    const createdGraph = await graphStore.createGraph(newGraphData.value);
    
    ElMessage.success({
      message: `✅ 圖譜「${createdGraph.name}」創建成功！`,
      duration: 3000
    });
    
    // 自動設置為新建模式並使用新創建的圖譜
    importMode.value = 'new';
    graphName.value = createdGraph.name;
    selectedGraphId.value = createdGraph.id;
    
    // 保存當前創建的圖譜圖示
    newGraphData.value.icon = createdGraph.icon;
    
    // 關閉彈窗
    showCreateGraphDialog.value = false;
    
    console.log('✅ 圖譜創建完成:', createdGraph);
    
  } catch (error) {
    console.error('❌ 創建圖譜失敗:', error);
    ElMessage.error('創建圖譜失敗: ' + error.message);
  } finally {
    isCreatingGraph.value = false;
  }
};

/**
 * 關閉創建圖譜對話框
 */
const closeCreateGraphDialog = () => {
  showCreateGraphDialog.value = false;
  // 如果沒有已創建的圖譜，重置表單
  if (!graphName.value) {
    newGraphData.value = {
      name: '',
      description: '',
      icon: '🌐',
      color: '#3b82f6'
    };
  }
};

/**
 * 真實 RAGFlow 進度追蹤 — 輪詢文檔解析狀態
 */
const pollRAGFlowProgress = async (resultIndex, datasetId, documentId) => {
  const maxAttempts = 120; // 最多輪詢 120 次（每 3 秒一次 = 6 分鐘）
  let attempts = 0;
  
  // 階段 1: 已上傳
  if (uploadResults.value[resultIndex]) {
    uploadResults.value[resultIndex].processingProgress = '30%';
    uploadResults.value[resultIndex].processingStage = '📄 RAGFlow 接收文件中...';
    uploadResults.value[resultIndex].stage1Done = true;
  }
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 每 3 秒輪詢
    attempts++;
    
    if (!uploadResults.value[resultIndex]) break;
    
    try {
      const response = await authFetch(
        `/api/ragflow/documents/${datasetId}/status/${documentId}`
      );
      const statusData = await response.json();
      
      if (statusData.code !== 0) {
        console.warn('⚠️ RAGFlow 狀態查詢失敗:', statusData);
        continue;
      }
      
      const doc = statusData.data;
      const progress = doc.progress || 0;
      const runStatus = doc.run; // UNSTART, RUNNING, DONE, FAIL, CANCEL
      
      // 更新進度 (30% ~ 95% 映射)
      const displayProgress = Math.round(30 + progress * 65);
      uploadResults.value[resultIndex].processingProgress = `${displayProgress}%`;
      
      if (runStatus === 'RUNNING' || runStatus === '1') {
        uploadResults.value[resultIndex].processingStage = `🧠 RAGFlow 解析中 (${Math.round(progress * 100)}%)...`;
        uploadResults.value[resultIndex].stage2Done = false;
      } else if (runStatus === 'DONE' || runStatus === '3') {
        // 解析完成
        uploadResults.value[resultIndex].processingProgress = '100%';
        uploadResults.value[resultIndex].processingStage = `✅ RAGFlow 解析完成！(${doc.chunk_count} 個分塊)`;
        uploadResults.value[resultIndex].stage2Done = true;
        uploadResults.value[resultIndex].stage3Done = true;
        console.log(`✅ 文檔 ${doc.name} 解析完成: ${doc.chunk_count} chunks, ${doc.token_count} tokens`);
        break;
      } else if (runStatus === 'FAIL' || runStatus === '4') {
        uploadResults.value[resultIndex].processingProgress = '100%';
        uploadResults.value[resultIndex].processingStage = '❌ RAGFlow 解析失敗';
        uploadResults.value[resultIndex].stage2Done = true;
        uploadResults.value[resultIndex].stage3Done = false;
        console.error('❌ RAGFlow 解析失敗:', doc.progress_msg);
        break;
      } else if (runStatus === 'CANCEL' || runStatus === '2') {
        uploadResults.value[resultIndex].processingStage = '⏹️ 解析已取消';
        break;
      }
      // UNSTART — 繼續等待
    } catch (error) {
      console.warn('⚠️ 輪詢 RAGFlow 狀態失敗:', error);
      // 不中斷，繼續輪詢
    }
  }
  
  if (attempts >= maxAttempts && uploadResults.value[resultIndex]) {
    uploadResults.value[resultIndex].processingStage = '⏰ 解析超時，請到 RAGFlow 控制台查看';
  }
};

/**
 * 本地處理進度模擬（未啟用 RAGFlow 時使用）
 */
const simulateLocalProcessing = async (resultIndex) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (uploadResults.value[resultIndex]) {
    uploadResults.value[resultIndex].processingProgress = '60%';
    uploadResults.value[resultIndex].processingStage = '📄 正在解析文件內容...';
    uploadResults.value[resultIndex].stage1Done = true;
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  if (uploadResults.value[resultIndex]) {
    uploadResults.value[resultIndex].processingProgress = '90%';
    uploadResults.value[resultIndex].processingStage = '🔗 建立圖譜節點...';
    uploadResults.value[resultIndex].stage2Done = true;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (uploadResults.value[resultIndex]) {
    uploadResults.value[resultIndex].processingProgress = '100%';
    uploadResults.value[resultIndex].processingStage = '✅ 本地處理完成！';
    uploadResults.value[resultIndex].stage3Done = true;
  }
};

/**
 * 加載 RAGFlow 知識庫列表
 */
const loadRAGFlowDatasets = async () => {
  try {
    console.log('📚 正在加載 RAGFlow 知識庫列表...');
    const response = await authFetch('/api/ragflow/datasets');
    
    if (response.ok) {
      const data = await response.json();
      
      // 🔍 調試：輸出完整 API 回應
      console.log('🔍 [DEBUG] API 完整回應:', data);
      console.log('🔍 [DEBUG] data.code:', data.code);
      console.log('🔍 [DEBUG] data.data 類型:', typeof data.data);
      console.log('🔍 [DEBUG] data.data 是否為陣列:', Array.isArray(data.data));
      console.log('🔍 [DEBUG] data.data 內容:', data.data);
      
      // RAGFlow API 返回格式：{ code: 0, data: [...], total_datasets: N }
      ragflowDatasets.value = data.data || [];
      console.log(`✅ 已加載 ${ragflowDatasets.value.length} 個 RAGFlow 知識庫`);
      console.log('🔍 [DEBUG] ragflowDatasets.value:', ragflowDatasets.value);
      console.log('🔍 [DEBUG] JSON 格式:', JSON.stringify(ragflowDatasets.value, null, 2));
      
      // 輸出知識庫名稱供調試
      if (ragflowDatasets.value.length > 0) {
        console.log('📋 可用知識庫:', ragflowDatasets.value.map(d => d.name).join(', '));
        console.log('🔍 [DEBUG] 第一個知識庫 id:', ragflowDatasets.value[0].id);
        console.log('🔍 [DEBUG] 第一個知識庫 name:', ragflowDatasets.value[0].name);
      } else {
        console.warn('⚠️ [WARNING] ragflowDatasets 是空陣列！');
      }
    } else {
      console.warn('⚠️ RAGFlow API 返回錯誤:', response.status);
    }
  } catch (error) {
    console.error('❌ 無法連接到 RAGFlow 服務:', error);
    // 不顯示錯誤消息，靜默失敗
  }
};

// ===== Lifecycle =====
onMounted(async () => {
  // 頁面載入時自動獲取圖譜列表
  if (graphStore.graphMetadataList.length === 0) {
    try {
      console.log('🔄 [ImportPage] 載入圖譜列表');
      await graphStore.fetchGraphData(graphStore.currentGraphId);
    } catch (error) {
      console.warn('⚠️ [ImportPage] 圖譜列表載入失敗:', error.message);
    }
  }
  
  // 加載 RAGFlow 知識庫列表
  await loadRAGFlowDatasets();
});
</script>

<style scoped>
/* 自定義滾動條樣式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.6));
  border-radius: 4px;
  transition: background 0.3s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8));
}

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
  .custom-scrollbar {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* 移動設備上調整標題大小 */
  h1 {
    font-size: 2rem !important;
  }
  
  h1 span:first-child {
    font-size: 3rem !important;
  }
}

@media (max-width: 640px) {
  .custom-scrollbar {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}
</style>
