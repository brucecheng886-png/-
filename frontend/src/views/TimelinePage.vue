<template>
  <div class="min-h-screen bg-[#0a0e27] overflow-hidden relative">
    <!-- 背景 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="stars"></div>
    </div>

    <div class="relative z-10 flex flex-col h-screen">
      <!-- 頂部工具列 -->
      <header class="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#1a1d3a]/80 backdrop-blur-md">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
            <span class="text-xl">⏳</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">Knowledge Timeline</h1>
            <p class="text-xs text-text-secondary">按時間線查看知識演變</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- 縮放控制 -->
          <div class="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 px-1">
            <button 
              v-for="scale in scaleOptions" 
              :key="scale.value"
              @click="timeScale = scale.value"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              :class="timeScale === scale.value ? 'bg-neon-blue text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'"
            >
              {{ scale.label }}
            </button>
          </div>

          <!-- 返回圖譜 -->
          <router-link 
            to="/graph-page"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-white transition-all text-sm"
          >
            <span>🌐</span>
            <span>回到圖譜</span>
          </router-link>
        </div>
      </header>

      <!-- 時間軸主體 -->
      <div class="flex-1 overflow-auto custom-scrollbar" ref="scrollContainer">
        <!-- 統計區 -->
        <div class="px-8 py-6 flex items-center gap-6">
          <div class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
            <span class="text-neon-blue text-lg">📊</span>
            <div>
              <p class="text-xs text-text-tertiary">節點總數</p>
              <p class="text-lg font-bold text-white font-mono">{{ timelineEntries.length }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
            <span class="text-neon-purple text-lg">📅</span>
            <div>
              <p class="text-xs text-text-tertiary">時間跨度</p>
              <p class="text-sm font-semibold text-white">{{ timeSpan }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
            <span class="text-neon-cyan text-lg">🔥</span>
            <div>
              <p class="text-xs text-text-tertiary">最活躍日</p>
              <p class="text-sm font-semibold text-white">{{ busiestDay }}</p>
            </div>
          </div>
        </div>

        <!-- 時間軸內容 -->
        <div class="px-8 pb-12">
          <div class="relative">
            <!-- 垂直時間線 -->
            <div class="absolute left-[140px] top-0 bottom-0 w-px bg-gradient-to-b from-neon-blue/50 via-neon-purple/30 to-transparent"></div>

            <!-- 時間分組 -->
            <div 
              v-for="(group, idx) in groupedEntries" 
              :key="group.label"
              class="mb-8 animate-fade-in"
              :style="{ animationDelay: `${idx * 100}ms` }"
            >
              <!-- 日期標頭 -->
              <div class="flex items-center gap-4 mb-4 sticky top-0 z-10 bg-[#0a0e27]/90 backdrop-blur-sm py-2">
                <div class="w-[120px] text-right">
                  <span class="text-sm font-bold text-white">{{ group.label }}</span>
                  <p class="text-[10px] text-text-tertiary">{{ group.weekday }}</p>
                </div>
                <div class="relative">
                  <div class="w-4 h-4 rounded-full bg-neon-blue border-2 border-[#0a0e27] shadow-[0_0_12px_rgba(59,130,246,0.5)] z-10 relative"></div>
                </div>
                <span class="text-xs text-text-tertiary bg-white/5 px-2 py-0.5 rounded-full">
                  {{ group.entries.length }} 項變更
                </span>
              </div>

              <!-- 節點卡片列表 -->
              <div 
                v-for="(entry, entryIdx) in group.entries" 
                :key="entry.id"
                class="flex items-start gap-4 ml-0 mb-3 group cursor-pointer"
                @click="handleNodeClick(entry)"
              >
                <div class="w-[120px] text-right flex-shrink-0">
                  <span class="text-xs text-text-tertiary font-mono">{{ entry.time }}</span>
                </div>
                
                <!-- 連接點 -->
                <div class="relative flex-shrink-0 mt-2">
                  <div 
                    class="w-2.5 h-2.5 rounded-full border-2 border-[#0a0e27] transition-all group-hover:scale-150"
                    :style="{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}40` }"
                  ></div>
                </div>

                <!-- 卡片 -->
                <div 
                  class="flex-1 max-w-2xl px-4 py-3 rounded-xl border transition-all group-hover:translate-x-1"
                  :class="[
                    graphStore.selectedNode?.id === entry.id 
                      ? 'bg-neon-blue/10 border-neon-blue/40' 
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/5 hover:border-white/10'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">{{ entry.emoji }}</span>
                      <span class="text-sm font-semibold text-white">{{ entry.name }}</span>
                      <span 
                        class="px-1.5 py-0.5 text-[10px] font-medium rounded border"
                        :style="{ 
                          color: entry.color, 
                          borderColor: entry.color + '30', 
                          backgroundColor: entry.color + '10' 
                        }"
                      >
                        {{ entry.type }}
                      </span>
                    </div>
                    <span class="text-[10px] text-text-tertiary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      ID: {{ entry.id }}
                    </span>
                  </div>
                  <p v-if="entry.description" class="text-xs text-text-secondary mt-1.5 line-clamp-2">
                    {{ entry.description }}
                  </p>
                  <!-- 連線數 -->
                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-[10px] text-text-tertiary">
                      🔗 {{ entry.linkCount }} 個連線
                    </span>
                    <span v-if="entry.action" class="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-tertiary">
                      {{ entry.action }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空狀態 -->
            <div v-if="timelineEntries.length === 0" class="flex flex-col items-center justify-center py-20 text-text-tertiary">
              <span class="text-6xl mb-4 opacity-30">⏳</span>
              <p class="text-base font-medium mb-2">尚無時間軸資料</p>
              <p class="text-sm">載入圖譜後即可查看知識演變時間線</p>
              <router-link to="/graph-page" class="mt-4 px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 text-sm transition-all">
                前往圖譜工作台
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGraphStore } from '../stores/graphStore';
import { getNodeTypeColor } from '../utils/nodeColors';

const router = useRouter();
const graphStore = useGraphStore();
const scrollContainer = ref(null);

// 確保圖譜數據已加載（直接訪問 /timeline 時也能顯示）
onMounted(async () => {
  if (graphStore.nodeCount === 0) {
    console.log('🔄 [TimelinePage] 圖譜數據為空，自動加載');
    await graphStore.fetchGraphData(graphStore.currentGraphId);
  }
});

// 時間刻度選項
const timeScale = ref('day');
const scaleOptions = [
  { value: 'hour', label: '小時' },
  { value: 'day',  label: '日' },
  { value: 'week', label: '週' },
  { value: 'month', label: '月' },
];

// 將節點轉為時間軸條目
const timelineEntries = computed(() => {
  return graphStore.nodes
    .map(node => {
      const ts = node.timestamp || node.created_at || node.date || Date.now();
      const date = new Date(typeof ts === 'number' ? ts : Date.parse(ts));
      const colorConfig = getNodeTypeColor(node.type);
      
      return {
        id: node.id,
        name: node.name || node.label || node.id,
        type: node.type || 'unknown',
        color: node.color && node.color !== '#9e9e9e' ? node.color : colorConfig.color,
        emoji: node.emoji || colorConfig.emoji,
        description: node.description || '',
        date,
        time: date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
        dateStr: date.toLocaleDateString('zh-TW'),
        linkCount: graphStore.getNodeLinks(node.id).length,
        action: node.aiStatus === 'linked' ? '🤖 AI 關聯' : null,
      };
    })
    .sort((a, b) => b.date - a.date); // 最新在前
});

// 按時間分組
const groupedEntries = computed(() => {
  const groups = {};
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  timelineEntries.value.forEach(entry => {
    let key;
    if (timeScale.value === 'hour') {
      key = entry.date.toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit' });
    } else if (timeScale.value === 'day') {
      key = entry.dateStr;
    } else if (timeScale.value === 'week') {
      const d = new Date(entry.date);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      key = `${startOfWeek.toLocaleDateString('zh-TW')} 週`;
    } else {
      key = entry.date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
    }

    if (!groups[key]) {
      groups[key] = {
        label: key,
        weekday: `星期${weekdays[entry.date.getDay()]}`,
        entries: [],
        sortDate: entry.date,
      };
    }
    groups[key].entries.push(entry);
  });

  return Object.values(groups).sort((a, b) => b.sortDate - a.sortDate);
});

// 統計
const timeSpan = computed(() => {
  if (timelineEntries.value.length < 2) return '—';
  const dates = timelineEntries.value.map(e => e.date.getTime());
  const diffMs = Math.max(...dates) - Math.min(...dates);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '今天';
  if (diffDays < 7) return `${diffDays} 天`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週`;
  return `${Math.floor(diffDays / 30)} 個月`;
});

const busiestDay = computed(() => {
  if (groupedEntries.value.length === 0) return '—';
  const busiest = groupedEntries.value.reduce((max, g) => 
    g.entries.length > max.entries.length ? g : max
  , groupedEntries.value[0]);
  return `${busiest.label} (${busiest.entries.length}項)`;
});

// 點擊節點
const handleNodeClick = (entry) => {
  graphStore.selectNode(entry.id);
  // 可選：導航到圖譜頁面
  // router.push('/graph-page');
};
</script>

<style scoped>
.stars {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.5) 0%, transparent 100%);
  background-size: 200px 200px;
  animation: starsMove 120s linear infinite;
  pointer-events: none;
}

@keyframes starsMove {
  from { background-position: 0 0; }
  to   { background-position: 200px 200px; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.5); }
</style>
