"""
LauncherWorker v3.1 功能測試腳本
快速驗證新增的狀態監控功能
"""
import sys
from pathlib import Path

# 添加項目根目錄到路徑
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from launcher_gui import LauncherWorker
from PySide6.QtCore import QCoreApplication

def test_port_status():
    """測試端口狀態檢查"""
    print("=" * 60)
    print("🧪 測試 1: 端口狀態檢查")
    print("=" * 60)
    
    worker = LauncherWorker(project_root)
    
    # 測試常見端口
    ports = [8000, 5173, 81, 82, 3306]
    for port in ports:
        status = worker.check_port_status(port)
        emoji = "🟢" if status else "🔴"
        print(f"{emoji} Port {port}: {'運行中' if status else '未運行'}")
    
    print()

def test_docker_status():
    """測試 Docker 狀態檢查"""
    print("=" * 60)
    print("🧪 測試 2: Docker 狀態檢查")
    print("=" * 60)
    
    worker = LauncherWorker(project_root)
    docker_alive = worker.check_docker_status()
    
    emoji = "🟢" if docker_alive else "🔴"
    print(f"{emoji} Docker: {'容器運行中' if docker_alive else '未檢測到容器'}")
    print()

def test_already_running_detection():
    """測試已運行服務檢測"""
    print("=" * 60)
    print("🧪 測試 3: 已運行服務檢測")
    print("=" * 60)
    
    worker = LauncherWorker(project_root)
    
    # 測試後端
    backend_running = worker.check_port_status(8000)
    if backend_running:
        print("✅ 後端已在運行，啟動時會自動略過")
    else:
        print("⚠️  後端未運行，啟動時會正常啟動")
    
    # 測試前端
    frontend_running = worker.check_port_status(5173)
    if frontend_running:
        print("✅ 前端已在運行，啟動時會自動略過")
    else:
        print("⚠️  前端未運行，啟動時會正常啟動")
    
    print()

def test_monitor_mode():
    """測試監控模式（僅運行 5 秒）"""
    print("=" * 60)
    print("🧪 測試 4: 監控模式 (5 秒測試)")
    print("=" * 60)
    
    app = QCoreApplication(sys.argv)
    worker = LauncherWorker(project_root, mode='monitor')
    
    # 連接信號
    worker.log_signal.connect(lambda msg: print(f"[LOG] {msg}"))
    worker.status_signal.connect(lambda service, status: 
        print(f"[STATUS] {service.upper()}: {status}")
    )
    
    # 啟動監控（背景執行）
    worker.start()
    
    # 5 秒後停止
    from PySide6.QtCore import QTimer
    def stop_monitor():
        print("\n⏹️  停止監控測試...")
        worker._is_running = False
        worker.wait(1000)
        app.quit()
    
    QTimer.singleShot(5000, stop_monitor)
    
    print("🔄 監控中...")
    app.exec()
    print()

def main():
    """主測試流程"""
    print("\n")
    print("=" * 60)
    print("🚀 BruV LauncherWorker v3.1 功能測試")
    print("=" * 60)
    print()
    
    try:
        # 測試 1: 端口狀態檢查
        test_port_status()
        
        # 測試 2: Docker 狀態檢查
        test_docker_status()
        
        # 測試 3: 已運行服務檢測
        test_already_running_detection()
        
        # 測試 4: 監控模式（需要 Qt 事件循環）
        # test_monitor_mode()  # 取消註釋以啟用
        
        print("=" * 60)
        print("✅ 所有測試完成！")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
