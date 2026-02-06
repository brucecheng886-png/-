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
        // Nexus 霓虹藍風格配色
        nexus: {
          bg: '#0a0e27',           // 深藍黑背景
          surface: '#1a1d3a',      // 卡片表面
          elevated: '#252847',     // 懸浮元素
          border: '#2d3154',       // 邊框
          glow: '#3b82f6',         // 電藍光暈
        },
        neon: {
          blue: '#3b82f6',         // 主要霓虹藍
          purple: '#8b5cf6',       // 紫色
          cyan: '#06b6d4',         // 青色
          pink: '#ec4899',         // 粉紅
          indigo: '#6366f1',       // 靛藍
        },
        primary: {
          DEFAULT: '#3b82f6',      // 電藍
          dark: '#2563eb',
          light: '#60a5fa',
        },
        accent: {
          orange: '#ff8e3c',       
          green: '#10b981',        
        },
        
        // 語意化顏色
        main: 'var(--bg-main)',
        surface: 'var(--bg-surface)',
        'border-color': 'var(--border-color)',
        'txt-main': 'var(--text-primary)',
        'txt-sec': 'var(--text-secondary)',
        
        // 深色主題色系
        void: {
          black: '#000000',
          primary: '#0a0e27',      // Nexus 背景
          surface: '#1a1d3a',
          elevated: '#252847',
          hover: '#2d3154',
        },
        text: {
          primary: '#e5e5e5',
          secondary: '#9ca3af',
          tertiary: '#6b7280',
          disabled: '#4b5563',
        },
        border: {
          primary: '#2d3154',
          subtle: '#1f2337',
          focus: '#3b82f6',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
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
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
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
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
