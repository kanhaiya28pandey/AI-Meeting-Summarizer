import os
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from google.genai import errors

from app.core.config import settings
from app.main import app
from app.schemas.analysis import ActionItem, MeetingAnalysisResponse
from app.services.meeting_analysis_service import MeetingAnalysisService
from app.utils.exceptions import (
    InvalidAnalysisResponseException,
    InvalidTranscriptException,
    MeetingAnalysisException,
    TranscriptTooLargeException,
)

client = TestClient(app)


def test_valid_analysis():
    mock_response = MeetingAnalysisResponse(
        summary="The team met and agreed on the Friday launch date after testing is verified.",
        key_decisions=["Launch on Friday"],
        action_items=[
            ActionItem(task="Complete testing", owner="Rahul", deadline="Thursday")
        ]
    )

    with patch.object(MeetingAnalysisService, "analyze_transcript", return_value=mock_response):
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": "The team decided to launch Friday. Rahul will complete testing by Thursday."}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["summary"] == "The team met and agreed on the Friday launch date after testing is verified."
        assert data["key_decisions"] == ["Launch on Friday"]
        assert len(data["action_items"]) == 1
        assert data["action_items"][0]["task"] == "Complete testing"
        assert data["action_items"][0]["owner"] == "Rahul"
        assert data["action_items"][0]["deadline"] == "Thursday"


def test_no_decisions():
    mock_response = MeetingAnalysisResponse(
        summary="The team discussed several possible designs without finalizing any choice.",
        key_decisions=[],
        action_items=[]
    )

    with patch.object(MeetingAnalysisService, "analyze_transcript", return_value=mock_response):
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": "The team discussed several possible designs but did not decide which one to use."}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["key_decisions"] == []
        assert data["action_items"] == []


def test_no_owner():
    mock_response = MeetingAnalysisResponse(
        summary="Testing must be finished before Friday.",
        key_decisions=[],
        action_items=[
            ActionItem(task="Complete testing", owner=None, deadline="Friday")
        ]
    )

    with patch.object(MeetingAnalysisService, "analyze_transcript", return_value=mock_response):
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": "Testing must be completed by Friday."}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["action_items"]) == 1
        assert data["action_items"][0]["task"] == "Complete testing"
        assert data["action_items"][0]["owner"] is None
        assert data["action_items"][0]["deadline"] == "Friday"


def test_no_deadline():
    mock_response = MeetingAnalysisResponse(
        summary="Rahul committed to completing testing.",
        key_decisions=[],
        action_items=[
            ActionItem(task="Complete the testing", owner="Rahul", deadline=None)
        ]
    )

    with patch.object(MeetingAnalysisService, "analyze_transcript", return_value=mock_response):
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": "Rahul will complete the testing."}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["action_items"]) == 1
        assert data["action_items"][0]["task"] == "Complete the testing"
        assert data["action_items"][0]["owner"] == "Rahul"
        assert data["action_items"][0]["deadline"] is None


def test_no_owner_and_no_deadline():
    mock_response = MeetingAnalysisResponse(
        summary="General discussion on reviewing the payment integration.",
        key_decisions=[],
        action_items=[
            ActionItem(task="Review the payment integration", owner=None, deadline=None)
        ]
    )

    with patch.object(MeetingAnalysisService, "analyze_transcript", return_value=mock_response):
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": "Someone should review the payment integration."}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["action_items"]) == 1
        assert data["action_items"][0]["task"] == "Review the payment integration"
        assert data["action_items"][0]["owner"] is None
        assert data["action_items"][0]["deadline"] is None


def test_suggestion_is_not_decision():
    mock_response = MeetingAnalysisResponse(
        summary="The team talked about a possible Friday launch date.",
        key_decisions=[],
        action_items=[]
    )

    with patch.object(MeetingAnalysisService, "analyze_transcript", return_value=mock_response):
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": "Maybe we should launch Friday, but we have not decided yet."}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["key_decisions"] == []


def test_empty_transcript():
    with patch.object(MeetingAnalysisService, "analyze_transcript") as mock_analyze:
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": ""}
        )
        assert response.status_code == 422
        mock_analyze.assert_not_called()


def test_whitespace_transcript():
    with patch.object(MeetingAnalysisService, "analyze_transcript") as mock_analyze:
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": "    \n\t   "}
        )
        assert response.status_code == 422
        mock_analyze.assert_not_called()


def test_oversized_transcript():
    with patch.object(settings, "MAX_TRANSCRIPT_LENGTH", 50):
        response = client.post(
            "/api/v1/analyze",
            json={"transcript": "A" * 100}
        )
        assert response.status_code == 413
        data = response.json()
        assert "exceeds the maximum allowed length" in data["detail"]


def test_gemini_unavailable():
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = errors.APIError(
        code=503,
        response_json={"error": {"message": "Service Unavailable"}}
    )

    service = MeetingAnalysisService(client=mock_client)
    with pytest.raises(MeetingAnalysisException) as exc_info:
        service.analyze_transcript("The team decided to launch.")
    assert exc_info.value.status_code == 503
    assert "temporarily unavailable" in exc_info.value.detail


def test_malformed_gemini_output():
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed = None
    mock_response.text = '{"malformed": "json"}'
    mock_client.models.generate_content.return_value = mock_response

    service = MeetingAnalysisService(client=mock_client)
    with pytest.raises(InvalidAnalysisResponseException) as exc_info:
        service.analyze_transcript("Valid meeting discussion transcript.")
    assert exc_info.value.status_code == 502


def test_empty_gemini_summary():
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed = {
        "summary": "",
        "key_decisions": [],
        "action_items": []
    }
    mock_client.models.generate_content.return_value = mock_response

    service = MeetingAnalysisService(client=mock_client)
    with pytest.raises(InvalidAnalysisResponseException) as exc_info:
        service.analyze_transcript("Valid meeting discussion transcript.")
    assert exc_info.value.status_code == 502


def test_invalid_action_item():
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed = {
        "summary": "Valid summary",
        "key_decisions": [],
        "action_items": [
            {"task": "", "owner": None, "deadline": None}
        ]
    }
    mock_client.models.generate_content.return_value = mock_response

    service = MeetingAnalysisService(client=mock_client)
    with pytest.raises(InvalidAnalysisResponseException) as exc_info:
        service.analyze_transcript("Valid meeting discussion transcript.")
    assert exc_info.value.status_code == 502


def test_deduplicate_action_items():
    service = MeetingAnalysisService()
    items = [
        ActionItem(task="Complete testing", owner="Rahul", deadline="Thursday"),
        ActionItem(task="Complete testing", owner="Rahul", deadline="Thursday"),
        ActionItem(task="Complete testing", owner=None, deadline="Thursday"),
        ActionItem(task="Review PR", owner="Priya", deadline=None),
    ]
    deduped = service.deduplicate_action_items(items)
    assert len(deduped) == 3
    assert deduped[0].task == "Complete testing"
    assert deduped[0].owner == "Rahul"
    assert deduped[1].owner is None
    assert deduped[2].task == "Review PR"


@pytest.mark.skipif(
    not (os.environ.get("RUN_LIVE_GEMINI_TEST") == "true" and os.environ.get("GEMINI_API_KEY")),
    reason="Live Gemini API test requires RUN_LIVE_GEMINI_TEST=true and GEMINI_API_KEY set"
)
def test_live_meeting_analysis_opt_in():
    service = MeetingAnalysisService()
    result = service.analyze_transcript(
        "The leadership team decided to launch the new payment gateway on Friday. Rahul will complete QA testing by Thursday."
    )
    assert len(result.summary) > 0
    assert len(result.key_decisions) >= 1
    assert any("Rahul" == item.owner for item in result.action_items)
