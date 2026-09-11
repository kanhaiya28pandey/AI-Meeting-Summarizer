from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str


class ReadinessResponse(BaseModel):
    status: str
    service: str
    storage: str


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    return HealthResponse(
        status="UP",
        service=settings.APP_NAME
    )


@router.get("/health/readiness", response_model=ReadinessResponse)
def get_readiness() -> ReadinessResponse:
    # Lightweight storage writability check
    from pathlib import Path
    try:
        Path(settings.TEMP_AUDIO_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.TEMP_VIDEO_DIR).mkdir(parents=True, exist_ok=True)
        storage_status = "READY"
    except Exception:
        storage_status = "UNAVAILABLE"

    is_ready = storage_status == "READY"
    return ReadinessResponse(
        status="UP" if is_ready else "DOWN",
        service=settings.APP_NAME,
        storage=storage_status
    )
