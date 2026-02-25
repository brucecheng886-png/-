/**
 * BruV Project — 共用型別定義
 *
 * 所有前端模組共用的 Interface / Type，集中在此管理。
 * @module types
 */

// ────────────── Graph 核心型別 ──────────────

/** 圖譜節點 */
export interface GraphNode {
  id: string;
  name: string;
  label: string;
  type: string;
  group: number | string;
  color: string;
  size: number;
  description?: string;
  emoji?: string;
  tags?: string[];
  graphId?: string;
  properties?: Record<string, unknown>;
  fileType?: string;
  aiStatus?: string;
  timestamp?: number;
  [key: string]: unknown;
}

/** 圖譜連線 */
export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value?: number;
  label?: string;
  confidence?: number;
  type?: string;
  [key: string]: unknown;
}

/** 圖譜元資料 */
export interface GraphMetadata {
  id: string | number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  nodeCount?: number;
  linkCount?: number;
  lastUpdate?: string;
  cover_image?: string;
  ragflow_dataset_id?: string;
}

/** 圖譜資料載入結果 */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  metadata?: GraphMetadata;
}

// ────────────── 批量操作 ──────────────

/** 批量新增結果 */
export interface BatchResult {
  success: number;
  skipped: number;
  failed: number;
  lastNodeId: string | null;
}

// ────────────── 匯入 ──────────────

/** 匯入狀態 */
export type ImportStatus = 'idle' | 'running' | 'done' | 'error';

/** 匯入詳細資訊 */
export interface ImportDetail {
  total: number;
  completed: number;
  failed: number;
  filename: string;
  eta_seconds: number | null;
  rows_per_sec: number;
  batch_size: number;
  total_batches: number;
  completed_batches: number;
  fast_mode: boolean;
  elapsed_seconds: number | null;
}

/** 已匯入檔案記錄 */
export interface ImportedFileRecord {
  id: number;
  nodeId: string | null;
  name: string;
  ext: string;
  status: string;
  timestamp: number;
}

// ────────────── 節點色彩 ──────────────

/** 節點類型色彩配置 */
export interface NodeTypeConfig {
  color: string;
  glow: string;
  label: string;
  emoji: string;
  group: string;
}

/** 類型分組配置 */
export interface TypeGroupConfig {
  label: string;
  icon: string;
  order: number;
}

/** 活躍節點類型（含統計） */
export interface ActiveNodeType extends NodeTypeConfig {
  type: string;
  count: number;
}

// ────────────── API 回應 ──────────────

/** 統一 API 回應格式 (v5.4) */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ────────────── Layout ──────────────

/** 右側面板模式 */
export type PanelMode = 'dashboard' | 'pdf' | 'graph' | 'terminal';

/** 面板資料 */
export interface PanelData {
  url?: string;
  filename?: string;
  graphId?: string;
  type?: '2d' | '3d';
  command?: string;
  cwd?: string;
}

/** 面板歷史項目 */
export interface PanelHistoryEntry {
  mode: PanelMode;
  data: PanelData | null;
}

// ────────────── 視圖模式 ──────────────

export type ViewMode = '2d' | '3d';
export type FilterMode = 'all' | 'focus' | 'part';
export type TagFilterMode = 'any' | 'all';

// ────────────── 跨圖譜 ──────────────

/** AI 連線 */
export interface AILink extends GraphLink {
  confidence: number;
}

/** 跨圖譜統計 */
export interface CrossGraphStats {
  totalGraphs: number;
  activeGraphs: number;
  totalNodes: number;
  totalLinks: number;
  totalAILinks: number;
  isCrossGraphMode: boolean;
}

/** AI 連線統計 */
export interface AILinkStats {
  total: number;
  byConfidence: {
    high: number;
    medium: number;
    low: number;
  };
  avgConfidence: number;
}

/** 工作檯快照 */
export interface WorkspaceSnapshot {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  nodeCount: number;
  linkCount: number;
  nodes: GraphNode[];
  links: GraphLink[];
  timestamp: string;
}
