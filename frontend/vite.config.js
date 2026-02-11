import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // 禁止清空控制台，方便查看錯誤
  clearScreen: false,
  
  // 日誌級別
  logLevel: 'info',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    
    // HMR 配置 - 防止更新程式碼時前端終止
    hmr: {
      overlay: true,  // 錯誤時顯示疊加層，而不是崩潰
      clientPort: 5173
    },
    
    // Watch 選項 - Windows 檔案監視優化
    watch: {
      usePolling: false,  // 使用原生檔案監視（更高效）
      interval: 100,      // 輪詢間隔
      // 忽略不必要的目錄，減少監視負擔
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
    },
    
    // 配置代理：將 /api 請求轉發到後端 FastAPI
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // manualChunks 暫時停用 — 大型依賴 (g6, three.js) 可能導致 rollup stack overflow
        // 使用 Vite 自動 code splitting 即可
      }
    }
  },
  
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'element-plus',
      '@element-plus/icons-vue',
      '@antv/g6',
      'xlsx',
      'markdown-it'
    ]
  }
});
