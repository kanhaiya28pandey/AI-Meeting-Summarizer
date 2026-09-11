import logging
import os
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, status

from app.core.config import settings
from app.schemas.transcription import TranscriptionResponse
from app.services.transcription_service import transcription_service
from app.utils.exceptions import InvalidAudioFileException

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=TranscriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Transcribe audio file using Gemini 3.5 Transcribe",
    description="Uploads an MP3, WAV, or M4A audio file and returns verbatim speech-to-text transcription."
)
async def transcribe_audio(
    file: UploadFile = File(..., description="Audio file in MP3, WAV, or M4A format")
) -> TranscriptionResponse:
    if not file or not file.filename:
        raise InvalidAudioFileException("No audio file provided", status_code=400)

    original_filename = os.path.basename(file.filename)
    ext = Path(original_filename).suffix.lower()
    if not ext:
        raise InvalidAudioFileException("Audio file must have a valid extension (.mp3, .wav, .m4a)", status_code=422)

    # Ensure temporary audio directory exists
    temp_dir = Path(settings.TEMP_AUDIO_DIR)
    temp_dir.mkdir(parents=True, exist_ok=True)

    # Generate isolated safe filename
    temp_file_path = temp_dir / f"{uuid.uuid4().hex}{ext}"

    try:
        # Stream file to disk in chunks to minimize memory consumption
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Delegate transcription to service
        response = transcription_service.transcribe_audio(
            file_path=str(temp_file_path),
            original_filename=original_filename,
            declared_mime=file.content_type
        )
        return response

    finally:
        # Safe cleanup of temporary local file
        try:
            if temp_file_path.exists():
                os.remove(temp_file_path)
                logger.info("Successfully deleted local temporary audio file: %s", temp_file_path.name)
        except Exception as cleanup_err:
            logger.warning("Failed to remove temporary audio file '%s': %s", temp_file_path, cleanup_err)
