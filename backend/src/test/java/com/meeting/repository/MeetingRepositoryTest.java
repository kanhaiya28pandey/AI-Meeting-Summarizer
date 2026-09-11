package com.meeting.repository;

import com.meeting.model.ActionItem;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class MeetingRepositoryTest {

    @Autowired
    private MeetingRepository meetingRepository;

    @Test
    @DisplayName("Saves and reloads meeting with full JSONB collections, verifying structural fidelity")
    void shouldSaveAndRetrieveMeetingWithJsonbFields() {
        Meeting meeting = new Meeting(
                "Sprint Planning Meeting",
                "sprint_planning.mp3",
                "audio/mpeg",
                MeetingStatus.UPLOADED
        );
        meeting.setDuration(1800);
        meeting.setTranscript("00:00 Rahul: Let's begin the sprint planning.");
        meeting.setSummary("Team discussed goals and deadlines.");

        meeting.setKeyDecisions(List.of(
                "Release version 2.0 on September 25",
                "Prioritize payment integration"
        ));

        meeting.setActionItems(List.of(
                new ActionItem("Complete payment testing", "Rahul", LocalDate.of(2026, 9, 18)),
                new ActionItem("Prepare release notes", "Priya", null)
        ));

        Meeting savedMeeting = meetingRepository.save(meeting);

        assertNotNull(savedMeeting.getId());
        UUID meetingId = savedMeeting.getId();

        assertNotNull(savedMeeting.getCreatedAt());
        assertNotNull(savedMeeting.getUpdatedAt());

        Optional<Meeting> retrievedOptional = meetingRepository.findById(meetingId);
        assertTrue(retrievedOptional.isPresent());

        Meeting retrievedMeeting = retrievedOptional.get();
        assertEquals("Sprint Planning Meeting", retrievedMeeting.getTitle());
        assertEquals("sprint_planning.mp3", retrievedMeeting.getOriginalFileName());
        assertEquals("audio/mpeg", retrievedMeeting.getFileType());
        assertEquals(MeetingStatus.UPLOADED, retrievedMeeting.getStatus());
        assertEquals(1800, retrievedMeeting.getDuration());
        assertEquals("00:00 Rahul: Let's begin the sprint planning.", retrievedMeeting.getTranscript());
        assertEquals("Team discussed goals and deadlines.", retrievedMeeting.getSummary());

        assertEquals(2, retrievedMeeting.getKeyDecisions().size());
        assertEquals("Release version 2.0 on September 25", retrievedMeeting.getKeyDecisions().get(0));

        assertEquals(2, retrievedMeeting.getActionItems().size());
        ActionItem item1 = retrievedMeeting.getActionItems().get(0);
        assertEquals("Complete payment testing", item1.getTask());
        assertEquals("Rahul", item1.getOwner());
        assertEquals(LocalDate.of(2026, 9, 18), item1.getDeadline());

        ActionItem item2 = retrievedMeeting.getActionItems().get(1);
        assertEquals("Prepare release notes", item2.getTask());
        assertEquals("Priya", item2.getOwner());
        assertNull(item2.getDeadline());
    }

    @ParameterizedTest
    @EnumSource(MeetingStatus.class)
    @DisplayName("Persists all meeting status enum values correctly")
    void shouldPersistAllMeetingStatuses(MeetingStatus status) {
        Meeting meeting = new Meeting("Status Test " + status, "test.mp3", "audio/mpeg", status);
        Meeting saved = meetingRepository.save(meeting);

        Meeting reloaded = meetingRepository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(status);
    }

    @Test
    @DisplayName("Handles empty arrays and null optional values in JSONB without error")
    void shouldHandleEmptyArraysAndNullOptionalsInJsonb() {
        Meeting meeting = new Meeting("Empty JSONB Test", "empty.mp3", "audio/mpeg", MeetingStatus.COMPLETED);
        meeting.setKeyDecisions(new ArrayList<>());
        meeting.setActionItems(List.of(
                new ActionItem("Action with no owner and no deadline", null, null)
        ));

        Meeting saved = meetingRepository.save(meeting);
        Meeting reloaded = meetingRepository.findById(saved.getId()).orElseThrow();

        assertThat(reloaded.getKeyDecisions()).isEmpty();
        assertThat(reloaded.getActionItems()).hasSize(1);
        assertThat(reloaded.getActionItems().get(0).getTask()).isEqualTo("Action with no owner and no deadline");
        assertThat(reloaded.getActionItems().get(0).getOwner()).isNull();
        assertThat(reloaded.getActionItems().get(0).getDeadline()).isNull();
    }

    @Test
    @DisplayName("findAllByOrderByCreatedAtDesc returns meetings in reverse chronological order")
    void shouldFindAllOrderedByCreatedAtDesc() {
        meetingRepository.save(new Meeting("First Meeting", "1.mp3", "audio/mpeg", MeetingStatus.UPLOADED));
        meetingRepository.save(new Meeting("Second Meeting", "2.mp3", "audio/mpeg", MeetingStatus.UPLOADED));

        List<Meeting> all = meetingRepository.findAllByOrderByCreatedAtDesc();
        assertThat(all).isNotEmpty();
        for (int i = 0; i < all.size() - 1; i++) {
            java.time.LocalDateTime curr = all.get(i).getCreatedAt();
            java.time.LocalDateTime next = all.get(i + 1).getCreatedAt();
            if (curr != null && next != null) {
                assertThat(curr).isAfterOrEqualTo(next);
            }
        }
    }

    @Test
    @DisplayName("Deletes meeting entity cleanly")
    void shouldDeleteMeeting() {
        Meeting meeting = meetingRepository.save(new Meeting("To Delete", "del.mp3", "audio/mpeg", MeetingStatus.UPLOADED));
        UUID id = meeting.getId();

        assertTrue(meetingRepository.existsById(id));
        meetingRepository.deleteById(id);
        assertFalse(meetingRepository.existsById(id));
    }
}
