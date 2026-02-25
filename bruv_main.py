"""
BruV Enterprise Server — All-in-One Entry Point

啟動流程：
  使用者雙擊 BruV.exe
    → multiprocessing.freeze_support()
    → 主進程: PySide6 GUI (launcher_gui.main())
    → 子進程: Uvicorn + FastAPI (run_server())

CLI flags:
  --server-only   無 GUI，僅啟動 FastAPI 後端
"""
import multiprocessing
import sys
import os
from pathlib import Path


def _ensure_stdio():
    """確保 sys.stdout / sys.stderr 不為 None。
    PyInstaller windowed 模式 (console=False) 下，這兩者為 None，
    會導致 logging、uvicorn、multiprocessing bootstrap 全部 crash。
    """
    _log = get_base_dir() / "bruv_stdio.log"
    if sys.stdout is None:
        sys.stdout = open(str(_log), "a", encoding="utf-8")
    if sys.stderr is None:
        sys.stderr = open(str(_log), "a", encoding="utf-8")


def get_base_dir() -> Path:
    """取得執行檔 / 腳本所在目錄（支援 PyInstaller frozen）"""
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    return Path(__file__).parent


def run_server(host: str = "127.0.0.1", port: int = 8000):
    """子進程入口 — 所有 import 延遲到此處，避免子進程載入 PySide6"""
    _ensure_stdio()  # 子進程也需要安全的 stdout/stderr

    base = get_base_dir()
    root_path = str(base)
    backend_path = str(base / 'backend')

    for p in [root_path, backend_path]:
        if p not in sys.path:
            sys.path.insert(0, p)

    os.chdir(root_path)

    import uvicorn
    from app_anytype import app   # noqa: E402
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
    _ensure_stdio()  # 主進程也需保護，否則 freeze_support 後的 spawn 仍可能失敗

    if '--server-only' in sys.argv:
        run_server()
    else:
        from launcher_gui import main
        main()
