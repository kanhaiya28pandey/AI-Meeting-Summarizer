class GeminiServiceError(Exception):
    """Custom exception raised when an error occurs while communicating with Gemini API."""

    def __init__(self, detail: str, status_code: int = 503):
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code


class GeminiConfigurationError(GeminiServiceError):
    """Raised when required Gemini configuration or API keys are missing."""

    def __init__(self, detail: str = "Gemini API key is not configured"):
        super().__init__(detail=detail, status_code=500)
