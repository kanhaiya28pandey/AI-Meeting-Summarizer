package com.meeting.integration;

import com.meeting.dto.AiProcessResponse;
import com.meeting.dto.MeetingResponse;
import com.meeting.dto.ai.AiAnalysisResponse;
import com.meeting.dto.ai.AiTranscriptionResponse;
import com.meeting.exception.MeetingNotFoundException;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;
import com.meeting.repository.MeetingRepository;
import com.meeting.service.AiServiceClient;
import com.meeting.service.MeetingProcessingService;
import com.meeting.service.MeetingService;
import com.meeting.service.TemporaryFileService;
import com.meeting.support.MeetingTestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
class MeetingConcurrencyRaceTest {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private MeetingService meetingService;

    @Autowired
    private MeetingProcessingService meetingProcessingService;

    @Autowired
    private TemporaryFileService temporaryFileService;

    @MockitoBean
    private AiServiceClient aiServiceClient;

    @BeforeEach
    void clean() {
        meetingRepository.deleteAll();
    }

    @Test
    @DisplayName("Race condition: concurrent process and delete operations keep database in consistent state")
    void testConcurrentProcessAndDelete() throws Exception {
        Meeting meeting = meetingRepository.save(MeetingTestFactory.createUploaded("Race Test Meeting"));
        UUID meetingId = meeting.getId();

        Path dummyPath = Files.createTempFile("race_test", ".mp3");

        CountDownLatch processingStarted = new CountDownLatch(1);
        CountDownLatch finishPipeline = new CountDownLatch(1);

        when(aiServiceClient.transcribe(any(), any())).thenAnswer(inv -> {
            processingStarted.countDown();
            finishPipeline.await(5, TimeUnit.SECONDS);
            return new AiTranscriptionResponse(true, "Transcribed during race", "en", List.of());
        });
        when(aiServiceClient.analyze(any())).thenReturn(new AiAnalysisResponse("Summary", List.of(), List.of()));

        ExecutorService executor = Executors.newFixedThreadPool(2);

        // Thread 1: starts processing pipeline
        Future<?> processFuture = executor.submit(() -> {
            meetingProcessingService.executeProcessingPipeline(meetingId, dummyPath, "race_test.mp3");
        });

        // Wait until pipeline is actively inside transcription
        boolean started = processingStarted.await(5, TimeUnit.SECONDS);
        assertThat(started).isTrue();

        // Thread 2: concurrently deletes the meeting
        Future<?> deleteFuture = executor.submit(() -> {
            try {
                meetingService.deleteMeeting(meetingId);
            } catch (MeetingNotFoundException ignored) {
            }
        });

        finishPipeline.countDown();
        processFuture.get(5, TimeUnit.SECONDS);
        deleteFuture.get(5, TimeUnit.SECONDS);
        executor.shutdown();

        // Consistent outcome: Meeting is either deleted or marked cleanly without unhandled crash
        boolean exists = meetingRepository.existsById(meetingId);
        if (exists) {
            MeetingStatus status = meetingRepository.findById(meetingId).get().getStatus();
            assertThat(status).isIn(MeetingStatus.COMPLETED, MeetingStatus.FAILED);
        }
    }

    @Test
    @DisplayName("Race condition: concurrent process and get requests never corrupt response or throw concurrent modification")
    void testConcurrentProcessAndGet() throws Exception {
        Meeting meeting = meetingRepository.save(MeetingTestFactory.createUploaded("Concurrent Get"));
        UUID meetingId = meeting.getId();
        Path dummyPath = Files.createTempFile("race_get", ".mp3");

        when(aiServiceClient.transcribe(any(), any())).thenReturn(
                new AiTranscriptionResponse(true, "Transcript text", "en", List.of())
        );
        when(aiServiceClient.analyze(any())).thenReturn(
                new AiAnalysisResponse("Analysis summary", List.of("Decision 1"), List.of())
        );

        ExecutorService executor = Executors.newFixedThreadPool(4);
        int iterations = 20;
        CountDownLatch latch = new CountDownLatch(iterations);
        AtomicInteger successfulGets = new AtomicInteger(0);

        executor.submit(() -> {
            meetingProcessingService.executeProcessingPipeline(meetingId, dummyPath, "race_get.mp3");
        });

        for (int i = 0; i < iterations; i++) {
            executor.submit(() -> {
                try {
                    MeetingResponse resp = meetingService.getMeetingById(meetingId);
                    if (resp != null && resp.getId().equals(meetingId)) {
                        successfulGets.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(successfulGets.get()).isEqualTo(iterations);
    }

    @Test
    @DisplayName("Race condition: duplicate concurrent triggers on same meeting are safely serialized/skipped")
    void testConcurrentDuplicateProcessing() throws Exception {
        Meeting meeting = meetingRepository.save(MeetingTestFactory.createUploaded("Duplicate Trigger Test"));
        UUID meetingId = meeting.getId();
        Path dummyPath1 = Files.createTempFile("dup1", ".mp3");
        Path dummyPath2 = Files.createTempFile("dup2", ".mp3");

        CountDownLatch thread1InAi = new CountDownLatch(1);
        CountDownLatch finishAi = new CountDownLatch(1);

        when(aiServiceClient.transcribe(any(), any())).thenAnswer(inv -> {
            thread1InAi.countDown();
            finishAi.await(5, TimeUnit.SECONDS);
            return new AiTranscriptionResponse(true, "Transcript", "en", List.of());
        });
        when(aiServiceClient.analyze(any())).thenReturn(
                new AiAnalysisResponse("Summary", List.of(), List.of())
        );

        ExecutorService executor = Executors.newFixedThreadPool(2);
        executor.submit(() -> meetingProcessingService.executeProcessingPipeline(meetingId, dummyPath1, "dup1.mp3"));

        thread1InAi.await(5, TimeUnit.SECONDS);
        // Attempt simultaneous second execution while thread 1 is processing
        executor.submit(() -> meetingProcessingService.executeProcessingPipeline(meetingId, dummyPath2, "dup2.mp3"));

        finishAi.countDown();
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        Meeting finalMeeting = meetingRepository.findById(meetingId).orElseThrow();
        assertThat(finalMeeting.getStatus()).isEqualTo(MeetingStatus.COMPLETED);
    }
}
