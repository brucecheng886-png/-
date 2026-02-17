# BruV_Project 伺服器架構審查報告

> 審查日期：2026-02-17
> 涵蓋範圍：後端 20+ 檔案、前端 38 個源碼檔案、Docker 基礎設施

---

## 一、目前架構總覽

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Vue 3 + Pinia)          ~18,200 行 / 38 個檔案    │
│  ┌───────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌────────────────┐│
│  │Graph  │ │Import  │ │Nexus │ │Chat  │ │Settings / ...  ││
│  │Page   │ │Page    │ │Page  │ │Page  │ │                ││
│  │2530行 │ │1249行  │ │612行 │ │8行   │ │1125行          ││
│  └───┬───┘ └───┬────┘ └──┬───┘ └──┬───┘ └──────┬─────────┘│
│      └─────────┴─────────┴────────┴─────────────┘          │
│                     │  graphStore (1566行)                   │
│                     │  apiClient → authFetch (原生 fetch)    │
│                     │  GraphDataManager (LRU + 去重)         │
└─────────────────────┼───────────────────────────────────────┘
                      │ HTTP (CORS)
┌─────────────────────┼───────────────────────────────────────┐
│  Backend (FastAPI)  │          ~7,900 行                     │
│  app_anytype.py (692行) ─── 主入口 + 圖譜 API 直寫           │
│  ┌─────────┬──────────┬──────────┬──────────┬─────────────┐ │
│  │graph.py │import.py │system.py │dify.py   │ragflow.py   │ │
│  │588行    │1314行    │1065行    │223行     │261行        │ │
│  └────┬────┴────┬─────┴────┬─────┴────┬─────┴─────┬───────┘ │
│       │ KuzuDB  │ Dify LLM │ RAGFlow  │ httpx     │         │
│  ┌────┴─────┐ ┌─┴────┐ ┌──┴──┐ ┌────┴────┐ ┌───┴──────┐  │
│  │kuzu_mgr  │ │saga  │ │task │ │watcher  │ │rag_client│  │
│  │935行     │ │426行 │ │527行│ │1038行   │ │293行     │  │
│  └──────────┘ └──────┘ └─────┘ └─────────┘ └──────────┘  │
│  core: config(248) auth(381) circuit_breaker(209)          │
│        logging(143) telemetry(134)                         │
└────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────┼──────────────────────────────────────┐
│  Docker Infra       │  13 個容器                            │
│  Dify(0.6.16) + RAGFlow + Ollama(0.16.1) + ES + MinIO     │
│  PostgreSQL + MySQL + 2×Redis + Loki + Promtail + Grafana  │
└────────────────────────────────────────────────────────────┘
```

---

## 二、發現的問題 — 依嚴重程度排序

### P0 — 安全風險

| # | 問題 | 位置 | 說明 |
|---|------|------|------|
| 1 | **`eval()` 解析 properties** | `backend/services/watcher.py` `_build_inter_node_links` | 可被注入任意程式碼執行。應改用 `json.loads()` + `ast.literal_eval()` |
| 2 | **URL query param 認證** | `backend/core/auth.py` | `?token=xxx` 會出現在伺服器日誌、瀏覽器歷史、Referer header |
| 3 | **`v-html` 渲染未 sanitize** | `DifyChat.vue`, `AICopilot.vue` | Markdown 轉 HTML 後直接 `v-html`，存在 XSS 風險 |

### P0 — 架構缺陷

| # | 問題 | 影響 |
|---|------|------|
| 4 | **GraphPage.vue 2530 行** | 不可維護，混合佈局+業務+互動+AI建議+表單 |
| 5 | **graphStore.js 1566 行** | 違反 SRP，混合圖譜數據/匯入/輪詢/CRUD/RAGFlow |
| 6 | **graph_import.py 1314 行** | 匯入引擎+LLM呼叫+Prompt+任務追蹤全部混在一起 |
| 7 | **system.py 1065 行** | 混合配置/上傳/斷路器/DLQ/連線管理/服務偵測 |
| 8 | **watcher.py 1038 行** | 監控+Saga+Excel解析+節點互連全部混在一起 |

### P1 — 程式碼重複

| # | 重複項目 | 涉及檔案 | 建議 |
|---|---------|---------|------|
| 9 | **Saga 邏輯寫了兩套** | `watcher.py` (自行實作) vs `saga.py` (`FileImportSaga`) | watcher 應使用 saga.py |
| 10 | **RAGFlow 上傳邏輯 ×3** | `system.py` `/upload` / `watcher.py` `_process_file` / `graph_import.py` merge | 統一至 rag_client.py |
| 11 | **任務追蹤 ×2** | `graph_import.py` `_import_tasks` dict vs `task_queue.py` `TaskQueue` | import 應使用 TaskQueue |
| 12 | **httpx 直接呼叫 vs RAGFlowClient** | `ragflow.py` 混用兩種方式 | 統一使用 RAGFlowClient |
| 13 | **前端 `debounce()` ×2** | `Graph2D.vue`, `Graph3D.vue` | 提取至 `utils/debounce.js` |

### P1 — 效能瓶頸

| # | 問題 | 位置 | 影響 |
|---|------|------|------|
| 14 | **每次 HTTP 請求新建 httpx Client** | `dify.py`, `ragflow.py`, `rag_client.py` | 無連接池，頻繁建立TCP連線 |
| 15 | **async 端點呼叫同步 KuzuDB** | `graph.py`, `app_anytype.py` | 阻塞事件迴圈（有 AsyncKuzuWrapper 但未完全使用）|
| 16 | **auth verify_token 每次讀檔** | `auth.py` | 高並發下 I/O 瓶頸 |
| 17 | **Element Plus 全量引入** | `main.js` | Bundle 多 ~200KB |
| 18 | **@antv/g6 殘留** | `GraphView.vue` (舊版) | Bundle 多 ~400KB |

### P2 — 一致性問題

| # | 問題 |
|---|------|
| 19 | **Response 格式不統一** — 有的 `{success: true}`, 有的 `{status: "success"}`, 有的直接回傳 |
| 20 | **Router prefix 不一致** — `tasks.py` 自帶 prefix，其他在 app 層設定 |
| 21 | **CSS 策略混合** — Tailwind / scoped CSS / inline style 三種混用 |
| 22 | **認證頁面用原生 fetch** 而非 apiClient |
| 23 | **模擬數據殘留** — CollaborationBar 假用戶、DashboardPanel 假監控數據 |

### P3 — 企業級缺失

| 缺失模式 | 現狀 |
|---------|------|
| TypeScript | 全 JavaScript，無型別安全 |
| 單元/E2E 測試 | 無 vitest / playwright |
| ESLint + Prettier | 未配置 |
| Error Boundaries | 僅全域攔截 |
| 前端重試/斷路器 | apiClient 無重試機制 |
| i18n 國際化 | 全部中文硬編碼 |
| Docker health check | 無定義 |
| Dify 版本老舊 | 0.6.16，當前 0.11+ |

---

## 三、改善方案 — 按優先級排序

### 階段一：安全修復（立即） ✅ 已完成 (v5.2)

| 項目 | 具體做法 |
|------|---------|
| `eval()` → `json.loads()` | `watcher.py` 的 `_build_inter_node_links` 中 `eval(props_raw)` 改為 `json.loads(props_raw)` |
| 移除 URL query 認證 | `auth.py` 刪除 `request.query_params.get("token")` 分支 |
| Markdown sanitize | DifyChat / AICopilot 加入 `DOMPurify.sanitize()` |

### 階段二：結構拆分（短期） ✅ 已完成 (v5.2)

#### 後端拆分

```
backend/api/
  graph_import.py (1314行) → 拆為:
    ├── import_engine.py    (匯入管線核心邏輯)
    ├── import_prompts.py   (LLM Prompt 模板)
    └── import_api.py       (FastAPI 路由)

  system.py (1065行) → 拆為:
    ├── system_config.py    (配置 CRUD)
    ├── system_upload.py    (檔案上傳)
    └── system_connections.py (連線管理+偵測)

  watcher.py (1038行) → 拆為:
    ├── watcher.py          (純監控邏輯)
    ├── file_processor.py   (Saga 步驟)
    └── node_linker.py      (節點互連)
```

#### 前端拆分

```
stores/
  graphStore.js (1566行) → 拆為:
    ├── graphDataStore.js   (nodes/links CRUD)
    ├── importStore.js      (匯入進度+輪詢)
    ├── ragflowStore.js     (知識庫管理)
    └── crossGraphStore.js  (跨圖譜模式)

views/
  GraphPage.vue (2530行) → 拆為:
    ├── GraphPage.vue         (佈局殼)
    ├── GraphToolPanel.vue    (工具列+密度+Zoom)
    ├── NodeEditDialog.vue    (節點編輯表單)
    ├── AILinkSuggestion.vue  (AI 建議連線)
    └── GraphFilterBar.vue    (篩選+搜尋列)
```

### 階段三：效能最佳化（中期） ✅ 已完成 (v5.3)

| 項目 | 做法 | 狀態 |
|------|------|------|
| **共享 httpx 連線池** | `app.state.http_client` 已存在，讓 `dify.py` / `ragflow.py` / `rag_client.py` 全部使用它 | ✅ 23 處已改用 |
| **graph.py 用 AsyncKuzuWrapper** | 所有端點改用 `await kuzu_manager.safe_query()` | ✅ 15 端點已轉換 |
| **auth.py 加快取** | `verify_token` 加 in-memory LRU cache（TTL 30秒) | ✅ TTL 快取已實作 |
| **Element Plus 按需引入** | 使用 `unplugin-vue-components` + `unplugin-auto-import` | ✅ 插件已配置 |
| **移除 @antv/g6** | 刪除 `GraphView.vue` 和 `/graph` 路由，節省 ~1MB | ✅ 已刪除 |
| **移除 axios** | `package.json` 移除未使用的依賴 | ✅ 已移除 |

### 階段四：統一模式（中長期）

| 項目 | 做法 |
|------|------|
| **統一 Saga** | `watcher.py` 改用 `saga.py` 的 `FileImportSaga` |
| **統一 RAGFlow 呼叫** | `ragflow.py` 全部改用 `RAGFlowClient` |
| **統一任務追蹤** | `graph_import.py` 改用 `TaskQueue` |
| **統一 Response 格式** | 所有 API 回傳 `{ success: bool, data?: any, message?: string, error?: string }` |
| **統一 CSS 策略** | Tailwind-first + scoped CSS 補充，禁止 inline style |
| **Docker health check** | 為每個容器加 `healthcheck` |

### 階段五：工程品質（長期）

| 項目 | 做法 |
|------|------|
| 漸進式 TypeScript | `.js` → `.ts`，從 stores 和 services 開始 |
| ESLint + Prettier | 加入配置 + pre-commit hook |
| Vitest 單元測試 | 先覆蓋 stores 和 utils |
| Dify 升級 | 0.6.16 → 0.11+（需要同步更新 API 呼叫） |

---

## 四、架構優點（不需改動）

| 優點 | 說明 |
|------|------|
| **config.py 原子寫入** | 先寫 `.tmp` 再 `replace()`，防資料損壞 |
| **CircuitBreaker** | 乾淨的斷路器實作，狀態機正確 |
| **結構化日誌 + OTel** | JSON 格式 + Request ID + 可選 trace，生產就緒 |
| **GraphDataManager** | LRU + 請求去重 + TTL，有效減少後端壓力 |
| **AsyncKuzuWrapper** | 讀寫分離並發控制（Lock + Semaphore） |
| **路由 Lazy Loading** | 全部 View 懶載入 |
| **CORS 區網支援** | 正則匹配 `192.168.x.x` |
| **Cypher 白名單防護** | 前後端雙層阻擋寫入操作 |

---

## 五、各模組行數統計

### 後端

| 檔案 | 行數 | 職責 |
|------|------|------|
| `graph_import.py` | 1314 | Excel/CSV 智能匯入 |
| `system.py` | 1065 | 系統設定 + 上傳 + 連線管理 |
| `watcher.py` | 1038 | 檔案監控 + Saga + 節點互連 |
| `kuzu_manager.py` | 935 | KuzuDB 管理 + AsyncWrapper |
| `app_anytype.py` | 692 | 主入口 + 圖譜 API |
| `graph.py` | 588 | 圖譜 CRUD API |
| `task_queue.py` | 527 | 任務佇列 (SQLite) |
| `saga.py` | 426 | Saga 編排器 |
| `media_library.py` | 438 | 媒體庫 (MinIO + Local) |
| `auth.py` | 381 | 認證 (SHA-256 + 多用戶) |
| `agent_service.py` | 307 | Agent 智能代理 |
| `rag_client.py` | 293 | RAGFlow 客戶端 |
| `ragflow.py` | 261 | RAGFlow API 路由 |
| `config.py` | 248 | 配置管理 (config.json) |
| `dify.py` | 223 | Dify LLM 整合 |
| `circuit_breaker.py` | 209 | 斷路器 |
| `logging.py` | 143 | 結構化日誌 |
| `telemetry.py` | 134 | OpenTelemetry |
| `tasks.py` | 63 | 任務管理 API |
| `helpers.py` | 34 | 工具函數 |

### 前端

| 檔案 | 行數 | 職責 |
|------|------|------|
| `GraphPage.vue` | 2530 | 主工作台 (2D/3D 圖譜) |
| `graphStore.js` | 1566 | 核心 Store |
| `ImportPage.vue` | 1249 | 檔案上傳 |
| `Settings.vue` | 1125 | 系統設定 |
| `Graph3D.vue` | 1026 | 獨立 3D 視圖 |
| `Graph2D.vue` | 877 | 2D 力導向圖 |
| `CrossGraphPage.vue` | 842 | 跨圖譜連接 |
| `BatchRepair.vue` | 833 | Excel 批量編輯 |
| `AICopilot.vue` | 711 | AI 助手面板 |
| `style.css` | 653 | 全域樣式 |
| `NexusPage.vue` | 612 | 首頁圖譜列表 |
| `DashboardPanel.vue` | 611 | 監控儀表板 |
| `crossGraphTestData.js` | 592 | Mock 測試數據 |
| `NexusPanel.vue` | 475 | 左側面板 |
| `RAGFlowDocManager.vue` | 427 | RAGFlow 文件管理 |
| `GraphDataManager.js` | 424 | 數據管理中間層 |
| `KnowledgeForm.vue` | 408 | 建立實體表單 |
| `ImportDashboard.vue` | 349 | 匯入儀表板 |
| `DifyChat.vue` | 345 | AI 聊天 |
| `GraphView.vue` | 342 | 舊版 @antv/g6 2D |
| `TimelinePage.vue` | 306 | 時間軸視圖 |
| `LoginPage.vue` | 258 | 登入頁 |
| `BottomToolbar.vue` | 249 | 底部工具列 |
| `Sidebar.vue` | 236 | 側邊欄 |
| `layoutStore.js` | 232 | 佈局 Store |
| `router/index.js` | 194 | 路由 + 認證守衛 |
| `GraphDebugPanel.vue` | 182 | 除錯面板 |
| `DensitySlider.vue` | 155 | 密度滑桿 |
| `CollaborationBar.vue` | 152 | 協作列 |
| `App.vue` | 151 | 主佈局殼 |
| `apiClient.js` | 140 | API 通訊 |
| `NexusBreadcrumb.vue` | 134 | 麵包屑 |
| `nodeColors.js` | 125 | 節點色彩映射 |
| `StatsBar.vue` | 112 | 統計列 |
| `ColorLegend.vue` | 112 | 色彩圖例 |
| `ZoomControls.vue` | 111 | 縮放控制 |
| `main.js` | 36 | 應用入口 |
| `ChatPage.vue` | 8 | 聊天 Wrapper |
