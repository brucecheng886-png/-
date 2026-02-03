# 跨圖譜連接功能設計文檔

> **日期**: 2026-02-02  
> **版本**: v1.0  
> **功能**: 多圖譜管理與 AI Link 智能連接

## 🎯 功能概述

實現多個獨立圖譜之間的智能連接，支持：
1. **多圖譜管理** - 同時維護多個獨立的知識圖譜
2. **視覺區分** - 清晰標示不同圖譜的節點和邊界
3. **AI Link** - 使用 AI 自動發現並建立跨圖譜連接
4. **雙向同步** - 連接變更實時反映在所有視圖

## 📊 數據結構設計

### 圖譜元數據
```javascript
{
  id: 'graph-1',
  name: '技術圖譜',
  description: 'AI 與開發技術知識',
  color: '#448aff',      // 圖譜主色
  icon: '🧠',           // 圖譜圖標
  category: 'tech',     // 分類
  createdAt: '2026-02-02',
  updatedAt: '2026-02-02',
  nodeCount: 25,
  linkCount: 40
}
```

### 節點擴展屬性
```javascript
{
  id: 'node-1',
  name: 'GPT-4',
  // ... 原有屬性 ...
  graphId: 'graph-1',   // 所屬圖譜 ID
  graphName: '技術圖譜', // 所屬圖譜名稱
  graphColor: '#448aff' // 圖譜顏色（用於視覺標記）
}
```

### AI Link 連接
```javascript
{
  id: 'ai-link-1',
  source: 'node-1',           // 源節點 ID
  target: 'node-2',           // 目標節點 ID
  sourceGraphId: 'graph-1',   // 源圖譜
  targetGraphId: 'graph-2',   // 目標圖譜
  type: 'ai-link',            // 連接類型
  confidence: 0.85,           // AI 置信度 (0-1)
  reason: '語義相關',         // AI 推理原因
  label: 'AI 關聯',
  value: 3,
  style: {
    color: '#fbbf24',         // 金色標識 AI 連接
    width: 2,
    dashArray: [5, 5],        // 虛線樣式
    animated: true            // 流動動畫
  }
}
```

## 🎨 視覺設計

### 圖譜邊界標記
```
┌─────────────────────────────┐
│ 🧠 技術圖譜                  │
│ ┌─────┐    ┌─────┐          │
│ │GPT-4│────│Claude│          │
│ └─────┘    └─────┘          │
│      │                       │
│      │ AI Link (虛線金色)    │
│      ╎                       │
└──────╎───────────────────────┘
       ╎
┌──────╎───────────────────────┐
│      │                       │
│ 📚 知識圖譜                  │
│ ┌─────┐    ┌─────┐          │
│ │學習 │────│閱讀 │           │
│ └─────┘    └─────┘          │
└─────────────────────────────┘
```

### 視覺元素
1. **圖譜容器** - 半透明邊框 + 標題欄
2. **節點標記** - 左上角顯示圖譜圖標徽章
3. **AI Link** - 金色虛線 + 粒子流動動畫
4. **懸停提示** - 顯示連接信息和置信度

## 🤖 AI Link 算法

### 相似度計算
```javascript
function calculateSimilarity(node1, node2) {
  // 1. 名稱相似度（編輯距離）
  const nameSim = levenshteinSimilarity(node1.name, node2.name);
  
  // 2. 語義相似度（詞向量）
  const semanticSim = cosineSimilarity(
    getEmbedding(node1.description),
    getEmbedding(node2.description)
  );
  
  // 3. 類型匹配度
  const typeSim = node1.type === node2.type ? 1 : 0.5;
  
  // 加權平均
  return nameSim * 0.3 + semanticSim * 0.5 + typeSim * 0.2;
}
```

### 推薦規則
- **高置信度** (>0.8): 自動建議連接
- **中置信度** (0.5-0.8): 需要用戶確認
- **低置信度** (<0.5): 不推薦

## 📋 測試數據

### 圖譜 1: 技術圖譜 (藍色 #448aff)
- GPT-4, Claude 3.5, LangChain, RAG 架構, Vector DB
- Python, FastAPI, Vue 3, Docker

### 圖譜 2: 學習圖譜 (綠色 #4caf50)
- AI 學習筆記, 編程教程, 系統設計, 算法練習
- 閱讀清單, 學習計劃

### AI Link 測試連接
```javascript
[
  // 高置信度連接
  {
    source: 'GPT-4',
    target: 'AI 學習筆記',
    confidence: 0.92,
    reason: '主題直接相關：GPT-4 是 AI 學習的核心內容'
  },
  {
    source: 'Python',
    target: '編程教程',
    confidence: 0.88,
    reason: 'Python 是編程教程的主要語言'
  },
  
  // 中置信度連接
  {
    source: 'FastAPI',
    target: '系統設計',
    confidence: 0.65,
    reason: 'FastAPI 涉及系統設計原則'
  }
]
```

## 🔧 實現步驟

### Phase 1: 數據結構（完成）
- [x] 創建測試數據
- [x] 擴展節點屬性
- [x] 定義 AI Link 格式

### Phase 2: Store 擴展（下一步）
- [ ] 添加多圖譜狀態管理
- [ ] 實現 AI Link 邏輯
- [ ] 提供跨圖譜查詢 API

### Phase 3: 視覺渲染（下一步）
- [ ] 圖譜邊界容器
- [ ] AI Link 虛線樣式
- [ ] 流動動畫效果
- [ ] 圖譜圖標徽章

### Phase 4: AI 推薦（後續）
- [ ] 相似度計算
- [ ] 推薦引擎
- [ ] 用戶反饋學習

## 🎬 使用流程

1. **加載圖譜**
```javascript
graphStore.loadMultipleGraphs(['graph-1', 'graph-2'])
```

2. **運行 AI Link**
```javascript
const suggestions = await graphStore.generateAILinks()
// 返回推薦連接列表
```

3. **確認連接**
```javascript
graphStore.confirmAILink(linkId)
// 用戶確認後建立連接
```

4. **視覺化**
```javascript
// 自動渲染兩個圖譜 + AI Link
```

## 📊 性能考量

- **節點數**: 支持每個圖譜 500+ 節點
- **連接數**: 最多 1000 個 AI Link
- **計算**: Web Worker 後台計算
- **渲染**: 虛擬化渲染（僅顯示可見區域）

---

> **下一步**: 創建測試數據文件並實現 Store 擴展
