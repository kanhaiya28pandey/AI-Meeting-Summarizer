import io
import os
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.schemas.transcription import TranscriptSegment, TranscriptionResponse
from app.services.transcription_service import TranscriptionService, parse_offset
from app.utils.exceptions import InvalidAudioFileException, TranscriptionException

client = TestClient(app)


def test_parse_offset():
    assert parse_offset("0.100s") == 0.100
    assert parse_offset("1.5s") == 1.5
    assert parse_offset("10") == 10.0
    assert parse_offset(4.2) == 4.2
    assert parse_offset(None) is None
    assert parse_offset("invalid") is None


def test_transcription_valid_mp3():
    mock_response = TranscriptionResponse(
        success=True,
        transcript="Hello team, welcome to the quarterly planning meeting.",
        language="en",
        segments=[
            TranscriptSegment(speaker="spk_1", text="Hello team, welcome to the quarterly planning meeting.", start_time=0.0, end_time=4.2)
        ]
    )

    with patch("app.api.routes.transcription.transcription_service.transcribe_audio", return_value=mock_response):
        audio_bytes = b"fake-mp3-audio-data"
        response = client.post(
            "/api/v1/transcription",
            files={"file": ("meeting.mp3", io.BytesIO(audio_bytes), "audio/mpeg")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["transcript"] == "Hello team, welcome to the quarterly planning meeting."
        assert data["language"] == "en"
        assert len(data["segments"]) == 1
        assert data["segments"][0]["speaker"] == "spk_1"
        assert data["segments"][0]["start_time"] == 0.0
        assert data["segments"][0]["end_time"] == 4.2


def test_transcription_valid_wav():
    mock_response = TranscriptionResponse(
        success=True,
        transcript="WAV audio transcription test.",
        language="en",
        segments=[]
    )

    with patch("app.api.routes.transcription.transcription_service.transcribe_audio", return_value=mock_response):
        response = client.post(
            "/api/v1/transcription",
            files={"file": ("meeting.wav", io.BytesIO(b"fake-wav-data"), "audio/wav")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["transcript"] == "WAV audio transcription test."


def test_transcription_valid_m4a():
    mock_response = TranscriptionResponse(
        success=True,
        transcript="M4A audio transcription test.",
        language="en",
        segments=[]
    )

    with patch("app.api.routes.transcription.transcription_service.transcribe_audio", return_value=mock_response):
        response = client.post(
            "/api/v1/transcription",
            files={"file": ("meeting.m4a", io.BytesIO(b"fake-m4a-data"), "audio/mp4")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["transcript"] == "M4A audio transcription test."


def test_transcription_unsupported_file_extension():
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("notes.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")}
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "Unsupported" in data["error"]


def test_transcription_unsupported_mime_type():
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("meeting.mp3", io.BytesIO(b"not-really-audio"), "text/plain")}
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "Unsupported" in data["error"]


def test_transcription_empty_file(tmp_path):
    empty_file = tmp_path / "empty.mp3"
    empty_file.write_bytes(b"")

    service = TranscriptionService()
    with pytest.raises(InvalidAudioFileException) as exc_info:
        service.validate_audio_file(str(empty_file), "empty.mp3", "audio/mpeg")
    assert "empty" in exc_info.value.detail.lower()


def test_transcription_oversized_file(tmp_path):
    test_file = tmp_path / "large.mp3"
    test_file.write_bytes(b"x" * 1024)

    service = TranscriptionService()
    with patch.object(settings, "MAX_AUDIO_FILE_SIZE_MB", 0):
        from app.utils.exceptions import AudioFileTooLargeException
        with pytest.raises(AudioFileTooLargeException):
            service.validate_audio_file(str(test_file), "large.mp3", "audio/mpeg")


def test_transcription_gemini_failure():
    with patch(
        "app.api.routes.transcription.transcription_service.transcribe_audio",
        side_effect=TranscriptionException("Transcription service is temporarily unavailable", status_code=503)
    ):
        response = client.post(
            "/api/v1/transcription",
            files={"file": ("meeting.mp3", io.BytesIO(b"audio-bytes"), "audio/mpeg")}
        )
        assert response.status_code == 503
        data = response.json()
        assert data["success"] is False
        assert "temporarily unavailable" in data["error"]


def test_transcription_temp_file_cleanup_on_success(tmp_path):
    captured_paths = []

    def fake_transcribe(file_path, original_filename, declared_mime):
        captured_paths.append(file_path)
        assert Path(file_path).exists()
        return TranscriptionResponse(success=True, transcript="Cleaned up text", segments=[])

    with patch("app.api.routes.transcription.transcription_service.transcribe_audio", side_effect=fake_transcribe):
        response = client.post(
            "/api/v1/transcription",
            files={"file": ("test.mp3", io.BytesIO(b"audio-data"), "audio/mpeg")}
        )
        assert response.status_code == 200

    assert len(captured_paths) == 1
    assert not Path(captured_paths[0]).exists()


def test_transcription_temp_file_cleanup_on_failure(tmp_path):
    captured_paths = []

    def fake_transcribe(file_path, original_filename, declared_mime):
        captured_paths.append(file_path)
        assert Path(file_path).exists()
        raise TranscriptionException("Downstream error", status_code=503)

    with patch("app.api.routes.transcription.transcription_service.transcribe_audio", side_effect=fake_transcribe):
        response = client.post(
            "/api/v1/transcription",
            files={"file": ("test.mp3", io.BytesIO(b"audio-data"), "audio/mpeg")}
        )
        assert response.status_code == 503

    assert len(captured_paths) == 1
    assert not Path(captured_paths[0]).exists()


def test_transcription_diarization_parsing():
    mock_candidate = MagicMock()
    mock_part = MagicMock()
    mock_audio_trans = MagicMock()
    mock_audio_trans.speaker_label = "spk_1"

    w1 = MagicMock(word="Hello", start_offset="0.100s", end_offset="0.400s")
    w2 = MagicMock(word="world", start_offset="0.450s", end_offset="0.800s")
    mock_audio_trans.words = [w1, w2]
    mock_part.audio_transcription = mock_audio_trans
    mock_candidate.content.parts = [mock_part]

    mock_response = MagicMock()
    mock_response.text = "Hello world"
    mock_response.candidates = [mock_candidate]
    mock_response.language = "en"

    service = TranscriptionService()
    segments = service._parse_segments(mock_response)
    assert len(segments) == 1
    assert segments[0].speaker == "spk_1"
    assert segments[0].text == "Hello world"
    assert segments[0].start_time == 0.1
    assert segments[0].end_time == 0.8


def test_transcription_missing_speaker_and_timestamps():
    segment = TranscriptSegment(
        speaker=None,
        text="Simple text without speaker or timing",
        start_time=None,
        end_time=None
    )
    assert segment.speaker is None
    assert segment.start_time is None
    assert segment.end_time is None
    assert segment.text == "Simple text without speaker or timing"


@pytest.mark.skipif(
    not (os.environ.get("RUN_LIVE_GEMINI_TEST") == "true" and os.environ.get("GEMINI_API_KEY")),
    reason="Live Gemini API test requires RUN_LIVE_GEMINI_TEST=true and GEMINI_API_KEY set"
)
def test_live_transcription_opt_in():
    service = TranscriptionService()
    assert service.model == "gemini-3.5-transcribe"


def test_normalize_speaker_labels():
    from app.services.transcription_service import normalize_speaker
    assert normalize_speaker("spk_0") == "Speaker 1"
    assert normalize_speaker("spk_1") == "Speaker 2"
    assert normalize_speaker("speaker_2") == "Speaker 3"
    assert normalize_speaker("0") == "Speaker 1"
    assert normalize_speaker("Alice") == "Alice"
    assert normalize_speaker("") is None
    assert normalize_speaker(None) is None


def test_build_speaker_transcript():
    from app.services.transcription_service import build_speaker_transcript
    segs = [
        TranscriptSegment(speaker="spk_0", text="Hello team."),
        TranscriptSegment(speaker="spk_0", text="Welcome to the sprint demo."),
        TranscriptSegment(speaker="spk_1", text="Thanks for organizing."),
    ]
    result = build_speaker_transcript(segs)
    expected = "Speaker 1: Hello team. Welcome to the sprint demo.\n\nSpeaker 2: Thanks for organizing."
    assert result == expected

