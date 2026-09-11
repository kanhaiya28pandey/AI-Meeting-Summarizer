import os
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.gemini import ActionItem, GeminiTestResponse
from app.services.gemini_service import GeminiService
from app.utils.exceptions import GeminiConfigurationError, GeminiServiceError

client = TestClient(app)


def test_gemini_endpoint_success():
    expected_response = GeminiTestResponse(
        summary="The team decided to launch the new dashboard on Friday.",
        key_decisions=["The new dashboard will launch on Friday."],
        action_items=[
            ActionItem(task="Complete testing", owner="Rahul", deadline="Thursday")
        ]
    )

    with patch("app.api.routes.gemini.gemini_service.analyze_text", return_value=expected_response):
        response = client.post(
            "/api/v1/gemini/test",
            json={"text": "The team decided to launch the new dashboard on Friday. Rahul will complete testing by Thursday."}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["summary"] == "The team decided to launch the new dashboard on Friday."
        assert len(data["key_decisions"]) == 1
        assert data["key_decisions"][0] == "The new dashboard will launch on Friday."
        assert len(data["action_items"]) == 1
        assert data["action_items"][0]["task"] == "Complete testing"
        assert data["action_items"][0]["owner"] == "Rahul"
        assert data["action_items"][0]["deadline"] == "Thursday"


def test_gemini_endpoint_empty_text():
    response = client.post(
        "/api/v1/gemini/test",
        json={"text": ""}
    )
    assert response.status_code == 422


def test_gemini_endpoint_whitespace_text():
    response = client.post(
        "/api/v1/gemini/test",
        json={"text": "   \n\t  "}
    )
    assert response.status_code == 422


def test_gemini_endpoint_oversized_text():
    response = client.post(
        "/api/v1/gemini/test",
        json={"text": "A" * 20001}
    )
    assert response.status_code == 422


def test_gemini_endpoint_service_error_handling():
    with patch(
        "app.api.routes.gemini.gemini_service.analyze_text",
        side_effect=GeminiServiceError("AI service error during analysis. Please try again later.", status_code=503)
    ):
        response = client.post(
            "/api/v1/gemini/test",
            json={"text": "Sample valid text"}
        )
        assert response.status_code == 503
        assert response.json()["detail"] == "AI service error during analysis. Please try again later."


def test_gemini_service_unit_with_mock_client():
    mock_genai_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed = GeminiTestResponse(
        summary="Sprint overview discussed.",
        key_decisions=[],
        action_items=[]
    )
    mock_response.text = '{"summary": "Sprint overview discussed.", "key_decisions": [], "action_items": []}'
    mock_genai_client.models.generate_content.return_value = mock_response

    service = GeminiService(api_key="dummy-test-key", model="gemini-2.5-flash", client=mock_genai_client)
    result = service.analyze_text("Sprint overview discussed.")

    assert isinstance(result, GeminiTestResponse)
    assert result.summary == "Sprint overview discussed."
    assert result.key_decisions == []
    assert result.action_items == []
    mock_genai_client.models.generate_content.assert_called_once()


def test_gemini_service_missing_api_key():
    service = GeminiService(api_key="", model="gemini-2.5-flash", client=None)
    with pytest.raises(GeminiConfigurationError):
        service.get_client()


@pytest.mark.skipif(
    not (os.environ.get("RUN_LIVE_GEMINI_TEST") == "true" and os.environ.get("GEMINI_API_KEY")),
    reason="Live Gemini API test requires RUN_LIVE_GEMINI_TEST=true and GEMINI_API_KEY set"
)
def test_live_gemini_integration():
    service = GeminiService()
    result = service.analyze_text(
        "The team decided to launch the new dashboard on Friday. Rahul will complete testing by Thursday."
    )
    assert result.summary
    assert isinstance(result.key_decisions, list)
    assert isinstance(result.action_items, list)
