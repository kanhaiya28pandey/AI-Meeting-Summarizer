package com.meeting.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AiProcessRequest(
        @NotNull(message = "Meeting ID cannot be null")
        UUID meetingId
) {}
