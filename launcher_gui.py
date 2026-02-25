"""
BruV AI Enterprise - GUI 啟動器 v5.5 (Multi-Language Support)
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
import urllib.request
import json
import shutil
from pathlib import Path
from enum import Enum, auto
from dataclasses import dataclass
from typing import Optional, List
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QTextEdit, QLabel, QFrame, QComboBox,
    QDialog, QLineEdit, QMessageBox,
    QCheckBox, QStackedWidget, QScrollArea
)
from PySide6.QtCore import (
    Qt, QThread, Signal, QUrl, QTimer, QProcess, QRectF, QSize
)
from PySide6.QtGui import (
    QFont, QColor, QPalette, QDesktopServices, QTextCursor,
    QIcon, QPixmap, QPainter, QPen, QPainterPath
)


def get_base_dir() -> Path:
    """取得執行檔 / 腳本所在目錄（支援 PyInstaller frozen）"""
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    return Path(__file__).parent


FROZEN = getattr(sys, 'frozen', False)
_NO_WIN = subprocess.CREATE_NO_WINDOW if platform.system() == 'Windows' else 0

# ============================================
# TokenManagerDialog - API Token 管理對話框（密碼保護）
# ============================================
_LAUNCHER_ACCESS_PASSWORD = "Bb20060117"


class TokenManagerDialog(QDialog):
    """API Token 管理對話框 — 需輸入管理員密碼才能查看/修改 Token"""

    def __init__(self, project_root: Path, detected_token: str = None, parent=None):
        super().__init__(parent)
        self.project_root = project_root
        self.env_file = project_root / ".env"
        self._detected_token = detected_token
        self._authenticated = False

        self.setWindowTitle("API Token 管理")
        self.setFixedSize(480, 200)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        self.setStyleSheet("QDialog { background: #191919; }")

        self.main_layout = QVBoxLayout(self)
        self.main_layout.setSpacing(10)
        self.main_layout.setContentsMargins(24, 20, 24, 20)

        self._build_login_page()

    # ──────────────────────────────────────────
    # 第 1 頁：密碼驗證
    # ──────────────────────────────────────────
    def _build_login_page(self):
        """建立密碼輸入畫面"""
        self._clear_layout()

        title = QLabel("管理員驗證")
        title.setFont(QFont("SF Pro Display", 15, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("color: #f5f5f7;")
        self.main_layout.addWidget(title)

        hint = QLabel("請輸入管理員密碼以查看 / 管理 API Token")
        hint.setFont(QFont("SF Pro Text", 11))
        hint.setAlignment(Qt.AlignCenter)
        hint.setStyleSheet("color: #86868b;")
        self.main_layout.addWidget(hint)

        self.main_layout.addSpacing(5)

        self.pwd_input = QLineEdit()
        self.pwd_input.setPlaceholderText("輸入密碼…")
        self.pwd_input.setEchoMode(QLineEdit.Password)
        self.pwd_input.setFont(QFont("SF Mono", 14))
        self.pwd_input.setMinimumHeight(40)
        self.pwd_input.setAlignment(Qt.AlignCenter)
        self.pwd_input.setStyleSheet(
            "QLineEdit { background: #2c2c2e; color: #f5f5f7; border: 1px solid #48484a;"
            " border-radius: 8px; padding: 8px; }"
            "QLineEdit:focus { border: 2px solid #0a84ff; padding: 7px; }"
        )
        self.pwd_input.returnPressed.connect(self._verify_password)
        self.main_layout.addWidget(self.pwd_input)

        self.main_layout.addSpacing(5)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(10)

        verify_btn = QPushButton("解鎖")
        verify_btn.setFixedHeight(38)
        verify_btn.setFont(QFont("SF Pro Display", 12, QFont.Bold))
        verify_btn.setStyleSheet(
            "QPushButton { background: #0a84ff; color: white; border-radius: 10px; }"
            "QPushButton:hover { background: #409cff; }"
            "QPushButton:pressed { background: #0071e3; }"
        )
        verify_btn.clicked.connect(self._verify_password)
        btn_row.addWidget(verify_btn)

        cancel_btn = QPushButton("取消")
        cancel_btn.setFixedHeight(38)
        cancel_btn.setFont(QFont("SF Pro Text", 12))
        cancel_btn.setStyleSheet(
            "QPushButton { background: #3a3a3c; color: #f5f5f7; border-radius: 10px; border: 1px solid #48484a; }"
            "QPushButton:hover { background: #48484a; }"
        )
        cancel_btn.clicked.connect(self.reject)
        btn_row.addWidget(cancel_btn)

        self.main_layout.addLayout(btn_row)

    def _verify_password(self):
        """驗證管理員密碼"""
        if self.pwd_input.text() == _LAUNCHER_ACCESS_PASSWORD:
            self._authenticated = True
            self._build_token_page()
        else:
            QMessageBox.warning(self, "密碼錯誤", "管理員密碼不正確，請重試。")
            self.pwd_input.clear()
            self.pwd_input.setFocus()

    # ──────────────────────────────────────────
    # 第 2 頁：Token 管理
    # ──────────────────────────────────────────
    def _build_token_page(self):
        """驗證成功後顯示 Token 管理介面"""
        self._clear_layout()
        self.setFixedSize(520, 420)

        title = QLabel("API Token 管理")
        title.setFont(QFont("SF Pro Display", 15, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("color: #f5f5f7;")
        self.main_layout.addWidget(title)

        # === 狀態 ===
        current_token = self._read_env_token()
        display_token = current_token or self._detected_token or ""
        status_text = "已設定自訂 Token" if current_token else (
            "首次生成（自動）" if self._detected_token else "尚未設定"
        )
        self.status_label = QLabel(status_text)
        self.status_label.setFont(QFont("SF Pro Text", 12))
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setStyleSheet(
            f"color: {'#30d158' if current_token else '#ff9f0a'}; padding: 4px;"
        )
        self.main_layout.addWidget(self.status_label)

        # === 目前 Token ===
        cur_label = QLabel("目前 Token：")
        cur_label.setFont(QFont("SF Pro Text", 11))
        cur_label.setStyleSheet("color: #86868b;")
        self.main_layout.addWidget(cur_label)

        self.current_display = QLineEdit(display_token if display_token else "（未設定 — 請在下方輸入）")
        self.current_display.setReadOnly(True)
        self.current_display.setFont(QFont("SF Mono", 13))
        self.current_display.setMinimumHeight(38)
        self.current_display.setAlignment(Qt.AlignCenter)
        self.current_display.setStyleSheet(
            "QLineEdit { background: #2c2c2e; color: #30d158; border: 1px solid #48484a;"
            " border-radius: 8px; padding: 8px; selection-background-color: #0a84ff; }"
        )
        if display_token:
            self.current_display.selectAll()
        self.main_layout.addWidget(self.current_display)

        # === 複製 ===
        copy_btn = QPushButton("複製 Token")
        copy_btn.setFixedHeight(30)
        copy_btn.setFont(QFont("SF Pro Text", 11))
        copy_btn.setStyleSheet(
            "QPushButton { background: #3a3a3c; color: #86868b; border: 1px solid #48484a; border-radius: 6px; }"
            "QPushButton:hover { background: #0a84ff; color: white; }"
        )
        copy_btn.clicked.connect(self._copy_token)
        copy_btn.setEnabled(bool(display_token))
        self.copy_btn = copy_btn
        self.main_layout.addWidget(copy_btn)

        self.main_layout.addSpacing(5)

        sep = QFrame()
        sep.setFrameShape(QFrame.HLine)
        sep.setStyleSheet("color: #38383a;")
        self.main_layout.addWidget(sep)

        # === 設定新 Token ===
        new_label = QLabel("設定新的 Token（密碼）：")
        new_label.setFont(QFont("SF Pro Text", 11))
        new_label.setStyleSheet("color: #86868b;")
        self.main_layout.addWidget(new_label)

        self.new_token_input = QLineEdit()
        self.new_token_input.setPlaceholderText("輸入自訂密碼（至少 8 個字元）")
        self.new_token_input.setFont(QFont("SF Mono", 13))
        self.new_token_input.setMinimumHeight(38)
        self.new_token_input.setStyleSheet(
            "QLineEdit { background: #2c2c2e; color: #f5f5f7; border: 1px solid #48484a;"
            " border-radius: 8px; padding: 8px; }"
            "QLineEdit:focus { border: 2px solid #0a84ff; padding: 7px; }"
        )
        self.main_layout.addWidget(self.new_token_input)

        # === 按鈕列 ===
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(10)

        save_btn = QPushButton("儲存並套用")
        save_btn.setFixedHeight(38)
        save_btn.setFont(QFont("SF Pro Display", 12, QFont.Bold))
        save_btn.setStyleSheet(
            "QPushButton { background: #0a84ff; color: white; border-radius: 10px; }"
            "QPushButton:hover { background: #409cff; }"
            "QPushButton:pressed { background: #0071e3; }"
        )
        save_btn.clicked.connect(self._save_token)
        btn_layout.addWidget(save_btn)

        close_btn = QPushButton("關閉")
        close_btn.setFixedHeight(38)
        close_btn.setFont(QFont("SF Pro Text", 12))
        close_btn.setStyleSheet(
            "QPushButton { background: #3a3a3c; color: #f5f5f7; border-radius: 10px; border: 1px solid #48484a; }"
            "QPushButton:hover { background: #48484a; }"
        )
        close_btn.clicked.connect(self.accept)
        btn_layout.addWidget(close_btn)

        self.main_layout.addLayout(btn_layout)

    # ──────────────────────────────────────────
    # 工具方法
    # ──────────────────────────────────────────
    def _clear_layout(self):
        """清空 layout 中所有 widget / sub-layout"""
        while self.main_layout.count():
            item = self.main_layout.takeAt(0)
            w = item.widget()
            if w:
                w.deleteLater()
            sub = item.layout()
            if sub:
                while sub.count():
                    child = sub.takeAt(0)
                    cw = child.widget()
                    if cw:
                        cw.deleteLater()

    def _read_env_token(self) -> str:
        """從 .env 讀取 BRUV_API_TOKEN"""
        if not self.env_file.exists():
            return ""
        try:
            for line in self.env_file.read_text(encoding='utf-8').splitlines():
                stripped = line.strip()
                if stripped.startswith('#') or '=' not in stripped:
                    continue
                key, _, val = stripped.partition('=')
                if key.strip() == 'BRUV_API_TOKEN':
                    return val.strip().strip('"').strip("'")
        except Exception:
            pass
        return ""

    def _write_env_token(self, token: str):
        """寫入 BRUV_API_TOKEN 到 .env（保留其他設定）"""
        lines = []
        token_written = False

        if self.env_file.exists():
            for line in self.env_file.read_text(encoding='utf-8').splitlines():
                stripped = line.strip()
                if stripped.startswith('#') and 'BRUV_API_TOKEN' in stripped:
                    lines.append(line)
                    continue
                key = stripped.partition('=')[0].strip()
                if key == 'BRUV_API_TOKEN':
                    lines.append(f'BRUV_API_TOKEN={token}')
                    token_written = True
                else:
                    lines.append(line)
        else:
            example = self.project_root / ".env.example"
            if example.exists():
                for line in example.read_text(encoding='utf-8').splitlines():
                    stripped = line.strip()
                    if stripped == '# BRUV_API_TOKEN=your_custom_token_here':
                        lines.append(f'BRUV_API_TOKEN={token}')
                        token_written = True
                    else:
                        lines.append(line)
            else:
                lines.append('# BruV API Token')

        if not token_written:
            lines.append(f'BRUV_API_TOKEN={token}')

        self.env_file.write_text('\n'.join(lines) + '\n', encoding='utf-8')

    def _copy_token(self):
        text = self.current_display.text()
        if text and not text.startswith('（'):
            QApplication.clipboard().setText(text)
            QMessageBox.information(self, "已複製", "API Token 已複製到剪貼簿！")

    def _save_token(self):
        new_token = self.new_token_input.text().strip()
        if not new_token:
            QMessageBox.warning(self, "錯誤", "請輸入 Token（密碼）")
            return
        if len(new_token) < 8:
            QMessageBox.warning(self, "錯誤", "Token 至少需要 8 個字元")
            return

        try:
            self._write_env_token(new_token)

            self.current_display.setText(new_token)
            self.current_display.selectAll()
            self.copy_btn.setEnabled(True)
            self.status_label.setText("已設定自訂 Token")
            self.status_label.setStyleSheet("color: #30d158; padding: 4px;")
            self.new_token_input.clear()

            os.environ['BRUV_API_TOKEN'] = new_token

            QMessageBox.information(
                self, "儲存成功",
                "Token 已寫入 .env 檔案。\n\n"
                "請重啟後端服務以套用新 Token。\n\n"
                "前端登入時使用此 Token 作為密碼。"
            )
        except Exception as e:
            QMessageBox.critical(self, "錯誤", f"儲存失敗：{e}")


# ============================================
# ProcessWorker - 非同步執行子進程
# ============================================
class ProcessWorker(QThread):
    """異步執行 subprocess 並實時傳送日誌"""
    log_signal = Signal(str)
    finished_signal = Signal(object)  # 返回 process 對象
    error_signal = Signal(str)
    
    def __init__(self, command, cwd, name="Process"):
        super().__init__()
        self.command = command
        self.cwd = cwd
        self.name = name
        self.process = None
        self._is_running = True
    
    def run(self):
        """在背景執行緒中執行命令"""
        try:
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'
            
            self.log_signal.emit(f"正在啟動 {self.name}...")
            
            self.process = subprocess.Popen(
                self.command,
                cwd=self.cwd,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                errors='ignore',
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == 'Windows' else 0
            )
            
            self.log_signal.emit(f"{self.name} 已啟動 (PID: {self.process.pid})")
            
            # 實時讀取並發送日誌
            for line in iter(self.process.stdout.readline, ''):
                if not self._is_running:
                    break
                if line:
                    self.log_signal.emit(line.strip())
            
            self.process.stdout.close()
            self.process.wait()
            
            self.finished_signal.emit(self.process)
            
        except Exception as e:
            error_msg = f"{self.name} 啟動失敗: {str(e)}"
            self.log_signal.emit(error_msg)
            self.error_signal.emit(error_msg)
    
    def stop(self):
        """停止 Worker"""
        self._is_running = False
        if self.process and self.process.poll() is None:
            try:
                self.process.terminate()
                self.process.wait(timeout=5)
            except:
                self.process.kill()

# 語言字典
LANGUAGES = {
    "zh_TW": {
        # Window Title
        "window_title": "BruV Enterprise Launcher v5.5 - Anytype Edition",
        "logo": "BruV\nENTERPRISE",
        
        # Button States
        "btn_start": "啟動系統",
        "btn_starting": "啟動中...",
        "btn_stop": "停止系統",
        "btn_stopping": "停止中...",
        "btn_failed": "啟動失敗",
        "btn_running": "運行中",
        
        # Quick Links
        "quick_links": "快速連結",
        "btn_open_bruv": "開啟 BruV AI",
        "btn_open_dify": "開啟 Dify",
        "btn_open_ragflow": "開啟 RAGFlow",
        
        # Status
        "status_title": "系統狀態",
        "status_docker": "Docker 引擎",
        "status_dify": "Dify 服務",
        "status_ragflow": "RAGFlow 服務",
        "status_ollama": "Ollama LLM",
        "status_minio": "MinIO 存儲",
        "status_backend": "後端 API",
        "status_kuzu": "KuzuDB 圖譜",
        "status_frontend": "前端介面",
        
        # Console
        "console_title": "系統控制台",
        "btn_clear": "清空",
        
        # Language
        "language": "語言",
        
        # Version
        "version": "v5.5.0 Anytype Edition",
        
        # Logs
        "log_already_running": "系統已在運行中...",
        "log_not_running": "系統未運行...",
        "log_stopping_system": "正在停止系統...",
        "log_all_stopped": "所有服務已停止",
        "log_opening_url": "正在開啟",
        "log_checking_docker": "檢查 Docker 服務...",
        "log_docker_running": "Docker 服務運行中",
        "log_docker_not_started": "Docker 服務未啟動",
        "log_docker_failed": "Docker 檢查失敗",
        "log_starting_backend": "啟動 FastAPI 後端服務...",
        "log_backend_ready": "後端服務已就緒",
        "log_backend_failed": "後端服務啟動失敗",
        "log_starting_frontend": "啟動 Vue 前端服務...",
        "log_frontend_ready": "前端服務已就緒",
        "log_frontend_failed": "前端服務啟動失敗",
        "log_waiting_port": "等待服務在 localhost:{} 啟動...",
        "log_port_ready": "服務已就緒 (localhost:{}) - 耗時 {:.1f}s",
        "log_port_timeout": "服務啟動超時 (localhost:{})，已等待 {}s",
        "log_launch_success": "所有服務已成功啟動！",
        "log_launch_failed": "系統啟動失敗",

        # Setup Page
        "setup_title": "首次設定",
        "setup_subtitle": "請填入必要的 API 金鑰以啟用系統",
        "setup_dify_key": "Dify API Key",
        "setup_ragflow_key": "RAGFlow API Key",
        "setup_dify_help": "在 Dify 管理後台 → API 金鑰取得",
        "setup_ragflow_help": "在 RAGFlow 管理後台 → API 金鑰取得",
        "setup_skip": "跳過設定",
        "setup_save_and_start": "保存並啟動",
        "setup_btn_edit_api": "編輯 API 金鑰",
        "log_toggle_show": "▲ 顯示日誌",
        "log_toggle_hide": "▼ 隱藏日誌",
        "brand_title": "BruV Enterprise",
        "brand_subtitle": "Knowledge Graph · AI · Enterprise",
        # Welcome guide (right panel)
        "welcome_heading": "歡迎使用 BruV",
        "welcome_step1": "①  在左側填入 API 金鑰",
        "welcome_step2": "②  點擊「保存並啟動」",
        "welcome_step3": "③  系統將自動啟動所有服務",
    },
    "en_US": {
        # Window Title
        "window_title": "BruV Enterprise Launcher v5.5 - Anytype Edition",
        "logo": "BruV\nENTERPRISE",
        
        # Button States
        "btn_start": "START SYSTEM",
        "btn_starting": "STARTING...",
        "btn_stop": "STOP SYSTEM",
        "btn_stopping": "STOPPING...",
        "btn_failed": "START FAILED",
        "btn_running": "RUNNING",
        
        # Quick Links
        "quick_links": "QUICK LINKS",
        "btn_open_bruv": "Open BruV AI",
        "btn_open_dify": "Open Dify",
        "btn_open_ragflow": "Open RAGFlow",
        
        # Status
        "status_title": "SYSTEM STATUS",
        "status_docker": "Docker Engine",
        "status_dify": "Dify",
        "status_ragflow": "RAGFlow",
        "status_ollama": "Ollama LLM",
        "status_minio": "MinIO Storage",
        "status_backend": "Backend API",
        "status_kuzu": "KuzuDB Graph",
        "status_frontend": "Frontend",
        
        # Console
        "console_title": "SYSTEM CONSOLE",
        "btn_clear": "Clear",
        
        # Language
        "language": "Language",
        
        # Version
        "version": "v5.5.0 ANYTYPE EDITION",
        
        # Logs
        "log_already_running": "System is already running...",
        "log_not_running": "System is not running...",
        "log_stopping_system": "Stopping system...",
        "log_all_stopped": "All services stopped",
        "log_opening_url": "Opening",
        "log_checking_docker": "Checking Docker services...",
        "log_docker_running": "Docker services running",
        "log_docker_not_started": "Docker services not started",
        "log_docker_failed": "Docker check failed",
        "log_starting_backend": "Starting FastAPI backend...",
        "log_backend_ready": "Backend service ready",
        "log_backend_failed": "Backend service failed to start",
        "log_starting_frontend": "Starting Vue frontend...",
        "log_frontend_ready": "Frontend service ready",
        "log_frontend_failed": "Frontend service failed to start",
        "log_waiting_port": "Waiting for service on localhost:{}...",
        "log_port_ready": "Service ready (localhost:{}) - took {:.1f}s",
        "log_port_timeout": "Service startup timeout (localhost:{}), waited {}s",
        "log_launch_success": "All services started successfully!",
        "log_launch_failed": "System startup failed",

        # Setup Page
        "setup_title": "First-Time Setup",
        "setup_subtitle": "Enter required API keys to activate the system",
        "setup_dify_key": "Dify API Key",
        "setup_ragflow_key": "RAGFlow API Key",
        "setup_dify_help": "Get the key from Dify Admin → API Keys",
        "setup_ragflow_help": "Get the key from RAGFlow Admin → API Keys",
        "setup_skip": "Skip Setup",
        "setup_save_and_start": "Save & Start",
        "setup_btn_edit_api": "Edit API Keys",
        "log_toggle_show": "▲ Show Log",
        "log_toggle_hide": "▼ Hide Log",
        "brand_title": "BruV Enterprise",
        "brand_subtitle": "Knowledge Graph · AI · Enterprise",
        # Welcome guide (right panel)
        "welcome_heading": "Welcome to BruV",
        "welcome_step1": "①  Enter your API keys on the left",
        "welcome_step2": "②  Click \"Save & Start\"",
        "welcome_step3": "③  All services will launch automatically",
    }
}


# ============================================
# P0: 啟動階段列舉 + 健康檢查目標
# ============================================
class StartupPhase(Enum):
    """啟動序列的階段定義"""
    IDLE             = auto()
    DOCKER_DETECT    = auto()   # docker info — 偵測 Docker Desktop
    ENV_CHECK        = auto()   # 確保 .env 存在並含必要變數
    DOCKER_COMPOSE   = auto()   # docker-compose up -d
    CONTAINER_HEALTH = auto()   # 輪詢 4 個容器 HTTP 健康端點
    FASTAPI_START    = auto()   # 啟動 uvicorn subprocess
    FASTAPI_HEALTH   = auto()   # 輪詢 /api/health
    FRONTEND_START   = auto()   # 啟動 npm run dev
    FRONTEND_HEALTH  = auto()   # 輪詢 port 5173
    BROWSER_OPEN     = auto()   # 開啟瀏覽器
    RUNNING          = auto()
    FAILED           = auto()


@dataclass
class HealthTarget:
    """單一服務的 HTTP 健康檢查定義"""
    name: str
    url: str
    timeout_sec: int = 120
    poll_interval: float = 3.0
    expect_status: int = 200
    expect_body_contains: Optional[str] = None   # None = 只檢查 status code


# ============================================
# P0: 啟動序列狀態機 — 在 LauncherWorker 執行緒中運行
# ============================================
class StartupStateMachine:
    """
    循序執行啟動階段：
    DOCKER_DETECT → DOCKER_COMPOSE → CONTAINER_HEALTH
    → FASTAPI_START → FASTAPI_HEALTH → FRONTEND_START
    → FRONTEND_HEALTH → BROWSER_OPEN → RUNNING
    任一階段失敗即進入 FAILED 並回傳 False。
    """

    # ── 容器健康端點（對應 docker-compose.yml 實際 port） ──
    CONTAINER_TARGETS: List[HealthTarget] = [
        HealthTarget(
            name="Dify",
            url="http://localhost:82/",
            timeout_sec=120,
            poll_interval=3.0,
        ),
        HealthTarget(
            name="RAGFlow",
            url="http://127.0.0.1:9380/v1/health",
            timeout_sec=120,
            poll_interval=3.0,
        ),
        HealthTarget(
            name="Ollama",
            url="http://localhost:11434/",
            timeout_sec=120,
            poll_interval=3.0,
            expect_body_contains="Ollama",
        ),
        HealthTarget(
            name="MinIO",
            url="http://localhost:9000/minio/health/live",
            timeout_sec=120,
            poll_interval=3.0,
        ),
    ]

    FASTAPI_TARGET = HealthTarget(
        name="FastAPI",
        url="http://localhost:8000/api/health",
        timeout_sec=30,
        poll_interval=2.0,
    )

    FRONTEND_TARGET = HealthTarget(
        name="Frontend",
        url="http://localhost:8000/" if FROZEN else "http://localhost:5173/",
        timeout_sec=60,
        poll_interval=2.0,
    )

    def __init__(self, worker: 'LauncherWorker'):
        self._worker = worker
        self._cancelled = False
        self.phase = StartupPhase.IDLE

    # ── 外部呼叫：取消 ──
    def cancel(self):
        self._cancelled = True

    # ── 主流程 ──
    def run(self) -> bool:
        """依序執行所有啟動階段，成功回傳 True。"""
        phases = [
            (StartupPhase.DOCKER_DETECT,    self._phase_docker_detect),
            (StartupPhase.ENV_CHECK,        self._phase_ensure_env),
            (StartupPhase.DOCKER_COMPOSE,   self._phase_docker_compose),
            (StartupPhase.CONTAINER_HEALTH, self._phase_container_health),
            (StartupPhase.FASTAPI_START,    self._phase_fastapi_start),
            (StartupPhase.FASTAPI_HEALTH,   self._phase_fastapi_health),
            (StartupPhase.FRONTEND_START,   self._phase_frontend_start),
            (StartupPhase.FRONTEND_HEALTH,  self._phase_frontend_health),
            (StartupPhase.BROWSER_OPEN,     self._phase_browser_open),
        ]

        for phase_enum, handler in phases:
            if self._cancelled:
                self._log("啟動已被取消")
                self.phase = StartupPhase.FAILED
                return False

            self.phase = phase_enum
            self._log(f"\n{'─' * 50}")
            self._log(f"階段：{phase_enum.name}")
            self._log(f"{'─' * 50}")

            if not handler():
                self.phase = StartupPhase.FAILED
                self._log(f"階段 {phase_enum.name} 失敗，啟動中止")
                return False

        # 全部通過
        self.phase = StartupPhase.RUNNING
        self._log("\n" + "=" * 60)
        self._log("系統啟動完成！")
        self._log("=" * 60)
        _fe_url = "http://localhost:8000" if FROZEN else "http://localhost:5173"
        self._log(f"Backend:  http://localhost:8000")
        self._log(f"API Docs: http://localhost:8000/docs")
        self._log(f"Frontend: {_fe_url}")
        self._log(f"Dify:     http://localhost:82")
        self._log(f"RAGFlow:  http://localhost:81")
        self._log("=" * 60)
        return True

    # ── Phase 1: Docker Desktop 偵測 ──
    _DOCKER_GUIDE = (
        "\n┌─── Docker Desktop 未偵測到 ───┐\n"
        "│ BruV 需要 Docker 來運行 Dify / RAGFlow / MinIO\n"
        "│\n"
        "│ ▸ 下載安裝:\n"
        "│   https://www.docker.com/products/docker-desktop/\n"
        "│\n"
        "│ ▸ 常見問題:\n"
        "│   1. WSL2 未安裝 → 管理員執行: wsl --install\n"
        "│   2. Hyper-V 未啟用 → BIOS 開啟虛擬化\n"
        "└──────────────────────────────────────┘"
    )

    # Docker Desktop 常見安裝路徑（Windows）
    _DOCKER_EXE_CANDIDATES = [
        r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
        r"C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe",
    ]

    _DOCKER_AUTOSTART_TIMEOUT = 90  # 自動啟動後最多等 90 秒

    def _is_docker_ready(self) -> bool:
        """單次檢查 docker daemon 是否就緒（不拋例外）。"""
        try:
            r = subprocess.run(
                ['docker', 'info'],
                capture_output=True, text=True, timeout=8,
                encoding='utf-8', errors='ignore',
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == 'Windows' else 0,
            )
            return r.returncode == 0
        except Exception:
            return False

    def _find_docker_desktop_exe(self) -> str | None:
        """多策略搜尋 Docker Desktop 執行檔，回傳路徑或 None。"""
        # 策略 1：常見路徑
        for p in self._DOCKER_EXE_CANDIDATES:
            if os.path.isfile(p):
                return p

        if platform.system() != 'Windows':
            return None

        # 策略 2：Windows Registry
        import winreg
        for hive, flag in [
            (winreg.HKEY_LOCAL_MACHINE, 0),
            (winreg.HKEY_CURRENT_USER, 0),
        ]:
            try:
                key = winreg.OpenKey(
                    hive,
                    r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Docker Desktop",
                    0, winreg.KEY_READ | flag,
                )
                install_dir, _ = winreg.QueryValueEx(key, "InstallLocation")
                winreg.CloseKey(key)
                candidate = os.path.join(install_dir, "Docker Desktop.exe")
                if os.path.isfile(candidate):
                    return candidate
            except OSError:
                pass

        # 策略 3：從 docker CLI 路徑反推
        try:
            r = subprocess.run(
                ['where.exe', 'docker'],
                capture_output=True, text=True, timeout=5,
                creationflags=subprocess.CREATE_NO_WINDOW,
            )
            for line in r.stdout.strip().splitlines():
                # docker CLI: ...\Docker\Docker\resources\bin\docker.exe
                # Desktop:    ...\Docker\Docker\Docker Desktop.exe
                docker_dir = os.path.dirname(os.path.dirname(os.path.dirname(line.strip())))
                candidate = os.path.join(docker_dir, "Docker Desktop.exe")
                if os.path.isfile(candidate):
                    return candidate
        except Exception:
            pass

        return None

    def _try_launch_docker_desktop(self) -> bool:
        """嘗試自動開啟 Docker Desktop，成功回傳 True。"""
        exe_path = self._find_docker_desktop_exe()
        if exe_path:
            self._log(f"   找到: {exe_path}")
            try:
                subprocess.Popen(
                    [exe_path],
                    creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
                )
                return True
            except Exception as e:
                self._log(f"   啟動失敗: {e}")

        # Fallback：Windows Start Menu 捷徑
        if platform.system() == 'Windows':
            try:
                os.startfile("Docker Desktop")          # type: ignore[attr-defined]
                return True
            except OSError:
                pass

        return False

    def _phase_docker_detect(self) -> bool:
        self._log("偵測 Docker Desktop...")

        # ── 第一輪：快速檢測 ──
        if self._is_docker_ready():
            self._log("Docker Desktop 已就緒")
            self._worker.status_signal.emit("docker", "running")
            return True

        # ── Docker 未就緒 → 嘗試自動啟動 ──
        self._log("Docker Desktop 未運行，嘗試自動啟動...")
        self._worker.status_signal.emit("docker", "starting")

        if not self._try_launch_docker_desktop():
            # 找不到 Docker Desktop 執行檔 → 未安裝
            self._log("找不到 Docker Desktop — 請先安裝")
            self._worker.status_signal.emit("docker", "error")
            self._log(self._DOCKER_GUIDE)
            return False

        # ── 等待 Docker daemon 就緒 ──
        self._log(f"   等待 Docker Desktop 啟動完成（最長 {self._DOCKER_AUTOSTART_TIMEOUT}s）...")
        start_time = time.time()
        last_progress = 0
        while time.time() - start_time < self._DOCKER_AUTOSTART_TIMEOUT:
            if self._cancelled:
                return False
            if self._is_docker_ready():
                elapsed = time.time() - start_time
                self._log(f"Docker Desktop 已就緒（等待 {elapsed:.0f}s）")
                self._worker.status_signal.emit("docker", "running")
                return True

            elapsed_int = int(time.time() - start_time)
            if elapsed_int >= 10 and elapsed_int % 15 == 0 and elapsed_int != last_progress:
                last_progress = elapsed_int
                self._log(f"   Docker 啟動中... {elapsed_int}s / {self._DOCKER_AUTOSTART_TIMEOUT}s")

            time.sleep(3)

        # ── 逾時 ──
        self._log(f"Docker Desktop 啟動逾時（{self._DOCKER_AUTOSTART_TIMEOUT}s）")
        self._log("   Docker Desktop 可能仍在初始化，請等待圖示變為綠色後重新啟動 BruV")
        self._worker.status_signal.emit("docker", "error")
        self._log(self._DOCKER_GUIDE)
        return False

    # ── Phase 1.5: 確保 .env 檔案存在 ──
    def _phase_ensure_env(self) -> bool:
        """確保 .env 檔案存在，若不存在則從 .env.example 複製。"""
        base = self._worker.project_root
        env_path = base / ".env"

        if env_path.exists():
            self._log(".env 檔案已存在")
            # 檢查是否含有必要變數
            content = env_path.read_text(encoding='utf-8', errors='ignore')
            required_vars = ['DIFY_SECRET_KEY', 'DIFY_DB_PASSWORD',
                             'RAGFLOW_MYSQL_PASSWORD', 'MINIO_ROOT_PASSWORD',
                             'RAGFLOW_REDIS_PASSWORD']
            missing = [v for v in required_vars
                       if not any(line.startswith(f"{v}=") for line in content.splitlines())]
            if missing:
                self._log(f".env 缺少以下必要變數: {', '.join(missing)}")
                # 嘗試從範本補齊缺少的變數
                self._patch_env_from_example(env_path, missing)
            return True

        # 搜尋 .env.example：base → _internal (PyInstaller)
        candidates = [
            base / ".env.example",
            Path(sys.executable).parent / "_internal" / ".env.example" if FROZEN else None,
            base / "_internal" / ".env.example",
        ]
        example_path = next((p for p in candidates if p and p.exists()), None)

        if example_path:
            shutil.copy2(example_path, env_path)
            self._log(f".env 檔案已從範本建立: {example_path}")
            self._log("請在首次設定頁面填入實際 API 金鑰與密碼")
            return True

        # 無範本 — 建立最小 .env
        self._log(".env.example 範本不存在，建立空白 .env")
        env_path.touch()
        return True

    def _patch_env_from_example(self, env_path: Path, missing_vars: list):
        """從 .env.example 範本補齊缺少的變數到現有 .env"""
        base = env_path.parent
        candidates = [
            base / ".env.example",
            Path(sys.executable).parent / "_internal" / ".env.example" if FROZEN else None,
            base / "_internal" / ".env.example",
        ]
        example_path = next((p for p in candidates if p and p.exists()), None)
        if not example_path:
            self._log("   找不到 .env.example 範本，無法自動補齊")
            return

        example_content = example_path.read_text(encoding='utf-8', errors='ignore')
        lines_to_add = []
        for line in example_content.splitlines():
            for var in missing_vars:
                if line.startswith(f"{var}="):
                    lines_to_add.append(line)

        if lines_to_add:
            with open(env_path, 'a', encoding='utf-8') as f:
                f.write('\n# ── 自動補齊 (from .env.example) ──\n')
                for line in lines_to_add:
                    f.write(line + '\n')
            self._log(f"   已自動從範本補齊 {len(lines_to_add)} 個變數")

    # ── Phase 2: docker compose up -d ──
    def _phase_docker_compose(self) -> bool:
        self._log("啟動 Docker 容器 (docker compose up -d)...")

        # 解析 docker-compose.yml 所在目錄
        project_root = Path(self._worker.project_root)
        if FROZEN:
            # PyInstaller 打包模式：yml 在 _internal/ 下
            compose_dir = Path(sys.executable).parent / '_internal'
            if not (compose_dir / 'docker-compose.yml').exists():
                compose_dir = project_root  # fallback
        else:
            compose_dir = project_root

        if not (compose_dir / 'docker-compose.yml').exists():
            self._log(f"找不到 docker-compose.yml (搜尋: {compose_dir})")
            return False

        self._log(f"   compose 目錄: {compose_dir}")

        # ── 前置檢查：docker-compose.yml bind mount 所需檔案 ──
        _required_mounts = [
            compose_dir / 'observability' / 'loki-config.yml',
            compose_dir / 'observability' / 'promtail-config.yml',
            compose_dir / 'observability' / 'grafana-datasources.yml',
            compose_dir / 'nginx' / 'ragflow.conf',
            compose_dir / 'dify' / 'nginx' / 'conf.d' / 'default.conf',
        ]
        _mount_ok = True
        for mf in _required_mounts:
            if not mf.exists():
                self._log(f"⚠ 缺少掛載檔案: {mf}")
                _mount_ok = False
        if not _mount_ok:
            self._log("docker-compose 所需的設定檔不完整，無法啟動容器")
            self._log("請確認打包 (PyInstaller) 已包含 observability/、nginx/、dify/ 目錄")
            return False

        # Docker Compose V2 (docker compose) vs V1 (docker-compose) 自動偵測
        compose_cmd = None
        _cflags = subprocess.CREATE_NO_WINDOW if platform.system() == 'Windows' else 0
        for cmd in [['docker', 'compose'], ['docker-compose']]:
            try:
                test = subprocess.run(
                    cmd + ['version'],
                    capture_output=True, text=True, timeout=10,
                    creationflags=_cflags,
                )
                if test.returncode == 0:
                    compose_cmd = cmd
                    self._log(f"   使用指令: {' '.join(cmd)}")
                    break
            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue

        if compose_cmd is None:
            self._log("找不到 docker compose 或 docker-compose 指令")
            return False

        # 確定 .env 路徑 — compose 在 _internal/ 執行，但 .env 在 project_root
        env_file = project_root / ".env"
        compose_args = compose_cmd + ['up', '-d']
        if env_file.exists() and compose_dir != project_root:
            compose_args = compose_cmd + ['--env-file', str(env_file), 'up', '-d']
            self._log(f"   env-file: {env_file}")

        max_attempts = 2
        for attempt in range(1, max_attempts + 1):
            try:
                result = subprocess.run(
                    compose_args,
                    cwd=str(compose_dir),
                    capture_output=True,
                    text=True,
                    timeout=300,
                    encoding='utf-8',
                    errors='ignore',
                    creationflags=_cflags,
                )
                for line in result.stdout.strip().splitlines():
                    if line.strip():
                        self._log(f"   {line.strip()}")
                for line in result.stderr.strip().splitlines():
                    if line.strip():
                        self._log(f"   {line.strip()}")

                if result.returncode == 0:
                    self._log("Docker 容器已啟動")
                    return True

                # ── 自動修復：首次失敗時 down 再重試 ──
                if attempt < max_attempts:
                    self._log("首次啟動失敗，執行 docker compose down --remove-orphans...")
                    down_args = compose_cmd + ['down', '--remove-orphans']
                    if env_file.exists() and compose_dir != project_root:
                        down_args = compose_cmd + ['--env-file', str(env_file), 'down', '--remove-orphans']
                    down = subprocess.run(
                        down_args,
                        cwd=str(compose_dir),
                        capture_output=True, text=True, timeout=60,
                        encoding='utf-8', errors='ignore',
                        creationflags=_cflags,
                    )
                    for line in (down.stderr or "").strip().splitlines():
                        if line.strip():
                            self._log(f"   {line.strip()}")
                    self._log("清理完成，重試 docker compose up -d...")
                    continue  # retry

                self._log(f"docker compose up -d 失敗 (exit code: {result.returncode})")
                return False
            except subprocess.TimeoutExpired:
                self._log("docker compose up -d 逾時（300s）")
                return False
            except Exception as e:
                self._log(f"docker compose 啟動異常: {e}")
                return False

        self._log("docker compose 重試次數已用盡")
        return False

    # ── Phase 3: 容器健康輪詢 ──
    def _phase_container_health(self) -> bool:
        self._log("輪詢容器健康端點...")
        all_ok = True
        for target in self.CONTAINER_TARGETS:
            if self._cancelled:
                return False
            self._log(f"   等待 {target.name} ({target.url})...")
            if self._poll_health(target):
                self._log(f"   {target.name} 健康")
            else:
                self._log(f"   {target.name} 健康檢查逾時 ({target.timeout_sec}s)")
                all_ok = False
        if all_ok:
            self._worker.status_signal.emit("docker", "running")
        else:
            self._worker.status_signal.emit("docker", "error")
        return all_ok

    # ── Phase 4: 啟動 FastAPI ──
    def _phase_fastapi_start(self) -> bool:
        self._log("啟動 FastAPI 後端服務...")
        result = self._worker.start_backend()
        if result == "already_running":
            self._log("後端服務已在運行中")
            self._worker.status_signal.emit("backend", "running")
            return True
        if result is None:
            self._log("後端服務啟動失敗")
            return False
        # subprocess 已建立，PID 已加入 worker.processes
        self._worker.status_signal.emit("backend", "starting")
        return True

    # ── Phase 5: FastAPI 健康輪詢 ──
    def _phase_fastapi_health(self) -> bool:
        self._log(f"等待 FastAPI 就緒 ({self.FASTAPI_TARGET.url})...")
        if self._poll_health(self.FASTAPI_TARGET):
            self._log("FastAPI 後端已就緒")
            self._worker.status_signal.emit("backend", "running")
            return True
        else:
            self._log(f"FastAPI 健康檢查逾時 ({self.FASTAPI_TARGET.timeout_sec}s)")
            self._worker.status_signal.emit("backend", "error")
            return False

    # ── Phase 6: 啟動前端 dev server ──
    def _phase_frontend_start(self) -> bool:
        # Frozen 模式：前端已預編譯為靜態檔案，由 FastAPI 直接 serve
        if FROZEN:
            self._log("Frozen 模式：前端由 FastAPI 靜態檔案提供，跳過 npm")
            self._worker.status_signal.emit("frontend", "running")
            return True

        self._log("啟動前端開發伺服器...")
        result = self._worker.start_frontend()
        if result == "already_running":
            self._log("前端服務已在運行中")
            self._worker.status_signal.emit("frontend", "running")
            return True
        if result is None:
            self._log("前端服務啟動失敗")
            return False
        self._worker.status_signal.emit("frontend", "starting")
        return True

    # ── Phase 7: 前端健康輪詢 ──
    def _phase_frontend_health(self) -> bool:
        # Frozen 模式：前端掛在 FastAPI 上，只需確認 / 可達
        if FROZEN:
            target = HealthTarget(
                name="Frontend (embedded)",
                url="http://localhost:8000/",
                timeout_sec=15,
                poll_interval=2.0,
            )
            self._log(f"確認前端靜態頁面可達 ({target.url})...")
            if self._poll_health(target):
                self._log("前端靜態頁面已就緒")
                self._worker.status_signal.emit("frontend", "running")
                return True
            else:
                self._log("前端頁面未就緒，繼續啟動")
                self._worker.status_signal.emit("frontend", "error")
                return True  # 不阻斷

        self._log(f"等待前端就緒 ({self.FRONTEND_TARGET.url})...")
        if self._poll_health(self.FRONTEND_TARGET):
            self._log("前端服務已就緒")
            self._worker.status_signal.emit("frontend", "running")
            return True
        else:
            # 前端超時不阻斷啟動，僅警告
            self._log(f"前端健康檢查逾時 ({self.FRONTEND_TARGET.timeout_sec}s)，繼續啟動")
            self._worker.status_signal.emit("frontend", "error")
            return True  # 不阻斷

    # ── Phase 8: 自動開啟瀏覽器 ──
    def _phase_browser_open(self) -> bool:
        url = "http://localhost:8000" if FROZEN else "http://localhost:5173"
        self._log(f"開啟瀏覽器: {url}")
        try:
            webbrowser.open(url)
            return True
        except Exception as e:
            self._log(f"瀏覽器開啟失敗: {e}（不影響系統運行）")
            return True  # 不阻斷

    # ── 通用 HTTP 輪詢 ──
    def _poll_health(self, target: HealthTarget) -> bool:
        """每 poll_interval 秒做一次 HTTP GET，直到成功或逾時。"""
        start = time.time()
        last_progress = 0
        while time.time() - start < target.timeout_sec:
            if self._cancelled:
                return False
            if self._http_check(target):
                elapsed = time.time() - start
                self._log(f"      ✓ {target.name} 就緒 ({elapsed:.1f}s)")
                return True

            # 每 15 秒輸出等待進度
            elapsed_int = int(time.time() - start)
            if elapsed_int >= 15 and elapsed_int % 15 == 0 and elapsed_int != last_progress:
                last_progress = elapsed_int
                self._log(f"      {target.name} 已等待 {elapsed_int}s / {target.timeout_sec}s...")

            time.sleep(target.poll_interval)
        return False

    # ── 單次 HTTP 檢查 ──
    def _http_check(self, target: HealthTarget) -> bool:
        """單次 HTTP GET，不拋例外。"""
        try:
            req = urllib.request.Request(target.url, method='GET')
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status != target.expect_status:
                    return False
                if target.expect_body_contains:
                    body = resp.read().decode('utf-8', errors='ignore')
                    return target.expect_body_contains in body
                return True
        except Exception:
            return False

    # ── 工具 ──
    def _log(self, msg: str):
        self._worker.log(msg)


class LauncherWorker(QThread):
    """啟動器工作執行緒（避免阻塞 UI）"""
    log_signal = Signal(str)  # 發送 Log 訊息
    status_signal = Signal(str, str)  # (service_name, status: "running"/"stopped"/"error")
    finished_signal = Signal(bool)  # 啟動完成（成功/失敗）

    def __init__(self, project_root, mode='start'):
        super().__init__()
        self.project_root = Path(project_root)
        self.frontend_root = self.project_root / "frontend"
        self.is_windows = platform.system() == 'Windows'
        self.processes = []
        self._is_running = True
        self.mode = mode  # 'start', 'stop', 'monitor'

    def log(self, message):
        """發送 Log 到 UI（自動限制長度）"""
        self.log_signal.emit(message)

    def check_port_status(self, port):
        """檢查端口是否有服務運行（即時檢查）"""
        try:
            with socket.create_connection(("localhost", port), timeout=1):
                return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False

    def wait_for_port(self, port, timeout=60, check_interval=1, process=None):
        """等待端口服務啟動（帶超時機制 + 進程存活檢查）"""
        self.log(f"等待服務在 localhost:{port} 啟動...")
        start_time = time.time()
        last_progress = 0

        while time.time() - start_time < timeout and self._is_running:
            # 檢查進程是否已死亡（提前退出，不浪費等待時間）
            if process and process.poll() is not None:
                elapsed = time.time() - start_time
                self.log(f"進程已退出 (exit code: {process.returncode})，耗時 {elapsed:.1f}s")
                # 嘗試讀取殘餘輸出
                try:
                    remaining = process.stdout.read()
                    if remaining and remaining.strip():
                        for line in remaining.strip().split('\n'):
                            if line.strip():
                                self.log(f"   {line.strip()}")
                except Exception:
                    pass
                return False

            if self.check_port_status(port):
                elapsed = time.time() - start_time
                self.log(f"服務已就緒 (localhost:{port}) - 耗時 {elapsed:.1f}s")
                return True

            # 每 10 秒輸出一次等待進度
            elapsed_int = int(time.time() - start_time)
            if elapsed_int > 0 and elapsed_int % 10 == 0 and elapsed_int != last_progress:
                last_progress = elapsed_int
                self.log(f"   已等待 {elapsed_int}s / {timeout}s...")

            time.sleep(check_interval)

        self.log(f"服務啟動超時 (localhost:{port})，已等待 {timeout}s")
        return False

    def wait_for_port_free(self, port, timeout=10):
        """等待端口完全釋放（stop → start 場景）"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            if not self.check_port_status(port):
                return True
            time.sleep(0.5)
        return False

    def kill_process_by_port(self, port):
        """強制結束佔用指定 Port 的進程"""
        try:
            self.log(f"正在清理佔用 Port {port} 的殘留進程...")
            
            if self.is_windows:
                # Windows: 使用 netstat 找出 LISTENING 狀態的 PID
                result = subprocess.run(
                    ['netstat', '-ano', '-p', 'TCP'],
                    capture_output=True,
                    text=True,
                    encoding='utf-8',
                    errors='ignore',
                    creationflags=_NO_WIN,
                )
                
                killed_pids = set()
                for line in result.stdout.split('\n'):
                    # 精確匹配 :port 後面跟空白（避免 :80 匹配到 :8000）
                    if f':{port} ' not in line and f':{port}\t' not in line:
                        continue
                    if 'LISTENING' not in line:
                        continue
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[-1].strip()
                        if not pid.isdigit() or pid == '0' or pid in killed_pids:
                            continue
                        killed_pids.add(pid)
                        try:
                            # 先嘗試優雅停止
                            subprocess.run(
                                ['taskkill', '/T', '/PID', pid],
                                capture_output=True, timeout=3,
                                creationflags=_NO_WIN,
                            )
                            # 等待一下看進程是否退出
                            time.sleep(1)
                            # 檢查進程是否還在
                            check = subprocess.run(
                                ['tasklist', '/FI', f'PID eq {pid}'],
                                capture_output=True, text=True, timeout=3,
                                creationflags=_NO_WIN,
                            )
                            if pid in check.stdout:
                                # 還在，強制終止
                                subprocess.run(
                                    ['taskkill', '/F', '/T', '/PID', pid],
                                    capture_output=True, timeout=5,
                                    creationflags=_NO_WIN,
                                )
                                self.log(f"已強制清理進程 PID {pid} (Port {port})")
                            else:
                                self.log(f"已清理進程 PID {pid} (Port {port})")
                        except Exception as e:
                            self.log(f"清理 PID {pid} 失敗: {e}")
                
                if not killed_pids:
                    self.log(f"   Port {port} 無活動進程")
            else:
                # Linux/Mac: 使用 lsof 或 fuser
                try:
                    result = subprocess.run(
                        ['lsof', '-t', f'-i:{port}'],
                        capture_output=True,
                        text=True
                    )
                    if result.stdout.strip():
                        pid = result.stdout.strip()
                        subprocess.run(['kill', '-9', pid], capture_output=True)
                        self.log(f"已清理進程 PID {pid} (Port {port})")
                except FileNotFoundError:
                    # lsof 不存在，使用 fuser
                    subprocess.run(['fuser', '-k', f'{port}/tcp'], capture_output=True)
                    
        except Exception as e:
            self.log(f"清理 Port {port} 時發生錯誤: {e}")

    def check_docker_status(self):
        """檢查 Docker 容器狀態（靜默模式，不輸出 Log）"""
        try:
            result = subprocess.run(
                ['docker', 'ps'],
                capture_output=True,
                text=True,
                timeout=5,
                encoding='utf-8',
                errors='ignore',
                creationflags=_NO_WIN,
            )
            
            # 檢查關鍵容器名稱
            if result.returncode == 0:
                output = result.stdout.lower()
                # 檢查是否有 ragflow 或 elasticsearch 容器
                if 'ragflow' in output or 'es01' in output or 'dify' in output:
                    return True
            return False
        except Exception:
            return False

    def check_docker_services(self):
        """檢查 Docker 服務（帶 Log 輸出）"""
        self.log("檢查 Docker 服務...")
        is_running = self.check_docker_status()
        
        if is_running:
            self.log("Docker 服務運行中")
            self.status_signal.emit("docker", "running")
        else:
            self.log("Docker 服務未啟動")
            self.status_signal.emit("docker", "stopped")
        
        return is_running

    def start_backend(self):
        """啟動 FastAPI 後端"""
        self.log("啟動 FastAPI 後端服務...")
        self.log("=" * 60)

        # === PyInstaller frozen 模式：使用 multiprocessing 子進程 ===
        if FROZEN:
            if self.check_port_status(8000):
                self.log("後端服務已在運行中 (Port 8000)，略過啟動")
                self.status_signal.emit("backend", "running")
                return "already_running"
            from bruv_main import start_server_process
            self._server_process = start_server_process(host="0.0.0.0", port=8000)
            self.log(f"後端服務已啟動 (embedded process, PID: {self._server_process.pid})")
            # 加入 placeholder 以保持 processes 列表一致性
            return self._server_process

        # === 以下為開發模式原有 subprocess 邏輯 ===
        
        # 檢查服務是否已在運行
        if self.check_port_status(8000):
            self.log("後端服務已在運行中 (Port 8000)，略過啟動")
            self.status_signal.emit("backend", "running")
            return "already_running"
        
        # 預防性清理：確保 Port 8000 是乾淨的
        self.kill_process_by_port(8000)
        
        # 等待端口完全釋放（Windows 有時需要較長時間）
        if not self.wait_for_port_free(8000, timeout=10):
            self.log("Port 8000 仍被佔用，嘗試二次強制清理...")
            self.kill_process_by_port(8000)
            time.sleep(2)
            if self.check_port_status(8000):
                self.log("Port 8000 無法釋放，請手動檢查佔用進程")
                self.status_signal.emit("backend", "error")
                return None

        try:
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'
            env['PYTHONUNBUFFERED'] = '1'  # 強制不緩衝，確保錯誤訊息即時顯示

            process = subprocess.Popen([
                sys.executable,
                '-m',
                'uvicorn',
                'app_anytype:app',
                '--host', '0.0.0.0',
                '--port', '8000',
                '--reload',
                '--reload-dir', 'backend',
                '--reload-include', 'app_anytype.py',
            ],
            cwd=self.project_root,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='ignore',
            creationflags=_NO_WIN,
            )

            self.processes.append(process)
            self.log(f"後端服務已啟動 (PID: {process.pid})")

            # 開啟一個子執行緒來讀取 Log
            import threading
            def read_stream(stream):
                try:
                    for line in iter(stream.readline, ''):
                        if line: self.log(line.strip())
                        if not self._is_running: break
                except (ValueError, OSError):
                    pass  # stream closed
                finally:
                    try:
                        stream.close()
                    except Exception:
                        pass

            threading.Thread(target=read_stream, args=(process.stdout,), daemon=True).start()

            # 短暫等待，讓 uvicorn 有時間輸出啟動錯誤訊息
            time.sleep(1)
            if process.poll() is not None:
                self.log(f"後端進程立即退出 (exit code: {process.returncode})")
                self.status_signal.emit("backend", "error")
                return None

            return process
        except Exception as e:
            self.log(f"後端啟動失敗: {e}")
            self.status_signal.emit("backend", "error")
            return None

    def start_frontend(self):
        """啟動 Vue 前端"""
        self.log("啟動前端開發伺服器...")
        self.log("=" * 60)
        
        # 檢查服務是否已在運行
        if self.check_port_status(5173):
            self.log("前端服務已在運行中 (Port 5173)，略過啟動")
            self.status_signal.emit("frontend", "running")
            return "already_running"
        
        # 預防性清理：確保 Port 5173 是乾淨的
        self.kill_process_by_port(5173)
        
        # 等待端口完全釋放
        if not self.wait_for_port_free(5173, timeout=10):
            self.log("Port 5173 仍被佔用，嘗試二次強制清理...")
            self.kill_process_by_port(5173)
            time.sleep(2)

        npm_cmd = 'npm.cmd' if self.is_windows else 'npm'

        try:
            process = subprocess.Popen(
                [npm_cmd, 'run', 'dev'],
                cwd=self.frontend_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                errors='ignore',
                creationflags=_NO_WIN,
            )

            self.processes.append(process)
            self.log(f"前端服務已啟動 (PID: {process.pid})")

            # 開啟一個子執行緒來讀取 Log
            import threading
            def read_stream(stream):
                try:
                    for line in iter(stream.readline, ''):
                        if line: self.log(line.strip())
                        if not self._is_running: break
                except (ValueError, OSError):
                    pass
                finally:
                    try:
                        stream.close()
                    except Exception:
                        pass

            threading.Thread(target=read_stream, args=(process.stdout,), daemon=True).start()

            return process
        except Exception as e:
            self.log(f"前端啟動失敗: {e}")
            self.status_signal.emit("frontend", "error")
            return None

    def run(self):
        """主執行流程（智能路由器）"""
        if self.mode == 'start':
            self.run_start_mode()
        elif self.mode == 'stop':
            self.stop()
        elif self.mode == 'monitor':
            self.run_monitor_mode()

    def run_start_mode(self):
        """啟動模式：透過 StartupStateMachine 管理啟動序列"""
        self.log("BruV Enterprise 啟動器")
        self.log("=" * 60)

        sm = StartupStateMachine(self)
        self._startup_sm = sm   # 保留引用，供 stop() 取消用
        success = sm.run()

        self.finished_signal.emit(success)

        if success:
            # 啟動完成後，切換到監控模式
            self.run_monitor_mode()

    def run_monitor_mode(self):
        """監控模式：持續監控系統狀態"""
        self.log("\n系統狀態監控已啟動...")
        
        last_status = {
            'docker': None, 'dify': None, 'ragflow': None,
            'ollama': None, 'minio': None, 'backend': None,
            'kuzu': None, 'frontend': None,
        }
        
        while self._is_running:
            # 檢查所有服務狀態
            docker_alive = self.check_docker_status()
            dify_alive = self.check_port_status(82)
            ragflow_alive = self.check_port_status(9380)
            ollama_alive = self.check_port_status(11434)
            minio_alive = self.check_port_status(9000)
            backend_alive = self.check_port_status(8000)
            frontend_alive = self.check_port_status(5173)

            # KuzuDB：解析 FastAPI /api/health 回應
            kuzu_alive = False
            if backend_alive:
                try:
                    req = urllib.request.Request(
                        'http://localhost:8000/api/health', method='GET'
                    )
                    with urllib.request.urlopen(req, timeout=3) as resp:
                        data = json.loads(resp.read().decode('utf-8', errors='ignore'))
                        kuzu_alive = data.get('services', {}).get('kuzu') == 'connected'
                except Exception:
                    pass

            current_status = {
                'docker': 'running' if docker_alive else 'stopped',
                'dify': 'running' if dify_alive else 'stopped',
                'ragflow': 'running' if ragflow_alive else 'stopped',
                'ollama': 'running' if ollama_alive else 'stopped',
                'minio': 'running' if minio_alive else 'stopped',
                'backend': 'running' if backend_alive else 'stopped',
                'kuzu': 'running' if kuzu_alive else 'stopped',
                'frontend': 'running' if frontend_alive else 'stopped',
            }
            
            # 只在狀態改變時發送信號和 Log
            for service, status in current_status.items():
                if status != last_status[service]:
                    self.status_signal.emit(service, status)
                    if status == 'stopped' and last_status[service] == 'running':
                        self.log(f"{service.upper()} 服務已停止")
            
            last_status = current_status
            
            # 每 3 秒檢查一次（8 個服務，避免過度輪詢）
            time.sleep(3)
            
        self.log("系統狀態監控已停止")

    def stop(self):
        """停止所有服務（強制清理模式）"""
        self._is_running = False

        # 取消進行中的啟動狀態機（避免 poll 繼續空轉）
        if hasattr(self, '_startup_sm') and self._startup_sm:
            self._startup_sm.cancel()

        # === PyInstaller frozen 模式：停止 multiprocessing 子進程 ===
        if FROZEN and hasattr(self, '_server_process') and self._server_process:
            self.log("停止內嵌後端服務進程...")
            self._server_process.terminate()
            self._server_process.join(timeout=5)
            if self._server_process.is_alive():
                self._server_process.kill()
            self._server_process = None
            self.log("內嵌後端服務已停止")

        self.log("正在停止所有服務...")
        self.log("=" * 60)

        # 第一步：無差別強制關閉端口（不管 self.processes 是否為空）
        self.log("\n正在執行強制清理...")
        self.kill_process_by_port(8000)  # 後端 API
        self.kill_process_by_port(5173)  # 前端 Vue

        # 第二步：停止已知的子進程（優雅停止 → 超時後強制）
        if self.processes:
            self.log("\n清理已知子進程...")
            for process in self.processes:
                try:
                    if process.poll() is None:
                        self.log(f"正在優雅停止進程 PID: {process.pid}")
                        if self.is_windows:
                            # 先嘗試不帶 /F 的 taskkill（送 WM_CLOSE）
                            subprocess.run(
                                ['taskkill', '/T', '/PID', str(process.pid)],
                                capture_output=True,
                                timeout=5,
                                creationflags=_NO_WIN,
                            )
                            try:
                                process.wait(timeout=5)
                                self.log(f"進程 {process.pid} 已優雅停止")
                            except subprocess.TimeoutExpired:
                                self.log(f"進程 {process.pid} 未回應，強制終止...")
                                subprocess.run(
                                    ['taskkill', '/F', '/T', '/PID', str(process.pid)],
                                    capture_output=True,
                                    timeout=5,
                                    creationflags=_NO_WIN,
                                )
                                self.log(f"進程 {process.pid} 已強制停止")
                        else:
                            process.terminate()
                            try:
                                process.wait(timeout=5)
                                self.log(f"進程 {process.pid} 已優雅停止")
                            except subprocess.TimeoutExpired:
                                process.kill()
                                self.log(f"進程 {process.pid} 已強制停止 (SIGKILL)")
                except Exception as e:
                    self.log(f"停止進程 {process.pid} 失敗: {e}")
        else:
            self.log("\n進程列表為空（可能啟動器已重開過）")
        
        # 第三步：清空進程列表
        self.processes.clear()
        
        self.log("=" * 60)
        self.log("所有服務已停止")
        self.log("=" * 60)
        
        self.finished_signal.emit(False)


class StatusIndicator(QWidget):
    """狀態指示燈組件 — Apple HIG 風格"""

    _COLORS = {
        "running":  "#30d158",   # System Green (dark)
        "stopped":  "#48484a",   # System Gray 3
        "error":    "#ff453a",   # System Red (dark)
        "starting": "#ff9f0a",   # System Orange (dark)
    }
    _STATUS_TEXT = {
        "running":  "Active",
        "stopped":  "—",
        "error":    "Error",
        "starting": "Starting…",
    }

    def __init__(self, label_text, parent=None):
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(10, 4, 10, 4)

        # 狀態圓點（小尺寸，Apple 風格）
        self.indicator = QLabel("●")
        self.indicator.setFont(QFont("SF Pro Display", 8))
        self.indicator.setFixedWidth(16)

        # 服務名稱
        self.label = QLabel(label_text)
        self.label.setFont(QFont("SF Pro Text", 11, QFont.Normal))

        # 狀態文字（右對齊）
        self.status_text = QLabel("")
        self.status_text.setFont(QFont("SF Pro Text", 10))
        self.status_text.setAlignment(Qt.AlignRight | Qt.AlignVCenter)

        layout.addWidget(self.indicator)
        layout.addWidget(self.label)
        layout.addStretch()
        layout.addWidget(self.status_text)

        self.set_status("stopped")

    def set_status(self, status):
        """設置狀態：running, stopped, error, starting"""
        color = self._COLORS.get(status, "#48484a")
        self.indicator.setStyleSheet(f"color: {color};")
        self.status_text.setStyleSheet(f"color: {color};")
        self.status_text.setText(self._STATUS_TEXT.get(status, ""))

    def update_label(self, text):
        """更新標籤文字"""
        self.label.setText(text)


class BruVLauncherGUI(QMainWindow):
    """主視窗"""
    def __init__(self):
        super().__init__()
        self.project_root = get_base_dir()
        self.worker = None
        self.process_workers = []  # 儲存所有 ProcessWorker
        self.drag_position = None
        self.is_system_running = False  # 系統運行狀態旗標
        self.current_language = "zh_TW"  # 預設語言
        self.is_dark_mode = True  # 預設深色模式
        self._detected_token = None  # 偵測到的 API Token
        
        # 定義主題色票 — Apple Design System (macOS Sonoma)
        self.themes = {
            "dark": {
                "bg_main": "#1c1c1e",           # System Background
                "bg_sidebar": "#2c2c2e",        # Secondary System Background
                "bg_console": "#1c1c1e",        # 日誌區
                "bg_card": "#3a3a3c",           # Tertiary System Background
                "bg_card_hover": "#48484a",     # System Gray 3
                "bg_card_pressed": "#2c2c2e",   # 按下
                "bg_card_secondary": "#2c2c2e", # Secondary
                "bg_titlebar": "#2c2c2e",       # 標題列
                "text_primary": "#f5f5f7",      # Apple White
                "text_secondary": "#a1a1a6",    # Secondary Label (Windows-tuned)
                "text_muted": "#8e8e93",        # Tertiary Label (Windows-tuned)
                "text_subtle": "#636366",       # Quaternary Label (Windows-tuned)
                "border_subtle": "#38383a",     # Separator
                "border_default": "rgba(255, 255, 255, 0.08)",  # 半透明
                "border_strong": "rgba(255, 255, 255, 0.15)",   # 較強
                "accent_blue": "#0a84ff",       # System Blue (dark)
                "accent_blue_hover": "#409cff", # Lighter on hover
                "accent_blue_pressed": "#0071e3",
                "accent_red": "#ff453a",        # System Red (dark)
                "accent_red_hover": "#ff6961",
                "accent_red_pressed": "#d70015",
                "console_text": "#a1a1a6",
                "disabled_bg": "#3a3a3c",
                "disabled_text": "#58585c"
            },
            "light": {
                "bg_main": "#f5f5f7",           # Apple Light Gray
                "bg_sidebar": "#ffffff",        # White
                "bg_console": "#f5f5f7",
                "bg_card": "#ffffff",
                "bg_card_hover": "#f0f0f0",
                "bg_card_pressed": "#e8e8ed",
                "bg_card_secondary": "#f5f5f7",
                "bg_titlebar": "#ececec",
                "text_primary": "#1d1d1f",      # Apple Black
                "text_secondary": "#6e6e73",    # Secondary Label
                "text_muted": "#86868b",        # Tertiary Label
                "text_subtle": "#aeaeb2",       # Quaternary
                "border_subtle": "#e8e8ed",
                "border_default": "rgba(0, 0, 0, 0.06)",
                "border_strong": "rgba(0, 0, 0, 0.12)",
                "accent_blue": "#007aff",       # System Blue (light)
                "accent_blue_hover": "#0071e3",
                "accent_blue_pressed": "#006edb",
                "accent_red": "#ff3b30",        # System Red (light)
                "accent_red_hover": "#d70015",
                "accent_red_pressed": "#c5000f",
                "console_text": "#1d1d1f",
                "disabled_bg": "#e8e8ed",
                "disabled_text": "#aeaeb2"
            }
        }
        
        self.setWindowTitle("BruV Enterprise Launcher v5.5")
        self.setFixedSize(1100, 750)
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

        # 內容區域（左面板 + 右面板）
        content_layout = QHBoxLayout()
        content_layout.setSpacing(0)

        # 左面板（QStackedWidget: 設定頁 / 主頁）
        left_panel = self.create_left_panel()
        left_panel.setFixedWidth(320)
        content_layout.addWidget(left_panel)

        # 右面板（品牌視覺區 + 可折疊日誌）
        right_panel = self.create_right_panel()
        content_layout.addWidget(right_panel, 1)

        main_layout.addLayout(content_layout)
        
        # 應用樣式
        self.apply_styles()
        
        # 初始化標籤顏色
        self.update_label_colors()

        # 判斷是否需要首次設定
        if self._check_api_keys_configured():
            self.left_stack.setCurrentIndex(1)   # 主操作頁
            self.welcome_guide.setVisible(False)
        else:
            self.left_stack.setCurrentIndex(0)   # 首次設定頁
            # 首次設定時收起日誌面板，減少干擾
            if self._log_expanded:
                self._toggle_log_panel()
    
    def t(self, key: str) -> str:
        """翻譯鍵值"""
        return LANGUAGES.get(self.current_language, LANGUAGES["zh_TW"]).get(key, key) or key
    
    def switch_language(self, lang_code):
        """切換語言"""
        if lang_code in LANGUAGES:
            self.current_language = lang_code
            self.refresh_ui_text()

    # ── Title-bar vector icons (QPainter, HiDPI-ready) ──────────
    def _make_titlebar_icon(self, icon_type, color="#a1a1a6", size=18):
        """Create a crisp, anti-aliased titlebar icon via QPainter.

        icon_type: "reload" | "theme_dark" | "theme_light"
        Returns QIcon rendered at 2× for HiDPI.
        """
        import math
        dpr = 2
        real = int(size * dpr)
        px = QPixmap(real, real)
        px.setDevicePixelRatio(dpr)
        px.fill(Qt.transparent)

        p = QPainter(px)
        p.setRenderHint(QPainter.Antialiasing, True)

        c = QColor(color)
        pen = QPen(c)
        pen.setWidthF(1.6)
        pen.setCapStyle(Qt.RoundCap)
        pen.setJoinStyle(Qt.RoundJoin)
        p.setPen(pen)

        m = 2.5
        cx = size / 2.0
        r = (size - 2 * m) / 2.0
        rect = QRectF(m, m, size - 2 * m, size - 2 * m)

        if icon_type == "reload":
            # ── Circular arrow: 280° arc + arrowhead ──
            p.setBrush(Qt.NoBrush)
            p.drawArc(rect, 50 * 16, 280 * 16)
            # Arrow tip at 50° on the arc
            a = math.radians(50)
            ax = cx + r * math.cos(a)
            ay = cx - r * math.sin(a)
            arrow = QPainterPath()
            arrow.moveTo(ax - 3.5, ay - 1.0)
            arrow.lineTo(ax, ay)
            arrow.lineTo(ax + 0.5, ay - 3.5)
            p.drawPath(arrow)

        elif icon_type == "theme_dark":
            # ── Left-half filled circle (◐) ──
            half = QPainterPath()
            half.moveTo(cx, m)
            half.arcTo(rect, 90, 180)
            half.closeSubpath()
            p.setBrush(c)
            p.drawPath(half)
            p.setBrush(Qt.NoBrush)
            p.drawEllipse(rect)

        elif icon_type == "theme_light":
            # ── Right-half filled circle (◑) ──
            half = QPainterPath()
            half.moveTo(cx, m)
            half.arcTo(rect, 90, -180)
            half.closeSubpath()
            p.setBrush(c)
            p.drawPath(half)
            p.setBrush(Qt.NoBrush)
            p.drawEllipse(rect)

        p.end()
        return QIcon(px)

    def _update_titlebar_icons(self):
        """Refresh reload / theme icons with the current theme color."""
        theme = self.themes["dark"] if self.is_dark_mode else self.themes["light"]
        color = theme["text_secondary"]
        icon_size = QSize(18, 18)

        self.reload_btn.setIcon(self._make_titlebar_icon("reload", color))
        self.reload_btn.setIconSize(icon_size)

        icon_type = "theme_dark" if self.is_dark_mode else "theme_light"
        self.theme_btn.setIcon(self._make_titlebar_icon(icon_type, color))
        self.theme_btn.setIconSize(icon_size)

    def create_title_bar(self):
        """創建自定義標題列"""
        title_bar = QFrame()
        title_bar.setObjectName("titleBar")
        title_bar.setFixedHeight(40)

        layout = QHBoxLayout(title_bar)
        layout.setContentsMargins(15, 0, 10, 0)

        # 標題
        self.title_label = QLabel(self.t("window_title"))
        self.title_label.setFont(QFont("SF Pro Display", 12, QFont.Bold))

        layout.addWidget(self.title_label)
        layout.addStretch()

        # 重新載入 Launcher 按鈕 (vector icon)
        self.reload_btn = QPushButton()
        self.reload_btn.setObjectName("themeBtn")
        self.reload_btn.setFixedSize(40, 30)
        self.reload_btn.setIcon(self._make_titlebar_icon("reload"))
        self.reload_btn.setIconSize(QSize(18, 18))
        self.reload_btn.clicked.connect(self.restart_self)
        self.reload_btn.setToolTip("重新載入 Launcher GUI")

        # 主題切換按鈕 (vector icon)
        self.theme_btn = QPushButton()
        self.theme_btn.setObjectName("themeBtn")
        self.theme_btn.setFixedSize(40, 30)
        self.theme_btn.setIcon(self._make_titlebar_icon("theme_dark"))
        self.theme_btn.setIconSize(QSize(18, 18))
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

        layout.addWidget(self.reload_btn)
        layout.addWidget(self.theme_btn)
        layout.addWidget(min_btn)
        layout.addWidget(close_btn)

        return title_bar

    # ──────────────────────────────────────
    # 左面板：Logo + 語言 + QStackedWidget + 版本
    # ──────────────────────────────────────
    def create_left_panel(self):
        """建立左面板（含設定頁 / 主操作頁 QStackedWidget）"""
        panel = QFrame()
        panel.setObjectName("leftPanel")

        layout = QVBoxLayout(panel)
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(8)

        # Logo
        self.logo_label = QLabel(self.t("logo"))
        self.logo_label.setAlignment(Qt.AlignCenter)
        self.logo_label.setFont(QFont("SF Pro Display", 20, QFont.Bold))
        layout.addWidget(self.logo_label)

        layout.addSpacing(5)

        # 語言選擇器
        lang_container = QWidget()
        lang_layout = QHBoxLayout(lang_container)
        lang_layout.setContentsMargins(0, 0, 0, 0)
        lang_layout.setSpacing(8)

        self.lang_label = QLabel(self.t("language"))
        self.lang_label.setFont(QFont("SF Pro Text", 11))
        lang_layout.addWidget(self.lang_label)

        self.lang_combo = QComboBox()
        self.lang_combo.addItem("中文", "zh_TW")
        self.lang_combo.addItem("English", "en_US")
        self.lang_combo.setCurrentIndex(0)
        self.lang_combo.currentIndexChanged.connect(self.on_language_changed)
        self.lang_combo.setFixedHeight(30)
        self.lang_combo.setMinimumWidth(100)
        self.lang_combo.setFont(QFont("SF Pro Text", 11))
        lang_layout.addWidget(self.lang_combo, 1)

        layout.addWidget(lang_container)
        layout.addSpacing(5)

        # QStackedWidget（page 0 = 設定頁, page 1 = 主頁）
        self.left_stack = QStackedWidget()
        self.left_stack.addWidget(self.create_setup_page())   # index 0
        self.left_stack.addWidget(self.create_main_page())    # index 1
        layout.addWidget(self.left_stack, 1)

        # 版本號
        self.version_label = QLabel(self.t("version"))
        self.version_label.setAlignment(Qt.AlignCenter)
        self.version_label.setFont(QFont("SF Pro Text", 10))
        layout.addWidget(self.version_label)

        return panel

    # ──────────────────────────────────────
    # Page 0: 首次設定頁
    # ──────────────────────────────────────
    def create_setup_page(self):
        """首次設定頁 — API Key 輸入表單"""
        page = QWidget()
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)

        content = QWidget()
        form = QVBoxLayout(content)
        form.setContentsMargins(5, 10, 5, 10)
        form.setSpacing(10)

        # 標題
        self.setup_title_label = QLabel(self.t("setup_title"))
        self.setup_title_label.setFont(QFont("SF Pro Display", 16, QFont.Bold))
        self.setup_title_label.setAlignment(Qt.AlignCenter)
        form.addWidget(self.setup_title_label)

        # 說明
        self.setup_subtitle_label = QLabel(self.t("setup_subtitle"))
        self.setup_subtitle_label.setFont(QFont("SF Pro Text", 12))
        self.setup_subtitle_label.setWordWrap(True)
        self.setup_subtitle_label.setAlignment(Qt.AlignCenter)
        form.addWidget(self.setup_subtitle_label)

        form.addSpacing(8)

        # ── Dify API Key (with required marker) ──
        self.setup_dify_label = QLabel(self.t("setup_dify_key"))
        self.setup_dify_label.setFont(QFont("SF Pro Text", 12))
        self.setup_dify_required = QLabel(" *")
        self.setup_dify_required.setFont(QFont("SF Pro Text", 12))
        dify_label_row = QHBoxLayout()
        dify_label_row.setSpacing(0)
        dify_label_row.addWidget(self.setup_dify_label)
        dify_label_row.addWidget(self.setup_dify_required)
        dify_label_row.addStretch()
        form.addLayout(dify_label_row)

        self.setup_dify_input = QLineEdit()
        self.setup_dify_input.setPlaceholderText("app-xxxxxxxxxxxxxxxx")
        self.setup_dify_input.setFixedHeight(36)
        self.setup_dify_input.setFont(QFont("SF Mono", 12))
        form.addWidget(self.setup_dify_input)

        self.setup_dify_help = QLabel(self.t("setup_dify_help"))
        self.setup_dify_help.setFont(QFont("SF Pro Text", 11))
        form.addWidget(self.setup_dify_help)

        form.addSpacing(6)

        # ── RAGFlow API Key (with required marker) ──
        self.setup_ragflow_label = QLabel(self.t("setup_ragflow_key"))
        self.setup_ragflow_label.setFont(QFont("SF Pro Text", 12))
        self.setup_ragflow_required = QLabel(" *")
        self.setup_ragflow_required.setFont(QFont("SF Pro Text", 12))
        ragflow_label_row = QHBoxLayout()
        ragflow_label_row.setSpacing(0)
        ragflow_label_row.addWidget(self.setup_ragflow_label)
        ragflow_label_row.addWidget(self.setup_ragflow_required)
        ragflow_label_row.addStretch()
        form.addLayout(ragflow_label_row)

        self.setup_ragflow_input = QLineEdit()
        self.setup_ragflow_input.setPlaceholderText("ragflow-xxxxxxxxxxxxxxxx")
        self.setup_ragflow_input.setFixedHeight(36)
        self.setup_ragflow_input.setFont(QFont("SF Mono", 12))
        form.addWidget(self.setup_ragflow_input)

        self.setup_ragflow_help = QLabel(self.t("setup_ragflow_help"))
        self.setup_ragflow_help.setFont(QFont("SF Pro Text", 11))
        form.addWidget(self.setup_ragflow_help)

        form.addSpacing(15)

        # 保存並啟動
        self.setup_start_btn = QPushButton(self.t("setup_save_and_start"))
        self.setup_start_btn.setObjectName("actionBtn")
        self.setup_start_btn.setProperty("state", "idle")
        self.setup_start_btn.setFixedHeight(50)
        self.setup_start_btn.setFont(QFont("SF Pro Display", 14, QFont.Bold))
        self.setup_start_btn.clicked.connect(self._on_setup_save_and_start)
        form.addWidget(self.setup_start_btn)

        # 跳過設定 — 明確的次要按鈕外觀
        self.skip_setup_btn = QPushButton(self.t("setup_skip"))
        self.skip_setup_btn.setObjectName("skipBtn")
        self.skip_setup_btn.setFixedHeight(40)
        self.skip_setup_btn.setFont(QFont("SF Pro Text", 13))
        self.skip_setup_btn.clicked.connect(self._skip_setup)
        form.addWidget(self.skip_setup_btn)

        form.addStretch()
        scroll.setWidget(content)

        page_layout = QVBoxLayout(page)
        page_layout.setContentsMargins(0, 0, 0, 0)
        page_layout.addWidget(scroll)
        return page

    # ──────────────────────────────────────
    # Page 1: 主操作頁（原 sidebar 內容）
    # ──────────────────────────────────────
    def create_main_page(self):
        """主操作頁 — 啟動按鈕、快捷連結、狀態指示燈"""
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)

        # 智慧切換按鈕
        self.action_btn = QPushButton(self.t("btn_start"))
        self.action_btn.setObjectName("actionBtn")
        self.action_btn.setProperty("state", "idle")
        self.action_btn.setFixedHeight(60)
        self.action_btn.setFont(QFont("SF Pro Display", 15, QFont.Bold))
        self.action_btn.clicked.connect(self.toggle_system)
        layout.addWidget(self.action_btn)

        layout.addSpacing(10)

        # 快速連結
        self.quick_links_label = QLabel(self.t("quick_links"))
        self.quick_links_label.setFont(QFont("SF Pro Text", 11))
        layout.addWidget(self.quick_links_label)

        self.bruv_btn = QPushButton(self.t("btn_open_bruv"))
        self.bruv_btn.setObjectName("primaryLinkBtn")
        self.bruv_btn.setFixedHeight(40)
        _bruv_url = "http://localhost:8000" if FROZEN else "http://localhost:5173"
        self.bruv_btn.clicked.connect(lambda: self.open_url(_bruv_url))
        layout.addWidget(self.bruv_btn)

        self.dify_btn = QPushButton(self.t("btn_open_dify"))
        self.dify_btn.setObjectName("linkBtn")
        self.dify_btn.setFixedHeight(36)
        self.dify_btn.clicked.connect(lambda: self.open_url("http://localhost:82"))
        layout.addWidget(self.dify_btn)

        self.ragflow_btn = QPushButton(self.t("btn_open_ragflow"))
        self.ragflow_btn.setObjectName("linkBtn")
        self.ragflow_btn.setFixedHeight(36)
        self.ragflow_btn.clicked.connect(lambda: self.open_url("http://localhost:81"))
        layout.addWidget(self.ragflow_btn)

        layout.addSpacing(8)

        # 狀態指示區
        self.status_title_label = QLabel(self.t("status_title"))
        self.status_title_label.setFont(QFont("SF Pro Text", 11))
        layout.addWidget(self.status_title_label)

        self.docker_status = StatusIndicator(self.t("status_docker"))
        self.dify_status = StatusIndicator(self.t("status_dify"))
        self.ragflow_status = StatusIndicator(self.t("status_ragflow"))
        self.ollama_status = StatusIndicator(self.t("status_ollama"))
        self.minio_status = StatusIndicator(self.t("status_minio"))
        self.backend_status = StatusIndicator(self.t("status_backend"))
        self.kuzu_status = StatusIndicator(self.t("status_kuzu"))
        self.frontend_status = StatusIndicator(self.t("status_frontend"))

        for ind in [self.docker_status, self.dify_status, self.ragflow_status,
                     self.ollama_status, self.minio_status, self.backend_status,
                     self.kuzu_status, self.frontend_status]:
            layout.addWidget(ind)

        layout.addSpacing(6)

        # 底部按鈕列
        btn_row = QHBoxLayout()
        btn_row.setSpacing(6)

        self.token_btn = QPushButton("API Token")
        self.token_btn.setObjectName("linkBtn")
        self.token_btn.setFixedHeight(32)
        self.token_btn.setFont(QFont("SF Pro Text", 11))
        self.token_btn.clicked.connect(self.show_token_dialog)
        btn_row.addWidget(self.token_btn)

        self.edit_api_btn = QPushButton(self.t("setup_btn_edit_api"))
        self.edit_api_btn.setObjectName("linkBtn")
        self.edit_api_btn.setFixedHeight(32)
        self.edit_api_btn.setFont(QFont("SF Pro Text", 11))
        self.edit_api_btn.clicked.connect(lambda: self.left_stack.setCurrentIndex(0))
        btn_row.addWidget(self.edit_api_btn)

        layout.addLayout(btn_row)
        layout.addStretch()

        return page

    # ──────────────────────────────────────
    # 右面板：品牌視覺區 + 可折疊日誌
    # ──────────────────────────────────────
    def create_right_panel(self):
        """右面板 — 品牌區 + 日誌面板"""
        panel = QFrame()
        panel.setObjectName("rightPanel")

        layout = QVBoxLayout(panel)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # ── 品牌視覺區 ──
        brand_area = QFrame()
        brand_area.setObjectName("brandArea")
        brand_layout = QVBoxLayout(brand_area)
        brand_layout.setContentsMargins(30, 40, 30, 20)

        brand_layout.addStretch()

        self.right_brand_title = QLabel(self.t("brand_title"))
        self.right_brand_title.setAlignment(Qt.AlignCenter)
        self.right_brand_title.setFont(QFont("SF Pro Display", 32, QFont.Bold))
        brand_layout.addWidget(self.right_brand_title)

        self.right_brand_subtitle = QLabel(self.t("brand_subtitle"))
        self.right_brand_subtitle.setAlignment(Qt.AlignCenter)
        self.right_brand_subtitle.setFont(QFont("SF Pro Text", 14))
        brand_layout.addWidget(self.right_brand_subtitle)

        brand_layout.addSpacing(20)

        self.right_status_label = QLabel("")
        self.right_status_label.setAlignment(Qt.AlignCenter)
        self.right_status_label.setFont(QFont("SF Pro Text", 12))
        brand_layout.addWidget(self.right_status_label)

        brand_layout.addSpacing(30)

        # ── 歡迎引導區 (首次設定時顯示) ──
        self.welcome_guide = QFrame()
        self.welcome_guide.setObjectName("welcomeGuide")
        guide_layout = QVBoxLayout(self.welcome_guide)
        guide_layout.setContentsMargins(40, 0, 40, 0)
        guide_layout.setSpacing(6)

        self.welcome_heading = QLabel(self.t("welcome_heading"))
        self.welcome_heading.setAlignment(Qt.AlignCenter)
        self.welcome_heading.setFont(QFont("SF Pro Display", 15, QFont.DemiBold))
        guide_layout.addWidget(self.welcome_heading)

        guide_layout.addSpacing(8)

        self.welcome_steps = []
        for i in range(1, 4):
            step = QLabel(self.t(f"welcome_step{i}"))
            step.setAlignment(Qt.AlignLeft)
            step.setFont(QFont("SF Pro Text", 13))
            step.setWordWrap(True)
            guide_layout.addWidget(step)
            self.welcome_steps.append(step)

        brand_layout.addWidget(self.welcome_guide)

        brand_layout.addStretch()

        layout.addWidget(brand_area, 1)

        # ── 可折疊日誌面板 ──
        log_panel = self._create_log_panel()
        layout.addWidget(log_panel)

        return panel

    def _create_log_panel(self):
        """建立可折疊日誌面板"""
        self.log_panel_frame = QFrame()
        self.log_panel_frame.setObjectName("logPanel")

        layout = QVBoxLayout(self.log_panel_frame)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 日誌標題列
        log_header = QFrame()
        log_header.setObjectName("logHeader")
        log_header.setFixedHeight(36)

        header_layout = QHBoxLayout(log_header)
        header_layout.setContentsMargins(15, 0, 10, 0)

        self.console_title_label = QLabel(self.t("console_title"))
        self.console_title_label.setFont(QFont("SF Pro Display", 11, QFont.Bold))
        header_layout.addWidget(self.console_title_label)

        header_layout.addStretch()

        self.clear_btn = QPushButton(self.t("btn_clear"))
        self.clear_btn.setObjectName("clearBtn")
        self.clear_btn.setFixedSize(70, 24)
        self.clear_btn.clicked.connect(self.clear_console)
        header_layout.addWidget(self.clear_btn)

        self.log_toggle_btn = QPushButton("▼")
        self.log_toggle_btn.setObjectName("logToggleBtn")
        self.log_toggle_btn.setFixedSize(30, 24)
        self.log_toggle_btn.clicked.connect(self._toggle_log_panel)
        header_layout.addWidget(self.log_toggle_btn)

        layout.addWidget(log_header)

        # 日誌內容
        self.console_text = QTextEdit()
        self.console_text.setObjectName("consoleText")
        self.console_text.setReadOnly(True)
        self.console_text.setFont(QFont("SF Mono", 11))
        self.console_text.setMinimumHeight(120)
        self.console_text.setMaximumHeight(280)
        layout.addWidget(self.console_text)

        self._log_expanded = True
        return self.log_panel_frame

    def _toggle_log_panel(self):
        """展開／收起日誌面板"""
        self._log_expanded = not self._log_expanded
        self.console_text.setVisible(self._log_expanded)
        self.log_toggle_btn.setText("▼" if self._log_expanded else "▲")

    # ──────────────────────────────────────
    # Phase 3: Setup ↔ Main 切換邏輯
    # ──────────────────────────────────────
    def _check_api_keys_configured(self) -> bool:
        """檢查 .env 是否已填入有效 API Key（非預設佔位符）"""
        env_path = self.project_root / ".env"
        if not env_path.exists():
            return False
        try:
            content = env_path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            return False
        placeholders = {'your_dify_api_key_here', 'your_ragflow_api_key_here', ''}
        for line in content.splitlines():
            if line.startswith("DIFY_API_KEY="):
                val = line.split("=", 1)[1].strip()
                if val not in placeholders:
                    return True
            elif line.startswith("RAGFLOW_API_KEY="):
                val = line.split("=", 1)[1].strip()
                if val not in placeholders:
                    return True
        return False

    def _on_setup_save_and_start(self):
        """保存 API Key 並切換到主頁 → 自動啟動"""
        dify_key = self.setup_dify_input.text().strip()
        ragflow_key = self.setup_ragflow_input.text().strip()

        if dify_key or ragflow_key:
            self._write_api_keys_to_env(dify_key, ragflow_key)

        # 切換到主操作頁
        self._switch_to_main_page()

        # 延遲啟動（讓 UI 先刷新）
        QTimer.singleShot(300, self.start_system)

    def _skip_setup(self):
        """跳過首次設定 → 切換到主操作頁"""
        self._switch_to_main_page()

    def _switch_to_main_page(self):
        """切換到主操作頁 + UI 狀態更新"""
        self.left_stack.setCurrentIndex(1)
        # 顯示日誌面板 + 收起歡迎引導
        self.welcome_guide.setVisible(False)
        if not self._log_expanded:
            self._toggle_log_panel()

    def _write_api_keys_to_env(self, dify_key: str, ragflow_key: str):
        """將 API Key 寫入 .env 檔案"""
        env_path = self.project_root / ".env"

        # 確保 .env 存在（從 .env.example 範本建立）
        if not env_path.exists():
            # 搜尋範本：project_root → _internal (PyInstaller)
            candidates = [
                self.project_root / ".env.example",
                Path(sys.executable).parent / "_internal" / ".env.example" if FROZEN else None,
                self.project_root / "_internal" / ".env.example",
            ]
            example_path = next((p for p in candidates if p and p.exists()), None)
            if example_path:
                shutil.copy2(example_path, env_path)
                self.append_log(f".env 已從範本建立: {example_path.name}")
            else:
                env_path.touch()

        content = env_path.read_text(encoding='utf-8', errors='ignore')
        lines = content.splitlines()

        updated_lines = []
        dify_set = ragflow_set = False

        for line in lines:
            if line.startswith("DIFY_API_KEY=") and dify_key:
                updated_lines.append(f"DIFY_API_KEY={dify_key}")
                dify_set = True
            elif line.startswith("RAGFLOW_API_KEY=") and ragflow_key:
                updated_lines.append(f"RAGFLOW_API_KEY={ragflow_key}")
                ragflow_set = True
            else:
                updated_lines.append(line)

        if dify_key and not dify_set:
            updated_lines.append(f"DIFY_API_KEY={dify_key}")
        if ragflow_key and not ragflow_set:
            updated_lines.append(f"RAGFLOW_API_KEY={ragflow_key}")

        env_path.write_text('\n'.join(updated_lines) + '\n', encoding='utf-8')
        self.append_log("API 金鑰已保存至 .env")

    def apply_styles(self):
        """應用 QSS 樣式 — Apple Human Interface Guidelines 風格"""
        theme = self.themes["dark"] if self.is_dark_mode else self.themes["light"]
        
        self.setStyleSheet(f"""
            /* ─── 主視窗 ─── */
            #mainWidget {{
                background: {theme['bg_main']};
                border: 1px solid {theme['border_default']};
                border-radius: 14px;
            }}
            
            /* ─── 標題列 (macOS 風格) ─── */
            #titleBar {{
                background: {theme['bg_titlebar']};
                border-top-left-radius: 14px;
                border-top-right-radius: 14px;
                border-bottom: 1px solid {theme['border_default']};
            }}
            
            #minBtn, #closeBtn, #themeBtn {{
                background: transparent;
                color: {theme['text_muted']};
                border: none;
                border-radius: 6px;
                font-size: 14px;
            }}
            
            #minBtn:hover, #themeBtn:hover {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
            }}
            
            #closeBtn:hover {{
                background: {theme['accent_red']};
                color: white;
                border-radius: 6px;
            }}
            
            /* ─── 左面板（Sidebar Material） ─── */
            #leftPanel {{
                background: {theme['bg_sidebar']};
                border-right: 1px solid {theme['border_default']};
            }}
            
            #leftPanel QLabel {{
                color: {theme['text_secondary']};
            }}
            
            /* ─── 操作按鈕 — 系統藍 Capsule 風格 ─── */
            #actionBtn[state="idle"] {{
                background: {theme['accent_blue']};
                color: white;
                border: none;
                border-radius: 12px;
                padding: 14px;
                font-weight: 600;
                font-size: 15px;
                letter-spacing: 0.3px;
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
                border-radius: 12px;
                padding: 14px;
                font-weight: 600;
                font-size: 15px;
            }}
            
            #actionBtn[state="running"] {{
                background: {theme['accent_red']};
                color: white;
                border: none;
                border-radius: 12px;
                padding: 14px;
                font-weight: 600;
                font-size: 15px;
            }}
            
            #actionBtn[state="running"]:hover {{
                background: {theme['accent_red_hover']};
            }}
            
            #actionBtn[state="running"]:pressed {{
                background: {theme['accent_red_pressed']};
            }}
            
            /* ─── 主要連結 — Grouped 圓角卡片 ─── */
            #primaryLinkBtn {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
                border: 1px solid {theme['border_default']};
                border-radius: 10px;
                padding: 11px 14px;
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
            
            /* ─── 次要連結 ─── */
            #linkBtn {{
                background: {theme['bg_card_secondary']};
                color: {theme['text_secondary']};
                border: 1px solid {theme['border_subtle']};
                border-radius: 10px;
                padding: 9px 14px;
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
            
            /* ─── 右面板 ─── */
            #rightPanel {{
                background: {theme['bg_main']};
            }}

            #brandArea {{
                background: {theme['bg_main']};
            }}

            /* ─── 日誌面板 ─── */
            #logPanel {{
                background: {theme['bg_sidebar']};
                border-top: 1px solid {theme['border_default']};
            }}

            #logHeader {{
                background: {theme['bg_sidebar']};
            }}

            #logToggleBtn {{
                background: transparent;
                color: {theme['text_muted']};
                border: 1px solid {theme['border_subtle']};
                border-radius: 6px;
                font-size: 11px;
            }}

            #logToggleBtn:hover {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
            }}
            
            #consoleText {{
                background: {theme['bg_main']};
                color: {theme['console_text']};
                border: none;
                padding: 8px;
            }}

            /* ─── Input (Rounded Apple 風格) ─── */
            QLineEdit {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
                border: 1px solid {theme['border_default']};
                border-radius: 8px;
                padding: 9px 14px;
                font-size: 13px;
            }}

            QLineEdit:focus {{
                border: 2px solid {theme['accent_blue']};
                padding: 8px 13px;
            }}

            QLineEdit::placeholder {{
                color: {theme['text_subtle']};
            }}

            /* ─── ScrollArea ─── */
            QScrollArea {{
                background: transparent;
                border: none;
            }}

            QScrollArea > QWidget > QWidget {{
                background: transparent;
            }}

            /* ─── Scrollbar (macOS 細型) ─── */
            QScrollBar:vertical {{
                background: transparent;
                width: 8px;
                margin: 4px 2px;
            }}

            QScrollBar::handle:vertical {{
                background: {theme['text_subtle']};
                min-height: 30px;
                border-radius: 4px;
            }}

            QScrollBar::handle:vertical:hover {{
                background: {theme['text_muted']};
            }}

            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0px;
            }}

            QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
                background: transparent;
            }}
            
            /* ─── ComboBox (Apple Popup 風格) ─── */
            QComboBox {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
                border: 1px solid {theme['border_default']};
                border-radius: 8px;
                padding: 5px 12px;
                font-size: 12px;
            }}
            
            QComboBox:hover {{
                background: {theme['bg_card_hover']};
                border-color: {theme['border_strong']};
            }}
            
            QComboBox::drop-down {{
                border: none;
                width: 22px;
            }}
            
            QComboBox::down-arrow {{
                image: none;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 5px solid {theme['text_muted']};
                margin-right: 6px;
            }}
            
            QComboBox QAbstractItemView {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
                border: 1px solid {theme['border_default']};
                border-radius: 8px;
                selection-background-color: {theme['accent_blue']};
                selection-color: white;
                padding: 4px;
                outline: none;
            }}
            
            /* ─── 工具按鈕 ─── */
            #clearBtn {{
                background: {theme['bg_card_secondary']};
                color: {theme['text_muted']};
                border: 1px solid {theme['border_subtle']};
                border-radius: 6px;
                font-size: 11px;
            }}
            
            #clearBtn:hover {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
            }}
            
            #clearBtn:pressed {{
                background: {theme['bg_card_pressed']};
            }}
            
            /* ─── 跳過設定按鈕 (次要但可見) ─── */
            #skipBtn {{
                background: {theme['bg_card']};
                color: {theme['text_primary']};
                border: 1px solid {theme['border_strong']};
                border-radius: 10px;
                font-size: 13px;
                font-weight: 500;
            }}
            
            #skipBtn:hover {{
                background: {theme['bg_card_hover']};
                border-color: {theme['text_muted']};
            }}
            
            #skipBtn:pressed {{
                background: {theme['bg_card_pressed']};
            }}

            /* ─── 歡迎引導區 ─── */
            #welcomeGuide {{
                background: transparent;
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
        
        # 更新按鈕狀態 (Starting) 並禁用按鈕
        self.set_button_state("starting")
        self.action_btn.setEnabled(False)  # 禁用按鈕防止重複點擊
        
        # 清空控制台
        self.console_text.clear()
        
        # 創建並啟動工作執行緒（啟動模式）
        self.worker = LauncherWorker(self.project_root, mode='start')
        self.worker.log_signal.connect(self.append_log)
        self.worker.status_signal.connect(self.update_status)
        self.worker.finished_signal.connect(self.on_launch_finished)
        self.worker.start()
    
    def stop_system(self):
        """停止系統"""
        # 更新按鈕狀態 (Stopping)
        self.set_button_state("stopping")
        
        self.append_log("\n" + "=" * 60)
        self.append_log(self.t("log_stopping_system"))
        self.append_log("=" * 60)
        
        # 保存舊 worker 的進程引用（確保 stop worker 能正確終止它們）
        old_processes = []
        if self.worker:
            old_processes = self.worker.processes.copy()
            if self.worker.isRunning():
                self.worker._is_running = False
                self.worker.wait(2000)  # 等待 2 秒
        
        # 創建新的 worker 執行停止操作，並傳遞舊進程引用
        self.worker = LauncherWorker(self.project_root, mode='stop')
        self.worker.processes = old_processes  # 傳遞進程引用以確保可靠終止
        self.worker.log_signal.connect(self.append_log)
        self.worker.status_signal.connect(self.update_status)
        self.worker.finished_signal.connect(self.on_stop_finished)
        self.worker.start()
    
    def on_stop_finished(self, success):
        """停止完成回調"""
        # 重置所有狀態燈
        for indicator in [
            self.docker_status, self.dify_status, self.ragflow_status,
            self.ollama_status, self.minio_status, self.backend_status,
            self.kuzu_status, self.frontend_status,
        ]:
            indicator.set_status("stopped")
        
        # 更新按鈕狀態
        self.set_button_state("stopped")
        
        self.append_log(self.t("log_all_stopped"))
        
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

    # 日誌語法高亮色碼 (Apple System Colors)
    _LOG_COLORS = {
        "success": "#30d158",  # System Green
        "error":   "#ff453a",  # System Red
        "warning": "#ff9f0a",  #  System Orange
        "phase":   "#0a84ff",  # System Blue
        "muted":   "#48484a",  # 時間戳/次要 (System Gray 3)
    }

    def _colorize_log(self, message: str) -> str:
        """根據日誌內容自動上色，回傳 HTML"""
        import html as _html
        safe = _html.escape(message)
        c = self._LOG_COLORS
        if any(k in message for k in ("已啟動", "已就緒", "健康", "成功", "running", "ready")):
            return f'<span style="color:{c["success"]}">{safe}</span>'
        if any(k in message for k in ("失敗", "異常", "錯誤", "逾時", "error", "failed")):
            return f'<span style="color:{c["error"]}">{safe}</span>'
        if any(k in message for k in ("警告", "未啟動", "未運行", "未偵測")):
            return f'<span style="color:{c["warning"]}">{safe}</span>'
        if any(k in message for k in ("階段", "Phase", "啟動", "偵測", "輪詢", "等待")):
            return f'<span style="color:{c["phase"]}">{safe}</span>'
        if message.startswith("   "):
            return f'<span style="color:{c["muted"]}">{safe}</span>'
        return safe

    def append_log(self, message):
        """添加 Log 到控制台（帶自動清理、自動滾動和語法高亮）"""
        # 限制日誌最大行數為 5000 行
        MAX_LOG_LINES = 5000
        current_text = self.console_text.toPlainText()
        lines = current_text.split('\n')

        if len(lines) > MAX_LOG_LINES:
            self.console_text.setPlainText('\n'.join(lines[-4000:]))
            self.console_text.append(f"\n[日誌已清理，保留最新 4000 行]\n")

        # 語法高亮
        colored = self._colorize_log(message)
        self.console_text.append(colored)

        # 偵測 API Token 並彈出對話框
        if '已自動生成 API Token' in message:
            self._token_next_line = True
        elif getattr(self, '_token_next_line', False) and message.strip() and not message.startswith('='):
            token = message.strip()
            self._token_next_line = False
            self._detected_token = token
            QTimer.singleShot(500, lambda: self._show_token_popup(token))

        # 自動滾動到底部
        cursor = self.console_text.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.End)
        self.console_text.setTextCursor(cursor)
        self.console_text.ensureCursorVisible()

    def closeEvent(self, event):
        """窗口關閉時清理所有進程"""
        self.append_log("\n正在關閉啟動器，清理所有進程...")
        
        # 停止 LaunchWorker
        if hasattr(self, 'worker') and self.worker:
            self.worker._is_running = False
            self.worker.quit()
            self.worker.wait(2000)
        
        # 停止所有 ProcessWorker
        if hasattr(self, 'process_workers'):
            for worker in self.process_workers:
                worker.stop()
                worker.quit()
                worker.wait(1000)
        
        # 終止所有子進程
        if hasattr(self, 'worker') and self.worker:
            for process in self.worker.processes:
                try:
                    if process and process.poll() is None:
                        self.append_log(f"終止進程 PID: {process.pid}")
                        process.terminate()
                        process.wait(timeout=3)
                except Exception as e:
                    self.append_log(f"終止進程失敗: {e}")
                    try:
                        process.kill()
                    except:
                        pass
        
        self.append_log("所有進程已清理完畢")
        event.accept()

    def update_status(self, service, status):
        """更新服務狀態"""
        indicator_map = {
            "docker": self.docker_status,
            "dify": self.dify_status,
            "ragflow": self.ragflow_status,
            "ollama": self.ollama_status,
            "minio": self.minio_status,
            "backend": self.backend_status,
            "kuzu": self.kuzu_status,
            "frontend": self.frontend_status,
        }
        indicator = indicator_map.get(service)
        if indicator:
            indicator.set_status(status)

    def on_launch_finished(self, success):
        """啟動完成回調"""
        self.action_btn.setEnabled(True)  # 重新啟用按鈕
        
        if success:
            self.is_system_running = True
            self.set_button_state("running")  # 切換到 Running 狀態 (紅色停止按鈕)
            self.right_status_label.setText("All systems operational")
        else:
            self.is_system_running = False
            self.set_button_state("idle")  # 失敗後回到 Idle 狀態
            self.action_btn.setText(self.t("btn_failed"))  # 顯示失敗訊息
            self.right_status_label.setText("Startup failed")
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
        
        # 左面板共用
        self.logo_label.setText(self.t("logo"))
        self.lang_label.setText(self.t("language"))
        
        # 主操作頁 — 按鈕（根據當前狀態）
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
        self.docker_status.update_label(self.t("status_docker"))
        self.dify_status.update_label(self.t("status_dify"))
        self.ragflow_status.update_label(self.t("status_ragflow"))
        self.ollama_status.update_label(self.t("status_ollama"))
        self.minio_status.update_label(self.t("status_minio"))
        self.backend_status.update_label(self.t("status_backend"))
        self.kuzu_status.update_label(self.t("status_kuzu"))
        self.frontend_status.update_label(self.t("status_frontend"))
        
        # 底部按鈕列
        self.edit_api_btn.setText(self.t("setup_btn_edit_api"))

        # 設定頁
        self.setup_title_label.setText(self.t("setup_title"))
        self.setup_subtitle_label.setText(self.t("setup_subtitle"))
        self.setup_dify_label.setText(self.t("setup_dify_key"))
        self.setup_ragflow_label.setText(self.t("setup_ragflow_key"))
        self.setup_dify_help.setText(self.t("setup_dify_help"))
        self.setup_ragflow_help.setText(self.t("setup_ragflow_help"))
        self.setup_start_btn.setText(self.t("setup_save_and_start"))
        self.skip_setup_btn.setText(self.t("setup_skip"))

        # 右面板 — 品牌區
        self.right_brand_title.setText(self.t("brand_title"))
        self.right_brand_subtitle.setText(self.t("brand_subtitle"))

        # 右面板 — 歡迎引導
        self.welcome_heading.setText(self.t("welcome_heading"))
        for i, step in enumerate(self.welcome_steps, 1):
            step.setText(self.t(f"welcome_step{i}"))

        # 日誌面板
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
        
        # 更新主題按鈕圖示 (vector icon)
        self._update_titlebar_icons()
        
        # 重新應用樣式
        self.apply_styles()
        
        # 更新標籤文字顏色
        self.update_label_colors()
        
        # 日誌記錄
        mode_text = "深色模式" if self.is_dark_mode else "淺色模式"
        self.append_log(f"已切換至{mode_text}")
    
    def update_label_colors(self):
        """更新所有標籤的文字顏色 — Apple HIG 風格"""
        theme = self.themes["dark"] if self.is_dark_mode else self.themes["light"]
        
        # 標題列
        self.title_label.setStyleSheet(f"color: {theme['text_muted']}; letter-spacing: 0.3px;")
        
        # Logo
        self.logo_label.setStyleSheet(f"color: {theme['text_primary']}; letter-spacing: 1.5px;")
        
        # 語言標籤
        self.lang_label.setStyleSheet(f"color: {theme['text_muted']};")
        
        # 快速連結
        self.quick_links_label.setStyleSheet(f"color: {theme['text_muted']}; margin-top: 6px; letter-spacing: 0.5px; font-size: 11px;")
        
        # 狀態標題
        self.status_title_label.setStyleSheet(f"color: {theme['text_muted']}; margin-top: 12px; letter-spacing: 0.5px; font-size: 11px;")
        
        # 版本號
        self.version_label.setStyleSheet(f"color: {theme['text_subtle']}; margin-bottom: 10px;")
        
        # 日誌標題
        self.console_title_label.setStyleSheet(f"color: {theme['text_muted']};")
        
        # 右面板品牌區
        self.right_brand_title.setStyleSheet(f"color: {theme['text_primary']}; letter-spacing: -0.5px;")
        self.right_brand_subtitle.setStyleSheet(f"color: {theme['text_muted']}; letter-spacing: 0.3px;")
        self.right_status_label.setStyleSheet(f"color: {theme['text_secondary']};")

        # 設定頁標籤
        self.setup_title_label.setStyleSheet(f"color: {theme['text_primary']}; letter-spacing: -0.3px;")
        self.setup_subtitle_label.setStyleSheet(f"color: {theme['text_muted']};")
        self.setup_dify_label.setStyleSheet(f"color: {theme['text_secondary']}; letter-spacing: 0.2px;")
        self.setup_ragflow_label.setStyleSheet(f"color: {theme['text_secondary']}; letter-spacing: 0.2px;")
        # 必填星號 — Apple System Red
        req_color = theme['accent_red']
        self.setup_dify_required.setStyleSheet(f"color: {req_color};")
        self.setup_ragflow_required.setStyleSheet(f"color: {req_color};")
        # 說明文字 — 提亮到 text_muted (原 text_subtle 過暗)
        self.setup_dify_help.setStyleSheet(f"color: {theme['text_muted']};")
        self.setup_ragflow_help.setStyleSheet(f"color: {theme['text_muted']};")
        self.edit_api_btn.setStyleSheet(f"color: {theme['text_secondary']}; font-size: 11px;")

        # 歡迎引導區
        self.welcome_heading.setStyleSheet(f"color: {theme['text_primary']}; letter-spacing: 0.2px;")
        for step in self.welcome_steps:
            step.setStyleSheet(f"color: {theme['text_secondary']}; line-height: 1.6; padding: 3px 0;")

        # 標題列向量圖示
        self._update_titlebar_icons()

    def clear_console(self):
        """清空控制台"""
        self.console_text.clear()

    def _show_token_popup(self, token):
        """彈出 API Token 管理對話框"""
        dialog = TokenManagerDialog(self.project_root, detected_token=token, parent=self)
        dialog.exec()

    def show_token_dialog(self):
        """手動開啟 API Token 管理"""
        dialog = TokenManagerDialog(self.project_root, detected_token=self._detected_token, parent=self)
        dialog.exec()

    def restart_self(self):
        """重新載入 Launcher GUI（Hot Reload）"""
        self.append_log("正在重新載入 Launcher...")
        # 注意：不停止後端/前端服務，僅重啟 GUI 本身
        try:
            # 停止監控 worker（但不停服務）
            if self.worker and self.worker.isRunning():
                self.worker._is_running = False
                self.worker.wait(1000)

            # 使用 os.execv 原地替換進程（保留 PID）
            import os
            self.append_log("Launcher 重啟中...")
            QApplication.instance().quit()
            os.execv(sys.executable, [sys.executable] + sys.argv)
        except Exception as e:
            self.append_log(f"重啟失敗: {e}")
            # Fallback: 用 subprocess 啟動新實例
            import subprocess as sp
            sp.Popen([sys.executable] + sys.argv, cwd=str(self.project_root))
            QApplication.instance().quit()

    def close_application(self):
        """關閉應用程式"""
        if self.worker and self.worker.isRunning():
            self.append_log("正在停止所有服務...")
            self.worker.stop()
            self.worker.wait(5000)
        self.close()


def main():
    """主程式入口"""
    try:
        app = QApplication(sys.argv)
        app.setStyle("Fusion")

        # Apple-style Fusion palette
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(28, 28, 30))       # #1c1c1e
        palette.setColor(QPalette.WindowText, QColor(245, 245, 247)) # #f5f5f7
        palette.setColor(QPalette.Base, QColor(44, 44, 46))          # #2c2c2e
        palette.setColor(QPalette.AlternateBase, QColor(58, 58, 60)) # #3a3a3c
        palette.setColor(QPalette.Text, QColor(245, 245, 247))       # #f5f5f7
        palette.setColor(QPalette.Button, QColor(58, 58, 60))        # #3a3a3c
        palette.setColor(QPalette.ButtonText, QColor(245, 245, 247)) # #f5f5f7
        palette.setColor(QPalette.Highlight, QColor(10, 132, 255))   # #0a84ff
        palette.setColor(QPalette.HighlightedText, QColor(255, 255, 255))
        app.setPalette(palette)

        launcher = BruVLauncherGUI()
        launcher.show()

        sys.exit(app.exec())
    
    except KeyboardInterrupt:
        print("\n程序被用戶中斷 (Ctrl+C)")
        sys.exit(0)
    except Exception as e:
        print(f"啟動器發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()