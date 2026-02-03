"""
測試多語言切換功能
展示中英文界面切換效果
"""
from PySide6.QtWidgets import QApplication, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QComboBox
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
import sys

# 語言字典（簡化版）
LANGUAGES = {
    "zh_TW": {
        "title": "🚀 BruV 企業級啟動器",
        "start": "🚀 啟動系統",
        "stop": "🛑 停止系統",
        "status": "⚙️ 系統狀態",
        "backend": "後端 API",
        "frontend": "前端介面",
        "language": "🌐 語言",
    },
    "en_US": {
        "title": "🚀 BruV Enterprise Launcher",
        "start": "🚀 START SYSTEM",
        "stop": "🛑 STOP SYSTEM",
        "status": "⚙️ SYSTEM STATUS",
        "backend": "Backend API",
        "frontend": "Frontend",
        "language": "🌐 Language",
    }
}

class LanguageDemo(QWidget):
    def __init__(self):
        super().__init__()
        self.current_language = "zh_TW"
        self.setWindowTitle("Multi-Language Demo")
        self.setFixedSize(450, 350)
        self.setStyleSheet("background: #0f172a;")
        
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(30, 30, 30, 30)
        main_layout.setSpacing(20)
        
        # 標題
        self.title_label = QLabel(self.t("title"))
        self.title_label.setFont(QFont("Arial", 16, QFont.Bold))
        self.title_label.setStyleSheet("color: #818cf8;")
        self.title_label.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(self.title_label)
        
        # 語言選擇器
        lang_container = QWidget()
        lang_layout = QHBoxLayout(lang_container)
        lang_layout.setContentsMargins(0, 0, 0, 0)
        
        self.lang_label = QLabel(self.t("language"))
        self.lang_label.setFont(QFont("Consolas", 10))
        self.lang_label.setStyleSheet("color: #8be9fd;")
        lang_layout.addWidget(self.lang_label)
        
        self.lang_combo = QComboBox()
        self.lang_combo.addItem("中文", "zh_TW")
        self.lang_combo.addItem("English", "en_US")
        self.lang_combo.setCurrentIndex(0)
        self.lang_combo.currentIndexChanged.connect(self.on_language_changed)
        self.lang_combo.setFixedHeight(35)
        self.lang_combo.setStyleSheet("""
            QComboBox {
                background: rgba(99, 102, 241, 0.1);
                color: #e2e8f0;
                border: 2px solid rgba(99, 102, 241, 0.3);
                border-radius: 5px;
                padding: 5px 10px;
                font-size: 11px;
            }
            QComboBox:hover {
                border-color: rgba(99, 102, 241, 0.6);
                background: rgba(99, 102, 241, 0.15);
            }
            QComboBox::drop-down {
                border: none;
                width: 20px;
            }
            QComboBox QAbstractItemView {
                background: #1e293b;
                color: #e2e8f0;
                border: 2px solid rgba(99, 102, 241, 0.5);
                selection-background-color: rgba(99, 102, 241, 0.3);
                selection-color: white;
                padding: 5px;
            }
        """)
        lang_layout.addWidget(self.lang_combo)
        
        main_layout.addWidget(lang_container)
        main_layout.addSpacing(10)
        
        # 按鈕組
        self.start_btn = QPushButton(self.t("start"))
        self.start_btn.setFixedHeight(50)
        self.start_btn.setFont(QFont("Arial", 13, QFont.Bold))
        self.start_btn.setStyleSheet("""
            background: qlineargradient(
                x1:0, y1:0, x2:1, y2:0,
                stop:0 #6366f1, stop:1 #8b5cf6
            );
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px;
        """)
        main_layout.addWidget(self.start_btn)
        
        self.stop_btn = QPushButton(self.t("stop"))
        self.stop_btn.setFixedHeight(50)
        self.stop_btn.setFont(QFont("Arial", 13, QFont.Bold))
        self.stop_btn.setStyleSheet("""
            background: qlineargradient(
                x1:0, y1:0, x2:1, y2:0,
                stop:0 #ef4444, stop:1 #b91c1c
            );
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px;
        """)
        main_layout.addWidget(self.stop_btn)
        
        main_layout.addSpacing(10)
        
        # 狀態區
        self.status_label = QLabel(self.t("status"))
        self.status_label.setFont(QFont("Consolas", 10))
        self.status_label.setStyleSheet("color: #8be9fd;")
        main_layout.addWidget(self.status_label)
        
        self.backend_label = QLabel(f"● {self.t('backend')}")
        self.backend_label.setFont(QFont("Consolas", 9))
        self.backend_label.setStyleSheet("color: #94a3b8;")
        main_layout.addWidget(self.backend_label)
        
        self.frontend_label = QLabel(f"● {self.t('frontend')}")
        self.frontend_label.setFont(QFont("Consolas", 9))
        self.frontend_label.setStyleSheet("color: #94a3b8;")
        main_layout.addWidget(self.frontend_label)
        
        main_layout.addStretch()
        
        self.setLayout(main_layout)
    
    def t(self, key):
        """翻譯方法"""
        return LANGUAGES.get(self.current_language, LANGUAGES["zh_TW"]).get(key, key)
    
    def on_language_changed(self, index):
        """語言切換事件"""
        lang_code = self.lang_combo.itemData(index)
        self.current_language = lang_code
        self.refresh_ui()
    
    def refresh_ui(self):
        """刷新所有文本"""
        self.title_label.setText(self.t("title"))
        self.lang_label.setText(self.t("language"))
        self.start_btn.setText(self.t("start"))
        self.stop_btn.setText(self.t("stop"))
        self.status_label.setText(self.t("status"))
        self.backend_label.setText(f"● {self.t('backend')}")
        self.frontend_label.setText(f"● {self.t('frontend')}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    demo = LanguageDemo()
    demo.show()
    sys.exit(app.exec())
