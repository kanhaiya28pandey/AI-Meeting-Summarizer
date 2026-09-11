package com.meeting.service;

import com.meeting.dto.AiProcessResponse;
import com.meeting.dto.CreateMeetingRequest;
import com.meeting.dto.MeetingResponse;
import com.meeting.exception.MeetingNotFoundException;
import com.meeting.model.ActionItem;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;
import com.meeting.repository.MeetingRepository;
import com.meeting.support.MeetingTestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MeetingServiceUnitTest {

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private AiServiceClient aiServiceClient;

    private MeetingService meetingService;

    @BeforeEach
    void setUp() {
        meetingService = new MeetingService(meetingRepository, aiServiceClient);
    }

    @Test
    @DisplayName("createMeeting sets default UPLOADED status and protects system fields from client override")
    void createMeeting_Success() {
        CreateMeetingRequest request = new CreateMeetingRequest("Design Sync", "audio.mp3", "audio/mpeg", 180);
        UUID generatedId = UUID.randomUUID();

        when(meetingRepository.save(any(Meeting.class))).thenAnswer(invocation -> {
            Meeting toSave = invocation.getArgument(0);
            return MeetingTestFactory.withGeneratedId(toSave, generatedId);
        });

        MeetingResponse response = meetingService.createMeeting(request);

        ArgumentCaptor<Meeting> captor = ArgumentCaptor.forClass(Meeting.class);
        verify(meetingRepository).save(captor.capture());
        Meeting captured = captor.getValue();

        assertThat(captured.getTitle()).isEqualTo("Design Sync");
        assertThat(captured.getOriginalFileName()).isEqualTo("audio.mp3");
        assertThat(captured.getFileType()).isEqualTo("audio/mpeg");
        assertThat(captured.getDuration()).isEqualTo(180);
        assertThat(captured.getStatus()).isEqualTo(MeetingStatus.UPLOADED);
        assertThat(captured.getTranscript()).isNull();
        assertThat(captured.getSummary()).isNull();
        assertThat(captured.getKeyDecisions()).isEmpty();
        assertThat(captured.getActionItems()).isEmpty();

        assertThat(response.getId()).isEqualTo(generatedId);
        assertThat(response.getStatus()).isEqualTo(MeetingStatus.UPLOADED);
        assertThat(response.getCreatedAt()).isNotNull();
        assertThat(response.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("getMeetingById returns DTO when meeting exists")
    void getMeetingById_Found() {
        UUID id = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createCompleted("Demo Meeting"), id);
        when(meetingRepository.findById(id)).thenReturn(Optional.of(meeting));

        MeetingResponse response = meetingService.getMeetingById(id);

        assertThat(response.getId()).isEqualTo(id);
        assertThat(response.getTitle()).isEqualTo("Demo Meeting");
        assertThat(response.getStatus()).isEqualTo(MeetingStatus.COMPLETED);
        assertThat(response.getSummary()).isNotNull();
        assertThat(response.getKeyDecisions()).hasSize(2);
        assertThat(response.getActionItems()).hasSize(2);
    }

    @Test
    @DisplayName("getMeetingById throws MeetingNotFoundException when missing")
    void getMeetingById_NotFound() {
        UUID id = UUID.randomUUID();
        when(meetingRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> meetingService.getMeetingById(id))
                .isInstanceOf(MeetingNotFoundException.class)
                .hasMessageContaining(id.toString());
    }

    @Test
    @DisplayName("getAllMeetings returns ordered list of meeting responses")
    void getAllMeetings_Success() {
        Meeting m1 = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createCompleted("Meeting 1"), UUID.randomUUID());
        Meeting m2 = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createUploaded("Meeting 2"), UUID.randomUUID());
        when(meetingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(m1, m2));

        List<MeetingResponse> result = meetingService.getAllMeetings();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Meeting 1");
        assertThat(result.get(1).getTitle()).isEqualTo("Meeting 2");
    }

    @Test
    @DisplayName("deleteMeeting succeeds when meeting exists")
    void deleteMeeting_Success() {
        UUID id = UUID.randomUUID();
        when(meetingRepository.existsById(id)).thenReturn(true);

        meetingService.deleteMeeting(id);

        verify(meetingRepository).deleteById(id);
    }

    @Test
    @DisplayName("deleteMeeting throws MeetingNotFoundException when meeting does not exist")
    void deleteMeeting_NotFound() {
        UUID id = UUID.randomUUID();
        when(meetingRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> meetingService.deleteMeeting(id))
                .isInstanceOf(MeetingNotFoundException.class);
        verify(meetingRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("processMeeting returns 404 when meeting does not exist")
    void processMeeting_NotFound() {
        UUID id = UUID.randomUUID();
        when(meetingRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> meetingService.processMeeting(id))
                .isInstanceOf(MeetingNotFoundException.class);
        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("processMeeting short-circuits when meeting is already completed")
    void processMeeting_AlreadyCompleted() {
        UUID id = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createCompleted("Done"), id);
        when(meetingRepository.findById(id)).thenReturn(Optional.of(meeting));

        AiProcessResponse response = meetingService.processMeeting(id);

        assertThat(response.success()).isTrue();
        assertThat(response.message()).contains("already completed");
        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("processMeeting short-circuits when meeting is currently processing")
    void processMeeting_InProgress() {
        UUID id = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createTranscribing("Transcribing"), id);
        when(meetingRepository.findById(id)).thenReturn(Optional.of(meeting));

        AiProcessResponse response = meetingService.processMeeting(id);

        assertThat(response.success()).isTrue();
        assertThat(response.message()).contains("currently being processed");
        verifyNoInteractions(aiServiceClient);
    }

    @Test
    @DisplayName("processMeeting delegates to AI client when meeting is UPLOADED or FAILED")
    void processMeeting_DelegatesToAiClient() {
        UUID id = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createUploaded("Ready"), id);
        when(meetingRepository.findById(id)).thenReturn(Optional.of(meeting));
        when(aiServiceClient.triggerProcessing(id)).thenReturn(new AiProcessResponse(true, id, "AI Service", "Accepted"));

        AiProcessResponse response = meetingService.processMeeting(id);

        assertThat(response.success()).isTrue();
        verify(aiServiceClient).triggerProcessing(id);
    }
}
