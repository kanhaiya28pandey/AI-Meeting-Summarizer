#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================================"
echo " AI MEETING SUMMARIZER — FULL TEST SUITE RUNNER (BASH)"
echo "========================================================"
echo "Root directory: $ROOT_DIR"
echo ""

# 1. Backend
echo "[1/3] Running Backend Tests (Spring Boot)..."
cd "$ROOT_DIR/backend"
./mvnw test -DDB_PASSWORD="${DB_PASSWORD:-12345}"
echo " Backend tests passed."
echo ""

# 2. AI Service
echo "[2/3] Running AI Service Tests (FastAPI / Pytest)..."
cd "$ROOT_DIR/ai-service"
source .venv/bin/activate || source .venv/Scripts/activate
pytest -v --cov=app --cov-report=term-missing
echo " AI Service tests passed."
echo ""

# 3. Frontend
echo "[3/3] Running Frontend Tests (Vitest + RTL)..."
cd "$ROOT_DIR/frontend"
npm test
npm run lint
npm run build
echo " Frontend tests, lint, and build passed."
echo ""

echo "========================================================"
echo " ALL TIERS PASSED SUCCESSFULLY"
echo "========================================================"
