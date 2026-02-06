@echo off
chcp 65001 >nul
REM =============================================
REM BruV Enterprise - 一鍵啟動腳本
REM =============================================

title BruV Enterprise - Quick Start

echo.
echo ╔═══════════════════════════════════════════╗
echo ║    BruV Enterprise - 一鍵啟動系統        ║
echo ║    企業級 AI 知識圖譜平台                 ║
echo ╚═══════════════════════════════════════════╝
echo.

REM 切換到腳本所在目錄
cd /d "%~dp0"

REM 檢查虛擬環境
echo [1/4] 檢查 Python 環境...
set VENV_PATH=%~dp0..\..\..\.venv\Scripts\python.exe
if not exist "%VENV_PATH%" (
    echo ❌ 找不到虛擬環境，請先安裝：
    echo    python -m venv .venv
    echo    .venv\Scripts\activate
    echo    pip install -r requirements.txt
    pause
    exit /b 1
)
echo ✅ Python 環境正常

REM 檢查 Docker
echo.
echo [2/4] 檢查 Docker 服務...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未檢測到 Docker，部分功能可能無法使用
    echo    如需使用 Dify 和 RAGFlow，請安裝 Docker Desktop
    timeout /t 3 >nul
) else (
    echo ✅ Docker 已安裝
    
    REM 檢查 Docker 服務是否運行
    docker ps >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Docker 未運行，正在嘗試啟動...
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        echo    等待 Docker 啟動...（這可能需要 30 秒）
        timeout /t 30 >nul
    ) else (
        echo ✅ Docker 服務正常
    )
)

REM 啟動選項
echo.
echo [3/4] 選擇啟動方式：
echo.
echo   [1] 啟動 GUI 啟動器（推薦 ⭐）
echo   [2] 快速啟動後端 + 前端
echo   [3] 僅啟動後端服務
echo   [4] 啟動完整系統（含 Docker）
echo   [Q] 取消
echo.
choice /C 1234Q /N /M "請選擇 [1-4, Q]: "
set CHOICE_RESULT=%ERRORLEVEL%

if %CHOICE_RESULT%==5 (
    echo 已取消啟動
    exit /b 0
)

if %CHOICE_RESULT%==1 goto GUI_LAUNCHER
if %CHOICE_RESULT%==2 goto QUICK_START
if %CHOICE_RESULT%==3 goto BACKEND_ONLY
if %CHOICE_RESULT%==4 goto FULL_SYSTEM

:GUI_LAUNCHER
echo.
echo [4/4] 啟動 GUI 啟動器...
echo.
call start_gui_launcher.bat
goto END

:QUICK_START
echo.
echo [4/4] 快速啟動中...
echo.

REM 啟動後端
echo 🚀 啟動後端服務...
start "BruV Backend" cmd /k "cd /d %~dp0 && call %~dp0..\..\..\.venv\Scripts\activate && python -m uvicorn app_anytype:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 >nul

REM 啟動前端
echo 🚀 啟動前端服務...
cd frontend
start "BruV Frontend" cmd /k "npm run dev"
cd ..

REM 等待服務啟動
echo.
echo ⏳ 等待服務啟動...
timeout /t 8 >nul

REM 打開瀏覽器
echo 🌐 打開瀏覽器...
start http://localhost:5173
start http://localhost:8000/docs

echo.
echo ✅ 啟動完成！
echo.
echo 📌 訪問地址：
echo    前端: http://localhost:5173
echo    後端 API: http://localhost:8000
echo    API 文檔: http://localhost:8000/docs
echo.
goto END

:BACKEND_ONLY
echo.
echo [4/4] 啟動後端服務...
echo.
start "BruV Backend" cmd /k "cd /d %~dp0 && call %~dp0..\..\..\.venv\Scripts\activate && python -m uvicorn app_anytype:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 5 >nul
start http://localhost:8000/docs
echo ✅ 後端已啟動: http://localhost:8000
goto END

:FULL_SYSTEM
echo.
echo [4/4] 啟動完整系統...
echo.

REM 啟動 Docker 服務
echo 🐳 啟動 Docker 容器...
docker-compose up -d
timeout /t 5 >nul

REM 啟動後端
echo 🚀 啟動後端服務...
start "BruV Backend" cmd /k "cd /d %~dp0 && call %~dp0..\..\..\.venv\Scripts\activate && python -m uvicorn app_anytype:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 >nul

REM 啟動前端
echo 🚀 啟動前端服務...
cd frontend
start "BruV Frontend" cmd /k "npm run dev"
cd ..

REM 等待服務啟動
echo.
echo ⏳ 等待所有服務啟動...（約 30 秒）
timeout /t 30 >nul

REM 打開瀏覽器
echo 🌐 打開瀏覽器...
start http://localhost:5173
start http://localhost:8000/docs
start http://localhost:3000
start http://localhost:9380

echo.
echo ✅ 完整系統已啟動！
echo.
echo 📌 訪問地址：
echo    BruV 前端: http://localhost:5173
echo    後端 API: http://localhost:8000/docs
echo    Dify: http://localhost:3000
echo    RAGFlow: http://localhost:9380
echo.

:END
echo.
echo 按任意鍵退出...
pause >nul
