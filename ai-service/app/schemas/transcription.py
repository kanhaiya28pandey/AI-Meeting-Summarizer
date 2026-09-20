from typing import Optional
from pydantic import BaseModel, Field


class TranscriptSegment(BaseModel):
    speaker: Optional[str] = Field(
        default=None,
        description="Speaker label (e.g. spk_1, spk_2) or null if unassigned",
        examples=["spk_1"]
    )
    text: str = Field(
        ...,
        description="Transcribed text for this segment",
        examples=["Hello everyone. Let's begin the meeting."]
    )
    start_time: Optional[float] = Field(
        default=None,
        description="Start time offset in seconds or null if unavailable",
        examples=[0.0]
    )
    end_time: Optional[float] = Field(
        default=None,
        description="End time offset in seconds or null if unavailable",
        examples=[4.8]
    )


class TranscriptionResponse(BaseModel):
    success: bool = Field(
        default=True,
        description="Indicates whether transcription succeeded"
    )
    transcript: str = Field(
        ...,
        description="Complete verbatim transcript of the audio recording"
    )
    language: Optional[str] = Field(
        default=None,
        description="Detected spoken language code (e.g. en, es) or null if undetected",
        examples=["en"]
    )
    segments: list[TranscriptSegment] = Field(
        default_factory=list,
        description="Segment-level transcript with optional speaker and timestamp attributions"
    )
    duration: Optional[int] = Field(
        default=None,
        description="Duration of the audio/video recording in seconds"
    )
