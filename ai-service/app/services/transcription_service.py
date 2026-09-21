import logging
import os
from pathlib import Path
from typing import Optional
from google import genai
from google.genai import types, errors
from pydantic import ValidationError

import re
from app.core.config import settings
from app.schemas.transcription import TranscriptSegment, TranscriptionResponse
from app.services.ffmpeg_service import ffmpeg_service
from app.services.gemini_service import gemini_service
from app.services.transcription_prompts import VERBATIM_TRANSCRIPTION_INSTRUCTION
from app.utils.exceptions import (
    AudioFileTooLargeException,
    GeminiConfigurationError,
    InvalidAudioFileException,
    TranscriptionException,
)

logger = logging.getLogger(__name__)


def normalize_speaker(label: Optional[str]) -> Optional[str]:
    """Normalizes speaker labels e.g. 'spk_0', 'spk:0', 'speaker_1' -> 'Speaker 1'."""
    if not label:
        return None
    s = str(label).strip()
    if not s:
        return None
    m = re.match(r"^(?:spk|speaker)[\s_:-]*(\d+)$", s, re.IGNORECASE)
    if m:
        return f"Speaker {int(m.group(1)) + 1}"
    if s.isdigit():
        return f"Speaker {int(s) + 1}"
    return s



def build_speaker_transcript(segments: list[TranscriptSegment]) -> str:
    """Combines segments into a person-by-person transcript with blank lines between turns."""
    if not segments:
        return ""
    turns: list[str] = []
    current_spk = None
    current_texts: list[str] = []

    for seg in segments:
        spk = normalize_speaker(seg.speaker) or "Speaker 1"
        if spk != current_spk:
            if current_texts:
                turns.append(f"{current_spk}: {' '.join(current_texts).strip()}")
                current_texts = []
            current_spk = spk
        current_texts.append(seg.text.strip())

    if current_texts:
        turns.append(f"{current_spk}: {' '.join(current_texts).strip()}")

    return "\n\n".join(turns)



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

        # Extract media duration via FFmpeg
        duration = ffmpeg_service.get_media_duration(file_path)

        upload_path = file_path
        upload_mime = mime_type
        optimized_temp = None

        # Pre-compress large audio (> 3MB) or WAV files to compact MP3 to speed up cloud upload
        if (Path(file_path).stat().st_size > 3 * 1024 * 1024 or original_filename.lower().endswith(".wav")) and ffmpeg_service.is_available():
            optimized_candidate = str(Path(file_path).with_suffix(".opt.mp3"))
            res = ffmpeg_service.optimize_audio(file_path, optimized_candidate)
            if res != file_path and Path(res).exists():
                upload_path = res
                upload_mime = "audio/mp3"
                optimized_temp = res

        uploaded_file = None
        logger.info(
            "Starting audio transcription for file=%s (size=%d bytes, mime=%s, duration=%s) using model=%s",
            original_filename,
            Path(upload_path).stat().st_size,
            upload_mime,
            duration,
            self.model,
        )

        try:
            # 1. Upload audio file to Gemini Files API
            try:
                try:
                    uploaded_file = client.files.upload(
                        file=upload_path,
                        config=types.UploadFileConfig(mime_type=upload_mime),
                    )
                except TypeError:
                    uploaded_file = client.files.upload(
                        file=upload_path,
                        mime_type=upload_mime,
                    )
                logger.info("Successfully uploaded file to Gemini Files API: name=%s", getattr(uploaded_file, "name", "unknown"))
            except Exception as e:
                logger.error("Failed to upload audio to Gemini Files API: %s (%s)", type(e).__name__, str(e))
                raise TranscriptionException(
                    detail="Failed to upload audio to AI service Files API",
                    status_code=503
                ) from e

            # 2. Invoke Gemini Transcribe (Primary or Fallback)
            response = None
            try:
                config = types.GenerateContentConfig(
                    system_instruction=VERBATIM_TRANSCRIPTION_INSTRUCTION,
                    audio_transcription_config=types.AudioTranscriptionConfig(
                        mode="VERBATIM",
                        diarization=settings.TRANSCRIPTION_ENABLE_DIARIZATION,
                        word_timestamp=settings.TRANSCRIPTION_ENABLE_TIMESTAMPS,
                    )
                )

                response = client.models.generate_content(
                    model=self.model,
                    contents=[uploaded_file, VERBATIM_TRANSCRIPTION_INSTRUCTION],
                    config=config,
                )
            except Exception as primary_err:
                logger.warning(
                    "Primary audio transcription with model=%s failed (%s: %s). Attempting fallback.",
                    self.model,
                    type(primary_err).__name__,
                    str(primary_err),
                )
                fallback_models = [m for m in [settings.GEMINI_MODEL, "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.7-flash"] if m != self.model]
                last_err = primary_err
                for fb_model in fallback_models:
                    try:
                        logger.info("Attempting fallback transcription with model=%s", fb_model)
                        response = client.models.generate_content(
                            model=fb_model,
                            contents=[
                                uploaded_file,
                                VERBATIM_TRANSCRIPTION_INSTRUCTION,
                            ],
                            config=types.GenerateContentConfig(
                                system_instruction=VERBATIM_TRANSCRIPTION_INSTRUCTION
                            ),
                        )
                        if response:
                            break
                    except Exception as fb_err:
                        last_err = fb_err
                        logger.warning("Fallback model %s failed: %s", fb_model, fb_err)

                if response is None:
                    if isinstance(last_err, errors.APIError):
                        logger.error("Gemini transcription API error: %s", getattr(last_err, "message", str(last_err)))
                        raise TranscriptionException(
                            detail="Transcription service is temporarily unavailable",
                            status_code=503
                        ) from last_err
                    raise TranscriptionException(
                        detail="An unexpected error occurred during transcription",
                        status_code=503
                    ) from last_err

            # 3. Parse transcript and segments
            transcript_text = getattr(response, "text", "") or ""
            segments = self._parse_segments(response)

            # If segments were extracted with speaker info, construct person-by-person transcript
            if segments:
                formatted_from_segments = build_speaker_transcript(segments)
                if formatted_from_segments:
                    transcript_text = formatted_from_segments

            # If transcript_text is still empty, look in candidates/parts
            if not transcript_text:
                for candidate in getattr(response, "candidates", []) or []:
                    for part in getattr(getattr(candidate, "content", None), "parts", []) or []:
                        if getattr(part, "text", None) and str(part.text).strip():
                            transcript_text = str(part.text).strip()
                            break
                        at = getattr(part, "audio_transcription", None)
                        if at and getattr(at, "text", None) and str(at.text).strip():
                            transcript_text = str(at.text).strip()
                            break

            # If no speech was detected at all (silence or non-vocal audio)
            if not transcript_text or not transcript_text.strip():
                transcript_text = "[No audible speech detected in recording]"
            elif transcript_text != "[No audible speech detected in recording]":
                # Ensure transcript has person-by-person speaker labeling
                has_speaker_prefix = bool(re.search(r"^([^:\n]{1,35}):", transcript_text, re.MULTILINE))
                if not has_speaker_prefix:
                    # Single speaker or flat paragraph: label as Speaker 1
                    transcript_text = f"Speaker 1: {transcript_text}"

                # If segments was empty, generate segments from dialogue turns in transcript_text
                if not segments:
                    blocks = [b.strip() for b in transcript_text.split("\n\n") if b.strip()]
                    for block in blocks:
                        match = re.match(r"^([^:\n]{1,35}):\s*([\s\S]+)$", block)
                        if match:
                            segments.append(TranscriptSegment(
                                speaker=match.group(1).strip(),
                                text=match.group(2).strip(),
                                start_time=None,
                                end_time=None
                            ))
                        else:
                            segments.append(TranscriptSegment(
                                speaker="Speaker 1",
                                text=block,
                                start_time=None,
                                end_time=None
                            ))

            detected_language = getattr(response, "language", None)

            try:
                result = TranscriptionResponse(
                    success=True,
                    transcript=transcript_text,
                    language=detected_language,
                    segments=segments,
                    duration=duration,
                )
                logger.info(
                    "Transcription completed successfully. Total characters=%d, segments=%d, duration=%s",
                    len(transcript_text),
                    len(segments),
                    duration,
                )
                return result
            except ValidationError as e:
                logger.error("Failed to validate transcription output schema: %s", e)
                raise TranscriptionException(
                    detail="Transcription service returned an invalid response structure",
                    status_code=502
                ) from e

        finally:
            if optimized_temp and Path(optimized_temp).exists():
                try:
                    os.remove(optimized_temp)
                except Exception as del_err:
                    logger.warning("Failed to remove optimized temp audio '%s': %s", optimized_temp, del_err)
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
