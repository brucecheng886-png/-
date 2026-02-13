<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import Graph2D from '../components/Graph2D.vue';
import Graph3D from './Graph3D.vue';
import NexusPanel from '../components/NexusPanel.vue';
import ImportDashboard from '../components/ImportDashboard.vue';
import ColorLegend from '../components/ColorLegend.vue';
import ZoomControls from '../components/ZoomControls.vue';
import BottomToolbar from '../components/BottomToolbar.vue';
import StatsBar from '../components/StatsBar.vue';
import DensitySlider from '../components/DensitySlider.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();
const router = useRouter();

// ===== State =====
const searchQuery = ref('');
const isLoading = ref(false); // 改為 false，避免初始閃爍
const showLeftPanel = ref(true);
const showRightPanel = ref(true);
// 將預設寬度收窄，為圖譜留更多空間
const leftPanelWidth = ref(340);
const localNodeData = ref({
  id: '',
  name: '',
  link: '',
  description: '',
  image: null
});

// AI 建議連線狀態
const suggestedLinks = ref([]);
const selectedSuggestedLinks = ref(new Set()); // 使用者選擇的連線
const hoveredLinkTarget = ref(null); // 當前suspended節點

// NEXUS 控制台狀態 — 從 store 同步，支持 localStorage 持久化
const selectedGraphId = ref(graphStore.currentGraphId || localStorage.getItem('lastGraphId') || null);
const activeFilter = ref('all'); // 'all', 'focus', 'part'
const nodeViewMode = ref('medium'); // 'list', 'small', 'medium', 'large'
const isLinkingMode = ref(false); // 手動連線模式
const linkingSource = ref(null); // 連線起點
const isSelectOpen = ref(false); // 下拉選單展開狀態

// 圖表組件引用（用於調用子組件方法）
const graphComponentRef = ref(null);

// 縮放比例
const zoomPercent = ref(100);
let zoomPollTimer = null;

// 密度過濾 / 叢集控制
const densityThreshold = ref(0);
const clusterEnabled = ref(true);

// 星系圖片設定面板
const showClusterSettings = ref(false);
const clusterTypes = ref([]);
const clusterImageUrl = ref('');
const editingClusterType = ref(null);

const openClusterSettings = () => {
  if (graphComponentRef.value?.getClusterTypes) {
    clusterTypes.value = graphComponentRef.value.getClusterTypes();
  }
  showClusterSettings.value = true;
};

const setClusterImage = (type, url) => {
  if (graphComponentRef.value?.setClusterImage) {
    graphComponentRef.value.setClusterImage(type, url);
    clusterTypes.value = graphComponentRef.value.getClusterTypes();
  }
};

const removeClusterImage = (type) => {
  setClusterImage(type, null);
};

const startEditClusterImage = (type) => {
  editingClusterType.value = type;
  const current = clusterTypes.value.find(t => t.type === type);
  clusterImageUrl.value = current?.image || '';
};

const confirmClusterImage = () => {
  if (editingClusterType.value && clusterImageUrl.value.trim()) {
    setClusterImage(editingClusterType.value, clusterImageUrl.value.trim());
  }
  editingClusterType.value = null;
  clusterImageUrl.value = '';
};

const handleClusterImageUpload = (type, event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    setClusterImage(type, e.target.result);
  };
  reader.readAsDataURL(file);
};

// 預設星系圖片（Canvas 程式化生成）
const showPresetPicker = ref(null); // 當前正在選預設的 type 名稱

const presetPlanets = ref([]);
const presetGenerated = ref(false);

const generatePresetPlanets = () => {
  if (presetGenerated.value) return;
  presetGenerated.value = true;
  
  const configs = [
    { name: '藍色星球',  base: [40, 120, 220], accent: [100, 180, 255], ring: false, pattern: 'swirl' },
    { name: '紅色星球',  base: [180, 50, 40],  accent: [255, 120, 80],  ring: false, pattern: 'bands' },
    { name: '翡翠星球',  base: [30, 150, 100],  accent: [80, 220, 160],  ring: false, pattern: 'swirl' },
    { name: '紫色星球',  base: [120, 50, 180],  accent: [180, 120, 255], ring: false, pattern: 'spots' },
    { name: '金色星球',  base: [190, 150, 40],  accent: [255, 210, 80],  ring: false, pattern: 'bands' },
    { name: '土星',      base: [180, 160, 120], accent: [220, 200, 160], ring: true,  pattern: 'bands' },
    { name: '冰藍星球',  base: [60, 160, 200],  accent: [180, 230, 255], ring: false, pattern: 'spots' },
    { name: '熔岩星球',  base: [160, 40, 20],   accent: [255, 160, 40],  ring: false, pattern: 'cracks' },
    { name: '深空星球',  base: [20, 25, 60],    accent: [60, 80, 160],   ring: false, pattern: 'spots' },
    { name: '粉色星球',  base: [200, 80, 140],  accent: [255, 150, 200], ring: false, pattern: 'swirl' },
    { name: '雙環星球',  base: [80, 100, 160],  accent: [140, 180, 240], ring: true,  pattern: 'swirl' },
    { name: '綠洲星球',  base: [40, 120, 60],   accent: [100, 200, 120], ring: false, pattern: 'bands' },
  ];
  
  presetPlanets.value = configs.map(cfg => ({
    name: cfg.name,
    dataUrl: renderPlanetToDataUrl(cfg)
  }));
};

const renderPlanetToDataUrl = (cfg) => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2, r = size * 0.42;
  const [br, bg, bb] = cfg.base;
  const [ar, ag, ab] = cfg.accent;
  
  // 背景透明
  ctx.clearRect(0, 0, size, size);
  
  // 外層光暈
  const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.35);
  glow.addColorStop(0, `rgba(${ar},${ag},${ab},0.25)`);
  glow.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
  ctx.fillStyle = glow; ctx.fill();
  
  // 球體主體
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  
  const body = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
  body.addColorStop(0, `rgb(${Math.min(255,ar+60)},${Math.min(255,ag+60)},${Math.min(255,ab+60)})`);
  body.addColorStop(0.3, `rgb(${br},${bg},${bb})`);
  body.addColorStop(1, `rgb(${Math.max(0,br-60)},${Math.max(0,bg-60)},${Math.max(0,bb-60)})`);
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, size, size);
  
  // 表面紋路
  ctx.globalAlpha = 0.3;
  if (cfg.pattern === 'bands') {
    for (let i = 0; i < 6; i++) {
      const y = cy - r + r * 2 * (i + 0.5) / 6;
      const bw = 2 + Math.random() * 4;
      ctx.fillStyle = i % 2 === 0 ? `rgba(${ar},${ag},${ab},0.3)` : `rgba(0,0,0,0.15)`;
      ctx.fillRect(cx - r, y - bw / 2, r * 2, bw);
    }
  } else if (cfg.pattern === 'spots') {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * r * 0.75;
      const sr = 3 + Math.random() * 8;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.2 + Math.random() * 0.3})`;
      ctx.fill();
    }
  } else if (cfg.pattern === 'swirl') {
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.25)`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let t = 0; t < Math.PI * 4; t += 0.1) {
        const sr = (t / (Math.PI * 4)) * r * 0.85;
        const x = cx + Math.cos(t + i * 2) * sr;
        const y = cy + Math.sin(t + i * 2) * sr * 0.5;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (cfg.pattern === 'cracks') {
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.6)`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let x = cx + (Math.random() - 0.5) * r;
      let y = cy + (Math.random() - 0.5) * r;
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += (Math.random() - 0.5) * 20;
        y += (Math.random() - 0.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      // 熔岩亮點
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.5)`;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  
  // 邊緣暗化
  const edge = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(0.7, 'rgba(0,0,0,0.1)');
  edge.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, size, size);
  
  // 高光
  const hl = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.5);
  hl.addColorStop(0, 'rgba(255,255,255,0.45)');
  hl.addColorStop(0.4, 'rgba(255,255,255,0.1)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, size, size);
  
  ctx.restore();
  
  // 光圈邊框
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.35)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // 土星環
  if (cfg.ring) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.3, r * 0.25, -0.2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.4)`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.2)`;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();
  }
  
  return canvas.toDataURL('image/png');
};

const openPresetPicker = (type) => {
  generatePresetPlanets();
  showPresetPicker.value = type;
};

const selectPreset = (type, dataUrl) => {
  setClusterImage(type, dataUrl);
  showPresetPicker.value = null;
};

// ===== Computed =====
const currentComponent = computed(() => {
  return graphStore.viewMode === '3d' ? Graph3D : Graph2D;
});

const filteredNodes = computed(() => {
  // 先套用 Store 的過濾器 (all/focus/part)
  let nodes = graphStore.filteredNodes;
  
  // 再套用搜尋過濾
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    nodes = nodes.filter(node => 
      node.name.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query) ||
      (node.description && node.description.toLowerCase().includes(query))
    );
  }
  
  return nodes;
});

const nodeStats = computed(() => {
  return {
    total: graphStore.nodeCount,
    filtered: filteredNodes.value.length,
    links: graphStore.linkCount
  };
});

// ===== Methods =====
const clearSearch = () => {
  searchQuery.value = '';
};

const handleSearch = () => {
  console.log('🔍 搜尋:', searchQuery.value);
  if (filteredNodes.value.length > 0 && searchQuery.value) {
    graphStore.selectNode(filteredNodes.value[0].id);
  }
};

// 顏色圖例篩選
const handleFilterByType = (type) => {
  searchQuery.value = `type:${type}`;
  const matched = graphStore.nodes.filter(n => (n.type || '').toLowerCase() === type);
  if (matched.length > 0) {
    graphStore.selectNode(matched[0].id);
    ElMessage({ message: `已篩選 ${matched.length} 個「${type}」節點`, type: 'info', duration: 1500 });
  }
};

// 根據節點類型或 group 獲取檔案圖示
const getNodeIcon = (node) => {
  // 如果節點已有 emoji，優先使用
  if (node.emoji) {
    return node.emoji;
  }
  
  // 根據 type 或 group 映射圖示
  const type = (node.type || '').toLowerCase();
  const group = node.group;
  
  // 優先根據類型名稱匹配
  if (type.includes('pdf')) return '📄';
  if (type.includes('excel') || type.includes('xlsx') || type.includes('xls')) return '📊';
  if (type.includes('word') || type.includes('doc')) return '📝';
  if (type.includes('ppt') || type.includes('powerpoint')) return '📽';
  if (type.includes('image') || type.includes('img') || type.includes('photo')) return '🖼';
  if (type.includes('video') || type.includes('mp4')) return '🎬';
  if (type.includes('audio') || type.includes('music')) return '🎵';
  if (type.includes('zip') || type.includes('archive')) return '📦';
  if (type.includes('code') || type.includes('程式')) return '💻';
  if (type.includes('檔案') || type.includes('file')) return '📄';
  
  // 根據 group 映射（假設 group 7+ 是檔案類型）
  if (group >= 7) {
    const fileGroupIcons = {
      7: '📄',  // 一般檔案
      8: '📊',  // Excel
      9: '📝',  // Word
      10: '📽', // PPT
      11: '🖼', // 圖片
      12: '🎬', // 影片
    };
    return fileGroupIcons[group] || '📄';
  }
  
  // 預設圖示
  return '📌';
};

const handleNodeClick = (node) => {
  // 如果處於連線模式
  if (isLinkingMode.value) {
    handleLinkingClick(node);
    return;
  }
  
  // 正常模式：選擇節點並顯示詳情
  graphStore.selectNode(node.id);
  showRightPanel.value = true;
  
  // 同步到本地編輯數據 (避免直接修改 Store)
  localNodeData.value = {
    id: node.id,
    name: node.name,
    link: node.link || '',
    description: node.description || '',
    image: node.image || null
  };
  
  // 處理 AI 建議連線
  if (node.links && Array.isArray(node.links)) {
    suggestedLinks.value = node.links.map(link => ({
      ...link,
      id: `${node.id}_to_${link.target_id}` // 為每個連線生成唯一 ID
    }));
    // 預設全部勾選
    selectedSuggestedLinks.value = new Set(suggestedLinks.value.map(link => link.id));
  } else {
    suggestedLinks.value = [];
    selectedSuggestedLinks.value = new Set();
  }
  
  // 🎯 觸發聚焦：調用圖表組件的聚焦方法
  if (graphComponentRef.value && typeof graphComponentRef.value.focusNode === 'function') {
    console.log('🎯 [GraphPage] 觸發節點聚焦:', node.name);
    graphComponentRef.value.focusNode(node);
  } else {
    console.warn('⚠️ [GraphPage] 圖表組件未提供 focusNode 方法');
  }
};

const handleAutoLink = () => {
  ElMessage.info('🔗 AI 自動連結功能開發中...');
};

// ImportGallery 檔案點擊處理
const handleFileClick = ({ fileId, nodeId }) => {
  console.log('📂 檔案點擊:', { fileId, nodeId });
  
  // 選中節點
  graphStore.selectNode(nodeId);
  
  // 顯示檢查器面板
  showRightPanel.value = true;
  
  // 同步到本地編輯數據
  const node = graphStore.nodes.find(n => n.id === nodeId);
  if (node) {
    localNodeData.value = {
      id: node.id,
      name: node.name,
      link: node.link || '',
      description: node.description || '',
      image: node.image || null
    };
  }
  
  // 調用圖表組件的 focusNode 方法（Camera Fly-to）
  if (graphComponentRef.value && typeof graphComponentRef.value.focusNode === 'function') {
    graphComponentRef.value.focusNode(nodeId);
    console.log('🎯 鏡頭飛向節點:', nodeId);
  } else {
    console.warn('⚠️ 圖表組件未提供 focusNode 方法');
  }
  
  ElMessage.success(`✅ 已聲焚至檔案: ${node?.name || fileId}`);
};

// ImportGallery 檔案上傳處理（使用 Store 統一 API）
const handleFileUploaded = async (files) => {
  console.log('📥 開始上傳檔案:', files.length);
  
  const loadingMsg = ElMessage({
    message: `🚀 正在上傳 ${files.length} 個檔案...`,
    type: 'info',
    duration: 0
  });
  
  try {
    // 🌟 使用 Store 的統一 API
    console.log('📡 [GraphPage] 使用 Store.importMultipleFiles()');
    const stats = await graphStore.importMultipleFiles(files);
    
    loadingMsg.close();
    
    ElMessage.success({
      message: `✅ 匯入成功！成功: ${stats.success}, 跳過: ${stats.skipped}, 失敗: ${stats.failed}`,
      duration: 3000
    });
    
    console.log('🎉 檔案匯入成功:', stats);
    
  } catch (error) {
    loadingMsg.close();
    
    ElMessage.error({
      message: `❌ 匯入失敗: ${error.message}`,
      duration: 5000
    });
    console.error('❌ 檔案上傳失敗:', error);
  }
};

const saveChanges = async () => {
  if (!graphStore.selectedNode) {
    ElMessage.warning('⚠️ 未選擇節點');
    return;
  }
  
  const nodeId = localNodeData.value.id;
  const updates = {
    name: localNodeData.value.name,
    link: localNodeData.value.link,
    description: localNodeData.value.description,
    image: localNodeData.value.image
  };
  
  console.log('💾 [GraphPage] 保存節點變更:', nodeId, updates);
  
  try {
    // 1️⃣ 呼叫 Store 統一 API（後端持久化 + 前端同步）
    await graphStore.updateEntity(nodeId, updates);
    
    // 2️⃣ 處理 AI 建議連線
    const selectedLinks = Array.from(selectedSuggestedLinks.value);
    if (selectedLinks.length > 0) {
      for (const linkId of selectedLinks) {
        const link = suggestedLinks.value.find(l => l.id === linkId);
        if (link) {
          graphStore.addLink({
            source: nodeId,
            target: link.target_id,
            relation: link.relation,
            reason: link.reason,
            value: 1
          });
        }
      }
      ElMessage.success(`💾 已保存節點及 ${selectedLinks.length} 個建議連線`);
    } else {
      ElMessage.success(`💾 已保存節點「${localNodeData.value.name}」的變更`);
    }
    
    console.log('✅ [GraphPage] 節點已同步到後端和前端 Store');
    
  } catch (error) {
    console.error('❌ [GraphPage] 保存失敗:', error);
    ElMessage.error(`保存失敗: ${error.message}`);
  }
};

const openLink = () => {
  const url = localNodeData.value.link;
  if (!url) {
    ElMessage.warning('⚠️ 連結為空');
    return;
  }
  
  // 確保 URL 有協議
  const validUrl = url.startsWith('http://') || url.startsWith('https://') 
    ? url 
    : `https://${url}`;
  
  window.open(validUrl, '_blank');
  console.log('🔗 開啟連結:', validUrl);
};

// 圖片上傳（支援 URL 輸入或檔案選擇）
const imageFileInput = ref(null);

const handleImageChange = async () => {
  try {
    const { value: action } = await ElMessageBox.confirm(
      '選擇圖片來源',
      '變更封面',
      {
        confirmButtonText: '輸入網址',
        cancelButtonText: '選擇檔案',
        distinguishCancelAndClose: true
      }
    );
    // 用戶選擇「輸入網址」
    const { value: url } = await ElMessageBox.prompt('請輸入圖片 URL', '封面圖片', {
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      inputPlaceholder: 'https://example.com/image.jpg'
    });
    if (url && url.trim()) {
      localNodeData.value.image = url.trim();
      ElMessage.success('🖼️ 封面已更新（請點 SAVE 保存）');
    }
  } catch (action) {
    if (action === 'cancel') {
      // 用戶選擇「選擇檔案」— 觸發檔案選擇器
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          ElMessage.warning('圖片大小不能超過 5MB');
          return;
        }
        // 轉換為 Base64 Data URL
        const reader = new FileReader();
        reader.onload = () => {
          localNodeData.value.image = reader.result;
          ElMessage.success('🖼️ 封面已更新（請點 SAVE 保存）');
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
    // 'close' = 關閉對話框，不做任何事
  }
};

const closeInspector = () => {
  showRightPanel.value = false;
  graphStore.clearSelection();
  suggestedLinks.value = [];
  selectedSuggestedLinks.value = new Set();
  hoveredLinkTarget.value = null;
};

// 切换建議連線的選擇狀態
const toggleSuggestedLink = (linkId) => {
  if (selectedSuggestedLinks.value.has(linkId)) {
    selectedSuggestedLinks.value.delete(linkId);
  } else {
    selectedSuggestedLinks.value.add(linkId);
  }
  // 觸發響應式更新
  selectedSuggestedLinks.value = new Set(selectedSuggestedLinks.value);
};

// 當滑鼠懸停在建議連線上
const handleLinkHover = (targetId) => {
  hoveredLinkTarget.value = targetId;
  // 通知圖表組件顯示呼吸燈效果
  if (graphComponentRef.value && typeof graphComponentRef.value.highlightNode === 'function') {
    graphComponentRef.value.highlightNode(targetId);
  }
};

// 當滑鼠離開建議連線
const handleLinkLeave = () => {
  hoveredLinkTarget.value = null;
  // 通知圖表組件取消高亮
  if (graphComponentRef.value && typeof graphComponentRef.value.unhighlightNode === 'function') {
    graphComponentRef.value.unhighlightNode();
  }
};

// 獲取目標節點名稱
const getTargetNodeName = (targetId) => {
  const node = graphStore.getNodeById(targetId);
  return node ? node.name : targetId;
};

const deleteNode = async () => {
  if (!graphStore.selectedNode) {
    ElMessage.warning('⚠️ 未選擇節點');
    return;
  }
  
  const nodeId = graphStore.selectedNode.id;
  const nodeName = graphStore.selectedNode.name;
  
  // 使用 ElMessageBox 替代原生 confirm
  try {
    await ElMessageBox.confirm(
      `此操作將同時刪除所有相關連接，且無法復原。`,
      `確定要刪除節點「${nodeName}」嗎？`,
      { confirmButtonText: '刪除', cancelButtonText: '取消', type: 'warning' }
    );
  } catch {
    return; // 用戶取消
  }
  
  console.log('🗑️ [GraphPage] 刪除節點:', nodeId, nodeName);
  
  try {
    // 1️⃣ 呼叫 Store 統一 API（後端刪除 + 前端同步）
    await graphStore.deleteEntity(nodeId);
    
    // 2️⃣ 關閉面板
    showRightPanel.value = false;
    
    ElMessage.success({
      message: `🗑️ 已刪除節點「${nodeName}」`,
      duration: 2000,
      showClose: true
    });
    
  } catch (error) {
    console.error('❌ [GraphPage] 刪除失敗:', error);
    ElMessage.error(`刪除失敗: ${error.message}`);
  }
};

// ===== NEXUS 控制台 Methods =====
const handleGraphChange = async (graphIdOrEvent) => {
  // 🔧 支持 NexusPanel emit 的 graphId（number/string）和 DOM 事件
  let graphId;
  if (graphIdOrEvent && graphIdOrEvent.target && graphIdOrEvent.target.value !== undefined) {
    graphId = graphIdOrEvent.target.value;
  } else {
    graphId = graphIdOrEvent;
  }
  console.log('📊 [GraphPage] 切換圖譜:', graphId);
  
  selectedGraphId.value = graphId;
  localStorage.setItem('lastGraphId', String(graphId));
  
  try {
    isLoading.value = true;
    await graphStore.fetchGraphData(graphId);
    console.log('✅ [GraphPage] 圖譜切換完成:', graphStore.nodeCount, '個節點');
    ElMessage.success(`🔄 已切換到圖譜: ${graphId}`);
  } catch (error) {
    console.error('❌ [GraphPage] 圖譜切換失敗:', error);
    ElMessage.error('圖譜切換失敗: ' + error.message);
  } finally {
    isLoading.value = false;
  }
  isSelectOpen.value = false;
};

const onSelectMouseDown = () => {
  isSelectOpen.value = true;
};

const onSelectBlur = () => {
  setTimeout(() => {
    isSelectOpen.value = false;
  }, 200);
};

const handleEditGraph = async () => {
  const graphId = selectedGraphId.value;
  const graph = graphStore.graphMetadataList.find(g => String(g.id) === String(graphId));
  const currentName = graph?.name || '';
  
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '請輸入新的圖譜名稱',
      '編輯圖譜',
      {
        confirmButtonText: '儲存',
        cancelButtonText: '取消',
        inputValue: currentName,
        inputPattern: /\S+/,
        inputErrorMessage: '圖譜名稱不能為空',
        customClass: 'dark-message-box'
      }
    );
    
    if (newName && newName.trim() !== currentName) {
      await graphStore.updateGraph(graphId, { name: newName.trim() });
      ElMessage.success(`✅ 圖譜已重新命名為「${newName.trim()}」`);
    }
  } catch {
    // 使用者取消
  }
};

const handleCreateGraph = async () => {
  try {
    const { value: graphName } = await ElMessageBox.prompt(
      '請輸入圖譜名稱',
      '新增圖譜',
      {
        confirmButtonText: '建立',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：研究專題、專案知識庫...',
        inputPattern: /\S+/,
        inputErrorMessage: '圖譜名稱不能為空',
        customClass: 'dark-message-box'
      }
    );
    
    if (graphName && graphName.trim()) {
      const newGraph = await graphStore.createGraph({ name: graphName.trim() });
      ElMessage.success(`✅ 圖譜「${graphName.trim()}」已建立`);
      
      // 自動切換到新圖譜
      selectedGraphId.value = newGraph.id;
      await graphStore.fetchGraphData(newGraph.id);
      
      // 提示是否前往匯入資料
      try {
        await ElMessageBox.confirm(
          `圖譜「${graphName.trim()}」已建立成功，\n是否立即前往匯入資料？`,
          '📂 匯入資料',
          {
            confirmButtonText: '前往匯入',
            cancelButtonText: '稍後再說',
            type: 'info',
            customClass: 'dark-message-box'
          }
        );
        router.push({ path: '/file-import', query: { graphId: newGraph.id } });
      } catch {
        // 使用者選擇稍後再說，留在當前頁面
      }
    }
  } catch {
    // 使用者取消
  }
};

const handleDeleteGraph = async () => {
  const graphId = selectedGraphId.value;
  
  // 禁止刪除最後一個圖譜
  if (graphStore.graphMetadataList.length <= 1) {
    ElMessage.warning('⚠️ 至少需要保留一個圖譜，無法刪除');
    return;
  }
  
  // 取得圖譜名稱
  const graph = graphStore.graphMetadataList.find(g => String(g.id) === String(graphId));
  const graphName = graph?.name || graphId;
  const nodeCount = graphStore.nodeCount;
  const linkCount = graphStore.linkCount;
  
  // 檢查是否有 RAGFlow 知識庫關聯
  const ragflowInfo = graph?.ragflow_dataset_id 
    ? `• RAGFlow 知識庫中的所有文件\n\n` 
    : '\n';

  try {
    await ElMessageBox.confirm(
      `確定要刪除圖譜「${graphName}」嗎？\n\n` +
      `此操作將永久刪除：\n` +
      `• ${nodeCount} 個節點\n` +
      `• ${linkCount} 條連線\n` +
      ragflowInfo +
      `⚠️ 此操作無法復原！`,
      '刪除圖譜',
      {
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        customClass: 'dark-message-box'
      }
    );
    
    // 使用者確認刪除
    await graphStore.deleteGraph(graphId, true);
    
    // 切換到剩餘的第一個圖譜
    const remaining = graphStore.graphMetadataList[0];
    if (remaining) {
      selectedGraphId.value = remaining.id;
      await graphStore.fetchGraphData(remaining.id);
    }
    
    ElMessage.success(`✅ 圖譜「${graphName}」已刪除`);
    
  } catch (action) {
    // 使用者取消 或 刪除失敗
    if (action !== 'cancel') {
      ElMessage.error(`❌ 刪除失敗: ${action.message || action}`);
    }
  }
};

const setFilter = (filter) => {
  activeFilter.value = filter;
  graphStore.setFilterMode(filter);
  ElMessage.info(`🔎 已切換到: ${filter === 'all' ? '顯示全部' : filter === 'focus' ? '焦點模式' : '部分顯示'}`);
};

// ===== Zoom 控制 =====
const handleZoomIn = () => {
  graphComponentRef.value?.zoomIn?.();
  updateZoomPercent();
};

const handleZoomOut = () => {
  graphComponentRef.value?.zoomOut?.();
  updateZoomPercent();
};

const handleZoomFit = () => {
  graphComponentRef.value?.zoomToFit?.();
  setTimeout(updateZoomPercent, 900);
};

const handleZoomReset = () => {
  graphComponentRef.value?.resetView?.();
  setTimeout(updateZoomPercent, 1100);
};

const updateZoomPercent = () => {
  const z = graphComponentRef.value?.getZoom?.();
  if (z) zoomPercent.value = Math.round(z * 100);
};

// ===== Focus 模式 =====
const isFocusMode = computed(() => activeFilter.value === 'focus');

const toggleFocusMode = () => {
  const next = isFocusMode.value ? 'all' : 'focus';
  setFilter(next);
};

// ===== 快速新增節點 =====
const handleQuickAddNode = () => {
  const name = `新節點 ${graphStore.nodeCount + 1}`;
  graphStore.addNode({
    name,
    type: 'note',
    description: '',
  });
  ElMessage.success(`✅ 已新增：${name}`);
};

const toggleViewMode = () => {
  const currentMode = graphStore.viewMode;
  const newMode = currentMode === '2d' ? '3d' : '2d';
  
  console.log(`🔄 [GraphPage] 視圖模式切換: ${currentMode} → ${newMode}`);
  console.log(`📊 [GraphPage] 切換前 Store 狀態:`, {
    viewMode: graphStore.viewMode,
    nodeCount: graphStore.nodeCount,
    linkCount: graphStore.linkCount
  });
  
  // 調用 Store 更新視圖模式（會自動保存到 localStorage）
  graphStore.setViewMode(newMode);
  
  // 用戶提示
  ElMessage.success({
    message: `✅ 已切換到 ${newMode.toUpperCase()} 視圖`,
    duration: 1500,
    showClose: false
  });
  
  // 確認狀態已更新
  setTimeout(() => {
    console.log('📊 [GraphPage] 切換後 Store 狀態:', {
      viewMode: graphStore.viewMode,
      component: graphStore.viewMode === '3d' ? 'Graph3D' : 'Graph2D'
    });
    console.log('✅ [GraphPage] 視圖模式切換完成');
  }, 100);
};

// ===== 節點展示模式 =====
const setNodeViewMode = (mode) => {
  nodeViewMode.value = mode;
  console.log('🎨 節點展示模式:', mode);
};

// ===== 手動連線功能 =====
const toggleLinkingMode = () => {
  isLinkingMode.value = !isLinkingMode.value;
  
  if (isLinkingMode.value) {
    linkingSource.value = null;
    ElMessage.success('🔗 連線模式已開啟，請點擊兩個節點建立連結');
  } else {
    linkingSource.value = null;
    ElMessage.info('🔗 連線模式已關閉');
  }
};

const handleLinkingClick = (node) => {
  if (!linkingSource.value) {
    // 第一次點擊：設定起點
    linkingSource.value = node;
    ElMessage.info(`📍 起點: ${node.name}，請選擇目標節點`);
  } else {
    // 第二次點擊：建立連結
    if (linkingSource.value.id === node.id) {
      ElMessage.warning('⚠️ 無法連結到自己');
      return;
    }
    
    // 檢查是否已存在連結
    const existingLink = graphStore.links.find(link => 
      (link.source === linkingSource.value.id && link.target === node.id) ||
      (link.source === node.id && link.target === linkingSource.value.id)
    );
    
    if (existingLink) {
      ElMessage.warning('⚠️ 連結已存在');
      linkingSource.value = null;
      return;
    }
    
    // 建立新連結
    graphStore.addLink({
      source: linkingSource.value.id,
      target: node.id,
      value: 3,
      label: '手動連結'
    });
    
    ElMessage.success(`✅ 已連結: ${linkingSource.value.name} → ${node.name}`);
    console.log('🔗 新連結:', linkingSource.value.id, '->', node.id);
    
    // 重置
    linkingSource.value = null;
  }
};

// ===== 拖動處理 =====
const startDragLeft = () => {
  isDraggingLeft.value = true;
  document.addEventListener('mousemove', onDragLeft);
  document.addEventListener('mouseup', stopDragLeft);
};

const onDragLeft = (e) => {
  if (!isDraggingLeft.value) return;
  // 直接使用鼠标位置作为宽度，限制在 320-700px 之间
  const newWidth = e.clientX - (layoutStore.isSidebarCollapsed ? 0 : 280);
  leftPanelWidth.value = Math.max(320, Math.min(700, newWidth));
};

const stopDragLeft = () => {
  isDraggingLeft.value = false;
  document.removeEventListener('mousemove', onDragLeft);
  document.removeEventListener('mouseup', stopDragLeft);
};

// ===== Watch: 監聽選中節點變化，自動同步到本地編輯數據 =====
watch(
  () => graphStore.selectedNode,
  (newNode) => {
    if (newNode) {
      // 同步選中節點到本地編輯數據
      localNodeData.value = {
        id: newNode.id,
        name: newNode.name || '',
        link: newNode.link || '',
        description: newNode.description || '',
        image: newNode.image || null
      };
      console.log('🔄 [GraphPage] 選中節點已同步到編輯面板:', newNode.name);
    }
  },
  { immediate: false }
);

// ===== Lifecycle =====
onMounted(async () => {
  // 🌟 每次進入頁面都刷新數據，確保同步（Manager 自動處理緩存）
  console.log('🔄 [GraphPage] 加載圖譜數據');
  isLoading.value = true;
  
  // 決定載入哪個圖譜：優先 store > localStorage > 預設 1
  const graphIdToLoad = graphStore.currentGraphId || localStorage.getItem('lastGraphId') || 1;
  selectedGraphId.value = graphIdToLoad;
  
  try {
    // 並行載入：圖譜數據 + 元數據列表（確保圖譜選擇器有數據）
    await Promise.all([
      graphStore.fetchGraphData(graphIdToLoad),
      graphStore.loadGraphMetadataList().catch(err => {
        console.warn('⚠️ [GraphPage] 元數據列表載入失敗（不影響圖譜顯示）:', err.message);
      })
    ]);
    
    // 持久化當前圖譜 ID
    localStorage.setItem('lastGraphId', String(graphIdToLoad));
    
    console.log('✅ [GraphPage] 圖譜數據已加載:', graphStore.nodeCount, '個節點,', graphStore.linkCount, '個連接');
    // 啟動縮放比例輪詢
    zoomPollTimer = setInterval(updateZoomPercent, 2000);
  } catch (error) {
    console.error('❌ 圖譜數據加載失敗:', error);
    ElMessage.error('圖譜數據加載失敗: ' + (error.message || '未知錯誤'));
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (zoomPollTimer) clearInterval(zoomPollTimer);
});
</script>

<template>
  <div class="flex h-full w-full overflow-hidden bg-[#0a0e27]">
    <!-- 左側可拖拉欄: 預設 420px -->
    <aside 
      class="h-full flex-shrink-0 border-r bg-[#0a0e27] flex flex-col shadow-sm z-20 border-[#2d3154] relative"
      :style="{ width: leftPanelWidth + 'px' }"
    >
      <!-- 上方: NexusPanel (flex-1 可滾動) -->
      <div class="flex-1 overflow-y-auto border-b border-[#2d3154]">
        <NexusPanel 
          :search-query="searchQuery"
          v-model:selectedGraphId="selectedGraphId"
          :active-filter="activeFilter"
          v-model:nodeViewMode="nodeViewMode"
          :is-linking-mode="isLinkingMode"
          :linking-source="linkingSource"
          @graph-change="handleGraphChange"
          @edit-graph="handleEditGraph"
          @create-graph="handleCreateGraph"
          @delete-graph="handleDeleteGraph"
          @node-click="handleNodeClick"
        />
      </div>
      
      <!-- 拖動手柄 -->
      <div
        class="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-30"
        @mousedown="startDragLeft"
        title="拖動調整寬度"
      >
        <div class="h-full w-px mx-auto bg-white/20"></div>
      </div>
    </aside>

    <!-- 右側畫布區: flex-1 -->
    <main class="flex-1 relative bg-black">
      <!-- 載入動畫 -->
      <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
        <div class="w-15 h-15 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-400 m-0">載入知識圖譜中...</p>
      </div>
      
      <!-- 圖譜畫布 -->
      <keep-alive v-else>
        <component 
          :is="currentComponent" 
          :key="graphStore.viewMode" 
          ref="graphComponentRef"
          :density-threshold="densityThreshold"
          :focus-fade="isFocusMode || !!graphStore.selectedNode"
          :cluster-enabled="clusterEnabled"
        />
      </keep-alive>

      <!-- 右側縮放控制列 (Fixed Overlay) -->
      <div class="fixed right-6 top-1/2 -translate-y-1/2 z-[55] flex flex-col gap-3 pointer-events-auto">
        <ZoomControls
          :zoom-percent="zoomPercent"
          :is3-d="graphStore.viewMode === '3d'"
          @zoom-in="handleZoomIn"
          @zoom-out="handleZoomOut"
          @zoom-fit="handleZoomFit"
          @zoom-reset="handleZoomReset"
          @toggle-layout="toggleViewMode"
        />
      </div>

      <!-- 搜尋框 (右下角) -->
      <div class="absolute bottom-28 right-6 z-30">
        <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl"
             style="background: rgba(10, 14, 39, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM13 13l-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text"
            class="w-56 bg-transparent border-none text-sm text-white placeholder-gray-400 focus:outline-none"
            placeholder="Search nodes..."
            @keyup.enter="handleSearch"
          />
          <button 
            v-if="searchQuery" 
            class="w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all bg-white/20 hover:bg-white/30 text-white flex-shrink-0 cursor-pointer border-none"
            @click="clearSearch"
          >✕</button>
        </div>
      </div>

      <!-- 底部工具列 (固定於螢幕正中央底部) -->
      <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <BottomToolbar
          :is-focus-mode="isFocusMode"
          :is-linking-mode="isLinkingMode"
          :active-filter="activeFilter"
          @toggle-focus="toggleFocusMode"
          @set-filter="setFilter"
          @add-node="handleQuickAddNode"
          @toggle-linking="toggleLinkingMode"
          @open-cluster-settings="openClusterSettings"
        />
      </div>

      <!-- 底部統計列 (右下角) -->
      <div class="fixed bottom-3 right-6 z-40 pointer-events-auto">
        <StatsBar />
      </div>

      <!-- NODE TYPES 標記 (左下角) -->
      <div class="fixed bottom-3 z-40 pointer-events-auto" :style="{ left: layoutStore.isSidebarCollapsed ? '16px' : '296px' }">
        <div class="px-3 py-1.5">
          <ColorLegend @filter-type="handleFilterByType" />
        </div>
      </div>

      <!-- 星系圖片設定面板 -->
      <transition name="slide-down">
        <div v-if="showClusterSettings" class="fixed inset-0 z-[60] flex items-center justify-center" @click.self="showClusterSettings = false">
          <div class="cluster-settings-panel">
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                </div>
                <div>
                  <h3 class="text-white font-bold text-base m-0">星系自訂圖片</h3>
                  <p class="text-gray-400 text-xs m-0 mt-0.5">為每個類型叢集設定專屬星球外觀</p>
                </div>
              </div>
              <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none" @click="showClusterSettings = false">✕</button>
            </div>

            <div class="cluster-types-list">
              <div v-for="ct in clusterTypes" :key="ct.type" class="cluster-type-row">
                <!-- 預覽 -->
                <div class="cluster-preview" :style="{ borderColor: ct.color + '60' }">
                  <img v-if="ct.image" :src="ct.image" class="w-full h-full object-cover rounded-lg" />
                  <div v-else class="w-full h-full rounded-lg flex items-center justify-center" :style="{ background: `radial-gradient(circle, ${ct.color}44, ${ct.color}15)` }">
                    <svg class="w-6 h-6 opacity-40 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                </div>
                
                <!-- 資訊 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: ct.color }"></span>
                    <span class="text-white font-semibold text-sm truncate">{{ ct.type }}</span>
                    <span class="text-xs text-gray-400">({{ ct.count }})</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1 m-0 truncate">{{ ct.image ? '已設定自訂圖片' : '使用預設星球效果' }}</p>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <!-- 預設圖庫 -->
                  <button class="cluster-action-btn cluster-action-preset" title="選擇預設星球" @click="openPresetPicker(ct.type)">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <!-- 上傳圖片 -->
                  <label class="cluster-action-btn" title="上傳圖片">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <input type="file" accept="image/*" class="hidden" @change="handleClusterImageUpload(ct.type, $event)" />
                  </label>
                  <!-- 貼上 URL -->
                  <button class="cluster-action-btn" title="輸入圖片 URL" @click="startEditClusterImage(ct.type)">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  </button>
                  <!-- 移除 -->
                  <button v-if="ct.image" class="cluster-action-btn cluster-action-danger" title="移除圖片" @click="removeClusterImage(ct.type)">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              
              <!-- 空狀態 -->
              <div v-if="clusterTypes.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                <p class="text-gray-400 text-sm m-0">需要至少 3 個同類型節點才會形成星系</p>
              </div>
            </div>

            <!-- URL 輸入面板 -->
            <transition name="slide-down">
              <div v-if="editingClusterType" class="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <p class="text-xs text-gray-400 m-0 mb-2">為 <span class="text-blue-400 font-semibold">{{ editingClusterType }}</span> 設定圖片 URL</p>
                <div class="flex gap-2">
                  <input 
                    v-model="clusterImageUrl"
                    type="text" 
                    class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/galaxy.png"
                    @keyup.enter="confirmClusterImage"
                  />
                  <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer border-none" @click="confirmClusterImage">確認</button>
                  <button class="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all cursor-pointer border-none" @click="editingClusterType = null">取消</button>
                </div>
              </div>
            </transition>

            <!-- 預設星球選擇器 -->
            <transition name="slide-down">
              <div v-if="showPresetPicker" class="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-xs text-gray-400 m-0">為 <span class="text-purple-400 font-semibold">{{ showPresetPicker }}</span> 選擇預設星球</p>
                  <button class="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none" @click="showPresetPicker = null">關閉</button>
                </div>
                <div class="preset-grid">
                  <button 
                    v-for="preset in presetPlanets" 
                    :key="preset.name"
                    class="preset-planet-btn"
                    :title="preset.name"
                    @click="selectPreset(showPresetPicker, preset.dataUrl)"
                  >
                    <img :src="preset.dataUrl" :alt="preset.name" class="w-full h-full object-contain" />
                    <span class="preset-planet-name">{{ preset.name }}</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </transition>
    </main>

    <!-- 頂部橫向面板: 節點檢查器 (Inspector) -->
    <transition name="slide-down">
      <div 
        v-if="showRightPanel && graphStore.selectedNode" 
        class="fixed top-16 left-1/2 -translate-x-1/2 w-[950px] max-h-[85vh] z-50 backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden transition-all duration-300 bg-[#0f0f0f]/95 border-white/10"
      >
        <!-- 關閉按鈕 -->
        <button 
          class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg transition-all z-10 bg-white/10 hover:bg-white/20 text-white"
          @click="closeInspector" 
          title="關閉"
        >✕</button>

        <!-- 橫向佈局 -->
        <div class="flex items-stretch h-full">
          <!-- 左側: 預覽圖 -->
          <div class="w-64 flex-shrink-0">
            <div class="relative group h-full bg-white/5 border-r border-white/10">
              <div v-if="!localNodeData.image" class="w-full h-full flex flex-col items-center justify-center gap-2">
                <svg class="w-12 h-12 opacity-30 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <span class="text-sm text-gray-400 font-medium">No Cover</span>
              </div>
              <img 
                v-else 
                :src="localNodeData.image" 
                alt="Node Cover"
                class="w-full h-full object-cover"
              />
              <!-- Hover Overlay -->
              <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" @click="handleImageChange">
                <span class="text-3xl">📷</span>
                <span class="text-sm text-white font-semibold">Change Cover</span>
              </div>
            </div>
          </div>

          <!-- 中間: 標題、輸入框與 AI 建議連線 -->
          <div class="flex-1 flex flex-col p-5 gap-3">
            <!-- 標題 -->
            <div>
              <input 
                v-model="localNodeData.name"
                type="text"
                class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-lg font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="節點標題..."
              />
            </div>

            <!-- SRL -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">SRL</label>
              <input 
                v-model="localNodeData.id"
                type="text"
                class="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                readonly
              />
            </div>

            <!-- LINK -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">LINK</label>
              <div class="flex gap-2">
                <input 
                  v-model="localNodeData.link"
                  type="text"
                  class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="https://..."
                />
                <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all" @click="openLink">Go</button>
              </div>
            </div>

            <!-- AI 建議連線區塊 -->
            <div v-if="suggestedLinks.length > 0" class="flex flex-col gap-2 mt-2">
              <label class="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🤖</span>
                <span>AI 建議連線</span>
                <span class="text-xs font-normal text-gray-400">(取消勾選不儲存)</span>
              </label>
              <div class="max-h-32 overflow-y-auto space-y-2 pr-2">
                <div 
                  v-for="link in suggestedLinks" 
                  :key="link.id"
                  class="group flex items-start gap-2 p-2.5 rounded-lg border transition-all cursor-pointer"
                  :class="[
                    selectedSuggestedLinks.has(link.id)
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-white/5 border-white/10',
                    hoveredLinkTarget === link.target_id ? 'ring-2 ring-purple-500' : ''
                  ]"
                  @mouseenter="handleLinkHover(link.target_id)"
                  @mouseleave="handleLinkLeave"
                >
                  <!-- 勾選框 -->
                  <input 
                    type="checkbox"
                    :checked="selectedSuggestedLinks.has(link.id)"
                    @change="toggleSuggestedLink(link.id)"
                    class="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  
                  <!-- 連線資訊 -->
                  <div class="flex-1 text-sm">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-semibold text-white">{{ getTargetNodeName(link.target_id) }}</span>
                      <span class="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded">{{ link.relation }}</span>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed">{{ link.reason }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按鈕列 -->
            <div class="flex gap-3 mt-auto pt-2">
              <button 
                class="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all" 
                @click="saveChanges"
              >
                <span class="text-base">💾</span>
                <span>SAVE</span>
              </button>
              <button 
                class="px-4 py-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg shadow-red-500/30 transition-all" 
                @click="deleteNode"
                title="刪除節點"
              >
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6 7v5M10 7v5M4 4l.8 9a1 1 0 001 .9h4.4a1 1 0 001-.9L12 4"/></svg>
                <span>DELETE</span>
              </button>
            </div>
          </div>

          <!-- 右側: 描述區域 -->
          <div class="w-80 flex-shrink-0 p-5 border-l border-white/10">
            <div class="flex flex-col gap-2 h-full">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">DESCRIPTION</label>
              <textarea 
                v-model="localNodeData.description"
                class="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm leading-relaxed text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                placeholder="節點描述..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </transition>
    

  </div>
</template>

<style scoped>
/* ===== 工作台容器 ===== */
.graph-workspace {
  /* 佈局由 Tailwind classes 控制: flex h-screen overflow-hidden */
  position: relative;
  background: var(--bg-void);
}

/* ===== 左側 Sidebar：固定 380px ===== */
.sidebar {
  /* 佈局由 Tailwind classes 控制: w-[380px] h-full flex-shrink-0 flex flex-col border-r */
  position: relative;
}

/* ===== 右側畫布區：flex-1 填滿剩餘空間 ===== */
.graph-canvas-area {
  /* 佈局由 Tailwind classes 控制: flex-1 h-full relative */
  position: relative;
  transition: background 0.3s ease;
}

/* ===== 絲滑下拉選單 ===== */
.select-wrapper {
  position: relative;
}

.select-arrow {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: currentColor;
  opacity: 0.6;
}

.select-arrow.rotate {
  transform: translateY(-50%) rotate(180deg);
}

.select-smooth {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
  padding-right: 40px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow;
}

.select-smooth:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.select-smooth:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2),
              0 4px 16px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.select-smooth:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.select-smooth:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.select-smooth:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* ===== Layer 1: 圖譜畫布層 ===== */
.graph-canvas-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* 載入動畫 */
.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-void);
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(68, 138, 255, 0.2);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* ===== Layer 2: UI 控制層 ===== */
/* 左側面板: BruV AI NEXUS 控制台 */
.nexus-dock {
  position: absolute;
  left: 16px;
  top: 16px;
  bottom: 16px;
  width: 340px;
  z-index: 50;
  background: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* A. Header */
.nexus-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nexus-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.text-accent {
  background: linear-gradient(135deg, #448aff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.admin-badge {
  padding: 4px 12px;
  background: var(--primary-blue);
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* B. 圖譜選擇器 */
.graph-selector {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.graph-select {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.graph-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.graph-select:focus {
  border-color: var(--primary-blue);
}

.graph-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit {
  border-color: rgba(68, 138, 255, 0.3);
}

.action-btn.edit:hover {
  background: rgba(68, 138, 255, 0.2);
  border-color: var(--primary-blue);
}

.action-btn.create {
  border-color: rgba(34, 197, 94, 0.3);
}

.action-btn.create:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
}

.action-btn.delete {
  border-color: rgba(239, 68, 68, 0.3);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

/* C. 搜尋框 */
.nexus-search {
  position: relative;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nexus-search-input {
  width: 100%;
  padding: 10px 36px 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.nexus-search-input:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(68, 138, 255, 0.1);
}

.nexus-search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.search-clear {
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* C2. 節點展示模式切換 */
.view-mode-selector {
  display: flex;
  gap: 6px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.view-mode-btn {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-mode-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.view-mode-btn.active {
  background: rgba(68, 138, 255, 0.2);
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

/* D. 過濾器網格 (2x2) */
.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.filter-btn {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.filter-btn.active {
  background: rgba(68, 138, 255, 0.2);
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.filter-btn.view-toggle {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.3);
  color: #a78bfa;
}

.filter-btn.view-toggle:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: #a78bfa;
}

/* E. 底部大按鈕 */
.primary-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.primary-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.primary-btn.import {
  border-color: rgba(251, 191, 36, 0.3);
}

.primary-btn.import:hover {
  border-color: #fbbf24;
}

.primary-btn.link-mode {
  border-color: rgba(139, 92, 246, 0.3);
}

.primary-btn.link-mode:hover {
  border-color: #8b5cf6;
}

.primary-btn.link-mode.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.primary-btn .btn-icon {
  font-size: 24px;
}

.primary-btn .btn-label {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 節點統計 */
.nexus-stats {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(68, 138, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-blue);
  font-family: 'Consolas', monospace;
}

.stat-value.highlight {
  color: var(--accent-orange);
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* 節點列表 (簡化版) */
.nexus-node-list {
  flex: 1;
  padding: 12px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nexus-node-list::-webkit-scrollbar {
  width: 6px;
}

.nexus-node-list::-webkit-scrollbar-thumb {
  background: rgba(68, 138, 255, 0.3);
  border-radius: 3px;
}

/* ===== List 模式: 純文字列表 ===== */
.nexus-node-list.view-mode-list {
  gap: 2px;
}

.node-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.node-list-item.selected {
  background: rgba(68, 138, 255, 0.1);
  border-color: var(--primary-blue);
}

.node-list-item.linking {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
}

.node-list-item .node-icon {
  font-size: 10px;
  font-weight: bold;
}

.node-list-item .node-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== Small 模式: 純圖示網格 ===== */
.nexus-node-list.view-mode-small {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.node-small-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.node-small-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.node-small-item.selected {
  border-width: 2px;
  box-shadow: 0 0 12px currentColor;
}

.node-small-item.linking {
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.node-small-item .node-emoji {
  font-size: 24px;
}

/* ===== Medium 模式: 標準卡片 ===== */
.nexus-node-list.view-mode-medium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.node-medium-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-medium-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.node-medium-item.selected {
  background: rgba(68, 138, 255, 0.1);
  border-color: var(--primary-blue);
}

.node-medium-item.linking {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.node-medium-item .node-preview {
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-medium-item .node-emoji {
  font-size: 28px;
}

.node-medium-item .node-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-medium-item .node-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-medium-item .node-type {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
}

/* ===== Large 模式: 大型詳細卡片 ===== */
.nexus-node-list.view-mode-large {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-large-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-large-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.node-large-item.selected {
  background: rgba(68, 138, 255, 0.1);
  border-color: var(--primary-blue);
}

.node-large-item.linking {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.node-large-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.node-preview-large {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-emoji-large {
  font-size: 32px;
}

.node-info-large {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-name-large {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.node-type-large {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.node-description {
  font-size: 11px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

/* ===== 頂部面板 (Inspector Panel - 節點屬性編輯器) ===== */
/* 現在使用 Tailwind 類別進行樣式設計，無需額外 CSS */

/* B. Scrollable Content Area */
.inspector-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.inspector-content::-webkit-scrollbar {
  width: 6px;
}

.inspector-content::-webkit-scrollbar-track {
  background: transparent;
}

.inspector-content::-webkit-scrollbar-thumb {
  background: rgba(68, 138, 255, 0.3);
  border-radius: 3px;
}

.inspector-content::-webkit-scrollbar-thumb:hover {
  background: rgba(68, 138, 255, 0.5);
}

/* Title Section */
.title-section {
  margin-bottom: 4px;
}

.title-input {
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  outline: none;
  transition: all 0.2s ease;
}

.title-input:focus {
  color: var(--primary-blue);
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* Image Section */
.image-section {
  width: 100%;
}

.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.placeholder-icon {
  font-size: 40px;
  opacity: 0.3;
}

.placeholder-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 32px;
}

.overlay-text {
  font-size: 13px;
  font-weight: 600;
  color: white;
}

/* C. Properties Section */
.properties-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.property-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-orange);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.property-input,
.property-textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  outline: none;
  transition: all 0.2s ease;
  resize: none;
}

.property-input:focus,
.property-textarea:focus {
  border-color: var(--primary-blue);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.property-input::placeholder,
.property-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.property-input[readonly] {
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.property-textarea {
  min-height: 128px;
  line-height: 1.6;
}

/* Link Input Group */
.link-input-group {
  display: flex;
  gap: 0;
}

.link-input-group .property-input {
  border-radius: 8px 0 0 8px;
  flex: 1;
}

.go-btn {
  padding: 0 16px;
  background: var(--accent-orange);
  border: none;
  border-radius: 0 8px 8px 0;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.go-btn:hover {
  background: #ff8c42;
}

/* D. Footer (Fixed Bottom) */
.inspector-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.3);
}

.save-btn {
  width: 100%;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #4a90e2, #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.save-btn:hover {
  background: linear-gradient(135deg, #5a9eff, #a78bfa);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.save-btn:active {
  transform: translateY(0);
}

.save-icon {
  font-size: 16px;
}

/* ===== 動畫 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 頂部面板動畫 (Inspector Horizontal Panel) */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  transform: translate(-50%, -20px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}

/* ===== 響應式設計 ===== */
@media (max-width: 1400px) {
  .nexus-dock {
    width: 300px;
  }
  
  .inspector-panel {
    width: 320px;
  }
}

@media (max-width: 1024px) {
  .nexus-dock,
  .inspector-panel {
    width: 280px;
  }
  
  .nexus-title {
    font-size: 18px;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .primary-actions {
    grid-template-columns: 1fr;
  }
}

/* ===== 星系設定面板 ===== */
.cluster-settings-panel {
  width: 480px;
  max-height: 75vh;
  padding: 24px;
  background: rgba(15, 15, 20, 0.97);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.08);
  overflow-y: auto;
}

.cluster-types-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cluster-type-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

.cluster-type-row:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.cluster-preview {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.cluster-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.cluster-action-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.cluster-action-danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.cluster-action-preset:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

/* 預設星球網格 */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.preset-planet-btn {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preset-planet-btn:hover {
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(168, 85, 247, 0.08);
  transform: scale(1.05);
}

.preset-planet-name {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}
</style>
