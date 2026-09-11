# AI Meeting Summarizer — Docker & Containerization Guide

This guide provides instructions for building, running, and managing the AI Meeting Summarizer using Docker and Docker Compose.

---

## 1. Architecture Overview

The containerized stack runs as four cohesive services isolated within a private bridge network (`meeting-network`). Only the web interface (port `3000`) and the optional backend API (port `8080`) are exposed to the host machine.

```text
                                  INTERNET / BROWSER
                                          │
                                          ▼
                                ┌──────────────────┐
                                │   React + Nginx  │
                                │   frontend:80    │ (Host: 3000)
                                └────────┬─────────┘
                                         │ /api
                                         ▼
                                ┌──────────────────┐
                                │   Spring Boot    │
                                │   backend:8080   │ (Host: 8080)
                                └──────┬─────┬─────┘
                                       │     │
                              JDBC     │     │ HTTP
                                       │     │
                                       ▼     ▼
                              ┌──────────┐  ┌────────────────┐
                              │PostgreSQL│  │    FastAPI     │
                              │db:5432   │  │ai-service:8000 │
                              └──────────┘  └───────┬────────┘
                              (Volume:              │
                            postgres_data)          │ FFmpeg
                                                    ▼
                                             Audio Extraction
                                                    │
                                                    ▼
                                            Google Gemini API
                                            (External HTTPS)
```

---

## 2. Prerequisites

To run the containerized stack, you only need:
- [Docker Engine](https://docs.docker.com/engine/install/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.20+)
- A [Google Gemini API Key](https://aistudio.google.com/) for live AI transcription and analysis

You **do not** need local installations of Java, Maven, Python, Node.js, FFmpeg, or PostgreSQL.

---

## 3. Quick Start

### Step 1: Clone the repository
```bash
git clone https://github.com/kanhaiya28pandey/AI-Meeting-Summarizer.git
cd AI-Meeting-Summarizer
```

### Step 2: Configure environment variables
Copy the environment template and insert your Gemini API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
DB_USERNAME=meeting_user
DB_PASSWORD=change_me
POSTGRES_DB=meeting_summarizer

# Paste your Gemini API key:
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TRANSCRIPTION_MODEL=gemini-3.5-transcribe
```

### Step 3: Build and start the application
```bash
docker compose up --build
```
Or start in the background (detached mode):
```bash
docker compose up -d --build
```

### Step 4: Access the application
- **Web UI**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 4. Service Breakdown

| Service | Technology | Internal Port | Host Port | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`frontend`** | React 19, Vite, Nginx 1.27 | `80` | `3000` | Serves compiled SPA assets, proxies `/api/*` requests to backend |
| **`backend`** | Spring Boot 4, Java 21 | `8080` | `8080` | Meeting management, async processing coordinator, JPA persistence |
| **`ai-service`**| FastAPI, Python 3.13, FFmpeg | `8000` | Internal | Audio extraction (FFmpeg) and Gemini transcription & analysis |
| **`db`** | PostgreSQL 18 | `5432` | Internal | Persistent relational storage for meeting records and summaries |

---

## 5. Key Docker Commands

### Starting & Stopping

- **Start all containers in detached mode**:
  ```bash
  docker compose up -d
  ```

- **Rebuild and restart containers**:
  ```bash
  docker compose up -d --build
  ```

- **Clean rebuild without cache**:
  ```bash
  docker compose build --no-cache
  docker compose up -d
  ```

- **Stop all containers (preserves database data)**:
  ```bash
  docker compose down
  ```

- **Stop all containers and DELETE persistent database data**:
  ```bash
  docker compose down -v
  ```
  > **WARNING**: Running `docker compose down -v` deletes the `postgres_data` volume and removes all saved meetings, transcripts, and summaries.

### Inspection & Monitoring

- **Check container health and status**:
  ```bash
  docker compose ps
  ```

- **View live streaming logs from all services**:
  ```bash
  docker compose logs -f
  ```

- **View logs for a specific service**:
  ```bash
  docker compose logs -f backend
  docker compose logs -f ai-service
  docker compose logs -f frontend
  docker compose logs -f db
  ```

- **Restart a single service**:
  ```bash
  docker compose restart backend
  ```

- **Rebuild a single service**:
  ```bash
  docker compose build backend
  docker compose up -d backend
  ```

### Interactive Shell / Diagnostics

- **Open a shell inside the backend container**:
  ```bash
  docker compose exec backend sh
  ```

- **Verify FFmpeg inside the AI service**:
  ```bash
  docker compose exec ai-service ffmpeg -version
  ```

- **Connect directly to PostgreSQL**:
  ```bash
  docker compose exec db psql -U meeting_user -d meeting_summarizer
  ```

---

## 6. Local Development vs. Docker Workflow

| Aspect | Local Development | Docker Compose |
| :--- | :--- | :--- |
| **Frontend Base URL** | `http://localhost:8080/api` | Relative `/api` (proxied by Nginx) |
| **Frontend Server** | Vite Dev Server (`localhost:5173`) | Nginx Alpine (`localhost:3000`) |
| **Backend AI Endpoint** | `http://localhost:8000` | `http://ai-service:8000` |
| **Backend Database** | `localhost:5432` | `db:5432` |
| **FFmpeg Requirement** | Local Windows/Linux binary | Installed in `ai-service` container |

---

## 7. Storage, Volumes & Lifecycle

1. **Database Persistence**:
   - PostgreSQL files are stored in the named Docker volume `postgres_data`.
   - Data persists across `docker compose down` and `docker compose up`.
   - Data is deleted only when explicitly executing `docker compose down -v`.

2. **Ephemeral Media Storage**:
   - Uploaded media files and extracted audio streams are stored in container-local temporary directories (`/tmp/meeting-uploads`, `/tmp/meeting-audio`, `/tmp/meeting-video`).
   - All media files are cleaned up immediately following transcription and analysis. No large binaries are permanently stored.

3. **In-Process Task Limitation**:
   - The Spring Boot backend processes meetings asynchronously using in-memory background worker threads.
   - Restarting the backend container while a meeting is currently processing will interrupt that specific job. Completed meetings remain safe in PostgreSQL.

---

## 8. Troubleshooting

### Port Conflicts
- If port `3000` or `8080` is already in use on your host, configure different host ports in `.env`:
  ```env
  FRONTEND_PORT=3001
  BACKEND_PORT=8081
  ```

### Missing or Invalid Gemini API Key
- If AI analysis fails or returns an error, verify that `GEMINI_API_KEY` is correctly defined in `.env`.
- Check AI service logs:
  ```bash
  docker compose logs ai-service
  ```

### Nginx SPA Route 404s
- The custom `nginx.conf` includes `try_files $uri $uri/ /index.html;`. Direct navigation or page refreshes on `/meetings`, `/settings`, or `/meetings/:id` will cleanly render the React application.

### Upload Fails for Files Near 100 MB
- `nginx.conf` sets `client_max_body_size 110M;` to accommodate 100 MB files plus multipart boundaries.
- Spring Boot sets `spring.servlet.multipart.max-file-size=100MB`.

### Resetting to a Clean State
If you encounter persistent issues due to stale cache:
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

For more in-depth solutions to database connection issues, timeouts, and port conflicts, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
