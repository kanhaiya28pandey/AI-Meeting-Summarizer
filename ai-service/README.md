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
> This endpoint validates and acknowledges processing requests from Spring Boot.
> Actual audio transcription orchestration will be implemented in Phase 7.

### 3. Gemini Text Analysis Test Endpoint (Phase 6)
* **Method & Path**: `POST /api/v1/gemini/test`
* **Status**: `200 OK` (or `422 Unprocessable Entity` for invalid input, `503 Service Unavailable` for API/service failure)
* **Description**: Sends text input to Google Gemini and returns schema-validated structured intelligence using Gemini's structured output mode (`application/json`).
* **Request Body**:
```json
{
  "text": "The team decided to launch the new dashboard on Friday. Rahul will complete testing by Thursday."
}
```
* **Response Body**:
```json
{
  "summary": "The team agreed on releasing the new dashboard on Friday, with Rahul handling testing before launch.",
  "key_decisions": [
    "The new dashboard will launch on Friday."
  ],
  "action_items": [
    {
      "task": "Complete testing",
      "owner": "Rahul",
      "deadline": "Thursday"
    }
  ]
}
```

> [!IMPORTANT]
> **Zero-Hallucination Prompting**: Gemini is strictly instructed to only extract information explicitly stated in the input text. If an owner or deadline is unmentioned, they are returned as `null`. If no decisions or action items exist, empty arrays `[]` are returned.

### 4. Audio Transcription Endpoint (Phase 7)
* **Method & Path**: `POST /api/v1/transcription`
* **Status**: `200 OK` (or `400 Bad Request` for empty/corrupted files, `422 Unprocessable Entity` for unsupported formats, `503 Service Unavailable` for downstream AI service errors)
* **Description**: Accepts multipart audio upload (`MP3`, `WAV`, `M4A`), uploads to Gemini via Files API, transcribes using `gemini-3.5-transcribe` with verbatim transcription, speaker diarization, and word timestamps, and securely cleans up local and remote temporary files.
* **Form-Data**:
  * `file`: Audio file binary (`.mp3`, `.wav`, `.m4a`) up to configured max size (default: 100 MB).
* **Response Body**:
```json
{
  "success": true,
  "transcript": "Hello team, welcome to the quarterly planning meeting. Today we're reviewing our roadmap...",
  "language": "en",
  "segments": [
    {
      "speaker": "spk_1",
      "text": "Hello team, welcome to the quarterly planning meeting.",
      "start_time": 0.0,
      "end_time": 4.2
    }
  ]
}
```

### 5. Interactive Swagger UI
Explore and test the API visually at:
```text
http://localhost:8000/docs
```

### 6. ReDoc UI
Read comprehensive API documentation at:
```text
http://localhost:8000/redoc
```

---

## Gemini Integration Details

* **SDK**: `google-genai` (current official Python SDK)
* **Text Analysis Model**: Configurable via `GEMINI_MODEL` (default: `gemini-2.5-flash`)
* **Audio Transcription Model**: Configurable via `GEMINI_TRANSCRIPTION_MODEL` (default: `gemini-3.5-transcribe`)
* **API Key**: Loaded strictly from `GEMINI_API_KEY` environment variable. Never hardcoded or committed.
* **Audio Processing**: Streamed chunk-based upload into `./temp/audio`, verified for size and MIME integrity, uploaded to Gemini Files API, and deleted immediately after generation completes.
* **Structured Output**: Native `types.GenerateContentConfig(response_mime_type="application/json", response_schema=GeminiTestResponse)` with two-tier Pydantic validation.

---

## Running Automated Tests

```bash
pytest
```

---

## Current Status & Limitations (Phase 7)
* **Microservice Foundation**: Operational & tested
* **Health Check & Docs**: Operational & verified (Health check is independent of external Gemini calls)
* **Spring Boot Integration**: Operational (`POST /api/v1/process` acknowledges with `202 Accepted`)
* **Gemini Text Intelligence**: Operational (`POST /api/v1/gemini/test` extracts structured summary, decisions, actions)
* **Audio Transcription**: Operational (`POST /api/v1/transcription` via `gemini-3.5-transcribe` Files API)
* **Full Pipeline Orchestration**: Not implemented (scheduled for Phase 8 / subsequent phases)
* **Database Access**: Not implemented (stateless microservice by design, zero DB connection)

