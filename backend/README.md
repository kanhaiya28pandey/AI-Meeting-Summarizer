# AI Meeting Summarizer — Backend

Spring Boot REST API gateway, business logic, asynchronous meeting pipeline, and persistence layer for the AI Meeting Summarizer platform.

## Technology Stack
* **Java**: 21+
* **Spring Boot**: 4.1.1
* **Build Tool**: Maven / Maven Wrapper (`mvnw` / `mvnw.cmd`)
* **Persistence**: Spring Data JPA & Hibernate 7
* **Database**: PostgreSQL 18+ (with native JSONB support)
* **Concurrency**: Spring `@EnableAsync` with bounded `ThreadPoolTaskExecutor`

## Database & Asynchronous Concurrency Configuration
The backend connects to PostgreSQL using standard environment variables with configurable defaults:

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | JDBC Connection URL | `jdbc:postgresql://localhost:5432/meeting_summarizer` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `AI_SERVICE_URL` | FastAPI AI Service URL | `http://localhost:8000` |
| `FRONTEND_URL` | Allowed CORS frontend origin | `http://localhost:5173` |
| `MEETING_PROCESSING_CORE_POOL_SIZE` | Background thread pool core size | `2` |
| `MEETING_PROCESSING_MAX_POOL_SIZE` | Background thread pool maximum size | `4` |
| `MEETING_PROCESSING_QUEUE_CAPACITY` | Background task queue capacity | `20` |

> [!NOTE]
> Never hardcode or commit real credentials to Git. Export `DB_PASSWORD` in your local environment or pass it at runtime.

### Starting PostgreSQL & Creating Database
Ensure your PostgreSQL 18 service is running, then create the database if it does not already exist:
```sql
CREATE DATABASE meeting_summarizer;
```

---

## REST API Endpoints

### 1. Health Check
* **Method & Path**: `GET /api/health`
* **Status**: `200 OK`
* **Response**:
```json
{
  "status": "UP",
  "service": "AI Meeting Summarizer Backend"
}
```

---

### 2. Create Meeting
* **Method & Path**: `POST /api/meetings`
* **Headers**: `Content-Type: application/json`
* **Status**: `201 Created`
* **Header**: `Location: /api/meetings/{id}`
* **Request Body**:
```json
{
  "title": "Sprint Planning Meeting",
  "originalFileName": "sprint-planning.mp3",
  "fileType": "audio/mpeg",
  "duration": 3600
}
```
* **Response**:
```json
{
  "id": "52545fbb-fe1a-4010-ae7e-62fa218b83e5",
  "title": "Sprint Planning Meeting",
  "originalFileName": "sprint-planning.mp3",
  "fileType": "audio/mpeg",
  "duration": 3600,
  "transcript": null,
  "summary": null,
  "keyDecisions": [],
  "actionItems": [],
  "status": "UPLOADED",
  "createdAt": "2026-09-11T16:53:55.1782861",
  "updatedAt": "2026-09-11T16:53:55.1782861"
}
```

---

### 3. Get All Meetings
* **Method & Path**: `GET /api/meetings`
* **Status**: `200 OK`
* **Response**:
```json
[
  {
    "id": "52545fbb-fe1a-4010-ae7e-62fa218b83e5",
    "title": "Sprint Planning Meeting",
    "originalFileName": "sprint-planning.mp3",
    "fileType": "audio/mpeg",
    "duration": 3600,
    "transcript": null,
    "summary": null,
    "keyDecisions": [],
    "actionItems": [],
    "status": "UPLOADED",
    "createdAt": "2026-09-11T16:53:55.1782861",
    "updatedAt": "2026-09-11T16:53:55.1782861"
  }
]
```

---

### 4. Get Meeting by ID (Status Source of Truth)
* **Method & Path**: `GET /api/meetings/{id}`
* **Status**: `200 OK` (or `404 Not Found` if nonexistent, `400 Bad Request` if invalid UUID)
* **Description**: Primary endpoint used by the frontend to monitor processing lifecycle states.
* **Response (200 OK)**:
```json
{
  "id": "52545fbb-fe1a-4010-ae7e-62fa218b83e5",
  "title": "Sprint Planning Meeting",
  "originalFileName": "sprint-planning.mp3",
  "fileType": "audio/mpeg",
  "duration": 3600,
  "transcript": "...",
  "summary": "...",
  "keyDecisions": [],
  "actionItems": [],
  "status": "TRANSCRIBING",
  "createdAt": "2026-09-11T16:53:55.1782861",
  "updatedAt": "2026-09-11T16:53:57.1782861"
}
```

---

### 5. Delete Meeting
* **Method & Path**: `DELETE /api/meetings/{id}`
* **Status**: `204 No Content` (or `404 Not Found` if nonexistent)

---

### 6. Upload & Asynchronously Process Meeting (Phase 12 Pipeline)
* **Method & Path**: `POST /api/meetings/upload`
* **Content-Type**: `multipart/form-data`
* **Status**: `202 Accepted`
* **Header**: `Location: /api/meetings/{id}`
* **Parameters**:
  * `file`: Audio file binary (`.mp3`, `.wav`, `.m4a`) up to configured max size (default: 100 MB).
  * `title`: *(Optional)* Meeting title string (defaults to original filename if omitted).
* **Description**: Asynchronously initiates the processing pipeline:
  1. Validates and saves audio temporarily into local disk buffer (`./temp/uploads`).
  2. Creates a meeting record in PostgreSQL with status `UPLOADED`.
  3. Enqueues processing task into dedicated bounded `ThreadPoolTaskExecutor`.
  4. Immediately returns `202 Accepted` with meeting ID.
  5. Background thread sequentially executes:
     - `TRANSCRIBING`: Calls FastAPI transcription (`POST /api/v1/transcription`) and persists transcript.
     - `ANALYZING`: Calls FastAPI analysis (`POST /api/v1/analyze`) for structured intelligence.
     - `SAVING`: Persists summary, decisions, and action items.
     - `COMPLETED`: Marks meeting completed.
     - On error at any point: Marks meeting `FAILED` (preserving partial transcript if generated).
     - Always cleans up temporary audio file in `finally`.
* **Curl Example**:
```bash
curl -X POST http://localhost:8080/api/meetings/upload \
  -F "title=Weekly Team Meeting" \
  -F "file=@sample.mp3"
```
* **Response (202 Accepted)**:
```json
{
  "id": "52545fbb-fe1a-4010-ae7e-62fa218b83e5",
  "title": "Weekly Team Meeting",
  "originalFileName": "sample.mp3",
  "fileType": "audio/mpeg",
  "duration": null,
  "transcript": null,
  "summary": null,
  "keyDecisions": [],
  "actionItems": [],
  "status": "UPLOADED",
  "createdAt": "2026-09-11T17:55:00.0000000",
  "updatedAt": "2026-09-11T17:55:00.0000000"
}
```

> [!IMPORTANT]
> **Asynchronous Execution Limitation:** Background task processing is currently managed by an in-memory `ThreadPoolTaskExecutor` suitable for MVP. If the Spring Boot application server is stopped or restarts while a meeting task is in-flight, that job is interrupted. Persistent job queues (such as Redis, RabbitMQ, or database polling) are planned for later reliability phases.

---

### 7. Process Meeting Acknowledgment (Phase 5)
* **Method & Path**: `POST /api/meetings/{id}/process`
* **Status**: `202 Accepted`
* **Description**: Protected against duplicate triggers if meeting is already completed or actively in progress.

---

## Running Locally
```bash
# Windows PowerShell
$env:DB_PASSWORD="your_password"
.\mvnw.cmd spring-boot:run

# Linux / macOS
DB_PASSWORD="your_password" ./mvnw spring-boot:run
```

## Running Automated Tests
```bash
.\mvnw.cmd test -DDB_PASSWORD="your_password"
```
