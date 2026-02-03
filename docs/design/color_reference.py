"""
BruV Enterprise Launcher v2.0 - 配色參考
Deep Navy Theme 色板
"""

# 🎨 主要配色方案

COLORS = {
    # ===== 背景色系 =====
    "bg_primary": "#0f172a",      # 深邃海軍藍 (主視窗左上)
    "bg_secondary": "#1e293b",    # 次要深藍 (主視窗右下)
    "bg_sidebar": "rgba(15, 23, 42, 0.95)",  # 側邊欄半透明
    "bg_console": "#020617",      # Console 深黑藍
    "bg_header": "rgba(15, 23, 42, 0.95)",   # 標題列/Console 標題
    
    # ===== 強調色系 (靛藍/紫色) =====
    "accent_primary": "#6366f1",   # 靛藍 (邊框、Logo、主要強調)
    "accent_secondary": "#8b5cf6", # 紫色 (漸層結束)
    "accent_light": "#818cf8",     # 淺靛藍 (標籤文字)
    "accent_lighter": "#a5b4fc",   # 更淺靛藍 (次要連結)
    
    # ===== 警告色系 (紅色) =====
    "warning_start": "#ef4444",    # 紅色 (Stop 按鈕開始)
    "warning_end": "#b91c1c",      # 深紅 (Stop 按鈕結束)
    "warning_light": "#f87171",    # 淺紅 (Hover)
    
    # ===== 文字色系 =====
    "text_primary": "#e2e8f0",     # 主要文字 (淺灰)
    "text_secondary": "#64748b",   # 次要文字 (中灰)
    "text_console": "#22d3ee",     # Console 文字 (螢光青)
    "text_disabled": "#334155",    # 禁用文字 (深灰)
    
    # ===== 狀態燈色系 =====
    "status_running": "#00ff00",   # 運行中 (綠色)
    "status_stopped": "#666666",   # 停止 (灰色)
    "status_error": "#ff0000",     # 錯誤 (紅色)
    "status_starting": "#ffaa00",  # 啟動中 (橙色)
}

# 🖼️ 視覺元素映射

VISUAL_MAP = {
    "主視窗邊框": COLORS["accent_primary"],      # #6366f1
    "主視窗背景": f"漸層 {COLORS['bg_primary']} → {COLORS['bg_secondary']}",
    "側邊欄背景": COLORS["bg_sidebar"],
    "Logo 文字": COLORS["accent_primary"],        # #6366f1
    "標題文字": COLORS["accent_light"],          # #818cf8
    
    "START 按鈕": f"漸層 {COLORS['accent_primary']} → {COLORS['accent_secondary']}",
    "STOP 按鈕": f"漸層 {COLORS['warning_start']} → {COLORS['warning_end']}",
    "BruV AI 按鈕": f"背景 rgba(99, 102, 241, 0.15), 邊框 {COLORS['accent_primary']}",
    "其他連結按鈕": f"背景 rgba(129, 140, 248, 0.1), 邊框 {COLORS['accent_light']}",
    
    "Console 背景": COLORS["bg_console"],         # #020617
    "Console 文字": COLORS["text_console"],       # #22d3ee
    "狀態燈 - 運行": COLORS["status_running"],
    "狀態燈 - 停止": COLORS["status_stopped"],
}

# 📐 尺寸規格

SIZES = {
    "視窗": "900x600",
    "標題列高度": "40px",
    "START 按鈕": "高度 60px",
    "STOP 按鈕": "高度 50px",
    "BruV AI 按鈕": "高度 45px",
    "其他連結按鈕": "高度 40px",
    "側邊欄寬度": "30%",
    "Console 寬度": "70%",
}

# 🎭 對比參考

COMPARISON = {
    "v1.0 Cyberpunk": {
        "主色": "#ff79c6 (粉紫)",
        "次要色": "#8be9fd (青色)",
        "背景": "#1e1e2d → #282a36",
        "Console": "#00ff00 (綠色)",
    },
    "v2.0 Deep Navy": {
        "主色": "#6366f1 (靛藍)",
        "次要色": "#818cf8 (淺靛藍)",
        "背景": "#0f172a → #1e293b",
        "Console": "#22d3ee (螢光青)",
    }
}

if __name__ == "__main__":
    print("=" * 60)
    print("🎨 BruV Enterprise Launcher v2.0 配色參考")
    print("=" * 60)
    print("\n【主要配色】")
    for name, color in COLORS.items():
        print(f"  {name:20s}: {color}")
    
    print("\n【視覺元素】")
    for element, color in VISUAL_MAP.items():
        print(f"  {element:15s}: {color}")
    
    print("\n【尺寸規格】")
    for element, size in SIZES.items():
        print(f"  {element:15s}: {size}")
    
    print("\n【版本對比】")
    for version, colors in COMPARISON.items():
        print(f"\n  {version}:")
        for key, value in colors.items():
            print(f"    {key:10s}: {value}")
    
    print("\n" + "=" * 60)
