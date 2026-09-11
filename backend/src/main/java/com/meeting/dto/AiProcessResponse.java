package com.meeting.dto;

import java.util.UUID;

public record AiProcessResponse(
        boolean success,
        UUID meetingId,
        String service,
        String message
) {}
