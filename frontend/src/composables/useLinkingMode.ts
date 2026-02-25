/**
 * useLinkingMode — 手動連線模式 composable
 *
 * 從 GraphPage.vue 提取的連線邏輯：
 *   isLinkingMode / linkingSource / toggleLinkingMode / handleLinkingClick
 *
 * @since v5.5
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export interface LinkingModeDeps {
  graphStore: any
}

export function useLinkingMode(deps: LinkingModeDeps) {
  const { graphStore } = deps

  const isLinkingMode = ref(false)
  const linkingSource = ref<any>(null)

  /** 切換連線模式 */
  const toggleLinkingMode = () => {
    isLinkingMode.value = !isLinkingMode.value

    if (isLinkingMode.value) {
      linkingSource.value = null
      ElMessage.success('🔗 連線模式已開啟，請點擊兩個節點建立連結')
    } else {
      linkingSource.value = null
      ElMessage.info('🔗 連線模式已關閉')
    }
  }

  /** 連線模式下的節點點擊處理 */
  const handleLinkingClick = (node: any) => {
    if (!linkingSource.value) {
      // 第一次點擊：設定起點
      linkingSource.value = node
      ElMessage.info(`📍 起點: ${node.name}，請選擇目標節點`)
    } else {
      // 第二次點擊：建立連結
      if (linkingSource.value.id === node.id) {
        ElMessage.warning('⚠️ 無法連結到自己')
        return
      }

      const existingLink = graphStore.links.find(
        (link: any) =>
          (link.source === linkingSource.value.id && link.target === node.id) ||
          (link.source === node.id && link.target === linkingSource.value.id),
      )

      if (existingLink) {
        ElMessage.warning('⚠️ 連結已存在')
        linkingSource.value = null
        return
      }

      graphStore.addLink({
        source: linkingSource.value.id,
        target: node.id,
        value: 3,
        label: '手動連結',
      })

      ElMessage.success(`✅ 已連結: ${linkingSource.value.name} → ${node.name}`)
      console.log('🔗 新連結:', linkingSource.value.id, '->', node.id)

      linkingSource.value = null
    }
  }

  return {
    isLinkingMode,
    linkingSource,
    toggleLinkingMode,
    handleLinkingClick,
  }
}
