# BruV Enterprise GUI Launcher - 安裝腳本
# 執行方式: .\install_gui.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BruV Enterprise GUI Launcher 安裝程式" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 檢查虛擬環境
$venvPath = "C:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\.venv\Scripts\Activate.ps1"

if (Test-Path $venvPath) {
    Write-Host "✅ 找到虛擬環境" -ForegroundColor Green
    Write-Host "🔄 啟動虛擬環境..." -ForegroundColor Yellow
    & $venvPath
} else {
    Write-Host "❌ 找不到虛擬環境: $venvPath" -ForegroundColor Red
    Write-Host "請先創建虛擬環境！" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 安裝 PySide6..." -ForegroundColor Yellow

# 安裝 PySide6
pip install PySide6==6.6.1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PySide6 安裝成功！" -ForegroundColor Green
} else {
    Write-Host "❌ PySide6 安裝失敗" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✨ 安裝完成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 啟動方式:" -ForegroundColor Yellow
Write-Host "   python launcher_gui.py" -ForegroundColor White
Write-Host ""
Write-Host "📖 詳細文檔:" -ForegroundColor Yellow
Write-Host "   README_GUI_LAUNCHER.md" -ForegroundColor White
Write-Host ""

# 詢問是否立即啟動
$launch = Read-Host "是否立即啟動 GUI 啟動器？(Y/n)"

if ($launch -eq "" -or $launch -eq "Y" -or $launch -eq "y") {
    Write-Host ""
    Write-Host "🚀 正在啟動 GUI 啟動器..." -ForegroundColor Cyan
    python launcher_gui.py
}
