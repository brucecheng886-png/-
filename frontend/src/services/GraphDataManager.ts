/**
 * 圖譜數據管理器 - 統一管理圖譜數據的加載、緩存和同步
 * 
 * 核心功能:
 * - 請求去重 (同一圖譜 ID 的並發請求只發送一次)
 * - 智能緩存 (LRU Cache + TTL)
 * - 加載狀態追蹤
 * - 統一錯誤處理
 * - 自動數據同步
 * - 認證 Token 自動附加
 * 
 * @author BruV Team
 * @date 2026-02-07
 */

import { authFetch } from './apiClient';
import type { GraphData, GraphMetadata, GraphNode, GraphLink } from '@/types';

interface CacheEntry {
  data: GraphData;
  timestamp: number;
}

interface LoadingState {
  isLoading: boolean;
  currentGraphId: string | number | null;
  progress: number;
  error: string | null;
}

interface MetadataCache {
  data: GraphMetadata[];
  timestamp: number | null;
  promise: Promise<GraphMetadata[]> | null;
}

interface LoadGraphOptions {
  forceRefresh?: boolean;
  silent?: boolean;
}

class GraphDataManager {
  private cache: Map<string, CacheEntry>;
  private maxCacheSize: number;
  private cacheTTL: number;
  private pendingRequests: Map<string, Promise<GraphData>>;
  private loadingState: LoadingState;
  private metadataCache: MetadataCache;

  constructor() {
    // ===== 緩存配置 =====
    this.cache = new Map();
    this.maxCacheSize = 10;
    this.cacheTTL = 5 * 60 * 1000; // 5 分鐘過期
    
    // ===== 請求去重 =====
    this.pendingRequests = new Map();
    
    // ===== 加載狀態 =====
    this.loadingState = {
      isLoading: false,
      currentGraphId: null,
      progress: 0,
      error: null
    };
    
    // ===== 元數據緩存 =====
    this.metadataCache = {
      data: [],
      timestamp: null,
      promise: null
    };
    
    console.log('✅ GraphDataManager 已初始化');
  }
  
  // ===== 圖譜數據加載 =====
  
  /**
   * 加載圖譜數據（帶去重和緩存）
   * @param {string|number} graphId - 圖譜 ID
   * @param {Object} options - 選項
   * @param {boolean} options.forceRefresh - 強制刷新（忽略緩存）
   * @param {boolean} options.silent - 靜默模式（不更新加載狀態）
   * @returns {Promise<Object>} { nodes, links, metadata }
   */
  async loadGraph(graphId: string | number, options: LoadGraphOptions = {}): Promise<GraphData> {
    const { forceRefresh = false, silent = false } = options;
    
    // 檢查緩存
    if (!forceRefresh) {
      const cached = this.getFromCache(graphId);
      if (cached) {
        console.log(`📦 使用緩存數據: 圖譜 ${graphId}`);
        return cached;
      }
    }
    
    // 請求去重：如果已有相同請求正在進行，直接返回該 Promise
    if (this.pendingRequests.has(graphId)) {
      console.log(`⏳ 等待現有請求: 圖譜 ${graphId}`);
      return this.pendingRequests.get(graphId);
    }
    
    // 創建新請求
    const requestPromise = this._fetchGraphFromAPI(graphId, silent);
    this.pendingRequests.set(graphId, requestPromise);
    
    try {
      const result = await requestPromise;
      
      // 存入緩存
      this.saveToCache(graphId, result);
      
      return result;
    } finally {
      // 清理請求記錄
      this.pendingRequests.delete(graphId);
    }
  }
  
  /**
   * 從 API 獲取圖譜數據（私有方法）
   */
  private async _fetchGraphFromAPI(graphId: string | number, silent = false): Promise<GraphData> {
    if (!silent) {
      this.loadingState.isLoading = true;
      this.loadingState.currentGraphId = graphId;
      this.loadingState.progress = 0;
      this.loadingState.error = null;
    }
    
    try {
      console.log(`🔄 從 API 加載圖譜: ${graphId}`);
      
      const response = await authFetch(`/api/graph/data?graph_id=${encodeURIComponent(graphId)}`);
      
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.data?.metadata?.note || '獲取圖譜數據失敗');
      }
      
      const { nodes, links, metadata } = result.data;
      
      console.log(`✅ 圖譜數據已加載: ${graphId} (${nodes?.length || 0} 節點, ${links?.length || 0} 連接)`);
      
      return {
        nodes: nodes || [],
        links: links || [],
        metadata: metadata || {}
      };
      
    } catch (error) {
      this.loadingState.error = error.message;
      console.error(`❌ 圖譜加載失敗 (${graphId}):`, error);
      throw error;
    } finally {
      if (!silent) {
        this.loadingState.isLoading = false;
        this.loadingState.progress = 100;
      }
    }
  }
  
  // ===== 圖譜元數據管理 =====
  
  /**
   * 加載圖譜元數據列表（帶去重和緩存）
   * @param {Object} options - 選項
   * @param {boolean} options.forceRefresh - 強制刷新
   * @returns {Promise<Array>} 圖譜列表
   */
  async loadMetadataList(options: { forceRefresh?: boolean } = {}): Promise<GraphMetadata[]> {
    const { forceRefresh = false } = options;
    
    // 檢查緩存
    if (!forceRefresh && this.metadataCache.data.length > 0) {
      const age = Date.now() - (this.metadataCache.timestamp || 0);
      if (age < this.cacheTTL) {
        console.log(`📦 使用緩存的元數據列表 (${this.metadataCache.data.length} 個)`);
        return this.metadataCache.data;
      }
    }
    
    // 請求去重
    if (this.metadataCache.promise) {
      console.log('⏳ 等待現有元數據請求');
      return this.metadataCache.promise;
    }
    
    // 創建新請求
    const requestPromise = this._fetchMetadataFromAPI();
    this.metadataCache.promise = requestPromise;
    
    try {
      const result = await requestPromise;
      
      // 更新緩存
      this.metadataCache.data = result;
      this.metadataCache.timestamp = Date.now();
      
      return result;
    } finally {
      this.metadataCache.promise = null;
    }
  }
  
  /**
   * 從 API 獲取元數據列表（私有方法）
   */
  private async _fetchMetadataFromAPI(): Promise<GraphMetadata[]> {
    console.log('🔄 從 API 加載圖譜元數據列表');
    
    try {
      const response = await authFetch('/api/graph/metadata');
      
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.graphs) {
        throw new Error('獲取圖譜列表失敗');
      }
      
      console.log(`✅ 圖譜列表已加載: ${result.graphs.length} 個`);
      return result.graphs;
      
    } catch (error) {
      console.error('❌ 元數據加載失敗:', error);
      // 失敗時返回空數組，不阻斷應用
      return [];
    }
  }
  
  // ===== 緩存管理 =====
  
  /**
   * 從緩存獲取數據
   */
  getFromCache(graphId: string | number): GraphData | null {
    const cached = this.cache.get(String(graphId));
    
    if (!cached) {
      return null;
    }
    
    // 檢查是否過期
    const age = Date.now() - cached.timestamp;
    if (age > this.cacheTTL) {
      console.log(`⏰ 緩存已過期: 圖譜 ${graphId}`);
      this.cache.delete(String(graphId));
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * 保存到緩存（LRU 策略）
   */
  saveToCache(graphId: string | number, data: GraphData): void {
    const key = String(graphId);
    
    // LRU: 如果已存在，先刪除再重新插入（保證最新的在最後）
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // LRU: 如果緩存滿了，刪除最舊的（第一個）
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      console.log(`🗑️ 緩存已滿，移除: 圖譜 ${firstKey}`);
      this.cache.delete(firstKey);
    }
    
    // 保存新數據
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`💾 數據已緩存: 圖譜 ${graphId} (緩存數: ${this.cache.size})`);
  }
  
  /**
   * 清空指定圖譜的緩存
   */
  invalidateCache(graphId?: string | number): void {
    if (graphId) {
      this.cache.delete(String(graphId));
      console.log(`🗑️ 緩存已清除: 圖譜 ${graphId}`);
    } else {
      this.cache.clear();
      console.log('🗑️ 所有緩存已清除');
    }
  }
  
  /**
   * 清空元數據緩存
   */
  invalidateMetadataCache(): void {
    this.metadataCache.data = [];
    this.metadataCache.timestamp = null;
    console.log('🗑️ 元數據緩存已清除');
  }
  
  // ===== 圖譜操作（會自動同步緩存）=====
  
  /**
   * 創建圖譜
   */
  async createGraph(graphData: Partial<GraphMetadata> & { name: string }): Promise<GraphMetadata> {
    console.log('🔄 創建新圖譜:', graphData.name);
    
    try {
      const response = await authFetch('/api/graph/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: graphData.name.trim(),
          description: graphData.description || `自定義圖譜：${graphData.name}`,
          icon: graphData.icon || '🌐',
          color: graphData.color || '#3b82f6',
          cover_image: graphData.cover_image || '',
          ragflow_dataset_id: graphData.ragflow_dataset_id || ''
        })
      });
      
      if (!response.ok) {
        throw new Error(`創建圖譜失敗: HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.graph) {
        throw new Error(result.message || '創建圖譜失敗');
      }
      
      // ✨ 自動刷新元數據緩存
      this.invalidateMetadataCache();
      
      console.log('✅ 圖譜創建成功:', result.graph);
      return result.graph;
      
    } catch (error) {
      console.error('❌ 圖譜創建失敗:', error);
      throw error;
    }
  }
  
  /**
   * 更新圖譜元數據（名稱、描述、圖示、顏色）
   */
  async updateGraph(graphId: string | number, updates: Partial<GraphMetadata>): Promise<GraphMetadata> {
    console.log('🔄 更新圖譜元數據:', graphId, updates);
    
    try {
      const response = await authFetch(`/api/graph/metadata/${graphId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error(`更新圖譜失敗: HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '更新圖譜失敗');
      }
      
      this.invalidateMetadataCache();
      
      console.log('✅ 圖譜更新成功:', result.graph);
      return result.graph;
      
    } catch (error) {
      console.error('❌ 圖譜更新失敗:', error);
      throw error;
    }
  }
  
  /**
   * 刪除圖譜
   */
  async deleteGraph(graphId: string | number, cascade = true): Promise<boolean> {
    console.log('🔄 刪除圖譜:', graphId, cascade ? '(級聯)' : '');
    
    try {
      const response = await authFetch(`/api/graph/metadata/${graphId}?cascade=${cascade}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`刪除圖譜失敗: HTTP ${response.status}`);
      }
      
      // ✨ 自動清理緩存
      this.invalidateCache(graphId);
      this.invalidateMetadataCache();
      
      console.log('✅ 圖譜已刪除:', graphId);
      return true;
      
    } catch (error) {
      console.error('❌ 圖譜刪除失敗:', error);
      throw error;
    }
  }
  
  // ===== 工具方法 =====
  
  /**
   * 獲取加載狀態
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }
  
  /**
   * 獲取緩存統計
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys()),
      metadataCount: this.metadataCache.data.length,
      metadataCached: this.metadataCache.timestamp !== null
    };
  }
  
  /**
   * 預載入圖譜（後台靜默加載）
   */
  async preloadGraph(graphId: string | number): Promise<void> {
    console.log(`🔮 預載入圖譜: ${graphId}`);
    try {
      await this.loadGraph(graphId, { silent: true });
    } catch (error) {
      // 預載入失敗不影響主流程
      console.warn(`⚠️ 預載入失敗: ${graphId}`, error.message);
    }
  }
}

// ===== 單例模式：全局共享一個實例 =====
const graphDataManager = new GraphDataManager();

export default graphDataManager;
