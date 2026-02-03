# 啟動 BruV 後端服務器
Write-Host "🚀 正在啟動 BruV 後端服務器..." -ForegroundColor Cyan

# 設置正確的目錄
$projectPath = "C:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\BruV_Project"
Set-Location $projectPath

# 設置 Python 路徑
$pythonPath = "C:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\.venv\Scripts\python.exe"

# 檢查 Python 是否存在
if (-not (Test-Path $pythonPath)) {
    Write-Host "❌ Python 路徑不存在: $pythonPath" -ForegroundColor Red
    exit 1
}

Write-Host "📂 工作目錄: $projectPath" -ForegroundColor Green
Write-Host "🐍 Python: $pythonPath" -ForegroundColor Green
Write-Host "🌐 啟動服務於 http://0.0.0.0:8000" -ForegroundColor Green
Write-Host ""

# 啟動服務器
& $pythonPath -m uvicorn app_anytype:app --reload --host 0.0.0.0 --port 8000
