# AI Meeting Summarizer — Multi-Tier Test Suite Runner (PowerShell)
param (
    [switch]$SkipBackend = $false,
    [switch]$SkipAiService = $false,
    [switch]$SkipFrontend = $false,
    [string]$DbPassword = "12345"
)

$ErrorActionPreference = "Stop"
$rootDir = (Get-Item -Path $PSScriptRoot).Parent.FullName

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " AI MEETING SUMMARIZER — FULL TEST SUITE RUNNER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Root directory: $rootDir`n"

$results = [ordered]@{}

# 1. Backend Tests
if (-not $SkipBackend) {
    Write-Host "[1/3] Running Backend Tests (Spring Boot)..." -ForegroundColor Yellow
    Push-Location "$rootDir\backend"
    try {
        & .\mvnw.cmd test "-DDB_PASSWORD=$DbPassword"
        if ($LASTEXITCODE -eq 0) {
            $results["Backend"] = "PASS"
            Write-Host " Backend tests passed.`n" -ForegroundColor Green
        } else {
            $results["Backend"] = "FAIL"
            Write-Host " Backend tests failed.`n" -ForegroundColor Red
        }
    } catch {
        $results["Backend"] = "FAIL"
        Write-Host " Backend tests failed: $_`n" -ForegroundColor Red
    } finally {
        Pop-Location
    }
} else {
    $results["Backend"] = "SKIPPED"
}

# 2. AI Service Tests
if (-not $SkipAiService) {
    Write-Host "[2/3] Running AI Service Tests (FastAPI / Pytest)..." -ForegroundColor Yellow
    Push-Location "$rootDir\ai-service"
    try {
        & .\.venv\Scripts\pytest -v --cov=app --cov-report=term-missing
        if ($LASTEXITCODE -eq 0) {
            $results["AI Service"] = "PASS"
            Write-Host " AI Service tests passed.`n" -ForegroundColor Green
        } else {
            $results["AI Service"] = "FAIL"
            Write-Host " AI Service tests failed.`n" -ForegroundColor Red
        }
    } catch {
        $results["AI Service"] = "FAIL"
        Write-Host " AI Service tests failed: $_`n" -ForegroundColor Red
    } finally {
        Pop-Location
    }
} else {
    $results["AI Service"] = "SKIPPED"
}

# 3. Frontend Tests
if (-not $SkipFrontend) {
    Write-Host "[3/3] Running Frontend Tests (Vitest + RTL)..." -ForegroundColor Yellow
    Push-Location "$rootDir\frontend"
    try {
        & npm test
        $testExit = $LASTEXITCODE
        & npm run lint
        $lintExit = $LASTEXITCODE
        & npm run build
        $buildExit = $LASTEXITCODE

        if ($testExit -eq 0 -and $lintExit -eq 0 -and $buildExit -eq 0) {
            $results["Frontend"] = "PASS"
            Write-Host " Frontend tests, lint, and build passed.`n" -ForegroundColor Green
        } else {
            $results["Frontend"] = "FAIL"
            Write-Host " Frontend checks failed.`n" -ForegroundColor Red
        }
    } catch {
        $results["Frontend"] = "FAIL"
        Write-Host " Frontend checks failed: $_`n" -ForegroundColor Red
    } finally {
        Pop-Location
    }
} else {
    $results["Frontend"] = "SKIPPED"
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " TEST EXECUTION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
$allPassed = $true
foreach ($tier in $results.Keys) {
    $status = $results[$tier]
    if ($status -eq "PASS") {
        Write-Host "  $tier : PASS" -ForegroundColor Green
    } elseif ($status -eq "SKIPPED") {
        Write-Host "  $tier : SKIPPED" -ForegroundColor Gray
    } else {
        Write-Host "  $tier : FAIL" -ForegroundColor Red
        $allPassed = $false
    }
}
Write-Host "========================================================" -ForegroundColor Cyan

if (-not $allPassed) {
    exit 1
}
