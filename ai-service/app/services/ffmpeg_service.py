import logging
import os
import shutil
import subprocess
from pathlib import Path
from typing import List, Optional

from app.core.config import settings
from app.utils.exceptions import (
    ExtractedAudioTooLargeException,
    FFmpegUnavailableException,
    MediaExtractionException,
    MediaProcessingTimeoutException,
    NoAudioTrackException,
)

logger = logging.getLogger(__name__)


class FFmpegService:
    """Service encapsulating safe FFmpeg execution for extracting audio tracks from video files."""

    def __init__(
        self,
        ffmpeg_path: Optional[str] = None,
        timeout: Optional[int] = None,
    ):
        self._custom_ffmpeg_path = ffmpeg_path
        self.timeout = timeout or settings.FFMPEG_TIMEOUT_SECONDS

    @property
    def ffmpeg_bin(self) -> str:
        """Resolves the active FFmpeg binary path."""
        if self._custom_ffmpeg_path:
            return self._custom_ffmpeg_path
        return settings.get_resolved_ffmpeg_path()

    def is_available(self) -> bool:
        """Checks if FFmpeg executable can be found in the current runtime environment."""
        resolved = self.ffmpeg_bin
        if shutil.which(resolved) or Path(resolved).is_file():
            return True
        return False

    def get_media_duration(self, media_path: str) -> Optional[int]:
        """Inspects media file header via FFmpeg to determine duration in seconds."""
        if not self.is_available():
            return None
        media_file = Path(media_path)
        if not media_file.exists() or not media_file.is_file():
            return None

        cmd = [self.ffmpeg_bin, "-i", str(media_file)]
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10,
                shell=False,
                check=False,
                errors="replace",
            )
            import re
            match = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", result.stderr)
            if match:
                h, m, s = match.groups()
                return int(round(int(h) * 3600 + int(m) * 60 + float(s)))
        except Exception as e:
            logger.warning("Could not extract media duration from '%s': %s", media_file.name, e)
        return None

    def extract_audio(self, video_path: str, output_audio_path: str) -> str:
        """
        Extracts mono 16kHz PCM WAV audio from a video file using FFmpeg.

        Args:
            video_path: Absolute or relative path to source video (MP4, MOV).
            output_audio_path: Destination path for extracted WAV file.

        Returns:
            The output audio path on successful extraction.

        Raises:
            FFmpegUnavailableException: When FFmpeg binary is missing.
            NoAudioTrackException: When video has no audio stream.
            MediaExtractionException: When FFmpeg fails to decode the video.
            MediaProcessingTimeoutException: When extraction times out.
            ExtractedAudioTooLargeException: When extracted WAV exceeds safety limits.
        """
        video = Path(video_path)
        if not video.exists() or not video.is_file():
            raise MediaExtractionException("Input video file does not exist")

        output_path = Path(output_audio_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if not self.is_available():
            logger.error("FFmpeg executable not found at '%s'", self.ffmpeg_bin)
            raise FFmpegUnavailableException()

        # Build argument array - strictly avoiding shell=True for security
        cmd: List[str] = [
            self.ffmpeg_bin,
            "-y",                   # Overwrite output without asking
            "-i", str(video),       # Input video file
            "-vn",                  # Disable video recording/copying
            "-acodec", "pcm_s16le", # 16-bit uncompressed linear PCM
            "-ar", "16000",         # 16kHz sample rate optimal for speech-to-text
            "-ac", "1",             # Mono audio
            str(output_path),
        ]

        logger.info("Starting audio extraction with FFmpeg from '%s'", video.name)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                timeout=self.timeout,
                shell=False,
                check=False,
            )
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg extraction timed out after %s seconds for '%s'", self.timeout, video.name)
            self._cleanup_file(output_path)
            raise MediaProcessingTimeoutException()
        except FileNotFoundError:
            logger.error("FFmpeg executable was not found when executing subprocess: %s", self.ffmpeg_bin)
            self._cleanup_file(output_path)
            raise FFmpegUnavailableException()
        except Exception as err:
            logger.error("Unexpected error launching FFmpeg subprocess: %s", err)
            self._cleanup_file(output_path)
            raise MediaExtractionException()

        stderr_output = result.stderr.decode("utf-8", errors="replace")

        if result.returncode != 0:
            logger.warning(
                "FFmpeg exited with non-zero code %d for '%s'. Stderr: %s",
                result.returncode,
                video.name,
                stderr_output[:500],
            )
            self._cleanup_file(output_path)

            lower_err = stderr_output.lower()
            if (
                "does not contain any stream" in lower_err
                or "does not contain any audio" in lower_err
                or "no audio stream" in lower_err
                or "output file is empty" in lower_err
                or "matches no streams" in lower_err
            ):
                raise NoAudioTrackException()

            raise MediaExtractionException()

        # Verify output file was generated and has non-zero size
        if not output_path.exists() or output_path.stat().st_size == 0:
            logger.warning("Extracted audio file is missing or 0 bytes for '%s'", video.name)
            self._cleanup_file(output_path)
            raise NoAudioTrackException()

        # Enforce extracted audio size ceiling
        extracted_size = output_path.stat().st_size
        if extracted_size > settings.max_extracted_audio_size_bytes:
            logger.warning(
                "Extracted audio size %d bytes exceeds max %d bytes",
                extracted_size,
                settings.max_extracted_audio_size_bytes,
            )
            self._cleanup_file(output_path)
            raise ExtractedAudioTooLargeException()

        logger.info(
            "Successfully extracted audio (%d bytes) from '%s' to '%s'",
            extracted_size,
            video.name,
            output_path.name,
        )
        return str(output_path)

    @staticmethod
    def _cleanup_file(path: Path) -> None:
        try:
            if path.exists():
                os.remove(path)
        except Exception as e:
            logger.warning("Failed to remove temporary file '%s': %s", path, e)


ffmpeg_service = FFmpegService()
