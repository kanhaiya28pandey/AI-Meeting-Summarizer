import logging
import os
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, status

from app.core.config import settings
from app.schemas.transcription import TranscriptionResponse
from app.services.media_service import media_service
from app.services.transcription_service import transcription_service
from app.utils.exceptions import InvalidAudioFileException

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=TranscriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Transcribe audio or video meeting file",
    description="Uploads an MP3, WAV, M4A audio or MP4, MOV video file and returns verbatim speech-to-text transcription."
)
async def transcribe_meeting(
    file: UploadFile = File(..., description="Meeting file in MP3, WAV, M4A, MP4, or MOV format")
) -> TranscriptionResponse:
    if not file or not file.filename:
        raise InvalidAudioFileException("No media file provided", status_code=400)

    original_filename = os.path.basename(file.filename)

    # 1. Validate format/extension through MediaService
    media_type = media_service.get_media_type(original_filename, file.content_type)

    # 2. Prepare upload destination directory
    target_dir = Path(settings.TEMP_VIDEO_DIR if media_type == "video" else settings.TEMP_AUDIO_DIR)
    target_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(original_filename).suffix.lower()
    temp_upload_path = (target_dir / f"{uuid.uuid4().hex}{ext}").resolve()
    if not temp_upload_path.is_relative_to(target_dir.resolve()):
        raise InvalidAudioFileException("Invalid media file path", status_code=400)

    extracted_audio_to_clean: str | None = None

    try:
        # Stream file to disk in chunks enforcing maximum file size
        max_bytes = settings.max_audio_file_size_bytes
        bytes_written = 0
        chunk_size = 64 * 1024

        with open(temp_upload_path, "wb") as buffer:
            while chunk := file.file.read(chunk_size):
                bytes_written += len(chunk)
                if bytes_written > max_bytes:
                    raise InvalidAudioFileException(
                        f"The file is too large. Maximum size is {settings.MAX_AUDIO_FILE_SIZE_MB} MB.",
                        status_code=413
                    )
                buffer.write(chunk)

        if bytes_written == 0:
            raise InvalidAudioFileException("Uploaded file cannot be empty", status_code=400)

        # 3. Prepare audio (extracts audio track via FFmpeg if video)
        transcribe_path, extracted_audio_to_clean, effective_name = (
            media_service.prepare_audio_for_transcription(
                input_media_path=str(temp_upload_path),
                original_filename=original_filename,
                declared_mime=file.content_type,
            )
        )

        # 4. Delegate audio transcription to transcription service
        effective_mime = "audio/wav" if media_type == "video" else file.content_type
        response = transcription_service.transcribe_audio(
            file_path=transcribe_path,
            original_filename=effective_name,
            declared_mime=effective_mime,
        )
        return response

    finally:
        # 5. Guaranteed cleanup of temporary upload file
        try:
            if temp_upload_path.exists():
                os.remove(temp_upload_path)
                logger.info("Successfully cleaned up uploaded file: %s", temp_upload_path.name)
        except Exception as upload_cleanup_err:
            logger.warning("Failed to clean up uploaded file '%s': %s", temp_upload_path, upload_cleanup_err)

        # 6. Guaranteed cleanup of temporary extracted audio (if different from upload)
        if extracted_audio_to_clean and os.path.exists(extracted_audio_to_clean):
            try:
                os.remove(extracted_audio_to_clean)
                logger.info("Successfully cleaned up extracted audio file: %s", os.path.basename(extracted_audio_to_clean))
            except Exception as extracted_cleanup_err:
                logger.warning("Failed to clean up extracted audio '%s': %s", extracted_audio_to_clean, extracted_cleanup_err)
