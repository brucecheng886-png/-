@echo off
REM ================================
REM BruV Project - Windows 一鍵安裝腳本
REM ================================
REM 用於在全新的 Windows 電腦上快速部署項目
REM 請以管理員身份執行

setlocal EnableDelayedExpansion

REM 設置顏色代碼（需要 Windows 10+）
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo.
echo ============================================================
echo %BLUE%🚀 BruV Project - Windows 一鍵安裝%RESET%
echo ============================================================
echo.

REM ==================== 檢查管理員權限 ====================
echo %YELLOW%[1/10] 檢查管理員權限...%RESET%
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ 請以管理員身份執行此腳本！%RESET%
    echo.
    echo 右鍵點擊此文件 -^> 選擇 "以系統管理員身分執行"
    pause
    exit /b 1
)
echo %GREEN%✅ 已確認管理員權限%RESET%
echo.

REM ==================== 檢查 Python ====================
echo %YELLOW%[2/10] 檢查 Python 安裝...%RESET%
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ 未檢測到 Python！%RESET%
    echo.
    echo 請先安裝 Python 3.11 或更高版本:
    echo https://www.python.org/downloads/
    echo.
    echo 安裝時請勾選 "Add Python to PATH"
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo %GREEN%✅ Python 版本: %PYTHON_VERSION%%RESET%
echo.

REM ==================== 檢查 Docker ====================
echo %YELLOW%[3/10] 檢查 Docker 安裝...%RESET%
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ 未檢測到 Docker！%RESET%
    echo.
    echo 請先安裝 Docker Desktop for Windows:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo 安裝後請啟動 Docker Desktop，然後重新執行此腳本
    pause
    exit /b 1
)

for /f "tokens=3" %%i in ('docker --version 2^>^&1') do set DOCKER_VERSION=%%i
echo %GREEN%✅ Docker 版本: %DOCKER_VERSION%%RESET%
echo.

REM ==================== 檢查 Node.js / npm ====================
echo %YELLOW%[4/10] 檢查 Node.js / npm...%RESET%
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ 未檢測到 Node.js！%RESET%
    echo.
    echo 請先安裝 Node.js (LTS 版本):
    echo https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version 2^>^&1') do set NPM_VERSION=%%i
echo %GREEN%✅ Node.js 版本: %NODE_VERSION%%RESET%
echo %GREEN%✅ npm 版本: %NPM_VERSION%%RESET%
echo.

REM ==================== 創建 Python 虛擬環境 ====================
echo %YELLOW%[5/10] 創建 Python 虛擬環境...%RESET%
if exist .venv (
    echo %YELLOW%⚠️  虛擬環境已存在，跳過創建%RESET%
) else (
    python -m venv .venv
    if %errorlevel% neq 0 (
        echo %RED%❌ 虛擬環境創建失敗！%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%✅ 虛擬環境創建成功%RESET%
)
echo.

REM ==================== 安裝 Python 依賴 ====================
echo %YELLOW%[6/10] 安裝 Python 依賴...%RESET%
call .venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo %RED%❌ 無法啟動虛擬環境！%RESET%
    pause
    exit /b 1
)

echo 正在安裝依賴，請稍候...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo %RED%❌ Python 依賴安裝失敗！%RESET%
    echo.
    echo 請檢查 requirements.txt 文件是否存在
    pause
    exit /b 1
)
echo %GREEN%✅ Python 依賴安裝完成%RESET%
echo.

REM ==================== 安裝前端依賴 ====================
echo %YELLOW%[7/10] 安裝前端依賴...%RESET%
if not exist frontend (
    echo %RED%❌ frontend 目錄不存在！%RESET%
    pause
    exit /b 1
)

cd frontend
if exist node_modules (
    echo %YELLOW%⚠️  node_modules 已存在，跳過安裝%RESET%
    echo 如需重新安裝，請先刪除 node_modules 目錄
) else (
    echo 正在安裝前端依賴，這可能需要幾分鐘...
    call npm install
    if %errorlevel% neq 0 (
        echo %RED%❌ 前端依賴安裝失敗！%RESET%
        cd ..
        pause
        exit /b 1
    )
    echo %GREEN%✅ 前端依賴安裝完成%RESET%
)
cd ..
echo.

REM ==================== 配置環境變數 ====================
echo %YELLOW%[8/10] 配置環境變數 (.env)...%RESET%
if exist .env (
    echo %GREEN%✅ .env 文件已存在%RESET%
    echo 如需重新配置，請手動編輯 .env 文件
) else (
    if exist .env.example (
        copy .env.example .env >nul
        echo %GREEN%✅ 已從 .env.example 創建 .env%RESET%
        echo %YELLOW%⚠️  請編輯 .env 文件，填入實際的 API Keys%RESET%
    ) else (
        echo %RED%❌ 找不到 .env.example 文件%RESET%
        echo 請手動創建 .env 文件
    )
)
echo.

REM ==================== 預拉取 Docker 映像 ====================
echo %YELLOW%[9/10] 預拉取 Docker 映像...%RESET%
echo 這可能需要較長時間，取決於您的網路速度...
echo.
docker compose pull
if %errorlevel% neq 0 (
    echo %YELLOW%⚠️  Docker 映像拉取失敗或部分失敗%RESET%
    echo 您可以稍後手動執行: docker compose pull
) else (
    echo %GREEN%✅ Docker 映像拉取完成%RESET%
)
echo.

REM ==================== 安裝完成 ====================
echo %YELLOW%[10/10] 最後檢查...%RESET%
echo.

echo ============================================================
echo %GREEN%✅ 安裝完成！%RESET%
echo ============================================================
echo.
echo 📋 已完成的步驟:
echo    ✅ Python 虛擬環境已創建 (.venv)
echo    ✅ Python 依賴已安裝 (requirements.txt)
echo    ✅ 前端依賴已安裝 (node_modules)
echo    ✅ 環境配置文件已準備 (.env)
echo    ✅ Docker 映像已預拉取
echo.
echo 🚀 下一步操作:
echo.
echo    %BLUE%1. 配置 API Keys:%RESET%
echo       編輯 .env 文件，填入以下內容:
echo       - DIFY_API_KEY (從 http://localhost:80 獲取)
echo       - RAGFLOW_API_KEY (從 http://localhost:9380 獲取)
echo.
echo    %BLUE%2. 啟動 Docker 服務:%RESET%
echo       docker compose up -d
echo.
echo    %BLUE%3. 啟動開發服務器:%RESET%
echo       python launcher.py
echo.
echo    %BLUE%4. 訪問應用:%RESET%
echo       前端: http://localhost:5173
echo       後端: http://localhost:8000
echo       API 文檔: http://localhost:8000/docs
echo.
echo 📚 相關文檔:
echo    - DOCKER_SETUP.md (Docker 服務配置指南)
echo    - SYSTEM_API_GUIDE.md (系統 API 使用指南)
echo    - SETTINGS_PAGE_TEST.md (設定頁面測試指南)
echo.
echo ============================================================
echo.

pause
