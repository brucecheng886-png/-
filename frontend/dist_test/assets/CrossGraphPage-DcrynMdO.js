import { j as onMounted, y as openBlock, D as createElementBlock, G as createBaseVNode, az as createStaticVNode, E as createVNode, F as withCtx, S as createTextVNode, U as toDisplayString, u as unref, M as Fragment, a6 as renderList, z as createBlock, R as createCommentVNode, c as computed, ac as resolveComponent, r as ref, ay as useRouter, I as normalizeClass, H as normalizeStyle } from "./vue-vendor-rpbpBucb.js";
import { _ as _export_sfc, u as useGraphStore, a as useLayoutStore } from "./index-DDdIzyMR.js";
import { E as ElMessage } from "./element-plus-DavumCtP.js";
const _hoisted_1 = { class: "cross-graph-page custom-scrollbar" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { class: "header-content" };
const _hoisted_4 = { class: "page-content" };
const _hoisted_5 = { class: "selection-panel" };
const _hoisted_6 = { class: "panel-header" };
const _hoisted_7 = { key: 0 };
const _hoisted_8 = { key: 1 };
const _hoisted_9 = {
  key: 0,
  class: "empty-graphs-state"
};
const _hoisted_10 = {
  key: 1,
  class: "graph-cards"
};
const _hoisted_11 = ["onClick"];
const _hoisted_12 = { class: "card-selector" };
const _hoisted_13 = {
  key: 0,
  class: "checkmark"
};
const _hoisted_14 = { class: "icon-large" };
const _hoisted_15 = { class: "card-info" };
const _hoisted_16 = { class: "card-title" };
const _hoisted_17 = { class: "card-description" };
const _hoisted_18 = { class: "card-stats" };
const _hoisted_19 = { class: "stat-item" };
const _hoisted_20 = { class: "stat-value" };
const _hoisted_21 = { class: "stat-item" };
const _hoisted_22 = { class: "stat-value" };
const _hoisted_23 = {
  key: 0,
  class: "selected-badge"
};
const _hoisted_24 = { class: "action-buttons" };
const _hoisted_25 = { class: "button-text" };
const _hoisted_26 = { class: "stats-panel" };
const _hoisted_27 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_28 = { class: "selection-count" };
const _hoisted_29 = { class: "count-number" };
const _hoisted_30 = {
  key: 1,
  class: "stats-content"
};
const _hoisted_31 = { class: "stats-grid" };
const _hoisted_32 = { class: "stat-card total" };
const _hoisted_33 = { class: "stat-info" };
const _hoisted_34 = { class: "stat-number" };
const _hoisted_35 = { class: "stat-card high" };
const _hoisted_36 = { class: "stat-info" };
const _hoisted_37 = { class: "stat-number" };
const _hoisted_38 = { class: "stat-card medium" };
const _hoisted_39 = { class: "stat-info" };
const _hoisted_40 = { class: "stat-number" };
const _hoisted_41 = { class: "stat-card average" };
const _hoisted_42 = { class: "stat-info" };
const _hoisted_43 = { class: "stat-number" };
const _hoisted_44 = { class: "loaded-graphs" };
const _hoisted_45 = { class: "loaded-list" };
const _hoisted_46 = { class: "loaded-icon" };
const _hoisted_47 = { class: "loaded-name" };
const _hoisted_48 = { class: "quick-actions" };
const _sfc_main = {
  __name: "CrossGraphPage",
  setup(__props) {
    const graphStore = useGraphStore();
    useLayoutStore();
    const router = useRouter();
    const selectedGraphs = ref([]);
    const isLoading = ref(false);
    const isSyncing = ref(false);
    const availableGraphs = computed(() => {
      console.log("🔍 當前 graphMetadataList:", graphStore.graphMetadataList);
      const realGraphs = graphStore.graphMetadataList.filter((graph) => {
        if (!graph || !graph.name) return false;
        const graphId = String(graph.id || "");
        const graphName = String(graph.name || "");
        return !graphName.includes("快照") && !graphName.includes("snapshot") && !graphId.startsWith("workspace-snapshot-");
      });
      console.log("✅ 過濾後的圖譜:", realGraphs);
      return realGraphs;
    });
    const aiLinkStats = computed(() => {
      if (!graphStore.isCrossGraphMode) return null;
      return graphStore.getAILinkStats();
    });
    const isGraphSelected = (graphId) => {
      return selectedGraphs.value.includes(graphId);
    };
    const toggleGraphSelection = (graphId) => {
      const index = selectedGraphs.value.indexOf(graphId);
      if (index > -1) {
        selectedGraphs.value.splice(index, 1);
      } else {
        if (selectedGraphs.value.length >= 2) {
          ElMessage.warning("最多同時選擇 2 個圖譜");
          return;
        }
        selectedGraphs.value.push(graphId);
      }
    };
    const loadSelectedGraphs = async () => {
      var _a;
      if (selectedGraphs.value.length < 2) {
        ElMessage.warning("請至少選擇 2 個圖譜");
        return;
      }
      isLoading.value = true;
      try {
        await graphStore.loadCrossGraphData(selectedGraphs.value);
        ElMessage.success({
          message: `✅ 成功加載 ${selectedGraphs.value.length} 個圖譜，發現 ${((_a = aiLinkStats.value) == null ? void 0 : _a.total) || 0} 個 AI Link`,
          duration: 3e3
        });
      } catch (error) {
        ElMessage.error("加載跨圖譜數據失敗: " + error.message);
      } finally {
        isLoading.value = false;
      }
    };
    const exitCrossGraphMode = () => {
      graphStore.exitCrossGraphMode();
      selectedGraphs.value = [];
      ElMessage.info("已退出跨圖譜模式");
    };
    const viewInGraph = () => {
      router.push("/graph-page");
    };
    const regenerateAILinks = () => {
      ElMessage.info("🤖 AI Link 重新生成功能開發中...");
    };
    const getGraphIcon = (graphId) => {
      const graph = availableGraphs.value.find((g) => g.id === graphId);
      return (graph == null ? void 0 : graph.icon) || "📊";
    };
    const getGraphName = (graphId) => {
      const graph = availableGraphs.value.find((g) => g.id === graphId);
      return (graph == null ? void 0 : graph.name) || graphId;
    };
    const refreshGraphList = () => {
      isSyncing.value = true;
      try {
        console.log("🔄 刷新圖譜列表...");
        const savedMetadata = localStorage.getItem("graphMetadataList");
        if (savedMetadata) {
          let metadata = JSON.parse(savedMetadata);
          const originalCount = metadata.length;
          metadata = metadata.filter((graph) => {
            if (!graph || !graph.name) return false;
            const graphId = String(graph.id || "");
            const graphName = String(graph.name || "");
            return !graphName.includes("快照") && !graphName.includes("snapshot") && !graphId.startsWith("workspace-snapshot-");
          });
          if (metadata.length < originalCount) {
            graphStore.graphMetadataList = metadata;
            localStorage.setItem("graphMetadataList", JSON.stringify(metadata));
            console.log(`🗑️ 已清理 ${originalCount - metadata.length} 個快照圖譜`);
          }
          console.log("✅ 從 localStorage 載入", metadata.length, "個圖譜");
          if (metadata.length === 0) {
            ElMessage.info("尚無已註冊的圖譜，請先在圖譜工作檯載入數據");
          } else {
            ElMessage.success(`✅ 已載入 ${metadata.length} 個圖譜`);
          }
        } else {
          console.log("⚠️ localStorage 無圖譜數據");
          ElMessage.info("尚無已註冊的圖譜，請先在圖譜工作檯載入數據");
        }
      } catch (error) {
        console.error("❌ 刷新失敗:", error);
        ElMessage.error(error.message || "刷新失敗");
      } finally {
        isSyncing.value = false;
      }
    };
    onMounted(async () => {
      console.log("🚀 CrossGraphPage mounted");
      console.log("📊 當前圖譜元數據數量:", graphStore.graphMetadataList.length);
      try {
        console.log("🔄 [CrossGraphPage] 自動載入圖譜數據");
        await graphStore.fetchGraphData(graphStore.currentGraphId);
        console.log("✅ [CrossGraphPage] 圖譜數據已載入:", graphStore.nodeCount, "個節點");
      } catch (error) {
        console.warn("⚠️ [CrossGraphPage] 圖譜數據載入失敗:", error.message);
      }
      const realGraphsCount = availableGraphs.value.length;
      if (realGraphsCount === 0) {
        console.log("⚠️ 尚無已註冊的圖譜");
        ElMessage.info("請先在「圖譜工作檯」中載入圖譜數據");
      } else {
        console.log("✅ 已有", realGraphsCount, "個圖譜可用");
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d;
      const _component_el_tag = resolveComponent("el-tag");
      const _component_el_button = resolveComponent("el-button");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            _cache[1] || (_cache[1] = createStaticVNode('<div class="header-left" data-v-657b6d8d><span class="header-icon" data-v-657b6d8d>🔗</span><div class="header-text" data-v-657b6d8d><h1 class="page-title" data-v-657b6d8d>跨圖譜智能連接</h1><p class="page-subtitle" data-v-657b6d8d>同時管理多個知識圖譜，AI 自動發現關聯</p></div></div>', 1)),
            createVNode(_component_el_tag, {
              type: unref(graphStore).isCrossGraphMode ? "success" : "info",
              size: "large",
              effect: "dark"
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(graphStore).isCrossGraphMode ? "✓ 已啟用" : "未啟用"), 1)
              ]),
              _: 1
            }, 8, ["type"])
          ])
        ]),
        createBaseVNode("div", _hoisted_4, [
          createBaseVNode("div", _hoisted_5, [
            createBaseVNode("div", _hoisted_6, [
              _cache[2] || (_cache[2] = createBaseVNode("h2", { class: "panel-title" }, [
                createBaseVNode("span", { class: "icon" }, "📊"),
                createTextVNode(" 選擇要連接的圖譜 ")
              ], -1)),
              _cache[3] || (_cache[3] = createBaseVNode("p", { class: "panel-desc" }, "請選擇至少 2 個圖譜進行跨圖譜連接", -1)),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: refreshGraphList,
                class: "sync-button",
                loading: isSyncing.value
              }, {
                default: withCtx(() => [
                  !isSyncing.value ? (openBlock(), createElementBlock("span", _hoisted_7, "🔄 刷新圖譜列表")) : (openBlock(), createElementBlock("span", _hoisted_8, "刷新中..."))
                ]),
                _: 1
              }, 8, ["loading"])
            ]),
            availableGraphs.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_9, [
              _cache[5] || (_cache[5] = createBaseVNode("div", { class: "empty-icon" }, "📊", -1)),
              _cache[6] || (_cache[6] = createBaseVNode("h3", { class: "empty-title" }, "尚無可用的圖譜", -1)),
              _cache[7] || (_cache[7] = createBaseVNode("p", { class: "empty-desc" }, [
                createTextVNode(" 請先在「圖譜工作檯」中載入圖譜數據，"),
                createBaseVNode("br"),
                createTextVNode(" 載入後會自動註冊到此列表。 ")
              ], -1)),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$router.push("/nexus")),
                class: "goto-workspace-button"
              }, {
                default: withCtx(() => [..._cache[4] || (_cache[4] = [
                  createTextVNode(" 前往圖譜工作檯 ", -1)
                ])]),
                _: 1
              })
            ])) : (openBlock(), createElementBlock("div", _hoisted_10, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(availableGraphs.value, (graph) => {
                return openBlock(), createElementBlock("div", {
                  key: graph.id,
                  class: normalizeClass(["graph-card", {
                    "is-selected": isGraphSelected(graph.id),
                    "is-disabled": !isGraphSelected(graph.id) && selectedGraphs.value.length >= 2
                  }]),
                  onClick: ($event) => toggleGraphSelection(graph.id)
                }, [
                  createBaseVNode("div", _hoisted_12, [
                    createBaseVNode("div", {
                      class: normalizeClass(["checkbox", { "is-checked": isGraphSelected(graph.id) }])
                    }, [
                      isGraphSelected(graph.id) ? (openBlock(), createElementBlock("span", _hoisted_13, "✓")) : createCommentVNode("", true)
                    ], 2)
                  ]),
                  createBaseVNode("div", {
                    class: "card-icon",
                    style: normalizeStyle({ background: graph.color + "20", color: graph.color })
                  }, [
                    createBaseVNode("span", _hoisted_14, toDisplayString(graph.icon), 1)
                  ], 4),
                  createBaseVNode("div", _hoisted_15, [
                    createBaseVNode("h3", _hoisted_16, toDisplayString(graph.name), 1),
                    createBaseVNode("p", _hoisted_17, toDisplayString(graph.description), 1),
                    createBaseVNode("div", _hoisted_18, [
                      createBaseVNode("span", _hoisted_19, [
                        _cache[8] || (_cache[8] = createBaseVNode("span", { class: "stat-icon" }, "●", -1)),
                        createBaseVNode("span", _hoisted_20, toDisplayString(graph.nodeCount), 1),
                        _cache[9] || (_cache[9] = createBaseVNode("span", { class: "stat-label" }, "節點", -1))
                      ]),
                      _cache[12] || (_cache[12] = createBaseVNode("span", { class: "stat-divider" }, "·", -1)),
                      createBaseVNode("span", _hoisted_21, [
                        _cache[10] || (_cache[10] = createBaseVNode("span", { class: "stat-icon" }, "━", -1)),
                        createBaseVNode("span", _hoisted_22, toDisplayString(graph.linkCount), 1),
                        _cache[11] || (_cache[11] = createBaseVNode("span", { class: "stat-label" }, "連接", -1))
                      ])
                    ])
                  ]),
                  isGraphSelected(graph.id) ? (openBlock(), createElementBlock("div", _hoisted_23, " 已選擇 ")) : createCommentVNode("", true)
                ], 10, _hoisted_11);
              }), 128))
            ])),
            createBaseVNode("div", _hoisted_24, [
              createVNode(_component_el_button, {
                type: "primary",
                size: "large",
                disabled: selectedGraphs.value.length < 2,
                loading: isLoading.value,
                onClick: loadSelectedGraphs,
                class: "action-button primary-button"
              }, {
                default: withCtx(() => [
                  _cache[13] || (_cache[13] = createBaseVNode("span", { class: "button-icon" }, "🚀", -1)),
                  createBaseVNode("span", _hoisted_25, toDisplayString(isLoading.value ? "加載中..." : "啟動跨圖譜連接"), 1)
                ]),
                _: 1
              }, 8, ["disabled", "loading"]),
              unref(graphStore).isCrossGraphMode ? (openBlock(), createBlock(_component_el_button, {
                key: 0,
                type: "danger",
                size: "large",
                plain: "",
                onClick: exitCrossGraphMode,
                class: "action-button"
              }, {
                default: withCtx(() => [..._cache[14] || (_cache[14] = [
                  createBaseVNode("span", { class: "button-icon" }, "✕", -1),
                  createBaseVNode("span", { class: "button-text" }, "退出跨圖譜模式", -1)
                ])]),
                _: 1
              })) : createCommentVNode("", true)
            ])
          ]),
          createBaseVNode("div", _hoisted_26, [
            !unref(graphStore).isCrossGraphMode ? (openBlock(), createElementBlock("div", _hoisted_27, [
              _cache[16] || (_cache[16] = createBaseVNode("div", { class: "empty-icon" }, "📋", -1)),
              _cache[17] || (_cache[17] = createBaseVNode("h3", { class: "empty-title" }, "請選擇要連接的圖譜", -1)),
              _cache[18] || (_cache[18] = createBaseVNode("p", { class: "empty-desc" }, [
                createTextVNode(" 選擇左側的圖譜卡片，至少選擇 2 個"),
                createBaseVNode("br"),
                createTextVNode(" 系統將自動分析並建立智能連接 ")
              ], -1)),
              createBaseVNode("div", _hoisted_28, [
                createBaseVNode("span", _hoisted_29, toDisplayString(selectedGraphs.value.length), 1),
                _cache[15] || (_cache[15] = createBaseVNode("span", { class: "count-label" }, "/ 2 個圖譜已選擇", -1))
              ])
            ])) : (openBlock(), createElementBlock("div", _hoisted_30, [
              _cache[31] || (_cache[31] = createBaseVNode("div", { class: "stats-header" }, [
                createBaseVNode("h2", { class: "stats-title" }, [
                  createBaseVNode("span", { class: "icon" }, "✨"),
                  createTextVNode(" AI Link 統計 ")
                ])
              ], -1)),
              createBaseVNode("div", _hoisted_31, [
                createBaseVNode("div", _hoisted_32, [
                  _cache[20] || (_cache[20] = createBaseVNode("div", { class: "stat-icon" }, "🔗", -1)),
                  createBaseVNode("div", _hoisted_33, [
                    createBaseVNode("div", _hoisted_34, toDisplayString(((_a = aiLinkStats.value) == null ? void 0 : _a.total) || 0), 1),
                    _cache[19] || (_cache[19] = createBaseVNode("div", { class: "stat-name" }, "總連接數", -1))
                  ])
                ]),
                createBaseVNode("div", _hoisted_35, [
                  _cache[22] || (_cache[22] = createBaseVNode("div", { class: "stat-icon" }, "⭐", -1)),
                  createBaseVNode("div", _hoisted_36, [
                    createBaseVNode("div", _hoisted_37, toDisplayString(((_b = aiLinkStats.value) == null ? void 0 : _b.byConfidence.high) || 0), 1),
                    _cache[21] || (_cache[21] = createBaseVNode("div", { class: "stat-name" }, "高置信度", -1))
                  ])
                ]),
                createBaseVNode("div", _hoisted_38, [
                  _cache[24] || (_cache[24] = createBaseVNode("div", { class: "stat-icon" }, "💫", -1)),
                  createBaseVNode("div", _hoisted_39, [
                    createBaseVNode("div", _hoisted_40, toDisplayString(((_c = aiLinkStats.value) == null ? void 0 : _c.byConfidence.medium) || 0), 1),
                    _cache[23] || (_cache[23] = createBaseVNode("div", { class: "stat-name" }, "中置信度", -1))
                  ])
                ]),
                createBaseVNode("div", _hoisted_41, [
                  _cache[26] || (_cache[26] = createBaseVNode("div", { class: "stat-icon" }, "📊", -1)),
                  createBaseVNode("div", _hoisted_42, [
                    createBaseVNode("div", _hoisted_43, toDisplayString(Math.round((((_d = aiLinkStats.value) == null ? void 0 : _d.avgConfidence) || 0) * 100)) + "%", 1),
                    _cache[25] || (_cache[25] = createBaseVNode("div", { class: "stat-name" }, "平均置信度", -1))
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_44, [
                _cache[28] || (_cache[28] = createBaseVNode("h3", { class: "section-title" }, "已加載的圖譜", -1)),
                createBaseVNode("div", _hoisted_45, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(unref(graphStore).activeGraphIds, (graphId) => {
                    return openBlock(), createElementBlock("div", {
                      key: graphId,
                      class: "loaded-item"
                    }, [
                      createBaseVNode("span", _hoisted_46, toDisplayString(getGraphIcon(graphId)), 1),
                      createBaseVNode("span", _hoisted_47, toDisplayString(getGraphName(graphId)), 1),
                      createVNode(_component_el_tag, {
                        size: "small",
                        type: "success"
                      }, {
                        default: withCtx(() => [..._cache[27] || (_cache[27] = [
                          createTextVNode("活動中", -1)
                        ])]),
                        _: 1
                      })
                    ]);
                  }), 128))
                ])
              ]),
              createBaseVNode("div", _hoisted_48, [
                createVNode(_component_el_button, {
                  size: "default",
                  onClick: viewInGraph,
                  class: "quick-button"
                }, {
                  default: withCtx(() => [..._cache[29] || (_cache[29] = [
                    createBaseVNode("span", { class: "icon" }, "🌐", -1),
                    createTextVNode(" 在圖譜工作台查看 ", -1)
                  ])]),
                  _: 1
                }),
                createVNode(_component_el_button, {
                  size: "default",
                  onClick: regenerateAILinks,
                  class: "quick-button"
                }, {
                  default: withCtx(() => [..._cache[30] || (_cache[30] = [
                    createBaseVNode("span", { class: "icon" }, "🤖", -1),
                    createTextVNode(" 重新生成連接 ", -1)
                  ])]),
                  _: 1
                })
              ])
            ]))
          ])
        ])
      ]);
    };
  }
};
const CrossGraphPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-657b6d8d"]]);
export {
  CrossGraphPage as default
};
