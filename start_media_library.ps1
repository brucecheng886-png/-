# BruV 媒体库快速启动脚本
# 
# 功能：
# 1. 安装 MinIO Python 客户端
# 2. 启动后端服务
# 3. 运行测试

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " BruV 媒体库系统 - 快速启动" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. 安装依赖
Write-Host "📦 安装 MinIO 客户端..." -ForegroundColor Yellow
& "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/.venv/Scripts/pip.exe" install minio Pillow

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 依赖安装成功`n" -ForegroundColor Green
} else {
    Write-Host "❌ 依赖安装失败`n" -ForegroundColor Red
    exit 1
}

# 2. 检查 MinIO 服务
Write-Host "🔍 检查 MinIO 服务状态..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ MinIO 服务正在运行`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MinIO 服务未运行" -ForegroundColor Yellow
    Write-Host "💡 启动方法:" -ForegroundColor Cyan
    Write-Host "   cd BruV_Project" -ForegroundColor White
    Write-Host "   docker-compose up -d ragflow-minio`n" -ForegroundColor White
    
    $continue = Read-Host "是否继续？(使用本地存储模式) [Y/n]"
    if ($continue -eq "n") {
        exit 0
    }
}

# 3. 创建本地存储目录
Write-Host "📁 准备本地存储目录..." -ForegroundColor Yellow
$mediaPath = if ($env:BRUV_DATA_DIR) { Join-Path $env:BRUV_DATA_DIR "media_library" } else { Join-Path $HOME "BruV_Data\media_library" }
if (-not (Test-Path $mediaPath)) {
    New-Item -ItemType Directory -Path $mediaPath -Force | Out-Null
    Write-Host "✅ 已创建: $mediaPath`n" -ForegroundColor Green
} else {
    Write-Host "✅ 目录已存在: $mediaPath`n" -ForegroundColor Green
}

# 4. 停止旧的后端进程（优雅停止 → 超时后强制）
Write-Host "🛑 停止旧的后端进程..." -ForegroundColor Yellow
$oldProcs = Get-Process python -ErrorAction SilentlyContinue | 
    Where-Object { 
        (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue).LocalPort -eq 8000 
    }

foreach ($proc in $oldProcs) {
    try {
        Write-Host "   正在停止 PID $($proc.Id)..." -ForegroundColor Gray
        # 先嘗試優雅停止 (SIGTERM equivalent)
        $proc.CloseMainWindow() | Out-Null
        if (-not $proc.WaitForExit(5000)) {
            # 5 秒後強制終止
            Write-Host "   PID $($proc.Id) 未回應, 強制終止..." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    } catch {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2
Write-Host "✅ 已清理旧进程`n" -ForegroundColor Green

# 5. 启动后端
Write-Host "🚀 启动后端服务..." -ForegroundColor Yellow
Write-Host "📍 工作目录: $(Get-Location)`n" -ForegroundColor Cyan

$backendProcess = Start-Process -FilePath "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/.venv/Scripts/python.exe" `
    -ArgumentList "app_anytype.py" `
    -WorkingDirectory "C:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\BruV_Project" `
    -PassThru `
    -NoNewWindow

Write-Host "⏳ 等待后端启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 6. 检查后端状态
$backendReady = $false
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ 后端已就绪！`n" -ForegroundColor Green
        $backendReady = $true
        break
    } catch {
        Write-Host "   尝试 $i/5..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "❌ 后端启动失败`n" -ForegroundColor Red
    exit 1
}

# 7. 显示信息
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 媒体库系统已启动" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 API 文档: " -NoNewline
Write-Host "http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎨 媒体库端点:" -ForegroundColor Cyan
Write-Host "  POST   /api/media/upload      - 上传图片" -ForegroundColor White
Write-Host "  GET    /api/media/list        - 列出图片" -ForegroundColor White
Write-Host "  GET    /api/media/stats       - 统计信息" -ForegroundColor White
Write-Host "  DELETE /api/media/{file_id}   - 删除图片" -ForegroundColor White
Write-Host ""

# 8. 询问是否运行测试
$runTest = Read-Host "是否运行测试脚本？[Y/n]"
if ($runTest -ne "n") {
    Write-Host "`n🧪 运行测试..." -ForegroundColor Yellow
    & "C:/Users/bruce/PycharmProjects/企業級伺服器(Dify+RAGflow)/.venv/Scripts/python.exe" test_media_library.py
}

Write-Host "`n✅ 完成！按任意键退出..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
