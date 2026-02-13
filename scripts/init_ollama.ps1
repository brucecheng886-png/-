# ============================================================
# BruV Ollama Init Script
# Wait for Ollama health -> Pull models -> Verify
# Usage: powershell -ExecutionPolicy Bypass -File scripts/init_ollama.ps1
# ============================================================

param(
    [string]$OllamaUrl = "http://localhost:11434",
    [int]$MaxWaitSeconds = 120,
    [string[]]$Models = @("llama3", "nomic-embed-text")
)

$ErrorActionPreference = "Stop"

function Write-Step { param([string]$Msg) Write-Host ("`n=== " + $Msg + " ===") -ForegroundColor Cyan }

# -- 1. Wait for Ollama health --
Write-Step "Waiting for Ollama ($OllamaUrl)"
$elapsed = 0
$ready = $false
while ($elapsed -lt $MaxWaitSeconds) {
    try {
        $resp = Invoke-WebRequest -Uri $OllamaUrl -UseBasicParsing -TimeoutSec 3
        if ($resp.StatusCode -eq 200) {
            Write-Host ("  Ollama response: " + $resp.Content.Trim()) -ForegroundColor Green
            $ready = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 3
    $elapsed += 3
    Write-Host ("  Waiting... (" + $elapsed + " / " + $MaxWaitSeconds + "s)") -ForegroundColor Yellow
}

if (-not $ready) {
    Write-Host ("ERROR: Ollama not ready after " + $MaxWaitSeconds + "s") -ForegroundColor Red
    exit 1
}

# -- 2. Pull models --
foreach ($model in $Models) {
    Write-Step ("Pulling model: " + $model)

    # Check if already exists
    try {
        $showBody = '{"name":"' + $model + '"}'
        $existing = Invoke-RestMethod -Uri ($OllamaUrl + "/api/show") -Method Post -ContentType "application/json" -Body $showBody -ErrorAction SilentlyContinue
        if ($existing.modelfile) {
            Write-Host "  Model already exists, skipping" -ForegroundColor Green
            continue
        }
    } catch {}

    Write-Host "  Pulling via docker exec (may take minutes)..."
    docker exec bruv_ollama ollama pull $model
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("  WARNING: Failed to pull " + $model + " (exit code: " + $LASTEXITCODE + ")") -ForegroundColor Red
    } else {
        Write-Host ("  " + $model + " pulled successfully") -ForegroundColor Green
    }
}

# -- 3. List installed models --
Write-Step "Installed models"
docker exec bruv_ollama ollama list

# -- 4. Quick inference test --
Write-Step "Quick inference test (llama3)"
try {
    $testBody = @{
        model  = "llama3"
        prompt = "Say hello in one sentence."
        stream = $false
    } | ConvertTo-Json

    $testResp = Invoke-RestMethod -Uri ($OllamaUrl + "/api/generate") -Method Post -ContentType "application/json" -Body $testBody -TimeoutSec 120

    Write-Host ("  Response: " + $testResp.response) -ForegroundColor Green
    $secs = [math]::Round($testResp.total_duration / 1e9, 2)
    Write-Host ("  Inference time: " + $secs + "s") -ForegroundColor Gray
} catch {
    Write-Host ("  WARNING: Inference test failed - " + $_) -ForegroundColor Yellow
    Write-Host "  (Model may not be fully loaded yet, try later)" -ForegroundColor Yellow
}

# -- 5. Done --
Write-Step "Ollama init complete"
Write-Host ""
Write-Host ("  Endpoint:    " + $OllamaUrl)
Write-Host ("  API tags:    " + $OllamaUrl + "/api/tags")
Write-Host ("  Model list:  docker exec bruv_ollama ollama list")
Write-Host ""
Write-Host "  From RAGFlow (Docker internal): http://ollama:11434"
Write-Host ("  From host:                      " + $OllamaUrl)
Write-Host ""
