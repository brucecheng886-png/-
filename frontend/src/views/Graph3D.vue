<template>
  <div 
    class="graph-3d-container"
  >
    <!-- 3D 圖表容器 -->
    <div ref="graphContainer" class="graph-canvas"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { useGraphStore } from '../stores/graphStore';
import { useLayoutStore } from '../stores/layoutStore';
import { ElMessage } from 'element-plus';

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
});

// ===== State =====
const graphContainer = ref(null);
const autoRotate = ref(false);
const selectedNode = ref(null);
const highlightedNodeId = ref(null); // 當前高亮的節點 ID
let breathingInterval = null; // 呼吸燈動畫定時器

// 防抖更新鎖
const isUpdating = ref(false);

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

// 重要: 不要將 graph 實例放在 ref 中，避免 Vue Proxy
let graphInstance = null;
let animationFrameId = null;

// ===== 共享幾何體（效能關鍵：所有節點重用同一份頂點數據） =====
const sharedGeo = {
  main: new THREE.SphereGeometry(1, 16, 16),  // 降低面數 32→16（3000 節點下大幅減少 GPU 負擔）
};

// ===== Material 池化（按顏色快取共享 Material，避免 3000 次 shader 編譯） =====
const _materialPool = new Map();   // color+key → THREE.MeshStandardMaterial
const _getMaterial = (color, emissiveIntensity, opacity) => {
  const key = `${color}_${emissiveIntensity.toFixed(2)}_${opacity.toFixed(2)}`;
  if (!_materialPool.has(key)) {
    _materialPool.set(key, new THREE.MeshStandardMaterial({
      color, emissive: color,
      emissiveIntensity, metalness: 0.3, roughness: 0.4,
      transparent: true, opacity, envMapIntensity: 1.0,
    }));
  }
  return _materialPool.get(key);
};

// ===== nodeId → linkCount 索引（取代 getNodeLinks 的 O(L) 全量掃描） =====
let _linkCountIndex = new Map();   // nodeId → number
const _rebuildLinkCountIndex = (linksArr) => {
  _linkCountIndex = new Map();
  linksArr.forEach(l => {
    const src = typeof l.source === 'object' ? l.source.id : l.source;
    const tgt = typeof l.target === 'object' ? l.target.id : l.target;
    _linkCountIndex.set(src, (_linkCountIndex.get(src) || 0) + 1);
    _linkCountIndex.set(tgt, (_linkCountIndex.get(tgt) || 0) + 1);
  });
};

// 節點類型配置
const nodeTypes = [
  { type: 'Person', color: '#3b82f6', icon: '👤' },
  { type: 'Organization', color: '#8b5cf6', icon: '🏢' },
  { type: 'Location', color: '#22c55e', icon: '📍' },
  { type: 'Event', color: '#f59e0b', icon: '📅' },
  { type: 'Concept', color: '#ec4899', icon: '💡' }
];

// 圖表數據
const graphData = ref({
  nodes: [],
  links: []
});

// ===== 防抖更新函數（同 2D 模式）=====
const updateGraphData = debounce(() => {
  if (!graphInstance || isUpdating.value) return;
  
  const newNodes = graphStore.nodes;
  const newLinks = graphStore.links;
  const newAiLinks = graphStore.aiLinks;
  const isCrossGraph = graphStore.isCrossGraphMode;
  
  if (newNodes.length === 0) return;
  
  isUpdating.value = true;
  
  try {
    const nodesClone = JSON.parse(JSON.stringify(newNodes));
    let linksClone = JSON.parse(JSON.stringify(newLinks));
    
    // 🌟 跨圖譜模式：合併 AI Links
    if (isCrossGraph && newAiLinks && newAiLinks.length > 0) {
      const aiLinksClone = JSON.parse(JSON.stringify(newAiLinks));
      linksClone = [...linksClone, ...aiLinksClone];
    }
    
    graphData.value = { nodes: nodesClone, links: linksClone };
    graphInstance.graphData(graphData.value);
    
    // ⚡ 資料變更時重建效能快取（含 linkCount 索引）
    _rebuildLinkCountIndex(linksClone);
    _rebuildMaxLinksCache();
    
    graphInstance.d3ReheatSimulation();
  } finally {
    isUpdating.value = false;
  }
}, 150);

// ===== Watch: 監聽 Store 數據變更（淺層比較，同 2D 模式）=====
watch(
  () => ({
    nodeCount: graphStore.nodes.length,
    linkCount: graphStore.links.length,
    aiLinkCount: graphStore.aiLinks.length,
    crossGraphMode: graphStore.isCrossGraphMode,
    currentGraphId: graphStore.currentGraphId
  }),
  (newVal, oldVal) => {
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

// ===== Watch: 監聽節點屬性變更，即時同步（同 2D nodeVersion 模式）=====
watch(
  () => graphStore.nodeVersion,
  () => {
    if (!graphInstance || !graphData.value.nodes) return;
    const internalNodes = graphData.value.nodes;
    const storeNodes = graphStore.nodes;
    
    let hasChanges = false;
    
    for (const storeNode of storeNodes) {
      const target = internalNodes.find(n => n.id === storeNode.id);
      if (!target) continue;
      
      if (target.name !== storeNode.name || target.description !== storeNode.description ||
          target.color !== storeNode.color || target.type !== storeNode.type) {
        hasChanges = true;
      }
      
      // 同步所有視覺相關屬性
      target.name = storeNode.name;
      target.description = storeNode.description;
      target.image = storeNode.image;
      target.link = storeNode.link;
      target.color = storeNode.color;
      target.size = storeNode.size;
      target.type = storeNode.type;
    }
    
    if (hasChanges) {
      graphInstance.nodeLabel(node => node.name || node.id);
      graphInstance.refresh();
      console.log('🔄 [3D] 圖譜已即時同步節點屬性變更');
    }
  }
);

// ===== Watch: 選中節點變化時，觸發 focus-fade 效果（3D 直接修改材質）=====
watch(() => graphStore.selectedNode, (newNode) => {
  if (!graphInstance) return;
  
  const selectedId = newNode?.id;
  const graphNodes = graphInstance.graphData().nodes;
  
  // ⚡ 使用預計算鄰居快取
  _rebuildNeighborCache();
  
  // 直接修改 Three.js 物件（效能優化，不重建節點）
  graphNodes.forEach(node => {
    const obj = node.__threeObj;
    if (!obj || !obj.material) return;
    
    const isSelected = selectedId === node.id;
    let fadeAlpha = 1;
    
    if (props.focusFade && selectedId && !isSelected) {
      fadeAlpha = _neighborCache.has(node.id) ? 0.85 : 0.12;
    }
    
    // ⚡ Material 池化：切換到對應狀態的共享 material（不修改 material 屬性）
    const color = node.color || '#448aff';
    const ei = isSelected ? 0.5 : 0.15 * fadeAlpha;
    const op = 0.9 * fadeAlpha;
    obj.material = _getMaterial(color, ei, op);
    
    // 共享幾何體 radius=1，scale 即為實際大小
    const targetScale = isSelected ? 5 : 3.5;
    obj.scale.set(targetScale, targetScale, targetScale);
  });
});

// ===== Watch: 監聽主題切換（防抖處理）=====
watch(
  () => layoutStore.theme,
  debounce(() => {
    if (graphInstance) {
      graphInstance.backgroundColor(backgroundColor.value);
    }
  }, 100)
);

// ===== Watch: 監聽密度 / focusFade 變化 → 觸發重繪 =====
watch(
  () => [props.densityThreshold, props.focusFade],
  () => {
    if (graphInstance) {
      graphInstance.refresh();
    }
  }
);

// 從 Store 加載數據（已經統一使用 Store 的 fetchGraphData）
const loadGraphDataFromAPI = async () => {
  try {
    console.log('� [Graph3D] 使用 Store.fetchGraphData() 刷新數據');
    
    // 🌟 每次都重新加載以確保數據同步
    const result = await graphStore.fetchGraphData(graphStore.currentGraphId);
    
    if (result && result.nodes) {
      // 根據 group 設置顏色
      const colorMap = {
        1: '#3b82f6',  // Person - 藍色
        2: '#8b5cf6',  // Company - 紫色
        3: '#22c55e'   // Concept - 綠色
      };
      
      // 處理節點數據
      result.nodes.forEach(node => {
        node.color = colorMap[node.group] || '#f59e0b';
        // 確保有 connections 屬性
        if (!node.connections) {
          node.connections = 0;
        }
      });
      
      // 統計每個節點的連結數 — O(N+L) 取代 O(N*L)
      const connMap = new Map();
      result.links.forEach(link => {
        connMap.set(link.source, (connMap.get(link.source) || 0) + 1);
        connMap.set(link.target, (connMap.get(link.target) || 0) + 1);
      });
      result.nodes.forEach(node => {
        node.connections = connMap.get(node.id) || 0;
      });
      
      return result;
    }
    
    throw new Error('API 返回數據格式錯誤');
  } catch (error) {
    console.error('❌ 從 API 加載圖譜數據失敗:', error);
    console.log('🔄 使用本地模擬數據作為後備');
    return generateGraphData(50); // 失敗時使用本地 mock data
  }
};

// 生成隨機圖表數據（作為後備方案）
const generateGraphData = (nodeCount = 50) => {
  const nodes = [];
  const links = [];
  
  // 生成節點
  for (let i = 0; i < nodeCount; i++) {
    const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    nodes.push({
      id: `node-${i}`,
      name: `${nodeType.icon} ${nodeType.type} ${i + 1}`,
      type: nodeType.type,
      color: nodeType.color,
      val: 10, // 統一節點大小
      connections: 0
    });
  }
  
  // 生成連結（每個節點平均連接 2-5 個其他節點）
  for (let i = 0; i < nodeCount; i++) {
    const connectionCount = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < connectionCount; j++) {
      const targetIndex = Math.floor(Math.random() * nodeCount);
      if (targetIndex !== i) {
        links.push({
          source: `node-${i}`,
          target: `node-${targetIndex}`,
          value: Math.random()
        });
        nodes[i].connections++;
        nodes[targetIndex].connections++;
      }
    }
  }
  
  return { nodes, links };
};

// ===== 效能快取（避免在每幀 callback 中重複計算） =====
let _neighborCache = new Set();       // 當前選中節點的鄰居 ID Set
let _maxLinksCache = 1;               // 最大連結數快取
const _emojiTextureCache = new Map(); // emoji → THREE.CanvasTexture

// 預計算鄰居快取（選中節點改變時更新）
const _rebuildNeighborCache = () => {
  _neighborCache = new Set();
  const selectedId = graphStore.selectedNode?.id;
  if (!selectedId) return;
  graphStore.links.forEach(l => {
    const src = typeof l.source === 'object' ? l.source.id : l.source;
    const tgt = typeof l.target === 'object' ? l.target.id : l.target;
    if (src === selectedId) _neighborCache.add(tgt);
    if (tgt === selectedId) _neighborCache.add(src);
  });
};

// 預計算 maxLinks（資料變化時更新）— 使用索引 O(N) 取代 O(N*L)
const _rebuildMaxLinksCache = () => {
  if (_linkCountIndex.size > 0) {
    _maxLinksCache = Math.max(1, ..._linkCountIndex.values());
  } else {
    _maxLinksCache = 1;
  }
};

// 初始化 3D 圖表
const initGraph = async () => {
  if (!graphContainer.value) return;
  
  // 確保有數據
  if (graphStore.nodes.length === 0) {
    await graphStore.fetchGraphData(graphStore.currentGraphId);
  }
  
  // 使用 structuredClone 斷開 Vue Proxy（比 JSON.parse+stringify 快 2-5x）
  const nodesClone = structuredClone(JSON.parse(JSON.stringify(graphStore.nodes)));
  
  // 🌟 跨圖譜模式：合併普通連接和 AI Link
  const allLinks = graphStore.isCrossGraphMode 
    ? [...graphStore.links, ...graphStore.aiLinks]
    : graphStore.links;
  const linksClone = JSON.parse(JSON.stringify(allLinks));
  
  graphData.value = {
    nodes: nodesClone,
    links: linksClone
  };
  
  // ⚡ 初始化效能快取（包含 linkCount 索引）
  _rebuildLinkCountIndex(linksClone);
  _rebuildNeighborCache();
  _rebuildMaxLinksCache();
  
  graphInstance = ForceGraph3D()(graphContainer.value)
    .graphData(graphData.value)
    .nodeLabel('name')
    .nodeColor(node => node.color || '#448aff')
    .nodeVal(() => 10)  // 統一節點大小
    .nodeVisibility(node => {
      // 密度過濾 — 使用 O(1) 索引查找取代 O(L) filter
      if (props.densityThreshold > 0) {
        const linkCount = _linkCountIndex.get(node.id) || 0;
        const normalised = (linkCount / _maxLinksCache) * 100;
        if (normalised < props.densityThreshold) return false;
      }
      return true;
    })
    
    // 🎨 Focus-fade 連線樣式（同 2D 模式）
    .linkColor(link => {
      const selectedId = graphStore.selectedNode?.id;
      if (props.focusFade && selectedId) {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        const related = src === selectedId || tgt === selectedId;
        if (!related) return 'rgba(255, 255, 255, 0.06)';
      }
      if (link.type === 'ai-link') return link.style?.color || '#fbbf24';
      return linkColor.value;
    })
    .linkWidth(link => {
      const selectedId = graphStore.selectedNode?.id;
      if (props.focusFade && selectedId) {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        if (src !== selectedId && tgt !== selectedId) return 0.3;
      }
      if (link.type === 'ai-link') return link.style?.width || 2;
      return 1;
    })
    .linkOpacity(0.8)
    .linkVisibility(link => {
      if (props.densityThreshold <= 0) return true;
      const src = typeof link.source === 'object' ? link.source.id : link.source;
      const tgt = typeof link.target === 'object' ? link.target.id : link.target;
      const srcCount = _linkCountIndex.get(src) || 0;
      const tgtCount = _linkCountIndex.get(tgt) || 0;
      return (srcCount / _maxLinksCache * 100 >= props.densityThreshold) && (tgtCount / _maxLinksCache * 100 >= props.densityThreshold);
    })
    // 🎨 AI Link 虛線效果（使用粒子流動模擬）
    .linkDirectionalParticles(link => {
      if (link.type === 'ai-link' && link.style?.animated) {
        return 2;  // AI Link 顯示 2 個流動粒子
      }
      return 0;  // 普通連接不顯示
    })
    .linkDirectionalParticleSpeed(link => {
      if (link.type === 'ai-link') {
        return link.style?.particleSpeed || 0.01;
      }
      return 0.005;
    })
    .linkDirectionalParticleWidth(link => {
      if (link.type === 'ai-link') {
        return 3;  // AI Link 粒子更大
      }
      return 2;
    })
    .linkDirectionalParticleColor(link => {
      if (link.type === 'ai-link') {
        return link.style?.color || '#fbbf24';
      }
      return linkColor.value;
    })
    .backgroundColor(backgroundColor.value)
    .showNavInfo(false)
    .onNodeClick(handleNodeClick)
    .onNodeHover(handleNodeHover)
    .onNodeDrag(handleNodeDrag)
    .onNodeDragEnd(handleNodeDragEnd)
    .warmupTicks(0)     // ⚡ 3000 節點: 不阻塞 UI，直接漸進渲染
    .cooldownTicks(100)  // ⚡ 100 tick 足夠穩定佈局
    .nodeThreeObject(node => {
      // 🎨 真實光照球體：PBR + Focus-fade
      // ⚡ 效能優化：共享幾何體 + 移除逐節點燈光
      
      // === Focus-fade 計算（使用預計算快取） ===
      const selectedId = graphStore.selectedNode?.id;
      const isSelected = selectedId === node.id;
      let fadeAlpha = 1;

      if (props.focusFade && selectedId && !isSelected) {
        fadeAlpha = _neighborCache.has(node.id) ? 0.85 : 0.12;
      }
      
      const nodeSize = isSelected ? 5 : 3.5;
      
      // 1. 使用共享幾何體（⚡ 關鍵：避免重複建立頂點數據）
      // ⚡ Material 池化：相同顏色+狀態共享同一個 Material
      const color = node.color || '#448aff';
      const ei = isSelected ? 0.5 : 0.15 * fadeAlpha;
      const op = 0.9 * fadeAlpha;
      const mesh = new THREE.Mesh(sharedGeo.main, _getMaterial(color, ei, op));
      mesh.scale.set(nodeSize, nodeSize, nodeSize);
      
      // 4. 添加圖標標記（使用快取的 Sprite 紋理）
      if (node.emoji) {
        if (!_emojiTextureCache.has(node.emoji)) {
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.emoji, 32, 32);
          _emojiTextureCache.set(node.emoji, new THREE.CanvasTexture(canvas));
        }
        const spriteMaterial = new THREE.SpriteMaterial({ 
          map: _emojiTextureCache.get(node.emoji),
          transparent: true,
          opacity: fadeAlpha
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(nodeSize * 1.5, nodeSize * 1.5, 1);
        sprite.position.y = 0;
        mesh.add(sprite);
      }
      
      return mesh;
    });
  
  // 🌟 添加場景光照系統（精簡版：避免 WebGL too-many-uniforms）
  const scene = graphInstance.scene();
  
  // ⚡ 先清除場景內所有燈光（含 3d-force-graph 預設燈）避免累積
  scene.children
    .filter(c => c.isLight)
    .forEach(light => scene.remove(light));
  
  // 1. 環境光（提供基礎亮度）
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  
  // 2. 主方向光（單盞源模擬太陽）
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
  mainLight.position.set(80, 100, 80);
  scene.add(mainLight);
  
  // 3. 補光（從對方向減少暗部）
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-60, -40, -60);
  scene.add(fillLight);
  
  // 設置相機位置
  graphInstance.cameraPosition({ z: 300 });
  
  // ⚡ 配置力佈局（展開節點，避免擠成一團）
  graphInstance.d3Force('charge').strength(-150);          // 排斥力
  graphInstance.d3Force('link').distance(40);               // 連結距離
  if (!graphInstance.d3Force('collide')) {
    // 3d-force-graph 預設無碰撞力，手動添加
    import('d3-force-3d').then(d3 => {
      graphInstance.d3Force('collide', d3.forceCollide().radius(8));
    });
  }
  
  // 啟用自動旋轉
  if (autoRotate.value) {
    startAutoRotate();
  }
  
  console.log('🧊 3D 圖譜已初始化:', {
    nodes: graphData.value.nodes.length,
    links: graphData.value.links.length
  });
};

// 節點拖曳開始 (降低 alphaDecay 讓節點更「重」)
const handleNodeDrag = (node) => {
  if (graphInstance) {
    graphInstance.d3Force('charge').strength(-200);
  }
};

// 節點拖曳結束 (恢復物理參數)
const handleNodeDragEnd = (node) => {
  if (graphInstance) {
    graphInstance.d3Force('charge').strength(-150);
  }
};

// 節點點擊事件 - 實現 Fly-to 聚焦效果
const handleNodeClick = (node) => {
  console.log('🔍 [3D] 選中節點:', node);
  selectedNode.value = node;
  
  if (graphStore) {
    graphStore.selectNode(node.id);
  }
  
  // === Fly-to: 平滑移動相機到節點（增強版）===
  if (graphInstance && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
    const distance = 100; // 相機距離（更近一些以便觀察）
    const nodeDistance = Math.hypot(node.x, node.y, node.z);
    const distRatio = nodeDistance === 0 ? 2 : 1 + distance / nodeDistance;
    
    // 計算相機目標位置
    const targetPosition = {
      x: node.x * distRatio,
      y: node.y * distRatio,
      z: node.z * distRatio
    };
    
    // 相機 lookAt 目標（節點中心點）
    const lookAtTarget = { x: node.x, y: node.y, z: node.z };
    
    console.log('🎬 [3D] 相機聚焦:', {
      node: node.name,
      from: 'current',
      to: targetPosition,
      lookAt: lookAtTarget
    });
    
    // 平滑移動相機，2000ms 動畫（更平滑）
    graphInstance.cameraPosition(
      targetPosition,  // 相機位置
      lookAtTarget,    // lookAt 目標（節點位置）
      2000             // 動畫持續時間
    );
    
    console.log('🎬 [3D] 相機已移動到:', node.name);
    
    // 視覺回饋：突顯選中的節點（增強脈衝效果）
    if (node.__threeObj) {
      const originalScale = node.__threeObj.scale.clone();
      
      // 第一次放大（快速）
      node.__threeObj.scale.multiplyScalar(1.8);
      
      setTimeout(() => {
        if (node.__threeObj) {
          // 回到稍大的狀態
          node.__threeObj.scale.copy(originalScale).multiplyScalar(1.3);
          
          setTimeout(() => {
            if (node.__threeObj) {
              // 最終恢復原始大小
              node.__threeObj.scale.copy(originalScale);
            }
          }, 200);
        }
      }, 150);
      
      console.log('✨ [3D] 節點視覺回饋已觸發');
    }
  }
};

// 節點懸停事件
const handleNodeHover = (node) => {
  if (graphContainer.value) {
    graphContainer.value.style.cursor = node ? 'pointer' : 'default';
  }
};

// 啟動自動旋轉
const startAutoRotate = () => {
  if (animationFrameId) return;
  
  let angle = 0;
  const rotateAnimation = () => {
    if (!autoRotate.value || !graphInstance) {
      animationFrameId = null;
      return;
    }
    
    angle += 0.3;
    const distance = 300;
    graphInstance.cameraPosition({
      x: distance * Math.sin(angle * Math.PI / 180),
      z: distance * Math.cos(angle * Math.PI / 180)
    });
    
    animationFrameId = requestAnimationFrame(rotateAnimation);
  };
  
  rotateAnimation();
};

// 停止自動旋轉
const stopAutoRotate = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// 切換自動旋轉
const toggleAutoRotate = () => {
  if (autoRotate.value) {
    startAutoRotate();
  } else {
    stopAutoRotate();
  }
};

// 重置相機
const resetCamera = () => {
  if (graphInstance) {
    graphInstance.cameraPosition({ x: 0, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 1000);
    selectedNode.value = null;
  }
};

// 重新生成圖表 (改用 Store 數據)
const generateNewGraph = async () => {
  if (graphStore) {
    await graphStore.fetchGraphData(graphStore.currentGraphId);
  }
  selectedNode.value = null;
};

// 🎯 暴露給父組件的聚焦方法（供 GraphPage.vue 調用）
const focusNode = (node) => {
  console.log('🎯 [3D] 外部調用 focusNode:', node.name);
  
  // 從 graphData 中找到對應的節點（可能包含 3D 座標）
  const graphNode = graphData.value.nodes.find(n => n.id === node.id);
  
  if (!graphNode) {
    console.warn('⚠️ [3D] 節點不存在於圖表中:', node.id);
    return;
  }
  
  // 調用內部的點擊處理函數來觸發聚焦
  handleNodeClick(graphNode);
};

// 💡 高亮節點（呼吸燈效果）
const highlightNode = (nodeId) => {
  console.log('💡 [3D] 高亮節點:', nodeId);
  
  // 清除之前的高亮
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  
  highlightedNodeId.value = nodeId;
  
  // 找到目標節點
  const targetNode = graphData.value.nodes.find(n => n.id === nodeId);
  if (!targetNode) {
    console.warn('⚠️ [3D] 未找到節點:', nodeId);
    return;
  }
  
  // 呼吸燈效果：周期性改變大小
  let scale = 1.0;
  let growing = true;
  
  breathingInterval = setInterval(() => {
    if (growing) {
      scale += 0.05;
      if (scale >= 1.5) growing = false;
    } else {
      scale -= 0.05;
      if (scale <= 1.0) growing = true;
    }
    
    // 更新節點大小
    if (graphInstance && targetNode) {
      // 使用 Three.js 直接操作節點對象
      const nodeObject = graphInstance.scene().children.find(
        child => child.userData && child.userData.nodeId === nodeId
      );
      
      if (nodeObject) {
        nodeObject.scale.set(scale, scale, scale);
      }
    }
  }, 50); // 每 50ms 更新一次
  
  // 鏡頭追蹤目標節點
  if (graphInstance && targetNode.x !== undefined) {
    const distance = 150;
    graphInstance.cameraPosition(
      { x: targetNode.x, y: targetNode.y, z: targetNode.z + distance },
      targetNode,
      1000
    );
  }
};

// 取消高亮
const unhighlightNode = () => {
  console.log('🔲 [3D] 取消高亮');
  
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  
  // 恢復節點大小
  if (highlightedNodeId.value && graphInstance) {
    const nodeId = highlightedNodeId.value;
    const nodeObject = graphInstance.scene().children.find(
      child => child.userData && child.userData.nodeId === nodeId
    );
    
    if (nodeObject) {
      nodeObject.scale.set(1, 1, 1);
    }
  }
  
  highlightedNodeId.value = null;
};

// ===== 縮放控制方法（同 2D 暴露介面）=====
const resetView = () => {
  if (graphInstance) {
    graphInstance.cameraPosition({ x: 0, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 1000);
    selectedNode.value = null;
  }
};

const zoomIn = () => {
  if (graphInstance) {
    const cam = graphInstance.camera();
    const pos = cam.position;
    const ratio = 0.7; // 放大（拉近）
    graphInstance.cameraPosition(
      { x: pos.x * ratio, y: pos.y * ratio, z: pos.z * ratio },
      { x: 0, y: 0, z: 0 },
      300
    );
  }
};

const zoomOut = () => {
  if (graphInstance) {
    const cam = graphInstance.camera();
    const pos = cam.position;
    const ratio = 1.4; // 縮小（拉遠）
    graphInstance.cameraPosition(
      { x: pos.x * ratio, y: pos.y * ratio, z: pos.z * ratio },
      { x: 0, y: 0, z: 0 },
      300
    );
  }
};

const zoomToFit = () => {
  if (graphInstance) {
    graphInstance.zoomToFit(800);
  }
};

const getZoom = () => {
  if (!graphInstance) return 1;
  return graphInstance.camera().position.length();
};

// 暴露方法給父組件
defineExpose({
  focusNode,
  highlightNode,
  unhighlightNode,
  resetCamera,
  resetView,
  zoomIn,
  zoomOut,
  zoomToFit,
  getZoom,
  generateNewGraph
});

// 防抖的視窗大小調整處理（頂層定義以便清理）
const handleResize = debounce(() => {
  if (graphInstance && graphContainer.value) {
    const width = graphContainer.value.offsetWidth;
    const height = graphContainer.value.offsetHeight;
    graphInstance.width(width).height(height);
  }
}, 200);

// 組件掛載
onMounted(async () => {
  await initGraph();
  
  // 等待下一幀後強制鏡頭置中
  setTimeout(() => {
    if (graphInstance) {
      graphInstance.cameraPosition({ x: 0, y: 0, z: 200 }, { x: 0, y: 0, z: 0 }, 1000);
    }
  }, 500);
  
  // 監聽視窗大小變化（防抖處理）
  window.addEventListener('resize', handleResize);
});

// 組件卸載
onUnmounted(() => {
  // 移除事件監聽
  window.removeEventListener('resize', handleResize);
  
  // 取消防抖更新
  updateGraphData.cancel();
  
  // 停止自動旋轉
  stopAutoRotate();
  
  // 清理呼吸燈定時器
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  
  // 清理圖譜實例
  if (graphInstance) {
    graphInstance._destructor();
    graphInstance = null;
  }
  
  // ⚡ 釋放共享幾何體 & 紋理快取 & Material 池
  Object.values(sharedGeo).forEach(g => g.dispose());
  _emojiTextureCache.forEach(t => t.dispose());
  _emojiTextureCache.clear();
  _materialPool.forEach(m => m.dispose());
  _materialPool.clear();
  _linkCountIndex.clear();
});
</script>

<style scoped>
.graph-3d-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #0a0e27;
}

.graph-canvas {
  width: 100%;
  height: 100%;
}

/* 3D 節點標籤樣式 */
:deep(.node-label-3d) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

:deep(.node-label-3d:hover) {
  transform: scale(1.1);
}
</style>

