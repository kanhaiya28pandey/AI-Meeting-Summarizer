import io
import os
import subprocess
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.transcription import TranscriptionResponse
from app.services.ffmpeg_service import FFmpegService
from app.services.media_service import MediaService
from app.utils.exceptions import (
    ExtractedAudioTooLargeException,
    FFmpegUnavailableException,
    InvalidAudioFileException,
    MediaExtractionException,
    MediaProcessingTimeoutException,
    NoAudioTrackException,
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. Media Format Detection Tests
# ---------------------------------------------------------------------------

def test_media_format_detection_audio():
    media_svc = MediaService()
    assert media_svc.get_media_type("meeting.mp3") == "audio"
    assert media_svc.get_media_type("meeting.wav") == "audio"
    assert media_svc.get_media_type("meeting.m4a") == "audio"
    assert media_svc.get_media_type("MEETING.MP3") == "audio"
    assert media_svc.is_audio("meeting.mp3") is True
    assert media_svc.is_video("meeting.mp3") is False


def test_media_format_detection_video():
    media_svc = MediaService()
    assert media_svc.get_media_type("meeting.mp4") == "video"
    assert media_svc.get_media_type("meeting.mov") == "video"
    assert media_svc.get_media_type("MEETING.MP4") == "video"
    assert media_svc.get_media_type("MEETING.MOV") == "video"
    assert media_svc.is_video("meeting.mp4") is True
    assert media_svc.is_audio("meeting.mp4") is False


def test_media_format_detection_unsupported():
    media_svc = MediaService()
    unsupported = ["meeting.avi", "meeting.mkv", "meeting.webm", "file.pdf", "file.txt"]
    for filename in unsupported:
        with pytest.raises(InvalidAudioFileException):
            media_svc.get_media_type(filename)


# ---------------------------------------------------------------------------
# 2. FFmpeg Service Unit Tests (Mocked Subprocess)
# ---------------------------------------------------------------------------

def test_ffmpeg_service_missing_input_file(tmp_path):
    svc = FFmpegService()
    non_existent = str(tmp_path / "missing.mp4")
    out = str(tmp_path / "out.wav")
    with pytest.raises(MediaExtractionException, match="Input video file does not exist"):
        svc.extract_audio(non_existent, out)


def test_ffmpeg_service_successful_extraction(tmp_path):
    video = tmp_path / "test.mp4"
    video.write_bytes(b"dummy video data")
    out = tmp_path / "out.wav"

    svc = FFmpegService()

    def mock_run(cmd, *args, **kwargs):
        # Simulate FFmpeg writing an output WAV file
        out.write_bytes(b"RIFF" + b"\x00" * 100)
        mock_res = MagicMock()
        mock_res.returncode = 0
        mock_res.stderr = b""
        return mock_res

    with patch.object(svc, "is_available", return_value=True):
        with patch("subprocess.run", side_effect=mock_run) as mock_subproc:
            result = svc.extract_audio(str(video), str(out))
            assert result == str(out)
            assert out.exists()
            assert mock_subproc.called
            # Ensure shell=False is strictly enforced
            assert mock_subproc.call_args.kwargs.get("shell") is False


def test_ffmpeg_service_non_zero_exit_corrupt_video(tmp_path):
    video = tmp_path / "corrupt.mp4"
    video.write_bytes(b"corrupt")
    out = tmp_path / "out.wav"

    svc = FFmpegService()

    mock_res = MagicMock()
    mock_res.returncode = 1
    mock_res.stderr = b"Invalid data found when processing input"

    with patch.object(svc, "is_available", return_value=True):
        with patch("subprocess.run", return_value=mock_res):
            with pytest.raises(MediaExtractionException):
                svc.extract_audio(str(video), str(out))
            assert not out.exists()


def test_ffmpeg_service_no_audio_stream(tmp_path):
    video = tmp_path / "no_audio.mp4"
    video.write_bytes(b"video with no audio")
    out = tmp_path / "out.wav"

    svc = FFmpegService()

    mock_res = MagicMock()
    mock_res.returncode = 1
    mock_res.stderr = b"Stream map '0:a:0' matches no streams"

    with patch.object(svc, "is_available", return_value=True):
        with patch("subprocess.run", return_value=mock_res):
            with pytest.raises(NoAudioTrackException):
                svc.extract_audio(str(video), str(out))
            assert not out.exists()


def test_ffmpeg_service_timeout(tmp_path):
    video = tmp_path / "long.mp4"
    video.write_bytes(b"long video")
    out = tmp_path / "out.wav"

    svc = FFmpegService()

    with patch.object(svc, "is_available", return_value=True):
        with patch("subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="ffmpeg", timeout=10)):
            with pytest.raises(MediaProcessingTimeoutException):
                svc.extract_audio(str(video), str(out))
            assert not out.exists()


def test_ffmpeg_service_missing_executable(tmp_path):
    video = tmp_path / "video.mp4"
    video.write_bytes(b"video")
    out = tmp_path / "out.wav"

    svc = FFmpegService()

    with patch.object(svc, "is_available", return_value=False):
        with pytest.raises(FFmpegUnavailableException):
            svc.extract_audio(str(video), str(out))


def test_ffmpeg_service_extracted_audio_too_large(tmp_path):
    video = tmp_path / "video.mp4"
    video.write_bytes(b"video")
    out = tmp_path / "out.wav"

    svc = FFmpegService()

    def mock_run(cmd, *args, **kwargs):
        # Create file exceeding limit
        out.write_bytes(b"X" * 1000)
        mock_res = MagicMock()
        mock_res.returncode = 0
        mock_res.stderr = b""
        return mock_res

    with patch.object(svc, "is_available", return_value=True):
        with patch("subprocess.run", side_effect=mock_run):
            with patch("app.core.config.Settings.max_extracted_audio_size_bytes", new_callable=lambda: property(lambda self: 500)):
                with pytest.raises(ExtractedAudioTooLargeException):
                    svc.extract_audio(str(video), str(out))
                assert not out.exists()


# ---------------------------------------------------------------------------
# 3. MediaService Workflow Tests
# ---------------------------------------------------------------------------

def test_media_service_audio_bypass(tmp_path):
    audio = tmp_path / "test.mp3"
    audio.write_bytes(b"audio data")

    svc = MediaService()
    transcribe_path, cleanup_path, eff_name = svc.prepare_audio_for_transcription(
        str(audio), "test.mp3"
    )
    assert transcribe_path == str(audio)
    assert cleanup_path is None
    assert eff_name == "test.mp3"


def test_media_service_video_workflow(tmp_path):
    video = tmp_path / "test.mp4"
    video.write_bytes(b"video data")

    mock_ffmpeg = MagicMock(spec=FFmpegService)
    mock_ffmpeg.extract_audio.side_effect = lambda video_path, output_audio_path: output_audio_path

    svc = MediaService(ffmpeg_svc=mock_ffmpeg)
    transcribe_path, cleanup_path, eff_name = svc.prepare_audio_for_transcription(
        str(video), "test.mp4"
    )

    assert mock_ffmpeg.extract_audio.called
    assert transcribe_path.endswith(".wav")
    assert cleanup_path == transcribe_path
    assert eff_name.endswith(".wav")


# ---------------------------------------------------------------------------
# 4. Transcription API Endpoint Integration with Video & Audio
# ---------------------------------------------------------------------------

@patch("app.services.transcription_service.transcription_service.transcribe_audio")
def test_transcription_endpoint_with_audio_success(mock_transcribe):
    mock_transcribe.return_value = TranscriptionResponse(
        success=True,
        transcript="Hello audio meeting.",
        language="en",
        segments=[],
    )

    fake_file = io.BytesIO(b"fake audio data")
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("meeting.mp3", fake_file, "audio/mpeg")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["transcript"] == "Hello audio meeting."
    assert mock_transcribe.called


@patch("app.services.transcription_service.transcription_service.transcribe_audio")
@patch("app.services.media_service.media_service.prepare_audio_for_transcription")
def test_transcription_endpoint_with_video_success(mock_prepare, mock_transcribe, tmp_path):
    dummy_wav = tmp_path / "extracted.wav"
    dummy_wav.write_bytes(b"dummy wav")

    mock_prepare.return_value = (str(dummy_wav), str(dummy_wav), "extracted.wav")
    mock_transcribe.return_value = TranscriptionResponse(
        success=True,
        transcript="Hello video meeting.",
        language="en",
        segments=[],
    )

    fake_file = io.BytesIO(b"fake video data")
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("meeting.mp4", fake_file, "video/mp4")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["transcript"] == "Hello video meeting."
    assert mock_prepare.called
    assert mock_transcribe.called


@patch("app.services.media_service.media_service.prepare_audio_for_transcription")
def test_transcription_endpoint_video_no_audio_error(mock_prepare):
    mock_prepare.side_effect = NoAudioTrackException()

    fake_file = io.BytesIO(b"video without audio")
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("silent.mp4", fake_file, "video/mp4")},
    )

    assert response.status_code == 400
    data = response.json()
    assert "does not contain an audio track" in data["detail"]


@patch("app.services.media_service.media_service.prepare_audio_for_transcription")
def test_transcription_endpoint_ffmpeg_unavailable_error(mock_prepare):
    mock_prepare.side_effect = FFmpegUnavailableException()

    fake_file = io.BytesIO(b"video")
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("meeting.mp4", fake_file, "video/mp4")},
    )

    assert response.status_code == 503
    data = response.json()
    assert "Video processing is currently unavailable" in data["detail"]


def test_transcription_endpoint_unsupported_video_format():
    fake_file = io.BytesIO(b"video")
    response = client.post(
        "/api/v1/transcription",
        files={"file": ("meeting.avi", fake_file, "video/x-msvideo")},
    )

    assert response.status_code == 422
    data = response.json()
    assert "Unsupported file format" in data["detail"]
