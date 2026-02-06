import { _ as _export_sfc, a as useLayoutStore } from "./index-DDdIzyMR.js";
import { E as ElMessage } from "./element-plus-DavumCtP.js";
import { r as ref, j as onMounted, Z as onUnmounted, y as openBlock, D as createElementBlock, G as createBaseVNode, U as toDisplayString, H as normalizeStyle, M as Fragment, a6 as renderList, I as normalizeClass, az as createStaticVNode, E as createVNode } from "./vue-vendor-rpbpBucb.js";
const _hoisted_1$1 = { class: "dashboard-panel" };
const _hoisted_2$1 = { class: "dashboard-grid" };
const _hoisted_3 = { class: "panel-section system-status large" };
const _hoisted_4 = { class: "status-content" };
const _hoisted_5 = { class: "metric-item" };
const _hoisted_6 = { class: "metric-header" };
const _hoisted_7 = { class: "metric-value" };
const _hoisted_8 = { class: "progress-bar" };
const _hoisted_9 = { class: "history-chart" };
const _hoisted_10 = ["title"];
const _hoisted_11 = { class: "metric-item" };
const _hoisted_12 = { class: "metric-header" };
const _hoisted_13 = { class: "metric-value" };
const _hoisted_14 = { class: "progress-bar" };
const _hoisted_15 = { class: "history-chart" };
const _hoisted_16 = ["title"];
const _hoisted_17 = { class: "service-status" };
const _hoisted_18 = ["onClick", "title"];
const _hoisted_19 = { class: "service-name" };
const _hoisted_20 = { class: "service-label" };
const _hoisted_21 = { class: "panel-section quick-shortcuts" };
const _hoisted_22 = { class: "shortcuts-grid" };
const _hoisted_23 = ["onClick"];
const _hoisted_24 = { class: "shortcut-icon" };
const _hoisted_25 = { class: "shortcut-label" };
const _hoisted_26 = { class: "shortcut-sublabel" };
const _sfc_main$1 = {
  __name: "DashboardPanel",
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  emits: ["open-terminal"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const layoutStore = useLayoutStore();
    const systemMetrics = ref({
      cpu: 23,
      memory: 45
    });
    const cpuHistory = ref(Array(20).fill(0).map(() => Math.random() * 60 + 20));
    const memHistory = ref(Array(20).fill(0).map(() => Math.random() * 50 + 30));
    const shortcuts = ref([
      {
        id: 1,
        icon: "💻",
        label: "打開終端",
        sublabel: "TERMINAL",
        action: "openTerminal",
        style: "warning"
      },
      {
        id: 2,
        icon: "💾",
        label: "匯出報告",
        sublabel: "EXPORT",
        action: "exportReport",
        style: "info"
      },
      {
        id: 3,
        icon: "🖥️",
        label: "視圖設定",
        sublabel: "LAYOUT",
        action: "viewSettings",
        style: "neutral"
      },
      {
        id: 4,
        icon: "🔄",
        label: "重啟服務",
        sublabel: "RESTART",
        action: "restartServices",
        style: "danger"
      }
    ]);
    const services = ref([
      { name: "Docker", status: "RUNNING", online: true },
      { name: "Dify", status: "ONLINE", online: true },
      { name: "RAGFlow", status: "ONLINE", online: true }
    ]);
    let metricsInterval = null;
    const handleShortcut = (action) => {
      switch (action) {
        case "openTerminal":
          layoutStore.openTerminal("", "~");
          break;
        case "exportReport":
          ElMessage.success("💾 系統報告匯出中...");
          console.log("📊 匯出系統報告...");
          break;
        case "viewSettings":
          ElMessage.info("🖥️ 視圖設定面板 (待實現)");
          console.log("⚙️ 打開視圖設定...");
          break;
        case "restartServices":
          ElMessage.warning({
            message: "🔄 重啟所有服務...",
            duration: 2e3
          });
          setTimeout(() => {
            ElMessage.success("✅ 服務已重啟");
          }, 2e3);
          break;
      }
    };
    const handleServiceClick = (serviceName) => {
      ElMessage({
        message: `🔌 連接到 ${serviceName} 服務...`,
        type: "info",
        duration: 2e3
      });
      emit("open-terminal", serviceName.toLowerCase());
      layoutStore.openTerminal(`# 連接到 ${serviceName}`, "~");
    };
    const handleExpand = () => {
      ElMessage.info("⛶ 全螢幕視圖 (開發中)");
      console.log("🖥️ 展開 Dashboard 面板...");
    };
    const updateMetrics = () => {
      const cpuDelta = (Math.random() - 0.5) * 10;
      const memoryDelta = (Math.random() - 0.5) * 8;
      systemMetrics.value.cpu = Math.max(10, Math.min(80, systemMetrics.value.cpu + cpuDelta));
      systemMetrics.value.memory = Math.max(35, Math.min(75, systemMetrics.value.memory + memoryDelta));
      systemMetrics.value.cpu = Math.round(systemMetrics.value.cpu);
      systemMetrics.value.memory = Math.round(systemMetrics.value.memory);
      cpuHistory.value.shift();
      cpuHistory.value.push(systemMetrics.value.cpu);
      memHistory.value.shift();
      memHistory.value.push(systemMetrics.value.memory);
    };
    onMounted(() => {
      console.log("📊 Dashboard 面板已載入");
      metricsInterval = setInterval(updateMetrics, 3e3);
    });
    onUnmounted(() => {
      if (metricsInterval) {
        clearInterval(metricsInterval);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("div", { class: "section-header" }, [
              _cache[1] || (_cache[1] = createBaseVNode("span", { class: "header-icon" }, "💻", -1)),
              _cache[2] || (_cache[2] = createBaseVNode("h3", { class: "section-title" }, "電腦資訊", -1)),
              createBaseVNode("button", {
                class: "expand-btn",
                onClick: handleExpand,
                title: "展開視圖"
              }, [..._cache[0] || (_cache[0] = [
                createBaseVNode("span", { class: "expand-icon" }, "⛶", -1)
              ])])
            ]),
            createBaseVNode("div", _hoisted_4, [
              createBaseVNode("div", _hoisted_5, [
                createBaseVNode("div", _hoisted_6, [
                  _cache[3] || (_cache[3] = createBaseVNode("span", { class: "metric-label" }, "CPU USAGE", -1)),
                  createBaseVNode("span", _hoisted_7, toDisplayString(systemMetrics.value.cpu) + "%", 1)
                ]),
                createBaseVNode("div", _hoisted_8, [
                  createBaseVNode("div", {
                    class: "progress-fill cpu",
                    style: normalizeStyle({ width: systemMetrics.value.cpu + "%" })
                  }, null, 4)
                ]),
                createBaseVNode("div", _hoisted_9, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(cpuHistory.value, (value, index) => {
                    return openBlock(), createElementBlock("div", {
                      key: "cpu-" + index,
                      class: "history-bar cpu",
                      style: normalizeStyle({ height: value + "%" }),
                      title: `${Math.round(value)}%`
                    }, null, 12, _hoisted_10);
                  }), 128))
                ])
              ]),
              createBaseVNode("div", _hoisted_11, [
                createBaseVNode("div", _hoisted_12, [
                  _cache[4] || (_cache[4] = createBaseVNode("span", { class: "metric-label" }, "MEMORY USAGE", -1)),
                  createBaseVNode("span", _hoisted_13, toDisplayString(systemMetrics.value.memory) + "%", 1)
                ]),
                createBaseVNode("div", _hoisted_14, [
                  createBaseVNode("div", {
                    class: "progress-fill memory",
                    style: normalizeStyle({ width: systemMetrics.value.memory + "%" })
                  }, null, 4)
                ]),
                createBaseVNode("div", _hoisted_15, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(memHistory.value, (value, index) => {
                    return openBlock(), createElementBlock("div", {
                      key: "mem-" + index,
                      class: "history-bar memory",
                      style: normalizeStyle({ height: value + "%" }),
                      title: `${Math.round(value)}%`
                    }, null, 12, _hoisted_16);
                  }), 128))
                ])
              ]),
              createBaseVNode("div", _hoisted_17, [
                _cache[6] || (_cache[6] = createBaseVNode("div", { class: "service-header" }, [
                  createBaseVNode("span", { class: "service-header-icon" }, "🔌"),
                  createBaseVNode("span", { class: "service-header-text" }, "SERVICES STATUS")
                ], -1)),
                (openBlock(true), createElementBlock(Fragment, null, renderList(services.value, (service) => {
                  return openBlock(), createElementBlock("button", {
                    key: service.name,
                    class: "service-item clickable",
                    onClick: ($event) => handleServiceClick(service.name),
                    title: `點擊連接到 ${service.name}`
                  }, [
                    createBaseVNode("span", {
                      class: normalizeClass(["service-dot", { online: service.online }])
                    }, null, 2),
                    createBaseVNode("span", _hoisted_19, toDisplayString(service.name), 1),
                    createBaseVNode("span", _hoisted_20, toDisplayString(service.status), 1),
                    _cache[5] || (_cache[5] = createBaseVNode("span", { class: "service-hover-icon" }, "🔌", -1))
                  ], 8, _hoisted_18);
                }), 128))
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_21, [
            _cache[8] || (_cache[8] = createBaseVNode("div", { class: "section-header" }, [
              createBaseVNode("span", { class: "header-icon" }, "⚡"),
              createBaseVNode("h3", { class: "section-title" }, "QUICK ACCESS")
            ], -1)),
            createBaseVNode("div", _hoisted_22, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(shortcuts.value, (shortcut) => {
                return openBlock(), createElementBlock("button", {
                  key: shortcut.id,
                  class: normalizeClass(["shortcut-btn", shortcut.style]),
                  onClick: ($event) => handleShortcut(shortcut.action)
                }, [
                  createBaseVNode("div", _hoisted_24, toDisplayString(shortcut.icon), 1),
                  createBaseVNode("div", _hoisted_25, toDisplayString(shortcut.label), 1),
                  createBaseVNode("div", _hoisted_26, toDisplayString(shortcut.sublabel), 1),
                  _cache[7] || (_cache[7] = createBaseVNode("div", { class: "shortcut-glow" }, null, -1))
                ], 10, _hoisted_23);
              }), 128))
            ])
          ])
        ])
      ]);
    };
  }
};
const DashboardPanel = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-b9c6f1bd"]]);
const _hoisted_1 = { class: "monitor-page" };
const _hoisted_2 = { class: "monitor-container" };
const _sfc_main = {
  __name: "SystemMonitorPage",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[0] || (_cache[0] = createStaticVNode('<div class="page-header" data-v-3f7df4e2><div class="header-accent" data-v-3f7df4e2></div><div class="header-content" data-v-3f7df4e2><h1 class="page-title" data-v-3f7df4e2><span class="title-icon" data-v-3f7df4e2>💻</span> 電腦資訊監控 </h1><p class="page-subtitle" data-v-3f7df4e2>即時系統效能與服務狀態監控</p></div></div>', 1)),
        createBaseVNode("div", _hoisted_2, [
          createVNode(DashboardPanel)
        ])
      ]);
    };
  }
};
const SystemMonitorPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3f7df4e2"]]);
export {
  SystemMonitorPage as default
};
