const NODE_TYPE_COLORS = {
  // ── 知識類型 ──
  "concept": { color: "#3b82f6", glow: "rgba(59,130,246,0.3)", label: "概念", emoji: "💡", group: "knowledge" },
  "theory": { color: "#6366f1", glow: "rgba(99,102,241,0.3)", label: "理論", emoji: "📐", group: "knowledge" },
  "definition": { color: "#8b5cf6", glow: "rgba(139,92,246,0.3)", label: "定義", emoji: "📖", group: "knowledge" },
  "principle": { color: "#a78bfa", glow: "rgba(167,139,250,0.3)", label: "原則", emoji: "⚖️", group: "knowledge" },
  // ── 實體類型 ──
  "person": { color: "#f59e0b", glow: "rgba(245,158,11,0.3)", label: "人物", emoji: "👤", group: "entity" },
  "organization": { color: "#f97316", glow: "rgba(249,115,22,0.3)", label: "組織", emoji: "🏢", group: "entity" },
  "location": { color: "#ef4444", glow: "rgba(239,68,68,0.3)", label: "地點", emoji: "📍", group: "entity" },
  "event": { color: "#ec4899", glow: "rgba(236,72,153,0.3)", label: "事件", emoji: "📅", group: "entity" },
  "product": { color: "#d946ef", glow: "rgba(217,70,239,0.3)", label: "產品", emoji: "📦", group: "entity" },
  // ── 技術類型 ──
  "technology": { color: "#06b6d4", glow: "rgba(6,182,212,0.3)", label: "技術", emoji: "⚡", group: "tech" },
  "framework": { color: "#0ea5e9", glow: "rgba(14,165,233,0.3)", label: "框架", emoji: "🏗️", group: "tech" },
  "language": { color: "#0284c7", glow: "rgba(2,132,199,0.3)", label: "語言", emoji: "💻", group: "tech" },
  "tool": { color: "#14b8a6", glow: "rgba(20,184,166,0.3)", label: "工具", emoji: "🔧", group: "tech" },
  "api": { color: "#2dd4bf", glow: "rgba(45,212,191,0.3)", label: "API", emoji: "🔌", group: "tech" },
  // ── 資源類型 ──
  "document": { color: "#10b981", glow: "rgba(16,185,129,0.3)", label: "文件", emoji: "📄", group: "resource" },
  "file": { color: "#22c55e", glow: "rgba(34,197,94,0.3)", label: "檔案", emoji: "📁", group: "resource" },
  "image": { color: "#84cc16", glow: "rgba(132,204,22,0.3)", label: "圖片", emoji: "🖼️", group: "resource" },
  "video": { color: "#a3e635", glow: "rgba(163,230,53,0.3)", label: "影片", emoji: "🎬", group: "resource" },
  "link": { color: "#34d399", glow: "rgba(52,211,153,0.3)", label: "連結", emoji: "🔗", group: "resource" },
  // ── 專案類型 ──
  "project": { color: "#fbbf24", glow: "rgba(251,191,36,0.3)", label: "專案", emoji: "🚀", group: "project" },
  "milestone": { color: "#f59e0b", glow: "rgba(245,158,11,0.3)", label: "里程碑", emoji: "🏁", group: "project" },
  "task": { color: "#fb923c", glow: "rgba(251,146,60,0.3)", label: "任務", emoji: "✅", group: "project" },
  "bug": { color: "#ef4444", glow: "rgba(239,68,68,0.3)", label: "Bug", emoji: "🐛", group: "project" },
  // ── 備用/未知 ──
  "note": { color: "#94a3b8", glow: "rgba(148,163,184,0.3)", label: "筆記", emoji: "📝", group: "other" },
  "tag": { color: "#cbd5e1", glow: "rgba(203,213,225,0.3)", label: "標籤", emoji: "🏷️", group: "other" },
  "unknown": { color: "#64748b", glow: "rgba(100,116,139,0.3)", label: "未知", emoji: "❓", group: "other" }
};
const TYPE_GROUPS = {
  knowledge: { label: "知識", icon: "🧠", order: 1 },
  entity: { label: "實體", icon: "🏢", order: 2 },
  tech: { label: "技術", icon: "⚡", order: 3 },
  resource: { label: "資源", icon: "📁", order: 4 },
  project: { label: "專案", icon: "🚀", order: 5 },
  other: { label: "其他", icon: "📌", order: 6 }
};
function getNodeTypeColor(type) {
  if (!type) return NODE_TYPE_COLORS.unknown;
  const key = type.toLowerCase().trim();
  return NODE_TYPE_COLORS[key] || NODE_TYPE_COLORS.unknown;
}
function getTypeGroups() {
  return TYPE_GROUPS;
}
function getActiveNodeTypes(nodes) {
  const typeCount = {};
  nodes.forEach((n) => {
    const t = (n.type || "unknown").toLowerCase().trim();
    typeCount[t] = (typeCount[t] || 0) + 1;
  });
  return Object.entries(typeCount).map(([type, count]) => {
    const config = getNodeTypeColor(type);
    return { type, ...config, count };
  }).sort((a, b) => b.count - a.count);
}
export {
  getTypeGroups as a,
  getNodeTypeColor as b,
  getActiveNodeTypes as g
};
