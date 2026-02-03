"""
測試智慧切換按鈕的視覺效果
展示四種狀態的外觀變化
"""
from PySide6.QtWidgets import QApplication, QWidget, QVBoxLayout, QPushButton, QLabel
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
import sys

class ToggleButtonDemo(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("BruV AI - Toggle Button States Demo")
        self.setFixedSize(400, 600)
        self.setStyleSheet("background: #0f172a;")
        
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)
        
        # 標題
        title = QLabel("智慧切換按鈕 - 四種狀態")
        title.setFont(QFont("Arial", 14, QFont.Bold))
        title.setStyleSheet("color: #818cf8;")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)
        
        # 狀態 1: Idle (藍紫色)
        self.create_button_demo(layout, "idle", "🚀 START SYSTEM", "藍紫色漸層 - 閒置狀態")
        
        # 狀態 2: Starting (灰色)
        self.create_button_demo(layout, "starting", "⚙️ STARTING...", "灰色 - 啟動中")
        
        # 狀態 3: Running (紅色)
        self.create_button_demo(layout, "running", "🛑 STOP SYSTEM", "紅色漸層 - 運行中")
        
        # 狀態 4: Stopping (灰色)
        self.create_button_demo(layout, "stopping", "⏳ STOPPING...", "灰色 - 停止中")
        
        self.setLayout(layout)
        self.apply_styles()
    
    def create_button_demo(self, layout, state, text, description):
        """創建單個按鈕演示"""
        desc = QLabel(f"【{description}】")
        desc.setStyleSheet("color: #64748b; font-size: 11px;")
        desc.setAlignment(Qt.AlignCenter)
        layout.addWidget(desc)
        
        btn = QPushButton(text)
        btn.setObjectName("actionBtn")
        btn.setProperty("state", state)
        btn.setFixedHeight(60)
        btn.setFont(QFont("Arial", 14, QFont.Bold))
        
        # Starting 和 Stopping 狀態禁用
        if state in ["starting", "stopping"]:
            btn.setEnabled(False)
        
        layout.addWidget(btn)
    
    def apply_styles(self):
        """應用與主程式相同的 QSS 樣式"""
        qss = """
            #actionBtn[state="idle"] {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:0,
                    stop:0 #6366f1, stop:1 #8b5cf6
                );
                color: white;
                border: none;
                border-radius: 10px;
                padding: 15px;
                font-weight: bold;
                letter-spacing: 2px;
            }
            
            #actionBtn[state="idle"]:hover {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:0,
                    stop:0 #818cf8, stop:1 #a78bfa
                );
                box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
            }
            
            #actionBtn[state="starting"], #actionBtn[state="stopping"] {
                background: #334155;
                color: #64748b;
                border: none;
                border-radius: 10px;
                padding: 15px;
                font-weight: bold;
                letter-spacing: 2px;
            }
            
            #actionBtn[state="running"] {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:0,
                    stop:0 #ef4444, stop:1 #b91c1c
                );
                color: white;
                border: none;
                border-radius: 10px;
                padding: 15px;
                font-weight: bold;
                letter-spacing: 2px;
            }
            
            #actionBtn[state="running"]:hover {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:0,
                    stop:0 #f87171, stop:1 #dc2626
                );
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
            }
        """
        self.setStyleSheet(self.styleSheet() + qss)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    demo = ToggleButtonDemo()
    demo.show()
    sys.exit(app.exec())
