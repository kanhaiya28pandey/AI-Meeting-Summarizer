# AI Meeting Summarizer — API Reference

This document provides a comprehensive specification for all public and internal REST endpoints across the AI Meeting Summarizer platform:

1. **Spring Boot Backend APIs** (`http://localhost:8080/api` or `/api` via Nginx reverse proxy)
2. **FastAPI AI Service APIs** (`http://ai-service:8000/api` or `http://localhost:8000/api`)

---

## 1. Spring Boot Backend APIs

The Spring Boot backend orchestrates meeting lifecycles, persists records in PostgreSQL, accepts multipart media uploads, and delegates AI tasks asynchronously.

### Common Request & Response Headers

- **`X-Request-ID`**: Optional client-supplied correlation ID (`^[a-zA-Z0-9_-]{1,64}$`). Returned in every response.
- **`Content-Type`**: `application/json` (or `multipart/form-data` for uploads).
- **`Accept`**: `application/json`.

### Error Response Schema

All Spring Boot error responses return a standardized JSON structure:

```json
{
  "timestamp": "2026-09-11T22:30:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Detailed human-readable explanation of error",
  "path": "/api/meetings",
  "fieldErrors": {
    "title": "Title must not exceed 200 characters"
  }
}
```

---

### 1.1 Health & Readiness

#### `GET /api/health`
Liveness check returning current service health without verifying upstream database connections.

- **Status Code**: `200 OK`
- **Response**:
```json
{
  "status": "UP",
  "service": "AI Meeting Summarizer Backend"
}
```

#### `GET /api/health/readiness`
Readiness check confirming active PostgreSQL connection pool availability.

- **Status Code**: `200 OK` (or `503 Service Unavailable` if database is down)
- **Response**:
```json
{
  "status": "UP",
  "service": "AI Meeting Summarizer Backend",
  "database": "UP"
}
```

---

### 1.2 Meeting Management

#### `POST /api/meetings`
Direct programmatic creation of a meeting record metadata without file processing.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Q3 Engineering Sync",
  "originalFileName": "engineering_sync.mp3",
  "fileType": "audio/mpeg",
  "duration": 1800
}
```
- **Validation**:
  - `title`: Optional, max 200 characters.
  - `originalFileName`: Optional, max 255 characters.
  - `fileType`: Optional, max 100 characters.
  - `duration`: Optional integer in seconds.
- **Server-Managed Fields**: `id`, `status`, `createdAt`, `updatedAt`, `transcript`, `summary`, `keyDecisions`, and `actionItems` are strictly managed by the backend and ignored if supplied in request bodies.
- **Status Code**: `201 Created`
- **Response Headers**: `Location: /api/meetings/{id}`
- **Response Body**:
```json
{
  "id": "7b134d1b-8c65-4f32-bbef-8447814b7e80",
  "title": "Q3 Engineering Sync",
  "originalFileName": "engineering_sync.mp3",
  "fileType": "audio/mpeg",
  "duration": 1800,
  "status": "UPLOADED",
  "createdAt": "2026-09-11T12:00:00Z",
  "updatedAt": "2026-09-11T12:00:00Z",
  "transcript": null,
  "summary": null,
  "keyDecisions": [],
  "actionItems": []
}
```

---

#### `POST /api/meetings/upload`
Primary user-facing upload endpoint. Accepts an audio or video file, creates a meeting record with status `UPLOADED`, queues asynchronous processing, and returns immediately with `202 Accepted`.

- **Request Headers**: `Content-Type: multipart/form-data`
- **Multipart Form Fields**:
  - `file` (*required*): Media file binary.
  - `title` (*optional*): Meeting title string (max 200 characters). If omitted, the sanitized filename is used.
- **Supported Formats**:
  - Audio: `.mp3`, `.wav`, `.m4a`
  - Video: `.mp4`, `.mov`
- **Size Limits**: Maximum 100 MB (`104,857,600` bytes). Requests exceeding 100 MB are rejected with `413 Payload Too Large`.
- **Status Code**: `202 Accepted`
- **Response Headers**: `Location: /api/meetings/{id}`
- **Response Body**:
```json
{
  "id": "7b134d1b-8c65-4f32-bbef-8447814b7e80",
  "title": "Weekly Product Review",
  "originalFileName": "review.mp4",
  "fileType": "video/mp4",
  "duration": null,
  "status": "UPLOADED",
  "createdAt": "2026-09-11T12:00:00Z",
  "updatedAt": "2026-09-11T12:00:00Z",
  "transcript": null,
  "summary": null,
  "keyDecisions": [],
  "actionItems": []
}
```
- **Error Codes**:
  - `400 Bad Request`: Empty file, empty filename, or title exceeding 200 characters.
  - `413 Payload Too Large`: File exceeds 100 MB.
  - `415 Unsupported Media Type`: File format not among supported audio/video types.

---

#### `GET /api/meetings`
Retrieves all meeting records, ordered chronologically with newest meetings first (`created_at DESC`).

- **Status Code**: `200 OK`
- **Response Body**:
```json
[
  {
    "id": "7b134d1b-8c65-4f32-bbef-8447814b7e80",
    "title": "Weekly Product Review",
    "originalFileName": "review.mp4",
    "fileType": "video/mp4",
    "duration": 340,
    "status": "COMPLETED",
    "createdAt": "2026-09-11T12:00:00Z",
    "updatedAt": "2026-09-11T12:02:15Z",
    "transcript": "Speaker 1: Welcome everyone...",
    "summary": "The team reviewed sprint progress and approved the launch roadmap.",
    "keyDecisions": [
      "Target release date confirmed for October 15th."
    ],
    "actionItems": [
      {
        "task": "Finalize integration tests",
        "owner": "Rahul",
        "deadline": "2026-09-18"
      }
    ]
  }
]
```

---

#### `GET /api/meetings/{id}`
Retrieves a single meeting record by its unique UUID.

- **Path Parameters**: `id` (*required*): Valid UUID (e.g., `7b134d1b-8c65-4f32-bbef-8447814b7e80`).
- **Status Code**: `200 OK`
- **Error Codes**:
  - `400 Bad Request`: Invalid UUID syntax.
  - `404 Not Found`: Meeting ID does not exist in PostgreSQL.

---

#### `DELETE /api/meetings/{id}`
Permanently deletes a meeting record and its generated results.

- **Path Parameters**: `id` (*required*): Valid UUID.
- **Status Code**: `204 No Content`
- **Error Codes**:
  - `400 Bad Request`: Invalid UUID syntax.
  - `404 Not Found`: Meeting ID not found.

---

#### `POST /api/meetings/{id}/process`
Manual or retry trigger for backend meeting processing. Validates status and invokes the background executor.

- **Path Parameters**: `id` (*required*): Valid UUID.
- **Status Code**: `202 Accepted`
- **Response Body**:
```json
{
  "meetingId": "7b134d1b-8c65-4f32-bbef-8447814b7e80",
  "status": "QUEUED",
  "message": "Meeting processing has been queued."
}
```
- **Error Codes**:
  - `404 Not Found`: Meeting not found.
  - `409 Conflict`: Meeting is already currently processing or already completed.

---

## 2. FastAPI AI Service APIs

The FastAPI service performs video-to-audio extraction using FFmpeg and interfaces with the Google Gemini API. It is designed to be called internally by Spring Boot.

### Base Path
`http://ai-service:8000` (internal Docker hostname) or `http://localhost:8000` (local development).

---

### 2.1 Health & Diagnostics

#### `GET /api/health`
Lightweight AI service health check. Does not call external Gemini APIs.

- **Status Code**: `200 OK`
- **Response**:
```json
{
  "status": "UP",
  "service": "AI Meeting Summarizer AI Service"
}
```

#### `GET /api/health/readiness`
Storage writability probe ensuring `/tmp/meeting-audio` and `/tmp/meeting-video` are accessible.

- **Status Code**: `200 OK`
- **Response**:
```json
{
  "status": "UP",
  "service": "AI Meeting Summarizer AI Service",
  "storage": "READY"
}
```

---

### 2.2 Processing Acknowledgement

#### `POST /api/v1/process`
Acknowledges processing delegation from Spring Boot.

- **Request Body**:
```json
{
  "meeting_id": "7b134d1b-8c65-4f32-bbef-8447814b7e80"
}
```
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "status": "SUCCESS",
  "meeting_id": "7b134d1b-8c65-4f32-bbef-8447814b7e80",
  "message": "Meeting processing initiated"
}
```

---

### 2.3 Media Transcription

#### `POST /api/v1/transcription`
Transcribes an uploaded audio or video file using Gemini 3.5 Transcribe. If a video file (`.mp4` or `.mov`) is supplied, FFmpeg extracts the audio stream into a 16kHz mono WAV file before sending it to Gemini.

- **Request Headers**: `Content-Type: multipart/form-data`
- **Multipart Form Fields**:
  - `file` (*required*): Binary audio (`.mp3`, `.wav`, `.m4a`) or video (`.mp4`, `.mov`).
- **Status Code**: `200 OK`
- **Response Body**:
```json
{
  "success": true,
  "transcript": "Speaker 1 (00:00): Good morning everyone. Today we are reviewing the launch checklist.\nSpeaker 2 (00:15): The payment gateway integration is tested and verified.",
  "language": "en",
  "segments": [
    {
      "speaker": "Speaker 1",
      "text": "Good morning everyone. Today we are reviewing the launch checklist.",
      "start_time": 0.0,
      "end_time": 4.5
    },
    {
      "speaker": "Speaker 2",
      "text": "The payment gateway integration is tested and verified.",
      "start_time": 15.2,
      "end_time": 21.0
    }
  ]
}
```
- **Notes**:
  - `segments`, `speaker`, `start_time`, and `end_time` are extracted when diarization and timestamping succeed, but fallback gracefully if diarization data is absent.

---

### 2.4 Transcript Analysis

#### `POST /api/v1/analyze`
Analyzes raw meeting transcript text using Gemini 2.5 Flash to extract a structured summary, key decisions, and actionable tasks.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "transcript": "The team met to finalize the release plan. Sarah confirmed that backend testing is 100% complete. Alex decided that production deployment will occur on Friday at 9 PM. Alex tasked Maya with drafting the release notes by Thursday."
}
```
- **Constraints**:
  - `transcript`: 1 to 100,000 characters.
- **Status Code**: `200 OK`
- **Response Body**:
```json
{
  "summary": "The team reviewed launch readiness. Backend testing is complete, and production deployment is scheduled for Friday evening.",
  "key_decisions": [
    "Production deployment is scheduled for Friday at 9:00 PM."
  ],
  "action_items": [
    {
      "task": "Draft the release notes",
      "owner": "Maya",
      "deadline": "Thursday"
    }
  ]
}
```
- **Strict Grounding Contract**:
  - The AI prompt explicitly forbids fabricating facts.
  - If a task has no explicitly stated assignee or due date, `owner` and `deadline` are returned as `null`.
  - If no decisions or action items were made, `key_decisions` and `action_items` return as empty arrays `[]`.

---

### 2.5 Gemini Diagnostic Test

#### `POST /api/v1/gemini/test`
Direct verification endpoint for checking that the configured `GEMINI_API_KEY` and model connectivity are operating correctly.

- **Request Body**:
```json
{
  "prompt": "Respond with the word PONG if you receive this message."
}
```
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "status": "SUCCESS",
  "prompt": "Respond with the word PONG if you receive this message.",
  "response": "PONG",
  "model": "gemini-2.5-flash"
}
```
