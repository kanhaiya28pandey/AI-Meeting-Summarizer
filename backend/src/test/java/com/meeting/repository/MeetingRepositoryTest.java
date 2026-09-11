package com.meeting.repository;

import com.meeting.model.ActionItem;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class MeetingRepositoryTest {

    @Autowired
    private MeetingRepository meetingRepository;

    @Test
    void shouldSaveAndRetrieveMeetingWithJsonbFields() {
        // 1. Create a Meeting entity
        Meeting meeting = new Meeting(
                "Sprint Planning Meeting",
                "sprint_planning.mp3",
                "audio/mpeg",
                MeetingStatus.UPLOADED
        );
        meeting.setDuration(1800);
        meeting.setTranscript("00:00 Rahul: Let's begin the sprint planning.");
        meeting.setSummary("Team discussed goals and deadlines.");

        // Add Key Decisions (JSONB)
        meeting.setKeyDecisions(List.of(
                "Release version 2.0 on September 25",
                "Prioritize payment integration"
        ));

        // Add Action Items (JSONB)
        meeting.setActionItems(List.of(
                new ActionItem("Complete payment testing", "Rahul", LocalDate.of(2026, 9, 18)),
                new ActionItem("Prepare release notes", "Priya", null)
        ));

        // 2. Save using MeetingRepository
        Meeting savedMeeting = meetingRepository.save(meeting);

        // 3. Confirm an ID was generated
        assertNotNull(savedMeeting.getId());
        UUID meetingId = savedMeeting.getId();

        // 4. Confirm timestamps were automatically generated
        assertNotNull(savedMeeting.getCreatedAt());
        assertNotNull(savedMeeting.getUpdatedAt());

        // 5. Retrieve using the generated ID
        Optional<Meeting> retrievedOptional = meetingRepository.findById(meetingId);
        assertTrue(retrievedOptional.isPresent());

        // 6. Assert that the stored data matches
        Meeting retrievedMeeting = retrievedOptional.get();
        assertEquals("Sprint Planning Meeting", retrievedMeeting.getTitle());
        assertEquals("sprint_planning.mp3", retrievedMeeting.getOriginalFileName());
        assertEquals("audio/mpeg", retrievedMeeting.getFileType());
        assertEquals(MeetingStatus.UPLOADED, retrievedMeeting.getStatus());
        assertEquals(1800, retrievedMeeting.getDuration());
        assertEquals("00:00 Rahul: Let's begin the sprint planning.", retrievedMeeting.getTranscript());
        assertEquals("Team discussed goals and deadlines.", retrievedMeeting.getSummary());

        // Verify JSONB collections
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
        assertEquals(null, item2.getDeadline());
    }
}
