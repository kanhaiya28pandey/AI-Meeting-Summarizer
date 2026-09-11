FROM python:3.13-slim

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install runtime dependencies: FFmpeg for video processing and curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system group and user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/sh -m appuser

WORKDIR /app

# Pre-create and set permissions on temporary media directories
RUN mkdir -p /tmp/meeting-audio /tmp/meeting-video && \
    chown -R appuser:appgroup /tmp/meeting-audio /tmp/meeting-video && \
    chmod 750 /tmp/meeting-audio /tmp/meeting-video

# Copy dependencies first for efficient Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY app ./app

# Ensure ownership belongs to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

ENV HOST=0.0.0.0 \
    PORT=8000 \
    TEMP_AUDIO_DIR=/tmp/meeting-audio \
    TEMP_VIDEO_DIR=/tmp/meeting-video \
    FFMPEG_PATH=ffmpeg

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
