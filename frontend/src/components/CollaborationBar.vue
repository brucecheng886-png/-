<template>
  <div class="collab-bar">
    <!-- 在線使用者頭像 -->
    <div class="flex items-center gap-1">
      <div 
        v-for="user in visibleUsers" 
        :key="user.id"
        class="relative group"
      >
        <!-- 頭像 -->
        <div 
          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-default transition-all group-hover:scale-110 group-hover:z-10"
          :style="{ 
            backgroundColor: user.color + '25', 
            borderColor: user.color,
            color: user.color 
          }"
        >
          {{ user.initials }}
        </div>

        <!-- 活動指示燈 -->
        <div 
          class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-[#1a1d3a]"
          :class="user.status === 'editing' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'"
        ></div>

        <!-- Tooltip -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-[#1a1d3a] border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
          <p class="text-xs font-medium text-white">{{ user.name }}</p>
          <p class="text-[10px] mt-0.5" :style="{ color: user.color }">
            {{ user.status === 'editing' ? `正在編輯：${user.activeNode}` : '瀏覽中' }}
          </p>
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#1a1d3a] border-l border-t border-white/10"></div>
        </div>
      </div>

      <!-- 更多使用者 -->
      <div 
        v-if="hiddenCount > 0"
        class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white/20 bg-white/5 text-text-tertiary"
      >
        +{{ hiddenCount }}
      </div>
    </div>

    <!-- 分隔線 -->
    <div class="w-px h-5 bg-white/10 mx-1"></div>

    <!-- 即時活動提示 -->
    <transition name="toast" mode="out-in">
      <div 
        v-if="currentActivity" 
        :key="currentActivity.id"
        class="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 max-w-[200px]"
      >
        <div class="w-1.5 h-1.5 rounded-full animate-pulse" :style="{ backgroundColor: currentActivity.userColor }"></div>
        <span class="text-[11px] text-text-secondary truncate">
          <span class="font-medium" :style="{ color: currentActivity.userColor }">{{ currentActivity.userName }}</span>
          {{ currentActivity.text }}
        </span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGraphStore } from '../stores/graphStore';

const graphStore = useGraphStore();

// 模擬在線使用者
const simulatedUsers = ref([
  { id: 'self', name: '我', initials: 'Me', color: '#3b82f6', status: 'editing', activeNode: '' },
  { id: 'u2', name: 'Alice Wang', initials: 'AW', color: '#8b5cf6', status: 'viewing', activeNode: '' },
  { id: 'u3', name: 'Bob Chen', initials: 'BC', color: '#06b6d4', status: 'viewing', activeNode: '' },
]);

const MAX_VISIBLE = 5;

const visibleUsers = computed(() => {
  const users = simulatedUsers.value.map(u => {
    if (u.id === 'self' && graphStore.selectedNode) {
      return { ...u, status: 'editing', activeNode: graphStore.selectedNode.name || graphStore.selectedNode.id };
    }
    return u;
  });
  return users.slice(0, MAX_VISIBLE);
});

const hiddenCount = computed(() => Math.max(0, simulatedUsers.value.length - MAX_VISIBLE));

// 即時活動訊息模擬
const activities = [
  { text: '新增了一個節點', icon: '➕' },
  { text: '建立了一個連線', icon: '🔗' },
  { text: '正在查看圖譜', icon: '👁️' },
  { text: '修改了節點描述', icon: '✏️' },
  { text: '匯入了新檔案', icon: '📥' },
];

const currentActivity = ref(null);
let activityTimer = null;

const rotateActivity = () => {
  const otherUsers = simulatedUsers.value.filter(u => u.id !== 'self');
  if (otherUsers.length === 0) return;

  const user = otherUsers[Math.floor(Math.random() * otherUsers.length)];
  const activity = activities[Math.floor(Math.random() * activities.length)];

  currentActivity.value = {
    id: Date.now(),
    userName: user.name.split(' ')[0],
    userColor: user.color,
    text: activity.text,
  };

  // 同時更新使用者狀態
  simulatedUsers.value = simulatedUsers.value.map(u => {
    if (u.id === user.id) {
      const nodes = graphStore.nodes;
      const randomNode = nodes.length > 0 ? nodes[Math.floor(Math.random() * nodes.length)] : null;
      return {
        ...u,
        status: Math.random() > 0.4 ? 'editing' : 'viewing',
        activeNode: randomNode ? (randomNode.name || randomNode.id) : '',
      };
    }
    return u;
  });
};

onMounted(() => {
  // 8-15 秒隨機間隔模擬活動
  const scheduleNext = () => {
    const delay = 8000 + Math.random() * 7000;
    activityTimer = setTimeout(() => {
      rotateActivity();
      scheduleNext();
    }, delay);
  };
  // 初始3秒後開始
  activityTimer = setTimeout(() => {
    rotateActivity();
    scheduleNext();
  }, 3000);
});

onUnmounted(() => {
  clearTimeout(activityTimer);
});
</script>

<style scoped>
.collab-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-enter-active { animation: toastIn 0.3s ease-out; }
.toast-leave-active { animation: toastOut 0.2s ease-in; }

@keyframes toastIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(4px); }
}
</style>
