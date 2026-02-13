"""
BruV Launcher - 開發模式（Hot Reload）
監視 launcher_gui.py 的變更，自動重新啟動 Launcher GUI。
用法:  python launcher_dev.py
"""
import sys
import subprocess
import time
from pathlib import Path

try:
    from watchfiles import watch, Change
except ImportError:
    print("❌ 需要 watchfiles 套件。請執行: pip install watchfiles")
    sys.exit(1)

LAUNCHER_FILE = Path(__file__).parent / "launcher_gui.py"
WATCH_FILES = {LAUNCHER_FILE}


def run_launcher():
    """啟動 Launcher GUI 子程序"""
    return subprocess.Popen(
        [sys.executable, str(LAUNCHER_FILE)],
        cwd=str(LAUNCHER_FILE.parent),
    )


def main():
    print("=" * 50)
    print("🔥 BruV Launcher - Dev Mode (Hot Reload)")
    print(f"   監視: {LAUNCHER_FILE.name}")
    print("   儲存檔案即自動重啟 Launcher")
    print("   按 Ctrl+C 結束")
    print("=" * 50)

    process = run_launcher()
    print(f"🚀 Launcher 已啟動 (PID: {process.pid})")

    try:
        for changes in watch(LAUNCHER_FILE.parent, watch_filter=lambda _, path: Path(path).name == "launcher_gui.py"):
            # 只關心 launcher_gui.py 的修改
            for change_type, path in changes:
                if change_type in (Change.modified, Change.added):
                    print(f"\n🔄 偵測到變更: {Path(path).name}")
                    print("   正在重新啟動 Launcher...")

                    # 終止舊程序
                    if process and process.poll() is None:
                        process.terminate()
                        try:
                            process.wait(timeout=5)
                        except subprocess.TimeoutExpired:
                            process.kill()
                    
                    time.sleep(0.3)  # 等待資源釋放

                    # 啟動新程序
                    process = run_launcher()
                    print(f"🚀 Launcher 已重啟 (PID: {process.pid})")
                    break  # 一次只處理一批變更

    except KeyboardInterrupt:
        print("\n🛑 Dev Mode 結束")
    finally:
        if process and process.poll() is None:
            process.terminate()
            process.wait(timeout=5)


if __name__ == "__main__":
    main()
