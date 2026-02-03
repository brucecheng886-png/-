/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 開啟 Class 模式主題切換
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Anytype Space Architecture 配色
        primary: {
          DEFAULT: '#335eea',      // Anytype Blue
          dark: '#2549d8',
          light: '#5983f0',
        },
        accent: {
          orange: '#ff8e3c',       // Anytype Orange (數據顯示)
          green: '#00c2a8',        // 成功狀態
        },
        
        // 語意化顏色 (映射到 CSS 變數)
        main: 'var(--bg-main)',           // 主背景
        surface: 'var(--bg-surface)',     // 面板表面
        'border-color': 'var(--border-color)',  // 邊框
        'txt-main': 'var(--text-primary)',      // 主要文字
        'txt-sec': 'var(--text-secondary)',     // 次要文字
        
        // 保留向後兼容的 void 色系
        void: {
          black: '#000000',        // 純黑底
          primary: '#191919',      // 深空黑 (主背景)
          surface: '#111111',      // 面板表面
          elevated: '#1a1a1a',     // 懸浮元素
          hover: '#262626',        // Hover 狀態
        },
        text: {
          primary: '#e5e5e5',      // 主要文字 (灰白)
          secondary: '#888888',    // 次要文字 (暗灰)
          tertiary: '#4d4d4d',     // 輔助文字
          disabled: '#333333',     // 禁用文字
        },
        border: {
          primary: '#333333',      // 主要邊框
          subtle: '#222222',       // 更細微的分隔線
          focus: '#335eea',        // 焦點邊框
        },
        success: '#00c2a8',
        warning: '#ffc107',
        danger: '#ff5c5c',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang TC', 'Microsoft JhengHei', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: '13px',      // 標籤、次要提示
        sm: '15px',      // 列表內容、卡片描述
        base: '17px',    // 一般輸入框、按鈕文字
        lg: '20px',      // 小標題、面板標題
        xl: '28px',      // 頁面大標題 (如 BruV AI NEXUS)
        '2xl': '32px',   // 更大的標題
      },
      letterSpacing: {
        tighter: '-0.02em',        // Swiss Typography 負字距
        tight: '-0.01em',
      },
      boxShadow: {
        'void-sm': '0 2px 8px rgba(0, 0, 0, 0.5)',
        'void-md': '0 4px 20px rgba(0, 0, 0, 0.6)',
        'void-lg': '0 8px 40px rgba(0, 0, 0, 0.8)',
        'void-xl': '0 12px 60px rgba(0, 0, 0, 0.9)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
