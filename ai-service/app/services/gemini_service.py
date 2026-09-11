import logging
from typing import Optional
from google import genai
from google.genai import types, errors
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.gemini import GeminiTestResponse
from app.services.prompts import MEETING_ANALYSIS_SYSTEM_PROMPT, build_analysis_user_prompt
from app.utils.exceptions import GeminiConfigurationError, GeminiServiceError

logger = logging.getLogger(__name__)


class GeminiService:
    """Service encapsulating structured Gemini interactions."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        client: Optional[genai.Client] = None
    ):
        self.api_key = api_key if api_key is not None else settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self._client = client

    def get_client(self) -> genai.Client:
        """Lazily initializes and validates the Google GenAI client."""
        if self._client is not None:
            return self._client

        if not self.api_key or self.api_key.strip() == "":
            raise GeminiConfigurationError(
                "GEMINI_API_KEY is not configured. Please provide a valid Gemini API key in the environment."
            )

        try:
            self._client = genai.Client(api_key=self.api_key)
            return self._client
        except Exception as e:
            logger.error("Failed to initialize Google GenAI client: %s", type(e).__name__)
            raise GeminiServiceError(
                detail="Failed to initialize AI service client.",
                status_code=500
            ) from e

    def analyze_text(self, text: str) -> GeminiTestResponse:
        """Sends text to Gemini and returns a schema-validated structured response."""
        client = self.get_client()

        logger.info("Submitting text analysis request to Gemini model=%s (length=%d)", self.model, len(text))
        try:
            config = types.GenerateContentConfig(
                system_instruction=MEETING_ANALYSIS_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=GeminiTestResponse,
            )

            response = client.models.generate_content(
                model=self.model,
                contents=build_analysis_user_prompt(text),
                config=config,
            )

            # Two-tier validation: SDK parsed object or Pydantic JSON validation
            if response.parsed is not None:
                if isinstance(response.parsed, GeminiTestResponse):
                    logger.info("Successfully received structured response from Gemini via parsed property")
                    return response.parsed
                elif isinstance(response.parsed, dict):
                    logger.info("Successfully received dict response from Gemini, validating via Pydantic")
                    return GeminiTestResponse.model_validate(response.parsed)

            if response.text and response.text.strip():
                logger.info("Validating response.text via Pydantic JSON validation")
                return GeminiTestResponse.model_validate_json(response.text)

            logger.error("Gemini returned empty response body")
            raise GeminiServiceError(
                detail="AI service returned an empty response.",
                status_code=502
            )

        except ValidationError as e:
            logger.error("Pydantic validation failed on Gemini response: %s", str(e))
            raise GeminiServiceError(
                detail="AI service returned a malformed response schema.",
                status_code=502
            ) from e
        except errors.APIError as e:
            logger.error("Gemini API error: code=%s, message=%s", getattr(e, "code", "unknown"), getattr(e, "message", type(e).__name__))
            raise GeminiServiceError(
                detail="AI service error during analysis. Please try again later.",
                status_code=503
            ) from e
        except GeminiServiceError:
            raise
        except Exception as e:
            logger.error("Unexpected error during Gemini analysis: %s", type(e).__name__)
            raise GeminiServiceError(
                detail="An unexpected error occurred while communicating with the AI service.",
                status_code=503
            ) from e


# Singleton service instance
gemini_service = GeminiService()
