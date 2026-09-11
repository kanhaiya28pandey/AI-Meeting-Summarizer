import pytest
from pydantic import ValidationError

from uuid import UUID
from app.schemas.transcription import TranscriptionResponse, TranscriptSegment
from app.schemas.analysis import MeetingAnalysisResponse, ActionItem
from app.schemas.process import ProcessResponse
from tests.fixtures.sample_payloads import (
    SAMPLE_TRANSCRIPTION_RESPONSE,
    SAMPLE_ANALYSIS_RESPONSE,
    SAMPLE_PROCESS_RESPONSE,
    SAMPLE_ACTION_ITEM_NULLS,
)

def test_transcription_response_contract():
    """Verify transcription response schema adheres strictly to Spring Boot DTO expectations."""
    model = TranscriptionResponse(**SAMPLE_TRANSCRIPTION_RESPONSE)
    assert model.success is True
    assert isinstance(model.transcript, str)
    assert model.language == "en"
    assert len(model.segments) == 2
    assert model.segments[0].speaker == "Alice"
    assert model.segments[0].start_time == 1.0

def test_analysis_response_contract():
    """Verify analysis response schema contains summary, key_decisions, and action_items."""
    model = MeetingAnalysisResponse(**SAMPLE_ANALYSIS_RESPONSE)
    assert model.summary == "Team aligned on Friday launch."
    assert model.key_decisions == ["Launch on Friday"]
    assert len(model.action_items) == 1
    assert model.action_items[0].task == "Complete testing"
    assert model.action_items[0].owner == "Rahul"
    assert model.action_items[0].deadline == "2026-09-18"

def test_action_item_nullable_contract():
    """Verify action items with null owner and deadline deserialize cleanly."""
    model = ActionItem(**SAMPLE_ACTION_ITEM_NULLS)
    assert model.task == "Complete testing"
    assert model.owner is None
    assert model.deadline is None

def test_process_response_contract():
    """Verify process acknowledgement schema preserves meetingId and success."""
    model = ProcessResponse(**SAMPLE_PROCESS_RESPONSE)
    assert model.success is True
    assert model.meetingId == UUID("123e4567-e89b-12d3-a456-426614174000")
    assert "AI Meeting Summarizer" in model.service

def test_contract_rejects_missing_required_fields():
    """Verify schema validation catches missing required fields."""
    with pytest.raises(ValidationError):
        MeetingAnalysisResponse(summary=None, key_decisions=[], action_items=[])

    with pytest.raises(ValidationError):
        ActionItem(task=None, owner="Alice", deadline="Friday")
