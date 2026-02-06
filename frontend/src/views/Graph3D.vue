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

// ===== Store =====
const graphStore = useGraphStore();
const layoutStore = useLayoutStore();

const graphContainer = ref(null);
const autoRotate = ref(false);
const selectedNode = ref(null);
const highlightedNodeId = ref(null); // 當前高亮的節點 ID
let breathingInterval = null; // 呼吸燈動畫定時器

// 主題相關計算屬性
const backgroundColor = computed(() => {
  return '#0a0e27';
});

const linkColor = computed(() => {
  // 強制使用白色作為一般連接線的顏色（不論深色或淺色模式）
  return 'rgba(255, 255, 255, 0.8)';
});

// 重要: 不要將 graph 實例放在 ref 中，避免 Vue Proxy
let graphInstance = null;
let animationFrameId = null;

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

// ===== Watch: 監聽 Store 數據變更（包含 aiLinks）=====
watch(
  () => [graphStore.nodes, graphStore.links, graphStore.aiLinks, graphStore.isCrossGraphMode],
  ([newNodes, newLinks, newAiLinks, isCrossGraph]) => {
    if (graphInstance && newNodes.length > 0) {
      console.log('🔄 [3D] 偵測到數據更新:', {
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
        console.log('✨ [3D] 已合併 AI Links:', aiLinksClone.length);
      }
      
      graphData.value = {
        nodes: nodesClone,
        links: linksClone
      };
      
      // 更新圖表數據
      graphInstance.graphData(graphData.value);
      
      // 重新啟動物理模擬
      graphInstance.d3ReheatSimulation();
    }
  },
  { deep: true }
);

// ===== Watch: 監聽單個節點更新（雙向同步 - 增強版） =====
watch(
  () => graphStore.nodes,
  (newNodes) => {
    if (!graphInstance || !graphData.value.nodes) return;
    
    let hasChanges = false;
    
    // 檢查是否有節點屬性被修改（例如名稱、描述）
    newNodes.forEach(storeNode => {
      const graphNode = graphData.value.nodes.find(n => n.id === storeNode.id);
      if (graphNode) {
        // 檢查是否有變化
        const nameChanged = graphNode.name !== storeNode.name;
        const descChanged = graphNode.description !== storeNode.description;
        
        if (nameChanged || descChanged) {
          hasChanges = true;
          console.log('🔄 [3D] 檢測到節點變更:', {
            id: storeNode.id,
            oldName: graphNode.name,
            newName: storeNode.name,
            nameChanged,
            descChanged
          });
        }
        
        // 更新節點屬性
        Object.assign(graphNode, {
          name: storeNode.name,
          description: storeNode.description,
          link: storeNode.link,
          type: storeNode.type,
          color: storeNode.color
        });
      }
    });
    
    if (hasChanges) {
      // 重新設置節點標籤函數以觸發重新渲染
      graphInstance.nodeLabel(node => node.name || node.id);
      
      // 強制更新圖表數據（確保渲染引擎感知變化）
      graphInstance.graphData(graphData.value);
      
      console.log('✅ [3D] 節點標籤已更新並重新渲染');
    }
  },
  { deep: true }
);

// ===== Watch: 監聽主題切換 =====
watch(
  () => layoutStore.theme,
  () => {
    if (graphInstance) {
      graphInstance
        .backgroundColor(backgroundColor.value)
        .linkColor(() => linkColor.value);
      console.log('🎨 [3D] 主題已更新:', layoutStore.theme);
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
      
      // 統計每個節點的連結數
      result.links.forEach(link => {
        const sourceNode = result.nodes.find(n => n.id === link.source);
        const targetNode = result.nodes.find(n => n.id === link.target);
        if (sourceNode) sourceNode.connections++;
        if (targetNode) targetNode.connections++;
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
      val: Math.random() * 20 + 5, // 節點大小
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

// 初始化 3D 圖表
const initGraph = async () => {
  if (!graphContainer.value) return;
  
  // 確保有數據
  if (graphStore.nodes.length === 0) {
    await graphStore.fetchGraphData(graphStore.currentGraphId);
  }
  
  // 使用深拷貝斷開 Vue Proxy
  const nodesClone = JSON.parse(JSON.stringify(graphStore.nodes));
  
  // 🌟 跨圖譜模式：合併普通連接和 AI Link
  const linksClone = graphStore.isCrossGraphMode 
    ? JSON.parse(JSON.stringify([...graphStore.links, ...graphStore.aiLinks]))
    : JSON.parse(JSON.stringify(graphStore.links));
  
  graphData.value = {
    nodes: nodesClone,
    links: linksClone
  };
  
  graphInstance = ForceGraph3D()(graphContainer.value)
    .graphData(graphData.value)
    .nodeLabel('name')
    .nodeColor(node => node.color || '#448aff')
    .nodeVal(node => node.size || 10)
    
    // 🎨 根據連接類型設置顏色
    .linkColor(link => {
    // 這裡設定顏色 (白色)
    if (graphStore.highlightLinks.has(link)) return '#ff0000'; 
    return 'rgba(255, 255, 255, 0.6)'; 
    })  // <--- 注意這裡不能有分號 ;
    .linkWidth(link => {
    // 這裡設定粗細 (被選中變粗)
    return graphStore.highlightLinks.has(link) ? 1.5 : 0.5;
    })

    // 🎨 根據連接類型設置透明度
    .linkOpacity(link => {
      if (link.type === 'ai-link') {
        return 0.8;  // AI Link 更不透明
      }
      return 0.8;  // 普通連線也提高透明度
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
    .warmupTicks(100)  // 效能優化: 預跑 100 次物理模擬
    .cooldownTicks(300)  // 效能優化: 300 tick 後自動停止
    .nodeThreeObject(node => {
      // 🎨 真實光照球體：物理基礎渲染（PBR）
      
      const nodeSize = (node.size || 10) / 2;
      
      // 1. 創建高精度球體幾何體
      const geometry = new THREE.SphereGeometry(nodeSize, 64, 64); // 提高到64分段，更平滑
      
      // 2. 使用標準材質（Standard Material - PBR 物理渲染）
      const material = new THREE.MeshStandardMaterial({
        color: node.color || '#448aff',
        emissive: node.color || '#448aff',
        emissiveIntensity: 0.1,  // 降低自發光，更自然
        metalness: 0.3,  // 金屬感（0=電介質，1=金屬）
        roughness: 0.4,  // 粗糙度（0=完全光滑鏡面，1=完全粗糙）
        transparent: true,
        opacity: 0.95,
        envMapIntensity: 1.0  // 環境貼圖強度
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // 3. 添加點光源（每個節點自帶光源，營造真實光照）
      const pointLight = new THREE.PointLight(node.color || '#448aff', 0.8, nodeSize * 4);
      pointLight.position.set(0, 0, 0);
      mesh.add(pointLight);
      
      // 4. 添加環境光反射（模擬環境光）
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      mesh.add(ambientLight);
      
      // 5. 添加細微的外發光層（Rim Light 效果）
      const glowGeometry = new THREE.SphereGeometry(nodeSize * 1.15, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: node.color || '#448aff',
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending  // 加法混合，創造發光效果
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      mesh.add(glowMesh);
      
      // 6. 添加高光反射點（模擬光澤）
      const highlightGeometry = new THREE.SphereGeometry(nodeSize * 0.3, 16, 16);
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6
      });
      const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
      highlight.position.set(nodeSize * 0.3, nodeSize * 0.3, nodeSize * 0.3);
      mesh.add(highlight);
      
      // 7. 添加圖標標記（使用 Sprite）
      if (node.emoji) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.emoji, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(nodeSize * 1.5, nodeSize * 1.5, 1);
        sprite.position.y = 0;
        mesh.add(sprite);
      }
      
      return mesh;
    });
  
  // 🌟 添加場景光照系統（真實光照環境）
  const scene = graphInstance.scene();
  
  // 1. 環境光（提供基礎亮度）
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  // 2. 主方向光（模擬太陽光）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 100, 100);
  scene.add(directionalLight);
  
  // 3. 補充方向光（減少陰影）
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-50, -50, -50);
  scene.add(fillLight);
  
  // 4. 半球光（天空和地面的顏色漸變）
  const hemisphereLight = new THREE.HemisphereLight(
    0x4466ff,  // 天空顏色
    0x080820,  // 地面顏色
    0.5
  );
  scene.add(hemisphereLight);
  
  // 設置相機位置
  graphInstance.cameraPosition({ z: 300 });
  
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
    graphInstance.d3Force('charge').strength(-120);
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

// 監聽主題變化，動態更新圖譜顏色
watch(
  () => layoutStore.theme,
  (newTheme) => {
    if (graphInstance) {
      console.log('🎨 [3D] 主題切換:', newTheme);
      graphInstance
        .backgroundColor(backgroundColor.value)
        .linkColor(() => linkColor.value);
    }
  }
);

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

// 暴露方法給父組件
defineExpose({
  focusNode,
  highlightNode,
  unhighlightNode,
  resetCamera,
  generateNewGraph
});

// 組件掛載
onMounted(async () => {
  await initGraph();
  
  // 等待下一幀後強制鏡頭置中
  setTimeout(() => {
    if (graphInstance) {
      graphInstance.cameraPosition({ x: 0, y: 0, z: 200 }, { x: 0, y: 0, z: 0 }, 1000);
      console.log('🎯 鏡頭已置中');
    }
  }, 500);
  
  // 監聽窗口大小變化
  const handleResize = () => {
    if (graphInstance && graphContainer.value) {
      const width = graphContainer.value.offsetWidth;
      const height = graphContainer.value.offsetHeight;
      graphInstance.width(width);
      graphInstance.height(height);
      console.log('📐 畫布已調整:', { width, height });
    }
  };
  window.addEventListener('resize', handleResize);
  
  // 清理函數
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});

// 組件卸載
onUnmounted(() => {
  stopAutoRotate();
  
  // 清理呼吸燈定時器
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  
  if (graph) {
    graph._destructor();
  }
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

