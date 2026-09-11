# AI Meeting Summarizer — AI Service

FastAPI-powered microservice for audio/video transcription, AI prompt orchestration, and meeting intelligence analysis.

## Purpose
This microservice will handle:
* Media audio processing and extraction
* Speech-to-text transcription orchestration
* Google Gemini prompt engineering and structured JSON extraction
* Extraction of meeting summaries, key decisions, and action items with owners and deadlines

> [!NOTE]
> Phase 4 establishes only the foundational microservice architecture and configuration. External AI integrations are introduced in subsequent phases.

## Technology Stack
* **Python**: 3.13+ / 3.14
* **Web Framework**: FastAPI
* **ASGI Server**: Uvicorn
* **Data Validation & Settings**: Pydantic v2 & `pydantic-settings`
* **Testing & HTTP Client**: `pytest` & `httpx`

---

## Local Setup

### 1. Create and Activate Virtual Environment
```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS
python -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` if custom overrides are needed:
```bash
cp .env.example .env
```

Default Configuration:
| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Service Name | `AI Meeting Summarizer AI Service` |
| `APP_VERSION` | Service Version | `1.0.0` |
| `HOST` | Bind Host | `0.0.0.0` |
| `PORT` | HTTP Port | `8000` |
| `SPRING_BOOT_URL` | Gateway URL | `http://localhost:8080` |

---

## Running the Service

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The service will start on `http://localhost:8000`.

---

## API Documentation & Endpoints

### 1. Health Check
* **Method & Path**: `GET /api/health`
* **Response (200 OK)**:
```json
{
  "status": "UP",
  "service": "AI Meeting Summarizer AI Service"
}
```

### 2. Meeting Processing Request (Phase 5)
* **Method & Path**: `POST /api/v1/process`
* **Status**: `202 Accepted`
* **Request Body**:
```json
{
  "meetingId": "8e0c6f35-5b3f-4e6e-9d5e-7d2a4a3f7e10"
}
```
* **Response Body**:
```json
{
  "success": true,
  "meetingId": "8e0c6f35-5b3f-4e6e-9d5e-7d2a4a3f7e10",
  "service": "AI Meeting Summarizer AI Service",
  "message": "Meeting processing request accepted"
}
```
> [!NOTE]
> This endpoint currently only validates and acknowledges processing requests from Spring Boot.
> Actual transcription and AI processing will be implemented in later phases.

### 3. Interactive Swagger UI
Explore and test the API visually at:
```text
http://localhost:8000/docs
```

### 4. ReDoc UI
Read comprehensive API documentation at:
```text
http://localhost:8000/redoc
```

---

## Running Automated Tests

```bash
pytest
```

---

## Current Status & Limitations (Phase 5)
* **Microservice Foundation**: Operational & tested
* **Health Check & Docs**: Operational & verified
* **Spring Boot Integration**: Operational (FastAPI acknowledges Spring Boot requests with `202 Accepted`)
* **Gemini Integration**: Not implemented (scheduled for Phase 6)
* **Transcription Pipeline**: Not implemented (scheduled for Phase 7)
* **Audio/Video Processing**: Not implemented (scheduled for Phase 7 & 15)
* **Database Access**: Not implemented (stateless microservice by design, zero DB connection)
