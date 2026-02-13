# ============================================================
# BruV Ollama Bridge Check
# Verify RAGFlow -> Ollama connectivity via Docker network
# Usage: powershell -ExecutionPolicy Bypass -File scripts/check_ollama_bridge.ps1
# ============================================================

param(
    [string]$RagflowContainer = "bruv_ragflow",
    [string]$OllamaContainer  = "bruv_ollama"
)

$ErrorActionPreference = "Stop"

function Write-Step { param([string]$Msg) Write-Host ("`n=== " + $Msg + " ===") -ForegroundColor Cyan }

# -- 0. Pre-check: containers running --
Write-Step "Pre-check: Container status"
$ragUp = docker ps --filter "name=$RagflowContainer" --format "{{.Names}}" 2>$null
$olUp  = docker ps --filter "name=$OllamaContainer"  --format "{{.Names}}" 2>$null

if (-not $ragUp) {
    Write-Host ("  [FAIL] RAGFlow container '" + $RagflowContainer + "' is not running") -ForegroundColor Red
    exit 1
}
if (-not $olUp) {
    Write-Host ("  [FAIL] Ollama container '" + $OllamaContainer + "' is not running") -ForegroundColor Red
    exit 1
}
Write-Host ("  RAGFlow: " + $ragUp + " [Running]") -ForegroundColor Green
Write-Host ("  Ollama:  " + $olUp  + " [Running]") -ForegroundColor Green

# -- 1. Test A: Docker bridge (container name) --
Write-Step "Test A: Docker bridge (http://${OllamaContainer}:11434)"
$testA = $null
try {
    $rawA = docker exec $RagflowContainer curl -s -o /dev/null -w "%{http_code}" "http://${OllamaContainer}:11434" 2>$null
    $testA = $rawA.Trim()
    Write-Host ("  HTTP status: " + $testA) -ForegroundColor $(if ($testA -eq "200") { "Green" } else { "Yellow" })
} catch {
    Write-Host ("  Error: " + $_) -ForegroundColor Yellow
}

# -- 2. Test B: host.docker.internal fallback --
Write-Step "Test B: host.docker.internal (http://host.docker.internal:11434)"
$testB = $null
try {
    $rawB = docker exec $RagflowContainer curl -s -o /dev/null -w "%{http_code}" "http://host.docker.internal:11434" 2>$null
    $testB = $rawB.Trim()
    Write-Host ("  HTTP status: " + $testB) -ForegroundColor $(if ($testB -eq "200") { "Green" } else { "Yellow" })
} catch {
    Write-Host ("  Error: " + $_) -ForegroundColor Yellow
}

# -- 3. Test C: Ollama API /api/tags from RAGFlow --
Write-Step "Test C: Model list via bridge"
try {
    $models = docker exec $RagflowContainer curl -s "http://${OllamaContainer}:11434/api/tags" 2>$null
    if ($models) {
        Write-Host "  Models visible from RAGFlow:" -ForegroundColor Green
        Write-Host ("  " + $models)
    }
} catch {
    Write-Host "  (skipped)" -ForegroundColor Yellow
}

# -- 4. Verdict --
Write-Step "Result"
if ($testA -eq "200") {
    Write-Host ""
    Write-Host ("  [PASS] Recommended Base URL: http://" + $OllamaContainer + ":11434") -ForegroundColor Green
    Write-Host "         (Docker bridge direct - lowest latency)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  RAGFlow config:" -ForegroundColor White
    Write-Host ("    OLLAMA_HOST = http://" + $OllamaContainer + ":11434") -ForegroundColor White
    exit 0
} elseif ($testB -eq "200") {
    Write-Host ""
    Write-Host "  [PASS] Recommended Base URL: http://host.docker.internal:11434" -ForegroundColor Green
    Write-Host "         (host.docker.internal fallback)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  RAGFlow config:" -ForegroundColor White
    Write-Host "    OLLAMA_HOST = http://host.docker.internal:11434" -ForegroundColor White
    exit 0
} else {
    Write-Host ""
    Write-Host "  [FAIL] RAGFlow cannot reach Ollama!" -ForegroundColor Red
    Write-Host "  Please check:" -ForegroundColor Red
    Write-Host "    1. Both containers on the same Docker network (bruv_network)" -ForegroundColor Yellow
    Write-Host "    2. Ollama is listening on 0.0.0.0:11434 (OLLAMA_HOST=0.0.0.0)" -ForegroundColor Yellow
    Write-Host ("    3. Run: docker network inspect bruv_network") -ForegroundColor Yellow
    exit 1
}
