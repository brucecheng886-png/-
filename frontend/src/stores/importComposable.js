/**
 * Import Composable — 從 graphStore.js 拆分
 *
 * 負責：檔案匯入、Excel 非同步匯入、輪詢進度、批量匯入、上傳到圖譜
 * 透過依賴注入 (deps) 存取 core graphStore 的 state / actions。
 */
import { ref } from 'vue'
import { apiGet, apiPostForm } from '../services/apiClient'

/**
 * @param {Object} deps - 由 graphStore 注入的依賴
 * @param {Function} deps.addNode
 * @param {Function} deps.addBatchNodes
 * @param {Function} deps.fetchGraphData
 * @param {import('vue').Ref} deps.selectedNode
 * @param {import('vue').Ref} deps.error
 * @param {import('vue').Ref} deps.loading
 * @param {import('vue').Ref} deps.currentGraphId
 */
export function useImportFeatures(deps) {
  const {
    addNode, addBatchNodes, fetchGraphData,
    selectedNode, error, loading, currentGraphId,
  } = deps

  // ===== State =====
  const importedFiles = ref([])
  const importTaskId = ref(null)
  const importStatus = ref('idle')      // idle | running | done | error
  const importProgress = ref(0)          // 0-100
  const importDetail = ref({
    total: 0, completed: 0, failed: 0, filename: '',
    eta_seconds: null, rows_per_sec: 0,
    batch_size: 0, total_batches: 0, completed_batches: 0,
    fast_mode: false, elapsed_seconds: null,
  })
  let _importPollTimer = null

  // ===== Actions =====

  const cancelImportPoll = () => {
    if (_importPollTimer) {
      clearTimeout(_importPollTimer)
      _importPollTimer = null
    }
  }

  const importFile = async (file, mode = 'single') => {
    try {
      console.log('📥 開始匯入檔案:', file.name, '模式:', mode)

      const ext = file.name.split('.').pop()?.toLowerCase()
      const isExcel = ext === 'xlsx' || ext === 'csv' || ext === 'xls'

      if (mode === 'multi' && isExcel) {
        return await importExcelAsync(file)
      }

      const newNode = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        label: file.name,
        group: 'file',
        type: file.type || 'document',
        fileType: ext,
        color: '#3b82f6',
        size: 1.2,
        timestamp: Date.now(),
        aiStatus: 'linked',
        description: `從檔案 ${file.name} 匯入`,
      }

      addNode(newNode)
      importedFiles.value.unshift({
        id: Date.now(),
        nodeId: newNode.id,
        name: file.name,
        ext: ext?.toUpperCase() || 'FILE',
        status: 'AI 已關聯',
        timestamp: Date.now(),
      })
      selectedNode.value = newNode
      console.log('✅ 檔案匯入成功:', file.name, '→', newNode.id)
      return newNode
    } catch (err) {
      console.error('❌ 檔案匯入失敗:', err)
      error.value = '檔案匯入失敗: ' + err.message
      throw err
    }
  }

  const importExcelAsync = async (file) => {
    cancelImportPoll()

    importStatus.value = 'running'
    importProgress.value = 0
    importDetail.value = {
      total: 0, completed: 0, failed: 0, filename: file.name,
      eta_seconds: null, rows_per_sec: 0,
      batch_size: 0, total_batches: 0, completed_batches: 0,
      fast_mode: false, elapsed_seconds: null,
    }
    error.value = null

    try {
      console.log('📤 上傳 Excel 到背景任務 API:', file.name)

      const formData = new FormData()
      formData.append('file', file)

      const result = await apiPostForm('/api/graph/import/excel', formData)

      if (!result.task_id) {
        throw new Error('伺服器未回傳 task_id')
      }

      importTaskId.value = result.task_id
      importDetail.value.total = result.total || 0

      console.log(`✅ 匯入任務已啟動: task_id=${result.task_id}, total=${result.total}`)

      pollImportStatus(result.task_id)

      return result
    } catch (err) {
      importStatus.value = 'error'
      error.value = '匯入啟動失敗: ' + err.message
      console.error('❌ importExcelAsync 失敗:', err)
      throw err
    }
  }

  const pollImportStatus = (taskId) => {
    cancelImportPoll()

    const POLL_INTERVAL = 3000

    const poll = async () => {
      try {
        const data = await apiGet(`/api/graph/import/status/${taskId}`)

        importProgress.value = data.progress_pct || 0
        importDetail.value = {
          total: data.total || 0,
          completed: data.completed || 0,
          failed: data.failed || 0,
          filename: data.filename || '',
          eta_seconds: data.eta_seconds ?? null,
          rows_per_sec: data.rows_per_sec || 0,
          batch_size: data.batch_size || 0,
          total_batches: data.total_batches || 0,
          completed_batches: data.completed_batches || 0,
          fast_mode: data.fast_mode || false,
          elapsed_seconds: data.elapsed_seconds ?? null,
        }

        if (data.status === 'done') {
          importStatus.value = 'done'
          cancelImportPoll()

          const graphId = data.graph_id
          if (graphId) {
            try {
              await fetchGraphData(graphId)
              console.log(`🎉 Excel 匯入完成: ${data.node_count || data.completed || 0} 個節點已載入圖譜`)
            } catch (fetchErr) {
              console.warn('⚠️ 刷新圖譜失敗:', fetchErr)
            }
          }

          importedFiles.value.unshift({
            id: Date.now(),
            nodeId: null,
            name: data.filename || 'Excel 匯入',
            ext: 'XLSX',
            status: `✅ ${data.node_count || data.completed || 0} 個節點`,
            timestamp: Date.now(),
          })

          setTimeout(() => {
            if (importStatus.value === 'done') {
              importStatus.value = 'idle'
              importProgress.value = 0
            }
          }, 5000)

        } else if (data.status === 'error') {
          importStatus.value = 'error'
          error.value = data.error || '匯入任務失敗'
          cancelImportPoll()

        } else {
          _importPollTimer = setTimeout(poll, POLL_INTERVAL)
        }

      } catch (err) {
        console.error('⚠️ 輪詢進度失敗:', err)
        _importPollTimer = setTimeout(poll, POLL_INTERVAL * 2)
      }
    }

    _importPollTimer = setTimeout(poll, 1000)
  }

  const importMultipleFiles = async (files) => {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('檔案陣列不能為空')
    }

    loading.value = true
    error.value = null

    try {
      console.log(`🔄 正在上傳 ${files.length} 個檔案...`)

      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const data = await apiPostForm('/api/graph/import/files', formData)

      if (!Array.isArray(data)) {
        throw new Error('伺服器回傳數據格式錯誤')
      }

      const stats = addBatchNodes(data)
      console.log('✅ 檔案匯入成功:', stats)
      return stats

    } catch (err) {
      error.value = err.message || '檔案匯入失敗'
      console.error('❌ 檔案上傳失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadFileToGraph = async (file, graphId, graphMode = 'existing') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('graph_id', graphId)
    formData.append('graph_mode', graphMode)
    try {
      const result = await apiPostForm('/api/system/upload', formData)
      if (result.success) {
        await fetchGraphData(currentGraphId.value)
        console.log('✅ 文件上傳成功並已重新同步圖譜')
      }
      return result
    } catch (err) {
      console.error('❌ uploadFileToGraph 錯誤:', err)
      throw err
    }
  }

  return {
    // State
    importedFiles,
    importTaskId,
    importStatus,
    importProgress,
    importDetail,
    // Actions
    importFile,
    importExcelAsync,
    pollImportStatus,
    cancelImportPoll,
    importMultipleFiles,
    uploadFileToGraph,
  }
}
