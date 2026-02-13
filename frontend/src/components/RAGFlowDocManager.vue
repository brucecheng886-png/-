<template>
  <div class="ragflow-doc-manager">
    <!-- 標題欄 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">📁</span>
        <h3 class="text-xl font-bold text-white m-0">知識庫文檔管理</h3>
        <span v-if="documents.length" class="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium">
          {{ documents.length }} 份文檔
        </span>
      </div>
      <div class="flex items-center gap-2">
        <!-- 搜尋框 -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋文檔..."
            class="w-52 pl-8 pr-3 py-1.5 bg-white/5 border border-[#2d3154] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <!-- 刷新按鈕 -->
        <button
          @click="refreshDocuments"
          :disabled="isLoading"
          class="p-1.5 bg-white/5 border border-[#2d3154] rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-500 transition-all disabled:opacity-50"
          title="刷新列表"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 知識庫選擇器 -->
    <div class="mb-4 flex items-center gap-3">
      <label class="text-sm font-medium text-gray-400 whitespace-nowrap">知識庫：</label>
      <div class="relative flex-1" ref="datasetDropdownRef">
        <button
          @click="datasetDropdownOpen = !datasetDropdownOpen"
          class="w-full px-3 py-2 bg-white/5 border border-[#2d3154] rounded-lg text-sm text-left flex items-center justify-between transition-all hover:border-blue-500/50"
          :class="activeDatasetId ? 'text-gray-200' : 'text-gray-500'"
        >
          <span class="truncate">
            {{ activeDatasetId ? (datasets.find(d => d.id === activeDatasetId)?.name || activeDatasetId) : '請選擇知識庫' }}
          </span>
          <svg class="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 opacity-50" :class="{ 'rotate-180': datasetDropdownOpen }" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L2 4h8L6 8z"/>
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-show="datasetDropdownOpen" class="absolute left-0 right-0 mt-1 bg-[#1a1f2e] border border-[#2d3154] rounded-lg shadow-2xl shadow-black/40 overflow-hidden z-50">
            <div class="max-h-48 overflow-y-auto custom-scrollbar py-1">
              <div
                v-for="ds in datasets"
                :key="ds.id"
                class="px-3 py-2 text-sm cursor-pointer transition-all hover:bg-blue-500/10"
                :class="activeDatasetId === ds.id ? 'text-blue-300 bg-blue-500/15 font-semibold' : 'text-gray-300'"
                @click="selectDataset(ds.id)"
              >
                {{ ds.name }}
                <span class="text-xs text-gray-500 ml-1">({{ ds.document_count || 0 }})</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 批量操作欄 -->
    <div v-if="selectedDocIds.size > 0" class="mb-3 p-3 bg-red-900/10 border border-red-500/30 rounded-lg flex items-center justify-between">
      <span class="text-sm text-red-300 font-medium">
        已選擇 {{ selectedDocIds.size }} 份文檔
      </span>
      <div class="flex items-center gap-2">
        <button
          @click="selectAll"
          class="px-3 py-1 text-xs bg-white/5 border border-[#2d3154] rounded-md text-gray-300 hover:text-white hover:border-gray-500 transition-all"
        >
          全選
        </button>
        <button
          @click="selectedDocIds.clear()"
          class="px-3 py-1 text-xs bg-white/5 border border-[#2d3154] rounded-md text-gray-300 hover:text-white hover:border-gray-500 transition-all"
        >
          取消
        </button>
        <button
          @click="confirmBatchDelete"
          :disabled="isDeleting"
          class="px-3 py-1 text-xs bg-red-500/20 border border-red-500/50 rounded-md text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all disabled:opacity-50"
        >
          <span v-if="!isDeleting">🗑️ 批量刪除</span>
          <span v-else>⏳ 刪除中...</span>
        </button>
      </div>
    </div>

    <!-- 文檔表格 -->
    <div v-if="isLoading && !documents.length" class="py-12 text-center">
      <svg class="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.25" stroke-width="3"/>
        <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-linecap="round" stroke-width="3"/>
      </svg>
      <p class="text-gray-400 text-sm">載入文檔列表...</p>
    </div>

    <div v-else-if="!activeDatasetId" class="py-12 text-center">
      <span class="text-4xl block mb-3">📂</span>
      <p class="text-gray-400 text-sm">請先選擇知識庫以查看文檔</p>
    </div>

    <div v-else-if="filteredDocs.length === 0 && !isLoading" class="py-12 text-center">
      <span class="text-4xl block mb-3">📭</span>
      <p class="text-gray-400 text-sm">
        {{ searchQuery ? '沒有符合搜尋條件的文檔' : '此知識庫尚無文檔' }}
      </p>
    </div>

    <div v-else class="border border-[#2d3154] rounded-xl overflow-hidden">
      <!-- 表頭 -->
      <div class="grid grid-cols-[40px_1fr_90px_140px_90px_80px_60px] gap-0 px-4 py-2.5 bg-[#0d1025] border-b border-[#2d3154] text-xs text-gray-500 font-medium uppercase tracking-wider">
        <div class="flex items-center justify-center">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isPartialSelected"
            @change="toggleSelectAll"
            class="w-3.5 h-3.5 rounded border-gray-600 bg-transparent text-blue-500 focus:ring-0 cursor-pointer accent-blue-500"
          />
        </div>
        <div>名稱</div>
        <div class="text-center">分塊數</div>
        <div>上傳日期</div>
        <div class="text-center">解析方法</div>
        <div class="text-center">狀態</div>
        <div class="text-center">操作</div>
      </div>

      <!-- 文檔列表 -->
      <div class="max-h-[380px] overflow-y-auto custom-scrollbar">
        <div
          v-for="doc in filteredDocs"
          :key="doc.id"
          class="grid grid-cols-[40px_1fr_90px_140px_90px_80px_60px] gap-0 px-4 py-2.5 border-b border-[#2d3154]/50 hover:bg-white/[0.02] transition-colors items-center"
          :class="{ 'bg-blue-500/5': selectedDocIds.has(doc.id) }"
        >
          <!-- 勾選框 -->
          <div class="flex items-center justify-center">
            <input
              type="checkbox"
              :checked="selectedDocIds.has(doc.id)"
              @change="toggleSelect(doc.id)"
              class="w-3.5 h-3.5 rounded border-gray-600 bg-transparent text-blue-500 focus:ring-0 cursor-pointer accent-blue-500"
            />
          </div>
          <!-- 名稱 -->
          <div class="flex items-center gap-2 min-w-0 pr-2">
            <span class="text-base flex-shrink-0">{{ getDocIcon(doc.name) }}</span>
            <span class="text-sm text-gray-200 truncate" :title="doc.name">{{ doc.name }}</span>
          </div>
          <!-- 分塊數 -->
          <div class="text-center text-sm text-gray-400">{{ doc.chunk_count ?? '-' }}</div>
          <!-- 上傳日期 -->
          <div class="text-xs text-gray-500">{{ formatDate(doc.create_time || doc.update_time) }}</div>
          <!-- 解析方法 -->
          <div class="text-center">
            <span class="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400">{{ doc.parser_id || 'General' }}</span>
          </div>
          <!-- 狀態 -->
          <div class="text-center">
            <span
              class="px-2 py-0.5 rounded text-xs font-medium"
              :class="getStatusClass(doc.run)"
            >
              {{ getStatusText(doc.run) }}
            </span>
          </div>
          <!-- 操作 -->
          <div class="flex items-center justify-center">
            <button
              @click="confirmDeleteSingle(doc)"
              :disabled="isDeleting"
              class="p-1 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-30"
              title="刪除文檔"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 表尾統計 -->
      <div class="px-4 py-2 bg-[#0d1025] border-t border-[#2d3154] flex items-center justify-between text-xs text-gray-500">
        <span>共 {{ filteredDocs.length }} 份文檔{{ searchQuery ? ' (已篩選)' : '' }}</span>
        <span v-if="totalChunks > 0">總計 {{ totalChunks }} 個知識分塊</span>
      </div>
    </div>

    <!-- 刪除確認對話框 -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
      @click.self="showDeleteDialog = false"
    >
      <div class="bg-[#1a1d3a] border-2 border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl">⚠️</span>
          <h3 class="text-lg font-bold text-white m-0">確認刪除</h3>
        </div>
        <p class="text-gray-300 mb-2">
          {{ deleteTargetNames.length === 1 
            ? `確定要刪除「${deleteTargetNames[0]}」嗎？` 
            : `確定要刪除以下 ${deleteTargetNames.length} 份文檔嗎？` }}
        </p>
        <div v-if="deleteTargetNames.length > 1" class="max-h-32 overflow-y-auto custom-scrollbar mb-4 p-2 bg-black/20 rounded-lg">
          <div v-for="name in deleteTargetNames" :key="name" class="text-xs text-gray-400 py-0.5 truncate">
            • {{ name }}
          </div>
        </div>
        <p class="text-xs text-red-400 mb-4">⚠️ 此操作不可復原，文檔及其所有知識分塊將從 RAGFlow 中永久移除。</p>
        <div class="flex gap-3">
          <button
            @click="executeDelete"
            :disabled="isDeleting"
            class="flex-1 px-4 py-2.5 bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl hover:bg-red-500/30 transition-all font-bold disabled:opacity-50"
          >
            <span v-if="!isDeleting">🗑️ 確認刪除</span>
            <span v-else>⏳ 刪除中...</span>
          </button>
          <button
            @click="showDeleteDialog = false"
            :disabled="isDeleting"
            class="flex-1 px-4 py-2.5 bg-white/5 border border-[#2d3154] text-gray-300 rounded-xl hover:bg-white/10 transition-all font-bold"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, Transition } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { apiGet, authFetch } from '../services/apiClient';
import { ElMessage } from 'element-plus';

const graphStore = useGraphStore();

// ===== State =====
const datasets = computed(() => graphStore.ragflowDatasets);
const activeDatasetId = ref('');
const documents = ref([]);
const isLoading = ref(false);
const isDeleting = ref(false);
const searchQuery = ref('');
const selectedDocIds = ref(new Set());

// 下拉
const datasetDropdownOpen = ref(false);
const datasetDropdownRef = ref(null);

// 刪除對話框
const showDeleteDialog = ref(false);
const deleteTargetIds = ref([]);
const deleteTargetNames = ref([]);

// ===== Computed =====
const filteredDocs = computed(() => {
  if (!searchQuery.value) return documents.value;
  const q = searchQuery.value.toLowerCase();
  return documents.value.filter(d => d.name?.toLowerCase().includes(q));
});

const totalChunks = computed(() => documents.value.reduce((sum, d) => sum + (d.chunk_count || 0), 0));

const isAllSelected = computed(() =>
  filteredDocs.value.length > 0 && filteredDocs.value.every(d => selectedDocIds.value.has(d.id))
);

const isPartialSelected = computed(() =>
  !isAllSelected.value && filteredDocs.value.some(d => selectedDocIds.value.has(d.id))
);

// ===== Methods =====
const selectDataset = async (id) => {
  activeDatasetId.value = id;
  datasetDropdownOpen.value = false;
  selectedDocIds.value.clear();
  await fetchDocuments();
};

const fetchDocuments = async () => {
  if (!activeDatasetId.value) return;
  isLoading.value = true;
  try {
    const data = await apiGet(`/api/ragflow/documents/${activeDatasetId.value}`);
    // RAGFlow API 回應格式: { code, data: { docs: [...], total } }
    const docs = data?.data?.docs || data?.data || [];
    documents.value = Array.isArray(docs) ? docs : [];
  } catch (err) {
    console.error('❌ 獲取文檔列表失敗:', err);
    ElMessage.error('獲取文檔列表失敗');
    documents.value = [];
  } finally {
    isLoading.value = false;
  }
};

const refreshDocuments = () => {
  selectedDocIds.value.clear();
  fetchDocuments();
};

const toggleSelect = (id) => {
  const s = new Set(selectedDocIds.value);
  if (s.has(id)) s.delete(id); else s.add(id);
  selectedDocIds.value = s;
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedDocIds.value = new Set();
  } else {
    selectedDocIds.value = new Set(filteredDocs.value.map(d => d.id));
  }
};

const selectAll = () => {
  selectedDocIds.value = new Set(filteredDocs.value.map(d => d.id));
};

const confirmDeleteSingle = (doc) => {
  deleteTargetIds.value = [doc.id];
  deleteTargetNames.value = [doc.name];
  showDeleteDialog.value = true;
};

const confirmBatchDelete = () => {
  const ids = [...selectedDocIds.value];
  deleteTargetIds.value = ids;
  deleteTargetNames.value = ids.map(id => documents.value.find(d => d.id === id)?.name || id);
  showDeleteDialog.value = true;
};

const executeDelete = async () => {
  isDeleting.value = true;
  try {
    const response = await authFetch(`/api/ragflow/documents/${activeDatasetId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: deleteTargetIds.value })
    });
    const result = await response.json();

    if (result.code === 0) {
      ElMessage.success(result.message || '刪除成功');
      // 從本地列表移除
      documents.value = documents.value.filter(d => !deleteTargetIds.value.includes(d.id));
      selectedDocIds.value = new Set(
        [...selectedDocIds.value].filter(id => !deleteTargetIds.value.includes(id))
      );
    } else {
      ElMessage.error(result.message || '刪除失敗');
    }
  } catch (err) {
    console.error('❌ 刪除文檔失敗:', err);
    ElMessage.error('刪除文檔失敗: ' + err.message);
  } finally {
    isDeleting.value = false;
    showDeleteDialog.value = false;
    deleteTargetIds.value = [];
    deleteTargetNames.value = [];
  }
};

// ===== Helpers =====
const getDocIcon = (name) => {
  if (!name) return '📄';
  const ext = name.split('.').pop()?.toLowerCase();
  const icons = { pdf: '📕', docx: '📘', doc: '📘', xlsx: '📊', xls: '📊', csv: '📊', txt: '📄', md: '📝', json: '📋' };
  return icons[ext] || '📎';
};

const formatDate = (ts) => {
  if (!ts) return '-';
  try {
    // RAGFlow 回傳 epoch 毫秒或 ISO 字串
    const d = typeof ts === 'number' ? new Date(ts * 1000 < 1e15 ? ts * 1000 : ts) : new Date(ts);
    return d.toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return '-'; }
};

const getStatusText = (run) => {
  const map = { UNSTART: '未開始', RUNNING: '解析中', DONE: '成功', FAIL: '失敗', CANCEL: '已取消' };
  return map[run] || run || '未知';
};

const getStatusClass = (run) => {
  const map = {
    DONE: 'bg-green-500/20 text-green-400',
    RUNNING: 'bg-blue-500/20 text-blue-400',
    FAIL: 'bg-red-500/20 text-red-400',
    CANCEL: 'bg-yellow-500/20 text-yellow-400',
    UNSTART: 'bg-gray-500/20 text-gray-400'
  };
  return map[run] || 'bg-gray-500/20 text-gray-400';
};

// ===== Lifecycle =====
const handleClickOutside = (e) => {
  if (datasetDropdownRef.value && !datasetDropdownRef.value.contains(e.target)) {
    datasetDropdownOpen.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  // 如果知識庫列表尚未載入
  if (!datasets.value.length) {
    await graphStore.fetchRAGFlowDatasets();
  }
  // 自動選中第一個知識庫
  if (datasets.value.length > 0 && !activeDatasetId.value) {
    activeDatasetId.value = datasets.value[0].id;
    await fetchDocuments();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.ragflow-doc-manager {
  /* 繼承父容器背景 */
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }

/* 下拉動畫 */
.dropdown-enter-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.dropdown-leave-active { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
.dropdown-enter-from { opacity: 0; transform: translateY(-6px); }
.dropdown-leave-to { opacity: 0; transform: translateY(-3px); }
</style>
