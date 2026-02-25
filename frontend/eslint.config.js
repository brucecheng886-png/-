import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // 忽略建置產物
  { ignores: ['dist/**', 'node_modules/**', 'auto-imports.d.ts', 'components.d.ts'] },

  // JavaScript 基礎規則
  js.configs.recommended,

  // TypeScript 規則（寬鬆模式，允許漸進遷移）
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
  })),

  // Vue 3 推薦規則
  ...pluginVue.configs['flat/recommended'],

  // Vue SFC 搭配 TypeScript parser
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 專案自訂規則
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      // --- 漸進式 TS 遷移寬鬆規則 ---
      '@typescript-eslint/no-explicit-any': 'off',           // 允許 any（漸進收窄）
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/ban-ts-comment': 'off',            // 允許 @ts-ignore

      // --- Vue 規則調整 ---
      'vue/multi-word-component-names': 'off',               // 允許單字元件名如 App
      'vue/no-v-html': 'warn',                               // v-html 提醒（已有 DOMPurify）
      'vue/require-default-prop': 'off',                     // Vue 3 不強制 default
      'vue/no-setup-props-reactivity-loss': 'warn',          // props 解構警告

      // --- 一般規則 ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],  // 禁止 console.log（允許 warn/error）
      'no-debugger': 'warn',
      'no-unused-vars': 'off',                               // 交由 TS 規則處理
      'prefer-const': 'warn',
    },
  },

  // Prettier 衝突覆蓋（必須放最後）
  eslintConfigPrettier,
];
