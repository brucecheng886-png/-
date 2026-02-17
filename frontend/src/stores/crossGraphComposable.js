/**
 * Cross-Graph Composable — 從 graphStore.js 拆分
 *
 * 負責：跨圖譜模式 (多圖譜合併顯示 + AI Link)、圖譜可見性切換、快照
 * 透過依賴注入 (deps) 存取 core graphStore 的 state。
 */
import { ref, computed } from 'vue'
import crossGraphData from '../data/crossGraphTestData.js'
import graphDataManager from '../services/GraphDataManager.js'

/**
 * @param {Object} deps
 * @param {import('vue').Ref} deps.nodes
 * @param {import('vue').Ref} deps.links
 * @param {import('vue').Ref} deps.loading
 * @param {import('vue').Ref} deps.error
 * @param {import('vue').Ref} deps.lastUpdate
 */
export function useCrossGraphFeatures(deps) {
  const { nodes, links, loading, error, lastUpdate } = deps

  // ===== State =====
  const graphMetadataList = ref([])
  const aiLinks = ref([])
  const activeGraphIds = ref([])
  const isCrossGraphMode = ref(false)

  // ===== Computed =====

  const allLinks = computed(() => {
    if (!isCrossGraphMode.value) return links.value
    return [...links.value, ...aiLinks.value]
  })

  const nodesByGraph = computed(() => {
    const groups = {}
    nodes.value.forEach(node => {
      const graphId = node.graphId || 'default'
      if (!groups[graphId]) groups[graphId] = []
      groups[graphId].push(node)
    })
    return groups
  })

  const graphStats = computed(() => ({
    totalGraphs: graphMetadataList.value.length,
    activeGraphs: activeGraphIds.value.length,
    totalNodes: nodes.value.length,
    totalLinks: links.value.length,
    totalAILinks: aiLinks.value.length,
    isCrossGraphMode: isCrossGraphMode.value,
  }))

  // ===== Actions =====

  const loadGraphMetadataList = async (options = {}) => {
    try {
      const graphs = await graphDataManager.loadMetadataList(options)
      graphMetadataList.value = graphs
      console.log(`✅ [Store] 圖譜列表已加載: ${graphs.length} 個`)
      return graphs
    } catch (err) {
      console.error('❌ [Store] 加載圖譜列表失敗:', err)
      throw err
    }
  }

  const loadCrossGraphData = async (graphIds = ['graph-tech', 'graph-learning']) => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 正在加載跨圖譜數據:', graphIds)

      await new Promise(resolve => setTimeout(resolve, 800))

      if (graphMetadataList.value.length === 0) {
        console.log('⚙️ 初始化圖譜元數據（使用測試數據）')
        graphMetadataList.value = crossGraphData.metadata
      }

      if (aiLinks.value.length === 0) {
        console.log('⚙️ 初始化 AI Links（使用測試數據）')
        aiLinks.value = crossGraphData.aiLinks
      }

      const allNodes = []
      const allLinksArr = []

      crossGraphData.graphs.forEach(graph => {
        if (graphIds.includes(graph.id)) {
          allNodes.push(...graph.nodes)
          allLinksArr.push(...graph.links)
        }
      })

      nodes.value = allNodes
      links.value = allLinksArr
      activeGraphIds.value = graphIds
      isCrossGraphMode.value = true
      lastUpdate.value = new Date()

      console.log('📊 跨圖譜數據已加載:', {
        graphs: graphIds,
        nodes: allNodes.length,
        links: allLinksArr.length,
        aiLinks: aiLinks.value.length,
      })

      return {
        metadata: graphMetadataList.value,
        nodes: allNodes,
        links: allLinksArr,
        aiLinks: aiLinks.value,
      }

    } catch (err) {
      error.value = err.message || '跨圖譜數據加載失敗'
      console.error('❌ 跨圖譜數據加載錯誤:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const exitCrossGraphMode = () => {
    isCrossGraphMode.value = false
    aiLinks.value = []
    activeGraphIds.value = []
    graphMetadataList.value = []
    console.log('✅ 已退出跨圖譜模式')
  }

  const toggleGraphVisibility = (graphId) => {
    const index = activeGraphIds.value.indexOf(graphId)
    if (index > -1) {
      activeGraphIds.value.splice(index, 1)
    } else {
      activeGraphIds.value.push(graphId)
    }

    if (activeGraphIds.value.length > 0) {
      loadCrossGraphData(activeGraphIds.value)
    } else {
      exitCrossGraphMode()
    }
  }

  const getNodeGraph = (nodeId) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node || !node.graphId) return null
    return graphMetadataList.value.find(g => g.id === node.graphId) || null
  }

  const getAILinkStats = () => {
    const stats = {
      total: aiLinks.value.length,
      byConfidence: {
        high: aiLinks.value.filter(l => l.confidence >= 0.8).length,
        medium: aiLinks.value.filter(l => l.confidence >= 0.5 && l.confidence < 0.8).length,
        low: aiLinks.value.filter(l => l.confidence < 0.5).length,
      },
      avgConfidence: aiLinks.value.reduce((sum, l) => sum + l.confidence, 0) / (aiLinks.value.length || 1),
    }
    return stats
  }

  const snapshotWorkspaceGraph = () => {
    if (nodes.value.length === 0) {
      throw new Error('工作檯暫無圖譜數據')
    }

    const snapshot = {
      id: 'workspace-snapshot-' + Date.now(),
      name: '工作檯快照',
      description: `包含 ${nodes.value.length} 個節點，${links.value.length} 個連接`,
      icon: '🌐',
      color: '#3b82f6',
      nodeCount: nodes.value.length,
      linkCount: links.value.length,
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      links: JSON.parse(JSON.stringify(links.value)),
      timestamp: new Date().toISOString(),
    }

    console.log('📸 工作檯圖譜快照已創建:', snapshot)
    return snapshot
  }

  const clearGraphMetadata = () => {
    graphMetadataList.value = []
    localStorage.removeItem('graphMetadataList')
    console.log('🗑️ 已清除所有圖譜元數據')
  }

  return {
    // State
    graphMetadataList,
    aiLinks,
    activeGraphIds,
    isCrossGraphMode,
    // Computed
    allLinks,
    nodesByGraph,
    graphStats,
    // Actions
    loadGraphMetadataList,
    loadCrossGraphData,
    exitCrossGraphMode,
    toggleGraphVisibility,
    getNodeGraph,
    getAILinkStats,
    snapshotWorkspaceGraph,
    clearGraphMetadata,
  }
}
