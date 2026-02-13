<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import ForceGraph2D from 'force-graph';
import * as d3 from 'd3-force';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';

// ===== 工具函數: 防抖 =====
const debounce = (func, wait) => {
  let timeout;
  const debounced = function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
};

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

// ===== Props =====
const props = defineProps({
  densityThreshold: { type: Number, default: 0 },   // 0~100 密度過濾
  focusFade: { type: Boolean, default: true },       // 聚焦時淡化無關節點
  clusterEnabled: { type: Boolean, default: true },  // 語義聚合叢集
  nodeSpacing: { type: Number, default: 50 },        // 0~100 節點間距（控制疏密）
});

// ===== 節點間距計算（0~100 映射到物理參數） =====
const spacingValues = computed(() => {
  const t = props.nodeSpacing / 100; // 0~1
  return {
    linkDist: 60 + t * 300,       // 60~360（連接距離）
    collideRadius: 15 + t * 40,   // 15~55（碰撞半徑）
    radialRadius: 150 + t * 500,  // 150~650（圓形布局半徑）
  };
});

// ===== State =====
const containerRef = ref(null);
// 重要: 不要將 graph 實例放在 ref 中，避免 Vue Proxy
let graphInstance = null;
let animationId = null;

// 防抖更新鎖，避免重複渲染
let isUpdating = ref(false);
let updateQueue = null;

// ===== 星系圖片系統 =====
const clusterImageMap = ref({}); // { typeName: imageUrl }
const clusterImageCache = new Map(); // typeName -> HTMLImageElement (已載入)

// 從 localStorage 載入使用者自訂的星系圖片設定
const loadClusterImageConfig = () => {
  try {
    const saved = localStorage.getItem('clusterImageConfig');
    if (saved) clusterImageMap.value = JSON.parse(saved);
  } catch (e) { /* ignore */ }
};

// 儲存設定
const saveClusterImageConfig = () => {
  localStorage.setItem('clusterImageConfig', JSON.stringify(clusterImageMap.value));
};

// 預載入圖片並快取
const preloadClusterImage = (type, url) => {
  if (!url) { clusterImageCache.delete(type); return; }
  if (clusterImageCache.has(type) && clusterImageCache.get(type).__src === url) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.__src = url;
  img.onload = () => {
    clusterImageCache.set(type, img);
    if (graphInstance) graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
  };
  img.onerror = () => { clusterImageCache.delete(type); };
  img.src = url;
};

// 設定某個類型的星系圖片
const setClusterImage = (type, url) => {
  if (url) {
    clusterImageMap.value[type] = url;
    preloadClusterImage(type, url);
  } else {
    delete clusterImageMap.value[type];
    clusterImageCache.delete(type);
  }
  saveClusterImageConfig();
  if (graphInstance) graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
};

// 取得所有叢集類型
const getClusterTypes = () => {
  if (!graphInstance) return [];
  const nodes = graphInstance.graphData().nodes;
  const typeCount = {};
  nodes.forEach(n => {
    const t = n.type || 'unknown';
    typeCount[t] = (typeCount[t] || 0) + 1;
  });
  return Object.entries(typeCount)
    .filter(([, count]) => count >= 3)
    .map(([type, count]) => ({
      type,
      count,
      image: clusterImageMap.value[type] || null,
      color: nodes.find(n => n.type === type)?.color || '#448aff'
    }));
};

// 監聽 clusterImageMap 變化，預載入所有圖片
watch(clusterImageMap, (newMap) => {
  Object.entries(newMap).forEach(([type, url]) => preloadClusterImage(type, url));
}, { deep: true, immediate: false });

// 主題相關計算屬性
const backgroundColor = computed(() => {
  return '#0a0e27';
});

const linkColor = computed(() => {
  return 'rgba(255, 255, 255, 0.8)';
});

const linkParticleColor = computed(() => {
  return 'rgba(68, 138, 255, 0.5)';
});

const labelBgColor = computed(() => {
  return 'rgba(10, 14, 39, 0.8)';
});

const labelTextColor = computed(() => {
  return '#e5e5e5';
});

// ===== 防抖更新函數 =====
const updateGraphData = debounce(() => {
  if (!graphInstance || isUpdating.value) return;
  
  const newNodes = graphStore.nodes;
  const newLinks = graphStore.links;
  const newAiLinks = graphStore.aiLinks;
  const isCrossGraph = graphStore.isCrossGraphMode;
  
  if (newNodes.length === 0) return;
  
  isUpdating.value = true;
  
  try {
    // 重要: 使用深拷貝斷開 Vue Proxy 鏈接
    const nodesClone = JSON.parse(JSON.stringify(newNodes));
    let linksClone = JSON.parse(JSON.stringify(newLinks));
    
    // 🌟 跨圖譜模式：合併 AI Links
    if (isCrossGraph && newAiLinks && newAiLinks.length > 0) {
      const aiLinksClone = JSON.parse(JSON.stringify(newAiLinks));
      linksClone = [...linksClone, ...aiLinksClone];
    }
    
    // 更新圖表數據
    graphInstance.graphData({ nodes: nodesClone, links: linksClone });
  } finally {
    isUpdating.value = false;
  }
}, 150); // 150ms 防抖延遲

// ===== Watch: 監聯 Store 數據變更（簡化版，無 deep watch）=====
watch(
  () => ({
    nodeCount: graphStore.nodes.length,
    linkCount: graphStore.links.length,
    aiLinkCount: graphStore.aiLinks.length,
    crossGraphMode: graphStore.isCrossGraphMode,
    currentGraphId: graphStore.currentGraphId
  }),
  (newVal, oldVal) => {
    // 只在實際變化時觸發更新
    if (graphInstance && (
      newVal.nodeCount !== oldVal?.nodeCount ||
      newVal.linkCount !== oldVal?.linkCount ||
      newVal.aiLinkCount !== oldVal?.aiLinkCount ||
      newVal.crossGraphMode !== oldVal?.crossGraphMode ||
      newVal.currentGraphId !== oldVal?.currentGraphId
    )) {
      updateGraphData();
    }
  }
);

// ===== Watch: 節點間距變更，即時更新物理力場 =====
watch(
  () => props.nodeSpacing,
  () => {
    if (!graphInstance) return;
    const sv = spacingValues.value;
    graphInstance
      .d3Force('link', d3.forceLink().distance(sv.linkDist).strength(0.1))
      .d3Force('collide', d3.forceCollide().radius(sv.collideRadius).strength(0.5))
      .d3Force('radial', d3.forceRadial(node => {
        const isCentralNode = graphStore.getNodeLinks(node.id).length > 10;
        return isCentralNode ? 0 : sv.radialRadius;
      }, 0, 0).strength(0.8));
    graphInstance.d3ReheatSimulation();
  }
);

// ===== Watch: 監聽節點屬性變更，即時同步圖譜渲染 =====
watch(
  () => graphStore.nodeVersion,
  () => {
    if (!graphInstance) return;
    const internalNodes = graphInstance.graphData().nodes;
    const storeNodes = graphStore.nodes;
    
    // 將 store 中變更的屬性同步到 force-graph 內部節點（保留物理位置 x/y/vx/vy）
    for (const storeNode of storeNodes) {
      const target = internalNodes.find(n => n.id === storeNode.id);
      if (!target) continue;
      // 同步所有視覺相關屬性
      target.name = storeNode.name;
      target.description = storeNode.description;
      target.image = storeNode.image;
      target.link = storeNode.link;
      target.color = storeNode.color;
      target.size = storeNode.size;
      target.type = storeNode.type;
    }
    
    // 觸發 force-graph 重新渲染（不重置物理模擬）
    graphInstance.nodeColor(graphInstance.nodeColor());
    console.log('🔄 圖譜已即時同步節點屬性變更');
  }
);

// ===== Methods =====
const initGraph = async () => {
  if (!containerRef.value) return;
  
  // ✨ Manager 会自動處理緩存，不需要手動檢查
  // 如果 Store 已有數據，Manager 会返回緩存，否則加載
  const hasData = graphStore.nodes.length > 0;
  
  // 使用深拷貝斷開 Vue Proxy
  const nodesClone = JSON.parse(JSON.stringify(graphStore.nodes));
  
  // 🌟 跨圖譜模式：合併普通連接和 AI Link
  const linksClone = graphStore.isCrossGraphMode 
    ? JSON.parse(JSON.stringify([...graphStore.links, ...graphStore.aiLinks]))
    : JSON.parse(JSON.stringify(graphStore.links));
  
  // 創建 2D Force Graph
  graphInstance = ForceGraph2D()(containerRef.value)
    .graphData({ nodes: nodesClone, links: linksClone })
    .backgroundColor(backgroundColor.value)
    .nodeLabel('name')
    .nodeColor(node => node.color || '#448aff')
    .nodeVal(() => 25)  // 統一節點大小
    .nodeVisibility(node => {
      // 密度過濾：隱藏連線數低於門檻的節點
      if (props.densityThreshold > 0) {
        const linkCount = graphStore.getNodeLinks(node.id).length;
        const maxLinks = Math.max(1, ...graphStore.nodes.map(n => graphStore.getNodeLinks(n.id).length));
        const normalised = (linkCount / maxLinks) * 100;
        if (normalised < props.densityThreshold) return false;
      }
      return true;
    })
    .nodeCanvasObject((node, ctx, globalScale) => {
      // === Focus-fade 計算 ===
      const selectedId = graphStore.selectedNode?.id;
      const isSelected = selectedId === node.id;
      let fadeAlpha = 1;

      if (props.focusFade && selectedId && !isSelected) {
        // 建立鄰居集合
        const neighborIds = new Set();
        graphStore.links.forEach(l => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          if (src === selectedId) neighborIds.add(tgt);
          if (tgt === selectedId) neighborIds.add(src);
        });
        fadeAlpha = neighborIds.has(node.id) ? 0.85 : 0.12;
      }

      ctx.globalAlpha = fadeAlpha;

      // === 語義聚合叢集 — 星球效果（縮放 < 0.8 時繪製）===
      if (props.clusterEnabled && globalScale < 0.8 && node.__clusterCenter) {
        const cx = node.__clusterCx ?? node.x;
        const cy = node.__clusterCy ?? node.y;
        // 🔧 使用完整半徑確保覆蓋所有節點
        const baseR = node.__clusterRadius || 40;
        const r = baseR; // 保持原始半徑，不縮放
        const clrBase = node.__clusterColor || node.color || '#448aff';
        const nodeType = node.type || 'unknown';
        
        // 整體透明度：< 0.4 時全顯，0.4~0.8 線性淡出
        const clusterAlpha = globalScale < 0.4 ? 1.0 : Math.max(0, 1.0 - (globalScale - 0.4) / 0.4);
        if (clusterAlpha <= 0) { ctx.globalAlpha = fadeAlpha; } else {
        ctx.save();
        ctx.globalAlpha = fadeAlpha * clusterAlpha;
        
        const cachedImg = clusterImageCache.get(nodeType);
        
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
          // ===== 自訂圖片模式 =====
          
          // 🎯 移除大範圍外層光暈，直接繪製星球
          // 圓形裁切，繪製圖片
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(cachedImg, cx - r, cy - r, r * 2, r * 2);
          
          // 邊緣暗化（立體感）
          const edgeGrad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
          edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
          edgeGrad.addColorStop(0.75, 'rgba(0,0,0,0.05)');
          edgeGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
          ctx.fillStyle = edgeGrad;
          ctx.fill();
          
          // 高光
          const hlGrad = ctx.createRadialGradient(
            cx - r * 0.3, cy - r * 0.3, 0,
            cx - r * 0.3, cy - r * 0.3, r * 0.55
          );
          hlGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
          hlGrad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
          hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = hlGrad;
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
          
          // 恢復裁切後畫光環
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = fadeAlpha * clusterAlpha;
          
          // 外圈光環（緊貼星球邊緣，無擴散）
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.strokeStyle = clrBase + '60';
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();
          
        } else {
          // ===== 預設程式化星球 =====
          
          // 🎯 移除大範圍外層光暈，直接繪製星球主體
          
          // ① 星球主體
          const bodyGrad = ctx.createRadialGradient(
            cx - r * 0.25, cy - r * 0.25, r * 0.05,
            cx, cy, r
          );
          bodyGrad.addColorStop(0, '#a8d4ff');
          bodyGrad.addColorStop(0.15, clrBase + 'ee');
          bodyGrad.addColorStop(0.5, clrBase + 'cc');
          bodyGrad.addColorStop(0.8, clrBase + '88');
          bodyGrad.addColorStop(1, clrBase + '50');
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.fillStyle = bodyGrad;
          ctx.fill();
          
          // ② 邊緣暗化
          const edgeGrad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
          edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
          edgeGrad.addColorStop(0.7, 'rgba(0,0,0,0.1)');
          edgeGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.fillStyle = edgeGrad;
          ctx.fill();
          
          // ③ 高光月牙
          const hlGrad = ctx.createRadialGradient(
            cx - r * 0.3, cy - r * 0.3, 0,
            cx - r * 0.3, cy - r * 0.3, r * 0.5
          );
          hlGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
          hlGrad.addColorStop(0.4, 'rgba(255,255,255,0.08)');
          hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.fillStyle = hlGrad;
          ctx.fill();
          
          // ④ 外圈光環（緊貼星球邊緣）
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.strokeStyle = clrBase + '60';
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();
        }
        
        // ⑤ 叢集標籤
        const clusterFont = 14 / globalScale;
        ctx.font = `bold ${clusterFont}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6 / globalScale;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(node.__clusterLabel || node.type, cx, cy - r - 10 / globalScale);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        ctx.restore();
      }
      }

      // 自定義節點渲染 (圓形 + 外框 + 動畫效果)
      const rawLabel = node.name || '';
      const maxLen = 15;
      const label = rawLabel.length > maxLen ? rawLabel.slice(0, maxLen) + '...' : rawLabel;
      // 🔧 根據縮放倍數分段調整字體大小
      let fontSize;
      if (globalScale <= 1.5) {
        fontSize = 12;
      } else if (globalScale <= 2.5) {
        fontSize = 10;
      } else if (globalScale <= 3.5) {
        fontSize = 8;
      } else {
        fontSize = 6;
      }
      
      ctx.font = `${fontSize}px 'Inter', sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);
      
      // 🎯 選中節點放大效果（低縮放時放大節點確保可見）
      const zoomBoost = globalScale < 0.5 ? 2.5 / Math.max(globalScale, 0.15) : globalScale < 1.0 ? 1.2 / globalScale : 1;
      // 🔧 統一節點大小
      const cappedSize = 5; // 固定基礎半徑
      const baseNodeSize = cappedSize * Math.min(zoomBoost, 3); // zoomBoost 也限制在 3 倍內
      const nodeSize = isSelected ? baseNodeSize * 1.8 : baseNodeSize;
      
      // 🌟 選中節點添加脈衝光暈
      if (isSelected) {
        const pulseSize = nodeSize + Math.sin(Date.now() / 300) * 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, 2 * Math.PI, false);
        ctx.fillStyle = (node.color || '#448aff') + '30';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize + 4, 0, 2 * Math.PI, false);
        ctx.strokeStyle = (node.color || '#448aff') + '60';
        ctx.lineWidth = 3 / globalScale;
        ctx.stroke();
      }
      
      // 繪製節點主體圓形
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color || '#448aff';
      ctx.fill();
      
      // 🎨 繪製外框
      if (isSelected) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3 / globalScale;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize - 2 / globalScale, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1 / globalScale;
        ctx.stroke();
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * fadeAlpha})`;
        ctx.lineWidth = 0.5 / globalScale;
        ctx.stroke();
      }
      
      // 📝 繪製標籤
      const labelFontSize = isSelected ? fontSize * 1.4 : fontSize;
      const labelOffset = nodeSize + 4;
      
      if (isSelected) {
        ctx.font = `bold ${labelFontSize}px 'Inter', sans-serif`;
        const selectedTextWidth = ctx.measureText(label).width;
        const selectedBckgDimensions = [selectedTextWidth + labelFontSize * 0.8, labelFontSize + 8];
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        
        const cornerRadius = 6;
        const rectX = node.x - selectedBckgDimensions[0] / 2;
        const rectY = node.y + labelOffset;
        const rectW = selectedBckgDimensions[0];
        const rectH = selectedBckgDimensions[1];
        
        ctx.beginPath();
        ctx.moveTo(rectX + cornerRadius, rectY);
        ctx.lineTo(rectX + rectW - cornerRadius, rectY);
        ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + cornerRadius);
        ctx.lineTo(rectX + rectW, rectY + rectH - cornerRadius);
        ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - cornerRadius, rectY + rectH);
        ctx.lineTo(rectX + cornerRadius, rectY + rectH);
        ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - cornerRadius);
        ctx.lineTo(rectX, rectY + cornerRadius);
        ctx.quadraticCurveTo(rectX, rectY, rectX + cornerRadius, rectY);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
        
        ctx.shadowColor = 'transparent';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(label, node.x, node.y + labelOffset + selectedBckgDimensions[1] / 2);
        
      } else if (fadeAlpha > 0.3) {
        // 🧠 智慧標籤：只在放大、hover 或鄰近選中節點時才顯示
        const isHovered = hoveredNodeId.value === node.id;
        const showLabel = isHovered || globalScale >= 1.2;
        
        if (showLabel) {
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = labelBgColor.value;
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y + labelOffset,
            bckgDimensions[0],
            bckgDimensions[1]
          );
          
          ctx.font = `${labelFontSize}px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.color || '#e5e5e5';
          ctx.fillText(label, node.x, node.y + labelOffset + labelFontSize / 2 + 2);
        }
      }

      // 重置 globalAlpha
      ctx.globalAlpha = 1;
    })
    // 🎨 Focus-fade 連線樣式
    .linkColor(link => {
      const selectedId = graphStore.selectedNode?.id;
      if (props.focusFade && selectedId) {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        const related = src === selectedId || tgt === selectedId;
        if (!related) return 'rgba(255, 255, 255, 0.06)'; // 極淡
      }
      if (link.type === 'ai-link') return link.style?.color || '#fbbf24';
      return linkColor.value;
    })
    .linkWidth(link => {
      const selectedId = graphStore.selectedNode?.id;
      if (props.focusFade && selectedId) {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        if (src !== selectedId && tgt !== selectedId) return 0.5;
      }
      if (link.type === 'ai-link') return link.style?.width || 3;
      return 4;
    })
    .linkVisibility(link => {
      if (props.densityThreshold <= 0) return true;
      const src = typeof link.source === 'object' ? link.source.id : link.source;
      const tgt = typeof link.target === 'object' ? link.target.id : link.target;
      const srcCount = graphStore.getNodeLinks(src).length;
      const tgtCount = graphStore.getNodeLinks(tgt).length;
      const maxLinks = Math.max(1, ...graphStore.nodes.map(n => graphStore.getNodeLinks(n.id).length));
      return (srcCount / maxLinks * 100 >= props.densityThreshold) && (tgtCount / maxLinks * 100 >= props.densityThreshold);
    })
    // 🎨 流動粒子（可選的視覺增強）
    .linkDirectionalParticles(link => {
      if (link.type === 'ai-link' && link.style?.animated) {
        return 2;  // AI Link 顯示流動粒子
      }
      return 0;  // 普通連接不顯示粒子，避免干擾
    })
    .linkDirectionalParticleWidth(3)
    .linkDirectionalParticleColor(link => {
      if (link.type === 'ai-link') {
        return link.style?.color || '#fbbf24';
      }
      return linkParticleColor.value;
    })
    .onNodeClick(handleNodeClick)
    .onNodeHover(handleNodeHover)
    .onEngineTick(() => {
      // 每次物理模擬 tick 都重新計算叢集質心和半徑
      if (props.clusterEnabled) computeClusterCenters();
    })
    .d3Force('charge', null)  // 🔧 停用斥力，使用固定圓形布局
    .d3Force('link', d3.forceLink().distance(spacingValues.value.linkDist).strength(0.1))  // 🔧 弱連接力
    .d3Force('collide', d3.forceCollide().radius(spacingValues.value.collideRadius).strength(0.5))  // 🔧 防止節點重疊
    .d3Force('radial', d3.forceRadial(node => {
      // 🎯 圓形布局：中心節點在原點，其他節點在圓周上
      const isCentralNode = graphStore.getNodeLinks(node.id).length > 10; // 連接數多的是中心
      return isCentralNode ? 0 : spacingValues.value.radialRadius; // 中心半徑0，外圍半徑動態調整
    }, 0, 0).strength(0.8))  // 🔧 強力徑向布局
    .d3VelocityDecay(0.3)
    .warmupTicks(100)
    .cooldownTicks(200);
  
  // 初始化叢集標記
  computeClusterCenters();
};

const handleNodeClick = (node) => {
  if (node) {
    graphStore.selectNode(node.id);
    
    // 🎯 聚焦到節點（平滑縮放和置中）
    if (graphInstance && node.x !== undefined && node.y !== undefined) {
      // 獲取當前縮放級別
      const currentZoom = graphInstance.zoom();
      
      // 先置中
      graphInstance.centerAt(node.x, node.y, 800);
      
      // 再縮放（如果當前縮放小於3倍，則放大到3倍）
      const targetZoom = Math.max(currentZoom, 3);
      setTimeout(() => {
        graphInstance.zoom(targetZoom, 600);
      }, 400);
      
      // 📍 啟動重繪動畫（用於脈衝效果）
      let frameCount = 0;
      const animate = () => {
        if (frameCount < 60) { // 1秒動畫（60幀）
          graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
          frameCount++;
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }
};

const hoveredNodeId = ref(null);

const handleNodeHover = (node) => {
  hoveredNodeId.value = node ? node.id : null;
  // 改變游標樣式
  if (containerRef.value) {
    containerRef.value.style.cursor = node ? 'pointer' : 'grab';
  }
  // 觸發重繪以更新 hover 標籤
  if (graphInstance) graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
};

const startRotation = () => {
  let angle = 0;
  const distance = 300;
  
  const animate = () => {
    angle += 0.005;
    
    if (graphInstance) {
      const centerX = Math.cos(angle) * distance;
      const centerY = Math.sin(angle) * distance;
      graphInstance.centerAt(centerX, centerY, 0);
    }
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
};

const stopRotation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

// ===== Watchers =====
// 選中節點變化時，只重繪 Canvas 不重新載入數據
watch(() => graphStore.selectedNode, (newNode) => {
  if (graphInstance && newNode) {
    // 只觸發重繪，不重新加載數據
    graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
  }
});

// 監聽主題變化，動態更新圖譜顏色（防抖處理）
watch(
  () => layoutStore.theme,
  debounce((newTheme) => {
    if (graphInstance) {
      graphInstance.backgroundColor(backgroundColor.value);
      graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
    }
  }, 100)
);

// 監聽密度 / focusFade / cluster 變化 → 觸發重繪
watch(
  () => [props.densityThreshold, props.focusFade, props.clusterEnabled],
  () => {
    if (graphInstance) {
      // 重新計算叢集中心標記
      computeClusterCenters();
      // force-graph 會自動重繪 nodeCanvasObject
      graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
    }
  }
);

// 語義叢集計算：按 type 分組，找出各組質量中心
const computeClusterCenters = () => {
  if (!props.clusterEnabled) return;
  
  // 取得 force-graph 實際使用的節點（非 store 的 proxy 節點）
  const graphNodes = graphInstance ? graphInstance.graphData().nodes : graphStore.nodes;
  
  const typeGroups = {};
  graphNodes.forEach(n => {
    const t = n.type || 'unknown';
    if (!typeGroups[t]) typeGroups[t] = [];
    typeGroups[t].push(n);
  });
  // 先清除舊標記
  graphNodes.forEach(n => { n.__clusterCenter = false; });
  
  Object.entries(typeGroups).forEach(([type, members]) => {
    if (members.length < 3) return; // 太少不分群
    
    // 計算幾何質心
    let cx = 0, cy = 0, validCount = 0;
    members.forEach(m => {
      if (m.x !== undefined && m.y !== undefined) {
        cx += m.x;
        cy += m.y;
        validCount++;
      }
    });
    if (validCount === 0) return;
    cx /= validCount;
    cy /= validCount;
    
    // 找離質心最近的節點作為標記載體
    let carrier = members[0];
    let minDist = Infinity;
    members.forEach(m => {
      if (m.x === undefined) return;
      const dist = Math.hypot(m.x - cx, m.y - cy);
      if (dist < minDist) { minDist = dist; carrier = m; }
    });
    
    // 計算包圍半徑：使用最大距離來完全覆蓋所有節點
    let maxDist = 0;
    members.forEach(m => {
      if (m.x === undefined) return;
      const dist = Math.hypot(m.x - cx, m.y - cy);
      if (dist > maxDist) maxDist = dist;
    });
    const padding = 30; // 🔧 增加 padding 確保完全覆蓋
    const MAX_CLUSTER_RADIUS = 300; // 🔧 提高上限允許覆蓋更多節點
    const MIN_CLUSTER_RADIUS = 40;
    
    carrier.__clusterCenter = true;
    carrier.__clusterCx = cx;
    carrier.__clusterCy = cy;
    carrier.__clusterRadius = Math.min(MAX_CLUSTER_RADIUS, Math.max(MIN_CLUSTER_RADIUS, maxDist + padding));
    carrier.__clusterLabel = `${type} (${members.length})`;
    carrier.__clusterColor = carrier.color || '#448aff';
  });
};

// 🎯 暴露給父組件的聚焦方法（供 GraphPage.vue 調用）
const focusNode = (node) => {
  // 從 graphStore 中找到對應的節點（可能包含 2D 座標）
  const graphNode = graphStore.nodes.find(n => n.id === node.id);
  
  if (!graphNode) {
    return;
  }
  
  // 調用內部的點擊處理函數來觸發聚焦
  handleNodeClick(graphNode);
};

// 重置視圖
 const resetView = () => {
  if (graphInstance) {
    graphInstance.zoomToFit(1000);
  }
};

// 縮放控制
const zoomIn = () => {
  if (graphInstance) {
    const z = graphInstance.zoom();
    graphInstance.zoom(z * 1.4, 300);
  }
};

const zoomOut = () => {
  if (graphInstance) {
    const z = graphInstance.zoom();
    graphInstance.zoom(z / 1.4, 300);
  }
};

const getZoom = () => {
  return graphInstance ? graphInstance.zoom() : 1;
};

const zoomToFit = () => {
  if (graphInstance) {
    graphInstance.zoomToFit(800);
  }
};

// 暴露方法給父組件
defineExpose({
  focusNode,
  resetView,
  zoomIn,
  zoomOut,
  getZoom,
  zoomToFit,
  setClusterImage,
  getClusterTypes,
  clusterImageMap
});

// ===== Lifecycle =====
// 視窗大小變化處理函數（需在頂層定義以便清理）
// 防抖的視窗大小調整處理
const handleResize = debounce(() => {
  if (graphInstance && containerRef.value) {
    const width = containerRef.value.offsetWidth;
    const height = containerRef.value.offsetHeight;
    graphInstance.width(width).height(height);
  }
}, 200);

onMounted(async () => {
  loadClusterImageConfig();
  // 預載入所有已設定的圖片
  Object.entries(clusterImageMap.value).forEach(([type, url]) => preloadClusterImage(type, url));
  
  await nextTick();
  await initGraph();
  
  // 監聽視窗大小變化（防抖處理）
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 移除事件監聽
  window.removeEventListener('resize', handleResize);
  
  // 取消防抖更新
  updateGraphData.cancel();
  
  // 清理圖譜實例
  stopRotation();
  if (graphInstance) {
    graphInstance._destructor();
    graphInstance = null;
  }
});
</script>

<template>
  <div 
    class="graph-2d-container"
  >
    <div ref="containerRef" class="graph-canvas"></div>
  </div>
</template>

<style scoped>
.graph-2d-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0a0e27;
}

.graph-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.graph-canvas:active {
  cursor: grabbing;
}


</style>
