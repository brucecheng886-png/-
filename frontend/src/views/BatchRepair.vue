<template>
  <div class="batch-repair-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">📊 批量資料處理</h1>
      <p class="page-subtitle">拖曳上傳 Excel 文件，批量編輯資料</p>
    </div>

    <!-- 上傳區域 -->
    <div 
      v-if="!tableData.length"
      class="upload-area"
      :class="{ 'dragging': isDragging }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="upload-content">
        <!-- 上傳圖標 -->
        <div class="upload-icon">📁</div>
        
        <!-- 提示文字 -->
        <h3 class="upload-title">拖曳 Excel 文件到此處</h3>
        <p class="upload-hint">或點擊下方按鈕選擇文件</p>
        
        <!-- 支援格式 -->
        <div class="file-formats">
          <span class="format-badge">.xlsx</span>
          <span class="format-badge">.xls</span>
          <span class="format-badge">.csv</span>
        </div>
        
        <!-- 選擇文件按鈕 -->
        <label class="upload-button">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="handleFileSelect"
            ref="fileInput"
            style="display: none"
          />
          <span>📂 選擇文件</span>
        </label>
        
        <!-- 示例說明 -->
        <div class="upload-tips">
          <p>💡 <strong>建議格式：</strong></p>
          <ul>
            <li>第一行為欄位標題</li>
            <li>後續行為資料內容</li>
            <li>支援多個工作表（自動讀取第一個）</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 資料表格區域 -->
    <div v-else class="table-area">
      <!-- 工具列 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="file-info">
            📄 {{ fileName }} 
            <span class="data-count">（共 {{ tableData.length }} 筆資料）</span>
          </span>
        </div>
        
        <div class="toolbar-right">
          <!-- 新增行按鈕 -->
          <button @click="addRow" class="toolbar-btn add-btn">
            ➕ 新增行
          </button>
          
          <!-- 保存按鈕 -->
          <button 
            @click="saveData" 
            class="toolbar-btn save-btn"
            :disabled="!hasChanges"
          >
            💾 保存資料
          </button>
          
          <!-- 重新上傳按鈕 -->
          <button @click="resetUpload" class="toolbar-btn reset-btn">
            🔄 重新上傳
          </button>
        </div>
      </div>

      <!-- Element Plus 表格 -->
      <div class="table-wrapper">
        <el-table
          :data="tableData"
          :border="true"
          :stripe="true"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          :row-style="rowStyle"
          style="width: 100%"
          max-height="600"
          class="data-table"
        >
          <!-- 序號欄 -->
          <el-table-column
            type="index"
            label="#"
            width="60"
            align="center"
            fixed
          />

          <!-- 動態生成欄位 -->
          <el-table-column
            v-for="column in columns"
            :key="column"
            :label="column"
            :prop="column"
            min-width="150"
          >
            <template #default="{ row, $index }">
              <!-- 可編輯單元格 -->
              <div 
                class="editable-cell"
                @click="startEdit($index, column)"
              >
                <!-- 編輯模式 -->
                <input
                  v-if="editingCell.row === $index && editingCell.column === column"
                  v-model="row[column]"
                  @blur="finishEdit"
                  @keyup.enter="finishEdit"
                  @keyup.esc="cancelEdit"
                  ref="editInput"
                  class="cell-input"
                  autofocus
                />
                
                <!-- 顯示模式 -->
                <span v-else class="cell-text">
                  {{ row[column] || '-' }}
                </span>
                
                <!-- 編輯圖標 -->
                <span 
                  v-if="editingCell.row !== $index || editingCell.column !== column"
                  class="edit-icon"
                >
                  ✏️
                </span>
              </div>
            </template>
          </el-table-column>

          <!-- 操作欄 -->
          <el-table-column
            label="操作"
            width="100"
            align="center"
            fixed="right"
          >
            <template #default="{ $index }">
              <button
                @click="deleteRow($index)"
                class="delete-btn"
                title="刪除此行"
              >
                🗑️
              </button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 資料統計 -->
      <div class="data-stats">
        <span class="stat-item">總行數: <strong>{{ tableData.length }}</strong></span>
        <span class="stat-item">總欄位: <strong>{{ columns.length }}</strong></span>
        <span class="stat-item" v-if="hasChanges">⚠️ 有未保存的變更</span>
      </div>
    </div>

    <!-- 載入中遮罩 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner">⏳</div>
        <p>正在處理文件...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue';
import * as XLSX from 'xlsx';

// 狀態
const isDragging = ref(false);
const isLoading = ref(false);
const hasChanges = ref(false);

// 文件資訊
const fileName = ref('');
const fileInput = ref(null);

// 表格資料
const tableData = ref([]);
const columns = ref([]);

// 編輯狀態
const editingCell = reactive({
  row: null,
  column: null,
  originalValue: null
});

const editInput = ref(null);

// Element Plus 表格樣式
const headerCellStyle = {
  background: 'rgba(59, 130, 246, 0.2)',
  color: '#ffffff',
  fontWeight: '600',
  borderColor: 'rgba(255, 255, 255, 0.1)'
};

const cellStyle = {
  background: 'rgba(20, 20, 30, 0.6)',
  color: '#e5e7eb',
  borderColor: 'rgba(255, 255, 255, 0.1)'
};

const rowStyle = ({ rowIndex }) => {
  return {
    background: rowIndex % 2 === 0 
      ? 'rgba(30, 30, 40, 0.5)' 
      : 'rgba(20, 20, 30, 0.5)'
  };
};

// ===== 拖曳處理 =====
const handleDragOver = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (e) => {
  e.preventDefault();
  isDragging.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

// ===== 文件選擇 =====
const handleFileSelect = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

// ===== 處理 Excel 文件 =====
const processFile = async (file) => {
  // 檢查文件類型
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const validExtensions = ['xlsx', 'xls', 'csv'];
  
  if (!validExtensions.includes(fileExtension)) {
    alert('❌ 不支援的文件格式！請上傳 .xlsx、.xls 或 .csv 文件');
    return;
  }
  
  isLoading.value = true;
  fileName.value = file.name;
  
  try {
    // 讀取文件
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    
    // 取得第一個工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 轉換為 JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      alert('⚠️ Excel 文件中沒有資料');
      isLoading.value = false;
      return;
    }
    
    // 提取欄位名稱（使用第一行的鍵）
    columns.value = Object.keys(jsonData[0]);
    
    // 設定表格資料
    tableData.value = jsonData.map(row => ({ ...row }));
    
    hasChanges.value = false;
    
    console.log('✅ Excel 文件解析成功:', {
      fileName: file.name,
      rows: jsonData.length,
      columns: columns.value
    });
    
  } catch (error) {
    console.error('❌ 處理文件失敗:', error);
    alert('處理文件時發生錯誤：' + error.message);
  } finally {
    isLoading.value = false;
  }
};

// ===== 單元格編輯 =====
const startEdit = (rowIndex, columnName) => {
  editingCell.row = rowIndex;
  editingCell.column = columnName;
  editingCell.originalValue = tableData.value[rowIndex][columnName];
  
  nextTick(() => {
    if (editInput.value && editInput.value[0]) {
      editInput.value[0].focus();
      editInput.value[0].select();
    }
  });
};

const finishEdit = () => {
  if (editingCell.row !== null && editingCell.column !== null) {
    const currentValue = tableData.value[editingCell.row][editingCell.column];
    
    // 檢查是否有變更
    if (currentValue !== editingCell.originalValue) {
      hasChanges.value = true;
      console.log('📝 資料已修改:', {
        row: editingCell.row,
        column: editingCell.column,
        oldValue: editingCell.originalValue,
        newValue: currentValue
      });
    }
  }
  
  editingCell.row = null;
  editingCell.column = null;
  editingCell.originalValue = null;
};

const cancelEdit = () => {
  if (editingCell.row !== null && editingCell.column !== null) {
    // 恢復原始值
    tableData.value[editingCell.row][editingCell.column] = editingCell.originalValue;
  }
  
  editingCell.row = null;
  editingCell.column = null;
  editingCell.originalValue = null;
};

// ===== 表格操作 =====
const addRow = () => {
  const newRow = {};
  columns.value.forEach(col => {
    newRow[col] = '';
  });
  
  tableData.value.push(newRow);
  hasChanges.value = true;
  
  console.log('➕ 新增一行');
};

const deleteRow = (index) => {
  if (confirm('確定要刪除這一行嗎？')) {
    tableData.value.splice(index, 1);
    hasChanges.value = true;
    
    console.log('🗑️ 刪除行:', index);
  }
};

// ===== 保存資料 (Mock API) =====
const saveData = () => {
  console.log('💾 保存資料 (Mock API)');
  console.log('=====================================');
  console.log('文件名稱:', fileName.value);
  console.log('總行數:', tableData.value.length);
  console.log('欄位:', columns.value);
  console.log('資料內容:');
  console.log(JSON.stringify(tableData.value, null, 2));
  console.log('=====================================');
  
  // 模擬 API 請求
  alert('✅ 資料已輸出到 Console\n請按 F12 查看詳細內容');
  
  hasChanges.value = false;
  
  // 實際 API 調用範例（註解）
  /*
  try {
    const response = await fetch('http://localhost:8000/api/batch/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: fileName.value,
        data: tableData.value
      })
    });
    
    if (response.ok) {
      alert('✅ 資料保存成功');
      hasChanges.value = false;
    } else {
      throw new Error('保存失敗');
    }
  } catch (error) {
    console.error('❌ 保存失敗:', error);
    alert('保存失敗：' + error.message);
  }
  */
};

// ===== 重置上傳 =====
const resetUpload = () => {
  if (hasChanges.value) {
    if (!confirm('有未保存的變更，確定要重新上傳嗎？')) {
      return;
    }
  }
  
  tableData.value = [];
  columns.value = [];
  fileName.value = '';
  hasChanges.value = false;
  isDragging.value = false;
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  
  console.log('🔄 已重置上傳區域');
};
</script>

<style scoped>
/* ===== 容器 ===== */
.batch-repair-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 32px;
  position: relative;
  overflow-x: hidden;
}

/* 背景效果 */
.batch-repair-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* ===== 頁面標題 ===== */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* ===== 上傳區域 ===== */
.upload-area {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.upload-area.dragging {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.6);
  transform: scale(1.02);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.upload-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
}

.upload-hint {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 24px 0;
}

.file-formats {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
}

.format-badge {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
}

.upload-button {
  display: inline-block;
  padding: 16px 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.upload-button:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.upload-tips {
  margin-top: 40px;
  padding: 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  text-align: left;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.upload-tips p {
  color: #ffffff;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.upload-tips ul {
  margin: 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.8;
}

/* ===== 表格區域 ===== */
.table-area {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ===== 工具列 ===== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px 16px 0 0;
  margin-bottom: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-info {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.data-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 400;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.toolbar-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-btn {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #22c55e;
}

.add-btn:hover {
  background: rgba(34, 197, 94, 0.3);
  transform: translateY(-2px);
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reset-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

/* ===== 表格包裝器 ===== */
.table-wrapper {
  background: rgba(20, 20, 30, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  overflow: hidden;
}

/* Element Plus 表格自定義樣式 */
:deep(.el-table) {
  background: transparent !important;
  color: #e5e7eb;
}

:deep(.el-table__inner-wrapper) {
  background: transparent !important;
}

:deep(.el-table th.el-table__cell) {
  background: rgba(59, 130, 246, 0.2) !important;
  color: #ffffff !important;
  font-weight: 600;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-table td.el-table__cell) {
  background: rgba(20, 20, 30, 0.6) !important;
  color: #e5e7eb !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-table__row:hover > td) {
  background: rgba(59, 130, 246, 0.15) !important;
}

:deep(.el-table--striped .el-table__row--striped td) {
  background: rgba(30, 30, 40, 0.5) !important;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: rgba(59, 130, 246, 0.5);
}

/* ===== 可編輯單元格 ===== */
.editable-cell {
  min-height: 32px;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.editable-cell:hover {
  background: rgba(59, 130, 246, 0.1);
}

.editable-cell:hover .edit-icon {
  opacity: 1;
}

.cell-text {
  flex: 1;
  color: #e5e7eb;
}

.edit-icon {
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-left: 8px;
}

.cell-input {
  width: 100%;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.cell-input:focus {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
}

/* ===== 刪除按鈕 ===== */
.delete-btn {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

/* ===== 資料統計 ===== */
.data-stats {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  border-radius: 0 0 16px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-item strong {
  color: #3b82f6;
  font-size: 16px;
}

/* ===== 載入中遮罩 ===== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: #ffffff;
}

.loading-spinner {
  font-size: 60px;
  margin-bottom: 20px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-content p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
