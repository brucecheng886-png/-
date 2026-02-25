# BruV All-in-One 打包技能包 (PyInstaller)

> **對應技能關鍵字**：`打包`、`exe`、`PyInstaller`、`frozen`、`bruv.spec`、`packaging`、`build exe`、`All-in-One`

---

## 1. 打包架構圖

```
使用者雙擊 BruV.exe
  │
  ├── multiprocessing.freeze_support()
  │
  ├─ 主進程: PySide6 GUI ──────────────────────────────┐
  │   launcher_gui.main()                              │
  │   ├─ Docker 健康檢查 (docker-compose)              │
  │   ├─ 8 服務狀態燈 (啟動狀態機)                     │
  │   └─ 瀏覽器開啟 http://127.0.0.1:8000/            │
  │                                                     │
  ├─ 子進程: Uvicorn + FastAPI ──────── (multiprocessing.Process)
  │   bruv_main.run_server()                            │
  │   ├─ app_anytype.py (所有 API Router)              │
  │   ├─ backend/ (KuzuDB, RAGFlow, Dify)             │
  │   └─ StaticFiles → frontend_dist/ (SPA)            │
  │                                                     │
  └── dist/BruV/                                        │
      ├── BruV.exe              ← PyInstaller bootloader
      └── _internal/            ← PyInstaller 6.x 資料目錄
          ├── python310.dll
          ├── app_anytype.py
          ├── launcher_gui.py
          ├── docker-compose.yml
          ├── backend/           ← 後端 Python 模組
          └── frontend_dist/     ← Vue 前端靜態檔
              └── index.html
```

---

## 2. 檔案清單

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `bruv_main.py` | PyInstaller 單一入口點。`freeze_support()` + 延遲 import + `--server-only` CLI |
| `bruv.spec` | PyInstaller spec 檔。定義 datas / hiddenimports / excludes |
| `docs/PACKAGING.md` | 本文件。打包技能包參考 |

### 修改檔案

| 檔案 | 修改內容 |
|------|----------|
| `app_anytype.py` | 新增 `import sys`；新增 `_resolve_frontend_dist()` + `StaticFiles` 掛載段 |
| `launcher_gui.py` | 新增 `get_base_dir()` / `FROZEN`；`start_backend()` frozen 分支；`stop()` frozen 分支；`Path(__file__).parent` → `get_base_dir()` |
| `.github/copilot-instructions.md` | 新增打包技能包條目 |

---

## 3. 打包指令 (Step-by-Step)

### 前置條件

- Python 3.10（**必須用 3.10**，因為所有專案依賴安裝在此版本）
- Node.js ≥ 18（前端 build 用）
- PyInstaller ≥ 6.x（`py -3.10 -m pip install pyinstaller`）

### 打包步驟

```powershell
# 1. 切到專案根目錄
cd "c:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\BruV_Project"

# 2. 編譯前端
cd frontend
npm run build
cd ..

# 3. 清除舊產出並打包
Remove-Item -Recurse -Force build, dist -ErrorAction SilentlyContinue
& "C:\Users\bruce\AppData\Local\Programs\Python\Python310\python.exe" -m PyInstaller bruv.spec --clean

# 4. 驗證產出
Test-Path "dist\BruV\BruV.exe"                      # True
Test-Path "dist\BruV\_internal\frontend_dist\index.html"  # True
Test-Path "dist\BruV\_internal\docker-compose.yml"         # True
Test-Path "dist\BruV\_internal\backend"                    # True
```

### 產出

- `dist/BruV/BruV.exe` — 主執行檔（~218 MB 含 _internal）
- `dist/BruV/_internal/` — 依賴庫、資料檔案

> **重要**：必須使用 Python 3.10 執行 PyInstaller。`py -3` 預設為 3.13，缺少專案依賴。

---

## 4. hiddenimports 完整清單

### PySide6

```
PySide6.QtCore, PySide6.QtGui, PySide6.QtWidgets
```

### Uvicorn（內部大量條件 import）

```
uvicorn, uvicorn.logging
uvicorn.loops, uvicorn.loops.auto
uvicorn.protocols, uvicorn.protocols.http, uvicorn.protocols.http.auto
uvicorn.protocols.http.h11_impl, uvicorn.protocols.http.httptools_impl
uvicorn.protocols.websockets, uvicorn.protocols.websockets.auto
uvicorn.protocols.websockets.wsproto_impl
uvicorn.lifespan, uvicorn.lifespan.on, uvicorn.lifespan.off
```

### FastAPI / Starlette

```
fastapi, fastapi.staticfiles
starlette, starlette.staticfiles, starlette.responses
starlette.middleware, starlette.middleware.cors
```

### 第三方依賴

```
pydantic, pydantic_settings
httpx, httpx._transports, httpx._transports.default
multipart
pandas, openpyxl
kuzu, minio
watchdog, watchdog.observers, watchdog.events
dotenv
```

### multiprocessing（Windows frozen 必要）

```
multiprocessing, multiprocessing.spawn, multiprocessing.popen_spawn_win32
```

### 標準庫

```
email.mime.multipart, email.mime.text, json, logging.config
```

### OpenTelemetry（可選 — 目前註解）

```
# opentelemetry, opentelemetry.sdk, opentelemetry.sdk.trace
# opentelemetry.instrumentation.fastapi, opentelemetry.instrumentation.httpx
```

### backend/ 動態模組

bruv.spec 中以 glob 自動掃描 `backend/` 子目錄產生：

```
backend.api.__init__, backend.api.dify, backend.api.graph, backend.api.graph_import,
backend.api.import_engine, backend.api.import_prompts, backend.api.media_library,
backend.api.ragflow, backend.api.system, backend.api.system_config,
backend.api.system_connections, backend.api.system_upload, backend.api.tasks,
backend.core.__init__, backend.core.auth, backend.core.circuit_breaker,
backend.core.config, backend.core.kuzu_manager, backend.core.logging,
backend.core.telemetry,
backend.services.agent_service, backend.services.file_processor,
backend.services.node_linker, backend.services.saga, backend.services.task_queue,
backend.services.watcher,
backend.utils.__init__, backend.utils.helpers,
backend.rag_client
```

---

## 5. excludes 清單 — 減肥策略

### PySide6 裁剪（僅保留 QtCore / QtGui / QtWidgets / QtNetwork）

```
QtWebEngine, QtWebEngineCore, QtWebEngineWidgets
Qt3DCore, Qt3DRender, Qt3DInput, Qt3DExtras
QtBluetooth, QtNfc, QtPositioning
QtMultimedia, QtMultimediaWidgets
QtSensors, QtSerialPort, QtRemoteObjects
QtQuick, QtQml, QtDesigner, QtHelp, QtTest
```

### ML/CV 巨型框架（非 BruV 依賴，來自全域 Python 環境）

```
torch, torchvision, torchaudio, transformers, tensorflow
cv2, opencv, gradio, gradio_client
matplotlib, scipy, sympy, timm, altair, PIL
safetensors, accelerate, huggingface_hub
tokenizers, sentencepiece, onnx, onnxruntime
```

### 測試 / 開發工具

```
pytest, vitest, tkinter, IPython, notebook, jupyter, numpy.testing
```

> 排除前：~730 MB → 排除後：~218 MB

---

## 6. 已知問題與對策

| 問題 | 原因 | 對策 |
|------|------|------|
| **kuzu .dll 找不到** | kuzu 需要 C++ runtime DLL | `--onedir` 模式保留 DLL 相鄰性；不使用 `--onefile` |
| **frozen 路徑不正確** | PyInstaller frozen exe 的 `__file__` 指向臨時目錄 | `get_base_dir()` 統一使用 `sys.executable.parent`；資料在 `_internal/` |
| **multiprocessing spawn 崩潰** | Windows frozen 必須呼叫 `freeze_support()` | `bruv_main.py` 的 `__main__` 最頂行呼叫 |
| **子進程載入 PySide6** | multiprocessing 子進程會重新 import 頂層模組 | `bruv_main.run_server()` 所有 import 延遲到函式內 |
| **StaticFiles 攔截 API** | 若掛載在 `include_router` 之前，`/api/*` 會被 SPA fallback 攔截 | `_resolve_frontend_dist()` 段必須在所有 `include_router()` 之後 |
| **隱式 import 缺失** | 動態 import 的模組 PyInstaller 掃不到 | hiddenimports 清單 + backend/ glob 自動掃描 |
| **build 使用錯誤 Python** | 系統有多版 Python，`py -3` 預設 3.13 | 必須明確指定 `py -3.10` 或使用完整路徑 `Python310\python.exe` |
| **OpenTelemetry 未安裝** | Python 3.10 全域未安裝 otel | hiddenimports 中已註解；`app_anytype.py` 內 `try/except` 保護 |

---

## 7. 維護規則

### 新增 `backend/` 模組時

`bruv.spec` 的 `_backend_modules` glob 會**自動掃描**新 `.py` 檔，通常無需手動更新。

但若新增子目錄（如 `backend/new_pkg/`），須在 glob 迴圈的 `['api', 'core', 'services', 'utils']` 清單中加入 `'new_pkg'`。

### 新增 Python 依賴時

1. 更新 `requirements.txt`
2. 在 `bruv.spec` 的 `hiddenimports` 清單中新增模組名
3. 若依賴有內部子模組的條件 import（如 uvicorn），需逐一列出
4. 重新打包驗證

### 修改啟動/停止邏輯時

- `launcher_gui.py` 的 `start_backend()` 和 `stop()` 都有 `if FROZEN:` 分支
- 修改原有 subprocess 邏輯後，**必須同步檢查 frozen 分支是否需要調整**
- 測試兩種模式：開發模式（`python launcher_gui.py`）和 frozen 模式（`BruV.exe`）

### 修改前端路由時

- 確認 `_resolve_frontend_dist()` 的 `html=True` 設定仍正確
- 新增 API prefix 時，確認不會被 StaticFiles 攔截（StaticFiles 必須在最後）
