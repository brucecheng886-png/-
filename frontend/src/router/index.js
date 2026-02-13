import { createRouter, createWebHistory } from 'vue-router';

// 導入視圖組件（Lazy Loading 優化首次載入效能）
const BatchRepair = () => import('@/views/BatchRepair.vue');
const Settings = () => import('@/views/Settings.vue');
const GraphView = () => import('@/components/GraphView.vue');
const KnowledgeForm = () => import('@/components/KnowledgeForm.vue');
const Graph3D = () => import('@/views/Graph3D.vue');
const GraphPage = () => import('@/views/GraphPage.vue');
const CrossGraphPage = () => import('@/views/CrossGraphPage.vue');
const NexusPage = () => import('@/views/NexusPage.vue');
const SystemMonitorPage = () => import('@/views/SystemMonitorPage.vue');
const ImportPage = () => import('@/views/ImportPage.vue');
const FileImport = () => import('@/views/FileImport.vue');
const TimelinePage = () => import('@/views/TimelinePage.vue');
const ChatPage = () => import('@/views/ChatPage.vue');

// 登入頁面不做 Lazy Loading（首次載入必需）
import LoginPage from '@/views/LoginPage.vue';

const routes = [
  {
    path: '/',
    redirect: '/nexus'
  },
  {
    path: '/nexus',
    name: 'Nexus',
    component: NexusPage,
    meta: {
      title: '知識中樞',
      icon: '🌌'
    }
  },
  {
    path: '/batch-repair',
    name: 'BatchRepair',
    component: BatchRepair,
    meta: {
      title: '批次修復',
      icon: '🔧'
    }
  },
  {
    path: '/graph',
    name: 'Graph',
    component: GraphView,
    meta: {
      title: '知識圖譜 (舊版 2D)',
      icon: '🕸️'
    }
  },
  {
    path: '/graph-page',
    name: 'GraphPage',
    component: GraphPage,
    meta: {
      title: '知識圖譜',
      icon: '🌐'
    }
  },
  {
    path: '/import',
    name: 'Import',
    component: ImportPage,
    meta: {
      title: '資料導入',
      icon: '📥'
    }
  },
  {
    path: '/cross-graph',
    name: 'CrossGraph',
    component: CrossGraphPage,
    meta: {
      title: '跨圖譜連接',
      icon: '🔗'
    }
  },
  {
    path: '/graph-3d',
    name: 'Graph3D',
    component: Graph3D,
    meta: {
      title: '3D 圖譜',
      icon: '🧊'
    }
  },
  {
    path: '/create',
    name: 'Create',
    component: KnowledgeForm,
    meta: {
      title: '建立實體',
      icon: '➕'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '系統設定',
      icon: '⚙️'
    }
  },
  {
    path: '/monitor',
    name: 'SystemMonitor',
    component: SystemMonitorPage,
    meta: {
      title: '電腦資訊',
      icon: '💻'
    }
  },
  {
    path: '/file-import',
    name: 'FileImport',
    component: FileImport,
    meta: {
      title: '檔案上傳',
      icon: '📤'
    }
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: TimelinePage,
    meta: {
      title: '時間軸',
      icon: '⏳'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: {
      title: 'AI 助手',
      icon: '🤖'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: '登入',
      public: true  // 標記為公開路由
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/nexus'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 認證狀態快取（避免每次路由切換都呼叫 API）
let authChecked = false;
let authEnabled = true;

// 全域路由守衛 — 認證檢查
router.beforeEach(async (to, from, next) => {
  // 設定頁面標題
  if (to.meta.title) {
    document.title = `${to.meta.title} - BruV Platform`;
  } else {
    document.title = 'BruV Platform - Enterprise AI';
  }
  
  // 公開路由直接放行
  if (to.meta.public) {
    return next();
  }
  
  // 首次載入時檢查後端是否啟用認證
  if (!authChecked) {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${apiBase}/api/auth/status`);
      if (res.ok) {
        const data = await res.json();
        authEnabled = data.auth_enabled;
      }
    } catch {
      // 無法連接後端，假設認證啟用
      authEnabled = true;
    }
    authChecked = true;
  }
  
  // 認證未啟用時直接放行
  if (!authEnabled) {
    return next();
  }
  
  // 檢查是否已有有效 Token
  const token = localStorage.getItem('bruv_api_token');
  if (!token) {
    return next('/login');
  }
  
  next();
});

export default router;
