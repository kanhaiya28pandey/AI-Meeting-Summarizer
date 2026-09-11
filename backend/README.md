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

### 6. Error Response Formats

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
