# =============================================
# BruV Enterprise - PowerShell 一鍵啟動腳本
# =============================================

$Host.UI.RawUI.WindowTitle = "BruV Enterprise - Quick Start"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    BruV Enterprise - 一鍵啟動系統        ║" -ForegroundColor Cyan
Write-Host "║    企業級 AI 知識圖譜平台                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 切換到腳本所在目錄
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# [1/4] 檢查 Python 環境
Write-Host "[1/4] 檢查 Python 環境..." -ForegroundColor Yellow

# 搜尋 .venv：先找本目錄，再找上層（相容舊安裝）
$venvPython = Join-Path $scriptPath ".venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    $venvPython = Join-Path (Split-Path -Parent $scriptPath) ".venv\Scripts\python.exe"
}

if (-not (Test-Path $venvPython)) {
    Write-Host "❌ 找不到虛擬環境" -ForegroundColor Red
    Write-Host "請先執行安裝腳本：" -ForegroundColor Yellow
    Write-Host "  .\INSTALL.bat" -ForegroundColor White
    Write-Host "或手動安裝：" -ForegroundColor Yellow
    Write-Host "  python -m venv .venv" -ForegroundColor White
    Write-Host "  .venv\Scripts\activate" -ForegroundColor White
    Write-Host "  pip install -r requirements.txt" -ForegroundColor White
    pause
    exit 1
}
Write-Host "✅ Python 環境: $venvPython" -ForegroundColor Green

# [2/4] 檢查 Docker
Write-Host ""
Write-Host "[2/4] 檢查 Docker 服務..." -ForegroundColor Yellow

try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker 已安裝: $dockerVersion" -ForegroundColor Green
        
        # 檢查 Docker 是否運行
        $dockerPs = docker ps 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Docker 未運行，正在嘗試啟動..." -ForegroundColor Yellow
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
            Write-Host "   等待 Docker 啟動...（30 秒）" -ForegroundColor Yellow
            Start-Sleep -Seconds 30
        } else {
            Write-Host "✅ Docker 服務正常" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "⚠️  未檢測到 Docker，部分功能可能無法使用" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

# [3/4] 啟動選項
Write-Host ""
Write-Host "[3/4] 選擇啟動方式：" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] 啟動 GUI 啟動器（推薦 ⭐）" -ForegroundColor White
Write-Host "  [2] 快速啟動後端 + 前端" -ForegroundColor White
Write-Host "  [3] 僅啟動後端服務" -ForegroundColor White
Write-Host "  [4] 啟動完整系統（含 Docker）" -ForegroundColor White
Write-Host "  [Q] 取消" -ForegroundColor White
Write-Host ""

$choice = Read-Host "請選擇 [1-4, Q]"

switch ($choice.ToUpper()) {
    "1" {
        # GUI 啟動器
        Write-Host ""
        Write-Host "[4/4] 啟動 GUI 啟動器..." -ForegroundColor Yellow
        Write-Host ""
        & "$scriptPath\start_gui_launcher.bat"
    }
    "2" {
        # 快速啟動
        Write-Host ""
        Write-Host "[4/4] 快速啟動中..." -ForegroundColor Yellow
        Write-Host ""
        
        # 啟動後端
        Write-Host "🚀 啟動後端服務..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; & '$venvPython' -m uvicorn app_anytype:app --host 127.0.0.1 --port 8000 --reload"
        Start-Sleep -Seconds 3
        
        # 啟動前端
        Write-Host "🚀 啟動前端服務..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; npm run dev"
        
        # 等待服務啟動
        Write-Host ""
        Write-Host "⏳ 等待服務啟動..." -ForegroundColor Yellow
        Start-Sleep -Seconds 8
        
        # 打開瀏覽器
        Write-Host "🌐 打開瀏覽器..." -ForegroundColor Cyan
        Start-Process "http://localhost:5173"
        Start-Process "http://localhost:8000/docs"
        
        Write-Host ""
        Write-Host "✅ 啟動完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "📌 訪問地址：" -ForegroundColor Yellow
        Write-Host "   前端: http://localhost:5173" -ForegroundColor White
        Write-Host "   後端 API: http://localhost:8000" -ForegroundColor White
        Write-Host "   API 文檔: http://localhost:8000/docs" -ForegroundColor White
        Write-Host ""
    }
    "3" {
        # 僅後端
        Write-Host ""
        Write-Host "[4/4] 啟動後端服務..." -ForegroundColor Yellow
        Write-Host ""
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; & '$venvPython' -m uvicorn app_anytype:app --host 0.0.0.0 --port 8000 --reload"
        Start-Sleep -Seconds 5
        Start-Process "http://localhost:8000/docs"
        Write-Host "✅ 後端已啟動: http://localhost:8000" -ForegroundColor Green
    }
    "4" {
        # 完整系統
        Write-Host ""
        Write-Host "[4/4] 啟動完整系統..." -ForegroundColor Yellow
        Write-Host ""
        
        # 啟動 Docker
        Write-Host "🐳 啟動 Docker 容器..." -ForegroundColor Cyan
        docker-compose up -d
        Start-Sleep -Seconds 5
        
        # 啟動後端
        Write-Host "🚀 啟動後端服務..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; & '$venvPython' -m uvicorn app_anytype:app --host 127.0.0.1 --port 8000 --reload"
        Start-Sleep -Seconds 3
        
        # 啟動前端
        Write-Host "🚀 啟動前端服務..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; npm run dev"
        
        # 等待服務啟動
        Write-Host ""
        Write-Host "⏳ 等待所有服務啟動...（約 30 秒）" -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # 打開瀏覽器
        Write-Host "🌐 打開瀏覽器..." -ForegroundColor Cyan
        Start-Process "http://localhost:5173"
        Start-Process "http://localhost:8000/docs"
        Start-Process "http://localhost:3000"
        Start-Process "http://localhost:9380"
        
        Write-Host ""
        Write-Host "✅ 完整系統已啟動！" -ForegroundColor Green
        Write-Host ""
        Write-Host "📌 訪問地址：" -ForegroundColor Yellow
        Write-Host "   BruV 前端: http://localhost:5173" -ForegroundColor White
        Write-Host "   後端 API: http://localhost:8000/docs" -ForegroundColor White
        Write-Host "   Dify: http://localhost:3000" -ForegroundColor White
        Write-Host "   RAGFlow: http://localhost:9380" -ForegroundColor White
        Write-Host ""
    }
    default {
        Write-Host "已取消啟動" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "按任意鍵退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
