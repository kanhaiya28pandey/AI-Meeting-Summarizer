from fastapi import APIRouter, status

from app.core.config import settings
from app.schemas.process import ProcessRequest, ProcessResponse

router = APIRouter()


@router.post(
    "/process",
    response_model=ProcessResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Accept meeting processing request",
    description="Validates and accepts a meeting processing request from Spring Boot backend. Returns an acknowledgment."
)
def process_meeting(request: ProcessRequest) -> ProcessResponse:
    return ProcessResponse(
        success=True,
        meetingId=request.meetingId,
        service=settings.APP_NAME,
        message="Meeting processing request accepted"
    )
