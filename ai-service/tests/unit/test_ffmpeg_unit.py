import subprocess
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

from app.services.ffmpeg_service import FFmpegService
from app.utils.exceptions import (
    FFmpegUnavailableException,
    MediaExtractionException,
    MediaProcessingTimeoutException,
    NoAudioTrackException,
    ExtractedAudioTooLargeException,
)

def test_command_array_construction_and_no_shell(tmp_path):
    """Verify that FFmpeg command is constructed as an argument array and shell=False is enforced."""
    video_file = tmp_path / "meeting.mp4"
    video_file.write_bytes(b"dummy video")
    output_audio = tmp_path / "audio.wav"

    service = FFmpegService(ffmpeg_path="ffmpeg")
    with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
        with patch("subprocess.run") as mock_run:
            mock_proc = MagicMock()
            mock_proc.returncode = 0
            mock_run.return_value = mock_proc

            output_audio.write_bytes(b"dummy wav")

            service.extract_audio(str(video_file), str(output_audio))

            mock_run.assert_called_once()
            called_args, called_kwargs = mock_run.call_args

            cmd_array = called_args[0]
            assert isinstance(cmd_array, list)
            assert cmd_array[0] == "ffmpeg"
            assert "-i" in cmd_array
            assert "-vn" in cmd_array
            assert "-acodec" in cmd_array
            assert "pcm_s16le" in cmd_array
            assert "-ar" in cmd_array
            assert "16000" in cmd_array
            assert "-ac" in cmd_array
            assert "1" in cmd_array
            assert called_kwargs.get("shell") is False

def test_command_injection_characters_in_filename(tmp_path):
    """
    Verify that malicious characters in filenames (;, &&, ||, $, `, ', \")
    are passed safely in argument array without shell execution.
    """
    malicious_filename = 'meeting;rm -rf;$(whoami)&&evil`calc`\'test".mp4'
    mock_video_path = f"/mock/temp/videos/{malicious_filename}"
    output_audio = tmp_path / "safe.wav"

    service = FFmpegService(ffmpeg_path="ffmpeg")
    with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
        with patch.object(Path, "exists", return_value=True):
            with patch.object(Path, "is_file", return_value=True):
                with patch("subprocess.run") as mock_run:
                    mock_proc = MagicMock()
                    mock_proc.returncode = 0
                    mock_run.return_value = mock_proc
                    output_audio.write_bytes(b"dummy wav")

                    service.extract_audio(mock_video_path, str(output_audio))

                    mock_run.assert_called_once()
                    cmd_array = mock_run.call_args[0][0]
                    # Verify the filename is preserved as a single literal element in the array
                    assert str(Path(mock_video_path)) in cmd_array
                    # Verify shell is strictly False
                    assert mock_run.call_args[1].get("shell") is False

def test_timeout_triggers_cleanup_and_exception(tmp_path):
    """Verify that FFmpeg extraction timeout cleans up partial files and raises MediaProcessingTimeoutException."""
    video_file = tmp_path / "timeout.mp4"
    video_file.write_bytes(b"dummy video")
    output_audio = tmp_path / "partial.wav"
    output_audio.write_bytes(b"partial content")

    service = FFmpegService(ffmpeg_path="ffmpeg", timeout=1)
    with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
        with patch("subprocess.run", side_effect=subprocess.TimeoutExpired(cmd=["ffmpeg"], timeout=1)):
            with pytest.raises(MediaProcessingTimeoutException):
                service.extract_audio(str(video_file), str(output_audio))
            assert not output_audio.exists()

def test_no_audio_stream_detected(tmp_path):
    """Verify detection of video without audio track."""
    video_file = tmp_path / "silent.mp4"
    video_file.write_bytes(b"dummy video")
    output_audio = tmp_path / "silent.wav"

    service = FFmpegService(ffmpeg_path="ffmpeg")
    with patch("shutil.which", return_value="/usr/bin/ffmpeg"):
        with patch("subprocess.run") as mock_run:
            mock_proc = MagicMock()
            mock_proc.returncode = 1
            mock_proc.stderr = b"Stream map '0:a:0' matches no streams"
            mock_run.return_value = mock_proc

            with pytest.raises(NoAudioTrackException):
                service.extract_audio(str(video_file), str(output_audio))
