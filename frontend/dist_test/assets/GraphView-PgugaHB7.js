import { G as Graph } from "./g6-of8JZalD.js";
import { _ as _export_sfc, u as useGraphStore } from "./index-DDdIzyMR.js";
import { j as onMounted, Z as onUnmounted, y as openBlock, D as createElementBlock, G as createBaseVNode, r as ref } from "./vue-vendor-rpbpBucb.js";
import "./element-plus-DavumCtP.js";
const _hoisted_1 = { class: "graph-container" };
const _sfc_main = {
  __name: "GraphView",
  props: {
    entityId: {
      type: String,
      default: null
    }
  },
  setup(__props, { expose: __expose }) {
    const graphStore = useGraphStore();
    const graphContainer = ref(null);
    let graph = null;
    const props = __props;
    const handleResize = () => {
      if (graph && graphContainer.value) {
        const width = graphContainer.value.offsetWidth;
        const height = graphContainer.value.offsetHeight;
        graph.changeSize(width, height);
        graph.fitCenter();
      }
    };
    const loadGraphData = async () => {
      try {
        let graphData = { nodes: [], edges: [] };
        if (props.entityId) {
          console.log("📡 [GraphView] 使用 Store.fetchNeighbors()");
          const data = await graphStore.fetchNeighbors(props.entityId);
          graphData = transformBackendData(data);
        } else {
          console.log("📡 [GraphView] 使用 Store.executeCypherQuery()");
          const cypherQuery = "MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 25";
          const data = await graphStore.executeCypherQuery(cypherQuery);
          graphData = transformCypherResults(data);
        }
        return graphData;
      } catch (error) {
        console.error("❌ [GraphView] 載入圖譜資料失敗:", error);
        return {
          nodes: [
            { id: "node1", label: "企業知識庫", type: "circle" },
            { id: "node2", label: "AI 模型", type: "circle" },
            { id: "node3", label: "RAG 系統", type: "circle" }
          ],
          edges: [
            { source: "node1", target: "node2", label: "訓練" },
            { source: "node2", target: "node3", label: "支援" }
          ]
        };
      }
    };
    const transformBackendData = (data) => {
      const nodes = [];
      const edges = [];
      const nodeMap = /* @__PURE__ */ new Map();
      if (data.center) {
        const centerNode = {
          id: data.center.id || data.center.name,
          label: data.center.name,
          type: "circle",
          data: data.center
        };
        nodes.push(centerNode);
        nodeMap.set(centerNode.id, true);
      }
      if (data.neighbors && Array.isArray(data.neighbors)) {
        data.neighbors.forEach((neighbor) => {
          var _a, _b;
          const nodeId = ((_a = neighbor.node) == null ? void 0 : _a.id) || ((_b = neighbor.node) == null ? void 0 : _b.name);
          if (nodeId && !nodeMap.has(nodeId)) {
            nodes.push({
              id: nodeId,
              label: neighbor.node.name || nodeId,
              type: "circle",
              data: neighbor.node
            });
            nodeMap.set(nodeId, true);
          }
          if (neighbor.relation) {
            edges.push({
              source: data.center.id || data.center.name,
              target: nodeId,
              label: neighbor.relation.type || "關聯",
              data: neighbor.relation
            });
          }
        });
      }
      return { nodes, edges };
    };
    const transformCypherResults = (results) => {
      const nodes = [];
      const edges = [];
      const nodeMap = /* @__PURE__ */ new Map();
      if (results.results && Array.isArray(results.results)) {
        results.results.forEach((row) => {
          if (row.n) {
            const nId = row.n.id || row.n.name;
            if (!nodeMap.has(nId)) {
              nodes.push({
                id: nId,
                label: row.n.name || nId,
                type: "circle",
                data: row.n
              });
              nodeMap.set(nId, true);
            }
          }
          if (row.m) {
            const mId = row.m.id || row.m.name;
            if (!nodeMap.has(mId)) {
              nodes.push({
                id: mId,
                label: row.m.name || mId,
                type: "circle",
                data: row.m
              });
              nodeMap.set(mId, true);
            }
          }
          if (row.r && row.n && row.m) {
            edges.push({
              source: row.n.id || row.n.name,
              target: row.m.id || row.m.name,
              label: row.r.type || "關聯",
              data: row.r
            });
          }
        });
      }
      return { nodes, edges };
    };
    onMounted(async () => {
      if (!graphContainer.value) return;
      const graphData = await loadGraphData();
      graph = new Graph({
        container: graphContainer.value,
        width: graphContainer.value.offsetWidth,
        height: graphContainer.value.offsetHeight,
        // 直接傳入資料 (G6 v5 推薦方式)
        data: graphData,
        // 透明背景配合 Glassmorphism
        renderer: "canvas",
        // 佈局配置
        layout: {
          type: "force2",
          // G6 v5 使用 force2
          preset: {
            type: "concentric"
          },
          animate: true,
          preventOverlap: true,
          nodeSize: 60,
          linkDistance: 150
        },
        // 節點配置
        node: (model) => {
          return {
            id: model.id,
            data: {
              ...model,
              type: "circle-node",
              style: {
                size: 50,
                fill: "#3b82f6",
                stroke: "#60a5fa",
                lineWidth: 2,
                shadowColor: "rgba(59, 130, 246, 0.4)",
                shadowBlur: 10
              },
              labelShape: {
                text: model.label || model.id,
                fill: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                position: "center"
              }
            }
          };
        },
        // 邊配置
        edge: (model) => {
          return {
            id: `${model.source}-${model.target}`,
            source: model.source,
            target: model.target,
            data: {
              ...model,
              type: "line-edge",
              style: {
                stroke: "rgba(148, 163, 184, 0.6)",
                lineWidth: 2,
                endArrow: {
                  type: "vee",
                  fill: "rgba(148, 163, 184, 0.6)"
                }
              },
              labelShape: model.label ? {
                text: model.label,
                fill: "rgba(255, 255, 255, 0.85)",
                fontSize: 12,
                background: {
                  fill: "rgba(0, 0, 0, 0.3)",
                  padding: [4, 8],
                  radius: 4
                }
              } : void 0
            }
          };
        },
        // 行為模式
        modes: {
          default: [
            "drag-canvas",
            "zoom-canvas",
            "drag-node",
            "click-select"
          ]
        },
        // 動畫
        autoFit: "view",
        fitViewPadding: 40
      });
      graph.on("node:click", (e) => {
        const nodeData = e.itemId ? graph.getNodeData(e.itemId) : null;
        if (nodeData) {
          console.log("============ 節點詳細資訊 ============");
          console.log("節點 ID:", nodeData.id);
          console.log("節點標籤:", nodeData.label);
          console.log("完整資料:", nodeData);
          console.log("=====================================");
        }
      });
      window.addEventListener("resize", handleResize);
      setTimeout(() => {
        if (graph) {
          graph.fitView();
        }
      }, 300);
    });
    onUnmounted(() => {
      if (graph) {
        graph.destroy();
      }
      window.removeEventListener("resize", handleResize);
    });
    __expose({
      getGraph: () => graph,
      updateData: async (newData) => {
        if (graph && newData) {
          graph.updateData("node", newData.nodes || []);
          graph.updateData("edge", newData.edges || []);
          graph.layout();
          setTimeout(() => graph.fitView(), 300);
        }
      },
      // 重新載入圖譜資料（使用 Store）
      async refreshGraph(entityId = null) {
        try {
          let newData;
          if (entityId) {
            const data = await graphStore.fetchNeighbors(entityId);
            newData = transformBackendData(data);
          } else {
            const cypherQuery = "MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 25";
            const data = await graphStore.executeCypherQuery(cypherQuery);
            newData = transformCypherResults(data);
          }
          if (graph && newData) {
            graph.clear();
            graph.updateData("node", newData.nodes || []);
            graph.updateData("edge", newData.edges || []);
            graph.layout();
            setTimeout(() => graph.fitView(), 300);
          }
        } catch (error) {
          console.error("❌ [GraphView] 刷新圖譜失敗:", error);
        }
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", {
          ref_key: "graphContainer",
          ref: graphContainer,
          class: "graph-canvas"
        }, null, 512)
      ]);
    };
  }
};
const GraphView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-141e3a55"]]);
export {
  GraphView as default
};
