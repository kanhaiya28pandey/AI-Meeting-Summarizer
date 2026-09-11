# AI Meeting Summarizer — Developer & Contributor Guide

This guide contains complete instructions for setting up, developing, testing, and contributing to the AI Meeting Summarizer project in a local development environment without Docker.

---

## 1. Prerequisites

To run all tiers natively on your local machine, ensure you have the following installed:

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Java JDK** | 21+ | Spring Boot backend runtime & compiler |
| **Python** | 3.13+ | FastAPI AI microservice |
| **Node.js** | 20+ (LTS) | React frontend build toolchain |
| **npm** | 10+ | Frontend package manager |
| **PostgreSQL**| 16+ (18 recommended) | Relational database engine |
| **FFmpeg** | 6.0+ | Audio extraction for video uploads |
| **Git** | Latest | Source control |

---

## 2. Initial Repository Setup

```bash
git clone https://github.com/kanhaiya28pandey/AI-Meeting-Summarizer.git
cd AI-Meeting-Summarizer
```

Copy the environment template:
```bash
# On Linux/macOS
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```

---

## 3. Database Setup (PostgreSQL)

Ensure PostgreSQL is running locally on port `5432`.

### Create Database & User
Using `psql` or pgAdmin:
```sql
CREATE DATABASE meeting_summarizer;
CREATE USER meeting_user WITH PASSWORD 'change_me';
GRANT ALL PRIVILEGES ON DATABASE meeting_summarizer TO meeting_user;
```

---

## 4. Backend Development (Spring Boot)

The Spring Boot backend lives in the `backend/` directory.

### Configuration
The backend loads defaults from `src/main/resources/application.properties` and overrides them with environment variables:
- `DB_URL`: `jdbc:postgresql://localhost:5432/meeting_summarizer`
- `DB_USERNAME`: `meeting_user` (or your local Postgres user)
- `DB_PASSWORD`: `change_me`
- `AI_SERVICE_URL`: `http://localhost:8000`
- `FRONTEND_URL`: `http://localhost:5173`

### Run the Backend

#### On Linux / macOS:
```bash
cd backend
./mvnw spring-boot:run
```

#### On Windows (PowerShell):
```powershell
cd backend
$env:DB_PASSWORD="change_me"
.\mvnw.cmd spring-boot:run
```

The backend starts on **http://localhost:8080**.

### Run Backend Tests
```bash
# Linux / macOS
./mvnw clean test

# Windows (PowerShell)
.\mvnw.cmd clean test -DDB_PASSWORD=change_me
```

---

## 5. AI Service Development (FastAPI)

The AI service lives in the `ai-service/` directory.

### 5.1 Verify FFmpeg
Ensure `ffmpeg` is installed and discoverable on your system PATH:
```bash
ffmpeg -version
```
If FFmpeg is in a custom path, define it in your environment: `FFMPEG_PATH=/path/to/ffmpeg`.

### 5.2 Set Up Virtual Environment

#### On Linux / macOS:
```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### On Windows (PowerShell):
```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### 5.3 Configure Gemini API Key
```bash
# Linux / macOS
export GEMINI_API_KEY="your_actual_gemini_api_key"

# Windows PowerShell
$env:GEMINI_API_KEY="your_actual_gemini_api_key"
```

### 5.4 Run the AI Service
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The service will start on **http://localhost:8000**.
- Interactive OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 5.5 Run AI Service Tests
```bash
pytest -v --cov=app --cov-report=term-missing
```

---

## 6. Frontend Development (React + Vite)

The frontend lives in the `frontend/` directory.

### 6.1 Install Dependencies
```bash
cd frontend
npm ci
```

### 6.2 Start Vite Development Server
```bash
npm run dev
```

The frontend will be available at **http://localhost:5173**.
In local development, the Vite dev server sends requests directly to `http://localhost:8080/api`.

### 6.3 Run Frontend Tests & Lint
```bash
# Run unit and component tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Compile production bundle
npm run build
```

---

## 7. Multi-Tier Test Automation

A unified test runner script is available in `scripts/`:

#### On Windows (PowerShell):
```powershell
pwsh -File .\scripts\run_all_tests.ps1
```

#### On Linux / macOS (Bash):
```bash
chmod +x ./scripts/run_all_tests.sh
./scripts/run_all_tests.sh
```

---

## 8. Code Quality & Contribution Conventions

1. **Strict Type Safety**: All TypeScript interfaces must be explicitly typed without using `any`.
2. **DTO Isolation**: Backend controller methods must only accept and return dedicated DTO records. Entities must never be directly exposed to client requests.
3. **No Secret Leakage**:
   - Never commit `.env` or hardcode API keys or passwords.
   - Run tests before committing.
4. **Git Commit Message Style**: Use clean, human-written descriptive sentences for commit messages (avoid prefixed jargon).
