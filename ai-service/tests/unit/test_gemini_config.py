import pytest
from app.core.config import Settings, settings
from app.services.gemini_service import GeminiService
from app.utils.exceptions import GeminiConfigurationError

def test_gemini_config_defaults():
    """Verify Gemini models and settings are configuration-driven."""
    assert settings.GEMINI_MODEL is not None
    assert "gemini" in settings.GEMINI_MODEL.lower()
    assert settings.GEMINI_TRANSCRIPTION_MODEL is not None
    assert "transcribe" in settings.GEMINI_TRANSCRIPTION_MODEL.lower()

def test_missing_api_key_raises_error_without_logging_secret():
    """Verify missing API key produces controlled GeminiConfigurationError without leaking any secret."""
    service = GeminiService(api_key="")
    with pytest.raises(GeminiConfigurationError) as excinfo:
        service.get_client()
    assert "GEMINI_API_KEY is not configured" in str(excinfo.value)
    assert "sk-" not in str(excinfo.value)

def test_custom_model_configuration(monkeypatch):
    """Verify model can be overridden through environment variables."""
    monkeypatch.setenv("GEMINI_MODEL", "custom-gemini-test-model")
    custom_settings = Settings()
    assert custom_settings.GEMINI_MODEL == "custom-gemini-test-model"
