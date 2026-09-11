import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.schemas.analysis import MeetingAnalysisResponse, ActionItem

client = TestClient(app)


def test_security_headers_and_request_id():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert "X-Request-ID" in response.headers


def test_custom_safe_request_id():
    response = client.get("/api/health", headers={"X-Request-ID": "custom-trace-12345"})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == "custom-trace-12345"


def test_malformed_request_id_replaced():
    response = client.get("/api/health", headers={"X-Request-ID": "evil\r\nHeader: injected"})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") != "evil\r\nHeader: injected"


def test_health_readiness_endpoint():
    response = client.get("/api/health/readiness")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["storage"] == "READY"


def test_direct_empty_file_upload_rejected():
    empty_file = io.BytesIO(b"")
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("meeting.mp3", empty_file, "audio/mpeg")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_direct_oversized_file_upload_rejected(monkeypatch):
    # Temporarily set MAX_AUDIO_FILE_SIZE_MB to 1 MB for testing
    monkeypatch.setattr(settings, "MAX_AUDIO_FILE_SIZE_MB", 1)

    # 1.5 MB chunk
    large_data = b"0" * (1500 * 1024)
    file_obj = io.BytesIO(large_data)
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("large_meeting.mp3", file_obj, "audio/mpeg")}
    )
    assert response.status_code == 413
    assert "too large" in response.json()["detail"].lower()


def test_path_traversal_filename_sanitized(monkeypatch):
    from app.services.transcription_service import transcription_service
    from app.schemas.transcription import TranscriptionResponse
    monkeypatch.setattr(
        transcription_service,
        "transcribe_audio",
        lambda file_path, original_filename, declared_mime: TranscriptionResponse(
            success=True,
            transcript="Traversed safe transcript",
            language="en",
            segments=[]
        )
    )
    # Attempt filename with traversal
    content = io.BytesIO(b"fake audio data")
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("../../../../etc/shadow.wav", content, "audio/wav")}
    )
    assert response.status_code == 200
    assert response.json()["transcript"] == "Traversed safe transcript"


def test_meeting_analysis_output_bounds():
    # Valid output
    valid = MeetingAnalysisResponse(
        summary="A concise summary within limits.",
        key_decisions=["Decision 1"],
        action_items=[ActionItem(task="Do testing", owner="Rahul", deadline="Friday")]
    )
    assert len(valid.summary) > 0

    # Oversized summary (> 5000 chars) should fail validation
    with pytest.raises(Exception):
        MeetingAnalysisResponse(
            summary="A" * 5001,
            key_decisions=[],
            action_items=[]
        )

    # Oversized action item task (> 1000 chars) should fail validation
    with pytest.raises(Exception):
        MeetingAnalysisResponse(
            summary="Valid summary",
            key_decisions=[],
            action_items=[ActionItem(task="A" * 1001)]
        )
