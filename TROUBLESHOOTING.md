# AI Meeting Summarizer — Troubleshooting & Diagnostics Guide

This guide provides diagnostic steps and solutions for common issues encountered during local development and Docker deployment.

---

## 1. Port Conflicts

### Symptom
`Bind for 0.0.0.0:3000 failed: port is already allocated` or `Address already in use: bind`.

### Default Ports Used by the Stack
- **`3000`**: Frontend web UI (Docker host port)
- **`5173`**: Frontend Vite dev server (Local development)
- **`8080`**: Spring Boot backend
- **`8000`**: FastAPI AI service
- **`5432`**: PostgreSQL database

### Diagnosis & Resolution

#### On Windows:
Find which process is holding the port (e.g. port 8080):
```powershell
Get-NetTCPConnection -LocalPort 8080 | Format-Table OwningProcess, State
Get-Process -Id <OwningProcessId>
Stop-Process -Id <OwningProcessId> -Force
```

#### On Linux / macOS:
```bash
lsof -i :8080
kill -9 <PID>
```

#### Changing Docker Host Ports:
In your `.env` file, remap the conflicting ports:
```env
FRONTEND_PORT=3001
BACKEND_PORT=8081
```

---

## 2. PostgreSQL Connection Failures

### Symptoms
- `Connection to localhost:5432 refused`
- `FATAL: password authentication failed for user "meeting_user"`
- Spring Boot fails to start with `HikariPool-1 - Exception during pool initialization`.

### Common Causes & Fixes
1. **Wrong Hostname in Docker**:
   - Inside Docker containers, Spring Boot must connect to `jdbc:postgresql://db:5432/meeting_summarizer`.
   - Never use `localhost` inside a Docker container when targeting another container.
2. **Database Not Yet Healthy**:
   - Ensure the database container passes its health check (`pg_isready`) before the backend starts.
   - Run `docker compose ps` to inspect container health.
3. **Database Credentials Mismatch**:
   - Verify that `DB_USERNAME` and `DB_PASSWORD` in `.env` match between `db` and `backend`.

---

## 3. FastAPI AI Service Connection Failures

### Symptoms
- Spring Boot logs `AiServiceException: Unable to connect to AI service at http://ai-service:8000`.
- Meeting status changes to `FAILED` immediately during transcription.

### Diagnosis
1. Check if the AI service is running and healthy:
   ```bash
   curl http://localhost:8000/api/health
   # In Docker:
   docker compose exec ai-service curl -f http://localhost:8000/api/health
   ```
2. Verify Spring Boot configuration:
   - In Docker Compose: `AI_SERVICE_URL=http://ai-service:8000`
   - In Local Development: `AI_SERVICE_URL=http://localhost:8000`

---

## 4. Google Gemini API Issues

### Symptoms
- `GeminiServiceError: GEMINI_API_KEY environment variable is not set.`
- HTTP 403 / 401: Invalid API key or quota exceeded.
- Processing fails during `ANALYZING` stage.

### Resolution
1. Verify your key is active in [Google AI Studio](https://aistudio.google.com/).
2. Confirm your `.env` contains:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
3. Test Gemini connectivity directly via the diagnostic endpoint:
   ```bash
   curl -X POST http://localhost:8000/api/v1/gemini/test \
     -H "Content-Type: application/json" \
     -d "{\"prompt\":\"Respond with PONG\"}"
   ```
   If successful, it returns `{"status":"SUCCESS", "response":"PONG"}`.

---

## 5. FFmpeg Audio Extraction Failures (Video Uploads)

### Symptoms
- Uploading an MP4 or MOV file results in `MediaProcessingError: FFmpeg extraction failed`.
- `ffmpeg: command not found`.

### Resolution
1. **In Docker**:
   Verify FFmpeg is properly installed inside the container:
   ```bash
   docker compose exec ai-service ffmpeg -version
   ```
2. **In Local Development**:
   - Ensure FFmpeg is installed and added to your system `PATH`.
   - Test by running `ffmpeg -version` in a new terminal window.
3. **Audio-Less Video Files**:
   - Videos that do not contain an audio stream will be rejected because transcription requires audio.

---

## 6. Frontend 404 on Page Refresh (React SPA Routing)

### Symptom
Navigating to `/meetings` or `/settings` works, but refreshing the browser causes an Nginx `404 Not Found` error.

### Resolution
Ensure your `frontend/nginx.conf` has the single-page application fallback:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
This guarantees that all client-side paths route to `index.html`.

---

## 7. Upload Fails for Files Near 100 MB

### Symptoms
- HTTP 413 Request Entity Too Large.
- Upload stops immediately without reaching Spring Boot.

### Resolution
File uploads pass through multiple layers, each of which enforces a size ceiling:
1. **Nginx Reverse Proxy**: `client_max_body_size 110M;` (in `frontend/nginx.conf`).
2. **Spring Boot**:
   - `spring.servlet.multipart.max-file-size=100MB`
   - `spring.servlet.multipart.max-request-size=105MB`
3. **FastAPI**: `MAX_AUDIO_FILE_SIZE_MB=100`

---

## 8. Asynchronous Processing Stoppage or Interruption

### Symptom
A meeting gets stuck in `TRANSCRIBING` or `ANALYZING` indefinitely.

### Explanation & Recovery
- The Spring Boot backend processes meetings asynchronously using in-memory background worker threads.
- If the backend service or container restarts while a meeting is processing, the in-memory task is terminated.
- **Recovery**: You can retry processing a failed or interrupted meeting by clicking the retry button on the Meeting Details page or calling:
  ```bash
  curl -X POST http://localhost:8080/api/meetings/{id}/process
  ```

---

## 9. Persistent Database Reset vs Normal Shutdown

### Symptom
All meetings, transcripts, and summaries vanished after restarting containers.

### Cause
- Running `docker compose down` safely stops containers and **preserves** the `postgres_data` volume.
- Running `docker compose down -v` explicitly **destroys** the named volume and erases all database records.

---

## 10. Clean Rebuild from Scratch

If you suspect stale Docker image layers or corrupted state:
```bash
# 1. Stop all containers
docker compose down

# 2. Rebuild images from scratch without using cached layers
docker compose build --no-cache

# 3. Start fresh containers in detached mode
docker compose up -d

# 4. Verify all services are healthy
docker compose ps
```
