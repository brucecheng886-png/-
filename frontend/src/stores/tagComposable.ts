/**
 * Tag Composable — 從 graphStore.ts 拆分
 *
 * 負責：節點標籤管理（新增/移除 Tag、Tag 過濾、統計）
 * 透過依賴注入 (deps) 存取 core graphStore 的 state。
 */
import { ref, computed, type Ref } from 'vue'
import type { GraphNode, TagFilterMode } from '@/types'
import graphDataManager from '../services/GraphDataManager'

export interface TagDeps {
  nodes: Ref<GraphNode[]>;
  nodeVersion: Ref<number>;
  currentGraphId: Ref<string | number | null>;
}

export function useTagFeatures(deps: TagDeps) {
  const { nodes, nodeVersion, currentGraphId } = deps

  // ===== State =====

  /** Tag 過濾狀態 */
  const activeTagFilter: Ref<string | string[] | null> = ref(null)

  /** Tag 過濾模式: 'any'=包含任一 tag, 'all'=包含所有 tag */
  const tagFilterMode: Ref<TagFilterMode> = ref('any')

  // ===== Computed =====

  /** 按 Tag 分組的節點統計 */
  const nodesByTag = computed((): Record<string, GraphNode[]> => {
    const groups: Record<string, GraphNode[]> = {}
    nodes.value.forEach(node => {
      const tags = node.tags || []
      tags.forEach((tag: string) => {
        if (!groups[tag]) groups[tag] = []
        groups[tag].push(node)
      })
    })
    return groups
  })

  /** 所有唯一的 Tag 列表（帶統計） */
  const allTags = computed(() => {
    const tagMap = new Map<string, number>()
    nodes.value.forEach(node => {
      (node.tags || []).forEach((tag: string) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      })
    })
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  })

  // ===== Actions =====

  /**
   * 新增 Tag 到節點
   * @param nodeId - 節點 ID
   * @param tag - 標籤名稱
   */
  const addTagToNode = (nodeId: string, tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) {
      console.error('❌ 節點不存在:', nodeId)
      return
    }
    if (!node.tags) node.tags = []
    if (node.tags.includes(trimmed)) {
      console.warn('⚠️ Tag 已存在:', trimmed)
      return
    }
    node.tags = [...node.tags, trimmed]
    nodeVersion.value++
    graphDataManager.invalidateCache(currentGraphId.value)
    console.log('🏷️ Tag 已新增:', trimmed, '→', nodeId)
  }

  /**
   * 從節點移除 Tag
   * @param nodeId - 節點 ID
   * @param tag - 標籤名稱
   */
  const removeTagFromNode = (nodeId: string, tag: string) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node || !node.tags) return
    node.tags = node.tags.filter((t: string) => t !== tag)
    nodeVersion.value++
    graphDataManager.invalidateCache(currentGraphId.value)
    console.log('🗑️ Tag 已移除:', tag, '←', nodeId)
  }

  /**
   * 取得所有唯一 Tag 名稱
   * @returns 排序後的 tag 名稱陣列
   */
  const getAllTagNames = (): string[] => {
    const tagSet = new Set<string>()
    nodes.value.forEach(n => (n.tags || []).forEach((t: string) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }

  /**
   * 設定 Tag 過濾
   * @param tags - 篩選的 tag (單個、多個、或 null 清除)
   * @param mode - 'any' | 'all'
   */
  const setTagFilter = (tags: string | string[] | null, mode: TagFilterMode = 'any') => {
    activeTagFilter.value = tags
    tagFilterMode.value = mode
    console.log('🏷️ Tag 過濾已設定:', tags, mode)
  }

  return {
    // State
    activeTagFilter,
    tagFilterMode,
    // Computed
    nodesByTag,
    allTags,
    // Actions
    addTagToNode,
    removeTagFromNode,
    getAllTagNames,
    setTagFilter,
  }
}
