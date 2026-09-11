# AI Meeting Summarizer — Backend

Spring Boot REST API gateway, business logic, and persistence layer for the AI Meeting Summarizer platform.

## Technology Stack
* **Java**: 21+
* **Spring Boot**: 4.1.1
* **Build Tool**: Maven / Maven Wrapper (`mvnw` / `mvnw.cmd`)
* **Persistence**: Spring Data JPA & Hibernate 7
* **Database**: PostgreSQL 18+ (with native JSONB support)

## Database Configuration
The backend connects to PostgreSQL using standard environment variables with configurable defaults:

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | JDBC Connection URL | `jdbc:postgresql://localhost:5432/meeting_summarizer` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `AI_SERVICE_URL` | FastAPI AI Service URL | `http://localhost:8000` |

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

### 4. Get Meeting by ID
* **Method & Path**: `GET /api/meetings/{id}`
* **Status**: `200 OK` (or `404 Not Found` if nonexistent, `400 Bad Request` if invalid UUID)
* **Response (200 OK)**:
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

### 5. Delete Meeting
* **Method & Path**: `DELETE /api/meetings/{id}`
* **Status**: `204 No Content` (or `404 Not Found` if nonexistent)

---

### 6. Upload & Process Meeting (Phase 9 Pipeline)
* **Method & Path**: `POST /api/meetings/upload`
* **Content-Type**: `multipart/form-data`
* **Status**: `201 Created`
* **Parameters**:
  * `file`: Audio file binary (`.mp3`, `.wav`, `.m4a`) up to configured max size (default: 100 MB).
  * `title`: *(Optional)* Meeting title string (defaults to original filename if omitted).
* **Description**: Synchronously executes the full backend pipeline:
  1. Validates and saves audio temporarily into local disk buffer (`./temp/uploads`).
  2. Creates a meeting record in PostgreSQL with status `UPLOADED`.
  3. Transitions status to `TRANSCRIBING` and dispatches audio to FastAPI (`POST /api/v1/transcription`).
  4. Saves transcript and transitions status to `ANALYZING`.
  5. Dispatches transcript to FastAPI (`POST /api/v1/analyze`) for structured intelligence extraction.
  6. Saves summary, decisions, and action items with status `SAVING`, transitioning to `COMPLETED`.
  7. Safely deletes temporary audio file on success or failure.
* **Curl Example**:
```bash
curl -X POST http://localhost:8080/api/meetings/upload \
  -F "title=Weekly Team Meeting" \
  -F "file=@sample.mp3"
```
* **Response (201 Created)**:
```json
{
  "id": "52545fbb-fe1a-4010-ae7e-62fa218b83e5",
  "title": "Weekly Team Meeting",
  "originalFileName": "sample.mp3",
  "fileType": "audio/mpeg",
  "duration": null,
  "transcript": "The team decided to launch the dashboard on Friday. Rahul will complete testing by Thursday.",
  "summary": "The team agreed on releasing the new dashboard on Friday once testing is complete.",
  "keyDecisions": [
    "Launch the dashboard on Friday"
  ],
  "actionItems": [
    {
      "task": "Complete testing",
      "owner": "Rahul",
      "deadline": "Thursday"
    }
  ],
  "status": "COMPLETED",
  "createdAt": "2026-09-11T17:55:00.0000000",
  "updatedAt": "2026-09-11T17:55:04.0000000"
}
```

---

### 7. Process Meeting Acknowledgment (Phase 5)
* **Method & Path**: `POST /api/meetings/{id}/process`
* **Status**: `202 Accepted` (or `404 Not Found` if meeting nonexistent, `400 Bad Request` if invalid UUID, `503 Service Unavailable` if AI service down/timed out)
* **Description**: Verifies the meeting exists in PostgreSQL and triggers processing communication with the FastAPI AI service.
* **Response (202 Accepted)**:
```json
{
  "success": true,
  "meetingId": "52545fbb-fe1a-4010-ae7e-62fa218b83e5",
  "service": "AI Meeting Summarizer AI Service",
  "message": "Meeting processing request accepted"
}
```


---

### 7. Error Response Formats

#### Validation Error (`400 Bad Request`)
```json
{
  "timestamp": "2026-09-11T16:53:55.5205328",
  "status": 400,
  "error": "Validation Failed",
  "message": "Request validation failed",
  "path": "/api/meetings",
  "fieldErrors": {
    "title": "Title is required",
    "originalFileName": "Original file name is required",
    "fileType": "File type is required",
    "duration": "Duration must be zero or greater"
  }
}
```

#### Not Found Error (`404 Not Found`)
```json
{
  "timestamp": "2026-09-11T16:53:55.5108354",
  "status": 404,
  "error": "Not Found",
  "message": "Meeting not found with ID: 52545fbb-fe1a-4010-ae7e-62fa218b83e5",
  "path": "/api/meetings/52545fbb-fe1a-4010-ae7e-62fa218b83e5"
}
```

#### Service Unavailable Error (`503 Service Unavailable`)
```json
{
  "timestamp": "2026-09-11T17:25:00.0000000",
  "status": 503,
  "error": "AI Service Unavailable",
  "message": "The AI service is currently unavailable or timed out",
  "path": "/api/meetings/52545fbb-fe1a-4010-ae7e-62fa218b83e5/process"
}
```

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
