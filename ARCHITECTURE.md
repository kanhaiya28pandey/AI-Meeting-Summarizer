# AI Meeting Summarizer — System Architecture & Design

This document details the architectural design, component layers, data flows, and engineering decisions of the AI Meeting Summarizer platform.

---

## 1. System Overview

The application converts recorded audio and video meetings into structured, actionable intelligence (summaries, confirmed decisions, and assigned action items). It is organized as a decoupled multi-service system:

```text
                                  BROWSER (Client)
                                          │
                                          ▼
                                ┌──────────────────┐
                                │   React + Vite   │
                                │   (Port 3000)    │
                                └────────┬─────────┘
                                         │ /api (Nginx Reverse Proxy)
                                         ▼
                                ┌──────────────────┐
                                │   Spring Boot    │
                                │   (Port 8080)    │
                                └──────┬─────┬─────┘
                                       │     │
                              JDBC     │     │ HTTP
                                       │     │
                                       ▼     ▼
                              ┌──────────┐  ┌────────────────┐
                              │PostgreSQL│  │    FastAPI     │
                              │(Port 5432│  │  (Port 8000)   │
                              └──────────┘  └───────┬────────┘
                                                    │
                                                    │ FFmpeg (Audio Extraction)
                                                    ▼
                                            Google Gemini API
                                            (External Cloud HTTPS)
```

---

## 2. Component Architecture

### 2.1 Frontend Layer (`frontend/`)
Built with **React 19**, **TypeScript**, and **Vite**, served in production via **Nginx 1.27**.

```text
frontend/src/
├── components/
│   ├── common/       # FileDropZone, UploadCard, ProcessingStatus, ConfirmDialog, ErrorBoundary
│   ├── layout/       # AppLayout, Header (with breadcrumbs), Sidebar (responsive drawer)
│   ├── meeting/      # MeetingSummary, KeyDecisions, ActionItems, Transcript, MeetingCard, MeetingList
│   └── ui/           # Button, Card, Badge, StatusBadge, Skeleton, PageHeader, Toast
├── hooks/            # useMeetingProcessing (polling controller), useToast (global notifications)
├── pages/            # Home (upload hero), Meetings (history), MeetingDetails (results), Settings, NotFound
├── services/         # api.ts (Fetch HTTP client with error mapping and /api routing)
├── types/            # TypeScript domain interfaces (Meeting, ActionItem, Status, ApiError)
└── utils/            # fileValidation, formatDuration, formatDate, formatFileSize, apiError
```

- **Reverse Proxy Strategy**: The client bundle makes relative requests to `/api/*`. Nginx handles the reverse proxy to Spring Boot on `backend:8080`, eliminating browser CORS complexities.
- **Client Polling**: The `useMeetingProcessing` hook polls `GET /api/meetings/{id}` every 2 seconds during active processing stages and automatically disengages once the status reaches `COMPLETED` or `FAILED`.

---

### 2.2 Backend Application Layer (`backend/`)
Built with **Java 21**, **Spring Boot 4.1**, and **Spring Data JPA**.

```text
backend/src/main/java/com/meeting/
├── client/           # AiServiceClient (REST client calling FastAPI with connect/read timeouts)
├── config/           # WebConfig (CORS headers), AsyncConfig (in-memory task executor)
├── controller/       # MeetingController (REST endpoints), HealthController (liveness & readiness)
├── dto/              # Request/response transfer objects with Bean Validation (@Size, @NotBlank)
├── entity/           # Meeting (JPA entity with JSONB mapping, timestamps, status enum)
├── exception/        # GlobalExceptionHandler, MeetingNotFoundException, AiServiceException
├── repository/       # MeetingRepository (Spring Data JPA interface for PostgreSQL)
└── service/          # MeetingService, MeetingUploadService, MeetingProcessingService
```

- **Async Task Coordination**: Upload requests return immediately with `202 Accepted`. `MeetingProcessingService` orchestrates the pipeline (`UPLOADED` → `TRANSCRIBING` → `ANALYZING` → `SAVING` → `COMPLETED`) via an internal `ThreadPoolTaskExecutor`.
- **Concurrency Protection**: An active in-memory lock set (`ConcurrentHashMap`) ensures the same meeting is never processed concurrently by duplicate triggers.

---

### 2.3 AI & Media Processing Microservice (`ai-service/`)
Built with **Python 3.13**, **FastAPI**, **Pydantic**, and **FFmpeg**.

```text
ai-service/app/
├── api/routes/       # health, process, transcription, analyze, gemini
├── core/             # config.py (Pydantic BaseSettings, environment loading, path resolution)
├── schemas/          # Pydantic schemas (TranscriptionResponse, MeetingAnalysisResponse, ActionItem)
├── services/         # transcription_service.py, meeting_analysis_service.py, ffmpeg_service.py, media_service.py
└── utils/            # exceptions.py (GeminiServiceError, MediaProcessingError)
```

- **FFmpeg Subprocess Isolation**: Audio extraction from MP4/MOV videos is executed with `shell=False` through a parameterized subprocess command with an enforced 600-second timeout.
- **Gemini API Integration**: Uses Google's official `google-genai` SDK:
  - **Gemini 3.5 Transcribe**: Audio file transcription with speaker diarization and timestamp parsing.
  - **Gemini 2.5 Flash**: Zero-shot structured JSON analysis with Pydantic output validation.

---

### 2.4 Database Layer (`db`)
Built on **PostgreSQL 18**.

#### `meetings` Table Schema
| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Primary key (`uuid_generate_v4()`) |
| `title` | `VARCHAR(200)` | Yes | Meeting title |
| `original_file_name` | `VARCHAR(255)` | Yes | Sanitized uploaded filename |
| `file_type` | `VARCHAR(100)` | Yes | MIME type (e.g. `audio/mpeg`, `video/mp4`) |
| `duration` | `INTEGER` | Yes | Audio duration in seconds |
| `status` | `VARCHAR(50)` | No | Current pipeline stage |
| `transcript` | `TEXT` | Yes | Full transcribed text |
| `summary` | `TEXT` | Yes | Executive meeting summary |
| `key_decisions` | `JSONB` | Yes | String array of confirmed decisions |
| `action_items` | `JSONB` | Yes | Array of objects `{task, owner, deadline}` |
| `created_at` | `TIMESTAMP` | No | Creation timestamp |
| `updated_at` | `TIMESTAMP` | No | Last update timestamp |

---

## 3. End-to-End Processing Workflow

```text
User selects audio/video
        │
        ▼
Frontend validates file extension & size (<= 100 MB)
        │
        ▼
POST /api/meetings/upload (Multipart request)
        │
        ▼
Spring Boot persists initial record (Status: UPLOADED)
        │
        ▼
HTTP 202 Accepted returned to client with Meeting ID
        │
        ▼ [Asynchronous Execution on Background Thread]
Spring Boot advances status: TRANSCRIBING
        │
        ▼
Spring Boot forwards media to FastAPI /api/v1/transcription
        │
        ├─► [If Video (MP4/MOV)]: FFmpeg extracts 16kHz mono WAV
        │
        ▼
Gemini 3.5 Transcribe generates full text transcript
        │
        ▼
FastAPI returns transcript to Spring Boot (saved to DB)
        │
        ▼
Spring Boot advances status: ANALYZING
        │
        ▼
Spring Boot calls FastAPI /api/v1/analyze with transcript text
        │
        ▼
Gemini 2.5 Flash produces structured summary, decisions, action items
        │
        ▼
Spring Boot advances status: SAVING
        │
        ▼
Results persisted to PostgreSQL
        │
        ▼
Status updated to COMPLETED
        │
        ▼ [Client Polling detects COMPLETED]
Frontend renders completed summary, decisions, tasks, and transcript
```

---

## 4. Architectural Decision Records (ADRs)

### ADR 1: Separate FastAPI Microservice from Spring Boot
- **Decision**: Decouple AI interaction and media processing into a Python FastAPI service rather than calling Gemini or FFmpeg directly from Java.
- **Rationale**:
  - Python is the primary ecosystem for modern AI tooling and native Google GenAI SDK updates.
  - FFmpeg invocation and media stream management are significantly cleaner and more isolated in Python.
  - Isolates compute-heavy and external API failure domains from core business data and user CRUD operations.

### ADR 2: Relational PostgreSQL with JSONB for AI Results
- **Decision**: Use PostgreSQL with `JSONB` columns for `key_decisions` and `action_items`.
- **Rationale**:
  - Meeting records have strict transactional consistency requirements for metadata and lifecycles.
  - Decisions and action items are semi-structured lists that benefit from native JSON querying and document flexibility without needing excessive one-to-many join tables.

### ADR 3: Asynchronous In-Process Processing with Client Polling
- **Decision**: Use in-process `ThreadPoolTaskExecutor` combined with frontend HTTP polling at 2-second intervals.
- **Rationale**:
  - Meetings take 15 to 90 seconds to transcribe and analyze. Holding open an HTTP request blocks server threads and triggers browser gateway timeouts.
  - Polling provides a robust, stateless recovery model for browser refreshes and avoids the operational complexity of WebSockets or SSE for an MVP.

### ADR 4: Ephemeral Media Storage
- **Decision**: Store uploaded media only in temporary container disk storage during processing, then delete them immediately.
- **Rationale**:
  - Storing audio/video binaries inside PostgreSQL degrades database performance and bloats backups.
  - Avoids premature dependency on external cloud storage providers (S3, GCS) while keeping the application fully self-contained.

### ADR 5: Nginx Reverse Proxy Architecture in Docker
- **Decision**: Serve the React SPA using Nginx and proxy `/api/*` requests to `backend:8080`.
- **Rationale**:
  - The browser interacts with a single origin (`http://localhost:3000`).
  - Completely prevents client-side CORS issues and removes the requirement to bake internal Docker service names into client JavaScript bundles.

---

## 5. Security Architecture

1. **Defense-in-Depth File Validation**:
   - Client-side validation: Checks file extensions and byte sizes.
   - Spring Boot validation: Validates MIME types, sanitized filenames, and enforces a strict 100 MB ceiling.
   - FastAPI validation: Re-verifies file headers before invoking FFmpeg.
2. **Path Traversal & Command Injection Immunization**:
   - Filenames are stripped of path separators and non-whitelisted characters.
   - FFmpeg is executed strictly as a parameterized argument list (`shell=False`).
3. **Prompt Injection Resilience**:
   - User transcripts are demarcated with strict boundary blocks and explicit prompt instructions that treat transcript content strictly as data, neutralizing attempts to override system instructions.
4. **Zero-Secret Client Exposure**:
   - `GEMINI_API_KEY` is provided only to the FastAPI container at runtime.
   - Neither the React client bundle nor the Spring Boot backend ever receive or transmit the Gemini API key.

---

## 6. Known Limitations & Future Architecture

### Current Limitations
- **In-Process Background Tasks**: Because background tasks run in-memory within Spring Boot, restarting the backend container while a meeting is processing will interrupt that specific job.
- **No Multi-User Authentication**: The application does not currently support user logins, role-based permissions, or private meeting isolation.
- **Ephemeral Storage**: Media files are cleaned up post-processing; playback of uploaded video/audio is not supported after analysis.

### Future Architecture Vision
```text
                         Client (Web / Mobile)
                                   │
                                   ▼
                         Cloudflare / CDN / WAF
                                   │
                                   ▼
                        API Gateway (Auth / Rate Limiting)
                                   │
                                   ▼
                      Spring Boot Orchestration Cluster
                       /               │             \
                      v                v              v
               PostgreSQL Cluster   Kafka / Redis   Cloud Storage (S3/GCS)
                                    Job Queue       (Original Media)
                                       │
                                       ▼
                             FastAPI AI Workers
                            (Autoscaling GPU/CPU)
                                       │
                                       ▼
                               Google Gemini API
```
