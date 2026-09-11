package com.meeting.support;

import com.meeting.dto.MeetingResponse;
import com.meeting.model.ActionItem;
import com.meeting.model.MeetingStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class MeetingResponseFactory {

    private MeetingResponseFactory() {
    }

    public static MeetingResponse createSampleResponse(UUID id, String title, MeetingStatus status) {
        return new MeetingResponse(
                id != null ? id : UUID.randomUUID(),
                title,
                "audio_sample.mp3",
                "audio/mpeg",
                180,
                "Sample transcript",
                "Sample summary",
                List.of("Decision 1"),
                List.of(ActionItemTestFactory.createDefault()),
                status,
                LocalDateTime.now().minusMinutes(5),
                LocalDateTime.now()
        );
    }
}
