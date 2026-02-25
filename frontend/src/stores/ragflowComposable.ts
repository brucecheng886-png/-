/**
 * RAGFlow Composable — 從 graphStore.js 拆分
 *
 * 負責：RAGFlow 知識庫列表的集中管理。
 * 無跨 store 依賴，完全自包含。
 */
import { ref, type Ref } from 'vue'
import { apiGet } from '../services/apiClient'

export interface RagflowDataset {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function useRagflowFeatures() {
  const ragflowDatasets: Ref<RagflowDataset[]> = ref([])

  const fetchRAGFlowDatasets = async (): Promise<RagflowDataset[]> => {
    try {
      const data = await apiGet<RagflowDataset[]>('/api/ragflow/datasets')
      if (data && data.success) {
        ragflowDatasets.value = data.data || []
        console.log(`✅ 已加載 ${ragflowDatasets.value.length} 個 RAGFlow 知識庫`)
      }
      return ragflowDatasets.value
    } catch (err: any) {
      console.warn('⚠️ 獲取 RAGFlow 資料集失敗:', err.message)
      return []
    }
  }

  return {
    ragflowDatasets,
    fetchRAGFlowDatasets,
  }
}
