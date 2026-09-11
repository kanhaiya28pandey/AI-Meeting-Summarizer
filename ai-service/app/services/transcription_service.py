import logging
import os
from pathlib import Path
from typing import Optional
from google import genai
from google.genai import types, errors
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.transcription import TranscriptSegment, TranscriptionResponse
from app.services.gemini_service import gemini_service
from app.utils.exceptions import (
    AudioFileTooLargeException,
    GeminiConfigurationError,
    InvalidAudioFileException,
    TranscriptionException,
)

logger = logging.getLogger(__name__)

SUPPORTED_AUDIO_EXTENSIONS = {
    ".mp3": "audio/mp3",
    ".wav": "audio/wav",
    ".m4a": "audio/m4a",
}

SUPPORTED_MIME_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
}


def parse_offset(offset_val: Optional[str]) -> Optional[float]:
    """Parses duration offset string e.g. '1.500s' or numeric float/int into seconds."""
    if offset_val is None:
        return None
    if isinstance(offset_val, (int, float)):
        return float(offset_val)
    s = str(offset_val).strip()
    if s.endswith("s"):
        s = s[:-1].strip()
    try:
        return float(s)
    except (ValueError, TypeError):
        return None


class TranscriptionService:
    """Service encapsulating audio validation, Gemini Files API upload, and verbatim transcription."""

    def __init__(
        self,
        model: Optional[str] = None,
        client: Optional[genai.Client] = None
    ):
        self.model = model or settings.GEMINI_TRANSCRIPTION_MODEL
        self._client = client

    def get_client(self) -> genai.Client:
        """Retrieves or initializes the Google GenAI client."""
        if self._client is not None:
            return self._client
        return gemini_service.get_client()

    def validate_audio_file(self, file_path: str, original_filename: str, declared_mime: Optional[str] = None) -> str:
        """Validates file existence, extension, declared MIME, and size limit. Returns normalized MIME type."""
        path = Path(file_path)
        if not path.exists():
            raise InvalidAudioFileException("Audio file does not exist", status_code=400)

        file_size = path.stat().st_size
        if file_size == 0:
            raise InvalidAudioFileException("Audio file is empty", status_code=400)

        if file_size > settings.max_audio_file_size_bytes:
            raise AudioFileTooLargeException(
                f"Audio file exceeds the maximum allowed size of {settings.MAX_AUDIO_FILE_SIZE_MB} MB"
            )

        orig_ext = Path(original_filename).suffix.lower()
        if orig_ext not in SUPPORTED_AUDIO_EXTENSIONS:
            raise InvalidAudioFileException(
                f"Unsupported audio format '{orig_ext}'. Supported formats: MP3, WAV, M4A",
                status_code=422
            )

        if declared_mime:
            norm_mime = declared_mime.lower().split(";")[0].strip()
            if norm_mime not in SUPPORTED_MIME_TYPES:
                raise InvalidAudioFileException(
                    f"Unsupported audio MIME type '{declared_mime}'. Supported formats: MP3, WAV, M4A",
                    status_code=422
                )

        return SUPPORTED_AUDIO_EXTENSIONS[orig_ext]

    def transcribe_audio(
        self,
        file_path: str,
        original_filename: str,
        declared_mime: Optional[str] = None
    ) -> TranscriptionResponse:
        """Uploads local audio to Gemini Files API, executes transcription, and deletes remote file."""
        mime_type = self.validate_audio_file(file_path, original_filename, declared_mime)
        client = self.get_client()

        uploaded_file = None
        logger.info(
            "Starting audio transcription for file=%s (size=%d bytes, mime=%s) using model=%s",
            original_filename,
            Path(file_path).stat().st_size,
            mime_type,
            self.model,
        )

        try:
            # 1. Upload audio file to Gemini Files API
            try:
                uploaded_file = client.files.upload(
                    file=file_path,
                    mime_type=mime_type,
                )
                logger.info("Successfully uploaded file to Gemini Files API: name=%s", getattr(uploaded_file, "name", "unknown"))
            except Exception as e:
                logger.error("Failed to upload audio to Gemini Files API: %s", type(e).__name__)
                raise TranscriptionException(
                    detail="Failed to upload audio to AI service Files API",
                    status_code=503
                ) from e

            # 2. Invoke Gemini 3.5 Transcribe
            try:
                config = types.GenerateContentConfig(
                    audio_transcription_config=types.AudioTranscriptionConfig(
                        mode="VERBATIM",
                        diarization=settings.TRANSCRIPTION_ENABLE_DIARIZATION,
                        word_timestamp=settings.TRANSCRIPTION_ENABLE_TIMESTAMPS,
                    )
                )

                response = client.models.generate_content(
                    model=self.model,
                    contents=[uploaded_file],
                    config=config,
                )
            except errors.APIError as e:
                logger.error("Gemini transcription API error: %s", getattr(e, "message", str(e)))
                raise TranscriptionException(
                    detail="Transcription service is temporarily unavailable",
                    status_code=503
                ) from e
            except Exception as e:
                logger.error("Unexpected error during Gemini audio transcription: %s", type(e).__name__)
                raise TranscriptionException(
                    detail="An unexpected error occurred during transcription",
                    status_code=503
                ) from e

            # 3. Parse transcript and segments
            transcript_text = getattr(response, "text", "") or ""
            segments = self._parse_segments(response)

            detected_language = getattr(response, "language", None)

            try:
                result = TranscriptionResponse(
                    success=True,
                    transcript=transcript_text,
                    language=detected_language,
                    segments=segments,
                )
                logger.info("Transcription completed successfully. Total characters=%d, segments=%d", len(transcript_text), len(segments))
                return result
            except ValidationError as e:
                logger.error("Failed to validate transcription output schema: %s", e)
                raise TranscriptionException(
                    detail="Transcription service returned an invalid response structure",
                    status_code=502
                ) from e

        finally:
            # Safe cleanup of uploaded file in Gemini Files API
            if uploaded_file and hasattr(uploaded_file, "name") and uploaded_file.name:
                try:
                    client.files.delete(name=uploaded_file.name)
                    logger.info("Cleaned up temporary Gemini file: %s", uploaded_file.name)
                except Exception as cleanup_err:
                    logger.warning("Failed to delete Gemini Files API object '%s': %s", uploaded_file.name, cleanup_err)

    def _parse_segments(self, response) -> list[TranscriptSegment]:
        """Groups word-level timings and speaker labels into logical TranscriptSegments."""
        segments: list[TranscriptSegment] = []
        current_speaker: Optional[str] = None
        current_words: list[str] = []
        start_time: Optional[float] = None
        end_time: Optional[float] = None

        candidates = getattr(response, "candidates", []) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", []) or []
            for part in parts:
                transcription = getattr(part, "audio_transcription", None)
                if transcription:
                    speaker = getattr(transcription, "speaker_label", None) or None
                    words = getattr(transcription, "words", []) or []
                    for word_info in words:
                        w_text = getattr(word_info, "word", "")
                        w_start = parse_offset(getattr(word_info, "start_offset", None))
                        w_end = parse_offset(getattr(word_info, "end_offset", None))

                        if current_speaker is None:
                            current_speaker = speaker
                            start_time = w_start

                        if speaker != current_speaker:
                            if current_words:
                                segments.append(TranscriptSegment(
                                    speaker=current_speaker,
                                    text=" ".join(current_words),
                                    start_time=start_time,
                                    end_time=end_time
                                ))
                            current_speaker = speaker
                            current_words = [w_text]
                            start_time = w_start
                            end_time = w_end
                        else:
                            current_words.append(w_text)
                            if w_end is not None:
                                end_time = w_end

        if current_words:
            segments.append(TranscriptSegment(
                speaker=current_speaker,
                text=" ".join(current_words),
                start_time=start_time,
                end_time=end_time
            ))

        return segments


transcription_service = TranscriptionService()
