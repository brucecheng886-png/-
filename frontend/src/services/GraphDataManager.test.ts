import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock authFetch since we don't want real HTTP calls
vi.mock('@/services/apiClient', () => ({
  authFetch: vi.fn(),
}));

// Import after mock is set up
import GraphDataManager from '@/services/GraphDataManager';

// We only test the cache layer (synchronous), not the API calls
describe('GraphDataManager — cache', () => {
  let manager: InstanceType<typeof GraphDataManager>;

  beforeEach(() => {
    // Create a fresh instance per test (the default export is a singleton,
    // so we use the class constructor directly via the import)
    manager = new (GraphDataManager as any).constructor
      ? Object.create(GraphDataManager)
      : (GraphDataManager as any);
    // Actually, the module exports a singleton. We'll test on it directly
    // and clear cache between tests.
    manager = GraphDataManager;
    manager.invalidateCache(); // clear all
  });

  describe('getFromCache / saveToCache', () => {
    it('returns null for uncached graph', () => {
      expect(manager.getFromCache('nonexistent')).toBeNull();
    });

    it('returns data for cached graph', () => {
      const data = { nodes: [{ id: '1', name: 'A' }], links: [] };
      manager.saveToCache('g1', data as any);
      const cached = manager.getFromCache('g1');
      expect(cached).not.toBeNull();
      expect(cached!.nodes).toHaveLength(1);
      expect(cached!.nodes[0].id).toBe('1');
    });

    it('numeric and string graph IDs use same cache key', () => {
      const data = { nodes: [], links: [] };
      manager.saveToCache(42, data as any);
      expect(manager.getFromCache('42')).not.toBeNull();
      expect(manager.getFromCache(42)).not.toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('invalidates a specific graph', () => {
      manager.saveToCache('g1', { nodes: [], links: [] } as any);
      manager.saveToCache('g2', { nodes: [], links: [] } as any);
      manager.invalidateCache('g1');
      expect(manager.getFromCache('g1')).toBeNull();
      expect(manager.getFromCache('g2')).not.toBeNull();
    });

    it('clears all caches when called without args', () => {
      manager.saveToCache('g1', { nodes: [], links: [] } as any);
      manager.saveToCache('g2', { nodes: [], links: [] } as any);
      manager.invalidateCache();
      expect(manager.getFromCache('g1')).toBeNull();
      expect(manager.getFromCache('g2')).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    it('returns correct stats', () => {
      manager.saveToCache('a', { nodes: [], links: [] } as any);
      manager.saveToCache('b', { nodes: [{ id: '1' }], links: [] } as any);
      const stats = manager.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
    });
  });

  describe('getLoadingState', () => {
    it('returns loading state object', () => {
      const state = manager.getLoadingState();
      expect(state).toHaveProperty('isLoading');
      expect(state).toHaveProperty('progress');
      expect(state).toHaveProperty('error');
    });
  });
});
