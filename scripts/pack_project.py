#!/usr/bin/env python3
"""
BruV Project 打包腳本
用於將項目打包成 BruV_Installer.zip，方便轉移到新電腦
"""

import os
import zipfile
import shutil
from pathlib import Path
from datetime import datetime

# 要排除的文件和資料夾
EXCLUDE_PATTERNS = [
    '.venv',
    'venv',
    '__pycache__',
    '.git',
    '.gitignore',
    'node_modules',
    '*.pyc',
    '*.pyo',
    '*.pyd',
    '.Python',
    'pip-log.txt',
    'pip-delete-this-directory.txt',
    '.pytest_cache',
    '.coverage',
    'htmlcov',
    'dist',
    'build',
    '*.egg-info',
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    '*.sqlite',
    '*.db',
]

# 要包含的重要文件（即使在排除列表中）
FORCE_INCLUDE = [
    'requirements.txt',
    'setup_windows.bat',
    '.env.example',
    'docker-compose.yml',
    'README.md',
]


def should_exclude(path: Path, root: Path) -> bool:
    """
    判斷文件或資料夾是否應該被排除
    
    Args:
        path: 當前檢查的路徑
        root: 項目根目錄
    
    Returns:
        True 如果應該排除，False 如果應該包含
    """
    # 相對路徑
    try:
        rel_path = path.relative_to(root)
    except ValueError:
        return True
    
    rel_path_str = str(rel_path)
    
    # 檢查是否在強制包含列表中
    for force_pattern in FORCE_INCLUDE:
        if path.name == force_pattern or rel_path_str == force_pattern:
            return False
    
    # 檢查是否匹配排除模式
    for pattern in EXCLUDE_PATTERNS:
        # 完整路徑匹配
        if pattern in rel_path_str:
            return True
        
        # 文件名匹配
        if pattern.startswith('*'):
            if path.name.endswith(pattern[1:]):
                return True
        elif path.name == pattern:
            return True
    
    return False


def get_project_size(root: Path) -> tuple[int, int]:
    """
    計算項目大小（包含和排除後）
    
    Returns:
        (total_size, filtered_size) in bytes
    """
    total_size = 0
    filtered_size = 0
    
    for dirpath, dirnames, filenames in os.walk(root):
        current_dir = Path(dirpath)
        
        # 修改 dirnames in-place 來跳過排除的目錄
        dirnames[:] = [d for d in dirnames if not should_exclude(current_dir / d, root)]
        
        for filename in filenames:
            filepath = current_dir / filename
            try:
                file_size = filepath.stat().st_size
                total_size += file_size
                
                if not should_exclude(filepath, root):
                    filtered_size += file_size
            except (OSError, PermissionError):
                pass
    
    return total_size, filtered_size


def format_size(size_bytes: int) -> str:
    """
    格式化文件大小為人類可讀格式
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"


def pack_project(source_dir: Path, output_file: Path) -> None:
    """
    打包項目為 ZIP 文件
    
    Args:
        source_dir: 項目根目錄
        output_file: 輸出的 ZIP 文件路徑
    """
    print("=" * 60)
    print("🚀 BruV Project 打包工具")
    print("=" * 60)
    print(f"📂 源目錄: {source_dir}")
    print(f"📦 輸出文件: {output_file}")
    print()
    
    # 計算項目大小
    print("📊 分析項目大小...")
    total_size, filtered_size = get_project_size(source_dir)
    print(f"   原始大小: {format_size(total_size)}")
    print(f"   過濾後大小: {format_size(filtered_size)}")
    print(f"   節省空間: {format_size(total_size - filtered_size)}")
    print()
    
    # 確認是否繼續
    print("⚠️  將排除以下內容:")
    for pattern in EXCLUDE_PATTERNS[:10]:  # 顯示前 10 個
        print(f"   - {pattern}")
    if len(EXCLUDE_PATTERNS) > 10:
        print(f"   ... 和其他 {len(EXCLUDE_PATTERNS) - 10} 個模式")
    print()
    
    response = input("是否繼續打包? (y/N): ").strip().lower()
    if response != 'y':
        print("❌ 取消打包")
        return
    
    print()
    print("📦 開始打包...")
    
    # 創建 ZIP 文件
    file_count = 0
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for dirpath, dirnames, filenames in os.walk(source_dir):
            current_dir = Path(dirpath)
            
            # 修改 dirnames in-place 來跳過排除的目錄
            dirnames[:] = [d for d in dirnames if not should_exclude(current_dir / d, source_dir)]
            
            for filename in filenames:
                filepath = current_dir / filename
                
                # 檢查是否應該排除
                if should_exclude(filepath, source_dir):
                    continue
                
                # 計算相對路徑
                try:
                    arcname = filepath.relative_to(source_dir)
                    zipf.write(filepath, arcname)
                    file_count += 1
                    
                    # 每 50 個文件顯示進度
                    if file_count % 50 == 0:
                        print(f"   已添加 {file_count} 個文件...")
                
                except (ValueError, OSError, PermissionError) as e:
                    print(f"   ⚠️  跳過文件: {filepath} ({e})")
    
    # 獲取最終 ZIP 文件大小
    zip_size = output_file.stat().st_size
    
    print()
    print("=" * 60)
    print("✅ 打包完成！")
    print("=" * 60)
    print(f"📦 輸出文件: {output_file}")
    print(f"📊 文件數量: {file_count}")
    print(f"💾 ZIP 大小: {format_size(zip_size)}")
    print(f"📈 壓縮率: {(1 - zip_size / filtered_size) * 100:.1f}%")
    print()
    print("📝 下一步:")
    print("   1. 將 BruV_Installer.zip 複製到新電腦")
    print("   2. 解壓縮到任意目錄")
    print("   3. 以管理員身份執行 setup_windows.bat")
    print("   4. 等待安裝完成")
    print("   5. 執行 python launcher.py 啟動服務")
    print("=" * 60)


def main():
    """主函數"""
    # 項目根目錄（當前腳本所在目錄）
    project_root = Path(__file__).parent
    
    # 輸出文件名（帶時間戳）
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"BruV_Installer_{timestamp}.zip"
    output_path = project_root / output_filename
    
    try:
        pack_project(project_root, output_path)
    except KeyboardInterrupt:
        print("\n\n❌ 用戶取消操作")
    except Exception as e:
        print(f"\n\n❌ 打包失敗: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
