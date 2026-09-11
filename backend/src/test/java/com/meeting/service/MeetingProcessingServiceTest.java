package com.meeting.service;

import com.meeting.dto.ai.AiActionItem;
import com.meeting.dto.ai.AiAnalysisResponse;
import com.meeting.dto.ai.AiTranscriptionResponse;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;
import com.meeting.repository.MeetingRepository;
import com.meeting.support.MeetingTestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MeetingProcessingServiceTest {

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private AiServiceClient aiServiceClient;

    @Mock
    private TemporaryFileService temporaryFileService;

    private MeetingProcessingService processingService;

    private final Path tempAudioPath = Paths.get("target/test-temp/uploads/test.mp3");

    @BeforeEach
    void setUp() {
        processingService = new MeetingProcessingService(meetingRepository, aiServiceClient, temporaryFileService);
    }

    @Test
    @DisplayName("Complete successful lifecycle: UPLOADED -> TRANSCRIBING -> ANALYZING -> SAVING -> COMPLETED")
    void executeProcessingPipeline_Success() {
        UUID meetingId = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createUploaded("Sprint Review"), meetingId);

        when(meetingRepository.findById(meetingId)).thenReturn(Optional.of(meeting));
        when(meetingRepository.existsById(meetingId)).thenReturn(true);
        when(meetingRepository.save(any(Meeting.class))).thenAnswer(inv -> inv.getArgument(0));

        AiTranscriptionResponse transcriptionResponse = new AiTranscriptionResponse(
                true, "Alice: Launch Friday.", "en", List.of()
        );
        when(aiServiceClient.transcribe(eq(tempAudioPath), eq("recording.mp3"))).thenReturn(transcriptionResponse);

        AiAnalysisResponse analysisResponse = new AiAnalysisResponse(
                "Launch on Friday",
                List.of("Go live Friday"),
                List.of(new AiActionItem("QA test", "Alice", "2026-09-25"))
        );
        when(aiServiceClient.analyze("Alice: Launch Friday.")).thenReturn(analysisResponse);

        processingService.executeProcessingPipeline(meetingId, tempAudioPath, "recording.mp3");

        InOrder inOrder = inOrder(aiServiceClient, meetingRepository, temporaryFileService);
        // 1. transcribe called
        inOrder.verify(aiServiceClient).transcribe(eq(tempAudioPath), eq("recording.mp3"));
        // 2. analyze called
        inOrder.verify(aiServiceClient).analyze("Alice: Launch Friday.");
        // 3. temp audio deleted
        inOrder.verify(temporaryFileService).deleteTemporaryFile(tempAudioPath);

        assertThat(meeting.getStatus()).isEqualTo(MeetingStatus.COMPLETED);
        assertThat(meeting.getTranscript()).isEqualTo("Alice: Launch Friday.");
        assertThat(meeting.getSummary()).isEqualTo("Launch on Friday");
        assertThat(meeting.getKeyDecisions()).containsExactly("Go live Friday");
        assertThat(meeting.getActionItems()).hasSize(1);
    }

    @Test
    @DisplayName("Transcription failure sets status to FAILED, skips analysis, and cleans temp files")
    void executeProcessingPipeline_TranscriptionFailure() {
        UUID meetingId = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createUploaded("Failed Transcription"), meetingId);

        when(meetingRepository.findById(meetingId)).thenReturn(Optional.of(meeting));
        when(meetingRepository.existsById(meetingId)).thenReturn(true);
        when(meetingRepository.save(any(Meeting.class))).thenAnswer(inv -> inv.getArgument(0));
        when(aiServiceClient.transcribe(any(), any())).thenThrow(new RuntimeException("FastAPI 500 error"));

        processingService.executeProcessingPipeline(meetingId, tempAudioPath, "test.mp3");

        verify(aiServiceClient, never()).analyze(any());
        verify(temporaryFileService).deleteTemporaryFile(tempAudioPath);
        assertThat(meeting.getStatus()).isEqualTo(MeetingStatus.FAILED);
    }

    @Test
    @DisplayName("Empty transcription output sets status to FAILED and skips analysis")
    void executeProcessingPipeline_EmptyTranscript() {
        UUID meetingId = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createUploaded("Empty Transcript"), meetingId);

        when(meetingRepository.findById(meetingId)).thenReturn(Optional.of(meeting));
        when(meetingRepository.existsById(meetingId)).thenReturn(true);
        when(meetingRepository.save(any(Meeting.class))).thenAnswer(inv -> inv.getArgument(0));
        when(aiServiceClient.transcribe(any(), any())).thenReturn(new AiTranscriptionResponse(true, "   ", "en", List.of()));

        processingService.executeProcessingPipeline(meetingId, tempAudioPath, "test.mp3");

        verify(aiServiceClient, never()).analyze(any());
        verify(temporaryFileService).deleteTemporaryFile(tempAudioPath);
        assertThat(meeting.getStatus()).isEqualTo(MeetingStatus.FAILED);
    }

    @Test
    @DisplayName("Analysis failure preserves transcript, sets status to FAILED, does not fabricate summary, and cleans temp file")
    void executeProcessingPipeline_AnalysisFailure() {
        UUID meetingId = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createUploaded("Analysis Error"), meetingId);

        when(meetingRepository.findById(meetingId)).thenReturn(Optional.of(meeting));
        when(meetingRepository.existsById(meetingId)).thenReturn(true);
        when(meetingRepository.save(any(Meeting.class))).thenAnswer(inv -> inv.getArgument(0));

        when(aiServiceClient.transcribe(any(), any())).thenReturn(
                new AiTranscriptionResponse(true, "Valid transcript preserved", "en", List.of())
        );
        when(aiServiceClient.analyze(any())).thenThrow(new RuntimeException("Gemini timeout"));

        processingService.executeProcessingPipeline(meetingId, tempAudioPath, "test.mp3");

        verify(temporaryFileService).deleteTemporaryFile(tempAudioPath);
        assertThat(meeting.getStatus()).isEqualTo(MeetingStatus.FAILED);
        assertThat(meeting.getTranscript()).isEqualTo("Valid transcript preserved");
        assertThat(meeting.getSummary()).isNull();
    }

    @Test
    @DisplayName("Duplicate concurrent processing trigger is rejected by in-memory guard")
    void executeProcessingPipeline_ConcurrentDuplicateRejected() throws InterruptedException {
        UUID meetingId = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createUploaded("Concurrent Sync"), meetingId);

        CountDownLatch firstThreadStarted = new CountDownLatch(1);
        CountDownLatch finishFirstThread = new CountDownLatch(1);

        when(meetingRepository.findById(meetingId)).thenReturn(Optional.of(meeting));
        when(meetingRepository.existsById(meetingId)).thenReturn(true);
        when(meetingRepository.save(any(Meeting.class))).thenAnswer(inv -> inv.getArgument(0));

        when(aiServiceClient.transcribe(any(), any())).thenAnswer(inv -> {
            firstThreadStarted.countDown();
            finishFirstThread.await(5, TimeUnit.SECONDS);
            return new AiTranscriptionResponse(true, "Done", "en", List.of());
        });
        when(aiServiceClient.analyze(any())).thenReturn(new AiAnalysisResponse("Summary", List.of(), List.of()));

        ExecutorService executor = Executors.newFixedThreadPool(2);
        AtomicInteger completedPipelines = new AtomicInteger(0);

        executor.submit(() -> {
            processingService.executeProcessingPipeline(meetingId, tempAudioPath, "test.mp3");
            completedPipelines.incrementAndGet();
        });

        firstThreadStarted.await(5, TimeUnit.SECONDS);

        // Attempt second concurrent execution for same meetingId
        executor.submit(() -> {
            processingService.executeProcessingPipeline(meetingId, tempAudioPath, "test.mp3");
            completedPipelines.incrementAndGet();
        });

        finishFirstThread.countDown();
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        // Transcription should only have been called ONCE because the second execution was rejected
        verify(aiServiceClient, times(1)).transcribe(any(), any());
    }

    @Test
    @DisplayName("Processing already COMPLETED meeting is skipped without state change")
    void executeProcessingPipeline_AlreadyCompletedSkipped() {
        UUID meetingId = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createCompleted("Already Done"), meetingId);

        when(meetingRepository.findById(meetingId)).thenReturn(Optional.of(meeting));

        processingService.executeProcessingPipeline(meetingId, tempAudioPath, "test.mp3");

        verifyNoInteractions(aiServiceClient);
        verify(temporaryFileService).deleteTemporaryFile(tempAudioPath);
    }

    @Test
    @DisplayName("Meeting deleted during processing aborts pipeline gracefully")
    void executeProcessingPipeline_DeletedDuringProcessing() {
        UUID meetingId = UUID.randomUUID();
        Meeting meeting = MeetingTestFactory.withGeneratedId(MeetingTestFactory.createUploaded("Will Be Deleted"), meetingId);

        when(meetingRepository.findById(meetingId)).thenReturn(Optional.of(meeting));
        // First exists check is true, then false (deleted by user)
        when(meetingRepository.existsById(meetingId)).thenReturn(true, false);

        when(aiServiceClient.transcribe(any(), any())).thenReturn(
                new AiTranscriptionResponse(true, "Transcript", "en", List.of())
        );

        processingService.executeProcessingPipeline(meetingId, tempAudioPath, "test.mp3");

        verify(aiServiceClient, never()).analyze(any());
        verify(temporaryFileService).deleteTemporaryFile(tempAudioPath);
    }

    @Test
    @DisplayName("Null meetingId aborts immediately without error")
    void executeProcessingPipeline_NullMeetingId() {
        processingService.executeProcessingPipeline(null, tempAudioPath, "test.mp3");
        verifyNoInteractions(meetingRepository, aiServiceClient, temporaryFileService);
    }
}
