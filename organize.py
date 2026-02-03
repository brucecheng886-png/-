"""
BruV Project - 專案結構重組自動化腳本
DevOps Team - Infrastructure Organization Tool

功能：
1. 自動建立目標資料夾 (docs/api, docs/deployment, etc.)
2. 移動檔案到指定目錄
3. 提供清晰的執行反饋
4. 防呆機制：檔案不存在則跳過

使用方式：
    python organize.py
"""

import os
import shutil
from pathlib import Path
from typing import Dict, List


class ProjectOrganizer:
    """專案結構重組器"""
    
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path).resolve()
        self.moved_count = 0
        self.skipped_count = 0
        
        # 檔案移動映射表
        self.file_mapping: Dict[str, List[str]] = {
            "docs/api": [
                "API_INTEGRATION.md",
                "SYSTEM_API_GUIDE.md"
            ],
            "docs/deployment": [
                "DEPLOYMENT_GUIDE.md",
                "DOCKER_SETUP.md",
                "UPGRADE_V2.md",
                "nginx.conf"
            ],
            "docs/launcher": [
                "README_GUI_LAUNCHER.md",
                "LAUNCHER_FEATURES.md",
                "LAUNCHER_QUICKSTART.md"
            ],
            "docs/design": [
                "ANYTYPE_THEME_GUIDE.md",
                "THEME_SWITCHER_GUIDE.md",
                "color_reference.py"
            ],
            "tests": [
                "SETTINGS_PAGE_TEST.md",
                "TEST_ERROR_HANDLING.md",
                "test_toggle_button.py",
                "test_language.py"
            ],
            "scripts": [
                "setup_windows.bat",
                "install_gui.ps1",
                "pack_project.py"
            ]
        }
        
        # 保護清單 (不可移動)
        self.protected_files = [
            "launcher_gui.py",
            "app_anytype.py",
            "docker-compose.yml",
            ".env",
            ".env.example",
            ".env.docker",
            "README.md",
            "requirements.txt",
            "package.json",
            "organize.py"  # 腳本自身
        ]
    
    def create_directories(self):
        """建立所有目標資料夾"""
        print("\n📁 建立目標資料夾...")
        print("=" * 60)
        
        for target_dir in self.file_mapping.keys():
            dir_path = self.base_path / target_dir
            
            if not dir_path.exists():
                dir_path.mkdir(parents=True, exist_ok=True)
                print(f"✅ 建立: {target_dir}/")
            else:
                print(f"ℹ️  已存在: {target_dir}/")
    
    def move_files(self):
        """移動檔案到目標資料夾"""
        print("\n📦 開始移動檔案...")
        print("=" * 60)
        
        for target_dir, files in self.file_mapping.items():
            print(f"\n📂 目標: {target_dir}/")
            print("-" * 60)
            
            for filename in files:
                self._move_single_file(filename, target_dir)
    
    def _move_single_file(self, filename: str, target_dir: str):
        """移動單一檔案"""
        source_path = self.base_path / filename
        target_path = self.base_path / target_dir / filename
        
        # 檢查是否為保護檔案
        if filename in self.protected_files:
            print(f"🔒 保護: {filename} (保留在根目錄)")
            return
        
        # 檢查來源檔案是否存在
        if not source_path.exists():
            print(f"⚠️  跳過: {filename} (檔案不存在)")
            self.skipped_count += 1
            return
        
        # 檢查目標是否已存在
        if target_path.exists():
            print(f"⚠️  跳過: {filename} (目標已存在)")
            self.skipped_count += 1
            return
        
        try:
            # 執行移動
            shutil.move(str(source_path), str(target_path))
            print(f"✅ 移動: {filename} -> {target_dir}/")
            self.moved_count += 1
        except Exception as e:
            print(f"❌ 錯誤: {filename} - {str(e)}")
            self.skipped_count += 1
    
    def print_summary(self):
        """列印執行摘要"""
        print("\n" + "=" * 60)
        print("📊 執行摘要")
        print("=" * 60)
        print(f"✅ 成功移動: {self.moved_count} 個檔案")
        print(f"⚠️  跳過檔案: {self.skipped_count} 個檔案")
        print("=" * 60)
        
        if self.moved_count > 0:
            print("\n🎉 專案結構重組完成！")
            print("\n📁 新的目錄結構：")
            print("""
BruV_Project/
├── docs/
│   ├── api/          (API 文檔)
│   ├── deployment/   (部署文檔)
│   ├── launcher/     (啟動器文檔)
│   └── design/       (設計文檔)
├── scripts/          (自動化腳本)
├── tests/            (測試檔案)
├── backend/          (後端程式碼)
├── frontend/         (前端程式碼)
└── [核心檔案保留在根目錄]
            """)
        else:
            print("\nℹ️  沒有檔案需要移動（可能已經整理過了）")
    
    def run(self):
        """執行完整的重組流程"""
        print("🚀 BruV Project - 專案結構重組工具")
        print("=" * 60)
        print(f"📍 工作目錄: {self.base_path}")
        
        # Step 1: 建立目錄
        self.create_directories()
        
        # Step 2: 移動檔案
        self.move_files()
        
        # Step 3: 顯示摘要
        self.print_summary()


def main():
    """主程式入口"""
    try:
        organizer = ProjectOrganizer()
        organizer.run()
    except KeyboardInterrupt:
        print("\n\n⚠️  使用者中斷執行")
    except Exception as e:
        print(f"\n❌ 執行錯誤: {str(e)}")
        raise


if __name__ == "__main__":
    main()
