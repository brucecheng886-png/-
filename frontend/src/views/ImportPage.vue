<template>
  <div class="h-screen overflow-y-auto bg-[#0a0e27] px-6 py-8 custom-scrollbar">
    <!-- 頁面標題（置中） -->
    <header class="max-w-7xl mx-auto mb-8 text-center">
      <h1 class="flex items-center justify-center gap-3 m-0 text-4xl font-extrabold text-white">
        <span class="text-5xl">📥</span>
        <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">資料導入工作台</span>
      </h1>
      <p class="text-sm font-medium text-gray-400 uppercase tracking-widest mt-2">Data Import Workbench</p>
    </header>

    <!-- ==================== 三欄佈局 ==================== -->
    <div class="max-w-7xl mx-auto grid grid-cols-12 gap-5 mb-8">

      <!-- ===== 左欄：自動處理流程 ===== -->
      <div class="col-span-12 lg:col-span-3">
        <div class="bg-[#1a1d3a] border border-[#2d3154] rounded-2xl p-5 h-full">
          <div class="flex items-center gap-2 mb-5">
            <span class="text-xl">💡</span>
            <h3 class="text-base font-bold text-amber-300 m-0">自動處理流程</h3>
          </div>

          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <span class="text-green-500 text-sm mt-0.5 flex-shrink-0">✓</span>
              <div>
                <p class="text-sm font-semibold text-white m-0">上傳檔案</p>
                <p class="text-xs text-gray-400 m-0 mt-0.5">支援 PDF、DOCX、XLSX、TXT、MD</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-green-500 text-sm mt-0.5 flex-shrink-0">✓</span>
              <div>
                <p class="text-sm font-semibold text-white m-0">自動監控</p>
                <p class="text-xs text-gray-400 m-0 mt-0.5">RAGFlow/MinIO 自動排隊處理解析</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-green-500 text-sm mt-0.5 flex-shrink-0">✓</span>
              <div>
                <p class="text-sm font-semibold text-white m-0">RAGFlow 處理</p>
                <p class="text-xs text-gray-400 m-0 mt-0.5">自動上傳至 RAGFlow 知識庫</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-green-500 text-sm mt-0.5 flex-shrink-0">✓</span>
              <div>
                <p class="text-sm font-semibold text-white m-0">圖譜建立</p>
                <p class="text-xs text-gray-400 m-0 mt-0.5">KuzuDB 自動解析並建立圖譜節點</p>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-4 border-t border-[#2d3154]">
            <p class="text-xs text-gray-400 flex items-start gap-2 m-0">
              <svg class="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
              <span>上傳完後即可關掉，系統將自動完成所有處理。</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ===== 中欄：檔案上傳區 ===== -->
      <div class="col-span-12 lg:col-span-5">
        <div class="bg-[#1a1d3a] border border-[#2d3154] rounded-2xl h-full flex flex-col">
          <!-- 卡片標題列 -->
          <div class="px-5 py-4 border-b border-[#2d3154] flex items-center justify-between">
            <h3 class="text-base font-bold text-white m-0 flex items-center gap-2">
              <span class="text-lg">📂</span> 檔案上傳區
            </h3>
            <button
              v-if="uploadResults.length > 0"
              class="text-xs text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
              @click="showInfoCard = !showInfoCard"
            >
              <span>🕐</span> 上傳歷史
            </button>
          </div>

          <!-- 拖曳上傳區 -->
          <div class="flex-1 p-5 flex items-center justify-center">
            <div
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @click="triggerFileInput"
              class="w-full border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
              :class="[
                isDragging
                  ? 'border-blue-500 bg-blue-900/20 scale-[1.02]'
                  : 'border-[#2d3154] hover:border-blue-400 hover:bg-blue-900/5',
                uploadStatus === 'uploading' ? 'pointer-events-none opacity-60' : ''
              ]"
            >
              <!-- Cloud upload icon -->
              <div class="mb-5">
                <svg class="w-20 h-20 text-blue-500/40" fill="none" viewBox="0 0 80 80">
                  <path d="M40 55V30M30 40l10-10 10 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 52a18 18 0 01-2-8 18 18 0 0135-6 14 14 0 0110 24H22z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>

              <p class="text-xl font-bold text-white mb-1">拖放檔案至此</p>
              <p class="text-sm text-gray-400 mb-1">
                或者 <span class="text-blue-400">點擊此處</span>選擇您的電腦
              </p>
              <p class="text-xs text-gray-500 mb-5">支援同時上傳多個檔案</p>

              <!-- 檔案類型標籤 -->
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-lg text-xs font-semibold">PDF</span>
                <span class="px-3 py-1 bg-green-900/30 text-green-300 rounded-lg text-xs font-semibold">DOCX</span>
                <span class="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-lg text-xs font-semibold">XLSX</span>
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

          <!-- 上傳進度（上傳中顯示） -->
          <div v-if="uploadStatus === 'uploading'" class="px-5 pb-5">
            <div class="bg-gray-700 rounded-full h-2.5 overflow-hidden mb-2">
              <div
                class="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-center text-xs text-gray-400 m-0">
              上傳進度 {{ uploadProgress.toFixed(0) }}% ({{ uploadedCount }}/{{ files.length }})
              <span v-if="currentProcessingFile" class="text-blue-400 ml-1">— {{ currentProcessingFile }}</span>
            </p>
            <p v-if="processingStage" class="text-center text-xs text-gray-500 mt-1 m-0">{{ processingStage }}</p>
          </div>
        </div>
      </div>

      <!-- ===== 右欄：配置與列表 ===== -->
      <div class="col-span-12 lg:col-span-4">
        <div class="bg-[#1a1d3a] border border-[#2d3154] rounded-2xl h-full flex flex-col">
          <!-- 卡片標題列 -->
          <div class="px-5 py-4 border-b border-[#2d3154] flex items-center justify-between">
            <h3 class="text-base font-bold text-white m-0 flex items-center gap-2">
              <span class="text-lg">⚙️</span> 配置與列表
            </h3>
            <button
              v-if="files.length > 0"
              @click="clearFiles"
              class="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors"
            >全部刪除</button>
          </div>

          <!-- 內容區（可滾動） -->
          <div class="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-4">

            <!-- ── 已選擇的檔案 ── -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-white">已選擇的檔案</span>
                <span
                  v-if="files.length > 0 && uploadStatus === 'completed'"
                  class="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full"
                >全部完成</span>
              </div>

              <!-- 檔案列表 -->
              <div v-if="files.length > 0" class="space-y-2">
                <div
                  v-for="(file, index) in files"
                  :key="index"
                  class="flex items-center gap-3 p-3 bg-white/5 border border-[#2d3154] rounded-xl group"
                >
                  <span class="text-2xl flex-shrink-0">{{ getFileIcon(file.name) }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-white truncate m-0">{{ file.name }}</p>
                    <p class="text-xs text-gray-500 m-0">{{ formatFileSize(file.size) }}</p>
                  </div>
                  <button
                    @click="removeFile(index)"
                    class="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all text-sm flex-shrink-0"
                  >✕</button>
                </div>
              </div>

              <!-- 空狀態 -->
              <div v-else class="p-6 text-center border border-dashed border-[#2d3154] rounded-xl">
                <p class="text-xs text-gray-500 m-0">尚未選擇檔案</p>
              </div>
            </div>

            <!-- ── 導入範圍 ── -->
            <div class="border-t border-[#2d3154] pt-4">
              <p class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3 m-0">導入範圍</p>

              <!-- 🎯 目標圖譜 -->
              <label class="block text-sm font-semibold text-purple-300 mb-1.5">🎯 目標圖譜</label>
              <div class="relative" ref="graphDropdownRef">
                <button
                  @click="graphDropdownOpen = !graphDropdownOpen"
                  class="w-full px-3 py-2.5 bg-white/5 border border-[#2d3154] rounded-xl text-sm text-left focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                  :class="selectedGraphId ? 'text-white' : 'text-gray-400'"
                >
                  <span v-if="importMode === 'new' && graphName" class="flex items-center gap-2 truncate">
                    <span>{{ newGraphData.icon || '🌐' }}</span>
                    <span class="text-purple-300 font-semibold">{{ graphName }}</span>
                    <span class="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">新建</span>
                  </span>
                  <span v-else-if="selectedGraphId && importMode === 'existing'" class="flex items-center gap-2 truncate">
                    <span>{{ graphStore.graphMetadataList.find(g => g.id === selectedGraphId)?.icon || '📂' }}</span>
                    {{ graphStore.graphMetadataList.find(g => g.id === selectedGraphId)?.name || '未知圖譜' }}
                  </span>
                  <span v-else>請選擇要加入的圖譜...</span>
                  <svg class="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 opacity-50" :class="{ 'rotate-180': graphDropdownOpen }" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L2 4h8L6 8z"/></svg>
                </button>
                <Transition name="dropdown">
                  <div v-show="graphDropdownOpen" class="absolute left-0 right-0 mt-1 bg-[#1a1f2e] border border-purple-500/30 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                    <div class="max-h-44 overflow-y-auto custom-scrollbar py-1">
                      <div
                        v-for="graph in graphStore.graphMetadataList"
                        :key="graph.id"
                        class="px-3 py-2.5 text-sm cursor-pointer transition-all hover:bg-purple-500/10 flex items-center justify-between"
                        :class="selectedGraphId === graph.id && importMode === 'existing' ? 'text-purple-300 bg-purple-500/15 font-semibold' : 'text-gray-300'"
                        @click="selectExistingGraph(graph.id)"
                      >
                        <span class="flex items-center gap-2">
                          <span>{{ graph.icon || '📂' }}</span>
                          {{ graph.name }}
                        </span>
                        <span class="text-xs text-gray-500">{{ graph.nodeCount || 0 }}</span>
                      </div>
                      <div v-if="graphStore.graphMetadataList.length === 0" class="px-3 py-2.5 text-sm text-gray-500 text-center">暫無可用圖譜</div>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- 建立新圖譜 -->
              <button
                @click="showCreateGraphDialog = true"
                class="mt-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-blue-500/40 bg-blue-900/10 text-blue-300 hover:bg-blue-900/20 hover:border-blue-500/60 transition-all flex items-center justify-center gap-1.5 text-sm"
              >
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
                建立新圖譜
              </button>
            </div>

            <!-- ── AI 智能連線 ── -->
            <div class="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/40 rounded-xl">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">🤖</span>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-bold text-emerald-300 text-sm m-0">AI 智能連線</p>
                    <span
                      class="text-xs px-1.5 py-0.5 rounded-full"
                      :class="enableAILink ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-600/30 text-gray-400'"
                    >{{ enableAILink ? '功能已啟用' : '功能關閉' }}</span>
                  </div>
                </div>
              </div>
              <button
                @click="enableAILink = !enableAILink"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                :class="enableAILink ? 'bg-emerald-500' : 'bg-gray-600'"
              >
                <span class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform" :class="enableAILink ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <p v-if="enableAILink" class="text-xs text-emerald-400/80 -mt-2 px-1 m-0">
              啟用後，系統將使用 LLM 分析內容，自動建議並創建相關連線。
            </p>

            <!-- ── RAGFlow 知識庫 ── -->
            <Transition name="dropdown">
              <div v-if="enableAILink">
                <label class="block text-sm font-semibold text-purple-300 mb-1.5">📚 RAGFlow 知識庫</label>
                <div class="relative" ref="ragflowDropdownRef">
                  <button
                    @click="ragflowDropdownOpen = !ragflowDropdownOpen"
                    class="w-full px-3 py-2.5 bg-white/5 border border-[#2d3154] rounded-xl text-sm text-left focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                    :class="selectedDatasetId ? 'text-white' : 'text-gray-400'"
                  >
                    <span v-if="selectedDatasetId">{{ ragflowDatasets.find(d => d.id === selectedDatasetId)?.name || selectedDatasetId }}</span>
                    <span v-else>不使用 RAGFlow（僅本地處理）</span>
                    <svg class="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 opacity-50" :class="{ 'rotate-180': ragflowDropdownOpen }" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L2 4h8L6 8z"/></svg>
                  </button>
                  <Transition name="dropdown">
                    <div v-show="ragflowDropdownOpen" class="absolute left-0 right-0 mt-1 bg-[#1a1f2e] border border-purple-500/30 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                      <div class="max-h-36 overflow-y-auto custom-scrollbar py-1">
                        <div
                          class="px-3 py-2 text-sm cursor-pointer hover:bg-white/10 transition-all"
                          :class="!selectedDatasetId ? 'text-purple-300 bg-purple-500/10 font-semibold' : 'text-gray-400'"
                          @click="selectedDatasetId = ''; ragflowDropdownOpen = false"
                        >不使用 RAGFlow</div>
                        <div
                          v-for="dataset in ragflowDatasets"
                          :key="dataset.id"
                          class="px-3 py-2 text-sm cursor-pointer hover:bg-purple-500/10 transition-all"
                          :class="selectedDatasetId === dataset.id ? 'text-purple-300 bg-purple-500/15 font-semibold' : 'text-gray-300'"
                          @click="selectedDatasetId = dataset.id; ragflowDropdownOpen = false"
                        >{{ dataset.name }}</div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 底部按鈕 -->
          <div class="px-5 py-4 border-t border-[#2d3154] flex gap-3">
            <button
              @click="clearFiles"
              :disabled="uploadStatus === 'uploading'"
              class="flex-1 px-4 py-2.5 bg-white/5 border border-[#2d3154] hover:bg-white/10 text-gray-300 rounded-xl transition-colors font-semibold text-sm disabled:opacity-50"
            >清空</button>
            <button
              @click="uploadFiles"
              :disabled="uploadStatus === 'uploading' || files.length === 0"
              class="flex-[2] px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg disabled:cursor-not-allowed"
            >
              <span v-if="uploadStatus !== 'uploading'">🚀 開始上傳</span>
              <span v-else>⏳ {{ uploadedCount }}/{{ files.length }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 上傳結果 ==================== -->
    <div v-if="uploadResults.length > 0" class="max-w-7xl mx-auto mb-8">
      <div class="bg-[#1a1d3a] border border-[#2d3154] rounded-2xl shadow-xl overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-green-600/80 to-teal-600/80 border-b border-white/10">
          <h2 class="text-lg font-bold text-white flex items-center gap-2 m-0">
            <span class="text-xl">✅</span> 上傳結果
          </h2>
        </div>
        <div class="p-5 space-y-3">
          <div
            v-for="(result, index) in uploadResults"
            :key="index"
            class="p-4 rounded-xl border"
            :class="result.success ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'"
          >
            <div class="flex items-start gap-3">
              <span class="text-2xl">{{ result.success ? '✅' : '❌' }}</span>
              <div class="flex-1">
                <p class="font-bold text-sm m-0" :class="result.success ? 'text-green-300' : 'text-red-300'">
                  {{ result.filename }}
                </p>
                <p class="text-xs mt-0.5 m-0" :class="result.success ? 'text-green-400' : 'text-red-400'">
                  {{ result.message || result.error }}
                </p>
                <p v-if="result.success && result.saved_path" class="text-xs text-gray-400 mt-1 m-0">
                  儲存路徑: {{ result.saved_path }}
                </p>

                <!-- 後台處理進度 -->
                <div v-if="result.success && result.processingProgress" class="mt-3 space-y-2">
                  <div class="bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      class="h-full transition-all duration-500"
                      :class="result.processingProgress === '100%' ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'"
                      :style="{ width: result.processingProgress || '30%' }"
                    ></div>
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <template v-if="result.processingProgress === '100%'">
                      <span class="text-green-400 text-sm">✅</span>
                    </template>
                    <template v-else>
                      <svg class="w-3.5 h-3.5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-linecap="round"/></svg>
                    </template>
                    <span :class="result.processingProgress === '100%' ? 'text-green-300 font-medium' : 'text-gray-300 font-medium'">
                      {{ result.processingStage || '📥 已接收文件，等待處理...' }}
                    </span>
                  </div>
                  <div class="pl-6 space-y-1 text-xs text-gray-400">
                    <div class="flex items-center gap-2">
                      <span>{{ result.stage1Done ? '✅' : '⏳' }}</span>
                      <span :class="result.stage1Done ? 'text-green-400' : ''">文件上傳與接收</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span>{{ result.stage2Done ? '✅' : (result.stage1Done ? '🔄' : '⏳') }}</span>
                      <span :class="result.stage2Done ? 'text-green-400' : ''">RAGFlow 語義分析</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span>{{ result.stage3Done ? '✅' : '⏳' }}</span>
                      <span :class="result.stage3Done ? 'text-green-400' : ''">圖譜節點創建與連線</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== RAGFlow 文檔管理器 ==================== -->
    <div class="max-w-7xl mx-auto pb-8">
      <div class="bg-[#1a1d3a] border border-[#2d3154] rounded-2xl p-6">
        <RAGFlowDocManager />
      </div>
    </div>

    <!-- ==================== 創建圖譜彈窗 ==================== -->
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
          >×</button>
        </div>

        <div class="space-y-6">
          <!-- 圖譜名稱 -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-2">📝 圖譜名稱 *</label>
            <input
              v-model="newGraphData.name"
              type="text"
              placeholder="例如：產品規劃、技術文檔、會議記錄..."
              class="w-full px-4 py-3 bg-white/5 border-2 border-[#2d3154] rounded-xl text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <!-- 圖譜描述 -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-2">📄 圖譜描述</label>
            <textarea
              v-model="newGraphData.description"
              rows="3"
              placeholder="簡單描述這個圖譜的用途和內容..."
              class="w-full px-4 py-3 bg-white/5 border-2 border-[#2d3154] rounded-xl text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            ></textarea>
          </div>

          <!-- 圖示選擇 -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-2">🎨 選擇圖示</label>
            <div class="grid grid-cols-8 gap-3">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                @click="newGraphData.icon = icon"
                class="aspect-square flex items-center justify-center text-3xl rounded-xl border-2 transition-all hover:scale-110"
                :class="newGraphData.icon === icon
                  ? 'border-blue-500 bg-blue-900/20 shadow-lg'
                  : 'border-[#2d3154] bg-white/5 hover:border-blue-400'"
              >{{ icon }}</button>
            </div>
          </div>

          <!-- 封面圖片 -->
          <div>
            <label class="block text-sm font-bold text-gray-300 mb-2">🖼️ 封面圖片</label>
            <div v-if="newGraphData.cover_image" class="relative mb-3 rounded-xl overflow-hidden border-2 border-blue-500/30">
              <img :src="newGraphData.cover_image" alt="封面預覽" class="w-full h-32 object-cover" />
              <button
                @click="removeCoverImage"
                class="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white text-sm transition-colors"
              >✕</button>
            </div>
            <div class="grid grid-cols-7 gap-2 mb-3">
              <button
                v-for="preset in presetCovers"
                :key="preset.id"
                @click="selectPresetCover(preset)"
                class="h-14 rounded-lg border-2 transition-all overflow-hidden flex items-center justify-center text-xs"
                :class="newGraphData.cover_image === preset.svg
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'border-[#2d3154] hover:border-blue-400'"
                :title="preset.label"
              >
                <img v-if="preset.svg" :src="preset.svg" :alt="preset.label" class="w-full h-full object-cover" />
                <span v-else class="text-gray-500">無</span>
              </button>
            </div>
            <input
              ref="coverImageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleCoverImageUpload"
            />
            <button
              @click="coverImageInput?.click()"
              class="w-full px-4 py-2.5 bg-white/5 border-2 border-dashed border-[#2d3154] rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              上傳自訂圖片
              <span class="text-gray-600 text-xs">（最大 2MB）</span>
            </button>
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
            >取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount, Transition } from 'vue';
import { useRoute } from 'vue-router';
import { useGraphStore } from '../stores/graphStore';
import { ElMessage } from 'element-plus';
import { authFetch } from '../services/apiClient';
import RAGFlowDocManager from '../components/RAGFlowDocManager.vue';

// ===== Store =====
const graphStore = useGraphStore();
const route = useRoute();

// ===== State =====
const isDragging = ref(false);
const files = ref([]);
const showInfoCard = ref(false); // 右上角說明卡片收合狀態
const uploadStatus = ref('ready'); // 'ready', 'uploading', 'completed'
const uploadedCount = ref(0);
const uploadProgress = ref(0);
const uploadResults = ref([]);
const currentProcessingFile = ref(''); // 當前處理的文件名
const processingStage = ref(''); // 當前處理階段

// 圖譜選擇相關
const importMode = ref('existing'); // 'new' | 'existing'
const graphName = ref('');
const selectedGraphId = ref('');

// 自訂下拉選單狀態
const graphDropdownOpen = ref(false);
const graphDropdownRef = ref(null);
const ragflowDropdownOpen = ref(false);
const ragflowDropdownRef = ref(null);
const enableAILink = ref(true); // AI 智能連線功能

// RAGFlow 相關
const selectedDatasetId = ref(''); // 選中的 RAGFlow 知識庫 ID
const ragflowDatasets = computed(() => graphStore.ragflowDatasets); // 從 Store 集中管理

// 文件输入引用
const fileInput = ref(null);

// 創建圖譜相關
const showCreateGraphDialog = ref(false);
const isCreatingGraph = ref(false);
const newGraphData = ref({
  name: '',
  description: '',
  icon: '🌐',
  color: '#3b82f6',
  cover_image: ''
});

const availableIcons = [
  '🌐', '🧠', '📚', '💼', '🔬', '🎯', '📊', '🗂',
  '💡', '🚀', '🎨', '📝', '🔧', '⚡', '🌟', '📱'
];

// 預設封面圖片（SVG DataURL）
const presetCovers = [
  { id: 'none', label: '無', svg: '' },
  { id: 'grid', label: '網格', svg: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#0a0e27"/><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0v40" fill="none" stroke="rgba(59,130,246,0.15)" stroke-width="1"/></pattern></defs><rect width="400" height="200" fill="url(#g)"/><circle cx="200" cy="100" r="60" fill="none" stroke="rgba(59,130,246,0.3)" stroke-width="1"/><circle cx="200" cy="100" r="30" fill="none" stroke="rgba(59,130,246,0.2)" stroke-width="1"/></svg>')}` },
  { id: 'wave', label: '波浪', svg: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#0a0e27"/><path d="M0 120 Q100 80 200 120 T400 120 V200 H0Z" fill="rgba(59,130,246,0.1)"/><path d="M0 140 Q100 100 200 140 T400 140 V200 H0Z" fill="rgba(59,130,246,0.08)"/><path d="M0 160 Q100 130 200 160 T400 160 V200 H0Z" fill="rgba(59,130,246,0.05)"/></svg>')}` },
  { id: 'dots', label: '星點', svg: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#0a0e27"/><circle cx="50" cy="30" r="2" fill="rgba(59,130,246,0.4)"/><circle cx="120" cy="80" r="1.5" fill="rgba(59,130,246,0.3)"/><circle cx="200" cy="40" r="3" fill="rgba(59,130,246,0.5)"/><circle cx="280" cy="90" r="2" fill="rgba(59,130,246,0.35)"/><circle cx="350" cy="50" r="1.5" fill="rgba(59,130,246,0.25)"/><circle cx="80" cy="150" r="2.5" fill="rgba(59,130,246,0.3)"/><circle cx="160" cy="130" r="1" fill="rgba(59,130,246,0.4)"/><circle cx="240" cy="160" r="2" fill="rgba(59,130,246,0.35)"/><circle cx="320" cy="140" r="3" fill="rgba(59,130,246,0.2)"/><circle cx="380" cy="170" r="1.5" fill="rgba(59,130,246,0.3)"/><circle cx="30" cy="100" r="1" fill="rgba(147,51,234,0.3)"/><circle cx="170" cy="20" r="1.5" fill="rgba(147,51,234,0.25)"/><circle cx="300" cy="30" r="2" fill="rgba(147,51,234,0.2)"/><circle cx="370" cy="110" r="1" fill="rgba(147,51,234,0.3)"/></svg>')}` },
  { id: 'topo', label: '地形', svg: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#0a0e27"/><ellipse cx="200" cy="100" rx="150" ry="70" fill="none" stroke="rgba(59,130,246,0.12)" stroke-width="1"/><ellipse cx="200" cy="100" rx="120" ry="55" fill="none" stroke="rgba(59,130,246,0.15)" stroke-width="1"/><ellipse cx="200" cy="100" rx="90" ry="40" fill="none" stroke="rgba(59,130,246,0.18)" stroke-width="1"/><ellipse cx="200" cy="100" rx="60" ry="25" fill="none" stroke="rgba(59,130,246,0.22)" stroke-width="1"/><ellipse cx="200" cy="100" rx="30" ry="12" fill="none" stroke="rgba(59,130,246,0.28)" stroke-width="1"/></svg>')}` },
  { id: 'circuit', label: '電路', svg: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#0a0e27"/><path d="M0 50h80v50h60v-30h80v80h-40v-30h-60v40h100v-20h80" fill="none" stroke="rgba(59,130,246,0.2)" stroke-width="1.5"/><path d="M400 30h-70v60h-50v-20h-60v40h30v50h-40v-30h-80" fill="none" stroke="rgba(147,51,234,0.15)" stroke-width="1.5"/><circle cx="80" cy="50" r="3" fill="rgba(59,130,246,0.4)"/><circle cx="220" cy="70" r="3" fill="rgba(59,130,246,0.4)"/><circle cx="140" cy="100" r="3" fill="rgba(59,130,246,0.4)"/><circle cx="300" cy="120" r="3" fill="rgba(147,51,234,0.4)"/><circle cx="180" cy="150" r="3" fill="rgba(147,51,234,0.4)"/></svg>')}` },
  { id: 'hexagon', label: '蜂巢', svg: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#0a0e27"/><defs><pattern id="h" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)"><path d="M28 66L0 50V16l28-16 28 16v34L28 66zM28 166L0 150v-34l28-16 28 16v34l-28 16z" fill="none" stroke="rgba(59,130,246,0.12)" stroke-width="1"/></pattern></defs><rect width="400" height="200" fill="url(#h)"/></svg>')}` },
];

// 封面圖片上傳
const coverImageInput = ref(null);
const handleCoverImageUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  // 驗證檔案類型
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('⚠️ 請選擇圖片檔案');
    return;
  }
  
  // 限制大小 2MB
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('⚠️ 圖片大小不得超過 2MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    newGraphData.value.cover_image = e.target.result; // base64 DataURL
  };
  reader.readAsDataURL(file);
};

const selectPresetCover = (preset) => {
  newGraphData.value.cover_image = preset.svg;
};

const removeCoverImage = () => {
  newGraphData.value.cover_image = '';
  if (coverImageInput.value) coverImageInput.value.value = '';
};

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

/**
 * 判斷是否為 Excel/CSV 檔案
 */
const isExcelFile = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  return ['xlsx', 'xls', 'csv'].includes(ext);
};

/**
 * Excel/CSV 批次匯入 — 走 graph_import.py 的背景任務流程
 * 每行獨立建成圖譜節點 + 獨立上傳 RAGFlow (解決 bge-m3 長度限制)
 */
const handleExcelBatchImport = async (file) => {
  const graphId = selectedGraphId.value;
  const datasetId = (enableAILink.value && selectedDatasetId.value) ? selectedDatasetId.value : '';
  
  console.log(`📊 [Excel批次] 開始匯入: ${file.name}, graph_id=${graphId}, ragflow=${datasetId}`);
  currentProcessingFile.value = file.name;
  processingStage.value = '📤 正在上傳 Excel 至批次處理引擎...';
  
  // 構建 FormData
  const formData = new FormData();
  formData.append('file', file);
  if (graphId) formData.append('graph_id', graphId);
  if (datasetId) formData.append('ragflow_dataset_id', datasetId);
  
  try {
    const response = await authFetch('/api/graph/import/excel', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.task_id) {
      processingStage.value = `⏳ 背景任務已啟動 (${result.total} 筆資料)...`;
      
      // 加入結果列表
      const resultIndex = uploadResults.value.length;
      uploadResults.value.push({
        success: true,
        filename: file.name,
        message: `📊 Excel 批次匯入已啟動 (${result.total} 筆)`,
        processingProgress: '5%',
        processingStage: `🤖 AI 分析中 (0/${result.total})...`,
        stage1Done: true,
        stage2Done: false,
        stage3Done: false,
        isBatchImport: true,
        taskId: result.task_id,
        totalRows: result.total
      });
      
      // 啟動進度輪詢
      pollBatchProgress(resultIndex, result.task_id);
    } else {
      throw new Error(result.detail || '批次匯入啟動失敗');
    }
  } catch (error) {
    console.error('❌ Excel 批次匯入錯誤:', error);
    uploadResults.value.push({
      success: false,
      filename: file.name,
      error: error.message || '批次匯入失敗'
    });
  }
};

/**
 * 輪詢批次匯入進度 (graph_import.py 背景任務)
 */
const pollBatchProgress = async (resultIndex, taskId) => {
  const maxAttempts = 2400; // 最多 2 小時 (每 3 秒一次, 支援 3000+ 筆資料)
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    attempts++;
    
    if (!uploadResults.value[resultIndex]) break;
    
    try {
      const response = await authFetch(`/api/graph/import/status/${taskId}`);
      const status = await response.json();
      
      const pct = Math.round(status.progress_pct || 0);
      const completed = status.completed || 0;
      const total = status.total || 1;
      const failed = status.failed || 0;
      
      // 更新進度 (LLM 分析佔 0-80%, KuzuDB+RAGFlow 佔 80-100%)
      const displayPct = Math.min(pct * 0.8, 80);
      uploadResults.value[resultIndex].processingProgress = `${displayPct}%`;
      
      // 構建帶 ETA 的進度文字
      let stageText = `🤖 AI 分析中 (${completed}/${total})`;
      const etaParts = [];
      if (status.extracted_count > 0) etaParts.push(`📋 ${status.extracted_count} 筆免LLM`);
      if (status.eta_seconds != null && status.eta_seconds > 0) {
        const eta = status.eta_seconds;
        etaParts.push(eta < 60 ? `剩餘 ${Math.round(eta)}s` : `剩餘 ${Math.floor(eta/60)}m${Math.round(eta%60)}s`);
      }
      if (status.rows_per_sec > 0) etaParts.push(`${status.rows_per_sec} 筆/秒`);
      if (status.total_batches > 0) etaParts.push(`批次 ${status.completed_batches || 0}/${status.total_batches}`);
      if (etaParts.length > 0) stageText += ` · ${etaParts.join(' · ')}`;
      if (status.fast_mode) stageText += ' ⚡';
      uploadResults.value[resultIndex].processingStage = stageText + '...';
      
      if (status.status === 'done') {
        const kuzuSaved = status.kuzu_saved || completed;
        const ragflowUploaded = status.ragflow_uploaded || 0;
        
        uploadResults.value[resultIndex].processingProgress = '100%';
        uploadResults.value[resultIndex].processingStage = 
          `✅ 完成！${kuzuSaved} 個圖譜節點` + 
          (ragflowUploaded > 0 ? `，${ragflowUploaded} 筆知識上傳 RAGFlow` : '');
        uploadResults.value[resultIndex].stage2Done = true;
        uploadResults.value[resultIndex].stage3Done = true;
        uploadResults.value[resultIndex].message = 
          `✅ ${uploadResults.value[resultIndex].filename} 匯入完成 (${kuzuSaved} 節點, ${failed} 失敗)`;
        
        console.log(`🎉 批次匯入完成: ${kuzuSaved} 節點, ${ragflowUploaded} RAGFlow, ${failed} 失敗`);
        
        // 刷新圖譜數據
        try {
          if (selectedGraphId.value) {
            await graphStore.fetchGraphData(selectedGraphId.value);
          }
        } catch (e) {
          console.warn('⚠️ 刷新圖譜失敗:', e);
        }
        break;
      } else if (status.status === 'error') {
        uploadResults.value[resultIndex].processingProgress = '100%';
        uploadResults.value[resultIndex].processingStage = `❌ 匯入失敗: ${status.error || '未知錯誤'}`;
        uploadResults.value[resultIndex].success = false;
        uploadResults.value[resultIndex].stage2Done = true;
        break;
      }
    } catch (error) {
      console.warn('⚠️ 進度查詢失敗:', error);
    }
  }
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
      
      // ===== Excel/CSV 走批次匯入流程 =====
      if (isExcelFile(file.name)) {
        processingStage.value = '📊 偵測到 Excel，啟動批次匯入...';
        await handleExcelBatchImport(file);
        uploadedCount.value++;
        uploadProgress.value = (uploadedCount.value / files.value.length) * 100;
        continue;  // Excel 有自己的進度輪詢，不走下面的邏輯
      }
      
      // ===== 非 Excel 走原有 /api/system/upload 流程 =====
      processingStage.value = '📤 正在上傳檔案到伺服器...';
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // 添加圖譜資訊（圖譜已在創建步驟預先建立，統一使用 graph_id）
        if (importMode.value === 'new' && selectedGraphId.value) {
          formData.append('graph_mode', 'existing');
          formData.append('graph_id', selectedGraphId.value);
          console.log('🚀 上傳檔案至新建圖譜:', graphName.value.trim(), 'ID:', selectedGraphId.value);
        } else if (importMode.value === 'new') {
          formData.append('graph_mode', 'new');
          formData.append('graph_name', graphName.value.trim());
          console.log('🚀 上傳檔案至新圖譜 (待建立):', graphName.value.trim());
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
    
    // 3秒後重置上傳表單（但保留結果區域，讓進度追蹤繼續顯示）
    setTimeout(() => {
      files.value = [];
      uploadStatus.value = 'ready';
      graphName.value = '';
      selectedGraphId.value = '';
      // 注意：不清除 uploadResults，讓 RAGFlow 輪詢進度繼續顯示
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
    graphDropdownOpen.value = false;
    
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
      color: '#3b82f6',
      cover_image: ''
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
        const ref = uploadResults.value[resultIndex];
        ref.processingProgress = '100%';
        ref.processingStage = `✅ 完成！${doc.chunk_count} 個知識分塊，${doc.token_count} tokens`;
        ref.stage2Done = true;
        ref.stage3Done = true;
        // 更新頂部 message 為完成狀態
        ref.message = `✅ ${ref.filename} 已處理完成（${doc.chunk_count} 分塊）`;
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

// ===== Lifecycle =====
onMounted(async () => {
  // 頁面載入時自動獲取圖譜列表
  if (graphStore.graphMetadataList.length === 0) {
    try {
      await graphStore.fetchGraphData(graphStore.currentGraphId);
    } catch (error) {
      console.warn('⚠️ [ImportPage] 圖譜列表載入失敗:', error.message);
    }
  }
  
  // 如果從 GraphPage 帶 graphId query 過來，自動選中該圖譜
  const queryGraphId = route.query.graphId;
  if (queryGraphId) {
    const graph = graphStore.graphMetadataList.find(g => String(g.id) === String(queryGraphId));
    if (graph) {
      importMode.value = 'existing';
      selectedGraphId.value = graph.id;
      console.log('📌 [ImportPage] 從路由參數自動選中圖譜:', graph.name);
    }
  }
  
  // 加載 RAGFlow 知識庫列表（使用 Store 集中管理）
  await graphStore.fetchRAGFlowDatasets();
  
  // 點擊外部關閉下拉選單
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

/** 點擊外部關閉下拉 */
const handleClickOutside = (e) => {
  if (graphDropdownRef.value && !graphDropdownRef.value.contains(e.target)) {
    graphDropdownOpen.value = false;
  }
  if (ragflowDropdownRef.value && !ragflowDropdownRef.value.contains(e.target)) {
    ragflowDropdownOpen.value = false;
  }
};

/** 選擇現有圖譜 */
const selectExistingGraph = (graphId) => {
  importMode.value = 'existing';
  selectedGraphId.value = graphId;
  graphName.value = '';
  graphDropdownOpen.value = false;
};
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

/* 下拉選單動畫 */
.dropdown-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scaleY(0.95);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scaleY(0.98);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
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
