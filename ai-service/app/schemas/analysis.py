from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ActionItem(BaseModel):
    task: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Actionable task or deliverable explicitly identified in the transcript"
    )
    owner: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Explicit assignee/owner identified in the transcript; null if not explicitly assigned"
    )
    deadline: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Explicit due date or timeframe identified in the transcript; null if not explicitly mentioned"
    )

    @field_validator("task")
    @classmethod
    def task_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Action item task cannot be empty or whitespace only")
        return v.strip()

    @field_validator("owner", "deadline")
    @classmethod
    def clean_optional_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if not cleaned or cleaned.lower() in ("null", "none"):
                return None
            return cleaned
        return None


class MeetingAnalysisRequest(BaseModel):
    transcript: str = Field(
        ...,
        min_length=1,
        description="Full text transcript of the meeting to analyze"
    )

    @field_validator("transcript")
    @classmethod
    def transcript_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Transcript cannot be empty or whitespace only")
        return v.strip()


class MeetingAnalysisResponse(BaseModel):
    summary: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Concise factual summary of the meeting discussion"
    )
    key_decisions: list[str] = Field(
        default_factory=list,
        max_length=50,
        description="Explicit decisions agreed upon during the meeting; empty array if none"
    )
    action_items: list[ActionItem] = Field(
        default_factory=list,
        max_length=50,
        description="Explicit action items and deliverables; empty array if none"
    )

    @field_validator("summary")
    @classmethod
    def summary_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Summary cannot be empty or whitespace only")
        return v.strip()
