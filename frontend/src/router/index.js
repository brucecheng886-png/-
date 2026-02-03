import { createRouter, createWebHistory } from 'vue-router';

// 導入視圖組件
import BatchRepair from '@/views/BatchRepair.vue';
import Settings from '@/views/Settings.vue';
import GraphView from '@/components/GraphView.vue'; // 在 components 目錄
import KnowledgeForm from '@/components/KnowledgeForm.vue'; // 在 components 目錄
import Graph3D from '@/views/Graph3D.vue';
import GraphPage from '@/views/GraphPage.vue'; // 新增：圖譜整合頁面
import CrossGraphPage from '@/views/CrossGraphPage.vue'; // 新增：跨圖譜頁面
import NexusPage from '@/views/NexusPage.vue'; // 新增：知識中樞
import SystemMonitorPage from '@/views/SystemMonitorPage.vue'; // 新增：系統監控頁面
import ImportPage from '@/views/ImportPage.vue'; // 新增：資料導入頁面

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
    path: '/:pathMatch(.*)*',
    redirect: '/graph-page'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全域路由守衛（可選）
router.beforeEach((to, from, next) => {
  // 設定頁面標題
  if (to.meta.title) {
    document.title = `${to.meta.title} - BruV Platform`;
  } else {
    document.title = 'BruV Platform - Enterprise AI';
  }
  
  next();
});

export default router;
