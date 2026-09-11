from fastapi import APIRouter, status

from app.schemas.analysis import MeetingAnalysisRequest, MeetingAnalysisResponse
from app.services.meeting_analysis_service import meeting_analysis_service

router = APIRouter()


@router.post(
    "",
    response_model=MeetingAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze meeting transcript",
    description="Analyzes a meeting transcript and extracts a concise summary, explicit key decisions, and action items strictly grounded in the text."
)
async def analyze_meeting(request: MeetingAnalysisRequest) -> MeetingAnalysisResponse:
    """Accepts a text transcript and performs AI intelligence analysis via Google Gemini."""
    return meeting_analysis_service.analyze_transcript(request.transcript)
