# AI Meeting Summarizer

AI-powered meeting intelligence platform built using React + TypeScript, Spring Boot, FastAPI, PostgreSQL, and Google Gemini.

## Architecture

```text
React (Vite + TypeScript)
       │
       ▼ HTTP (REST / Multipart)
Spring Boot (Java 21 + Spring Data JPA)
  │                      │
  ▼                      ▼ HTTP
PostgreSQL (18+)       FastAPI AI Service (Python 3.14)
                         │ (FFmpeg audio extraction for MP4/MOV)
                         ▼
                       Google Gemini API
                       - Gemini 3.5 Transcribe (Audio Transcription)
                       - Gemini 2.5 Flash (Structured Meeting Analysis)
```

## Features

- **Media Upload**: Supports audio (`MP3`, `WAV`, `M4A`) and video (`MP4`, `MOV`) files up to 100 MB.
- **Audio Extraction**: Automated audio extraction for video meetings using FFmpeg in the AI service.
- **Speech-to-Text Transcription**: High-accuracy transcription with speaker diarization and timestamps powered by Gemini 3.5 Transcribe.
- **Intelligent Meeting Analysis**: Automatic extraction of executive summaries, confirmed key decisions, and action items with assignees and deadlines.
- **Asynchronous Processing Pipeline**: Fast `202 Accepted` response with real-time stage tracking: `UPLOADED` → `TRANSCRIBING` → `ANALYZING` → `SAVING` → `COMPLETED` / `FAILED`.
- **Meeting Management & History**: Interactive dashboard to view, search, filter, navigate, and delete meeting records with confirmation dialogs.
- **Modern UI**: Clean, responsive, and accessible interface built with modern CSS variables, semantic HTML, and ARIA attributes.

## Project Structure

- `frontend/`: React + TypeScript application built with Vite and React Router.
- `backend/`: Spring Boot 4.1 backend with PostgreSQL persistence, asynchronous task execution, and REST APIs.
- `ai-service/`: FastAPI microservice encapsulating FFmpeg audio extraction and Google Gemini integrations.

## Security & Reliability Hardening

- **Security Headers & CORS**: Explicit security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`) and strict origin/method/header CORS controls.
- **Request Tracing & Correlation**: `X-Request-ID` propagation across React, Spring Boot, and FastAPI with validation against `^[a-zA-Z0-9_-]{1,64}$`.
- **Input Validation & Sanitization**:
  - Filename sanitization against path traversal (`..`, slashes) and command injection vectors with canonical path verification.
  - Multi-layer file size limits (100 MB max upload, streaming chunk rejection, empty file rejection).
  - Bounded Pydantic/JPA schemas to prevent resource exhaustion and oversized payloads.
- **Safe Subprocess Execution**: Subprocess execution with `shell=False` and strict parameter array invocation with configurable timeouts.
- **Prompt Injection Defenses**: Strict delimiters and adversarial instruction negation ensuring Gemini treats transcripts strictly as untrusted data.
- **Thread Safety**: Concurrent duplicate worker prevention via thread-safe in-memory execution guards.
- **Readiness Probes**: Dedicated `/api/health/readiness` endpoints validating real upstream dependencies (PostgreSQL database connection pool and storage readiness).
- **Frontend Error Resilience**: Top-level React error boundaries providing user-friendly fallback UI without leaking internal stack traces or technical details.

## Prerequisites

- Java 21+ & Maven wrapper (included)
- Python 3.13+
- Node.js 20+ & npm
- PostgreSQL 16+
- FFmpeg (installed and available in system PATH or configured via `FFMPEG_PATH`)
- Google Gemini API Key (`GEMINI_API_KEY`)

