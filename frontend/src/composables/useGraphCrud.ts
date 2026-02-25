/**
 * useGraphCrud — 圖譜 CRUD 操作 composable
 * 
 * 從 GraphPage.vue 提取的圖譜管理邏輯：
 *   handleGraphChange / handleEditGraph / handleCreateGraph / handleDeleteGraph
 * 
 * @since v5.5
 */
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface GraphCrudDeps {
  graphStore: any
  selectedGraphId: Ref<any>
  isLoading: Ref<boolean>
  isSelectOpen: Ref<boolean>
}

export function useGraphCrud(deps: GraphCrudDeps) {
  const { graphStore, selectedGraphId, isLoading, isSelectOpen } = deps
  const router = useRouter()

  /** 切換圖譜 */
  const handleGraphChange = async (graphIdOrEvent: any) => {
    let graphId: any
    if (graphIdOrEvent?.target?.value !== undefined) {
      graphId = graphIdOrEvent.target.value
    } else {
      graphId = graphIdOrEvent
    }
    console.log('📊 [GraphPage] 切換圖譜:', graphId)

    selectedGraphId.value = graphId
    localStorage.setItem('lastGraphId', String(graphId))

    try {
      isLoading.value = true
      await graphStore.fetchGraphData(graphId)
      console.log('✅ [GraphPage] 圖譜切換完成:', graphStore.nodeCount, '個節點')
      ElMessage.success(`🔄 已切換到圖譜: ${graphId}`)
    } catch (error: any) {
      console.error('❌ [GraphPage] 圖譜切換失敗:', error)
      ElMessage.error('圖譜切換失敗: ' + error.message)
    } finally {
      isLoading.value = false
    }
    isSelectOpen.value = false
  }

  /** 編輯圖譜名稱 */
  const handleEditGraph = async () => {
    const graphId = selectedGraphId.value
    const graph = graphStore.graphMetadataList.find(
      (g: any) => String(g.id) === String(graphId),
    )
    const currentName = graph?.name || ''

    try {
      const { value: newName } = await ElMessageBox.prompt(
        '請輸入新的圖譜名稱',
        '編輯圖譜',
        {
          confirmButtonText: '儲存',
          cancelButtonText: '取消',
          inputValue: currentName,
          inputPattern: /\S+/,
          inputErrorMessage: '圖譜名稱不能為空',
          customClass: 'dark-message-box',
        },
      )

      if (newName && newName.trim() !== currentName) {
        await graphStore.updateGraph(graphId, { name: newName.trim() })
        ElMessage.success(`✅ 圖譜已重新命名為「${newName.trim()}」`)
      }
    } catch {
      // 使用者取消
    }
  }

  /** 新增圖譜 */
  const handleCreateGraph = async () => {
    try {
      const { value: graphName } = await ElMessageBox.prompt(
        '請輸入圖譜名稱',
        '新增圖譜',
        {
          confirmButtonText: '建立',
          cancelButtonText: '取消',
          inputPlaceholder: '例如：研究專題、專案知識庫...',
          inputPattern: /\S+/,
          inputErrorMessage: '圖譜名稱不能為空',
          customClass: 'dark-message-box',
        },
      )

      if (graphName && graphName.trim()) {
        const newGraph = await graphStore.createGraph({ name: graphName.trim() })
        ElMessage.success(`✅ 圖譜「${graphName.trim()}」已建立`)

        selectedGraphId.value = newGraph.id
        await graphStore.fetchGraphData(newGraph.id)

        try {
          await ElMessageBox.confirm(
            `圖譜「${graphName.trim()}」已建立成功，\n是否立即前往匯入資料？`,
            '📂 匯入資料',
            {
              confirmButtonText: '前往匯入',
              cancelButtonText: '稍後再說',
              type: 'info',
              customClass: 'dark-message-box',
            },
          )
          router.push({ path: '/import', query: { graphId: newGraph.id } })
        } catch {
          // 使用者選擇稍後再說
        }
      }
    } catch {
      // 使用者取消
    }
  }

  /** 刪除圖譜 */
  const handleDeleteGraph = async () => {
    const graphId = selectedGraphId.value

    if (graphStore.graphMetadataList.length <= 1) {
      ElMessage.warning('⚠️ 至少需要保留一個圖譜，無法刪除')
      return
    }

    const graph = graphStore.graphMetadataList.find(
      (g: any) => String(g.id) === String(graphId),
    )
    const graphName = graph?.name || graphId
    const nodeCount = graphStore.nodeCount
    const linkCount = graphStore.linkCount

    const ragflowInfo = graph?.ragflow_dataset_id
      ? `• RAGFlow 知識庫中的所有文件\n\n`
      : '\n'

    try {
      await ElMessageBox.confirm(
        `確定要刪除圖譜「${graphName}」嗎？\n\n` +
          `此操作將永久刪除：\n` +
          `• ${nodeCount} 個節點\n` +
          `• ${linkCount} 條連線\n` +
          ragflowInfo +
          `⚠️ 此操作無法復原！`,
        '刪除圖譜',
        {
          confirmButtonText: '確定刪除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          customClass: 'dark-message-box',
        },
      )

      await graphStore.deleteGraph(graphId, true)

      const remaining = graphStore.graphMetadataList[0]
      if (remaining) {
        selectedGraphId.value = remaining.id
        await graphStore.fetchGraphData(remaining.id)
      }

      ElMessage.success(`✅ 圖譜「${graphName}」已刪除`)
    } catch (action: any) {
      if (action !== 'cancel') {
        ElMessage.error(`❌ 刪除失敗: ${action.message || action}`)
      }
    }
  }

  return {
    handleGraphChange,
    handleEditGraph,
    handleCreateGraph,
    handleDeleteGraph,
  }
}
