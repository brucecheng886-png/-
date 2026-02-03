<template>
  <div class="batch-repair-container">
    <!-- 步驟 1: Excel 上傳區 (v-if 控制顯示) -->
    <div v-if="!hasData" class="upload-section">
      <div 
        class="upload-area"
        :class="{ 'drag-over': isDragging }"
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
      >
        <el-icon class="upload-icon" :size="64">
          <Upload />
        </el-icon>
        <h3 class="upload-title">拖曳 Excel 檔案至此處</h3>
        <p class="upload-subtitle">或點擊選擇檔案上傳</p>
        <input 
          ref="fileInput" 
          type="file" 
          accept=".xlsx,.xls"
          @change="handleFileSelect"
          style="display: none;"
        />
        <el-button 
          type="primary" 
          :icon="FolderOpened"
          @click="triggerFileSelect"
          class="upload-btn"
        >
          選擇檔案
        </el-button>
        <p class="file-format-hint">支援格式：.xlsx, .xls</p>
        <p class="file-format-hint">必需欄位：id, name, type, description</p>
      </div>

      <!-- 範例資料按鈕 -->
      <div class="example-actions">
        <el-button 
          type="info" 
          plain
          @click="loadExampleData"
        >
          📝 載入範例資料
        </el-button>
        <el-button 
          type="success" 
          plain
          @click="downloadExampleTemplate"
        >
          📥 下載範例模板
        </el-button>
      </div>
    </div>

    <!-- 步驟 2 & 3: 編輯表格與批量儲存 -->
    <div v-else class="data-section">
      <!-- 工具欄 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <h3 class="title">批量修復管理</h3>
          <span class="subtitle">共 {{ tableData.length }} 筆資料</span>
        </div>
        <div class="toolbar-right">
          <el-button 
            type="info" 
            :icon="Upload" 
            @click="resetUpload"
            class="action-btn"
          >
            重新上傳
          </el-button>
          <el-button 
            type="primary" 
            :icon="Plus" 
            @click="addRow"
            class="action-btn"
          >
            新增一行
          </el-button>
          <el-button 
            type="success" 
            :icon="Check" 
            @click="saveAll"
            :loading="saving"
            class="action-btn"
          >
            批量儲存
          </el-button>
          <el-button 
            type="warning" 
            :icon="Refresh" 
            @click="resetData"
            class="action-btn"
          >
            重置資料
          </el-button>
        </div>
      </div>

    <!-- 統計資訊 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">總計：</span>
        <span class="stat-value info">{{ tableData.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已修改：</span>
        <span class="stat-value warning">{{ modifiedCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Person：</span>
        <span class="stat-value">{{ getTypeCount('Person') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Company：</span>
        <span class="stat-value">{{ getTypeCount('Company') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Product：</span>
        <span class="stat-value">{{ getTypeCount('Product') }}</span>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        :row-style="rowStyle"
        stripe
        border
        height="calc(100vh - 380px)"
        size="small"
        @cell-click="handleCellClick"
      >
        <!-- 序號 -->
        <el-table-column 
          type="index" 
          label="序號" 
          width="60" 
          align="center"
          fixed
        />

        <!-- ID (必需欄位) -->
        <el-table-column 
          prop="id" 
          label="ID *" 
          width="140"
          fixed
        >
          <template #default="{ row, $index }">
            <div class="editable-cell">
              <el-input
                v-if="editingCell.row === $index && editingCell.col === 'id'"
                v-model="row.id"
                @blur="finishEdit"
                @keyup.enter="finishEdit"
                ref="editInput"
                size="small"
                class="cell-input"
              />
              <span 
                v-else 
                class="cell-content" 
                :class="{ 'required-empty': !row.id }"
                @dblclick="startEdit($index, 'id')"
              >
                {{ row.id || '(必填)' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- Name (必需欄位) -->
        <el-table-column 
          prop="name" 
          label="名稱 *" 
          min-width="150"
        >
          <template #default="{ row, $index }">
            <div class="editable-cell">
              <el-input
                v-if="editingCell.row === $index && editingCell.col === 'name'"
                v-model="row.name"
                @blur="finishEdit"
                @keyup.enter="finishEdit"
                ref="editInput"
                size="small"
                class="cell-input"
              />
              <span 
                v-else 
                class="cell-content" 
                :class="{ 'required-empty': !row.name }"
                @dblclick="startEdit($index, 'name')"
              >
                {{ row.name || '(必填)' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- Type (必需欄位) -->
        <el-table-column 
          prop="type" 
          label="類型 *" 
          width="140"
        >
          <template #default="{ row, $index }">
            <div class="editable-cell">
              <el-select
                v-if="editingCell.row === $index && editingCell.col === 'type'"
                v-model="row.type"
                @blur="finishEdit"
                @change="finishEdit"
                size="small"
                class="cell-select"
              >
                <el-option label="Person" value="Person" />
                <el-option label="Company" value="Company" />
                <el-option label="Product" value="Product" />
                <el-option label="Event" value="Event" />
                <el-option label="Location" value="Location" />
                <el-option label="Document" value="Document" />
              </el-select>
              <el-tag 
                v-else 
                :type="getTypeTagType(row.type)" 
                size="small"
                @dblclick="startEdit($index, 'type')"
                class="type-tag"
              >
                {{ row.type || '(必填)' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- Description (必需欄位) -->
        <el-table-column 
          prop="description" 
          label="描述 *" 
          min-width="250"
          show-overflow-tooltip
        >
          <template #default="{ row, $index }">
            <div class="editable-cell">
              <el-input
                v-if="editingCell.row === $index && editingCell.col === 'description'"
                v-model="row.description"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 3 }"
                @blur="finishEdit"
                ref="editInput"
                size="small"
                class="cell-input"
              />
              <span 
                v-else 
                class="cell-content" 
                :class="{ 'required-empty': !row.description }"
                @dblclick="startEdit($index, 'description')"
              >
                {{ row.description || '(必填)' }}
              </span>
            </div>
          </template>
        </el-table-column>


        <!-- 最後更新 -->
        <el-table-column 
          prop="updatedAt" 
          label="最後更新" 
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <span class="timestamp">{{ row.updatedAt }}</span>
          </template>
        </el-table-column>

        <!-- 已修改標記 -->
        <el-table-column 
          label="修改" 
          width="60"
          align="center"
        >
          <template #default="{ row }">
            <el-icon v-if="row.modified" class="modified-icon" :size="16">
              <Edit />
            </el-icon>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column 
          label="操作" 
          width="100" 
          align="center"
          fixed="right"
        >
          <template #default="{ row, $index }">
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="deleteRow($index)"
              link
              class="delete-btn"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed } from 'vue';
import { Plus, Check, Delete, Refresh, Edit, Upload, FolderOpened } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';

// 狀態管理
const hasData = ref(false);
const isDragging = ref(false);
const fileInput = ref(null);

// 編輯狀態
const editingCell = reactive({
  row: -1,
  col: ''
});

const editInput = ref(null);
const saving = ref(false);

// 表格資料
const tableData = ref([]);

// 統計修改數量
const modifiedCount = computed(() => {
  return tableData.value.filter(row => row.modified).length;
});

// 獲取類型統計
const getTypeCount = (type) => {
  return tableData.value.filter(row => row.type === type).length;
};

// ===== Excel 檔案處理 =====

// 觸發檔案選擇
const triggerFileSelect = () => {
  fileInput.value.click();
};

// 處理檔案拖曳放下
const handleDrop = (e) => {
  isDragging.value = false;
  const files = e.dataTransfer.files;
  
  if (files.length > 0) {
    processExcelFile(files[0]);
  }
};

// 處理檔案選擇
const handleFileSelect = (e) => {
  const files = e.target.files;
  
  if (files.length > 0) {
    processExcelFile(files[0]);
  }
};

// 解析 Excel 檔案
const processExcelFile = (file) => {
  if (!file) return;
  
  // 檢查檔案格式
  const validExtensions = ['.xlsx', '.xls'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validExtensions.includes(fileExtension)) {
    ElMessage.error('僅支援 .xlsx 和 .xls 格式的 Excel 檔案');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // 讀取第一個工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 轉換為 JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        ElMessage.warning('Excel 檔案中沒有資料');
        return;
      }
      
      // 驗證必需欄位
      const requiredFields = ['id', 'name', 'type', 'description'];
      const firstRow = jsonData[0];
      const missingFields = requiredFields.filter(field => !(field in firstRow));
      
      if (missingFields.length > 0) {
        ElMessage.error(`Excel 檔案缺少必需欄位: ${missingFields.join(', ')}`);
        return;
      }
      
      // 轉換資料格式
      tableData.value = jsonData.map((row, index) => ({
        id: row.id || `ENT-${String(index + 1).padStart(4, '0')}`,
        name: row.name || '',
        type: row.type || 'Person',
        description: row.description || '',
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        modified: false,
        original: null
      }));
      
      hasData.value = true;
      
      ElMessage.success({
        message: `成功載入 ${tableData.value.length} 筆資料`,
        duration: 3000
      });
      
      console.log('解析的 Excel 資料:', tableData.value);
      
    } catch (error) {
      console.error('Excel 解析錯誤:', error);
      ElMessage.error('Excel 檔案解析失敗，請檢查檔案格式');
    }
  };
  
  reader.onerror = () => {
    ElMessage.error('檔案讀取失敗');
  };
  
  reader.readAsArrayBuffer(file);
};

// 載入範例資料
const loadExampleData = () => {
  tableData.value = [
    {
      id: 'ENT-0001',
      name: '張三',
      type: 'Person',
      description: '核心業務實體，需要定期維護',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modified: false
    },
    {
      id: 'ENT-0002',
      name: 'ABC 公司',
      type: 'Company',
      description: '關鍵資料節點，與多個系統關聯',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modified: false
    },
    {
      id: 'ENT-0003',
      name: '產品 X',
      type: 'Product',
      description: '待驗證的資料項目',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modified: false
    },
    {
      id: 'ENT-0004',
      name: '年度會議',
      type: 'Event',
      description: '最近更新的實體資訊',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modified: false
    },
    {
      id: 'ENT-0005',
      name: '台北總部',
      type: 'Location',
      description: '需要人工審核的內容',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modified: false
    }
  ];
  
  hasData.value = true;
  ElMessage.success('已載入範例資料');
};

// 下載範例模板
const downloadExampleTemplate = () => {
  const templateData = [
    { id: 'ENT-0001', name: '張三', type: 'Person', description: '範例人物實體' },
    { id: 'ENT-0002', name: 'ABC 公司', type: 'Company', description: '範例公司實體' },
    { id: 'ENT-0003', name: '產品 X', type: 'Product', description: '範例產品實體' }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '範例資料');
  
  XLSX.writeFile(workbook, '批量修復模板.xlsx');
  
  ElMessage.success('範例模板已下載');
};

// 重置上傳 (回到步驟 1)
const resetUpload = () => {
  ElMessageBox.confirm(
    '重新上傳將清空目前所有資料，確定要繼續嗎？',
    '確認重新上傳',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    }
  ).then(() => {
    hasData.value = false;
    tableData.value = [];
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    ElMessage.success('已清空資料，可重新上傳');
  }).catch(() => {
    // 取消
  });
};


// ===== 表格編輯功能 =====

// 開始編輯
const startEdit = (rowIndex, colName) => {
  editingCell.row = rowIndex;
  editingCell.col = colName;
  
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus();
    }
  });
};

// 完成編輯
const finishEdit = () => {
  if (editingCell.row !== -1) {
    const row = tableData.value[editingCell.row];
    row.modified = true;
    row.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  }
  
  editingCell.row = -1;
  editingCell.col = '';
};

// 處理單元格點擊
const handleCellClick = (row, column, cell, event) => {
  // 點擊可編輯列時進入編輯模式
  const editableCols = ['id', 'name', 'type', 'description'];
  if (editableCols.includes(column.property)) {
    const rowIndex = tableData.value.indexOf(row);
    startEdit(rowIndex, column.property);
  }
};

// 新增一行
const addRow = () => {
  const newRow = {
    id: `ENT-${String(tableData.value.length + 1).padStart(4, '0')}`,
    name: '新實體',
    type: 'Person',
    description: '請輸入描述...',
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    modified: true,
    original: null
  };
  
  tableData.value.push(newRow);
  
  ElMessage.success('已新增一行');
};

// 刪除行
const deleteRow = (index) => {
  ElMessageBox.confirm(
    '確定要刪除這一行嗎？',
    '確認刪除',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    }
  ).then(() => {
    tableData.value.splice(index, 1);
    ElMessage.success('刪除成功');
  }).catch(() => {
    // 取消刪除
  });
};

// ===== 批量儲存到後端 API =====

// 批量儲存
const saveAll = async () => {
  // 驗證必填欄位
  const invalidRows = tableData.value.filter(row => !row.id || !row.name || !row.type || !row.description);
  
  if (invalidRows.length > 0) {
    ElMessage.error({
      message: `有 ${invalidRows.length} 行資料缺少必填欄位 (id, name, type, description)`,
      duration: 5000
    });
    return;
  }
  
  const modifiedRows = tableData.value.filter(row => row.modified);
  
  if (modifiedRows.length === 0) {
    ElMessage.info('沒有需要儲存的修改');
    return;
  }

  try {
    saving.value = true;
    
    // 準備 API 請求資料 (符合 /api/graph/batch-create 格式)
    const entities = tableData.value.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      description: row.description,
      properties: {
        updatedAt: row.updatedAt,
        source: 'batch_import'
      }
    }));
    
    // POST 到後端 API
    const response = await fetch('http://127.0.0.1:8000/api/graph/batch-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entities })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '儲存失敗');
    }
    
    const result = await response.json();
    
    // 清除修改標記
    tableData.value.forEach(row => {
      row.modified = false;
    });
    
    ElMessage.success({
      message: result.message || `成功儲存 ${entities.length} 筆資料到知識圖譜`,
      duration: 3000
    });
    
    console.log('批量儲存結果:', result);
    
  } catch (error) {
    ElMessage.error({
      message: error.message || '儲存失敗，請檢查後端服務 (http://127.0.0.1:8000)',
      duration: 5000
    });
    console.error('儲存錯誤:', error);
  } finally {
    saving.value = false;
  }
};

// 重置資料
const resetData = () => {
  ElMessageBox.confirm(
    '確定要重置所有資料嗎？所有未儲存的修改將會遺失。',
    '確認重置',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    }
  ).then(() => {
    // 清空修改標記
    tableData.value.forEach(row => {
      row.modified = false;
    });
    ElMessage.success('資料已重置');
  }).catch(() => {
    // 取消重置
  });
};

// 獲取類型標籤顏色
const getTypeTagType = (type) => {
  const typeMap = {
    'Person': 'primary',
    'Company': 'success',
    'Product': 'warning',
    'Event': 'danger',
    'Location': 'info',
    'Document': ''
  };
  return typeMap[type] || '';
};

// 獲取狀態標籤顏色
const getStatusTagType = (status) => {
  const statusMap = {
    '正常': 'success',
    '警告': 'warning',
    '錯誤': 'danger'
  };
  return statusMap[status] || '';
};

// 表格樣式
const headerCellStyle = {
  background: 'rgba(30, 30, 40, 0.9)',
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '13px',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  padding: '12px 8px'
};

const cellStyle = {
  background: 'rgba(20, 20, 30, 0.6)',
  color: '#e5e7eb',
  fontSize: '13px',
  borderColor: 'rgba(255, 255, 255, 0.05)',
  padding: '8px'
};

const rowStyle = ({ rowIndex }) => {
  return {
    background: rowIndex % 2 === 0 
      ? 'rgba(30, 30, 40, 0.4)' 
      : 'rgba(20, 20, 30, 0.4)'
  };
};
</script>

<style scoped>
.batch-repair-container {
  width: 100%;
  height: 100vh;
  padding: 20px;
  background: transparent;
  overflow: auto;
}

/* ===== 步驟 1: 上傳區域樣式 ===== */
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 40px);
  gap: 24px;
}

.upload-area {
  width: 100%;
  max-width: 600px;
  padding: 60px 40px;
  background: rgba(30, 30, 40, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 2px dashed rgba(59, 130, 246, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: rgba(59, 130, 246, 0.8);
  background: rgba(30, 30, 40, 0.9);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

.upload-icon {
  color: #3b82f6;
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
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.upload-subtitle {
  margin: 0;
  font-size: 15px;
  color: #9ca3af;
  text-align: center;
}

.upload-btn {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 600;
  padding: 12px 32px;
}

.file-format-hint {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}

.example-actions {
  display: flex;
  gap: 16px;
}

/* ===== 步驟 2 & 3: 資料區域樣式 ===== */
.data-section {
  width: 100%;
  height: 100%;
}

/* 工具欄 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: rgba(30, 30, 40, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.subtitle {
  font-size: 13px;
  color: #9ca3af;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  font-weight: 500;
}

/* 統計欄 */
.stats-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 20px;
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  font-size: 13px;
  color: #9ca3af;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #3b82f6;
}

.stat-value.success {
  color: #10b981;
}

.stat-value.warning {
  color: #f59e0b;
}

.stat-value.error {
  color: #ef4444;
}

.stat-value.info {
  color: #3b82f6;
}

/* 表格包裝 - 玻璃擬態效果 */
.table-wrapper {
  background: rgba(20, 20, 30, 0.7);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* 可編輯單元格 */
.editable-cell {
  min-height: 24px;
  display: flex;
  align-items: center;
}

.cell-content {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  width: 100%;
}

.cell-content:hover {
  background: rgba(59, 130, 246, 0.1);
}

.cell-content.required-empty {
  color: #ef4444;
  font-style: italic;
}

.cell-input,
.cell-select {
  width: 100%;
}

.type-tag,
.status-tag {
  cursor: pointer;
  transition: transform 0.2s;
}

.type-tag:hover,
.status-tag:hover {
  transform: scale(1.05);
}

/* 時間戳 */
.timestamp {
  font-size: 12px;
  color: #9ca3af;
  font-family: 'Consolas', monospace;
}

/* 修改圖標 */
.modified-icon {
  color: #3b82f6;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 刪除按鈕 */
.delete-btn {
  font-weight: 500;
}

/* Element Plus 深色主題覆寫 */
:deep(.el-table) {
  background: transparent !important;
  color: #e5e7eb !important;
}

:deep(.el-table__inner-wrapper) {
  background: transparent !important;
}

:deep(.el-table th.el-table__cell) {
  background: rgba(30, 30, 40, 0.9) !important;
  color: #ffffff !important;
}

:deep(.el-table tr) {
  background: transparent !important;
}

:deep(.el-table td.el-table__cell) {
  border-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-table--border .el-table__inner-wrapper::after) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-table--border::before) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-table__body tr.hover-row > td) {
  background: rgba(59, 130, 246, 0.1) !important;
}

:deep(.el-input__wrapper) {
  background: rgba(30, 30, 40, 0.9) !important;
  border-color: rgba(59, 130, 246, 0.3) !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
}

:deep(.el-select) {
  --el-select-input-focus-border-color: #3b82f6;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(30, 30, 40, 0.9) !important;
}

/* 捲軸樣式 */
:deep(.el-table__body-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
  background: rgba(30, 30, 40, 0.3);
  border-radius: 4px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 4px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}
</style>

<style>
/* 全局深色訊息框樣式 */
.dark-message-box {
  background: rgba(30, 30, 40, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.dark-message-box .el-message-box__title {
  color: #ffffff !important;
}

.dark-message-box .el-message-box__message {
  color: #e5e7eb !important;
}

.dark-message-box .el-message-box__headerbtn .el-message-box__close {
  color: #9ca3af !important;
}
</style>
