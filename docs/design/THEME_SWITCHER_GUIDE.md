# 🎨 BruV Launcher - 主題切換系統 (Theme Switcher)

## 📋 功能概覽

BruV Enterprise Launcher 現已支援**深色/淺色模式即時切換**！

### ✨ 主要特性

- 🌙 **深色模式 (Dark Mode)** - Anytype Void Black 設計
- ☀️ **淺色模式 (Light Mode)** - Anytype Pure White 設計
- 🔄 **一鍵切換** - 標題列按鈕即時切換
- 🎨 **動態配色** - 所有 UI 元件自動更新
- 💾 **狀態保持** - 切換後立即生效

---

## 🎨 主題配色方案

### 深色主題 (Dark Theme) 🌙

```css
/* 背景層級 */
主背景:     #191919  ████  深空灰
側邊欄:     #111111  ████  極夜黑
控制台:     #0f0f0f  ████  純黑
卡片:       #262626  ████  深灰卡片

/* 文字 */
主文字:     #e5e5e5  ████  灰白
次文字:     #aaaaaa  ████  中灰
暗文字:     #888888  ████  暗灰
極淡:       #555555  ████  極暗

/* 邊框 */
細邊框:     #2a2a2a  ████
標準:       #333333  ████
強調:       #444444  ████

/* 強調色 */
藍色:       #335eea  ████  Anytype Blue
紅色:       #e03131  ████  Alert Red
終端綠:     #4ade80  ████  Console Green
```

### 淺色主題 (Light Theme) ☀️

```css
/* 背景層級 */
主背景:     #ffffff  ████  純白
側邊欄:     #f3f4f6  ████  淺灰
控制台:     #f9fafb  ████  極淺灰
卡片:       #ffffff  ████  白卡片

/* 文字 */
主文字:     #1f2937  ████  深灰
次文字:     #6b7280  ████  中灰
暗文字:     #9ca3af  ████  淺灰
極淡:       #d1d5db  ████  極淺

/* 邊框 */
細邊框:     #f3f4f6  ████
標準:       #e5e7eb  ████
強調:       #d1d5db  ████

/* 強調色 */
藍色:       #335eea  ████  Anytype Blue (保持)
紅色:       #e03131  ████  Alert Red (保持)
終端綠:     #059669  ████  Emerald Green
```

---

## 🔧 使用方式

### 切換主題

```
1. 找到標題列右側的主題按鈕
   - 深色模式: 顯示 🌙 圖示
   - 淺色模式: 顯示 ☀️ 圖示

2. 點擊按鈕
   - UI 立即更新顏色
   - 控制台顯示切換日誌

3. 查看效果
   - 所有按鈕、卡片、文字同步變色
   - 邊框、背景自動調整
```

### 鍵盤位置

```
┌────────────────────────────────────────────┐
│  BruV Launcher v3.0   [🌙] [─] [✕]       │
│                        ↑                   │
│                     主題按鈕               │
└────────────────────────────────────────────┘
```

---

## 🎯 視覺對比

### 深色模式 (預設)

```
┌─────────────────────────────────────┐
│ [🌙] ← 深色模式圖示                  │
├──────────┬──────────────────────────┤
│          │  📋 SYSTEM CONSOLE       │
│  BruV    │  ┌────────────────────┐  │
│  黑色背景 │  │ 黑底綠字           │  │
│          │  │ #4ade80 終端綠     │  │
│ [🚀啟動]  │  └────────────────────┘  │
│ 藍色按鈕  │                          │
│ #335eea  │                          │
└──────────┴──────────────────────────┘
```

### 淺色模式

```
┌─────────────────────────────────────┐
│ [☀️] ← 淺色模式圖示                  │
├──────────┬──────────────────────────┤
│          │  📋 SYSTEM CONSOLE       │
│  BruV    │  ┌────────────────────┐  │
│  淺灰背景 │  │ 白底綠字           │  │
│          │  │ #059669 祖母綠     │  │
│ [🚀啟動]  │  └────────────────────┘  │
│ 藍色按鈕  │                          │
│ #335eea  │                          │
└──────────┴──────────────────────────┘
```

---

## 🧩 技術架構

### 主題系統組件

```python
# 1. 主題色票字典
self.themes = {
    "dark": { ... },   # 深色主題配色
    "light": { ... }   # 淺色主題配色
}

# 2. 狀態標記
self.is_dark_mode = True  # 當前模式

# 3. 切換方法
def toggle_theme(self):
    self.is_dark_mode = not self.is_dark_mode
    self.theme_btn.setText("🌙" if self.is_dark_mode else "☀️")
    self.apply_styles()
    self.update_label_colors()

# 4. 動態樣式應用
def apply_styles(self):
    theme = self.themes["dark" if self.is_dark_mode else "light"]
    self.setStyleSheet(f"""
        #mainWidget {{
            background: {theme['bg_main']};
            border: 1px solid {theme['border_default']};
        }}
        ...
    """)
```

### 色票鍵值對照

| 鍵名 | 用途 | 深色值 | 淺色值 |
|------|------|--------|--------|
| `bg_main` | 主背景 | #191919 | #ffffff |
| `bg_sidebar` | 側邊欄 | #111111 | #f3f4f6 |
| `bg_console` | 控制台 | #0f0f0f | #f9fafb |
| `bg_card` | 卡片背景 | #262626 | #ffffff |
| `text_primary` | 主文字 | #e5e5e5 | #1f2937 |
| `text_muted` | 暗文字 | #888888 | #9ca3af |
| `border_default` | 標準邊框 | #333333 | #e5e7eb |
| `accent_blue` | 藍色按鈕 | #335eea | #335eea |
| `accent_red` | 紅色按鈕 | #e03131 | #e03131 |
| `console_text` | 控制台文字 | #4ade80 | #059669 |

---

## 📊 UI 元件更新範圍

### 自動更新的元件

```
✅ 主視窗背景 (#mainWidget)
✅ 標題列 (#titleBar)
✅ 側邊欄 (#sidebar)
✅ 主要按鈕 (#actionBtn)
✅ 連結按鈕 (#primaryLinkBtn, #linkBtn)
✅ 控制台 (#console, #consoleText)
✅ 下拉選單 (QComboBox)
✅ 清空按鈕 (#clearBtn)
✅ 所有文字標籤 (title, logo, labels)
```

### 手動更新的標籤

通過 `update_label_colors()` 方法更新：

```python
- 標題文字 (self.title_label)
- Logo 文字 (self.logo_label)
- 語言標籤 (self.lang_label)
- 快速連結標題 (self.quick_links_label)
- 狀態標題 (self.status_title_label)
- 版本號 (self.version_label)
- 控制台標題 (self.console_title_label)
```

---

## 🎨 設計原則

### Anytype Design Language

1. **一致性 (Consistency)**
   - 強調色（藍/紅）在兩種主題中保持一致
   - 確保可識別性

2. **對比度 (Contrast)**
   - 深色模式：暗背景 + 亮文字
   - 淺色模式：亮背景 + 暗文字
   - 符合 WCAG AA 標準

3. **層次感 (Hierarchy)**
   - 使用深淺差異區分層級
   - 深色：#111 (側邊) → #191 (主) → #262 (卡片)
   - 淺色：#f3f (側邊) → #fff (主) → #fff (卡片)

4. **無衝突 (Harmony)**
   - 移除彩色元素的干擾
   - 僅在動作按鈕使用強調色

---

## 🔍 使用場景

### 深色模式適用於

- 🌙 **夜間開發** - 減少眼睛疲勞
- 🎬 **低光環境** - 降低螢幕亮度
- 🎨 **專業感** - 沉浸式體驗
- 💻 **長時間工作** - OLED 螢幕省電

### 淺色模式適用於

- ☀️ **白天工作** - 明亮環境
- 📄 **閱讀日誌** - 更高可讀性
- 🖨️ **截圖分享** - 更清晰的視覺
- 👥 **演示展示** - 投影更清楚

---

## 📝 控制台日誌範例

### 切換到淺色模式

```
🎨 已切換至淺色模式
```

### 切換到深色模式

```
🎨 已切換至深色模式
```

---

## 🚀 快速測試

```powershell
# 啟動 GUI
cd "c:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\BruV_Project"
python launcher_gui.py

# 測試步驟
1. 觀察預設深色模式（黑色背景）
2. 點擊標題列的 🌙 按鈕
3. 視窗立即變為淺色（白色背景）
4. 按鈕圖示變為 ☀️
5. 再次點擊切換回深色
6. 檢查控制台的切換日誌
```

---

## 🎯 設計目標達成

```
✅ 支援深色/淺色兩種主題
✅ 一鍵即時切換
✅ 所有 UI 元件同步更新
✅ 使用動態 f-string QSS
✅ 色票集中管理
✅ 符合 Anytype 設計語言
✅ 保持強調色一致性
✅ 控制台文字顏色適配
✅ 邊框/背景自動調整
✅ 無需重啟即時生效
```

---

## 🔮 未來擴展

- [ ] 記憶使用者選擇（存儲偏好設定）
- [ ] 自動跟隨系統主題
- [ ] 添加第三種主題（高對比度）
- [ ] 自定義主題色票編輯器
- [ ] 主題預覽模式
- [ ] 平滑過渡動畫

---

**Anytype Theme Switcher** - 自由切換，隨心所欲 🎨
