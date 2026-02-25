# Task: PyInstaller All-in-One 打包 + 建立打包技能包

> **把這整份文件貼給 Claude Code 作為任務指令。**
> Claude Code 會自主掃描相關檔案、實作修改、執行打包、驗證、最後建立 `docs/PACKAGING.md` 技能包。

---

## 任務目標

將 BruV Enterprise Server 打包為單一 `BruV.exe`（All-in-One），包含：
- PySide6 GUI 啟動器 (`launcher_gui.py`)
- FastAPI 後端 (`app_anytype.py` + `backend/`)
- Vue 前端靜態檔 (`frontend/dist/` → 由 FastAPI `StaticFiles` serve)

完成後，建立 `docs/PACKAGING.md` 技能包文件並更新 `copilot-instructions.md`。

---

## Phase 0: 掃描與理解（先讀再做）

在做任何修改之前，**必須先讀取以下檔案**以理解現有架構：

```
必讀檔案：
1. launcher_gui.py          — 掃描全檔，特別注意：
   - import 區塊（頂部）
   - 後端啟動邏輯（搜尋 subprocess.Popen / start_backend / _start_backend）
   - 後端停止邏輯（搜尋 terminate / kill / stop）
   - 所有 Path(__file__).parent 出現位置
   - main() 函式入口

2. app_anytype.py            — 掃描全檔，特別注意：
   - import 區塊
   - app = FastAPI(...) 定義位置
   - 所有 app.include_router(...) 的位置（最後一個 router 在哪行）
   - lifespan 函式
   - sys / Path 相關 import 是否已存在

3. copilot-instructions.md   — 理解技能包格式與啟動器守則

4. requirements.txt          — 確認所有 Python 依賴（PyInstaller hiddenimports 需要）
5. requirements-gui.txt      — PySide6 版本
6. frontend/package.json     — 確認 build script 存在
7. docker-compose.yml        — 確認檔案存在（需打入 exe）
```

掃描完畢後，先輸出一份摘要：
- launcher_gui.py 中啟動後端的函式名稱與行號
- launcher_gui.py 中停止後端的函式名稱與行號
- launcher_gui.py 中所有 `Path(__file__).parent` 的行號列表
- app_anytype.py 中最後一個 `include_router` 的行號
- app_anytype.py 中是否已有 `sys` 和 `pathlib.Path` import

---

## Phase 1: 新增 `bruv_main.py` 入口檔

在專案根目錄新增 `bruv_main.py`，這是 PyInstaller 的唯一 entry point。

**設計要點**：
- `multiprocessing.freeze_support()` 在 `__main__` 最頂部呼叫（Windows frozen exe 必要）
- `run_server()` 內的所有 import 必須延遲（避免子進程載入 PySide6）
- `get_base_dir()` 支援 `sys.frozen` 判斷（frozen → `sys.executable.parent`，否則 `__file__.parent`）
- 提供 `start_server_process()` helper 供 launcher_gui 呼叫，回傳 `multiprocessing.Process`
- `--server-only` CLI flag 支援無 GUI 啟動（伺服器版部署用）

**完整實作**：

```python
"""
BruV Enterprise Server — All-in-One Entry Point

啟動流程：
  使用者雙擊 BruV.exe
    → multiprocessing.freeze_support()
    → 主進程: PySide6 GUI (launcher_gui.main())
    → 子進程: Uvicorn + FastAPI (run_server())
"""
import multiprocessing
import sys
import os
from pathlib import Path


def get_base_dir() -> Path:
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    return Path(__file__).parent


def run_server(host: str = "127.0.0.1", port: int = 8000):
    """子進程入口 — 所有 import 延遲到此處，避免子進程載入 PySide6"""
    base = get_base_dir()
    root_path = str(base)
    backend_path = str(base / 'backend')

    for p in [root_path, backend_path]:
        if p not in sys.path:
            sys.path.insert(0, p)

    os.chdir(root_path)

    import uvicorn
    from app_anytype import app
    uvicorn.run(app, host=host, port=port, log_level="info")


def start_server_process(host: str = "127.0.0.1", port: int = 8000) -> multiprocessing.Process:
    """供 launcher_gui 呼叫，回傳已啟動的 Process"""
    proc = multiprocessing.Process(
        target=run_server, args=(host, port),
        daemon=True, name="BruV-Server"
    )
    proc.start()
    return proc


if __name__ == '__main__':
    multiprocessing.freeze_support()
    if '--server-only' in sys.argv:
        run_server()
    else:
        from launcher_gui import main
        main()
```

**驗證**：`python bruv_main.py` 應能正常啟動 GUI（等同 `python launcher_gui.py`）。

---

## Phase 2: 修改 `app_anytype.py` — 掛載 StaticFiles

**位置**：在最後一個 `app.include_router(...)` 之後插入。

**插入內容**：

```python
# ── 前端靜態檔案 (打包模式 + 開發 fallback) ─────────────
from fastapi.staticfiles import StaticFiles as _StaticFiles

def _resolve_frontend_dist() -> Path | None:
    if getattr(sys, 'frozen', False):
        base = Path(sys.executable).parent
        candidates = [base / 'frontend_dist', base / '_internal' / 'frontend_dist']
    else:
        base = Path(__file__).parent
        candidates = [base / 'frontend' / 'dist']
    for p in candidates:
        if p.is_dir() and (p / 'index.html').exists():
            return p
    return None

_fe_dist = _resolve_frontend_dist()
if _fe_dist:
    app.mount("/", _StaticFiles(directory=str(_fe_dist), html=True), name="frontend")
# ── End StaticFiles ──────────────────────────────────────
```

**防呆檢查**：
- 確認 `sys` 和 `Path` 已在檔案頂部 import，若無則補上
- `html=True` 確保 Vue Router history mode 正常
- 此段必須在所有 `include_router` 之後（否則 `/api/*` 會被 StaticFiles 攔截）

**驗證**：`GET http://127.0.0.1:8000/api/health` 仍正常回應。若 `frontend/dist/` 不存在則自動跳過。

---

## Phase 3: 修改 `launcher_gui.py` — 4 處局部修改

### 3A. 頂部 import 區 — 新增 `get_base_dir()` + `FROZEN`

在 import 區塊末尾插入：

```python
def get_base_dir() -> Path:
    """取得執行檔 / 腳本所在目錄（支援 PyInstaller frozen）"""
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    return Path(__file__).parent

FROZEN = getattr(sys, 'frozen', False)
```

確認 `sys` 和 `Path` 已 import。

### 3B. 後端啟動邏輯 — 新增 frozen 分支

找到啟動後端的函式（Phase 0 掃描得到的函式名與行號），在其內部**最前方**插入 frozen 分支：

```python
if FROZEN:
    from bruv_main import start_server_process
    self._server_process = start_server_process(host="127.0.0.1", port=8000)
    self.append_log("Backend started (embedded process)")
    return
# === 以下為原有 subprocess 邏輯，保持不動 ===
```

### 3C. 後端停止邏輯 — 新增 frozen 分支

找到停止後端的函式，在其**最前方**插入：

```python
if FROZEN and hasattr(self, '_server_process') and self._server_process:
    self._server_process.terminate()
    self._server_process.join(timeout=5)
    if self._server_process.is_alive():
        self._server_process.kill()
    self._server_process = None
    self.append_log("Backend server process stopped")
    return
# === 以下為原有 subprocess 停止邏輯，保持不動 ===
```

### 3D. 全域路徑替換

搜尋所有 `Path(__file__).parent`，替換為 `get_base_dir()`。
- 逐一替換，不要用盲目的全域替換
- 替換後確認語意正確（有些可能是在 class 內部，需確認 scope）

**驗證**：開發模式 `python launcher_gui.py` 啟動/停止功能不受影響。

---

## Phase 4: 新增 `bruv.spec`

在專案根目錄新增 PyInstaller spec 檔。

**關鍵設計**：
- `Analysis` 入口為 `['bruv_main.py']`
- `datas` 打入：`backend/`、`frontend/dist/` (→ `frontend_dist`)、`docker-compose.yml`、`.env.example`、`config.json.example`
- `hiddenimports` 必須涵蓋所有 `backend/` 子模組（因為 FastAPI router 是動態 import 的）
- `excludes` 排除不需要的 PySide6 子模組（QtWebEngine、Qt3D、QtBluetooth 等）與測試框架
- `console=False` 無黑色終端機
- `--onedir` 模式（COLLECT），不用 `--onefile`（避免啟動延遲與 kuzu .dll 路徑問題）

**hiddenimports 清單** — 根據 Phase 0 掃描的 requirements.txt 與 backend/ 模組結構動態產生。至少包含：

```
PySide6.QtCore, PySide6.QtGui, PySide6.QtWidgets
uvicorn, uvicorn.logging, uvicorn.loops, uvicorn.loops.auto
uvicorn.protocols, uvicorn.protocols.http, uvicorn.protocols.http.auto
uvicorn.protocols.websockets, uvicorn.protocols.websockets.auto
uvicorn.lifespan, uvicorn.lifespan.on
fastapi, starlette, starlette.staticfiles
pydantic, pydantic_settings
multipart, python_multipart
httpx, httpx._transports, httpx._transports.default
pandas, openpyxl, kuzu, minio
watchdog, watchdog.observers, watchdog.events
dotenv
multiprocessing, multiprocessing.spawn, multiprocessing.popen_spawn_win32
+ backend/ 下所有 .py 模組的完整 import path
```

**驗證**：`pyinstaller bruv.spec --clean` 零錯誤。

---

## Phase 5: 編譯前端 + 打包測試

```powershell
cd frontend && npm run build && cd ..
pyinstaller bruv.spec --clean
```

打包完成後驗證：
1. `dist/BruV/` 資料夾存在
2. `dist/BruV/BruV.exe` 存在
3. `dist/BruV/frontend_dist/index.html` 存在
4. `dist/BruV/docker-compose.yml` 存在
5. `dist/BruV/backend/` 資料夾存在

若可以執行（有 Docker 環境），額外驗證：
- 雙擊 `BruV.exe` → GUI 出現
- Port 8000 回應 `/api/health`
- 瀏覽器開啟 `http://127.0.0.1:8000/` 顯示前端頁面

---

## Phase 6: 建立技能包 `docs/PACKAGING.md`

打包成功後，建立 `docs/PACKAGING.md`，內容須包含：

1. **打包架構圖**（文字版）：`BruV.exe → PySide6 主進程 + multiprocessing 子進程 (Uvicorn)`
2. **檔案清單**：所有新增/修改的檔案與用途
3. **打包指令**：完整的 step-by-step（含 `npm run build`）
4. **hiddenimports 完整清單**：方便未來新增模組時同步更新
5. **已知問題與對策表**：kuzu .dll、frozen 路徑、multiprocessing spawn 等
6. **維護規則**：
   - 新增 `backend/` 模組時，必須同步更新 `bruv.spec` 的 hiddenimports
   - 新增 Python 依賴時，必須同步更新 `bruv.spec` 的 hiddenimports
   - 修改 `launcher_gui.py` 的啟動/停止邏輯時，必須同時維護 frozen 分支

---

## Phase 7: 更新 `copilot-instructions.md`

在技能包區塊（`## 技能包 (Skill Packs)` 下方）新增：

```markdown
### 📦 打包 (PyInstaller)
- **關鍵字**: `打包`、`exe`、`PyInstaller`、`frozen`、`bruv.spec`、`packaging`、`build exe`、`All-in-One`
- **文件**: `docs/PACKAGING.md`
- **說明**: BruV All-in-One .exe 打包規格，涵蓋 bruv_main.py 入口、multiprocessing 隔離、StaticFiles 掛載、spec 檔維護、已知風險對策。
- **維護規則**: 新增 backend 模組或 Python 依賴時，必須同步更新 `bruv.spec` hiddenimports 與 `docs/PACKAGING.md`。
```

---

## 執行原則

- **局部修改**：不重寫整個檔案，只改需要改的部分
- **開發模式不受影響**：所有修改都有 `if FROZEN` / `if getattr(sys, 'frozen', False)` 保護
- **逐步驗證**：每個 Phase 完成後驗證再進下一步
- **掃描優先**：Phase 0 的掃描結果決定 Phase 3 的精確修改位置，不要猜行號
