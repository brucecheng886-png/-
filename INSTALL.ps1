<#
=====================================================================
BruV Enterprise v4.0 - Windows One-Click Installer
=====================================================================
Usage:
  Method A - Double-click INSTALL.bat
  Method B - PowerShell:  .\INSTALL.ps1
  Method C - If ExecutionPolicy blocks:
             powershell -ExecutionPolicy Bypass -File .\INSTALL.ps1
=====================================================================
#>

param(
    [switch]$SkipDocker,
    [switch]$SkipFrontend,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Helpers ───────────────────────────────────────────────────────────
function Write-Step  { param([string]$n,[string]$msg) Write-Host "`n[$n] $msg" -ForegroundColor Yellow }
function Write-Ok    { param([string]$msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn  { param([string]$msg) Write-Host "  [!!] $msg" -ForegroundColor DarkYellow }
function Write-Fail  { param([string]$msg) Write-Host "  [XX] $msg" -ForegroundColor Red }
function Write-Info  { param([string]$msg) Write-Host "  [..] $msg" -ForegroundColor Cyan }

function Test-Cmd {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-Ver {
    param([string]$Exe, [string]$Arg)
    try   { return (& $Exe $Arg 2>&1 | Out-String).Trim() }
    catch { return $null }
}

# ── Banner ────────────────────────────────────────────────────────────
Clear-Host
Write-Host ''
Write-Host '+=========================================================+' -ForegroundColor Cyan
Write-Host '|                                                         |' -ForegroundColor Cyan
Write-Host '|    BruV Enterprise v4.0 - One-Click Installer          |' -ForegroundColor Cyan
Write-Host '|    Enterprise AI Knowledge-Graph Platform               |' -ForegroundColor Cyan
Write-Host '|                                                         |' -ForegroundColor Cyan
Write-Host '+=========================================================+' -ForegroundColor Cyan
Write-Host ''

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot
Write-Info "Project root: $projectRoot"

# ══════════════════════════════════════════════════════════════════════
# [1/8] Preflight checks
# ══════════════════════════════════════════════════════════════════════
Write-Step '1/8' 'Checking prerequisites...'

$preflight = @{ Python = $false; Node = $false; Docker = $false; Git = $false }

# Python
if (Test-Cmd 'python') {
    $pyVer = Get-Ver 'python' '--version'
    $preflight.Python = $true
    Write-Ok "Python  : $pyVer"
} else {
    Write-Fail 'Python not found! Install Python 3.11+:'
    Write-Info 'https://www.python.org/downloads/'
    Write-Info 'Check "Add Python to PATH" during install'
    Write-Host ''; Read-Host 'Press Enter to exit'; exit 1
}

# Node.js
if (Test-Cmd 'node') {
    $nodeVer = Get-Ver 'node' '--version'
    $npmVer  = Get-Ver 'npm'  '--version'
    $preflight.Node = $true
    Write-Ok "Node.js : $nodeVer  (npm $npmVer)"
} else {
    Write-Fail 'Node.js not found! Install Node.js LTS:'
    Write-Info 'https://nodejs.org/'
    Write-Host ''; Read-Host 'Press Enter to exit'; exit 1
}

# Git
if (Test-Cmd 'git') {
    $gitVer = Get-Ver 'git' '--version'
    $preflight.Git = $true
    Write-Ok "Git     : $gitVer"
} else {
    Write-Warn 'Git not found - version control unavailable'
}

# Docker (optional)
if (Test-Cmd 'docker') {
    try {
        $dockerVer = Get-Ver 'docker' '--version'
        $preflight.Docker = $true
        Write-Ok "Docker  : $dockerVer"
    } catch {
        Write-Warn 'Docker installed but version check failed'
    }
} else {
    Write-Warn 'Docker not found - Dify/RAGFlow will be unavailable'
    Write-Info 'Install from: https://www.docker.com/products/docker-desktop/'
}

# ══════════════════════════════════════════════════════════════════════
# [2/8] Create Python virtual environment
# ══════════════════════════════════════════════════════════════════════
Write-Step '2/8' 'Setting up Python venv...'

$venvDir    = Join-Path $projectRoot '.venv'
$venvPython = Join-Path $venvDir 'Scripts\python.exe'
$venvPip    = Join-Path $venvDir 'Scripts\pip.exe'

if ((Test-Path $venvPython) -and (-not $Force)) {
    Write-Ok "Venv exists: $venvDir"
} else {
    if ($Force -and (Test-Path $venvDir)) {
        Write-Info 'Force mode: removing old .venv ...'
        Remove-Item $venvDir -Recurse -Force
    }
    Write-Info 'Creating venv...'
    & python -m venv $venvDir
    if (-not (Test-Path $venvPython)) {
        Write-Fail 'Venv creation failed!'
        Read-Host 'Press Enter to exit'; exit 1
    }
    Write-Ok "Venv created: $venvDir"
}

# ══════════════════════════════════════════════════════════════════════
# [3/8] Install Python backend deps
# ══════════════════════════════════════════════════════════════════════
Write-Step '3/8' 'Installing Python dependencies...'

Write-Info 'Upgrading pip...'
& $venvPython -m pip install --upgrade pip --quiet 2>&1 | Out-Null

Write-Info 'Installing requirements.txt...'
& $venvPip install -r (Join-Path $projectRoot 'requirements.txt') --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Fail 'Python dependency install failed!'
    Read-Host 'Press Enter to exit'; exit 1
}
Write-Ok 'Python dependencies installed'

# ══════════════════════════════════════════════════════════════════════
# [4/8] Install frontend deps
# ══════════════════════════════════════════════════════════════════════
Write-Step '4/8' 'Installing frontend dependencies...'

if ($SkipFrontend) {
    Write-Warn 'Skipped (-SkipFrontend)'
} else {
    $frontendDir = Join-Path $projectRoot 'frontend'

    if (-not (Test-Path (Join-Path $frontendDir 'package.json'))) {
        Write-Fail 'frontend/package.json not found!'
        Read-Host 'Press Enter to exit'; exit 1
    }

    $nodeModules = Join-Path $frontendDir 'node_modules'
    if ((Test-Path $nodeModules) -and (-not $Force)) {
        Write-Ok 'node_modules exists, skipping install'
    } else {
        if ($Force -and (Test-Path $nodeModules)) {
            Write-Info 'Force mode: removing old node_modules...'
            cmd /c "rd /s /q `"$nodeModules`""
        }
        Push-Location $frontendDir
        Write-Info 'Running npm install (may take 1-3 min)...'
        & npm install --loglevel warn
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            Write-Fail 'Frontend dependency install failed!'
            Read-Host 'Press Enter to exit'; exit 1
        }
        Pop-Location
        Write-Ok 'Frontend dependencies installed'
    }

    # Root package.json (3d-force-graph, etc.)
    $rootPkg = Join-Path $projectRoot 'package.json'
    $rootNM  = Join-Path $projectRoot 'node_modules'
    if ((Test-Path $rootPkg) -and (-not (Test-Path $rootNM))) {
        Write-Info 'Installing root npm dependencies...'
        Push-Location $projectRoot
        & npm install --loglevel warn
        Pop-Location
    }
}

# ══════════════════════════════════════════════════════════════════════
# [5/8] Create config file
# ══════════════════════════════════════════════════════════════════════
Write-Step '5/8' 'Setting up configuration...'

$configFile    = Join-Path $projectRoot 'config.json'
$configExample = Join-Path $projectRoot 'config.json.example'

if (Test-Path $configFile) {
    Write-Ok 'config.json already exists'
} elseif (Test-Path $configExample) {
    Copy-Item $configExample $configFile
    Write-Ok 'Created config.json from config.json.example'
    Write-Warn 'Edit config.json later to fill in your API keys'
} else {
    Write-Warn 'config.json.example not found - create config.json manually'
}

# ══════════════════════════════════════════════════════════════════════
# [6/8] Create required directories
# ══════════════════════════════════════════════════════════════════════
Write-Step '6/8' 'Creating directories...'

$requiredDirs = @('data', 'data\kuzu_db', 'nginx\ssl')

foreach ($dir in $requiredDirs) {
    $fullPath = Join-Path $projectRoot $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Ok "Created $dir\"
    } else {
        Write-Ok "$dir\ exists"
    }
}

# ══════════════════════════════════════════════════════════════════════
# [7/8] Docker image pull (optional)
# ══════════════════════════════════════════════════════════════════════
Write-Step '7/8' 'Docker images...'

if ($SkipDocker) {
    Write-Warn 'Skipped (-SkipDocker)'
} elseif (-not $preflight.Docker) {
    Write-Warn 'Docker not installed, skipping image pull'
} else {
    $dockerRunning = $false
    try {
        docker ps 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { $dockerRunning = $true }
    } catch { }

    if ($dockerRunning) {
        Write-Info 'Pulling Docker images (may take 5-15 min)...'
        Push-Location $projectRoot
        docker compose pull 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
        Pop-Location
        if ($LASTEXITCODE -eq 0) {
            Write-Ok 'Docker images pulled successfully'
        } else {
            Write-Warn 'Some images failed. Run later: docker compose pull'
        }
    } else {
        Write-Warn 'Docker not running, skipping image pull'
        Write-Info 'Start Docker Desktop, then run: docker compose pull'
    }
}

# ══════════════════════════════════════════════════════════════════════
# [8/8] Verify installation
# ══════════════════════════════════════════════════════════════════════
Write-Step '8/8' 'Verifying installation...'

$checks = @(
    @{ Name = 'Python venv (.venv)';        Path = $venvPython },
    @{ Name = 'Python dep (fastapi)';       Path = (Join-Path $venvDir 'Lib\site-packages\fastapi') },
    @{ Name = 'Frontend (node_modules)';    Path = (Join-Path $projectRoot 'frontend\node_modules') },
    @{ Name = 'Config (config.json)';       Path = $configFile },
    @{ Name = 'Data directory (data/)';     Path = (Join-Path $projectRoot 'data') }
)

$allPassed = $true
foreach ($check in $checks) {
    if (Test-Path $check.Path) {
        Write-Ok $check.Name
    } else {
        Write-Fail "$($check.Name) -- NOT FOUND"
        $allPassed = $false
    }
}

# ══════════════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════════════
Write-Host ''
Write-Host '==========================================================' -ForegroundColor Cyan

if ($allPassed) {
    Write-Host '  Installation completed successfully!' -ForegroundColor Green
} else {
    Write-Host '  Installation completed with warnings (see above)' -ForegroundColor Yellow
}

Write-Host '==========================================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '  Next steps:' -ForegroundColor White
Write-Host ''
Write-Host '  1. Edit config.json - fill in Dify / RAGFlow API keys' -ForegroundColor White
Write-Host ''
Write-Host '  2. Start the system (pick one):' -ForegroundColor White
Write-Host '     > Double-click START.bat          (interactive menu)' -ForegroundColor Gray
Write-Host '     > .\START.ps1                     (PowerShell)' -ForegroundColor Gray
Write-Host '     > .venv\Scripts\activate' -ForegroundColor Gray
Write-Host '       uvicorn app_anytype:app --port 8000' -ForegroundColor Gray
Write-Host '       cd frontend; npm run dev' -ForegroundColor Gray
Write-Host ''
Write-Host '  3. For Dify / RAGFlow, start Docker first:' -ForegroundColor White
Write-Host '     > docker compose up -d' -ForegroundColor Gray
Write-Host ''
Write-Host '  Service URLs:' -ForegroundColor White
Write-Host '     Frontend     http://localhost:5173' -ForegroundColor Gray
Write-Host '     Backend API  http://localhost:8000' -ForegroundColor Gray
Write-Host '     API Docs     http://localhost:8000/docs' -ForegroundColor Gray
Write-Host '     Dify         http://localhost:82' -ForegroundColor Gray
Write-Host '     RAGFlow      http://localhost:9380' -ForegroundColor Gray
Write-Host ''
Write-Host '==========================================================' -ForegroundColor Cyan
Write-Host ''
Read-Host 'Press Enter to exit'
