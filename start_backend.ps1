# 啟動 BruV 後端服務器
Write-Host "🚀 正在啟動 BruV 後端服務器..." -ForegroundColor Cyan

# 設置正確的目錄
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

# 設置 Python 路徑
$venvPath = Join-Path (Split-Path -Parent $projectPath) ".venv\Scripts\python.exe"
if (-not (Test-Path $venvPath)) {
    # Fallback: 嘗試使用系統 Python
    $venvPath = "python"
}
$pythonPath = $venvPath

# 檢查 Python 是否存在
if (-not (Test-Path $pythonPath) -and $pythonPath -ne "python") {
    Write-Host "❌ Python 路徑不存在: $pythonPath" -ForegroundColor Red
    exit 1
}

# 配置服務器綁定地址
$host_addr = if ($env:BRUV_HOST) { $env:BRUV_HOST } else { "127.0.0.1" }
$port = if ($env:BRUV_PORT) { $env:BRUV_PORT } else { "8000" }

Write-Host "📂 工作目錄: $projectPath" -ForegroundColor Green
Write-Host "🐍 Python: $pythonPath" -ForegroundColor Green
Write-Host "🌐 啟動服務於 http://${host_addr}:${port}" -ForegroundColor Green
Write-Host ""

# 啟動服務器
& $pythonPath -m uvicorn app_anytype:app --host $host_addr --port $port
