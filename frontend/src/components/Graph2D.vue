<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import ForceGraph2D from 'force-graph';
import * as d3 from 'd3-force';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

// ===== State =====
const containerRef = ref(null);
// 重要: 不要將 graph 實例放在 ref 中，避免 Vue Proxy
let graphInstance = null;
let animationId = null;

// 主題相關計算屬性
const backgroundColor = computed(() => {
  return layoutStore.theme === 'dark' ? '#0a0a0a' : '#F5F7F9';
});

const linkColor = computed(() => {
  // 深色模式：使用更亮的青藍色，透明度提高到 0.85（更明顯）
  // 淺色模式：深灰色，透明度 0.5
  return layoutStore.theme === 'dark' ? 'rgba(120, 200, 255, 0.85)' : 'rgba(50, 50, 50, 0.5)';
});

const linkParticleColor = computed(() => {
  return layoutStore.theme === 'dark' ? 'rgba(68, 138, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
});

const labelBgColor = computed(() => {
  return layoutStore.theme === 'dark' ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.9)';
});

const labelTextColor = computed(() => {
  return layoutStore.theme === 'dark' ? '#e5e5e5' : '#1e293b';
});

// ===== Watch: 監聽 Store 數據變更（包含 aiLinks）=====
watch(
  () => [graphStore.nodes, graphStore.links, graphStore.aiLinks, graphStore.isCrossGraphMode],
  ([newNodes, newLinks, newAiLinks, isCrossGraph]) => {
    if (graphInstance && newNodes.length > 0) {
      console.log('🔄 [2D] 偵測到數據更新:', {
        nodes: newNodes.length,
        links: newLinks.length,
        aiLinks: newAiLinks?.length || 0,
        crossGraphMode: isCrossGraph
      });
      
      // 重要: 使用深拷貝斷開 Vue Proxy 鏈接
      const nodesClone = JSON.parse(JSON.stringify(newNodes));
      let linksClone = JSON.parse(JSON.stringify(newLinks));
      
      // 🌟 跨圖譜模式：合併 AI Links
      if (isCrossGraph && newAiLinks && newAiLinks.length > 0) {
        const aiLinksClone = JSON.parse(JSON.stringify(newAiLinks));
        linksClone = [...linksClone, ...aiLinksClone];
        console.log('✨ [2D] 已合併 AI Links:', aiLinksClone.length);
      }
      
      // 更新圖表數據
      graphInstance.graphData({ nodes: nodesClone, links: linksClone });
    }
  },
  { deep: true }
);

// ===== Methods =====
const initGraph = async () => {
  if (!containerRef.value) return;
  
  // 確保有數據
  if (graphStore.nodes.length === 0) {
    await graphStore.fetchGraphData();
  }
  
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
    .nodeCanvasObject((node, ctx, globalScale) => {
      // 自定義節點渲染 (圓形 + 外框 + 動畫效果)
      const label = node.name;
      // 🔧 根據縮放倍數分段調整字體大小
      let fontSize;
      if (globalScale <= 1.5) {
        fontSize = 12;  // 正常/縮小：12px
      } else if (globalScale <= 2.5) {
        fontSize = 10;  // 放大 2 倍：10px
      } else if (globalScale <= 3.5) {
        fontSize = 8;   // 放大 3 倍：8px
      } else {
        fontSize = 6;   // 放大 4 倍以上：6px
      }
      
      ctx.font = `${fontSize}px 'Inter', sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);
      
      // 判斷是否為選中節點
      const isSelected = graphStore.selectedNode?.id === node.id;
      
      // 🎯 選中節點放大效果
      const baseNodeSize = Math.sqrt(node.size || 10) * 1.5;
      const nodeSize = isSelected ? baseNodeSize * 1.8 : baseNodeSize;
      
      // 🌟 選中節點添加脈衝光暈
      if (isSelected) {
        const pulseSize = nodeSize + Math.sin(Date.now() / 300) * 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, 2 * Math.PI, false);
        ctx.fillStyle = (node.color || '#448aff') + '30'; // 30% 透明度
        ctx.fill();
        
        // 外圈光暈
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize + 4, 0, 2 * Math.PI, false);
        ctx.strokeStyle = (node.color || '#448aff') + '60'; // 60% 透明度
        ctx.lineWidth = 3 / globalScale;
        ctx.stroke();
      }
      
      // 繪製節點主體圓形
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color || '#448aff';
      ctx.fill();
      
      // 🎨 繪製外框 (選中狀態更粗更亮)
      if (isSelected) {
        // 選中：金色粗框
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3 / globalScale;
        ctx.stroke();
        
        // 內圈白色細框
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize - 2 / globalScale, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1 / globalScale;
        ctx.stroke();
      } else {
        // 未選中：淡邊框
        ctx.strokeStyle = layoutStore.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5 / globalScale;
        ctx.stroke();
      }
      
      // 📝 繪製標籤（選中節點的標籤更大更明顯）
      const labelFontSize = isSelected ? fontSize * 1.4 : fontSize;
      const labelOffset = nodeSize + 4;
      
      if (isSelected) {
        // 選中節點：增強標籤顯示
        // 計算新的文字寬度（因為字體變大了）
        ctx.font = `bold ${labelFontSize}px 'Inter', sans-serif`;
        const selectedTextWidth = ctx.measureText(label).width;
        const selectedBckgDimensions = [selectedTextWidth + labelFontSize * 0.8, labelFontSize + 8];
        
        // 外層陰影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        
        // 標籤背景（白色底，高對比）
        ctx.fillStyle = layoutStore.theme === 'dark' 
          ? 'rgba(255, 255, 255, 0.95)'  // 深色模式：亮白色底
          : 'rgba(255, 255, 255, 0.98)';  // 淺色模式：純白底
        
        // 繪製圓角矩形背景
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
        
        // 邊框（金色）
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
        
        // 標籤文字（深色，高對比）
        ctx.shadowColor = 'transparent';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1e293b';  // 深色文字
        ctx.fillText(label, node.x, node.y + labelOffset + selectedBckgDimensions[1] / 2);
        
      } else {
        // 未選中節點：普通顯示
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = labelBgColor.value;
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y + labelOffset,
          bckgDimensions[0],
          bckgDimensions[1]
        );
        
        // 標籤文字
        ctx.font = `${labelFontSize}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = layoutStore.theme === 'dark' ? (node.color || '#e5e5e5') : '#1e293b';
        ctx.fillText(label, node.x, node.y + labelOffset + labelFontSize / 2 + 2);
      }
    })
    // 🎨 根據連接類型設置顏色和樣式
    .linkColor(link => {
      if (link.type === 'ai-link') {
        return link.style?.color || '#fbbf24';  // AI Link 金色
      }
      return linkColor.value;  // 普通連接
    })
    // 🎨 根據連接類型設置寬度（已優化：線條更粗更明顯）
    .linkWidth(link => {
      if (link.type === 'ai-link') {
        return link.style?.width || 3;  // AI 連線：3px
      }
      return 4;  // 普通連線：4px（更粗更明顯）
    })
    // 🎨 設置線條透明度
    .linkOpacity(0.85)  // 增加不透明度讓線條更明顯
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
    .d3Force('charge', d3.forceManyBody().strength(-300))
    .d3Force('link', d3.forceLink().distance(100))
    .d3VelocityDecay(0.3)
    .warmupTicks(100)  // 效能優化: 預跑 100 次物理模擬
    .cooldownTicks(300);  // 效能優化: 300 tick 後自動停止
  
  console.log('📊 2D 圖譜已初始化:', {
    nodes: graphStore.nodes.length,
    links: graphStore.links.length
  });
};

const handleNodeClick = (node) => {
  if (node) {
    graphStore.selectNode(node.id);
    console.log('🔍 [2D] 選中節點:', node.name);
    
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
      
      console.log('🎯 [2D] 節點已聚焦:', node.name, '縮放:', targetZoom);
      
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

const handleNodeHover = (node) => {
  // 改變游標樣式
  if (containerRef.value) {
    containerRef.value.style.cursor = node ? 'pointer' : 'grab';
  }
};

const startRotation = () => {
  let angle = 0;
  const distance = 300;
  
  const animate = () => {
    angle += 0.005;
    
    if (graph) {
      const centerX = Math.cos(angle) * distance;
      const centerY = Math.sin(angle) * distance;
      graph.centerAt(centerX, centerY, 0);
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
watch(() => graphStore.selectedNode, (newNode) => {
  if (graph && newNode) {
    // 重新渲染以更新選中狀態
    graph.graphData({
      nodes: graphStore.nodes,
      links: graphStore.links
    });
  }
});

watch(() => [graphStore.nodes, graphStore.links], () => {
  if (graph) {
    graph.graphData({
      nodes: graphStore.nodes,
      links: graphStore.links
    });
  }
}, { deep: true });

// 監聽主題變化，動態更新圖譜顏色
watch(
  () => layoutStore.theme,
  (newTheme) => {
    if (graphInstance) {
      console.log('🎨 [2D] 主題切換:', newTheme);
      graphInstance.backgroundColor(backgroundColor.value);
      // 觸發重新渲染
      graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
    }
  }
);

// 🎯 暴露給父組件的聚焦方法（供 GraphPage.vue 調用）
const focusNode = (node) => {
  console.log('🎯 [2D] 外部調用 focusNode:', node.name);
  
  // 從 graphStore 中找到對應的節點（可能包含 2D 座標）
  const graphNode = graphStore.nodes.find(n => n.id === node.id);
  
  if (!graphNode) {
    console.warn('⚠️ [2D] 節點不存在於圖表中:', node.id);
    return;
  }
  
  // 調用內部的點擊處理函數來觸發聚焦
  handleNodeClick(graphNode);
};

// 重置視圖
 const resetView = () => {
  if (graphInstance) {
    graphInstance.zoomToFit(1000);
    console.log('🔄 [2D] 視圖已重置');
  }
};

// 暴露方法給父組件
defineExpose({
  focusNode,
  resetView
});

// ===== Lifecycle =====
// 視窗大小變化處理函數（需在頂層定義以便清理）
const handleResize = () => {
  if (graph && containerRef.value) {
    const width = containerRef.value.offsetWidth;
    const height = containerRef.value.offsetHeight;
    graph.width(width).height(height);
    console.log('📐 [2D] 畫布已調整:', { width, height });
  }
};

onMounted(async () => {
  await nextTick();
  await initGraph();
  
  // 監聽視窗大小變化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 移除事件監聽
  window.removeEventListener('resize', handleResize);
  
  // 清理圖譜實例
  stopRotation();
  if (graph) {
    graph._destructor();
    graph = null;
  }
});
</script>

<template>
  <div 
    class="graph-2d-container"
    :class="layoutStore.theme === 'dark' ? 'dark-theme' : 'light-theme'"
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
  transition: background 0.3s ease;
}

.graph-2d-container.dark-theme {
  background: #0a0a0a;
}

.graph-2d-container.light-theme {
  background: #F5F7F9;
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

/* 淺色模式節點詳情卡片 */
.light-theme .node-detail-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(203, 213, 225, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.light-theme .node-name {
  color: #1e293b;
}

.light-theme .node-description {
  color: #475569;
}

.light-theme .close-btn {
  color: #64748b;
}

.light-theme .close-btn:hover {
  background: rgba(226, 232, 240, 0.8);
  color: #1e293b;
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
