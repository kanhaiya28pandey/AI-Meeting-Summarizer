import logging
from typing import Optional
from google import genai
from google.genai import types, errors
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.analysis import ActionItem, MeetingAnalysisResponse
from app.services.gemini_service import gemini_service
from app.services.prompts import (
    TRANSCRIPT_ANALYSIS_SYSTEM_PROMPT,
    build_transcript_analysis_prompt,
)
from app.utils.exceptions import (
    GeminiServiceError,
    InvalidAnalysisResponseException,
    InvalidTranscriptException,
    MeetingAnalysisException,
    TranscriptTooLargeException,
)

logger = logging.getLogger(__name__)


class MeetingAnalysisService:
    """Service encapsulating meeting transcript intelligence extraction using Gemini."""

    def __init__(
        self,
        model: Optional[str] = None,
        client: Optional[genai.Client] = None
    ):
        self.model = model or settings.GEMINI_MODEL
        self._client = client

    def get_client(self) -> genai.Client:
        """Retrieves or initializes the Google GenAI client."""
        if self._client is not None:
            return self._client
        return gemini_service.get_client()

    def validate_transcript(self, transcript: str) -> str:
        """Validates transcript presence, whitespace, and maximum length."""
        if transcript is None:
            raise InvalidTranscriptException("Transcript cannot be empty or whitespace only", status_code=422)

        cleaned = transcript.strip()
        if not cleaned:
            raise InvalidTranscriptException("Transcript cannot be empty or whitespace only", status_code=422)

        if len(cleaned) > settings.MAX_TRANSCRIPT_LENGTH:
            raise TranscriptTooLargeException(
                f"Meeting transcript exceeds the maximum allowed length of {settings.MAX_TRANSCRIPT_LENGTH} characters"
            )

        return cleaned

    def deduplicate_action_items(self, action_items: list[ActionItem]) -> list[ActionItem]:
        """Normalizes and removes identical duplicate action items preserving original order."""
        seen = set()
        deduped: list[ActionItem] = []
        for item in action_items:
            norm_key = (
                item.task.strip().lower(),
                (item.owner.strip().lower() if item.owner else None),
                (item.deadline.strip().lower() if item.deadline else None)
            )
            if norm_key not in seen:
                seen.add(norm_key)
                deduped.append(item)
        return deduped

    def analyze_transcript(self, transcript: str) -> MeetingAnalysisResponse:
        """Submits the transcript to Gemini and returns validated structured intelligence."""
        cleaned_transcript = self.validate_transcript(transcript)
        client = self.get_client()

        # Instant handling for silent recordings
        if cleaned_transcript == "[No audible speech detected in recording]" or "no audible speech" in cleaned_transcript.lower():
            logger.info("Silent transcript detected. Returning empty intelligence directly.")
            return MeetingAnalysisResponse(
                summary="No audible speech was detected in the provided meeting recording.",
                key_decisions=[],
                action_items=[],
            )

        logger.info(
            "Starting meeting transcript analysis using model=%s (length=%d characters)",
            self.model,
            len(cleaned_transcript)
        )

        try:
            config = types.GenerateContentConfig(
                system_instruction=TRANSCRIPT_ANALYSIS_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=MeetingAnalysisResponse,
                temperature=0.2,
            )

            response = None
            candidate_models = [self.model]
            for extra in ["gemini-3.5-flash", "gemini-3.6-flash"]:
                if extra not in candidate_models:
                    candidate_models.append(extra)

            last_exc = None
            for model_name in candidate_models:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=build_transcript_analysis_prompt(cleaned_transcript),
                        config=config,
                    )
                    if response:
                        break
                except Exception as call_err:
                    last_exc = call_err
                    logger.warning("Analysis attempt with model %s failed: %s", model_name, call_err)

            if response is None and last_exc:
                raise last_exc


            # Two-tier validation: SDK parsed object or Pydantic JSON validation
            result: Optional[MeetingAnalysisResponse] = None
            if getattr(response, "parsed", None) is not None:
                if isinstance(response.parsed, MeetingAnalysisResponse):
                    result = response.parsed
                elif isinstance(response.parsed, dict):
                    result = MeetingAnalysisResponse.model_validate(response.parsed)

            if result is None and getattr(response, "text", None) and response.text.strip():
                result = MeetingAnalysisResponse.model_validate_json(response.text)

            if result is None:
                logger.error("Gemini returned empty or unparseable analysis output")
                raise InvalidAnalysisResponseException(
                    "AI service returned an empty or unparseable response",
                    status_code=502
                )

            # Ensure summary is strictly non-empty after stripping
            if not result.summary or not result.summary.strip():
                raise InvalidAnalysisResponseException(
                    "AI service returned an empty summary",
                    status_code=502
                )

            # Deduplicate action items
            result.action_items = self.deduplicate_action_items(result.action_items)

            logger.info(
                "Meeting analysis completed successfully. Decisions=%d, ActionItems=%d",
                len(result.key_decisions),
                len(result.action_items)
            )
            return result

        except ValidationError as e:
            logger.error("Pydantic validation failed on Gemini meeting analysis output: %s", str(e))
            raise InvalidAnalysisResponseException(
                "AI service returned an invalid meeting analysis response schema",
                status_code=502
            ) from e
        except errors.APIError as e:
            logger.error("Gemini API error during meeting analysis: %s", getattr(e, "message", type(e).__name__))
            raise MeetingAnalysisException(
                "Meeting analysis service is temporarily unavailable",
                status_code=503
            ) from e
        except GeminiServiceError:
            raise
        except Exception as e:
            logger.error("Unexpected error during meeting analysis: %s", type(e).__name__)
            raise MeetingAnalysisException(
                "An unexpected error occurred during meeting analysis",
                status_code=500
            ) from e


meeting_analysis_service = MeetingAnalysisService()
