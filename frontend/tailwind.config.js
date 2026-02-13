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
        // Enterprise Navy + Charcoal 配色系統
        nexus: {
          bg: '#0b1222',           // 深海軍藍主背景
          surface: '#111a2e',      // 炭灰藍表面
          elevated: '#182136',     // 懸浮元素
          border: 'rgba(148, 163, 184, 0.12)', // 細膩邊框
          glow: '#3b82f6',         // 聚焦光暈
        },
        navy: {
          50: '#eef2ff',
          100: '#dbe4ff',
          200: '#bfccfe',
          300: '#93a5fd',
          400: '#6070fa',
          500: '#3b82f6',         // 主要企業藍
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a5f',
          900: '#0b1222',         // 最深
        },
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
        accent: {
          orange: '#f59e0b',
          green: '#22c55e',
          teal: '#14b8a6',
        },

        // 語意化顏色 (CSS variable bridge)
        main: 'var(--bg-main)',
        surface: 'var(--bg-surface)',
        'border-color': 'var(--border-color)',
        'txt-main': 'var(--text-primary)',
        'txt-sec': 'var(--text-secondary)',

        // 深色主題色系
        void: {
          black: '#000000',
          primary: '#060d1a',
          surface: '#0b1222',
          elevated: '#111a2e',
          hover: '#1e2d47',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          tertiary: '#64748b',
          disabled: '#475569',
        },
        border: {
          primary: 'rgba(148, 163, 184, 0.12)',
          subtle: 'rgba(148, 163, 184, 0.06)',
          focus: '#3b82f6',
        },
        success: '#22c55e',
        warning: '#eab308',
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
        'void-sm': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'void-md': '0 4px 12px rgba(0, 0, 0, 0.35)',
        'void-lg': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'void-xl': '0 16px 48px rgba(0, 0, 0, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'enterprise': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'enterprise-lg': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'neon-blue': '0 0 12px rgba(59, 130, 246, 0.3), 0 0 24px rgba(59, 130, 246, 0.15)',
        'status-green': '0 0 6px rgba(34, 197, 94, 0.5), 0 0 12px rgba(34, 197, 94, 0.2)',
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
