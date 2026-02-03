@echo off
REM BruV Enterprise GUI Launcher - Quick Start
REM ============================================

echo.
echo ========================================
echo   BruV Enterprise Launcher v3.0
echo ========================================
echo.

REM 切換到專案目錄
cd /d "%~dp0"

REM 檢查虛擬環境
if not exist "..\..\.venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Please create .venv first.
    pause
    exit /b 1
)

REM 啟動虛擬環境並運行 GUI
call "..\..\.venv\Scripts\activate.bat"

echo [INFO] Checking PySide6...
python -c "import PySide6" 2>nul
if errorlevel 1 (
    echo [WARN] PySide6 not found. Installing...
    pip install PySide6==6.6.1
)

echo.
echo [INFO] Starting BruV Enterprise Launcher...
echo.

python launcher_gui.py

pause
