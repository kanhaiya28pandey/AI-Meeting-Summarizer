import logging
import os
import uuid
import wave
from pathlib import Path
from typing import Optional, Set, Tuple

from app.core.config import settings
from app.services.ffmpeg_service import FFmpegService, ffmpeg_service
from app.utils.exceptions import InvalidAudioFileException, NoAudioTrackException

logger = logging.getLogger(__name__)

SUPPORTED_AUDIO_EXTENSIONS: Set[str] = {".mp3", ".wav", ".m4a"}
SUPPORTED_VIDEO_EXTENSIONS: Set[str] = {".mp4", ".mov"}
ALL_SUPPORTED_EXTENSIONS: Set[str] = SUPPORTED_AUDIO_EXTENSIONS | SUPPORTED_VIDEO_EXTENSIONS

AUDIO_MIME_TYPES: Set[str] = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "audio/aac",
}

VIDEO_MIME_TYPES: Set[str] = {
    "video/mp4",
    "video/quicktime",
    "video/x-m4v",
}


class MediaService:
    """Service responsible for media format identification, validation, and audio preparation."""

    def __init__(self, ffmpeg_svc: Optional[FFmpegService] = None):
        self.ffmpeg_service = ffmpeg_svc or ffmpeg_service

    def get_media_type(self, filename: str, mime_type: Optional[str] = None) -> str:
        """
        Determines whether the given file is 'audio', 'video', or unsupported.

        Returns:
            'audio' or 'video'

        Raises:
            InvalidAudioFileException: If format/extension is unsupported.
        """
        if not filename:
            raise InvalidAudioFileException("Filename is required", status_code=400)

        ext = Path(filename).suffix.lower()
        if not ext:
            raise InvalidAudioFileException(
                "Media file must have a valid extension (.mp3, .wav, .m4a, .mp4, .mov)",
                status_code=422,
            )

        if ext in SUPPORTED_AUDIO_EXTENSIONS:
            return "audio"

        if ext in SUPPORTED_VIDEO_EXTENSIONS:
            return "video"

        # Secondary check based on MIME type if extension was somehow ambiguous
        clean_mime = (mime_type or "").split(";")[0].strip().lower()
        if clean_mime in AUDIO_MIME_TYPES:
            return "audio"
        if clean_mime in VIDEO_MIME_TYPES:
            return "video"

        raise InvalidAudioFileException(
            f"Unsupported file format '{ext}'. Supported formats: MP3, WAV, M4A, MP4, MOV",
            status_code=422,
        )

    def is_video(self, filename: str, mime_type: Optional[str] = None) -> bool:
        """Checks if a file is an approved video format."""
        try:
            return self.get_media_type(filename, mime_type) == "video"
        except Exception:
            return False

    def is_audio(self, filename: str, mime_type: Optional[str] = None) -> bool:
        """Checks if a file is an approved audio format."""
        try:
            return self.get_media_type(filename, mime_type) == "audio"
        except Exception:
            return False

    def prepare_audio_for_transcription(
        self,
        input_media_path: str,
        original_filename: str,
        declared_mime: Optional[str] = None,
    ) -> Tuple[str, Optional[str], str]:
        """
        Prepares an audio file ready for Gemini transcription.

        If input is audio: returns (input_media_path, None, original_filename).
        If input is video: extracts audio track to WAV, returns (extracted_wav_path, extracted_wav_path, wav_filename).

        Returns:
            (transcribable_audio_path, cleanup_audio_path, effective_audio_filename)
        """
        media_type = self.get_media_type(original_filename, declared_mime)

        if media_type == "audio":
            logger.info("Direct audio file detected ('%s'), no extraction needed", original_filename)
            return input_media_path, None, original_filename

        # Video workflow: Extract audio to temporary WAV
        temp_audio_dir = Path(settings.TEMP_AUDIO_DIR)
        temp_audio_dir.mkdir(parents=True, exist_ok=True)

        extracted_filename = f"{uuid.uuid4().hex}_extracted.wav"
        extracted_path = temp_audio_dir / extracted_filename

        logger.info(
            "Video file detected ('%s'). Initiating audio extraction to '%s'",
            original_filename,
            extracted_filename,
        )

        try:
            extracted_audio_path = self.ffmpeg_service.extract_audio(
                video_path=input_media_path,
                output_audio_path=str(extracted_path),
            )
        except NoAudioTrackException:
            logger.info(
                "Video '%s' contains no audio stream. Generating silent audio fallback for graceful analysis.",
                original_filename,
            )
            self._generate_silent_audio(str(extracted_path))
            extracted_audio_path = str(extracted_path)

        return extracted_audio_path, extracted_audio_path, extracted_filename

    def _generate_silent_audio(self, output_path: str, duration_seconds: int = 1) -> None:
        """Generates a standard 16-bit 16kHz mono PCM silent WAV file."""
        sample_rate = 16000
        num_samples = sample_rate * duration_seconds
        with wave.open(output_path, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(b"\x00" * (num_samples * 2))


media_service = MediaService()
