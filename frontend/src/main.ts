import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Element Plus — CSS 全域載入 + 圖標註冊（元件透過 unplugin 按需引入）
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// Tailwind CSS
import './style.css';

// DOMPurify — 全域 XSS 消毒 (供 v-html 使用)
import DOMPurify from 'dompurify';
(window as any).DOMPurify = DOMPurify;

// 創建 Vue 應用實例
const app = createApp(App);

// 創建 Pinia 實例
const pinia = createPinia();

// 註冊 Pinia (狀態管理)
app.use(pinia);

// 註冊 Element Plus 圖標（元件透過 unplugin 自動按需引入，圖標仍需全域註冊）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 註冊路由
app.use(router);

// 全域錯誤處理
app.config.errorHandler = (err: unknown, _instance, info: string) => {
  console.error('全域錯誤處理:', err);
  console.error('錯誤資訊:', info);
};

// 全域屬性（可選）
app.config.globalProperties.$apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

// 掛載應用
app.mount('#app');

console.log('🚀 BruV Platform 已啟動');
console.log('📍 環境:', import.meta.env.MODE);
console.log('🔗 API Base:', app.config.globalProperties.$apiBase);
