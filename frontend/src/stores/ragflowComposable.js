/**
 * RAGFlow Composable — 從 graphStore.js 拆分
 *
 * 負責：RAGFlow 知識庫列表的集中管理。
 * 無跨 store 依賴，完全自包含。
 */
import { ref } from 'vue'
import { apiGet } from '../services/apiClient'

export function useRagflowFeatures() {
  const ragflowDatasets = ref([])

  const fetchRAGFlowDatasets = async () => {
    try {
      const data = await apiGet('/api/ragflow/datasets')
      if (data && data.code === 0) {
        ragflowDatasets.value = data.data || []
        console.log(`✅ 已加載 ${ragflowDatasets.value.length} 個 RAGFlow 知識庫`)
      }
      return ragflowDatasets.value
    } catch (err) {
      console.warn('⚠️ 獲取 RAGFlow 資料集失敗:', err.message)
      return []
    }
  }

  return {
    ragflowDatasets,
    fetchRAGFlowDatasets,
  }
}
