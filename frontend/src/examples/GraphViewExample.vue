<template>
  <div class="graph-example-container">
    <!-- 頂部控制欄 -->
    <div class="control-bar">
      <h2 class="title">知識圖譜視覺化</h2>
      
      <div class="controls">
        <!-- 實體 ID 輸入 -->
        <div class="input-group">
          <label>查詢特定實體鄰居：</label>
          <input 
            v-model="searchEntityId" 
            type="text" 
            placeholder="輸入實體 ID (留空查詢全部)"
            class="entity-input"
            @keyup.enter="loadSpecificEntity"
          />
          <button @click="loadSpecificEntity" class="btn-primary">
            🔍 查詢
          </button>
        </div>

        <!-- 重新整理按鈕 -->
        <button @click="refreshGraph" class="btn-secondary">
          🔄 重新載入
        </button>

        <!-- 適應視圖 -->
        <button @click="fitView" class="btn-secondary">
          📐 適應視圖
        </button>
      </div>
    </div>

    <!-- 圖譜視覺化區域 -->
    <div class="graph-viewport">
      <GraphView 
        ref="graphViewRef" 
        :entity-id="currentEntityId"
      />
    </div>

    <!-- 資訊顯示區 -->
    <div class="info-panel">
      <h3>使用說明</h3>
      <ul>
        <li>🖱️ <strong>拖曳畫布</strong>：按住滑鼠左鍵拖動背景</li>
        <li>🔍 <strong>縮放</strong>：使用滑鼠滾輪縮放畫布</li>
        <li>✋ <strong>移動節點</strong>：拖曳節點來調整位置</li>
        <li>👆 <strong>點擊節點</strong>：在 Console 查看節點詳細資訊</li>
        <li>🎯 <strong>懸停</strong>：將滑鼠移至節點或連線上查看高亮效果</li>
      </ul>
      
      <div class="api-info">
        <h4>API 端點</h4>
        <code>GET /api/graph/entities/{id}/neighbors</code>
        <code>POST /api/graph/query</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GraphView from '../components/GraphView.vue';

const graphViewRef = ref(null);
const searchEntityId = ref('');
const currentEntityId = ref(null);

// 載入特定實體的圖譜
const loadSpecificEntity = () => {
  if (searchEntityId.value.trim()) {
    currentEntityId.value = searchEntityId.value.trim();
    console.log('載入實體:', currentEntityId.value);
  } else {
    currentEntityId.value = null;
    console.log('載入全部圖譜資料');
  }
  
  // 觸發 GraphView 重新載入
  if (graphViewRef.value) {
    graphViewRef.value.refreshGraph(currentEntityId.value);
  }
};

// 重新整理圖譜
const refreshGraph = () => {
  if (graphViewRef.value) {
    graphViewRef.value.refreshGraph(currentEntityId.value);
    console.log('圖譜已重新載入');
  }
};

// 適應視圖
const fitView = () => {
  if (graphViewRef.value) {
    const graph = graphViewRef.value.getGraph();
    if (graph) {
      graph.fitView(40);
      console.log('視圖已調整');
    }
  }
};
</script>

<style scoped>
.graph-example-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d3748 100%);
  color: #fff;
}

/* 控制欄 */
.control-bar {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-group label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.entity-input {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  min-width: 250px;
  transition: all 0.3s;
}

.entity-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.entity-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* 按鈕樣式 */
.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* 圖譜視圖區域 */
.graph-viewport {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

/* 資訊面板 */
.info-panel {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.info-panel h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #60a5fa;
}

.info-panel h4 {
  margin: 16px 0 8px 0;
  font-size: 14px;
  color: #a78bfa;
}

.info-panel ul {
  margin: 0;
  padding-left: 20px;
}

.info-panel li {
  margin-bottom: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.api-info {
  margin-top: 12px;
}

.api-info code {
  display: block;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #60a5fa;
  margin-bottom: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 自定義滾動條 */
.info-panel::-webkit-scrollbar {
  width: 6px;
}

.info-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.info-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.info-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
