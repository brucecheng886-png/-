"""
BruV AI Enterprise - GUI 啟動器 v3.0 (Multi-Language Support)
PySide6 視覺化啟動工具
特色：智慧切換按鈕 + 中英文雙語介面
"""
import sys
import os
import subprocess
import socket
import time
import platform
import webbrowser
from pathlib import Path
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QTextEdit, QLabel, QFrame, QComboBox
)
from PySide6.QtCore import (
    Qt, QThread, Signal, QUrl, QTimer
)
from PySide6.QtGui import (
    QFont, QColor, QPalette, QDesktopServices, QTextCursor
)

# 語言字典
LANGUAGES = {
    "zh_TW": {
        # Window Title
        "window_title": "BruV Enterprise Launcher v3.0 - Anytype Edition",
        "logo": "BruV\nENTERPRISE",
        
        # Button States
        "btn_start": "🚀 啟動系統",
        "btn_starting": "⚙️ 啟動中...",
        "btn_stop": "🛑 停止系統",
        "btn_stopping": "⏳ 停止中...",
        "btn_failed": "❌ 啟動失敗",
        "btn_running": "✅ 運行中",
        
        # Quick Links
        "quick_links": "快速連結",
        "btn_open_bruv": "🚀 開啟 BruV AI",
        "btn_open_dify": "🌐 開啟 Dify",
        "btn_open_ragflow": "🧠 開啟 RAGFlow",
        
        # Status
        "status_title": "⚙️ 系統狀態",
        "status_backend": "後端 API",
        "status_frontend": "前端介面",
        "status_docker": "Docker 服務",
        
        # Console
        "console_title": "📋 系統控制台",
        "btn_clear": "🗑️ 清空",
        
        # Language
        "language": "🌐 語言",
        
        # Version
        "version": "v3.0.0 Anytype Edition",
        
        # Logs
        "log_already_running": "⚠️  系統已在運行中...",
        "log_not_running": "⚠️  系統未運行...",
        "log_stopping_system": "🛑 正在停止系統...",
        "log_all_stopped": "✅ 所有服務已停止",
        "log_opening_url": "🌐 正在開啟",
        "log_checking_docker": "🐳 檢查 Docker 服務...",
        "log_docker_running": "✅ Docker 服務運行中",
        "log_docker_not_started": "⚠️  Docker 服務未啟動",
        "log_docker_failed": "⚠️  Docker 檢查失敗",
        "log_starting_backend": "🚀 啟動 FastAPI 後端服務...",
        "log_backend_ready": "✅ 後端服務已就緒",
        "log_backend_failed": "❌ 後端服務啟動失敗",
        "log_starting_frontend": "🎨 啟動 Vue 前端服務...",
        "log_frontend_ready": "✅ 前端服務已就緒",
        "log_frontend_failed": "❌ 前端服務啟動失敗",
        "log_waiting_port": "⏳ 等待服務在 localhost:{} 啟動...",
        "log_port_ready": "✅ 服務已就緒 (localhost:{}) - 耗時 {:.1f}s",
        "log_port_timeout": "❌ 服務啟動超時 (localhost:{})，已等待 {}s",
        "log_launch_success": "🎉 所有服務已成功啟動！",
        "log_launch_failed": "❌ 系統啟動失敗",
    },
    "en_US": {
        # Window Title
        "window_title": "BruV Enterprise Launcher v3.0 - Anytype Edition",
        "logo": "BruV\nENTERPRISE",
        
        # Button States
        "btn_start": "🚀 START SYSTEM",
        "btn_starting": "⚙️ STARTING...",
        "btn_stop": "🛑 STOP SYSTEM",
        "btn_stopping": "⏳ STOPPING...",
        "btn_failed": "❌ START FAILED",
        "btn_running": "✅ RUNNING",
        
        # Quick Links
        "quick_links": "QUICK LINKS",
        "btn_open_bruv": "🚀 Open BruV AI",
        "btn_open_dify": "🌐 Open Dify",
        "btn_open_ragflow": "🧠 Open RAGFlow",
        
        # Status
        "status_title": "⚙️ SYSTEM STATUS",
        "status_backend": "Backend API",
        "status_frontend": "Frontend",
        "status_docker": "Docker",
        
        # Console
        "console_title": "📋 SYSTEM CONSOLE",
        "btn_clear": "🗑️ Clear",
        
        # Language
        "language": "🌐 Language",
        
        # Version
        "version": "v3.0.0 ANYTYPE EDITION",
        
        # Logs
        "log_already_running": "⚠️  System is already running...",
        "log_not_running": "⚠️  System is not running...",
        "log_stopping_system": "🛑 Stopping system...",
        "log_all_stopped": "✅ All services stopped",
        "log_opening_url": "🌐 Opening",
        "log_checking_docker": "🐳 Checking Docker services...",
        "log_docker_running": "✅ Docker services running",
        "log_docker_not_started": "⚠️  Docker services not started",
        "log_docker_failed": "⚠️  Docker check failed",
        "log_starting_backend": "🚀 Starting FastAPI backend...",
        "log_backend_ready": "✅ Backend service ready",
        "log_backend_failed": "❌ Backend service failed to start",
        "log_starting_frontend": "🎨 Starting Vue frontend...",
        "log_frontend_ready": "✅ Frontend service ready",
        "log_frontend_failed": "❌ Frontend service failed to start",
        "log_waiting_port": "⏳ Waiting for service on localhost:{}...",
        "log_port_ready": "✅ Service ready (localhost:{}) - took {:.1f}s",
        "log_port_timeout": "❌ Service startup timeout (localhost:{}), waited {}s",
        "log_launch_success": "🎉 All services started successfully!",
        "log_launch_failed": "❌ System startup failed",
    }
}


class LauncherWorker(QThread):
    """啟動器工作執行緒（避免阻塞 UI）"""
    log_signal = Signal(str)  # 發送 Log 訊息
    status_signal = Signal(str, str)  # (service_name, status: "running"/"stopped"/"error")
    finished_signal = Signal(bool)  # 啟動完成（成功/失敗）

    def __init__(self, project_root):
        super().__init__()
        self.project_root = Path(project_root)
        self.frontend_root = self.project_root / "frontend"
        self.is_windows = platform.system() == 'Windows'
        self.processes = []
        self._is_running = True

    def log(self, message):
        """發送 Log 到 UI"""
        self.log_signal.emit(message)

    def wait_for_port(self, port, timeout=60, check_interval=1):
        """偵測端口是否開啟"""
        self.log(f"⏳ 等待服務在 localhost:{port} 啟動...")
        start_time = time.time()

        while time.time() - start_time < timeout and self._is_running:
            try:
                with socket.create_connection(("localhost", port), timeout=1):
                    elapsed = time.time() - start_time
                    self.log(f"✅ 服務已就緒 (localhost:{port}) - 耗時 {elapsed:.1f}s")
                    return True
            except (socket.timeout, ConnectionRefusedError, OSError):
                time.sleep(check_interval)

        self.log(f"❌ 服務啟動超時 (localhost:{port})，已等待 {timeout}s")
        return False

    def check_docker_services(self):
        """檢查 Docker 服務"""
        self.log("🐳 檢查 Docker 服務...")
        try:
            result = subprocess.run(
                ['docker', 'compose', 'ps'],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=10,
                encoding='utf-8',
                errors='ignore'
            )

            if result.returncode == 0:
                self.log("✅ Docker 服務運行中")
                self.status_signal.emit("docker", "running")
                return True
            else:
                self.log("⚠️  Docker 服務未啟動")
                self.status_signal.emit("docker", "stopped")
                return False
        except Exception as e:
            self.log(f"⚠️  Docker 檢查失敗: {e}")
            self.status_signal.emit("docker", "error")
            return False

    def start_backend(self):
        """啟動 FastAPI 後端"""
        self.log("🚀 啟動 FastAPI 後端服務...")
        self.log("=" * 60)

        try:
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'

            process = subprocess.Popen([
                sys.executable,
                '-m',
                'uvicorn',
                'app_anytype:app',
                '--host', '0.0.0.0',
                '--port', '8000',
                '--reload'
            ],
            cwd=self.project_root,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='ignore'
            )

            self.processes.append(process)
            self.log(f"✅ 後端服務已啟動 (PID: {process.pid})")

            # 開啟一個子執行緒來讀取 Log
            import threading
            def read_stream(stream):
                for line in iter(stream.readline, ''):
                    if line: self.log(line.strip())
                    if not self._is_running: break
                stream.close()

            threading.Thread(target=read_stream, args=(process.stdout,), daemon=True).start()

            return process
        except Exception as e:
            self.log(f"❌ 後端啟動失敗: {e}")
            self.status_signal.emit("backend", "error")
            return None

    def start_frontend(self):
        """啟動 Vue 前端"""
        self.log("🎨 啟動前端開發伺服器...")
        self.log("=" * 60)

        npm_cmd = 'npm.cmd' if self.is_windows else 'npm'

        try:
            process = subprocess.Popen(
                [npm_cmd, 'run', 'dev'],
                cwd=self.frontend_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                errors='ignore'
            )

            self.processes.append(process)
            self.log(f"✅ 前端服務已啟動 (PID: {process.pid})")

             # 開啟一個子執行緒來讀取 Log
            import threading
            def read_stream(stream):
                for line in iter(stream.readline, ''):
                    if line: self.log(line.strip())
                    if not self._is_running: break
                stream.close()

            threading.Thread(target=read_stream, args=(process.stdout,), daemon=True).start()

            return process
        except Exception as e:
            self.log(f"❌ 前端啟動失敗: {e}")
            self.status_signal.emit("frontend", "error")
            return None

    def run(self):
        """主執行流程"""
        self.log("🎯 BruV Enterprise 啟動器")
        self.log("=" * 60)

        # 1. 檢查 Docker
        self.check_docker_services()

        # 2. 啟動後端
        backend_process = self.start_backend()
        if not backend_process:
            self.finished_signal.emit(False)
            return

        self.status_signal.emit("backend", "starting")

        # 3. 等待後端就緒
        if not self.wait_for_port(8000, timeout=60):
            self.log("❌ 後端服務啟動超時")
            self.status_signal.emit("backend", "error")
            self.finished_signal.emit(False)
            return

        self.status_signal.emit("backend", "running")

        # 4. 啟動前端
        frontend_process = self.start_frontend()
        if not frontend_process:
            self.finished_signal.emit(False)
            return

        self.status_signal.emit("frontend", "starting")

        # 5. 等待前端就緒
        if not self.wait_for_port(5173, timeout=60):
            self.log("⚠️  前端服務啟動超時")
            self.status_signal.emit("frontend", "error")
        else:
            self.status_signal.emit("frontend", "running")

        # 6. 完成
        self.log("\n" + "=" * 60)
        self.log("🎉 系統啟動完成！")
        self.log("=" * 60)
        self.log("🔌 Backend:  http://localhost:8000")
        self.log("📖 API Docs: http://localhost:8000/docs")
        self.log("🎨 Frontend: http://localhost:5173")
        self.log("🌐 Dify:     http://localhost:82")
        self.log("🧠 RAGFlow:  http://localhost:81")
        self.log("=" * 60)

        self.finished_signal.emit(True)

    def stop(self):
        """停止所有服務"""
        self._is_running = False
        self.log("🛑 正在停止所有服務...")

        for process in self.processes:
            try:
                if process.poll() is None:
                    if self.is_windows:
                        subprocess.run(
                            ['taskkill', '/F', '/T', '/PID', str(process.pid)],
                            capture_output=True
                        )
                    else:
                        process.terminate()
                        process.wait(timeout=5)
            except Exception as e:
                self.log(f"⚠️  停止進程失敗: {e}")


class StatusIndicator(QWidget):
    """狀態指示燈組件"""
    def __init__(self, label_text, parent=None):
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(10, 5, 10, 5)

        # 狀態燈
        self.indicator = QLabel("●")
        self.indicator.setFont(QFont("Arial", 16, QFont.Bold))
        self.set_status("stopped")

        # 標籤
        self.label = QLabel(label_text)
        self.label.setFont(QFont("Consolas", 10))

        layout.addWidget(self.indicator)
        layout.addWidget(self.label)
        layout.addStretch()

    def set_status(self, status):
        """設置狀態：running, stopped, error, starting"""
        colors = {
            "running": "#00ff00",    # 綠色
            "stopped": "#666666",    # 灰色
            "error": "#ff0000",      # 紅色
            "starting": "#ffaa00"    # 橙色
        }
        self.indicator.setStyleSheet(f"color: {colors.get(status, '#666666')};")
    
    def update_label(self, text):
        """更新標籤文字"""
        self.label.setText(text)


class BruVLauncherGUI(QMainWindow):
    """主視窗"""
    def __init__(self):
        super().__init__()
        self.project_root = Path(__file__).parent
        self.worker = None
        self.drag_position = None
        self.is_system_running = False  # 系統運行狀態旗標
        self.current_language = "zh_TW"  # 預設語言
        self.is_dark_mode = True  # 預設深色模式
        
        # 定義主題色票
        self.themes = {
            "dark": {
                "bg_main": "#191919",
                "bg_sidebar": "#111111",
                "bg_console": "#0f0f0f",
                "bg_card": "#262626",
                "bg_card_hover": "#333333",
                "bg_card_pressed": "#222222",
                "bg_card_secondary": "#1e1e1e",
                "bg_titlebar": "#111111",
                "text_primary": "#e5e5e5",
                "text_secondary": "#aaaaaa",
                "text_muted": "#888888",
                "text_subtle": "#555555",
                "border_subtle": "#2a2a2a",
                "border_default": "#333333",
                "border_strong": "#444444",
                "accent_blue": "#335eea",
                "accent_blue_hover": "#2651dd",
                "accent_blue_pressed": "#1e3faf",
                "accent_red": "#e03131",
                "accent_red_hover": "#c92a2a",
                "accent_red_pressed": "#a61e1e",
                "console_text": "#4ade80",
                "disabled_bg": "#262626",
                "disabled_text": "#555555"
            },
            "light": {
                "bg_main": "#ffffff",
                "bg_sidebar": "#f3f4f6",
                "bg_console": "#f9fafb",
                "bg_card": "#ffffff",
                "bg_card_hover": "#f9fafb",
                "bg_card_pressed": "#f3f4f6",
                "bg_card_secondary": "#f9fafb",
                "bg_titlebar": "#f3f4f6",
                "text_primary": "#1f2937",
                "text_secondary": "#4b5563",
                "text_muted": "#6b7280",
                "text_subtle": "#9ca3af",
                "border_subtle": "#f3f4f6",
                "border_default": "#e5e7eb",
                "border_strong": "#d1d5db",
                "accent_blue": "#335eea",
                "accent_blue_hover": "#2651dd",
                "accent_blue_pressed": "#1e3faf",
                "accent_red": "#e03131",
                "accent_red_hover": "#c92a2a",
                "accent_red_pressed": "#a61e1e",
                "console_text": "#059669",
                "disabled_bg": "#f3f4f6",
                "disabled_text": "#d1d5db"
            }
        }
        
        self.setWindowTitle("BruV Enterprise Launcher")
        self.setFixedSize(900, 600)
        self.setWindowFlags(Qt.FramelessWindowHint)
        self.setAttribute(Qt.WA_TranslucentBackground)

        # 主容器
        main_widget = QWidget()
        main_widget.setObjectName("mainWidget")
        self.setCentralWidget(main_widget)

        main_layout = QVBoxLayout(main_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 自定義標題列
        title_bar = self.create_title_bar()
        main_layout.addWidget(title_bar)

        # 內容區域（左右分割）
        content_layout = QHBoxLayout()
        content_layout.setSpacing(0)

        # 左側邊欄
        sidebar = self.create_sidebar()
        content_layout.addWidget(sidebar, 3)

        # 右側控制台
        console = self.create_console()
        content_layout.addWidget(console, 7)

        main_layout.addLayout(content_layout)
        
        # 應用樣式
        self.apply_styles()
        
        # 初始化標籤顏色
        self.update_label_colors()
    
    def t(self, key: str) -> str:
        """翻譯鍵值"""
        return LANGUAGES.get(self.current_language, LANGUAGES["zh_TW"]).get(key, key) or key
    
    def switch_language(self, lang_code):
        """切換語言"""
        if lang_code in LANGUAGES:
            self.current_language = lang_code
            self.refresh_ui_text()

    def create_title_bar(self):
        """創建自定義標題列"""
        title_bar = QFrame()
        title_bar.setObjectName("titleBar")
        title_bar.setFixedHeight(40)

        layout = QHBoxLayout(title_bar)
        layout.setContentsMargins(15, 0, 10, 0)

        # 標題
        self.title_label = QLabel(self.t("window_title"))
        self.title_label.setFont(QFont("Arial", 11, QFont.Bold))

        layout.addWidget(self.title_label)
        layout.addStretch()

        # 主題切換按鈕
        self.theme_btn = QPushButton("🌙")
        self.theme_btn.setObjectName("themeBtn")
        self.theme_btn.setFixedSize(40, 30)
        self.theme_btn.clicked.connect(self.toggle_theme)
        self.theme_btn.setToolTip("切換深色/淺色模式")

        # 最小化按鈕
        min_btn = QPushButton("─")
        min_btn.setObjectName("minBtn")
        min_btn.setFixedSize(40, 30)
        min_btn.clicked.connect(self.showMinimized)

        # 關閉按鈕
        close_btn = QPushButton("✕")
        close_btn.setObjectName("closeBtn")
        close_btn.setFixedSize(40, 30)
        close_btn.clicked.connect(self.close_application)

        layout.addWidget(self.theme_btn)
        layout.addWidget(min_btn)
        layout.addWidget(close_btn)

        return title_bar

    def create_sidebar(self):
        """創建左側邊欄"""
        sidebar = QFrame()
        sidebar.setObjectName("sidebar")

        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(15)

        # Logo/標題
        self.logo_label = QLabel(self.t("logo"))
        self.logo_label.setAlignment(Qt.AlignCenter)
        self.logo_label.setFont(QFont("Arial", 18, QFont.Bold))
        layout.addWidget(self.logo_label)

        layout.addSpacing(10)
        
        # 語言選擇器
        lang_container = QWidget()
        lang_layout = QHBoxLayout(lang_container)
        lang_layout.setContentsMargins(0, 0, 0, 0)
        lang_layout.setSpacing(5)
        
        self.lang_label = QLabel(self.t("language"))
        self.lang_label.setFont(QFont("Consolas", 9))
        lang_layout.addWidget(self.lang_label)
        
        self.lang_combo = QComboBox()
        self.lang_combo.addItem("中文", "zh_TW")
        self.lang_combo.addItem("English", "en_US")
        self.lang_combo.setCurrentIndex(0)  # 預設中文
        self.lang_combo.currentIndexChanged.connect(self.on_language_changed)
        self.lang_combo.setFixedHeight(30)
        self.lang_combo.setFont(QFont("Arial", 9))
        lang_layout.addWidget(self.lang_combo)
        
        layout.addWidget(lang_container)
        layout.addSpacing(10)

        # 智慧切換按鈕 (啟動/停止合併)
        self.action_btn = QPushButton(self.t("btn_start"))
        self.action_btn.setObjectName("actionBtn")
        self.action_btn.setProperty("state", "idle")  # idle/starting/running/stopping
        self.action_btn.setFixedHeight(60)
        self.action_btn.setFont(QFont("Arial", 14, QFont.Bold))
        self.action_btn.clicked.connect(self.toggle_system)
        layout.addWidget(self.action_btn)

        layout.addSpacing(15)
        
        # 快速連結標籤
        self.quick_links_label = QLabel(self.t("quick_links"))
        self.quick_links_label.setFont(QFont("Consolas", 9))
        layout.addWidget(self.quick_links_label)

        # BruV AI 按鈕
        self.bruv_btn = QPushButton(self.t("btn_open_bruv"))
        self.bruv_btn.setObjectName("primaryLinkBtn")
        self.bruv_btn.setFixedHeight(45)
        self.bruv_btn.clicked.connect(lambda: self.open_url("http://localhost:5173"))
        layout.addWidget(self.bruv_btn)

        # Dify 按鈕
        self.dify_btn = QPushButton(self.t("btn_open_dify"))
        self.dify_btn.setObjectName("linkBtn")
        self.dify_btn.setFixedHeight(40)
        self.dify_btn.clicked.connect(lambda: self.open_url("http://localhost:82"))
        layout.addWidget(self.dify_btn)

        # RAGFlow 按鈕
        self.ragflow_btn = QPushButton(self.t("btn_open_ragflow"))
        self.ragflow_btn.setObjectName("linkBtn")
        self.ragflow_btn.setFixedHeight(40)
        self.ragflow_btn.clicked.connect(lambda: self.open_url("http://localhost:81"))
        layout.addWidget(self.ragflow_btn)

        layout.addSpacing(10)

        # 狀態指示區域
        self.status_title_label = QLabel(self.t("status_title"))
        self.status_title_label.setFont(QFont("Consolas", 9))
        layout.addWidget(self.status_title_label)

        # 狀態指示燈
        self.backend_status = StatusIndicator(self.t("status_backend"))
        self.frontend_status = StatusIndicator(self.t("status_frontend"))
        self.docker_status = StatusIndicator(self.t("status_docker"))

        layout.addWidget(self.backend_status)
        layout.addWidget(self.frontend_status)
        layout.addWidget(self.docker_status)

        layout.addStretch()

        # 版本號
        self.version_label = QLabel(self.t("version"))
        self.version_label.setAlignment(Qt.AlignCenter)
        self.version_label.setFont(QFont("Consolas", 8))
        layout.addWidget(self.version_label)

        return sidebar

    def create_console(self):
        """創建右側控制台"""
        console_frame = QFrame()
        console_frame.setObjectName("console")

        layout = QVBoxLayout(console_frame)
        layout.setContentsMargins(0, 0, 0, 0)

        # Console 標題
        console_header = QFrame()
        console_header.setObjectName("consoleHeader")
        console_header.setFixedHeight(40)

        header_layout = QHBoxLayout(console_header)
        header_layout.setContentsMargins(15, 0, 15, 0)

        self.console_title_label = QLabel(self.t("console_title"))
        self.console_title_label.setFont(QFont("Consolas", 10, QFont.Bold))
        header_layout.addWidget(self.console_title_label)

        header_layout.addStretch()

        self.clear_btn = QPushButton(self.t("btn_clear"))
        self.clear_btn.setObjectName("clearBtn")
        self.clear_btn.setFixedSize(80, 25)
        self.clear_btn.clicked.connect(self.clear_console)
        header_layout.addWidget(self.clear_btn)

        layout.addWidget(console_header)

        # Log 文字區域
        self.console_text = QTextEdit()
        self.console_text.setObjectName("consoleText")
        self.console_text.setReadOnly(True)
        self.console_text.setFont(QFont("Consolas", 9))
        layout.addWidget(self.console_text)

        return console_frame

    def apply_styles(self):
        """應用 QSS 樣式 - 支援深色/淺色主題切換"""
        # 獲取當前主題色票
        theme = self.themes["dark"] if self.is_dark_mode else self.themes["light"]
        
        self.setStyleSheet(f"""
            /* 主視窗 */
            #mainWidget {{
                background: {theme['bg_main']};
                border: 1px solid {theme['border_default']};
                border-radius: 12px;
            }}
            
            /* 標題列 */
            #titleBar {{
                background: {theme['bg_titlebar']};
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
                border-bottom: 1px solid {theme['border_default']};
            }}
            
            #minBtn, #closeBtn, #themeBtn {{
                background: transparent;
                color: {theme['text_muted']};
                border: none;
                font-size: 16px;
                font-weight: normal;
            }}
            
            #minBtn:hover, #themeBtn:hover {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
            }}
            
            #closeBtn:hover {{
                background: {theme['accent_red']};
                color: white;
            }}
            
            /* 側邊欄 */
            #sidebar {{
                background: {theme['bg_sidebar']};
                border-right: 1px solid {theme['border_default']};
            }}
            
            /* 側邊欄文字標籤 - 確保對比度 */
            #sidebar QLabel {{
                color: {theme['text_secondary']};
            }}
            
            /* 智慧切換按鈕 - 多狀態 */
            #actionBtn[state="idle"] {{
                background: {theme['accent_blue']};
                color: white;
                border: none;
                border-radius: 8px;
                padding: 15px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }}
            
            #actionBtn[state="idle"]:hover {{
                background: {theme['accent_blue_hover']};
            }}
            
            #actionBtn[state="idle"]:pressed {{
                background: {theme['accent_blue_pressed']};
            }}
            
            #actionBtn[state="starting"], #actionBtn[state="stopping"] {{
                background: {theme['disabled_bg']};
                color: {theme['disabled_text']};
                border: none;
                border-radius: 8px;
                padding: 15px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }}
            
            #actionBtn[state="running"] {{
                background: {theme['accent_red']};
                color: white;
                border: none;
                border-radius: 8px;
                padding: 15px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }}
            
            #actionBtn[state="running"]:hover {{
                background: {theme['accent_red_hover']};
            }}
            
            #actionBtn[state="running"]:pressed {{
                background: {theme['accent_red_pressed']};
            }}
            
            /* 主要連結按鈕 - Card Style */
            #primaryLinkBtn {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
                border: 1px solid {theme['border_default']};
                border-radius: 6px;
                padding: 12px;
                font-size: 13px;
                font-weight: 500;
                text-align: left;
            }}
            
            #primaryLinkBtn:hover {{
                background: {theme['bg_card_hover']};
            }}
            
            #primaryLinkBtn:pressed {{
                background: {theme['bg_card_pressed']};
            }}
            
            /* 次要連結按鈕 - Card Style */
            #linkBtn {{
                background: {theme['bg_card_secondary']};
                color: {theme['text_secondary']};
                border: 1px solid {theme['border_subtle']};
                border-radius: 6px;
                padding: 10px;
                font-size: 12px;
                font-weight: 500;
                text-align: left;
            }}
            
            #linkBtn:hover {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
            }}
            
            #linkBtn:pressed {{
                background: {theme['bg_card_pressed']};
            }}
            
            /* Console */
            #console {{
                background: {theme['bg_console']};
            }}
            
            #consoleHeader {{
                background: {theme['bg_sidebar']};
                border-bottom: 1px solid {theme['border_subtle']};
            }}
            
            #consoleText {{
                background: {theme['bg_console']};
                color: {theme['console_text']};
                border: none;
            }}
            
            /* 語言選擇器 */
            QComboBox {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
                border: 1px solid {theme['border_default']};
                border-radius: 4px;
                padding: 5px 10px;
                font-size: 10px;
            }}
            
            QComboBox:hover {{
                background: {theme['bg_card_hover']};
                border-color: {theme['border_strong']};
            }}
            
            QComboBox::drop-down {{
                border: none;
                width: 20px;
            }}
            
            QComboBox::down-arrow {{
                image: none;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 6px solid {theme['text_muted']};
                margin-right: 5px;
            }}
            
            QComboBox QAbstractItemView {{
                background: {theme['bg_card_secondary']};
                color: {theme['text_primary']};
                border: 1px solid {theme['border_default']};
                selection-background-color: {theme['accent_blue']};
                selection-color: white;
                padding: 5px;
            }}
            
            /* 清空按鈕 */
            #clearBtn {{
                background: {theme['bg_card_secondary']};
                color: {theme['text_muted']};
                border: 1px solid {theme['border_subtle']};
                border-radius: 4px;
            }}
            
            #clearBtn:hover {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
            }}
            
            #clearBtn:pressed {{
                background: {theme['bg_card_pressed']};
            }}
        """)

    def mousePressEvent(self, event):
        """滑鼠按下（用於拖曳視窗）"""
        if event.button() == Qt.LeftButton:
            self.drag_position = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event):
        """滑鼠移動（拖曳視窗）"""
        if event.buttons() == Qt.LeftButton and self.drag_position:
            self.move(event.globalPosition().toPoint() - self.drag_position)
            event.accept()

    def toggle_system(self):
        """智慧切換系統狀態 (啟動/停止)"""
        if self.is_system_running:
            # 系統運行中 → 執行停止
            self.stop_system()
        else:
            # 系統閒置中 → 執行啟動
            self.start_system()
    
    def start_system(self):
        """啟動系統"""
        if self.worker and self.worker.isRunning():
            self.append_log(self.t("log_already_running"))
            return
        
        # 更新按鈕狀態 (Starting)
        self.set_button_state("starting")
        
        # 清空控制台
        self.console_text.clear()
        
        # 創建並啟動工作執行緒
        self.worker = LauncherWorker(self.project_root)
        self.worker.log_signal.connect(self.append_log)
        self.worker.status_signal.connect(self.update_status)
        self.worker.finished_signal.connect(self.on_launch_finished)
        self.worker.start()
    
    def stop_system(self):
        """停止系統"""
        if not self.worker or not self.worker.isRunning():
            self.append_log(self.t("log_not_running"))
            return
        
        # 更新按鈕狀態 (Stopping)
        self.set_button_state("stopping")
        
        self.append_log("\n" + "=" * 60)
        self.append_log(self.t("log_stopping_system"))
        self.append_log("=" * 60)
        
        # 停止工作執行緒
        self.worker.stop()
        self.worker.wait(5000)  # 等待最多 5 秒
        
        # 重置狀態
        self.backend_status.set_status("stopped")
        self.frontend_status.set_status("stopped")
        
        self.append_log(self.t("log_all_stopped"))
        self.append_log("=" * 60)
        
        # 重置按鈕狀態 (Idle)
        self.is_system_running = False
        self.set_button_state("idle")
    
    def set_button_state(self, state):
        """設置按鈕狀態並更新樣式
        
        Args:
            state: "idle", "starting", "running", "stopping"
        """
        state_config = {
            "idle": {
                "text_key": "btn_start",
                "enabled": True
            },
            "starting": {
                "text_key": "btn_starting",
                "enabled": False
            },
            "running": {
                "text_key": "btn_stop",
                "enabled": True
            },
            "stopping": {
                "text_key": "btn_stopping",
                "enabled": False
            }
        }
        
        config = state_config.get(state, state_config["idle"])
        self.action_btn.setText(self.t(config["text_key"]))
        self.action_btn.setEnabled(config["enabled"])
        self.action_btn.setProperty("state", state)
        # 強制刷新樣式
        self.action_btn.style().unpolish(self.action_btn)
        self.action_btn.style().polish(self.action_btn)

    def append_log(self, message):
        """添加 Log 到控制台"""
        self.console_text.append(message)
        cursor = self.console_text.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.End)
        self.console_text.setTextCursor(cursor)

    def update_status(self, service, status):
        """更新服務狀態"""
        if service == "backend":
            self.backend_status.set_status(status)
        elif service == "frontend":
            self.frontend_status.set_status(status)
        elif service == "docker":
            self.docker_status.set_status(status)

    def on_launch_finished(self, success):
        """啟動完成回調"""
        if success:
            self.is_system_running = True
            self.set_button_state("running")  # 切換到 Running 狀態 (紅色停止按鈕)
        else:
            self.is_system_running = False
            self.set_button_state("idle")  # 失敗後回到 Idle 狀態
            self.action_btn.setText(self.t("btn_failed"))  # 顯示失敗訊息
            # 3 秒後恢復
            QTimer.singleShot(3000, lambda: self.set_button_state("idle"))

    def on_language_changed(self, index):
        """語言切換事件"""
        lang_code = self.lang_combo.itemData(index)
        self.switch_language(lang_code)
    
    def refresh_ui_text(self):
        """刷新所有 UI 文本"""
        # 標題列
        self.title_label.setText(self.t("window_title"))
        
        # 側邊欄
        self.logo_label.setText(self.t("logo"))
        self.lang_label.setText(self.t("language"))
        
        # 按鈕（根據當前狀態）
        current_state = self.action_btn.property("state")
        if current_state == "idle":
            self.action_btn.setText(self.t("btn_start"))
        elif current_state == "starting":
            self.action_btn.setText(self.t("btn_starting"))
        elif current_state == "running":
            self.action_btn.setText(self.t("btn_stop"))
        elif current_state == "stopping":
            self.action_btn.setText(self.t("btn_stopping"))
        
        # 快速連結
        self.quick_links_label.setText(self.t("quick_links"))
        self.bruv_btn.setText(self.t("btn_open_bruv"))
        self.dify_btn.setText(self.t("btn_open_dify"))
        self.ragflow_btn.setText(self.t("btn_open_ragflow"))
        
        # 狀態區
        self.status_title_label.setText(self.t("status_title"))
        self.backend_status.update_label(self.t("status_backend"))
        self.frontend_status.update_label(self.t("status_frontend"))
        self.docker_status.update_label(self.t("status_docker"))
        
        # 控制台
        self.console_title_label.setText(self.t("console_title"))
        self.clear_btn.setText(self.t("btn_clear"))
        
        # 版本號
        self.version_label.setText(self.t("version"))
    
    def open_url(self, url):
        """在瀏覽器中打開 URL"""
        self.append_log(f"{self.t('log_opening_url')}: {url}")
        QDesktopServices.openUrl(QUrl(url))
    
    def toggle_theme(self):
        """切換深色/淺色主題"""
        self.is_dark_mode = not self.is_dark_mode
        
        # 更新主題按鈕圖示
        self.theme_btn.setText("🌙" if self.is_dark_mode else "☀️")
        
        # 重新應用樣式
        self.apply_styles()
        
        # 更新標籤文字顏色
        self.update_label_colors()
        
        # 日誌記錄
        mode_text = "深色模式" if self.is_dark_mode else "淺色模式"
        self.append_log(f"🎨 已切換至{mode_text}")
    
    def update_label_colors(self):
        """更新所有標籤的文字顏色以配合當前主題"""
        theme = self.themes["dark"] if self.is_dark_mode else self.themes["light"]
        
        # 更新標題顏色
        self.title_label.setStyleSheet(f"color: {theme['text_muted']};")
        
        # 更新 Logo 顏色
        self.logo_label.setStyleSheet(f"color: {theme['text_primary']}; letter-spacing: 2px;")
        
        # 更新語言標籤顏色
        self.lang_label.setStyleSheet(f"color: {theme['text_muted']};")
        
        # 更新快速連結標籤顏色
        self.quick_links_label.setStyleSheet(f"color: {theme['text_muted']}; margin-top: 5px;")
        
        # 更新狀態標題標籤顏色
        self.status_title_label.setStyleSheet(f"color: {theme['text_muted']}; margin-top: 10px;")
        
        # 更新版本號顏色（使用 text_secondary 確保淺色模式下可讀）
        self.version_label.setStyleSheet(f"color: {theme['text_secondary']}; margin-bottom: 10px;")
        
        # 更新控制台標題顏色
        self.console_title_label.setStyleSheet(f"color: {theme['text_muted']};")

    def clear_console(self):
        """清空控制台"""
        self.console_text.clear()

    def close_application(self):
        """關閉應用程式"""
        if self.worker and self.worker.isRunning():
            self.append_log("🛑 正在停止所有服務...")
            self.worker.stop()
            self.worker.wait(5000)
        self.close()


def main():
    """主程式入口"""
    try:
        app = QApplication(sys.argv)
        app.setStyle("Fusion")

        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(15, 23, 42))
        palette.setColor(QPalette.WindowText, QColor(248, 250, 252))
        palette.setColor(QPalette.Base, QColor(2, 6, 23))
        palette.setColor(QPalette.AlternateBase, QColor(30, 41, 59))
        palette.setColor(QPalette.Text, QColor(34, 211, 238))
        palette.setColor(QPalette.Button, QColor(30, 41, 59))
        palette.setColor(QPalette.ButtonText, QColor(248, 250, 252))
        app.setPalette(palette)

        launcher = BruVLauncherGUI()
        launcher.show()

        sys.exit(app.exec())
    
    except KeyboardInterrupt:
        print("\n🛑 程序被用戶中斷 (Ctrl+C)")
        sys.exit(0)
    except Exception as e:
        print(f"❌ 啟動器發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()