package com.meeting.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.UUID;

@Service
public class MeetingProcessingAsyncService {

    private static final Logger log = LoggerFactory.getLogger(MeetingProcessingAsyncService.class);

    private final MeetingProcessingService meetingProcessingService;

    public MeetingProcessingAsyncService(MeetingProcessingService meetingProcessingService) {
        this.meetingProcessingService = meetingProcessingService;
    }

    @Async("meetingProcessingExecutor")
    public void processMeetingAsync(UUID meetingId, Path tempAudioPath, String originalFilename) {
        log.info("Submitting meeting id={} to async processing executor", meetingId);
        try {
            meetingProcessingService.executeProcessingPipeline(meetingId, tempAudioPath, originalFilename);
        } catch (Exception ex) {
            log.error("Async execution failed for meeting id={}: {}", meetingId, ex.getMessage());
        }
    }
}
