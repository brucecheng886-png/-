const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/BatchRepair-BDmQ04kC.js","assets/vue-vendor-rpbpBucb.js","assets/xlsx-CCI9vzZp.js","assets/element-plus-DavumCtP.js","assets/BatchRepair-BHcYt70x.css","assets/Settings-BllxzVjR.js","assets/Settings-CZfudi1q.css","assets/GraphView-PgugaHB7.js","assets/g6-of8JZalD.js","assets/GraphView-ETpgFaxo.css","assets/KnowledgeForm-SHnj_LHL.js","assets/KnowledgeForm-C7V2oCzr.css","assets/Graph3D-B0AcdIba.js","assets/Graph3D-CpczQADr.css","assets/GraphPage-CyFbrADU.js","assets/nodeColors-SuxP957Z.js","assets/GraphPage-D8ONIGqK.css","assets/CrossGraphPage-DcrynMdO.js","assets/CrossGraphPage-B3y9EK7A.css","assets/NexusPage-DbLEYtdT.js","assets/NexusPage-D7W6NZO0.css","assets/SystemMonitorPage-CZIvDMZb.js","assets/SystemMonitorPage-BjEvZ6jp.css","assets/ImportPage-atv-6PfV.js","assets/ImportPage-DifunlB6.css","assets/FileImport-C9uWLtqN.js","assets/FileImport-BrjGsjji.css","assets/TimelinePage-CQArytHA.js","assets/TimelinePage-ZhNmX7Zk.css"])))=>i.map(i=>d[i]);
import { r as ref, X as markRaw, ar as effectScope, i as inject, aw as hasInjectionContext, a as isRef, ax as isReactive, a9 as toRaw, h as getCurrentScope, o as onScopeDispose, l as reactive, n as nextTick, aa as toRefs, c as computed, w as watch, y as openBlock, z as createBlock, F as withCtx, D as createElementBlock, G as createBaseVNode, S as createTextVNode, M as Fragment, a6 as renderList, R as createCommentVNode, P as withDirectives, an as vModelText, am as withKeys, $ as withModifiers, W as Transition, I as normalizeClass, U as toDisplayString, ay as useRouter, ac as resolveComponent, E as createVNode, V as vShow, az as createStaticVNode, H as normalizeStyle, u as unref, aA as useRoute, Q as resolveDynamicComponent, j as onMounted, Z as onUnmounted, aB as createRouter, aC as createWebHistory, at as createApp } from "./vue-vendor-rpbpBucb.js";
import { E as ElMessage, i as installer, b as ElementPlusIconsVue } from "./element-plus-DavumCtP.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
/*!
 * pinia v3.0.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
let activePinia;
const setActivePinia = (pinia2) => activePinia = pinia2;
const piniaSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function isPlainObject(o) {
  return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
}
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia2 = markRaw({
    install(app2) {
      setActivePinia(pinia2);
      pinia2._a = app2;
      app2.provide(piniaSymbol, pinia2);
      app2.config.globalProperties.$pinia = pinia2;
      toBeInstalled.forEach((plugin) => _p.push(plugin));
      toBeInstalled = [];
    },
    use(plugin) {
      if (!this._a) {
        toBeInstalled.push(plugin);
      } else {
        _p.push(plugin);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  return pinia2;
}
const noop = () => {
};
function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
  subscriptions.add(callback);
  const removeSubscription = () => {
    const isDel = subscriptions.delete(callback);
    isDel && onCleanup();
  };
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription);
  }
  return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.forEach((callback) => {
    callback(...args);
  });
}
const fallbackRunWithContext = (fn) => fn();
const ACTION_MARKER = Symbol();
const ACTION_NAME = Symbol();
function mergeReactiveObjects(target, patchToApply) {
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value));
  } else if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach(target.add, target);
  }
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue;
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }
  return target;
}
const skipHydrateSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function shouldHydrate(obj) {
  return !isPlainObject(obj) || !Object.prototype.hasOwnProperty.call(obj, skipHydrateSymbol);
}
const { assign } = Object;
function isComputed(o) {
  return !!(isRef(o) && o.effect);
}
function createOptionsStore(id, options, pinia2, hot) {
  const { state, actions, getters } = options;
  const initialState = pinia2.state.value[id];
  let store;
  function setup() {
    if (!initialState && true) {
      pinia2.state.value[id] = state ? state() : {};
    }
    const localState = toRefs(pinia2.state.value[id]);
    return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
      computedGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia2);
        const store2 = pinia2._s.get(id);
        return getters[name].call(store2, store2);
      }));
      return computedGetters;
    }, {}));
  }
  store = createSetupStore(id, setup, options, pinia2, hot, true);
  return store;
}
function createSetupStore($id, setup, options = {}, pinia2, hot, isOptionsStore) {
  let scope;
  const optionsForPlugin = assign({ actions: {} }, options);
  const $subscribeOptions = { deep: true };
  let isListening;
  let isSyncListening;
  let subscriptions = /* @__PURE__ */ new Set();
  let actionSubscriptions = /* @__PURE__ */ new Set();
  let debuggerEvents;
  const initialState = pinia2.state.value[$id];
  if (!isOptionsStore && !initialState && true) {
    pinia2.state.value[$id] = {};
  }
  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia2.state.value[$id]);
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia2.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }
    const myListenerId = activeListener = Symbol();
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });
    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia2.state.value[$id]);
  }
  const $reset = isOptionsStore ? function $reset2() {
    const { state } = options;
    const newState = state ? state() : {};
    this.$patch(($state) => {
      assign($state, newState);
    });
  } : (
    /* istanbul ignore next */
    noop
  );
  function $dispose() {
    scope.stop();
    subscriptions.clear();
    actionSubscriptions.clear();
    pinia2._s.delete($id);
  }
  const action = (fn, name = "") => {
    if (ACTION_MARKER in fn) {
      fn[ACTION_NAME] = name;
      return fn;
    }
    const wrappedAction = function() {
      setActivePinia(pinia2);
      const args = Array.from(arguments);
      const afterCallbackSet = /* @__PURE__ */ new Set();
      const onErrorCallbackSet = /* @__PURE__ */ new Set();
      function after(callback) {
        afterCallbackSet.add(callback);
      }
      function onError(callback) {
        onErrorCallbackSet.add(callback);
      }
      triggerSubscriptions(actionSubscriptions, {
        args,
        name: wrappedAction[ACTION_NAME],
        store,
        after,
        onError
      });
      let ret;
      try {
        ret = fn.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackSet, error);
        throw error;
      }
      if (ret instanceof Promise) {
        return ret.then((value) => {
          triggerSubscriptions(afterCallbackSet, value);
          return value;
        }).catch((error) => {
          triggerSubscriptions(onErrorCallbackSet, error);
          return Promise.reject(error);
        });
      }
      triggerSubscriptions(afterCallbackSet, ret);
      return ret;
    };
    wrappedAction[ACTION_MARKER] = true;
    wrappedAction[ACTION_NAME] = name;
    return wrappedAction;
  };
  const partialStore = {
    _p: pinia2,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options2 = {}) {
      const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
      const stopWatcher = scope.run(() => watch(() => pinia2.state.value[$id], (state) => {
        if (options2.flush === "sync" ? isSyncListening : isListening) {
          callback({
            storeId: $id,
            type: MutationType.direct,
            events: debuggerEvents
          }, state);
        }
      }, assign({}, $subscribeOptions, options2)));
      return removeSubscription;
    },
    $dispose
  };
  const store = reactive(partialStore);
  pinia2._s.set($id, store);
  const runWithContext = pinia2._a && pinia2._a.runWithContext || fallbackRunWithContext;
  const setupStore = runWithContext(() => pinia2._e.run(() => (scope = effectScope()).run(() => setup({ action }))));
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
      if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        pinia2.state.value[$id][key] = prop;
      }
    } else if (typeof prop === "function") {
      const actionValue = action(prop, key);
      setupStore[key] = actionValue;
      optionsForPlugin.actions[key] = prop;
    } else ;
  }
  assign(store, setupStore);
  assign(toRaw(store), setupStore);
  Object.defineProperty(store, "$state", {
    get: () => pinia2.state.value[$id],
    set: (state) => {
      $patch(($state) => {
        assign($state, state);
      });
    }
  });
  pinia2._p.forEach((extender) => {
    {
      assign(store, scope.run(() => extender({
        store,
        app: pinia2._a,
        pinia: pinia2,
        options: optionsForPlugin
      })));
    }
  });
  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }
  isListening = true;
  isSyncListening = true;
  return store;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function defineStore(id, setup, setupOptions) {
  let options;
  const isSetupStore = typeof setup === "function";
  options = isSetupStore ? setupOptions : setup;
  function useStore(pinia2, hot) {
    const hasContext = hasInjectionContext();
    pinia2 = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    pinia2 || (hasContext ? inject(piniaSymbol, null) : null);
    if (pinia2)
      setActivePinia(pinia2);
    pinia2 = activePinia;
    if (!pinia2._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia2);
      } else {
        createOptionsStore(id, options, pinia2);
      }
    }
    const store = pinia2._s.get(id);
    return store;
  }
  useStore.$id = id;
  return useStore;
}
const useLayoutStore = /* @__PURE__ */ defineStore("layout", () => {
  const theme = ref(localStorage.getItem("theme") || "dark");
  const rightPanelMode = ref("dashboard");
  const rightPanelData = ref(null);
  const leftPaneSize = ref(30);
  const panelHistory = ref([]);
  const showAssistant = ref(false);
  const isSidebarCollapsed = ref(true);
  const setRightPanel = (mode, data = null, addToHistory = true) => {
    if (addToHistory && rightPanelMode.value !== mode) {
      panelHistory.value.push({
        mode: rightPanelMode.value,
        data: rightPanelData.value
      });
      if (panelHistory.value.length > 10) {
        panelHistory.value.shift();
      }
    }
    rightPanelMode.value = mode;
    rightPanelData.value = data;
    console.log(`🎯 切換右側面板: ${mode}`, data);
  };
  const goBack = () => {
    if (panelHistory.value.length > 0) {
      const previous = panelHistory.value.pop();
      rightPanelMode.value = previous.mode;
      rightPanelData.value = previous.data;
      console.log(`↩️ 返回上一個面板: ${previous.mode}`);
    }
  };
  const openPDF = (url, filename = "document.pdf") => {
    setRightPanel("pdf", { url, filename });
  };
  const openGraph = (graphId = "default", type = "3d") => {
    setRightPanel("graph", { graphId, type });
  };
  const openTerminal = (command = "", cwd = "") => {
    setRightPanel("terminal", { command, cwd });
  };
  const showDashboard = () => {
    setRightPanel("dashboard", null);
  };
  const setLeftPaneSize = (size) => {
    leftPaneSize.value = Math.max(10, Math.min(90, size));
  };
  const clearHistory = () => {
    panelHistory.value = [];
  };
  const toggleTheme = () => {
    theme.value = "dark";
    localStorage.setItem("theme", "dark");
    const htmlElement = document.documentElement;
    htmlElement.classList.add("dark");
    htmlElement.classList.remove("light");
    console.log("🎨 主題已鎖定為 Nexus 深色模式");
  };
  const initTheme = () => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add("dark");
    htmlElement.classList.remove("light");
    theme.value = "dark";
  };
  const toggleAssistant = () => {
    showAssistant.value = !showAssistant.value;
    console.log(`🤖 AI 助手: ${showAssistant.value ? "開啟" : "關閉"}`);
  };
  const toggleSidebarCollapse = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    console.log(`📋 側邊欄: ${isSidebarCollapsed.value ? "收起" : "展開"}`);
  };
  const canGoBack = () => panelHistory.value.length > 0;
  const currentPanelTitle = () => {
    const titles = {
      dashboard: "📊 儀表板",
      pdf: "📄 文件預覽",
      graph: "🌐 知識圖譜",
      terminal: "💻 終端面板"
    };
    return titles[rightPanelMode.value] || "未知面板";
  };
  return {
    // State
    theme,
    rightPanelMode,
    rightPanelData,
    leftPaneSize,
    panelHistory,
    showAssistant,
    isSidebarCollapsed,
    // Actions
    setRightPanel,
    goBack,
    openPDF,
    openGraph,
    openTerminal,
    showDashboard,
    setLeftPaneSize,
    clearHistory,
    toggleTheme,
    initTheme,
    toggleAssistant,
    toggleSidebarCollapse,
    // Getters
    canGoBack,
    currentPanelTitle
  };
});
const graphMetadata = [
  {
    id: "graph-tech",
    name: "🧠 技術圖譜",
    description: "AI 與開發技術知識體系",
    color: "#448aff",
    icon: "🧠",
    category: "tech",
    createdAt: "2026-02-02",
    nodeCount: 15,
    linkCount: 20
  },
  {
    id: "graph-learning",
    name: "📚 學習圖譜",
    description: "個人學習與成長記錄",
    color: "#4caf50",
    icon: "📚",
    category: "personal",
    createdAt: "2026-02-02",
    nodeCount: 12,
    linkCount: 15
  }
];
const techGraphData = {
  id: "graph-tech",
  nodes: [
    // AI 核心技術
    {
      id: "tech-1",
      name: "GPT-4",
      type: "AI模型",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#448aff",
      size: 32,
      emoji: "🤖",
      description: "OpenAI 最先進的大語言模型，支持複雜推理和多模態"
    },
    {
      id: "tech-2",
      name: "Claude 3.5",
      type: "AI模型",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#448aff",
      size: 30,
      emoji: "🧠",
      description: "Anthropic 的對話模型，強調安全性和可控性"
    },
    {
      id: "tech-3",
      name: "LangChain",
      type: "框架",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#5a9eff",
      size: 28,
      emoji: "⛓️",
      description: "LLM 應用開發框架，支持鏈式調用和代理"
    },
    {
      id: "tech-4",
      name: "RAG 架構",
      type: "架構",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#448aff",
      size: 30,
      emoji: "📡",
      description: "檢索增強生成，結合知識庫的 AI 系統"
    },
    {
      id: "tech-5",
      name: "Vector DB",
      type: "數據庫",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#5a9eff",
      size: 26,
      emoji: "🗄️",
      description: "向量數據庫，用於語義搜索和相似度匹配"
    },
    // 開發技術
    {
      id: "tech-6",
      name: "Python",
      type: "語言",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#4caf50",
      size: 30,
      emoji: "🐍",
      description: "AI 和數據科學的首選編程語言"
    },
    {
      id: "tech-7",
      name: "FastAPI",
      type: "框架",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#4caf50",
      size: 28,
      emoji: "⚡",
      description: "現代 Python Web 框架，高性能異步"
    },
    {
      id: "tech-8",
      name: "Vue 3",
      type: "框架",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#4caf50",
      size: 28,
      emoji: "💚",
      description: "漸進式前端框架，Composition API"
    },
    {
      id: "tech-9",
      name: "Docker",
      type: "工具",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#4caf50",
      size: 26,
      emoji: "🐳",
      description: "容器化技術，簡化部署和運維"
    },
    {
      id: "tech-10",
      name: "Pinia",
      type: "工具",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#4caf50",
      size: 22,
      emoji: "🍍",
      description: "Vue 3 狀態管理，簡潔易用"
    },
    // 架構與設計
    {
      id: "tech-11",
      name: "微服務",
      type: "架構",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#ab47bc",
      size: 26,
      emoji: "🔧",
      description: "分布式系統架構模式"
    },
    {
      id: "tech-12",
      name: "REST API",
      type: "協議",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#ab47bc",
      size: 24,
      emoji: "🌐",
      description: "RESTful 架構風格的 API 設計"
    },
    {
      id: "tech-13",
      name: "WebSocket",
      type: "協議",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#ab47bc",
      size: 22,
      emoji: "🔌",
      description: "全雙工通信協議，實時數據傳輸"
    },
    {
      id: "tech-14",
      name: "Three.js",
      type: "庫",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#4caf50",
      size: 24,
      emoji: "🎮",
      description: "WebGL 3D 圖形庫"
    },
    {
      id: "tech-15",
      name: "D3.js",
      type: "庫",
      graphId: "graph-tech",
      graphName: "技術圖譜",
      graphColor: "#448aff",
      color: "#4caf50",
      size: 22,
      emoji: "📊",
      description: "數據可視化庫"
    }
  ],
  links: [
    // AI 技術連接
    { source: "tech-1", target: "tech-4", value: 5, label: "支持" },
    { source: "tech-2", target: "tech-4", value: 5, label: "支持" },
    { source: "tech-3", target: "tech-1", value: 4, label: "集成" },
    { source: "tech-3", target: "tech-2", value: 4, label: "集成" },
    { source: "tech-4", target: "tech-5", value: 5, label: "依賴" },
    // 開發技術連接
    { source: "tech-6", target: "tech-7", value: 5, label: "語言" },
    { source: "tech-7", target: "tech-12", value: 4, label: "實現" },
    { source: "tech-8", target: "tech-10", value: 4, label: "使用" },
    { source: "tech-8", target: "tech-14", value: 3, label: "集成" },
    { source: "tech-8", target: "tech-15", value: 3, label: "集成" },
    // 跨層連接
    { source: "tech-1", target: "tech-6", value: 4, label: "SDK" },
    { source: "tech-3", target: "tech-6", value: 5, label: "基於" },
    { source: "tech-7", target: "tech-9", value: 3, label: "部署" },
    { source: "tech-11", target: "tech-7", value: 4, label: "架構" },
    { source: "tech-11", target: "tech-12", value: 4, label: "使用" },
    { source: "tech-13", target: "tech-7", value: 3, label: "實現" }
  ]
};
const learningGraphData = {
  id: "graph-learning",
  nodes: [
    // 學習內容
    {
      id: "learn-1",
      name: "AI 學習筆記",
      type: "筆記",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#4caf50",
      size: 32,
      emoji: "📝",
      description: "深度學習、NLP、LLM 相關學習記錄"
    },
    {
      id: "learn-2",
      name: "編程教程",
      type: "教程",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#4caf50",
      size: 30,
      emoji: "💻",
      description: "Python、JavaScript、Vue 教程合集"
    },
    {
      id: "learn-3",
      name: "系統設計",
      type: "課程",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#4caf50",
      size: 28,
      emoji: "🏗️",
      description: "軟件架構與系統設計原則"
    },
    {
      id: "learn-4",
      name: "算法練習",
      type: "實踐",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#4caf50",
      size: 26,
      emoji: "🧮",
      description: "LeetCode 和算法題目練習"
    },
    {
      id: "learn-5",
      name: "閱讀清單",
      type: "書單",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#ff8b38",
      size: 28,
      emoji: "📚",
      description: "技術書籍和論文閱讀計劃"
    },
    {
      id: "learn-6",
      name: "學習計劃",
      type: "規劃",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#ff8b38",
      size: 26,
      emoji: "📅",
      description: "2026 年度學習目標和時間安排"
    },
    {
      id: "learn-7",
      name: "項目實戰",
      type: "實踐",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#ab47bc",
      size: 30,
      emoji: "🚀",
      description: "實際項目開發經驗積累"
    },
    {
      id: "learn-8",
      name: "開源貢獻",
      type: "實踐",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#ab47bc",
      size: 24,
      emoji: "🌟",
      description: "參與開源項目和社群"
    },
    {
      id: "learn-9",
      name: "技術博客",
      type: "輸出",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#00bcd4",
      size: 26,
      emoji: "✍️",
      description: "技術寫作和知識分享"
    },
    {
      id: "learn-10",
      name: "代碼審查",
      type: "技能",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#00bcd4",
      size: 22,
      emoji: "🔍",
      description: "Code Review 技巧和最佳實踐"
    },
    {
      id: "learn-11",
      name: "測試驅動開發",
      type: "方法論",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#00bcd4",
      size: 24,
      emoji: "🧪",
      description: "TDD 實踐與單元測試"
    },
    {
      id: "learn-12",
      name: "DevOps 實踐",
      type: "技能",
      graphId: "graph-learning",
      graphName: "學習圖譜",
      graphColor: "#4caf50",
      color: "#00bcd4",
      size: 22,
      emoji: "♾️",
      description: "CI/CD、自動化部署和監控"
    }
  ],
  links: [
    // 學習路徑
    { source: "learn-6", target: "learn-1", value: 5, label: "包含" },
    { source: "learn-6", target: "learn-2", value: 5, label: "包含" },
    { source: "learn-6", target: "learn-3", value: 4, label: "包含" },
    { source: "learn-5", target: "learn-1", value: 4, label: "支持" },
    { source: "learn-5", target: "learn-3", value: 3, label: "支持" },
    // 實踐連接
    { source: "learn-2", target: "learn-4", value: 4, label: "實踐" },
    { source: "learn-2", target: "learn-7", value: 5, label: "應用" },
    { source: "learn-3", target: "learn-7", value: 5, label: "應用" },
    { source: "learn-7", target: "learn-8", value: 3, label: "延伸" },
    // 輸出連接
    { source: "learn-1", target: "learn-9", value: 4, label: "產出" },
    { source: "learn-3", target: "learn-9", value: 3, label: "產出" },
    { source: "learn-7", target: "learn-9", value: 4, label: "總結" },
    // 技能連接
    { source: "learn-7", target: "learn-10", value: 3, label: "學習" },
    { source: "learn-7", target: "learn-11", value: 4, label: "實踐" },
    { source: "learn-7", target: "learn-12", value: 3, label: "部署" }
  ]
};
const aiLinks = [
  {
    id: "ai-link-1",
    source: "tech-1",
    // GPT-4
    target: "learn-1",
    // AI 學習筆記
    sourceGraphId: "graph-tech",
    targetGraphId: "graph-learning",
    type: "ai-link",
    confidence: 0.95,
    reason: "主題直接相關：GPT-4 是 AI 學習筆記的核心內容",
    label: "AI 關聯",
    value: 5,
    style: {
      color: "#fbbf24",
      // 金色
      width: 2.5,
      dashArray: [8, 4],
      // 虛線
      animated: true,
      particleSpeed: 0.01
    }
  },
  {
    id: "ai-link-2",
    source: "tech-2",
    // Claude 3.5
    target: "learn-1",
    // AI 學習筆記
    sourceGraphId: "graph-tech",
    targetGraphId: "graph-learning",
    type: "ai-link",
    confidence: 0.93,
    reason: "Claude 也是 AI 學習的重要模型",
    label: "AI 關聯",
    value: 5,
    style: {
      color: "#fbbf24",
      width: 2.5,
      dashArray: [8, 4],
      animated: true,
      particleSpeed: 0.01
    }
  },
  {
    id: "ai-link-3",
    source: "tech-6",
    // Python
    target: "learn-2",
    // 編程教程
    sourceGraphId: "graph-tech",
    targetGraphId: "graph-learning",
    type: "ai-link",
    confidence: 0.9,
    reason: "Python 是編程教程的主要語言",
    label: "AI 關聯",
    value: 5,
    style: {
      color: "#fbbf24",
      width: 2.5,
      dashArray: [8, 4],
      animated: true,
      particleSpeed: 0.01
    }
  },
  {
    id: "ai-link-4",
    source: "tech-3",
    // LangChain
    target: "learn-7",
    // 項目實戰
    sourceGraphId: "graph-tech",
    targetGraphId: "graph-learning",
    type: "ai-link",
    confidence: 0.82,
    reason: "LangChain 在項目實戰中被實際使用",
    label: "AI 關聯",
    value: 4,
    style: {
      color: "#fbbf24",
      width: 2,
      dashArray: [8, 4],
      animated: true,
      particleSpeed: 8e-3
    }
  },
  {
    id: "ai-link-5",
    source: "tech-7",
    // FastAPI
    target: "learn-3",
    // 系統設計
    sourceGraphId: "graph-tech",
    targetGraphId: "graph-learning",
    type: "ai-link",
    confidence: 0.75,
    reason: "FastAPI 涉及系統設計原則和架構實踐",
    label: "AI 關聯",
    value: 3,
    style: {
      color: "#fbbf24",
      width: 1.8,
      dashArray: [8, 4],
      animated: true,
      particleSpeed: 6e-3
    }
  },
  {
    id: "ai-link-6",
    source: "tech-8",
    // Vue 3
    target: "learn-2",
    // 編程教程
    sourceGraphId: "graph-tech",
    targetGraphId: "graph-learning",
    type: "ai-link",
    confidence: 0.85,
    reason: "Vue 3 是前端編程教程的重要內容",
    label: "AI 關聯",
    value: 4,
    style: {
      color: "#fbbf24",
      width: 2,
      dashArray: [8, 4],
      animated: true,
      particleSpeed: 8e-3
    }
  },
  {
    id: "ai-link-7",
    source: "tech-9",
    // Docker
    target: "learn-12",
    // DevOps 實踐
    sourceGraphId: "graph-tech",
    targetGraphId: "graph-learning",
    type: "ai-link",
    confidence: 0.88,
    reason: "Docker 是 DevOps 實踐的核心工具",
    label: "AI 關聯",
    value: 4,
    style: {
      color: "#fbbf24",
      width: 2.2,
      dashArray: [8, 4],
      animated: true,
      particleSpeed: 9e-3
    }
  },
  {
    id: "ai-link-8",
    source: "tech-11",
    // 微服務
    target: "learn-3",
    // 系統設計
    sourceGraphId: "graph-tech",
    targetGraphId: "graph-learning",
    type: "ai-link",
    confidence: 0.92,
    reason: "微服務架構是系統設計的重要主題",
    label: "AI 關聯",
    value: 5,
    style: {
      color: "#fbbf24",
      width: 2.5,
      dashArray: [8, 4],
      animated: true,
      particleSpeed: 0.01
    }
  }
];
const crossGraphData = {
  metadata: graphMetadata,
  graphs: [techGraphData, learningGraphData],
  aiLinks,
  // 統計信息
  stats: {
    totalGraphs: 2,
    totalNodes: 27,
    totalLinks: 31,
    totalAILinks: 8,
    avgConfidence: 0.87
  }
};
const API_TIMEOUT = 3e4;
function getApiToken() {
  return localStorage.getItem("bruv_api_token") || "";
}
async function authFetch(url, options = {}) {
  const token = getApiToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        ...token ? { "Authorization": `Bearer ${token}` } : {}
      }
    });
    if (response.status === 401) {
      localStorage.removeItem("bruv_api_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
class GraphDataManager {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.maxCacheSize = 10;
    this.cacheTTL = 5 * 60 * 1e3;
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.loadingState = {
      isLoading: false,
      currentGraphId: null,
      progress: 0,
      error: null
    };
    this.metadataCache = {
      data: [],
      timestamp: null,
      promise: null
    };
    console.log("✅ GraphDataManager 已初始化");
  }
  // ===== 圖譜數據加載 =====
  /**
   * 加載圖譜數據（帶去重和緩存）
   * @param {string|number} graphId - 圖譜 ID
   * @param {Object} options - 選項
   * @param {boolean} options.forceRefresh - 強制刷新（忽略緩存）
   * @param {boolean} options.silent - 靜默模式（不更新加載狀態）
   * @returns {Promise<Object>} { nodes, links, metadata }
   */
  async loadGraph(graphId, options = {}) {
    const { forceRefresh = false, silent = false } = options;
    if (!forceRefresh) {
      const cached = this.getFromCache(graphId);
      if (cached) {
        console.log(`📦 使用緩存數據: 圖譜 ${graphId}`);
        return cached;
      }
    }
    if (this.pendingRequests.has(graphId)) {
      console.log(`⏳ 等待現有請求: 圖譜 ${graphId}`);
      return this.pendingRequests.get(graphId);
    }
    const requestPromise = this._fetchGraphFromAPI(graphId, silent);
    this.pendingRequests.set(graphId, requestPromise);
    try {
      const result = await requestPromise;
      this.saveToCache(graphId, result);
      return result;
    } finally {
      this.pendingRequests.delete(graphId);
    }
  }
  /**
   * 從 API 獲取圖譜數據（私有方法）
   */
  async _fetchGraphFromAPI(graphId, silent = false) {
    var _a, _b;
    if (!silent) {
      this.loadingState.isLoading = true;
      this.loadingState.currentGraphId = graphId;
      this.loadingState.progress = 0;
      this.loadingState.error = null;
    }
    try {
      console.log(`🔄 從 API 加載圖譜: ${graphId}`);
      const response = await authFetch(`/api/graph/data?graph_id=${encodeURIComponent(graphId)}`);
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(((_b = (_a = result.data) == null ? void 0 : _a.metadata) == null ? void 0 : _b.note) || "獲取圖譜數據失敗");
      }
      const { nodes, links, metadata } = result.data;
      console.log(`✅ 圖譜數據已加載: ${graphId} (${(nodes == null ? void 0 : nodes.length) || 0} 節點, ${(links == null ? void 0 : links.length) || 0} 連接)`);
      return {
        nodes: nodes || [],
        links: links || [],
        metadata: metadata || {}
      };
    } catch (error) {
      this.loadingState.error = error.message;
      console.error(`❌ 圖譜加載失敗 (${graphId}):`, error);
      throw error;
    } finally {
      if (!silent) {
        this.loadingState.isLoading = false;
        this.loadingState.progress = 100;
      }
    }
  }
  // ===== 圖譜元數據管理 =====
  /**
   * 加載圖譜元數據列表（帶去重和緩存）
   * @param {Object} options - 選項
   * @param {boolean} options.forceRefresh - 強制刷新
   * @returns {Promise<Array>} 圖譜列表
   */
  async loadMetadataList(options = {}) {
    const { forceRefresh = false } = options;
    if (!forceRefresh && this.metadataCache.data.length > 0) {
      const age = Date.now() - (this.metadataCache.timestamp || 0);
      if (age < this.cacheTTL) {
        console.log(`📦 使用緩存的元數據列表 (${this.metadataCache.data.length} 個)`);
        return this.metadataCache.data;
      }
    }
    if (this.metadataCache.promise) {
      console.log("⏳ 等待現有元數據請求");
      return this.metadataCache.promise;
    }
    const requestPromise = this._fetchMetadataFromAPI();
    this.metadataCache.promise = requestPromise;
    try {
      const result = await requestPromise;
      this.metadataCache.data = result;
      this.metadataCache.timestamp = Date.now();
      return result;
    } finally {
      this.metadataCache.promise = null;
    }
  }
  /**
   * 從 API 獲取元數據列表（私有方法）
   */
  async _fetchMetadataFromAPI() {
    console.log("🔄 從 API 加載圖譜元數據列表");
    try {
      const response = await authFetch("/api/graph/metadata");
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success || !result.graphs) {
        throw new Error("獲取圖譜列表失敗");
      }
      console.log(`✅ 圖譜列表已加載: ${result.graphs.length} 個`);
      return result.graphs;
    } catch (error) {
      console.error("❌ 元數據加載失敗:", error);
      return [];
    }
  }
  // ===== 緩存管理 =====
  /**
   * 從緩存獲取數據
   */
  getFromCache(graphId) {
    const cached = this.cache.get(String(graphId));
    if (!cached) {
      return null;
    }
    const age = Date.now() - cached.timestamp;
    if (age > this.cacheTTL) {
      console.log(`⏰ 緩存已過期: 圖譜 ${graphId}`);
      this.cache.delete(String(graphId));
      return null;
    }
    return cached.data;
  }
  /**
   * 保存到緩存（LRU 策略）
   */
  saveToCache(graphId, data) {
    const key = String(graphId);
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      console.log(`🗑️ 緩存已滿，移除: 圖譜 ${firstKey}`);
      this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 數據已緩存: 圖譜 ${graphId} (緩存數: ${this.cache.size})`);
  }
  /**
   * 清空指定圖譜的緩存
   */
  invalidateCache(graphId) {
    if (graphId) {
      this.cache.delete(String(graphId));
      console.log(`🗑️ 緩存已清除: 圖譜 ${graphId}`);
    } else {
      this.cache.clear();
      console.log("🗑️ 所有緩存已清除");
    }
  }
  /**
   * 清空元數據緩存
   */
  invalidateMetadataCache() {
    this.metadataCache.data = [];
    this.metadataCache.timestamp = null;
    console.log("🗑️ 元數據緩存已清除");
  }
  // ===== 圖譜操作（會自動同步緩存）=====
  /**
   * 創建圖譜
   */
  async createGraph(graphData) {
    console.log("🔄 創建新圖譜:", graphData.name);
    try {
      const response = await authFetch("/api/graph/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: graphData.name.trim(),
          description: graphData.description || `自定義圖譜：${graphData.name}`,
          icon: graphData.icon || "🌐",
          color: graphData.color || "#3b82f6"
        })
      });
      if (!response.ok) {
        throw new Error(`創建圖譜失敗: HTTP ${response.status}`);
      }
      const result = await response.json();
      if (!result.success || !result.graph) {
        throw new Error(result.message || "創建圖譜失敗");
      }
      this.invalidateMetadataCache();
      console.log("✅ 圖譜創建成功:", result.graph);
      return result.graph;
    } catch (error) {
      console.error("❌ 圖譜創建失敗:", error);
      throw error;
    }
  }
  /**
   * 刪除圖譜
   */
  async deleteGraph(graphId) {
    console.log("🔄 刪除圖譜:", graphId);
    try {
      const response = await authFetch(`/api/graph/metadata/${graphId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error(`刪除圖譜失敗: HTTP ${response.status}`);
      }
      this.invalidateCache(graphId);
      this.invalidateMetadataCache();
      console.log("✅ 圖譜已刪除:", graphId);
      return true;
    } catch (error) {
      console.error("❌ 圖譜刪除失敗:", error);
      throw error;
    }
  }
  // ===== 工具方法 =====
  /**
   * 獲取加載狀態
   */
  getLoadingState() {
    return { ...this.loadingState };
  }
  /**
   * 獲取緩存統計
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys()),
      metadataCount: this.metadataCache.data.length,
      metadataCached: this.metadataCache.timestamp !== null
    };
  }
  /**
   * 預載入圖譜（後台靜默加載）
   */
  async preloadGraph(graphId) {
    console.log(`🔮 預載入圖譜: ${graphId}`);
    try {
      await this.loadGraph(graphId, { silent: true });
    } catch (error) {
      console.warn(`⚠️ 預載入失敗: ${graphId}`, error.message);
    }
  }
}
const graphDataManager = new GraphDataManager();
const useGraphStore = /* @__PURE__ */ defineStore("graph", () => {
  const nodes = ref([]);
  const links = ref([]);
  const selectedNode = ref(null);
  const viewMode = ref(localStorage.getItem("graphViewMode") || "2d");
  const loading = ref(false);
  const error = ref(null);
  const lastUpdate = ref(null);
  const filterMode = ref("all");
  const graphMetadataList = ref([]);
  const aiLinks2 = ref([]);
  const activeGraphIds = ref([]);
  const isCrossGraphMode = ref(false);
  const importedFiles = ref([]);
  const currentGraphId = ref(1);
  const loadGraphMetadataList = async (options = {}) => {
    try {
      const graphs = await graphDataManager.loadMetadataList(options);
      graphMetadataList.value = graphs;
      console.log(`✅ [Store] 圖譜列表已加載: ${graphs.length} 個`);
      return graphs;
    } catch (error2) {
      console.error("❌ [Store] 加載圖譜列表失敗:", error2);
      throw error2;
    }
  };
  const nodeCount = computed(() => nodes.value.length);
  const linkCount = computed(() => links.value.length);
  const hasSelection = computed(() => selectedNode.value !== null);
  const is3DMode = computed(() => viewMode.value === "3d");
  const is2DMode = computed(() => viewMode.value === "2d");
  const nodesByType = computed(() => {
    const groups = {};
    nodes.value.forEach((node) => {
      const type = node.type || "unknown";
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(node);
    });
    return groups;
  });
  const filteredNodes = computed(() => {
    if (filterMode.value === "all") {
      return nodes.value;
    }
    if (!selectedNode.value) {
      return nodes.value;
    }
    if (filterMode.value === "focus") {
      const neighbors = getNeighbors(selectedNode.value.id);
      const neighborIds = new Set(neighbors.map((n) => n.id));
      neighborIds.add(selectedNode.value.id);
      return nodes.value.filter((n) => neighborIds.has(n.id));
    }
    if (filterMode.value === "part") {
      const selectedGroup = selectedNode.value.group;
      return nodes.value.filter((n) => n.group === selectedGroup);
    }
    return nodes.value;
  });
  const filteredLinks = computed(() => {
    if (filterMode.value === "all") {
      return links.value;
    }
    const nodeIds = new Set(filteredNodes.value.map((n) => n.id));
    return links.value.filter((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
  });
  const allLinks = computed(() => {
    if (!isCrossGraphMode.value) {
      return links.value;
    }
    return [...links.value, ...aiLinks2.value];
  });
  const nodesByGraph = computed(() => {
    const groups = {};
    nodes.value.forEach((node) => {
      const graphId = node.graphId || "default";
      if (!groups[graphId]) {
        groups[graphId] = [];
      }
      groups[graphId].push(node);
    });
    return groups;
  });
  const graphStats = computed(() => {
    return {
      totalGraphs: graphMetadataList.value.length,
      activeGraphs: activeGraphIds.value.length,
      totalNodes: nodes.value.length,
      totalLinks: links.value.length,
      totalAILinks: aiLinks2.value.length,
      isCrossGraphMode: isCrossGraphMode.value
    };
  });
  const fetchGraphData = async (graphId = 1, options = {}) => {
    loading.value = true;
    error.value = null;
    try {
      currentGraphId.value = graphId;
      console.log(`🔄 [Store] 加載圖譜數據: ${graphId}`);
      const result = await graphDataManager.loadGraph(graphId, options);
      const { nodes: apiNodes, links: apiLinks, metadata } = result;
      nodes.value = apiNodes || [];
      links.value = apiLinks || [];
      lastUpdate.value = /* @__PURE__ */ new Date();
      const existingIndex = graphMetadataList.value.findIndex((g) => String(g.id) === String(graphId));
      if (existingIndex >= 0) {
        graphMetadataList.value[existingIndex] = {
          ...graphMetadataList.value[existingIndex],
          nodeCount: apiNodes.length,
          linkCount: (apiLinks == null ? void 0 : apiLinks.length) || 0,
          lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
        };
      } else {
        graphMetadataList.value.push({
          id: graphId,
          name: (metadata == null ? void 0 : metadata.note) || `圖譜 ${graphId}`,
          description: "從 KuzuDB 載入的知識圖譜",
          icon: "🌐",
          color: "#3b82f6",
          nodeCount: apiNodes.length,
          linkCount: (apiLinks == null ? void 0 : apiLinks.length) || 0,
          lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      console.log(`✅ [Store] 圖譜數據已同步: ${apiNodes.length} 節點, ${(apiLinks == null ? void 0 : apiLinks.length) || 0} 連接`);
      return { nodes: apiNodes, links: apiLinks || [] };
    } catch (err) {
      error.value = err.message || "數據加載失敗";
      console.error("❌ [Store] 圖譜數據加載錯誤:", err);
      nodes.value = [];
      links.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const fetchNeighbors = async (entityId) => {
    if (!entityId) {
      throw new Error("entityId 不能為空");
    }
    loading.value = true;
    error.value = null;
    try {
      console.log(`🔄 正在獲取節點 ${entityId} 的鄰居...`);
      const response = await fetch(`/api/graph/entities/${entityId}/neighbors`);
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "獲取鄰居節點失敗");
      }
      console.log(`✅ 鄰居節點已加載:`, data.data);
      return data.data;
    } catch (err) {
      error.value = err.message || "獲取鄰居節點失敗";
      console.error("❌ 獲取鄰居節點錯誤:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const executeCypherQuery = async (query, params = {}) => {
    if (!query) {
      throw new Error("query 不能為空");
    }
    loading.value = true;
    error.value = null;
    try {
      console.log(`🔄 正在執行 Cypher 查詢...`);
      console.log("Query:", query);
      const response = await fetch("/api/graph/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, params })
      });
      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Cypher 查詢失敗");
      }
      console.log(`✅ Cypher 查詢結果:`, data.data);
      return data.data;
    } catch (err) {
      error.value = err.message || "Cypher 查詢失敗";
      console.error("❌ Cypher 查詢錯誤:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const selectNode = (nodeId) => {
    if (nodeId === null) {
      selectedNode.value = null;
      console.log("🔍 取消選中節點");
      return;
    }
    const node = nodes.value.find((n) => n.id === nodeId);
    if (node) {
      selectedNode.value = node;
      console.log("🔍 選中節點:", node.name, `(${node.type})`);
    } else {
      console.warn("⚠️ 節點不存在:", nodeId);
    }
  };
  const focusNode = (nodeId) => {
    if (!nodeId) {
      console.warn("⚠️ focusNode: nodeId 不能為空");
      return;
    }
    const node = nodes.value.find((n) => n.id === nodeId);
    if (node) {
      selectedNode.value = node;
      console.log("🎯 對焦節點:", node.label || node.name, `(ID: ${node.id})`);
    } else {
      console.warn("⚠️ 找不到節點:", nodeId);
    }
  };
  const toggleViewMode = () => {
    const newMode = viewMode.value === "3d" ? "2d" : "3d";
    viewMode.value = newMode;
    localStorage.setItem("graphViewMode", newMode);
    console.log(`🔄 視圖模式已切換至: ${newMode.toUpperCase()}`);
  };
  const setViewMode = (mode) => {
    if (!["2d", "3d"].includes(mode)) {
      console.error("❌ 無效的視圖模式:", mode);
      return;
    }
    viewMode.value = mode;
    localStorage.setItem("graphViewMode", mode);
    console.log(`✅ 視圖模式已設置為: ${mode.toUpperCase()}`);
  };
  const getNodeById = (nodeId) => {
    return nodes.value.find((n) => n.id === nodeId);
  };
  const getNodesByType = (type) => {
    return nodes.value.filter((n) => n.type === type);
  };
  const getNodeLinks = (nodeId) => {
    return links.value.filter(
      (link) => link.source === nodeId || link.target === nodeId
    );
  };
  const getNeighbors = (nodeId) => {
    const nodeLinks = getNodeLinks(nodeId);
    const neighborIds = /* @__PURE__ */ new Set();
    nodeLinks.forEach((link) => {
      if (link.source === nodeId) {
        neighborIds.add(link.target);
      } else {
        neighborIds.add(link.source);
      }
    });
    return nodes.value.filter((n) => neighborIds.has(n.id));
  };
  const clearSelection = () => {
    selectedNode.value = null;
  };
  const resetGraph = () => {
    nodes.value = [];
    links.value = [];
    selectedNode.value = null;
    lastUpdate.value = null;
    error.value = null;
    console.log("🔄 圖譜數據已重置");
  };
  const addNode = (node) => {
    if (!node.id) {
      console.error("❌ 節點必須包含 id 屬性");
      return null;
    }
    const exists = nodes.value.some((n) => n.id === node.id);
    if (exists) {
      console.warn("⚠️ 節點已存在:", node.id);
      return null;
    }
    const formattedNode = {
      id: node.id,
      name: node.name || node.label || node.id,
      // 支持 label 別名
      label: node.label || node.name || node.id,
      // 確保 label 存在
      type: node.type || "檔案",
      // 預設類型
      group: node.group || 7,
      // group 7 代表檔案類型（可根據實際分類調整）
      color: node.color || "#9e9e9e",
      // 預設灰色
      size: node.size || 24,
      // 預設大小
      description: node.description || "",
      // 描述資訊
      emoji: node.emoji || "📄",
      // 預設檔案圖示
      ...node
      // 保留其他自定義屬性
    };
    nodes.value = [...nodes.value, formattedNode];
    console.log("➕ 節點已添加:", formattedNode.name || formattedNode.id);
    selectNode(formattedNode.id);
    console.log("✨ 已自動選中新節點:", formattedNode.name);
    return formattedNode;
  };
  const addBatchNodes = (nodeArray) => {
    if (!Array.isArray(nodeArray)) {
      console.error("❌ addBatchNodes 需要陣列參數");
      return { success: 0, skipped: 0, failed: 0, lastNodeId: null };
    }
    const stats = { success: 0, skipped: 0, failed: 0, lastNodeId: null };
    const newNodes = [];
    nodeArray.forEach((node) => {
      try {
        if (!node.id) {
          console.warn("⚠️ 跳過無 id 的節點:", node);
          stats.failed++;
          return;
        }
        const exists = nodes.value.some((n) => n.id === node.id);
        if (exists) {
          console.warn("⚠️ 節點已存在，跳過:", node.id);
          stats.skipped++;
          return;
        }
        const formattedNode = {
          id: node.id,
          name: node.name || node.label || node.id,
          label: node.label || node.name || node.id,
          type: node.type || "檔案",
          group: node.group || 7,
          color: node.color || "#9e9e9e",
          size: node.size || 24,
          description: node.description || "",
          emoji: node.emoji || "📄",
          ...node
        };
        newNodes.push(formattedNode);
        stats.success++;
        stats.lastNodeId = formattedNode.id;
      } catch (error2) {
        console.error("❌ 添加節點失敗:", node, error2);
        stats.failed++;
      }
    });
    if (newNodes.length > 0) {
      nodes.value = [...nodes.value, ...newNodes];
      if (stats.lastNodeId) {
        selectNode(stats.lastNodeId);
        console.log("✨ 已自動選中最後添加的節點:", stats.lastNodeId);
      }
    }
    console.log(`📦 批量添加節點完成: 成功 ${stats.success}, 跳過 ${stats.skipped}, 失敗 ${stats.failed}`);
    return stats;
  };
  const addLink = (link) => {
    if (!link.source || !link.target) {
      console.error("❌ 連線必須包含 source 和 target 屬性");
      return;
    }
    links.value.push(link);
    console.log("🔗 連線已添加:", `${link.source} -> ${link.target}`);
  };
  const updateNode = (nodeId, updates) => {
    var _a;
    const nodeIndex = nodes.value.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) {
      console.error("❌ 節點不存在:", nodeId);
      return;
    }
    nodes.value[nodeIndex] = {
      ...nodes.value[nodeIndex],
      ...updates
    };
    if (((_a = selectedNode.value) == null ? void 0 : _a.id) === nodeId) {
      selectedNode.value = nodes.value[nodeIndex];
    }
    console.log("✏️ 節點已更新:", nodeId, updates);
  };
  const deleteNode = (nodeId) => {
    var _a;
    nodes.value = nodes.value.filter((n) => n.id !== nodeId);
    links.value = links.value.filter(
      (link) => link.source !== nodeId && link.target !== nodeId
    );
    if (((_a = selectedNode.value) == null ? void 0 : _a.id) === nodeId) {
      selectedNode.value = null;
    }
    console.log("🗑️ 節點已刪除:", nodeId);
  };
  const setFilterMode = (mode) => {
    if (!["all", "focus", "part"].includes(mode)) {
      console.error("❌ 無效的過濾模式:", mode);
      return;
    }
    filterMode.value = mode;
    console.log("🔎 過濾模式已切換:", mode);
  };
  const importFile = async (file, mode = "single") => {
    var _a, _b;
    try {
      console.log("📥 開始匯入檔案:", file.name, "模式:", mode);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      if (mode === "multi" && file.name.endsWith(".xlsx")) {
        console.log("📋 多節點模式：模擬解析 Excel 檔案");
        const mockRowCount = 3;
        for (let i = 1; i <= mockRowCount; i++) {
          const newNode = {
            id: `excel_row_${Date.now()}_${i}`,
            name: `${file.name} - 第 ${i} 列`,
            label: `Excel 資料列 ${i}`,
            group: "resource",
            type: "Resource",
            color: "#10b981",
            size: 1,
            timestamp: Date.now(),
            description: `從 ${file.name} 的第 ${i} 列解析`
          };
          addNode(newNode);
          importedFiles.value.unshift({
            id: Date.now() + i,
            nodeId: newNode.id,
            name: `第 ${i} 列 - ${file.name}`,
            ext: "ROW",
            status: `Excel 第 ${i} 列`,
            timestamp: Date.now()
          });
        }
        console.log(`✅ Excel 匯入成功: ${file.name} → ${mockRowCount} 個節點`);
        return { nodeCount: mockRowCount };
      } else {
        const newNode = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          label: file.name,
          group: "file",
          type: file.type || "document",
          fileType: (_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase(),
          color: "#3b82f6",
          size: 1.2,
          timestamp: Date.now(),
          aiStatus: "linked",
          description: `從檔案 ${file.name} 匯入`
        };
        addNode(newNode);
        importedFiles.value.unshift({
          id: Date.now(),
          nodeId: newNode.id,
          name: file.name,
          ext: ((_b = file.name.split(".").pop()) == null ? void 0 : _b.toUpperCase()) || "FILE",
          status: "AI 已關聯",
          timestamp: Date.now()
        });
        selectedNode.value = newNode;
        console.log("✅ 檔案匯入成功:", file.name, "→", newNode.id);
        return newNode;
      }
    } catch (err) {
      console.error("❌ 檔案匯入失敗:", err);
      error.value = "檔案匯入失敗: " + err.message;
      throw err;
    }
  };
  const importMultipleFiles = async (files) => {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error("檔案陣列不能為空");
    }
    loading.value = true;
    error.value = null;
    try {
      console.log(`🔄 正在上傳 ${files.length} 個檔案...`);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      const response = await fetch("/api/graph/import/files", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "未知錯誤" }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("伺服器回傳數據格式錯誤");
      }
      const stats = addBatchNodes(data);
      console.log(`✅ 檔案匯入成功:`, stats);
      return stats;
    } catch (err) {
      error.value = err.message || "檔案匯入失敗";
      console.error("❌ 檔案上傳失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const loadCrossGraphData = async (graphIds = ["graph-tech", "graph-learning"]) => {
    loading.value = true;
    error.value = null;
    try {
      console.log("🔄 正在加載跨圖譜數據:", graphIds);
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (graphMetadataList.value.length === 0) {
        console.log("⚙️ 初始化圖譜元數據（使用測試數據）");
        graphMetadataList.value = crossGraphData.metadata;
      }
      if (aiLinks2.value.length === 0) {
        console.log("⚙️ 初始化 AI Links（使用測試數據）");
        aiLinks2.value = crossGraphData.aiLinks;
      }
      const allNodes = [];
      const allLinks2 = [];
      crossGraphData.graphs.forEach((graph) => {
        if (graphIds.includes(graph.id)) {
          allNodes.push(...graph.nodes);
          allLinks2.push(...graph.links);
        }
      });
      nodes.value = allNodes;
      links.value = allLinks2;
      activeGraphIds.value = graphIds;
      isCrossGraphMode.value = true;
      lastUpdate.value = /* @__PURE__ */ new Date();
      console.log("📊 跨圖譜數據已加載:", {
        graphs: graphIds,
        nodes: allNodes.length,
        links: allLinks2.length,
        aiLinks: aiLinks2.value.length
      });
      return {
        metadata: graphMetadataList.value,
        nodes: allNodes,
        links: allLinks2,
        aiLinks: aiLinks2.value
      };
    } catch (err) {
      error.value = err.message || "跨圖譜數據加載失敗";
      console.error("❌ 跨圖譜數據加載錯誤:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const exitCrossGraphMode = () => {
    isCrossGraphMode.value = false;
    aiLinks2.value = [];
    activeGraphIds.value = [];
    graphMetadataList.value = [];
    console.log("✅ 已退出跨圖譜模式");
  };
  const toggleGraphVisibility = (graphId) => {
    const index = activeGraphIds.value.indexOf(graphId);
    if (index > -1) {
      activeGraphIds.value.splice(index, 1);
    } else {
      activeGraphIds.value.push(graphId);
    }
    if (activeGraphIds.value.length > 0) {
      loadCrossGraphData(activeGraphIds.value);
    } else {
      exitCrossGraphMode();
    }
  };
  const getNodeGraph = (nodeId) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node || !node.graphId) return null;
    return graphMetadataList.value.find((g) => g.id === node.graphId) || null;
  };
  const getAILinkStats = () => {
    const stats = {
      total: aiLinks2.value.length,
      byConfidence: {
        high: aiLinks2.value.filter((l) => l.confidence >= 0.8).length,
        medium: aiLinks2.value.filter((l) => l.confidence >= 0.5 && l.confidence < 0.8).length,
        low: aiLinks2.value.filter((l) => l.confidence < 0.5).length
      },
      avgConfidence: aiLinks2.value.reduce((sum, l) => sum + l.confidence, 0) / (aiLinks2.value.length || 1)
    };
    return stats;
  };
  const snapshotWorkspaceGraph = () => {
    if (nodes.value.length === 0) {
      throw new Error("工作檯暫無圖譜數據");
    }
    const snapshot = {
      id: "workspace-snapshot-" + Date.now(),
      name: "工作檯快照",
      description: `包含 ${nodes.value.length} 個節點，${links.value.length} 個連接`,
      icon: "🌐",
      color: "#3b82f6",
      nodeCount: nodes.value.length,
      linkCount: links.value.length,
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      links: JSON.parse(JSON.stringify(links.value)),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log("📸 工作檯圖譜快照已創建:", snapshot);
    return snapshot;
  };
  const clearGraphMetadata = () => {
    graphMetadataList.value = [];
    localStorage.removeItem("graphMetadataList");
    console.log("🗑️ 已清除所有圖譜元數據");
  };
  const createGraph = async (graphData) => {
    if (!graphData.name || !graphData.name.trim()) {
      throw new Error("圖譜名稱不能為空");
    }
    loading.value = true;
    error.value = null;
    try {
      console.log("🔄 [Store] 創建新圖譜:", graphData.name);
      const newGraph = await graphDataManager.createGraph(graphData);
      graphMetadataList.value.push(newGraph);
      console.log("✅ [Store] 圖譜創建成功並已同步:", newGraph);
      return newGraph;
    } catch (err) {
      error.value = err.message || "圖譜創建失敗";
      console.error("❌ [Store] 圖譜創建錯誤:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const createEntity = async (entity) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch("/api/graph/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          description: entity.description || "",
          properties: entity.properties || {},
          graph_id: String(currentGraphId.value || "1")
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        addNode({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          description: entity.description || "",
          ...entity
        });
        console.log("✅ 實體已創建並同步到 store:", entity.name);
        return result;
      } else {
        throw new Error(result.detail || result.message || "創建實體失敗");
      }
    } catch (err) {
      error.value = err.message;
      console.error("❌ createEntity 錯誤:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const batchCreateEntities = async (entities) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch("/api/graph/batch-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entities: entities.map((e) => ({
            ...e,
            graph_id: String(currentGraphId.value || "1")
          }))
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "批量創建失敗");
      }
      const result = await response.json();
      addBatchNodes(entities);
      console.log("✅ 批量實體已創建並同步到 store:", entities.length, "筆");
      return result;
    } catch (err) {
      error.value = err.message;
      console.error("❌ batchCreateEntities 錯誤:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const uploadFileToGraph = async (file, graphId, graphMode = "existing") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("graph_id", graphId);
    formData.append("graph_mode", graphMode);
    try {
      const response = await fetch("/api/system/upload", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        await fetchGraphData(currentGraphId.value);
        console.log("✅ 文件上傳成功並已重新同步圖譜");
      }
      return result;
    } catch (err) {
      console.error("❌ uploadFileToGraph 錯誤:", err);
      throw err;
    }
  };
  return {
    // State
    nodes,
    links,
    selectedNode,
    viewMode,
    loading,
    error,
    lastUpdate,
    filterMode,
    importedFiles,
    currentGraphId,
    // 跨圖譜狀態
    graphMetadataList,
    aiLinks: aiLinks2,
    activeGraphIds,
    isCrossGraphMode,
    // Computed
    nodeCount,
    linkCount,
    hasSelection,
    is3DMode,
    is2DMode,
    nodesByType,
    filteredNodes,
    filteredLinks,
    // 跨圖譜 Computed
    allLinks,
    nodesByGraph,
    graphStats,
    // Actions
    fetchGraphData,
    fetchNeighbors,
    executeCypherQuery,
    selectNode,
    focusNode,
    toggleViewMode,
    setViewMode,
    getNodeById,
    getNodesByType,
    getNodeLinks,
    getNeighbors,
    clearSelection,
    resetGraph,
    addNode,
    addBatchNodes,
    addLink,
    updateNode,
    deleteNode,
    setFilterMode,
    importFile,
    importMultipleFiles,
    // 跨圖譜 Actions
    loadCrossGraphData,
    exitCrossGraphMode,
    toggleGraphVisibility,
    getNodeGraph,
    getAILinkStats,
    snapshotWorkspaceGraph,
    clearGraphMetadata,
    createGraph,
    loadGraphMetadataList,
    // 統一 API Actions（同步 store）
    createEntity,
    batchCreateEntities,
    uploadFileToGraph
  };
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _hoisted_1$6 = {
  key: 0,
  class: "ai-copilot"
};
const _hoisted_2$6 = { class: "copilot-header" };
const _hoisted_3$6 = {
  key: 0,
  class: "welcome-section"
};
const _hoisted_4$6 = {
  key: 1,
  class: "messages-list"
};
const _hoisted_5$6 = { class: "message-bubble" };
const _hoisted_6$5 = {
  key: 0,
  class: "mode-badge"
};
const _hoisted_7$3 = { class: "message-content" };
const _hoisted_8$1 = { key: 0 };
const _hoisted_9$1 = ["innerHTML"];
const _hoisted_10$1 = { class: "message-time" };
const _hoisted_11$1 = {
  key: 2,
  class: "typing-indicator"
};
const _hoisted_12$1 = { class: "input-area" };
const _hoisted_13$1 = ["onKeydown"];
const _hoisted_14$1 = ["disabled", "title"];
const _hoisted_15$1 = { key: 0 };
const _hoisted_16$1 = {
  key: 1,
  class: "spinner"
};
const DIFY_USER = "bruce";
const _sfc_main$6 = {
  __name: "AICopilot",
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const API_BASE_URL = "";
    const messages = ref([]);
    const inputMessage = ref("");
    const inputRef = ref(null);
    const chatArea = ref(null);
    const isSending = ref(false);
    const isTyping = ref(false);
    const formatTime = () => {
      const now = /* @__PURE__ */ new Date();
      return now.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const formatMessage = (content) => {
      if (!content) return "";
      let formatted = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`(.*?)`/g, '<code class="inline-code">$1</code>').replace(/\n/g, "<br>").replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
      return formatted;
    };
    const typewriterEffect = async (message, fullText) => {
      message.displayText = "";
      message.typing = true;
      const chars = fullText.split("");
      const delay = 20;
      for (let i = 0; i < chars.length; i++) {
        message.displayText += chars[i];
        await new Promise((resolve) => setTimeout(resolve, delay));
        scrollToBottom();
      }
      message.typing = false;
      message.content = fullText;
    };
    const scrollToBottom = () => {
      nextTick(() => {
        if (chatArea.value) {
          chatArea.value.scrollTop = chatArea.value.scrollHeight;
        }
      });
    };
    const sendMessage = async () => {
      const trimmedMessage = inputMessage.value.trim();
      if (!trimmedMessage || isSending.value) return;
      const userMessage = {
        role: "user",
        content: trimmedMessage,
        timestamp: formatTime(),
        typing: false,
        displayText: ""
      };
      messages.value.push(userMessage);
      inputMessage.value = "";
      isSending.value = true;
      scrollToBottom();
      isTyping.value = true;
      try {
        const response = await fetch(`${API_BASE_URL}/api/dify/agent/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: trimmedMessage,
            user: DIFY_USER
          })
        });
        if (!response.ok) {
          let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.detail) {
              errorDetail = errorData.detail;
            }
          } catch (parseError) {
            console.warn("無法解析錯誤回應:", parseError);
          }
          throw new Error(errorDetail);
        }
        const data = await response.json();
        const aiResponse = data.answer || "抱歉，我無法理解您的問題。";
        let modeLabel = "";
        if (data.detected_intent === "rag") {
          modeLabel = "📚 知識檢索";
        } else if (data.detected_intent === "automation") {
          modeLabel = "🔧 自動化";
        } else if (data.detected_intent === "chat") {
          modeLabel = "💬 閒聊";
        }
        isTyping.value = false;
        const aiMessage = reactive({
          role: "assistant",
          content: "",
          displayText: "",
          typing: false,
          timestamp: formatTime(),
          mode: data.detected_intent,
          modeLabel
        });
        messages.value.push(aiMessage);
        await typewriterEffect(aiMessage, aiResponse);
        console.log("AI 回應:", data);
      } catch (error) {
        console.error("發送訊息失敗:", error);
        isTyping.value = false;
        const errorMessage = reactive({
          role: "assistant",
          content: "",
          displayText: "",
          typing: false,
          timestamp: formatTime()
        });
        messages.value.push(errorMessage);
        const errorMsg = error.message || "未知錯誤";
        let errorText = `❌ **發生錯誤**

${errorMsg}`;
        await typewriterEffect(errorMessage, errorText);
      } finally {
        isSending.value = false;
        scrollToBottom();
      }
    };
    const insertNewLine = () => {
      const textarea = inputRef.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      inputMessage.value = inputMessage.value.substring(0, start) + "\n" + inputMessage.value.substring(end);
      nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      });
    };
    watch(inputMessage, () => {
      nextTick(() => {
        if (inputRef.value) {
          inputRef.value.style.height = "auto";
          inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 80) + "px";
        }
      });
    });
    watch(() => props.show, (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (inputRef.value) {
            inputRef.value.focus();
          }
        });
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, { name: "slide-in" }, {
        default: withCtx(() => [
          __props.show ? (openBlock(), createElementBlock("div", _hoisted_1$6, [
            createBaseVNode("div", _hoisted_2$6, [
              _cache[2] || (_cache[2] = createBaseVNode("div", { class: "header-left" }, [
                createBaseVNode("span", { class: "ai-avatar" }, "🤖"),
                createBaseVNode("div", { class: "header-info" }, [
                  createBaseVNode("h3", { class: "header-title" }, "AI 助手"),
                  createBaseVNode("p", { class: "header-status" }, [
                    createBaseVNode("span", { class: "status-dot" }),
                    createTextVNode(" 線上服務中 ")
                  ])
                ])
              ], -1)),
              createBaseVNode("button", {
                class: "close-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("close")),
                title: "關閉"
              }, " ✕ ")
            ]),
            createBaseVNode("div", {
              class: "chat-area",
              ref_key: "chatArea",
              ref: chatArea
            }, [
              messages.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_3$6, [..._cache[3] || (_cache[3] = [
                createBaseVNode("div", { class: "welcome-icon" }, "✨", -1),
                createBaseVNode("h4", { class: "welcome-title" }, "嗨！我是 AI 助手", -1),
                createBaseVNode("p", { class: "welcome-subtitle" }, "有什麼需要幫助的嗎？", -1)
              ])])) : (openBlock(), createElementBlock("div", _hoisted_4$6, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(messages.value, (message, index) => {
                  return openBlock(), createElementBlock("div", {
                    key: index,
                    class: normalizeClass(["message-item", message.role === "user" ? "user-message" : "ai-message"])
                  }, [
                    createBaseVNode("div", _hoisted_5$6, [
                      message.role === "assistant" && message.modeLabel ? (openBlock(), createElementBlock("div", _hoisted_6$5, toDisplayString(message.modeLabel), 1)) : createCommentVNode("", true),
                      createBaseVNode("div", _hoisted_7$3, [
                        message.typing ? (openBlock(), createElementBlock("span", _hoisted_8$1, [
                          createTextVNode(toDisplayString(message.displayText), 1),
                          _cache[4] || (_cache[4] = createBaseVNode("span", { class: "cursor" }, "|", -1))
                        ])) : (openBlock(), createElementBlock("span", {
                          key: 1,
                          innerHTML: formatMessage(message.content)
                        }, null, 8, _hoisted_9$1))
                      ]),
                      createBaseVNode("div", _hoisted_10$1, toDisplayString(message.timestamp), 1)
                    ])
                  ], 2);
                }), 128))
              ])),
              isTyping.value ? (openBlock(), createElementBlock("div", _hoisted_11$1, [..._cache[5] || (_cache[5] = [
                createBaseVNode("span", { class: "dot" }, null, -1),
                createBaseVNode("span", { class: "dot" }, null, -1),
                createBaseVNode("span", { class: "dot" }, null, -1)
              ])])) : createCommentVNode("", true)
            ], 512),
            createBaseVNode("div", _hoisted_12$1, [
              withDirectives(createBaseVNode("textarea", {
                ref_key: "inputRef",
                ref: inputRef,
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => inputMessage.value = $event),
                class: "input-box",
                placeholder: "輸入訊息... (Shift + Enter 換行)",
                onKeydown: [
                  withKeys(withModifiers(sendMessage, ["exact", "prevent"]), ["enter"]),
                  withKeys(withModifiers(insertNewLine, ["shift", "exact"]), ["enter"])
                ],
                rows: "1"
              }, null, 40, _hoisted_13$1), [
                [vModelText, inputMessage.value]
              ]),
              createBaseVNode("button", {
                class: "send-btn",
                onClick: sendMessage,
                disabled: !inputMessage.value.trim() || isSending.value,
                title: isSending.value ? "發送中..." : "發送訊息"
              }, [
                !isSending.value ? (openBlock(), createElementBlock("span", _hoisted_15$1, "📤")) : (openBlock(), createElementBlock("span", _hoisted_16$1, "⏳"))
              ], 8, _hoisted_14$1)
            ])
          ])) : createCommentVNode("", true)
        ]),
        _: 1
      });
    };
  }
};
const AICopilot = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-cde90039"]]);
const _hoisted_1$5 = { class: "h-full w-[280px] flex flex-col border-r border-white/5 px-4 py-6 bg-nexus-bg/95 backdrop-blur-md" };
const _hoisted_2$5 = { class: "flex-1 overflow-y-auto custom-scrollbar" };
const _hoisted_3$5 = { class: "mb-5" };
const _hoisted_4$5 = { class: "nav-group" };
const _hoisted_5$5 = { class: "submenu" };
const _hoisted_6$4 = { class: "nav-icon" };
const _hoisted_7$2 = { class: "nav-label" };
const _sfc_main$5 = {
  __name: "Sidebar",
  setup(__props) {
    const router2 = useRouter();
    const layoutStore = useLayoutStore();
    const expandedMenus = ref(/* @__PURE__ */ new Set(["graph-page"]));
    const toggleSubmenu = (menuKey) => {
      if (expandedMenus.value.has(menuKey)) {
        expandedMenus.value.delete(menuKey);
      } else {
        expandedMenus.value.add(menuKey);
      }
    };
    const systemRoutes = computed(() => {
      const systemPaths = ["/monitor", "/settings"];
      return router2.getRoutes().filter(
        (r) => r.meta && r.meta.title && systemPaths.includes(r.path)
      );
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("aside", {
        class: "fixed left-0 top-0 h-screen z-40 overflow-hidden",
        style: normalizeStyle({ width: unref(layoutStore).isSidebarCollapsed ? "0" : "280px", transition: "width 0.3s ease" })
      }, [
        createBaseVNode("div", _hoisted_1$5, [
          _cache[10] || (_cache[10] = createBaseVNode("div", { class: "text-center pb-6 border-b border-white/10 mb-5" }, [
            createBaseVNode("div", { class: "text-5xl mb-3 animate-float" }, "✦"),
            createBaseVNode("h1", { class: "m-0 text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent tracking-tight" }, "BruV"),
            createBaseVNode("p", { class: "mt-1 text-xs text-text-tertiary uppercase tracking-[0.2em]" }, "Nexus Platform")
          ], -1)),
          createBaseVNode("nav", _hoisted_2$5, [
            createBaseVNode("div", _hoisted_3$5, [
              _cache[8] || (_cache[8] = createBaseVNode("div", { class: "flex items-center gap-2 px-3 py-2 mb-1" }, [
                createBaseVNode("span", { class: "text-sm" }, "🧠"),
                createBaseVNode("span", { class: "text-xs font-semibold text-text-tertiary uppercase tracking-wider" }, "Knowledge")
              ], -1)),
              createVNode(_component_router_link, {
                to: "/nexus",
                class: "nav-item",
                "active-class": "nav-item-active"
              }, {
                default: withCtx(() => [..._cache[1] || (_cache[1] = [
                  createBaseVNode("span", { class: "nav-icon" }, "🌌", -1),
                  createBaseVNode("span", { class: "nav-label" }, "知識中樞", -1)
                ])]),
                _: 1
              }),
              createBaseVNode("div", _hoisted_4$5, [
                createBaseVNode("div", {
                  class: normalizeClass(["nav-item nav-item-expandable", { "expanded": expandedMenus.value.has("graph-page") }]),
                  onClick: _cache[0] || (_cache[0] = ($event) => toggleSubmenu("graph-page"))
                }, [
                  _cache[2] || (_cache[2] = createBaseVNode("span", { class: "nav-icon" }, "🌐", -1)),
                  _cache[3] || (_cache[3] = createBaseVNode("span", { class: "nav-label" }, "圖譜工作台", -1)),
                  createBaseVNode("span", {
                    class: normalizeClass(["expand-arrow", { "rotated": expandedMenus.value.has("graph-page") }])
                  }, "▶", 2)
                ], 2),
                createVNode(Transition, { name: "submenu" }, {
                  default: withCtx(() => [
                    withDirectives(createBaseVNode("div", _hoisted_5$5, [
                      createVNode(_component_router_link, {
                        to: "/graph-page",
                        class: "nav-item nav-subitem",
                        "active-class": "nav-item-active"
                      }, {
                        default: withCtx(() => [..._cache[4] || (_cache[4] = [
                          createBaseVNode("span", { class: "nav-icon" }, "📊", -1),
                          createBaseVNode("span", { class: "nav-label" }, "圖譜視圖", -1)
                        ])]),
                        _: 1
                      }),
                      createVNode(_component_router_link, {
                        to: "/import",
                        class: "nav-item nav-subitem",
                        "active-class": "nav-item-active"
                      }, {
                        default: withCtx(() => [..._cache[5] || (_cache[5] = [
                          createBaseVNode("span", { class: "nav-icon" }, "📥", -1),
                          createBaseVNode("span", { class: "nav-label" }, "檔案匯入", -1)
                        ])]),
                        _: 1
                      })
                    ], 512), [
                      [vShow, expandedMenus.value.has("graph-page")]
                    ])
                  ]),
                  _: 1
                })
              ]),
              createVNode(_component_router_link, {
                to: "/timeline",
                class: "nav-item",
                "active-class": "nav-item-active"
              }, {
                default: withCtx(() => [..._cache[6] || (_cache[6] = [
                  createBaseVNode("span", { class: "nav-icon" }, "⏳", -1),
                  createBaseVNode("span", { class: "nav-label" }, "時間軸", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_router_link, {
                to: "/cross-graph",
                class: "nav-item",
                "active-class": "nav-item-active"
              }, {
                default: withCtx(() => [..._cache[7] || (_cache[7] = [
                  createBaseVNode("span", { class: "nav-icon" }, "🔗", -1),
                  createBaseVNode("span", { class: "nav-label" }, "跨圖譜連接", -1)
                ])]),
                _: 1
              })
            ]),
            createBaseVNode("div", null, [
              _cache[9] || (_cache[9] = createBaseVNode("div", { class: "flex items-center gap-2 px-3 py-2 mb-1" }, [
                createBaseVNode("span", { class: "text-sm" }, "⚙️"),
                createBaseVNode("span", { class: "text-xs font-semibold text-text-tertiary uppercase tracking-wider" }, "System")
              ], -1)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(systemRoutes.value, (route) => {
                return openBlock(), createBlock(_component_router_link, {
                  key: route.path,
                  to: route.path,
                  class: "nav-item",
                  "active-class": "nav-item-active"
                }, {
                  default: withCtx(() => [
                    createBaseVNode("span", _hoisted_6$4, toDisplayString(route.meta.icon), 1),
                    createBaseVNode("span", _hoisted_7$2, toDisplayString(route.meta.title), 1)
                  ]),
                  _: 2
                }, 1032, ["to"]);
              }), 128))
            ])
          ]),
          _cache[11] || (_cache[11] = createStaticVNode('<div class="pt-4 border-t border-white/10 mt-4" data-v-37a44506><div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 mb-2" data-v-37a44506><span class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" data-v-37a44506></span><span class="text-xs font-medium text-green-400" data-v-37a44506>System Online</span></div><div class="text-center text-xs text-text-tertiary mt-1" data-v-37a44506>v1.0.0</div></div>', 1))
        ])
      ], 4);
    };
  }
};
const Sidebar = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-37a44506"]]);
const _hoisted_1$4 = { class: "nexus-breadcrumb flex items-center gap-1.5 text-sm select-none" };
const _hoisted_2$4 = {
  key: 0,
  class: "text-base"
};
const _hoisted_3$4 = { class: "flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neon-blue/10 border border-neon-blue/20" };
const _hoisted_4$4 = { class: "text-neon-blue text-xs font-semibold tracking-wide" };
const _hoisted_5$4 = { class: "flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neon-purple/10 border border-neon-purple/20" };
const _hoisted_6$3 = { class: "text-xs" };
const _hoisted_7$1 = { class: "text-neon-purple text-xs font-medium truncate max-w-[120px]" };
const _sfc_main$4 = {
  __name: "NexusBreadcrumb",
  setup(__props) {
    const route = useRoute();
    const graphStore = useGraphStore();
    const routeBreadcrumbMap = {
      "/nexus": { label: "知識中樞", icon: "🌌", parent: null },
      "/graph-page": { label: "圖譜工作台", icon: "🌐", parent: "/nexus" },
      "/import": { label: "資料導入", icon: "📥", parent: "/graph-page" },
      "/file-import": { label: "檔案上傳", icon: "📤", parent: "/graph-page" },
      "/cross-graph": { label: "跨圖譜連接", icon: "🔗", parent: "/nexus" },
      "/graph-3d": { label: "3D 圖譜", icon: "🧊", parent: "/graph-page" },
      "/batch-repair": { label: "批次修復", icon: "🔧", parent: "/nexus" },
      "/settings": { label: "系統設定", icon: "⚙️", parent: null },
      "/monitor": { label: "電腦資訊", icon: "💻", parent: null },
      "/create": { label: "建立實體", icon: "➕", parent: "/graph-page" },
      "/graph": { label: "2D 圖譜 (舊)", icon: "🕸️", parent: "/nexus" },
      "/timeline": { label: "時間軸", icon: "⏳", parent: "/graph-page" }
    };
    const breadcrumbs = computed(() => {
      const path = route.path;
      const crumbs = [];
      const collect = (p) => {
        const config = routeBreadcrumbMap[p];
        if (!config) return;
        if (config.parent) {
          collect(config.parent);
        }
        crumbs.push({
          path: p,
          label: config.label,
          icon: config.icon,
          clickable: p !== path
          // 最後一層不可點擊
        });
      };
      collect(path);
      return crumbs;
    });
    const currentGraphName = computed(() => {
      const graphPages = ["/graph-page", "/graph-3d", "/import", "/file-import", "/cross-graph"];
      if (!graphPages.includes(route.path)) return null;
      const currentId = graphStore.currentGraphId;
      const meta = graphStore.graphMetadataList.find((g) => g.id === currentId);
      if (meta == null ? void 0 : meta.name) return meta.name;
      if (graphStore.nodeCount > 0) return "主腦圖譜";
      return null;
    });
    const selectedNodeName = computed(() => {
      if (!graphStore.selectedNode) return null;
      return graphStore.selectedNode.name || graphStore.selectedNode.label || null;
    });
    const selectedNodeEmoji = computed(() => {
      if (!graphStore.selectedNode) return "📌";
      return graphStore.selectedNode.emoji || "📌";
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("nav", _hoisted_1$4, [
        createVNode(_component_router_link, {
          to: "/nexus",
          class: "breadcrumb-item flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 transition-all group"
        }, {
          default: withCtx(() => [..._cache[0] || (_cache[0] = [
            createBaseVNode("span", { class: "text-base group-hover:scale-110 transition-transform" }, "🏠", -1),
            createBaseVNode("span", { class: "text-text-secondary group-hover:text-white transition-colors" }, "Nexus", -1)
          ])]),
          _: 1
        }),
        (openBlock(true), createElementBlock(Fragment, null, renderList(breadcrumbs.value, (crumb, index) => {
          return openBlock(), createElementBlock(Fragment, {
            key: crumb.path
          }, [
            _cache[1] || (_cache[1] = createBaseVNode("span", { class: "text-white/20 text-xs" }, "›", -1)),
            (openBlock(), createBlock(resolveDynamicComponent(crumb.clickable ? "router-link" : "span"), {
              to: crumb.clickable ? crumb.path : void 0,
              class: normalizeClass(["breadcrumb-item flex items-center gap-1.5 px-2 py-1 rounded-md transition-all", [
                index === breadcrumbs.value.length - 1 ? "text-white font-semibold cursor-default" : "text-text-secondary hover:bg-white/5 hover:text-white cursor-pointer"
              ]])
            }, {
              default: withCtx(() => [
                crumb.icon ? (openBlock(), createElementBlock("span", _hoisted_2$4, toDisplayString(crumb.icon), 1)) : createCommentVNode("", true),
                createBaseVNode("span", null, toDisplayString(crumb.label), 1)
              ]),
              _: 2
            }, 1032, ["to", "class"]))
          ], 64);
        }), 128)),
        currentGraphName.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
          _cache[3] || (_cache[3] = createBaseVNode("span", { class: "text-white/20 text-xs" }, "›", -1)),
          createBaseVNode("span", _hoisted_3$4, [
            _cache[2] || (_cache[2] = createBaseVNode("span", { class: "w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" }, null, -1)),
            createBaseVNode("span", _hoisted_4$4, toDisplayString(currentGraphName.value), 1)
          ])
        ], 64)) : createCommentVNode("", true),
        selectedNodeName.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          _cache[4] || (_cache[4] = createBaseVNode("span", { class: "text-white/20 text-xs" }, "›", -1)),
          createBaseVNode("span", _hoisted_5$4, [
            createBaseVNode("span", _hoisted_6$3, toDisplayString(selectedNodeEmoji.value), 1),
            createBaseVNode("span", _hoisted_7$1, toDisplayString(selectedNodeName.value), 1)
          ])
        ], 64)) : createCommentVNode("", true)
      ]);
    };
  }
};
const NexusBreadcrumb = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-09791515"]]);
const _hoisted_1$3 = { class: "collab-bar" };
const _hoisted_2$3 = { class: "flex items-center gap-1" };
const _hoisted_3$3 = { class: "absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-[#1a1d3a] border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap" };
const _hoisted_4$3 = { class: "text-xs font-medium text-white" };
const _hoisted_5$3 = {
  key: 0,
  class: "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white/20 bg-white/5 text-text-tertiary"
};
const _hoisted_6$2 = { class: "text-[11px] text-text-secondary truncate" };
const MAX_VISIBLE = 5;
const _sfc_main$3 = {
  __name: "CollaborationBar",
  setup(__props) {
    const graphStore = useGraphStore();
    const simulatedUsers = ref([
      { id: "self", name: "我", initials: "Me", color: "#3b82f6", status: "editing", activeNode: "" },
      { id: "u2", name: "Alice Wang", initials: "AW", color: "#8b5cf6", status: "viewing", activeNode: "" },
      { id: "u3", name: "Bob Chen", initials: "BC", color: "#06b6d4", status: "viewing", activeNode: "" }
    ]);
    const visibleUsers = computed(() => {
      const users = simulatedUsers.value.map((u) => {
        if (u.id === "self" && graphStore.selectedNode) {
          return { ...u, status: "editing", activeNode: graphStore.selectedNode.name || graphStore.selectedNode.id };
        }
        return u;
      });
      return users.slice(0, MAX_VISIBLE);
    });
    const hiddenCount = computed(() => Math.max(0, simulatedUsers.value.length - MAX_VISIBLE));
    const activities = [
      { text: "新增了一個節點", icon: "➕" },
      { text: "建立了一個連線", icon: "🔗" },
      { text: "正在查看圖譜", icon: "👁️" },
      { text: "修改了節點描述", icon: "✏️" },
      { text: "匯入了新檔案", icon: "📥" }
    ];
    const currentActivity = ref(null);
    let activityTimer = null;
    const rotateActivity = () => {
      const otherUsers = simulatedUsers.value.filter((u) => u.id !== "self");
      if (otherUsers.length === 0) return;
      const user = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      currentActivity.value = {
        id: Date.now(),
        userName: user.name.split(" ")[0],
        userColor: user.color,
        text: activity.text
      };
      simulatedUsers.value = simulatedUsers.value.map((u) => {
        if (u.id === user.id) {
          const nodes = graphStore.nodes;
          const randomNode = nodes.length > 0 ? nodes[Math.floor(Math.random() * nodes.length)] : null;
          return {
            ...u,
            status: Math.random() > 0.4 ? "editing" : "viewing",
            activeNode: randomNode ? randomNode.name || randomNode.id : ""
          };
        }
        return u;
      });
    };
    onMounted(() => {
      const scheduleNext = () => {
        const delay = 8e3 + Math.random() * 7e3;
        activityTimer = setTimeout(() => {
          rotateActivity();
          scheduleNext();
        }, delay);
      };
      activityTimer = setTimeout(() => {
        rotateActivity();
        scheduleNext();
      }, 3e3);
    });
    onUnmounted(() => {
      clearTimeout(activityTimer);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createBaseVNode("div", _hoisted_2$3, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(visibleUsers.value, (user) => {
            return openBlock(), createElementBlock("div", {
              key: user.id,
              class: "relative group"
            }, [
              createBaseVNode("div", {
                class: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-default transition-all group-hover:scale-110 group-hover:z-10",
                style: normalizeStyle({
                  backgroundColor: user.color + "25",
                  borderColor: user.color,
                  color: user.color
                })
              }, toDisplayString(user.initials), 5),
              createBaseVNode("div", {
                class: normalizeClass(["absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-[#1a1d3a]", user.status === "editing" ? "bg-green-400 animate-pulse" : "bg-yellow-400"])
              }, null, 2),
              createBaseVNode("div", _hoisted_3$3, [
                createBaseVNode("p", _hoisted_4$3, toDisplayString(user.name), 1),
                createBaseVNode("p", {
                  class: "text-[10px] mt-0.5",
                  style: normalizeStyle({ color: user.color })
                }, toDisplayString(user.status === "editing" ? `正在編輯：${user.activeNode}` : "瀏覽中"), 5),
                _cache[0] || (_cache[0] = createBaseVNode("div", { class: "absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#1a1d3a] border-l border-t border-white/10" }, null, -1))
              ])
            ]);
          }), 128)),
          hiddenCount.value > 0 ? (openBlock(), createElementBlock("div", _hoisted_5$3, " +" + toDisplayString(hiddenCount.value), 1)) : createCommentVNode("", true)
        ]),
        _cache[1] || (_cache[1] = createBaseVNode("div", { class: "w-px h-5 bg-white/10 mx-1" }, null, -1)),
        createVNode(Transition, {
          name: "toast",
          mode: "out-in"
        }, {
          default: withCtx(() => [
            currentActivity.value ? (openBlock(), createElementBlock("div", {
              key: currentActivity.value.id,
              class: "flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 max-w-[200px]"
            }, [
              createBaseVNode("div", {
                class: "w-1.5 h-1.5 rounded-full animate-pulse",
                style: normalizeStyle({ backgroundColor: currentActivity.value.userColor })
              }, null, 4),
              createBaseVNode("span", _hoisted_6$2, [
                createBaseVNode("span", {
                  class: "font-medium",
                  style: normalizeStyle({ color: currentActivity.value.userColor })
                }, toDisplayString(currentActivity.value.userName), 5),
                createTextVNode(" " + toDisplayString(currentActivity.value.text), 1)
              ])
            ])) : createCommentVNode("", true)
          ]),
          _: 1
        })
      ]);
    };
  }
};
const CollaborationBar = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-b4ddc94e"]]);
const _hoisted_1$2 = {
  key: 0,
  class: "fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-lg text-white p-4 rounded-xl shadow-2xl border border-white/10 z-[9999] max-w-md"
};
const _hoisted_2$2 = { class: "flex items-center justify-between mb-3 pb-2 border-b border-white/10" };
const _hoisted_3$2 = {
  key: 0,
  class: "space-y-3 text-xs"
};
const _hoisted_4$2 = { class: "bg-white/5 rounded-lg p-3" };
const _hoisted_5$2 = { class: "space-y-1 text-gray-300" };
const _hoisted_6$1 = { class: "flex justify-between" };
const _hoisted_7 = { class: "font-mono" };
const _hoisted_8 = { class: "flex justify-between" };
const _hoisted_9 = { class: "font-mono" };
const _hoisted_10 = {
  key: 0,
  class: "mt-2 pt-2 border-t border-white/10"
};
const _hoisted_11 = { class: "flex flex-wrap gap-1" };
const _hoisted_12 = { class: "bg-white/5 rounded-lg p-3" };
const _hoisted_13 = { class: "space-y-1 text-gray-300" };
const _hoisted_14 = { class: "flex justify-between" };
const _hoisted_15 = {
  key: 0,
  class: "flex justify-between"
};
const _hoisted_16 = { class: "font-mono" };
const _hoisted_17 = {
  key: 1,
  class: "text-red-400 text-xs mt-2 p-2 bg-red-500/10 rounded"
};
const _hoisted_18 = {
  key: 1,
  class: "text-gray-400 text-xs"
};
const _sfc_main$2 = {
  __name: "GraphDebugPanel",
  setup(__props) {
    const graphStore = useGraphStore();
    const isVisible = ref(false);
    const isExpanded = ref(true);
    const stats = ref({
      size: 0,
      maxSize: 10,
      keys: [],
      metadataCount: 0,
      metadataCached: false
    });
    const loadingState = ref({
      isLoading: false,
      currentGraphId: null,
      progress: 0,
      error: null
    });
    const updateStats = () => {
      stats.value = graphDataManager.getCacheStats();
      loadingState.value = graphDataManager.getLoadingState();
    };
    const togglePanel = () => {
      isExpanded.value = !isExpanded.value;
    };
    const clearCache = () => {
      graphDataManager.invalidateCache();
      graphDataManager.invalidateMetadataCache();
      updateStats();
      ElMessage.success("緩存已清空");
    };
    const refreshData = async () => {
      try {
        await graphStore.fetchGraphData(graphStore.currentGraphId, { forceRefresh: true });
        await graphStore.loadGraphMetadataList({ forceRefresh: true });
        ElMessage.success("數據已刷新");
      } catch (error) {
        ElMessage.error("刷新失敗: " + error.message);
      }
    };
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        isVisible.value = !isVisible.value;
        if (isVisible.value) {
          updateStats();
        }
      }
    };
    let updateTimer = null;
    onMounted(() => {
      window.addEventListener("keydown", handleKeyPress);
      updateTimer = setInterval(updateStats, 1e3);
    });
    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyPress);
      if (updateTimer) clearInterval(updateTimer);
    });
    return (_ctx, _cache) => {
      return isVisible.value ? (openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", _hoisted_2$2, [
          _cache[0] || (_cache[0] = createBaseVNode("div", { class: "flex items-center gap-2" }, [
            createBaseVNode("span", { class: "text-lg" }, "🔧"),
            createBaseVNode("h3", { class: "text-sm font-bold" }, "圖譜數據管理器")
          ], -1)),
          createBaseVNode("button", {
            onClick: togglePanel,
            class: "text-gray-400 hover:text-white transition-colors text-xs px-2 py-1 hover:bg-white/10 rounded"
          }, toDisplayString(isExpanded.value ? "收起" : "展開"), 1)
        ]),
        isExpanded.value ? (openBlock(), createElementBlock("div", _hoisted_3$2, [
          createBaseVNode("div", _hoisted_4$2, [
            _cache[4] || (_cache[4] = createBaseVNode("div", { class: "flex items-center gap-2 mb-2" }, [
              createBaseVNode("span", null, "💾"),
              createBaseVNode("h4", { class: "font-semibold text-xs" }, "緩存狀態")
            ], -1)),
            createBaseVNode("div", _hoisted_5$2, [
              createBaseVNode("div", _hoisted_6$1, [
                _cache[1] || (_cache[1] = createBaseVNode("span", null, "圖譜緩存:", -1)),
                createBaseVNode("span", _hoisted_7, toDisplayString(stats.value.size) + "/" + toDisplayString(stats.value.maxSize), 1)
              ]),
              createBaseVNode("div", _hoisted_8, [
                _cache[2] || (_cache[2] = createBaseVNode("span", null, "元數據:", -1)),
                createBaseVNode("span", _hoisted_9, toDisplayString(stats.value.metadataCount) + " 個", 1)
              ]),
              stats.value.keys.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_10, [
                _cache[3] || (_cache[3] = createBaseVNode("div", { class: "text-gray-400 mb-1" }, "已緩存圖譜 ID:", -1)),
                createBaseVNode("div", _hoisted_11, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(stats.value.keys, (key) => {
                    return openBlock(), createElementBlock("span", {
                      key,
                      class: "px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-xs"
                    }, toDisplayString(key), 1);
                  }), 128))
                ])
              ])) : createCommentVNode("", true)
            ])
          ]),
          createBaseVNode("div", _hoisted_12, [
            _cache[7] || (_cache[7] = createBaseVNode("div", { class: "flex items-center gap-2 mb-2" }, [
              createBaseVNode("span", null, "⚡"),
              createBaseVNode("h4", { class: "font-semibold text-xs" }, "加載狀態")
            ], -1)),
            createBaseVNode("div", _hoisted_13, [
              createBaseVNode("div", _hoisted_14, [
                _cache[5] || (_cache[5] = createBaseVNode("span", null, "狀態:", -1)),
                createBaseVNode("span", {
                  class: normalizeClass(loadingState.value.isLoading ? "text-yellow-400" : "text-green-400")
                }, toDisplayString(loadingState.value.isLoading ? "加載中..." : "空閒"), 3)
              ]),
              loadingState.value.currentGraphId ? (openBlock(), createElementBlock("div", _hoisted_15, [
                _cache[6] || (_cache[6] = createBaseVNode("span", null, "當前圖譜:", -1)),
                createBaseVNode("span", _hoisted_16, toDisplayString(loadingState.value.currentGraphId), 1)
              ])) : createCommentVNode("", true),
              loadingState.value.error ? (openBlock(), createElementBlock("div", _hoisted_17, toDisplayString(loadingState.value.error), 1)) : createCommentVNode("", true)
            ])
          ]),
          createBaseVNode("div", { class: "flex gap-2" }, [
            createBaseVNode("button", {
              onClick: clearCache,
              class: "flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-xs font-medium"
            }, " 清空緩存 "),
            createBaseVNode("button", {
              onClick: refreshData,
              class: "flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-xs font-medium"
            }, " 強制刷新 ")
          ]),
          _cache[8] || (_cache[8] = createBaseVNode("div", { class: "text-gray-500 text-xs pt-2 border-t border-white/10" }, [
            createTextVNode(" 按 "),
            createBaseVNode("kbd", { class: "px-1.5 py-0.5 bg-white/10 rounded" }, "Ctrl+Shift+D"),
            createTextVNode(" 切換面板 ")
          ], -1))
        ])) : (openBlock(), createElementBlock("div", _hoisted_18, [
          createTextVNode(" 緩存: " + toDisplayString(stats.value.size) + "/" + toDisplayString(stats.value.maxSize) + " | ", 1),
          createBaseVNode("span", {
            class: normalizeClass(loadingState.value.isLoading ? "text-yellow-400" : "text-green-400")
          }, toDisplayString(loadingState.value.isLoading ? "●" : "○"), 3)
        ]))
      ])) : createCommentVNode("", true);
    };
  }
};
const GraphDebugPanel = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-1bf15a1b"]]);
const _hoisted_1$1 = { class: "app-container bg-nexus-bg" };
const _hoisted_2$1 = ["title"];
const _hoisted_3$1 = { class: "top-bar" };
const _hoisted_4$1 = { class: "top-bar-actions" };
const _hoisted_5$1 = { class: "router-view-container w-full" };
const _sfc_main$1 = {
  __name: "App",
  setup(__props) {
    useRouter();
    useRoute();
    const layoutStore = useLayoutStore();
    useGraphStore();
    const isDev = false;
    onMounted(() => {
      layoutStore.initTheme();
    });
    return (_ctx, _cache) => {
      const _component_router_view = resolveComponent("router-view");
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("button", {
          onClick: _cache[0] || (_cache[0] = (...args) => unref(layoutStore).toggleSidebarCollapse && unref(layoutStore).toggleSidebarCollapse(...args)),
          class: "hamburger-btn fixed left-4 top-4 z-[100] flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-nexus-surface/90 hover:bg-nexus-elevated border border-white/10 transition-all duration-300",
          title: unref(layoutStore).isSidebarCollapsed ? "展開側邊欄" : "收起側邊欄"
        }, [..._cache[2] || (_cache[2] = [
          createBaseVNode("span", { class: "hamburger-line bg-white" }, null, -1),
          createBaseVNode("span", { class: "hamburger-line my-1.5 bg-white" }, null, -1),
          createBaseVNode("span", { class: "hamburger-line bg-white" }, null, -1)
        ])], 8, _hoisted_2$1),
        createVNode(Sidebar),
        createBaseVNode("main", {
          class: "main-content w-full transition-all duration-300",
          style: normalizeStyle({ marginLeft: unref(layoutStore).isSidebarCollapsed ? "0" : "280px" })
        }, [
          createBaseVNode("header", _hoisted_3$1, [
            createVNode(NexusBreadcrumb),
            createBaseVNode("div", _hoisted_4$1, [
              createVNode(CollaborationBar),
              _cache[4] || (_cache[4] = createBaseVNode("div", { class: "w-px h-5 bg-white/10" }, null, -1)),
              createBaseVNode("button", {
                class: normalizeClass(["ai-copilot-btn", { "active": unref(layoutStore).showAssistant }]),
                onClick: _cache[1] || (_cache[1] = (...args) => unref(layoutStore).toggleAssistant && unref(layoutStore).toggleAssistant(...args)),
                title: "呼叫 AI 助手"
              }, [..._cache[3] || (_cache[3] = [
                createBaseVNode("span", { class: "ai-icon" }, "✨", -1),
                createBaseVNode("span", { class: "ai-label" }, "AI 助手", -1)
              ])], 2)
            ])
          ]),
          createBaseVNode("div", _hoisted_5$1, [
            createVNode(_component_router_view, null, {
              default: withCtx(({ Component }) => [
                createVNode(Transition, {
                  name: "fade",
                  mode: "out-in"
                }, {
                  default: withCtx(() => [
                    (openBlock(), createBlock(resolveDynamicComponent(Component)))
                  ]),
                  _: 2
                }, 1024)
              ]),
              _: 1
            })
          ])
        ], 4),
        createVNode(AICopilot, {
          show: unref(layoutStore).showAssistant,
          onClose: unref(layoutStore).toggleAssistant
        }, null, 8, ["show", "onClose"]),
        unref(isDev) ? (openBlock(), createBlock(GraphDebugPanel, { key: 0 })) : createCommentVNode("", true)
      ]);
    };
  }
};
const App = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-533da7dc"]]);
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
const _hoisted_1 = { class: "login-container" };
const _hoisted_2 = { class: "login-card" };
const _hoisted_3 = { class: "form-group" };
const _hoisted_4 = ["disabled"];
const _hoisted_5 = {
  key: 0,
  class: "error-message"
};
const _hoisted_6 = ["disabled"];
const _sfc_main = {
  __name: "LoginPage",
  setup(__props) {
    const router2 = useRouter();
    const token = ref("");
    const error = ref("");
    const loading = ref(false);
    const apiBase = "";
    async function handleLogin() {
      error.value = "";
      loading.value = true;
      try {
        const response = await fetch(`${apiBase}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.value })
        });
        if (response.ok) {
          localStorage.setItem("bruv_api_token", token.value);
          router2.push("/");
        } else {
          error.value = "Token 無效，請確認後重試";
        }
      } catch (e) {
        error.value = "無法連接到伺服器";
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[2] || (_cache[2] = createBaseVNode("div", { class: "login-header" }, [
            createBaseVNode("h1", { class: "login-title" }, "🧠 BruV Platform"),
            createBaseVNode("p", { class: "login-subtitle" }, "企業級 AI 知識圖譜平台")
          ], -1)),
          createBaseVNode("form", {
            onSubmit: withModifiers(handleLogin, ["prevent"]),
            class: "login-form"
          }, [
            createBaseVNode("div", _hoisted_3, [
              _cache[1] || (_cache[1] = createBaseVNode("label", {
                for: "token",
                class: "form-label"
              }, "API Token", -1)),
              withDirectives(createBaseVNode("input", {
                id: "token",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => token.value = $event),
                type: "password",
                class: "form-input",
                placeholder: "請輸入 API Token",
                autocomplete: "off",
                disabled: loading.value
              }, null, 8, _hoisted_4), [
                [vModelText, token.value]
              ])
            ]),
            error.value ? (openBlock(), createElementBlock("p", _hoisted_5, toDisplayString(error.value), 1)) : createCommentVNode("", true),
            createBaseVNode("button", {
              type: "submit",
              class: "login-button",
              disabled: loading.value || !token.value
            }, toDisplayString(loading.value ? "驗證中..." : "登入"), 9, _hoisted_6)
          ], 32),
          _cache[3] || (_cache[3] = createBaseVNode("p", { class: "login-hint" }, " Token 在首次啟動後端時自動生成，請查看終端機輸出 ", -1))
        ])
      ]);
    };
  }
};
const LoginPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-033d9aa6"]]);
const BatchRepair = () => __vitePreload(() => import("./BatchRepair-BDmQ04kC.js"), true ? __vite__mapDeps([0,1,2,3,4]) : void 0);
const Settings = () => __vitePreload(() => import("./Settings-BllxzVjR.js"), true ? __vite__mapDeps([5,1,3,6]) : void 0);
const GraphView = () => __vitePreload(() => import("./GraphView-PgugaHB7.js"), true ? __vite__mapDeps([7,8,3,1,9]) : void 0);
const KnowledgeForm = () => __vitePreload(() => import("./KnowledgeForm-SHnj_LHL.js"), true ? __vite__mapDeps([10,3,1,11]) : void 0);
const Graph3D = () => __vitePreload(() => import("./Graph3D-B0AcdIba.js").then((n) => n.l), true ? __vite__mapDeps([12,3,1,8,13]) : void 0);
const GraphPage = () => __vitePreload(() => import("./GraphPage-CyFbrADU.js"), true ? __vite__mapDeps([14,1,8,3,12,13,15,16]) : void 0);
const CrossGraphPage = () => __vitePreload(() => import("./CrossGraphPage-DcrynMdO.js"), true ? __vite__mapDeps([17,1,3,18]) : void 0);
const NexusPage = () => __vitePreload(() => import("./NexusPage-DbLEYtdT.js"), true ? __vite__mapDeps([19,1,3,20]) : void 0);
const SystemMonitorPage = () => __vitePreload(() => import("./SystemMonitorPage-CZIvDMZb.js"), true ? __vite__mapDeps([21,3,1,22]) : void 0);
const ImportPage = () => __vitePreload(() => import("./ImportPage-atv-6PfV.js"), true ? __vite__mapDeps([23,1,3,24]) : void 0);
const FileImport = () => __vitePreload(() => import("./FileImport-C9uWLtqN.js"), true ? __vite__mapDeps([25,1,3,26]) : void 0);
const TimelinePage = () => __vitePreload(() => import("./TimelinePage-CQArytHA.js"), true ? __vite__mapDeps([27,1,15,3,28]) : void 0);
const routes = [
  {
    path: "/",
    redirect: "/nexus"
  },
  {
    path: "/nexus",
    name: "Nexus",
    component: NexusPage,
    meta: {
      title: "知識中樞",
      icon: "🌌"
    }
  },
  {
    path: "/batch-repair",
    name: "BatchRepair",
    component: BatchRepair,
    meta: {
      title: "批次修復",
      icon: "🔧"
    }
  },
  {
    path: "/graph",
    name: "Graph",
    component: GraphView,
    meta: {
      title: "知識圖譜 (舊版 2D)",
      icon: "🕸️"
    }
  },
  {
    path: "/graph-page",
    name: "GraphPage",
    component: GraphPage,
    meta: {
      title: "知識圖譜",
      icon: "🌐"
    }
  },
  {
    path: "/import",
    name: "Import",
    component: ImportPage,
    meta: {
      title: "資料導入",
      icon: "📥"
    }
  },
  {
    path: "/cross-graph",
    name: "CrossGraph",
    component: CrossGraphPage,
    meta: {
      title: "跨圖譜連接",
      icon: "🔗"
    }
  },
  {
    path: "/graph-3d",
    name: "Graph3D",
    component: Graph3D,
    meta: {
      title: "3D 圖譜",
      icon: "🧊"
    }
  },
  {
    path: "/create",
    name: "Create",
    component: KnowledgeForm,
    meta: {
      title: "建立實體",
      icon: "➕"
    }
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: {
      title: "系統設定",
      icon: "⚙️"
    }
  },
  {
    path: "/monitor",
    name: "SystemMonitor",
    component: SystemMonitorPage,
    meta: {
      title: "電腦資訊",
      icon: "💻"
    }
  },
  {
    path: "/file-import",
    name: "FileImport",
    component: FileImport,
    meta: {
      title: "檔案上傳",
      icon: "📤"
    }
  },
  {
    path: "/timeline",
    name: "Timeline",
    component: TimelinePage,
    meta: {
      title: "時間軸",
      icon: "⏳"
    }
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: {
      title: "登入",
      public: true
      // 標記為公開路由
    }
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/nexus"
  }
];
const router = createRouter({
  history: createWebHistory(),
  routes
});
let authChecked = false;
let authEnabled = true;
router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - BruV Platform`;
  } else {
    document.title = "BruV Platform - Enterprise AI";
  }
  if (to.meta.public) {
    return next();
  }
  if (!authChecked) {
    try {
      const apiBase = "";
      const res = await fetch(`${apiBase}/api/auth/status`);
      if (res.ok) {
        const data = await res.json();
        authEnabled = data.auth_enabled;
      }
    } catch {
      authEnabled = true;
    }
    authChecked = true;
  }
  if (!authEnabled) {
    return next();
  }
  const token = localStorage.getItem("bruv_api_token");
  if (!token) {
    return next("/login");
  }
  next();
});
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(installer);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);
app.config.errorHandler = (err, instance, info) => {
  console.error("全域錯誤處理:", err);
  console.error("錯誤資訊:", info);
};
app.config.globalProperties.$apiBase = "/api";
app.mount("#app");
console.log("🚀 BruV Platform 已啟動");
console.log("📍 環境:", "development");
console.log("🔗 API Base:", app.config.globalProperties.$apiBase);
export {
  _export_sfc as _,
  useLayoutStore as a,
  useGraphStore as u
};
