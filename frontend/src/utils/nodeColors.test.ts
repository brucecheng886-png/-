import { describe, it, expect } from 'vitest';
import {
  getNodeTypeColor,
  getNodeColor,
  getNodeGlow,
  getAllNodeTypes,
  getTypeGroups,
  getActiveNodeTypes,
} from '@/utils/nodeColors';

describe('nodeColors', () => {
  // ── getNodeTypeColor ──
  describe('getNodeTypeColor', () => {
    it('returns config for known type', () => {
      const config = getNodeTypeColor('concept');
      expect(config.color).toBe('#3b82f6');
      expect(config.label).toBe('概念');
      expect(config.emoji).toBe('💡');
      expect(config.group).toBe('knowledge');
    });

    it('is case-insensitive', () => {
      expect(getNodeTypeColor('CONCEPT').color).toBe('#3b82f6');
      expect(getNodeTypeColor('Person').color).toBe('#f59e0b');
    });

    it('trims whitespace', () => {
      expect(getNodeTypeColor('  concept  ').color).toBe('#3b82f6');
    });

    it('returns unknown config for null/undefined', () => {
      expect(getNodeTypeColor(null).label).toBe('未知');
      expect(getNodeTypeColor(undefined).label).toBe('未知');
    });

    it('returns unknown config for unregistered type', () => {
      const config = getNodeTypeColor('nonexistent_type_xyz');
      expect(config.color).toBe('#64748b');
      expect(config.label).toBe('未知');
    });
  });

  // ── getNodeColor ──
  describe('getNodeColor', () => {
    it('returns node custom color when present (non-default)', () => {
      expect(getNodeColor({ color: '#ff0000', type: 'concept' })).toBe('#ff0000');
    });

    it('falls back to type color when node color is default grey', () => {
      expect(getNodeColor({ color: '#9e9e9e', type: 'concept' })).toBe('#3b82f6');
    });

    it('falls back to type color when node color is absent', () => {
      expect(getNodeColor({ color: undefined as any, type: 'person' })).toBe('#f59e0b');
    });
  });

  // ── getNodeGlow ──
  describe('getNodeGlow', () => {
    it('returns CSS box-shadow string with glow', () => {
      const glow = getNodeGlow({ type: 'concept' });
      expect(glow).toContain('rgba(59,130,246,0.3)');
      expect(glow).toContain('0 0 12px');
      expect(glow).toContain('0 0 24px');
    });
  });

  // ── getAllNodeTypes ──
  describe('getAllNodeTypes', () => {
    it('returns an array of all types', () => {
      const all = getAllNodeTypes();
      expect(all.length).toBeGreaterThan(20);
      expect(all[0]).toHaveProperty('type');
      expect(all[0]).toHaveProperty('color');
      expect(all[0]).toHaveProperty('label');
    });

    it('includes known types', () => {
      const types = getAllNodeTypes().map((t) => t.type);
      expect(types).toContain('concept');
      expect(types).toContain('person');
      expect(types).toContain('unknown');
    });
  });

  // ── getTypeGroups ──
  describe('getTypeGroups', () => {
    it('returns all group configs', () => {
      const groups = getTypeGroups();
      expect(groups).toHaveProperty('knowledge');
      expect(groups).toHaveProperty('entity');
      expect(groups).toHaveProperty('tech');
      expect(groups.knowledge.order).toBe(1);
    });
  });

  // ── getActiveNodeTypes ──
  describe('getActiveNodeTypes', () => {
    it('returns typed counts sorted by count desc', () => {
      const nodes = [
        { type: 'concept' },
        { type: 'concept' },
        { type: 'concept' },
        { type: 'person' },
      ];
      const active = getActiveNodeTypes(nodes);
      expect(active[0].type).toBe('concept');
      expect(active[0].count).toBe(3);
      expect(active[1].type).toBe('person');
      expect(active[1].count).toBe(1);
    });

    it('normalises type casing and handles missing type', () => {
      const nodes = [
        { type: 'CONCEPT' },
        { type: undefined as any },
        { type: '' },
      ];
      const active = getActiveNodeTypes(nodes);
      const types = active.map((a) => a.type);
      expect(types).toContain('concept');
      expect(types).toContain('unknown');
    });

    it('returns empty array for empty input', () => {
      expect(getActiveNodeTypes([])).toEqual([]);
    });
  });
});
