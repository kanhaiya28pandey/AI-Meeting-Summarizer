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


class InvalidAudioFileException(GeminiServiceError):
    """Raised when an uploaded audio file is invalid, empty, or an unsupported format."""

    def __init__(self, detail: str = "Invalid or unsupported audio file", status_code: int = 400):
        super().__init__(detail=detail, status_code=status_code)


class AudioFileTooLargeException(GeminiServiceError):
    """Raised when an uploaded audio file exceeds the maximum allowed file size."""

    def __init__(self, detail: str = "Audio file exceeds the maximum allowed size"):
        super().__init__(detail=detail, status_code=413)


class TranscriptionException(GeminiServiceError):
    """Raised when an error occurs during Gemini audio transcription."""

    def __init__(self, detail: str = "Transcription service is temporarily unavailable", status_code: int = 503):
        super().__init__(detail=detail, status_code=status_code)
