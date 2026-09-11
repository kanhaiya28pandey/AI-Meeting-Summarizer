from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ActionItem(BaseModel):
    task: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Actionable task or deliverable description"
    )
    owner: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Assignee/owner explicitly stated in text; null if not explicitly mentioned"
    )
    deadline: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Due date or timeframe explicitly stated in text; null if not explicitly mentioned"
    )


class GeminiTestRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=20000,
        description="Meeting text snippet or discussion notes to analyze with Gemini"
    )

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Text input cannot be empty or whitespace only")
        return v.strip()


class GeminiTestResponse(BaseModel):
    summary: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Concise, factual summary of the meeting discussion"
    )
    key_decisions: list[str] = Field(
        default_factory=list,
        max_length=50,
        description="Explicit key decisions made during the meeting; empty array if none"
    )
    action_items: list[ActionItem] = Field(
        default_factory=list,
        max_length=50,
        description="Explicit action items identified; empty array if none"
    )
