import { j as onMounted, y as openBlock, D as createElementBlock, G as createBaseVNode, az as createStaticVNode, M as Fragment, a6 as renderList, E as createVNode, F as withCtx, U as toDisplayString, S as createTextVNode, R as createCommentVNode, ac as resolveComponent, r as ref, c as computed, ay as useRouter, I as normalizeClass, H as normalizeStyle, u as unref } from "./vue-vendor-rpbpBucb.js";
import { _ as _export_sfc, u as useGraphStore } from "./index-DDdIzyMR.js";
import { b as getNodeTypeColor } from "./nodeColors-SuxP957Z.js";
import "./element-plus-DavumCtP.js";
const _hoisted_1 = { class: "min-h-screen bg-[#0a0e27] overflow-hidden relative" };
const _hoisted_2 = { class: "relative z-10 flex flex-col h-screen" };
const _hoisted_3 = { class: "flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#1a1d3a]/80 backdrop-blur-md" };
const _hoisted_4 = { class: "flex items-center gap-3" };
const _hoisted_5 = { class: "flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 px-1" };
const _hoisted_6 = ["onClick"];
const _hoisted_7 = { class: "px-8 py-6 flex items-center gap-6" };
const _hoisted_8 = { class: "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10" };
const _hoisted_9 = { class: "text-lg font-bold text-white font-mono" };
const _hoisted_10 = { class: "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10" };
const _hoisted_11 = { class: "text-sm font-semibold text-white" };
const _hoisted_12 = { class: "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10" };
const _hoisted_13 = { class: "text-sm font-semibold text-white" };
const _hoisted_14 = { class: "px-8 pb-12" };
const _hoisted_15 = { class: "relative" };
const _hoisted_16 = { class: "flex items-center gap-4 mb-4 sticky top-0 z-10 bg-[#0a0e27]/90 backdrop-blur-sm py-2" };
const _hoisted_17 = { class: "w-[120px] text-right" };
const _hoisted_18 = { class: "text-sm font-bold text-white" };
const _hoisted_19 = { class: "text-[10px] text-text-tertiary" };
const _hoisted_20 = { class: "text-xs text-text-tertiary bg-white/5 px-2 py-0.5 rounded-full" };
const _hoisted_21 = ["onClick"];
const _hoisted_22 = { class: "w-[120px] text-right flex-shrink-0" };
const _hoisted_23 = { class: "text-xs text-text-tertiary font-mono" };
const _hoisted_24 = { class: "relative flex-shrink-0 mt-2" };
const _hoisted_25 = { class: "flex items-center justify-between" };
const _hoisted_26 = { class: "flex items-center gap-2.5" };
const _hoisted_27 = { class: "text-base" };
const _hoisted_28 = { class: "text-sm font-semibold text-white" };
const _hoisted_29 = { class: "text-[10px] text-text-tertiary font-mono opacity-0 group-hover:opacity-100 transition-opacity" };
const _hoisted_30 = {
  key: 0,
  class: "text-xs text-text-secondary mt-1.5 line-clamp-2"
};
const _hoisted_31 = { class: "flex items-center gap-3 mt-2" };
const _hoisted_32 = { class: "text-[10px] text-text-tertiary" };
const _hoisted_33 = {
  key: 0,
  class: "text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-tertiary"
};
const _hoisted_34 = {
  key: 0,
  class: "flex flex-col items-center justify-center py-20 text-text-tertiary"
};
const _sfc_main = {
  __name: "TimelinePage",
  setup(__props) {
    useRouter();
    const graphStore = useGraphStore();
    const scrollContainer = ref(null);
    onMounted(async () => {
      if (graphStore.nodeCount === 0) {
        console.log("🔄 [TimelinePage] 圖譜數據為空，自動加載");
        await graphStore.fetchGraphData(graphStore.currentGraphId);
      }
    });
    const timeScale = ref("day");
    const scaleOptions = [
      { value: "hour", label: "小時" },
      { value: "day", label: "日" },
      { value: "week", label: "週" },
      { value: "month", label: "月" }
    ];
    const timelineEntries = computed(() => {
      return graphStore.nodes.map((node) => {
        const ts = node.timestamp || node.created_at || node.date || Date.now();
        const date = new Date(typeof ts === "number" ? ts : Date.parse(ts));
        const colorConfig = getNodeTypeColor(node.type);
        return {
          id: node.id,
          name: node.name || node.label || node.id,
          type: node.type || "unknown",
          color: node.color && node.color !== "#9e9e9e" ? node.color : colorConfig.color,
          emoji: node.emoji || colorConfig.emoji,
          description: node.description || "",
          date,
          time: date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
          dateStr: date.toLocaleDateString("zh-TW"),
          linkCount: graphStore.getNodeLinks(node.id).length,
          action: node.aiStatus === "linked" ? "🤖 AI 關聯" : null
        };
      }).sort((a, b) => b.date - a.date);
    });
    const groupedEntries = computed(() => {
      const groups = {};
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
      timelineEntries.value.forEach((entry) => {
        let key;
        if (timeScale.value === "hour") {
          key = entry.date.toLocaleString("zh-TW", { month: "short", day: "numeric", hour: "2-digit" });
        } else if (timeScale.value === "day") {
          key = entry.dateStr;
        } else if (timeScale.value === "week") {
          const d = new Date(entry.date);
          const startOfWeek = new Date(d);
          startOfWeek.setDate(d.getDate() - d.getDay());
          key = `${startOfWeek.toLocaleDateString("zh-TW")} 週`;
        } else {
          key = entry.date.toLocaleDateString("zh-TW", { year: "numeric", month: "long" });
        }
        if (!groups[key]) {
          groups[key] = {
            label: key,
            weekday: `星期${weekdays[entry.date.getDay()]}`,
            entries: [],
            sortDate: entry.date
          };
        }
        groups[key].entries.push(entry);
      });
      return Object.values(groups).sort((a, b) => b.sortDate - a.sortDate);
    });
    const timeSpan = computed(() => {
      if (timelineEntries.value.length < 2) return "—";
      const dates = timelineEntries.value.map((e) => e.date.getTime());
      const diffMs = Math.max(...dates) - Math.min(...dates);
      const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
      if (diffDays === 0) return "今天";
      if (diffDays < 7) return `${diffDays} 天`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週`;
      return `${Math.floor(diffDays / 30)} 個月`;
    });
    const busiestDay = computed(() => {
      if (groupedEntries.value.length === 0) return "—";
      const busiest = groupedEntries.value.reduce(
        (max, g) => g.entries.length > max.entries.length ? g : max,
        groupedEntries.value[0]
      );
      return `${busiest.label} (${busiest.entries.length}項)`;
    });
    const handleNodeClick = (entry) => {
      graphStore.selectNode(entry.id);
    };
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[14] || (_cache[14] = createBaseVNode("div", { class: "absolute inset-0 overflow-hidden pointer-events-none" }, [
          createBaseVNode("div", { class: "stars" })
        ], -1)),
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("header", _hoisted_3, [
            _cache[1] || (_cache[1] = createStaticVNode('<div class="flex items-center gap-4" data-v-6b78727a><div class="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center" data-v-6b78727a><span class="text-xl" data-v-6b78727a>⏳</span></div><div data-v-6b78727a><h1 class="text-lg font-bold text-white" data-v-6b78727a>Knowledge Timeline</h1><p class="text-xs text-text-secondary" data-v-6b78727a>按時間線查看知識演變</p></div></div>', 1)),
            createBaseVNode("div", _hoisted_4, [
              createBaseVNode("div", _hoisted_5, [
                (openBlock(), createElementBlock(Fragment, null, renderList(scaleOptions, (scale) => {
                  return createBaseVNode("button", {
                    key: scale.value,
                    onClick: ($event) => timeScale.value = scale.value,
                    class: normalizeClass(["px-3 py-1.5 text-xs font-medium rounded-md transition-all", timeScale.value === scale.value ? "bg-neon-blue text-white" : "text-text-secondary hover:text-white hover:bg-white/5"])
                  }, toDisplayString(scale.label), 11, _hoisted_6);
                }), 64))
              ]),
              createVNode(_component_router_link, {
                to: "/graph-page",
                class: "flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-white transition-all text-sm"
              }, {
                default: withCtx(() => [..._cache[0] || (_cache[0] = [
                  createBaseVNode("span", null, "🌐", -1),
                  createBaseVNode("span", null, "回到圖譜", -1)
                ])]),
                _: 1
              })
            ])
          ]),
          createBaseVNode("div", {
            class: "flex-1 overflow-auto custom-scrollbar",
            ref_key: "scrollContainer",
            ref: scrollContainer
          }, [
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("div", _hoisted_8, [
                _cache[3] || (_cache[3] = createBaseVNode("span", { class: "text-neon-blue text-lg" }, "📊", -1)),
                createBaseVNode("div", null, [
                  _cache[2] || (_cache[2] = createBaseVNode("p", { class: "text-xs text-text-tertiary" }, "節點總數", -1)),
                  createBaseVNode("p", _hoisted_9, toDisplayString(timelineEntries.value.length), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_10, [
                _cache[5] || (_cache[5] = createBaseVNode("span", { class: "text-neon-purple text-lg" }, "📅", -1)),
                createBaseVNode("div", null, [
                  _cache[4] || (_cache[4] = createBaseVNode("p", { class: "text-xs text-text-tertiary" }, "時間跨度", -1)),
                  createBaseVNode("p", _hoisted_11, toDisplayString(timeSpan.value), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_12, [
                _cache[7] || (_cache[7] = createBaseVNode("span", { class: "text-neon-cyan text-lg" }, "🔥", -1)),
                createBaseVNode("div", null, [
                  _cache[6] || (_cache[6] = createBaseVNode("p", { class: "text-xs text-text-tertiary" }, "最活躍日", -1)),
                  createBaseVNode("p", _hoisted_13, toDisplayString(busiestDay.value), 1)
                ])
              ])
            ]),
            createBaseVNode("div", _hoisted_14, [
              createBaseVNode("div", _hoisted_15, [
                _cache[13] || (_cache[13] = createBaseVNode("div", { class: "absolute left-[140px] top-0 bottom-0 w-px bg-gradient-to-b from-neon-blue/50 via-neon-purple/30 to-transparent" }, null, -1)),
                (openBlock(true), createElementBlock(Fragment, null, renderList(groupedEntries.value, (group, idx) => {
                  return openBlock(), createElementBlock("div", {
                    key: group.label,
                    class: "mb-8 animate-fade-in",
                    style: normalizeStyle({ animationDelay: `${idx * 100}ms` })
                  }, [
                    createBaseVNode("div", _hoisted_16, [
                      createBaseVNode("div", _hoisted_17, [
                        createBaseVNode("span", _hoisted_18, toDisplayString(group.label), 1),
                        createBaseVNode("p", _hoisted_19, toDisplayString(group.weekday), 1)
                      ]),
                      _cache[8] || (_cache[8] = createBaseVNode("div", { class: "relative" }, [
                        createBaseVNode("div", { class: "w-4 h-4 rounded-full bg-neon-blue border-2 border-[#0a0e27] shadow-[0_0_12px_rgba(59,130,246,0.5)] z-10 relative" })
                      ], -1)),
                      createBaseVNode("span", _hoisted_20, toDisplayString(group.entries.length) + " 項變更 ", 1)
                    ]),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(group.entries, (entry, entryIdx) => {
                      var _a;
                      return openBlock(), createElementBlock("div", {
                        key: entry.id,
                        class: "flex items-start gap-4 ml-0 mb-3 group cursor-pointer",
                        onClick: ($event) => handleNodeClick(entry)
                      }, [
                        createBaseVNode("div", _hoisted_22, [
                          createBaseVNode("span", _hoisted_23, toDisplayString(entry.time), 1)
                        ]),
                        createBaseVNode("div", _hoisted_24, [
                          createBaseVNode("div", {
                            class: "w-2.5 h-2.5 rounded-full border-2 border-[#0a0e27] transition-all group-hover:scale-150",
                            style: normalizeStyle({ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}40` })
                          }, null, 4)
                        ]),
                        createBaseVNode("div", {
                          class: normalizeClass(["flex-1 max-w-2xl px-4 py-3 rounded-xl border transition-all group-hover:translate-x-1", [
                            ((_a = unref(graphStore).selectedNode) == null ? void 0 : _a.id) === entry.id ? "bg-neon-blue/10 border-neon-blue/40" : "bg-white/[0.03] border-white/5 hover:bg-white/5 hover:border-white/10"
                          ]])
                        }, [
                          createBaseVNode("div", _hoisted_25, [
                            createBaseVNode("div", _hoisted_26, [
                              createBaseVNode("span", _hoisted_27, toDisplayString(entry.emoji), 1),
                              createBaseVNode("span", _hoisted_28, toDisplayString(entry.name), 1),
                              createBaseVNode("span", {
                                class: "px-1.5 py-0.5 text-[10px] font-medium rounded border",
                                style: normalizeStyle({
                                  color: entry.color,
                                  borderColor: entry.color + "30",
                                  backgroundColor: entry.color + "10"
                                })
                              }, toDisplayString(entry.type), 5)
                            ]),
                            createBaseVNode("span", _hoisted_29, " ID: " + toDisplayString(entry.id), 1)
                          ]),
                          entry.description ? (openBlock(), createElementBlock("p", _hoisted_30, toDisplayString(entry.description), 1)) : createCommentVNode("", true),
                          createBaseVNode("div", _hoisted_31, [
                            createBaseVNode("span", _hoisted_32, " 🔗 " + toDisplayString(entry.linkCount) + " 個連線 ", 1),
                            entry.action ? (openBlock(), createElementBlock("span", _hoisted_33, toDisplayString(entry.action), 1)) : createCommentVNode("", true)
                          ])
                        ], 2)
                      ], 8, _hoisted_21);
                    }), 128))
                  ], 4);
                }), 128)),
                timelineEntries.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_34, [
                  _cache[10] || (_cache[10] = createBaseVNode("span", { class: "text-6xl mb-4 opacity-30" }, "⏳", -1)),
                  _cache[11] || (_cache[11] = createBaseVNode("p", { class: "text-base font-medium mb-2" }, "尚無時間軸資料", -1)),
                  _cache[12] || (_cache[12] = createBaseVNode("p", { class: "text-sm" }, "載入圖譜後即可查看知識演變時間線", -1)),
                  createVNode(_component_router_link, {
                    to: "/graph-page",
                    class: "mt-4 px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 text-sm transition-all"
                  }, {
                    default: withCtx(() => [..._cache[9] || (_cache[9] = [
                      createTextVNode(" 前往圖譜工作台 ", -1)
                    ])]),
                    _: 1
                  })
                ])) : createCommentVNode("", true)
              ])
            ])
          ], 512)
        ])
      ]);
    };
  }
};
const TimelinePage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6b78727a"]]);
export {
  TimelinePage as default
};
