/**
 * Graph API Composable — 從 graphStore.ts 拆分
 *
 * 負責：所有與後端 API 通訊的操作
 * - 圖譜數據載入（fetchGraphData、fetchNeighbors、executeCypherQuery）
 * - 圖譜 CRUD（createGraph、updateGraph、deleteGraph）
 * - 實體 CRUD（createEntity、batchCreateEntities、updateEntity、deleteEntity）
 *
 * 透過依賴注入 (deps) 存取 core graphStore 的 state / actions。
 */
import { type Ref } from 'vue'
import graphDataManager from '../services/GraphDataManager'
import { apiGet, apiPost, apiPut, apiDelete } from '../services/apiClient'
import type { GraphNode, GraphLink, GraphMetadata, BatchResult } from '@/types'

export interface GraphApiDeps {
  nodes: Ref<GraphNode[]>;
  links: Ref<GraphLink[]>;
  selectedNode: Ref<GraphNode | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  lastUpdate: Ref<Date | null>;
  currentGraphId: Ref<string | number | null>;
  graphMetadataList: Ref<GraphMetadata[]>;
  addNode: (node: Partial<GraphNode> & { id: string }) => GraphNode | null;
  addBatchNodes: (nodeArray: Array<Partial<GraphNode> & { id: string }>) => BatchResult;
  updateNode: (nodeId: string, updates: Partial<GraphNode>) => void;
  deleteNode: (nodeId: string) => void;
}

/** Cypher 查詢安全驗證（前端防護層） */
const CYPHER_BLOCKED = /\b(CREATE|DELETE|DETACH|SET|REMOVE|MERGE|DROP|ALTER|CALL|COPY|LOAD)\b/i
const MAX_CYPHER_LENGTH = 2000

export function useGraphApiFeatures(deps: GraphApiDeps) {
  const {
    nodes, links, selectedNode, loading, error, lastUpdate,
    currentGraphId, graphMetadataList,
    addNode, addBatchNodes, updateNode, deleteNode,
  } = deps

  // ===== Data Loading =====

  /**
   * 獲取圖譜數據（使用 Manager - 自動去重和緩存）
   * @param graphId - 圖譜 ID
   * @param options - 選項（forceRefresh 強制刷新）
   */
  const fetchGraphData = async (graphId: string | number | null = null, options: { forceRefresh?: boolean } = {}) => {
    loading.value = true
    error.value = null

    try {
      // 更新當前圖譜 ID 並持久化
      currentGraphId.value = graphId
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastGraphId', String(graphId))
      }

      console.log(`🔄 [Store] 加載圖譜數據: ${graphId}`)

      // ✨ 使用 Manager 加載（自動處理緩存和去重）
      const result = await graphDataManager.loadGraph(graphId, options)
      const { nodes: apiNodes, links: apiLinks, metadata } = result

      // 更新 Store 數據
      nodes.value = apiNodes || []
      links.value = apiLinks || []
      lastUpdate.value = new Date()

      // 更新元數據統計
      const existingIndex = graphMetadataList.value.findIndex(g => String(g.id) === String(graphId))
      if (existingIndex >= 0) {
        graphMetadataList.value[existingIndex] = {
          ...graphMetadataList.value[existingIndex],
          nodeCount: apiNodes.length,
          linkCount: apiLinks?.length || 0,
          lastUpdate: new Date().toISOString()
        }
      } else {
        graphMetadataList.value.push({
          id: graphId,
          name: (metadata as any)?.note || `圖譜 ${graphId}`,
          description: '從 KuzuDB 載入的知識圖譜',
          icon: '🌐',
          color: '#3b82f6',
          nodeCount: apiNodes.length,
          linkCount: apiLinks?.length || 0,
          lastUpdate: new Date().toISOString()
        })
      }

      console.log(`✅ [Store] 圖譜數據已同步: ${apiNodes.length} 節點, ${apiLinks?.length || 0} 連接`)
      return { nodes: apiNodes, links: apiLinks || [] }

    } catch (err: any) {
      error.value = err.message || '數據加載失敗'
      console.error('❌ [Store] 圖譜數據加載錯誤:', err)
      nodes.value = []
      links.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 獲取指定節點的鄰居節點（統一 API）
   * @param entityId - 實體 ID
   * @returns { nodes, links }
   */
  const fetchNeighbors = async (entityId: string) => {
    if (!entityId) throw new Error('entityId 不能為空')
    loading.value = true
    error.value = null
    try {
      const data = await apiGet(`/api/graph/entities/${entityId}/neighbors`)
      if (!data.success) throw new Error(data.message || '獲取鄰居節點失敗')
      console.log(`✅ 鄰居節點已加載:`, data.data)
      return data.data
    } catch (err: any) {
      error.value = err.message || '獲取鄰居節點失敗'
      console.error('❌ 獲取鄰居節點錯誤:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 執行 Cypher 查詢（統一 API）
   * 後端已有 BLOCKED_KEYWORDS 白名單，此為 defense-in-depth
   * @param query - Cypher 查詢語句
   * @param params - 查詢參數（可選）
   */
  const executeCypherQuery = async (query: string, params: Record<string, unknown> = {}) => {
    if (!query || typeof query !== 'string') {
      throw new Error('query 必須為非空字串')
    }

    // 前端安全檢查
    if (query.length > MAX_CYPHER_LENGTH) {
      throw new Error(`查詢長度超過限制 (${MAX_CYPHER_LENGTH} 字元)`)
    }
    if (CYPHER_BLOCKED.test(query)) {
      throw new Error('安全限制：僅允許讀取查詢 (MATCH/RETURN)，禁止寫入操作')
    }

    loading.value = true
    error.value = null
    try {
      console.log(`🔄 Cypher 查詢:`, query)
      const data = await apiPost('/api/graph/query', { query, params })
      if (!data.success) throw new Error(data.message || 'Cypher 查詢失敗')
      console.log(`✅ Cypher 查詢結果:`, data.data)
      return data.data
    } catch (err: any) {
      error.value = err.message || 'Cypher 查詢失敗'
      console.error('❌ Cypher 查詢錯誤:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== Graph CRUD =====

  /**
   * 創建新圖譜（調用後端 API）
   * @param graphData - 圖譜數據 { name, description, icon, color }
   * @returns 創建的圖譜元數據
   */
  const createGraph = async (graphData: { name: string; description?: string; icon?: string; color?: string }): Promise<GraphMetadata> => {
    if (!graphData.name || !graphData.name.trim()) {
      throw new Error('圖譜名稱不能為空')
    }

    loading.value = true
    error.value = null

    try {
      console.log('🔄 [Store] 創建新圖譜:', graphData.name)

      // ✨ 使用 Manager 創建（自動刷新緩存）
      const newGraph = await graphDataManager.createGraph(graphData)

      // 添加到本地圖譜列表
      graphMetadataList.value.push(newGraph)

      console.log('✅ [Store] 圖譜創建成功並已同步:', newGraph)
      return newGraph

    } catch (err: any) {
      error.value = err.message || '圖譜創建失敗'
      console.error('❌ [Store] 圖譜創建錯誤:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新圖譜元數據（名稱、描述、圖示、顏色）
   * @param graphId - 圖譜 ID
   * @param updates - { name?, description?, icon?, color? }
   * @returns 更新後的圖譜元數據
   */
  const updateGraph = async (graphId: string | number, updates: Partial<GraphMetadata>): Promise<GraphMetadata> => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 [Store] 更新圖譜:', graphId, updates)

      const updatedGraph = await graphDataManager.updateGraph(graphId, updates)

      // 同步本地圖譜列表
      const idx = graphMetadataList.value.findIndex(g => String(g.id) === String(graphId))
      if (idx !== -1) {
        graphMetadataList.value[idx] = { ...graphMetadataList.value[idx], ...updatedGraph }
      }

      console.log('✅ [Store] 圖譜更新成功:', updatedGraph)
      return updatedGraph

    } catch (err: any) {
      error.value = err.message || '圖譜更新失敗'
      console.error('❌ [Store] 圖譜更新錯誤:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 刪除圖譜（調用後端 API + 同步 store）
   * @param graphId - 圖譜 ID
   * @param cascade - 是否級聯刪除所有節點（預設 true）
   * @returns 是否成功
   */
  const deleteGraph = async (graphId: string | number, cascade = true): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      console.log('🗑️ [Store] 刪除圖譜:', graphId, cascade ? '(級聯)' : '')

      await graphDataManager.deleteGraph(graphId, cascade)

      // 從本地列表移除
      graphMetadataList.value = graphMetadataList.value.filter(
        g => String(g.id) !== String(graphId)
      )

      // 如果刪除的是當前圖譜，切換到剩餘的第一個圖譜
      if (String(currentGraphId.value) === String(graphId)) {
        const remaining = graphMetadataList.value[0]
        if (remaining) {
          currentGraphId.value = remaining.id
          localStorage.setItem('lastGraphId', String(remaining.id))
        } else {
          currentGraphId.value = null
          localStorage.removeItem('lastGraphId')
        }
        // 清空當前節點/連線
        nodes.value = []
        links.value = []
        selectedNode.value = null
      }

      console.log('✅ [Store] 圖譜刪除成功:', graphId)
      return true

    } catch (err: any) {
      error.value = err.message || '圖譜刪除失敗'
      console.error('❌ [Store] 圖譜刪除錯誤:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== Entity CRUD =====

  /**
   * 創建單一實體節點（調用後端 API + 同步 store）
   * @param entity - 實體 { id, name, type, description, properties }
   * @returns 創建結果
   */
  const createEntity = async (entity: Partial<GraphNode> & { id: string; name: string; type: string }) => {
    loading.value = true
    error.value = null
    try {
      const result = await apiPost('/api/graph/create', {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        description: entity.description || '',
        properties: entity.properties || {},
        graph_id: String(currentGraphId.value)
      })
      if (!result.success) throw new Error(result.message || '創建實體失敗')
      addNode({ id: entity.id, name: entity.name, type: entity.type, description: entity.description || '', ...entity })
      console.log('✅ 實體已創建並同步到 store:', entity.name)
      return result
    } catch (err: any) {
      error.value = err.message
      console.error('❌ createEntity 錯誤:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量創建實體（調用後端 API + 同步 store）
   * @param entities - 實體陣列
   * @returns 創建結果
   */
  const batchCreateEntities = async (entities: Array<Partial<GraphNode> & { id: string; name: string; type: string }>) => {
    loading.value = true
    error.value = null
    try {
      const result = await apiPost('/api/graph/batch-create', {
        entities: entities.map(e => ({ ...e, graph_id: String(currentGraphId.value) }))
      })
      addBatchNodes(entities)
      console.log('✅ 批量實體已創建並同步到 store:', entities.length, '筆')
      return result
    } catch (err: any) {
      error.value = err.message
      console.error('❌ batchCreateEntities 錯誤:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新實體節點（調用後端 API + 同步 store）
   * @param nodeId - 節點 ID
   * @param updates - 要更新的屬性 { name, link, description, image, ... }
   * @returns 更新結果
   */
  const updateEntity = async (nodeId: string, updates: Partial<GraphNode>) => {
    try {
      const result = await apiPut(`/api/graph/entities/${encodeURIComponent(nodeId)}`, updates)
      updateNode(nodeId, updates)
      console.log('✅ 實體已更新並同步到 store:', nodeId)
      return result
    } catch (err: any) {
      console.error('❌ updateEntity 錯誤:', err)
      throw err
    }
  }

  /**
   * 刪除實體節點（調用後端 API + 同步 store）
   * @param nodeId - 節點 ID
   * @returns 刪除結果
   */
  const deleteEntity = async (nodeId: string) => {
    try {
      const result = await apiDelete(`/api/graph/entities/${encodeURIComponent(nodeId)}`)
      deleteNode(nodeId)
      console.log('✅ 實體已刪除並同步 store:', nodeId)
      return result
    } catch (err: any) {
      console.error('❌ deleteEntity 錯誤:', err)
      throw err
    }
  }

  return {
    // Data Loading
    fetchGraphData,
    fetchNeighbors,
    executeCypherQuery,
    // Graph CRUD
    createGraph,
    updateGraph,
    deleteGraph,
    // Entity CRUD
    createEntity,
    batchCreateEntities,
    updateEntity,
    deleteEntity,
  }
}
