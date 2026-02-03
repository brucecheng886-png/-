# 🔗 AI 建議連線功能使用指南

## 📋 功能概述

在橫向節點檢查器面板中，新增了 AI 建議連線區塊，允許用戶查看、選擇和保存 AI 推薦的節點關係。

## ✨ 主要功能

### 1. **AI 建議連線顯示**
- 位置：橫向面板的中間區域（標題與描述之間）
- 顯示內容：
  - 目標節點名稱
  - 關係類型（因果關係/互補關係/衝突關係）
  - 推薦理由
- 僅當節點包含 `links` 陣列時顯示

### 2. **互動式勾選框**
- 每個建議連線左側都有勾選框
- 預設全部勾選
- 用戶可以取消勾選不需要的連線
- 只有勾選的連線會在保存時寫入資料庫

### 3. **視覺化提示（呼吸燈效果）**
- **觸發方式**：滑鼠懸停在建議連線上
- **效果**：
  - 建議連線卡片顯示紫色邊框高亮
  - 3D 畫布中對應的目標節點呈現「呼吸燈」動畫
  - 鏡頭自動追蹤到目標節點
- **取消**：滑鼠移開時自動恢復

## 🎨 UI 設計

### 建議連線卡片
```vue
<div class="建議連線卡片">
  <checkbox> 勾選框
  <div class="連線資訊">
    <span class="目標節點名稱">節點名稱</span>
    <badge class="關係類型">因果關係</badge>
    <p class="推薦理由">AI 分析的推薦理由...</p>
  </div>
</div>
```

### 顏色配置
- **勾選狀態**：紫色背景 (`bg-purple-50/dark:bg-purple-500/10`)
- **未勾選**：灰色背景 (`bg-gray-50/dark:bg-white/5`)
- **懸停高亮**：紫色邊框 (`ring-2 ring-purple-500`)
- **關係標籤**：紫色徽章

## 🔧 技術實現

### 前端組件
**GraphPage.vue**
- `suggestedLinks`: 存儲建議連線列表
- `selectedSuggestedLinks`: Set 類型，存儲已勾選的連線 ID
- `hoveredLinkTarget`: 當前懸停的目標節點 ID
- `toggleSuggestedLink()`: 切換勾選狀態
- `handleLinkHover()`: 處理滑鼠懸停
- `handleLinkLeave()`: 處理滑鼠離開
- `getTargetNodeName()`: 獲取目標節點名稱

### 3D 圖表組件
**Graph3D.vue**
- `highlightedNodeId`: 當前高亮的節點 ID
- `breathingInterval`: 呼吸燈動畫定時器
- `highlightNode(nodeId)`: 開啟呼吸燈效果
- `unhighlightNode()`: 取消呼吸燈效果

### 呼吸燈動畫實現
```javascript
// 週期性改變節點大小（1.0 → 1.5 → 1.0）
breathingInterval = setInterval(() => {
  if (growing) {
    scale += 0.05;
    if (scale >= 1.5) growing = false;
  } else {
    scale -= 0.05;
    if (scale <= 1.0) growing = true;
  }
  
  // 直接操作 Three.js 節點對象
  nodeObject.scale.set(scale, scale, scale);
}, 50); // 每 50ms 更新一次
```

## 📊 數據流程

### 1. 節點載入流程
```
用戶點擊節點
  → GraphPage.handleNodeClick()
  → 提取 node.links 陣列
  → 設置 suggestedLinks
  → 預設全部勾選到 selectedSuggestedLinks
  → 渲染建議連線區塊
```

### 2. 保存流程
```
用戶點擊 SAVE 按鈕
  → saveChanges()
  → 過濾 selectedSuggestedLinks
  → 對每個勾選的連線調用 graphStore.addLink()
  → 更新 3D 圖譜顯示
  → 顯示成功提示
```

### 3. 呼吸燈流程
```
滑鼠懸停在建議連線上
  → handleLinkHover(targetId)
  → graphComponentRef.highlightNode(targetId)
  → 啟動呼吸燈動畫（scale: 1.0 ↔ 1.5）
  → 鏡頭追蹤目標節點

滑鼠離開
  → handleLinkLeave()
  → graphComponentRef.unhighlightNode()
  → 停止動畫
  → 恢復節點原始大小
```

## 🚀 使用步驟

### 用戶操作流程
1. **上傳 Excel/CSV 檔案**
   - 點擊 NexusPage 的「導入圖譜」按鈕
   - 選擇包含數據的 Excel 或 CSV 檔案
   - 後端 LLM 自動分析並生成建議連線

2. **查看建議連線**
   - 在圖譜中點擊已導入的節點
   - 橫向面板自動展開
   - 中間區域顯示 AI 建議連線列表

3. **預覽目標節點**
   - 滑鼠懸停在任意建議連線上
   - 3D 畫布中目標節點開始呼吸燈動畫
   - 鏡頭自動聚焦到該節點
   - 移開滑鼠即可取消

4. **選擇性保存**
   - 取消勾選不需要的連線
   - 保持需要的連線為勾選狀態
   - 點擊「SAVE」按鈕
   - 只有勾選的連線會被添加到圖譜

5. **確認結果**
   - 查看 3D 畫布中新增的連線
   - 系統顯示保存成功提示（含數量統計）

## 📝 節點數據結構

### 含有 AI 建議連線的節點
```json
{
  "id": "node_1234567890_0",
  "name": "節點名稱",
  "label": "AI 生成的標題",
  "description": "深度描述...",
  "type": "技術",
  "group": 1,
  "size": 20,
  "links": [
    {
      "target_id": "existing_node_id",
      "relation": "因果關係",
      "reason": "這個節點是另一個節點的前提條件，因為..."
    },
    {
      "target_id": "another_node_id",
      "relation": "互補關係",
      "reason": "兩者可以相輔相成，共同實現..."
    }
  ]
}
```

## ⚠️ 注意事項

1. **連線去重**
   - 系統會自動檢查是否已存在相同的連線
   - 避免重複添加連線

2. **目標節點必須存在**
   - `target_id` 必須指向圖譜中已存在的節點
   - 如果目標節點不存在，該連線會被跳過

3. **性能考量**
   - 呼吸燈動畫使用定時器
   - 切換節點時會自動清理上一個動畫
   - 組件卸載時會清理所有定時器

4. **跨瀏覽器兼容性**
   - 呼吸燈效果依賴 Three.js
   - 建議使用現代瀏覽器（Chrome、Edge、Firefox）

## 🔜 未來改進

- [ ] 支援連線的優先級排序
- [ ] 添加連線信心分數顯示
- [ ] 支援批量選擇/取消選擇
- [ ] 實現連線的拖放編輯
- [ ] 添加連線預覽模式（不保存直接顯示）
- [ ] 支援自定義關係類型

## 📚 相關文檔

- [Excel 導入指南](GRAPH_IMPORT_GUIDE.md)
- [LLM Prompt 配置](../backend/api/graph_import.py)
- [圖譜 Store 文檔](../../frontend/src/stores/graphStore.js)
