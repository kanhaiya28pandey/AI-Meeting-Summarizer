from uuid import UUID
from pydantic import BaseModel, Field


class ProcessRequest(BaseModel):
    meetingId: UUID = Field(
        ...,
        description="Unique identifier of the meeting to process",
        examples=["8e0c6f35-5b3f-4e6e-9d5e-7d2a4a3f7e10"]
    )


class ProcessResponse(BaseModel):
    success: bool = Field(
        default=True,
        description="Indicates if the processing request was successfully accepted"
    )
    meetingId: UUID = Field(
        ...,
        description="Unique identifier of the meeting being processed"
    )
    service: str = Field(
        default="AI Meeting Summarizer AI Service",
        description="Name of the responding AI service"
    )
    message: str = Field(
        default="Meeting processing request accepted",
        description="Acknowledgement message"
    )
