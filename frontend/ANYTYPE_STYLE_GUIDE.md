# Anytype Space Architecture - 前端風格指南

## 🎨 設計哲學

**核心美學**：Void Black (深空黑) + Matte Finish (啞光) + Minimal Borders (極細邊框) + Swiss Typography (瑞士排版)

從 **Cyberpunk Neon** (霓虹發光) 轉向 **Anytype Space** (深空極簡) 風格。

---

## 📋 全域 CSS 變數

### 配色系統

```css
/* Anytype 主題色彩 */
--primary-blue: #335eea;          /* Anytype Blue - 主要強調色 */
--accent-orange: #ff8e3c;         /* Anytype Orange - 數據/圖表 */
--success-green: #00c2a8;         /* 成功狀態 */
--warning-yellow: #ffc107;        /* 警告 */
--danger-red: #ff5c5c;            /* 錯誤 */

/* Void Black 背景系統 */
--bg-void: #000000;               /* 純黑底 (最深層) */
--bg-primary: #191919;            /* 主背景 (深空黑) */
--bg-surface: #111111;            /* 面板表面 (極夜黑) */
--bg-elevated: #1a1a1a;           /* 懸浮元素 */
--bg-hover: #262626;              /* Hover 狀態 */

/* Swiss Typography 文字色 */
--text-primary: #e5e5e5;          /* 主要文字 (灰白) */
--text-secondary: #888888;        /* 次要文字 (暗灰) */
--text-tertiary: #4d4d4d;         /* 輔助文字 (深灰) */
--text-disabled: #333333;         /* 禁用文字 */

/* Minimal Borders */
--border-primary: #333333;        /* 主要邊框 (極細) */
--border-subtle: #222222;         /* 更細微的分隔線 */
--border-focus: #335eea;          /* 焦點邊框 */
```

---

## 🧱 組件樣式規範

### 1. 面板 (Panels)

**去除特效**：
- ❌ 移除 `backdrop-filter: blur()`
- ❌ 移除 `.scan-line` 動畫
- ❌ 移除 `.neon-glow` 發光效果
- ❌ 移除漸層背景

**新樣式**：
```css
.panel-matte {
  background: var(--bg-surface);        /* 純色 #111111 */
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);      /* 16-24px */
  box-shadow: var(--shadow-lg);         /* 深黑陰影，創造懸浮感 */
}
```

**懸浮面板** (Hover 時更明顯)：
```css
.panel-elevated:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 80px rgba(0, 0, 0, 0.95);
}
```

---

### 2. 導航欄 (Sidebar)

**背景**：
```css
background: #0f0f0f;  /* 比主背景稍暗 */
```

**選中項目樣式**：
```css
/* ❌ 舊: 發光效果 */
box-shadow: 0 0 20px rgba(0, 255, 0, 0.8);

/* ✅ 新: 左側亮條 + 背景微亮 */
.nav-item.active {
  background: var(--bg-hover);  /* #262626 */
  border-left: 3px solid var(--primary-blue);
  padding-left: 21px;  /* 3px border 的補償 */
}
```

---

### 3. 按鈕系統

**極簡按鈕** (次要操作)：
```css
.btn-minimal {
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
}

.btn-minimal:hover {
  background: var(--bg-hover);
  border-color: var(--text-secondary);
}
```

**主要按鈕** (Anytype Blue)：
```css
.btn-primary {
  background: var(--primary-blue);  /* #335eea */
  color: #ffffff;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(51, 94, 234, 0.3);
}

.btn-primary:hover {
  background: #2549d8;
  box-shadow: 0 6px 20px rgba(51, 94, 234, 0.4);
  transform: translateY(-1px);
}
```

---

### 4. 字體與排版

**標題** (Swiss Typography)：
```css
h1, h2, h3 {
  font-weight: 600;              /* SemiBold */
  line-height: 1.2;              /* 緊湊行高 */
  letter-spacing: -0.02em;       /* 負字距 (瑞士風格) */
  color: var(--text-primary);    /* #e5e5e5 */
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;              /* Bold */
}
```

**數據顯示** (Monospace + Anytype Orange)：
```css
.number-display {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 2rem;
  font-weight: 600;
  color: var(--accent-orange);   /* #ff8e3c */
  letter-spacing: -0.02em;
}
```

---

## 🛠️ 工具類別 (Utility Classes)

### Tailwind 自定義類別

```html
<!-- 背景 -->
<div class="bg-void-surface">...</div>
<div class="bg-void-primary">...</div>

<!-- 邊框 -->
<div class="border border-primary">...</div>

<!-- 文字 -->
<p class="text-primary">主要文字</p>
<p class="text-secondary">次要文字</p>

<!-- 陰影 -->
<div class="shadow-void-lg">...</div>
<div class="shadow-void-xl">...</div>

<!-- 字距 -->
<h1 class="tracking-tighter">Swiss Title</h1>
```

### 原生 CSS 類別

```html
<!-- Matte Panel -->
<div class="panel-matte">面板內容</div>

<!-- Elevated Panel (懸浮) -->
<div class="panel-elevated">懸浮面板</div>

<!-- Swiss Grid -->
<div class="grid-swiss">
  <div>Grid Item 1</div>
  <div>Grid Item 2</div>
</div>

<!-- Accent Number -->
<span class="text-accent">1,234,567</span>

<!-- Status Indicator -->
<span class="status-dot online"></span> Online
```

---

## 🎯 實際應用範例

### Dashboard Panel

```vue
<template>
  <div class="panel-matte p-6">
    <h2 class="text-2xl font-semibold tracking-tighter mb-4">
      System Metrics
    </h2>
    
    <div class="grid-swiss">
      <div class="metric-card">
        <div class="text-secondary text-sm mb-2">CPU Usage</div>
        <div class="number-display">45%</div>
      </div>
      
      <div class="metric-card">
        <div class="text-secondary text-sm mb-2">Memory</div>
        <div class="number-display">3.2 GB</div>
      </div>
    </div>
    
    <div class="mt-6 flex gap-3">
      <button class="btn-primary">Export Report</button>
      <button class="btn-minimal">View Details</button>
    </div>
  </div>
</template>

<style scoped>
.metric-card {
  background: var(--bg-elevated);
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}
</style>
```

---

## 📊 顏色對照表

| 元素 | Cyberpunk Neon (舊) | Anytype Space (新) |
|------|---------------------|-------------------|
| **主背景** | 漸層 `#1a1a2e → #0f3460` | 純色 `#191919` |
| **面板** | 半透明 `rgba(255,255,255,0.05)` + 模糊 | 純色 `#111111` |
| **邊框** | 發光 `rgba(0,255,0,0.3)` | 極細 `#333333` |
| **主要色** | 藍色 `#3b82f6` + 紫色 `#8b5cf6` | Anytype Blue `#335eea` |
| **強調色** | 霓虹綠 `#00ff00` | Anytype Orange `#ff8e3c` |
| **文字** | 純白 `#ffffff` | 灰白 `#e5e5e5` |
| **陰影** | 淺色擴散 `rgba(0,0,0,0.2)` | 深色濃厚 `rgba(0,0,0,0.8)` |

---

## ✅ 檢查清單

遷移現有組件時，請確認：

- [ ] 移除 `backdrop-filter: blur()`
- [ ] 移除 `.scan-line` / `.neon-glow` 等動畫
- [ ] 將半透明背景改為純色 `var(--bg-surface)`
- [ ] 更新邊框顏色為 `var(--border-primary)`
- [ ] 更新文字顏色為 `var(--text-primary)` 或 `var(--text-secondary)`
- [ ] 將數字/數據改用 `var(--accent-orange)` 或 monospace 字體
- [ ] 標題使用負字距 `letter-spacing: -0.02em`
- [ ] 按鈕使用 `.btn-primary` 或 `.btn-minimal`
- [ ] 陰影使用 `var(--shadow-lg)` 或 `var(--shadow-xl)`

---

## 🚀 下一步

1. **更新全域組件**：
   - `App.vue` - 主容器背景
   - `WarRoom.vue` - 戰情室佈局
   - Sidebar / Navigation 組件

2. **重構 Panels**：
   - `DashboardPanel.vue`
   - `TerminalPanel.vue`
   - `GraphPanel.vue`

3. **測試響應式**：確保在不同螢幕尺寸下，極簡風格依然清晰易讀。

---

**設計原則**：Less is More. 讓內容說話，而非裝飾。
