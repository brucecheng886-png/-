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
});

// ===== State =====
const containerRef = ref(null);
// 重要: 不要將 graph 實例放在 ref 中，避免 Vue Proxy
let graphInstance = null;
let animationId = null;

// 防抖更新鎖，避免重複渲染
let isUpdating = ref(false);
let updateQueue = null;

// 主題相關計算屬性
const backgroundColor = computed(() => {
  return '#0a0e27';
});

const linkColor = computed(() => {
  return 'rgba(120, 200, 255, 0.85)';
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

// ===== Watch: 監聽 Store 數據變更（簡化版，無 deep watch）=====
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
    .nodeVal(node => node.size || 10)
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

      // === 語義聚合叢集氣泡（僅縮放 < 0.7 時繪製）===
      if (props.clusterEnabled && globalScale < 0.7 && node.__clusterCenter) {
        // 這個節點是叢集中心
        const r = node.__clusterRadius || 40;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = (node.color || '#448aff') + '15';
        ctx.fill();
        ctx.strokeStyle = (node.color || '#448aff') + '30';
        ctx.lineWidth = 1.5 / globalScale;
        ctx.setLineDash([4 / globalScale, 4 / globalScale]);
        ctx.stroke();
        ctx.setLineDash([]);
        // 叢集標籤
        const clusterFont = 14 / globalScale;
        ctx.font = `bold ${clusterFont}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = (node.color || '#448aff') + 'aa';
        ctx.fillText(node.__clusterLabel || node.type, node.x, node.y - r - 6 / globalScale);
      }

      // 自定義節點渲染 (圓形 + 外框 + 動畫效果)
      const label = node.name;
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
      
      // 🎯 選中節點放大效果
      const baseNodeSize = Math.sqrt(node.size || 10) * 1.5;
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
        if (!related) return 'rgba(120, 200, 255, 0.06)'; // 極淡
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
    .d3Force('charge', d3.forceManyBody().strength(-800))
    .d3Force('link', d3.forceLink().distance(200))
    .d3Force('collide', d3.forceCollide().radius(node => Math.sqrt(node.size || 10) * 3 + 20).strength(0.7))
    .d3VelocityDecay(0.3)
    .warmupTicks(100)  // 效能優化: 預跑 100 次物理模擬
    .cooldownTicks(300);  // 效能優化: 300 tick 後自動停止
  
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
  const typeGroups = {};
  graphStore.nodes.forEach(n => {
    const t = n.type || 'unknown';
    if (!typeGroups[t]) typeGroups[t] = [];
    typeGroups[t].push(n);
  });
  // 先清除舊標記
  graphStore.nodes.forEach(n => { n.__clusterCenter = false; });
  
  Object.entries(typeGroups).forEach(([type, members]) => {
    if (members.length < 3) return; // 太少不分群
    // 找中心：取連線數最多的節點
    let center = members[0];
    let maxLinks = 0;
    members.forEach(m => {
      const lc = graphStore.getNodeLinks(m.id).length;
      if (lc > maxLinks) { maxLinks = lc; center = m; }
    });
    center.__clusterCenter = true;
    center.__clusterRadius = Math.max(30, Math.sqrt(members.length) * 25);
    center.__clusterLabel = `${type} (${members.length})`;
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
  zoomToFit
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
    
    <!-- 節點詳情卡片 -->
    <transition name="slide-up">
      <div v-if="graphStore.selectedNode" class="node-detail-card">
        <div class="card-header">
          <div class="node-type" :style="{ color: graphStore.selectedNode.color }">
            {{ graphStore.selectedNode.type }}
          </div>
          <button class="close-btn" @click="graphStore.clearSelection()">✕</button>
        </div>
        <h3 class="node-name">{{ graphStore.selectedNode.name }}</h3>
        <p class="node-description">{{ graphStore.selectedNode.description }}</p>
        
        <!-- 額外資訊 -->
        <div class="node-meta">
          <div class="meta-item" v-if="graphStore.selectedNode.status">
            <span class="meta-label">狀態:</span>
            <span class="meta-value">{{ graphStore.selectedNode.status }}</span>
          </div>
          <div class="meta-item" v-if="graphStore.selectedNode.date">
            <span class="meta-label">日期:</span>
            <span class="meta-value">{{ graphStore.selectedNode.date }}</span>
          </div>
        </div>
        
        <!-- 連線統計 -->
        <div class="connections-info">
          <span class="connections-label">🔗 連線數量:</span>
          <span class="connections-count">{{ graphStore.getNodeLinks(graphStore.selectedNode.id).length }}</span>
        </div>
      </div>
    </transition>
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

/* ===== 節點詳情卡片 ===== */
.node-detail-card {
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 320px;
  background: rgba(17, 17, 17, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.node-type {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.9;
}

.close-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.close-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-focus);
  color: var(--text-primary);
}

.node-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.node-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.node-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.meta-label {
  color: var(--text-tertiary);
  font-weight: 500;
}

.meta-value {
  color: var(--text-primary);
  font-weight: 600;
}

.connections-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  border-radius: 8px;
  font-size: 12px;
}

.connections-label {
  color: var(--text-secondary);
}

.connections-count {
  color: var(--primary-blue);
  font-weight: 600;
  font-family: 'Consolas', monospace;
}

/* ===== 動畫 ===== */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* ===== 響應式 ===== */
@media (max-width: 768px) {
  .node-detail-card {
    left: 12px;
    right: 12px;
    width: auto;
    bottom: 12px;
  }
}
</style>
