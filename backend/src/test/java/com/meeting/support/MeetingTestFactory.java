package com.meeting.support;

import com.meeting.model.ActionItem;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class MeetingTestFactory {

    private MeetingTestFactory() {
    }

    public static Meeting createUploaded(String title) {
        Meeting meeting = new Meeting(
                title != null ? title : "Quarterly Planning",
                "recording.mp3",
                "audio/mpeg",
                MeetingStatus.UPLOADED
        );
        meeting.setDuration(120);
        return meeting;
    }

    public static Meeting createTranscribing(String title) {
        Meeting meeting = createUploaded(title);
        meeting.setStatus(MeetingStatus.TRANSCRIBING);
        return meeting;
    }

    public static Meeting createCompleted(String title) {
        Meeting meeting = new Meeting(
                title != null ? title : "Sprint Retrospective",
                "retro.mp4",
                "video/mp4",
                MeetingStatus.COMPLETED
        );
        meeting.setDuration(300);
        meeting.setTranscript("00:01 Alice: Welcome everyone.\n00:05 Bob: Let's discuss action items.");
        meeting.setSummary("The team reviewed sprint progress and aligned on launch timelines.");
        meeting.setKeyDecisions(new ArrayList<>(List.of("Launch scheduled for Friday", "QA sign-off required by Thursday")));
        meeting.setActionItems(new ArrayList<>(List.of(
                new ActionItem("Finalize documentation", "Alice", LocalDate.of(2026, 9, 18)),
                new ActionItem("Verify migration script", "Bob", null)
        )));
        return meeting;
    }

    public static Meeting createFailed(String title, String reason) {
        Meeting meeting = createUploaded(title);
        meeting.setStatus(MeetingStatus.FAILED);
        meeting.setTranscript(reason);
        return meeting;
    }

    public static Meeting withGeneratedId(Meeting meeting, UUID id) {
        try {
            Field idField = Meeting.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(meeting, id != null ? id : UUID.randomUUID());

            Field createdAtField = Meeting.class.getDeclaredField("createdAt");
            createdAtField.setAccessible(true);
            if (createdAtField.get(meeting) == null) {
                createdAtField.set(meeting, LocalDateTime.now().minusMinutes(10));
            }

            Field updatedAtField = Meeting.class.getDeclaredField("updatedAt");
            updatedAtField.setAccessible(true);
            if (updatedAtField.get(meeting) == null) {
                updatedAtField.set(meeting, LocalDateTime.now());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to set generated id on Meeting entity", e);
        }
        return meeting;
    }
}
