from fastapi import APIRouter, status

from app.schemas.gemini import GeminiTestRequest, GeminiTestResponse
from app.services.gemini_service import gemini_service

router = APIRouter()


@router.post(
    "/test",
    response_model=GeminiTestResponse,
    status_code=status.HTTP_200_OK,
    summary="Test Gemini text analysis and structured output",
    description="Sends text to Google Gemini and returns a schema-validated summary, key decisions, and action items."
)
def test_gemini_analysis(request: GeminiTestRequest) -> GeminiTestResponse:
    return gemini_service.analyze_text(request.text)
