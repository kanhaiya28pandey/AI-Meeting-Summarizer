package com.meeting.service;

import com.meeting.dto.MeetingResponse;
import com.meeting.dto.ai.AiActionItem;
import com.meeting.dto.ai.AiAnalysisResponse;
import com.meeting.dto.ai.AiTranscriptionResponse;
import com.meeting.model.ActionItem;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;
import com.meeting.repository.MeetingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MeetingProcessingService {

    private static final Logger log = LoggerFactory.getLogger(MeetingProcessingService.class);

    private final MeetingRepository meetingRepository;
    private final AiServiceClient aiServiceClient;
    private final TemporaryFileService temporaryFileService;

    public MeetingProcessingService(
            MeetingRepository meetingRepository,
            AiServiceClient aiServiceClient,
            TemporaryFileService temporaryFileService) {
        this.meetingRepository = meetingRepository;
        this.aiServiceClient = aiServiceClient;
        this.temporaryFileService = temporaryFileService;
    }

    /**
     * Executes the end-to-end background processing pipeline for an uploaded meeting.
     * Uses short database transactions and updates states:
     * UPLOADED -> TRANSCRIBING -> ANALYZING -> SAVING -> COMPLETED (or FAILED on error).
     */
    public void executeProcessingPipeline(UUID meetingId, Path tempAudioPath, String originalFilename) {
        long startTime = System.currentTimeMillis();
        log.info("Meeting processing started: {}", meetingId);

        Meeting meeting = null;
        try {
            Optional<Meeting> optionalMeeting = meetingRepository.findById(meetingId);
            if (optionalMeeting.isEmpty()) {
                log.error("Meeting not found for id={}. Aborting processing.", meetingId);
                return;
            }

            meeting = optionalMeeting.get();

            // Duplicate processing protection
            if (meeting.getStatus() == MeetingStatus.COMPLETED) {
                log.warn("Meeting id={} is already COMPLETED. Skipping duplicate processing.", meetingId);
                return;
            }
            if (meeting.getStatus() == MeetingStatus.TRANSCRIBING ||
                meeting.getStatus() == MeetingStatus.ANALYZING ||
                meeting.getStatus() == MeetingStatus.SAVING) {
                log.warn("Meeting id={} is already currently in status {}. Skipping duplicate trigger.",
                        meetingId, meeting.getStatus());
                return;
            }

            // 1. Transition to TRANSCRIBING
            meeting.setStatus(MeetingStatus.TRANSCRIBING);
            meeting = meetingRepository.save(meeting);
            log.info("Meeting transcription started: {}", meetingId);

            // 2. Call FastAPI for Audio Transcription
            AiTranscriptionResponse transcription = aiServiceClient.transcribe(tempAudioPath, originalFilename);
            if (transcription == null || transcription.getTranscript() == null || transcription.getTranscript().isBlank()) {
                throw new IllegalStateException("Transcription service returned empty or invalid transcript");
            }
            String transcript = transcription.getTranscript();
            meeting.setTranscript(transcript);
            meeting = meetingRepository.save(meeting);
            log.info("Meeting transcription completed: {}", meetingId);

            // 3. Transition to ANALYZING
            meeting.setStatus(MeetingStatus.ANALYZING);
            meeting = meetingRepository.save(meeting);
            log.info("Meeting analysis started: {}", meetingId);

            // 4. Call FastAPI for Meeting Analysis
            AiAnalysisResponse analysis = aiServiceClient.analyze(transcript);
            if (analysis == null) {
                throw new IllegalStateException("Analysis service returned null response");
            }
            log.info("Meeting analysis completed: {}", meetingId);

            // 5. Transition to SAVING
            meeting.setStatus(MeetingStatus.SAVING);
            meeting.setSummary(analysis.getSummary());
            meeting.setKeyDecisions(analysis.getKeyDecisions() != null ? analysis.getKeyDecisions() : new ArrayList<>());

            List<ActionItem> actionItems = new ArrayList<>();
            if (analysis.getActionItems() != null) {
                for (AiActionItem item : analysis.getActionItems()) {
                    actionItems.add(new ActionItem(item.getTask(), item.getOwner(), item.getDeadline()));
                }
            }
            meeting.setActionItems(actionItems);
            meeting = meetingRepository.save(meeting);
            log.info("Meeting saving started: {}", meetingId);

            // 6. Transition to COMPLETED
            meeting.setStatus(MeetingStatus.COMPLETED);
            meeting = meetingRepository.save(meeting);

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("Meeting processing completed: {} in {} ms", meetingId, elapsed);

        } catch (Exception ex) {
            log.error("Meeting processing failed: {}: {}", meetingId, ex.getMessage());
            if (meetingId != null) {
                try {
                    Optional<Meeting> opt = meetingRepository.findById(meetingId);
                    if (opt.isPresent()) {
                        Meeting failedMeeting = opt.get();
                        failedMeeting.setStatus(MeetingStatus.FAILED);
                        meetingRepository.save(failedMeeting);
                        log.info("Saved FAILED status for meeting id={}", meetingId);
                    }
                } catch (Exception saveEx) {
                    log.error("Failed to update status to FAILED for meeting id={}: {}", meetingId, saveEx.getMessage());
                }
            }
        } finally {
            if (tempAudioPath != null) {
                temporaryFileService.deleteTemporaryFile(tempAudioPath);
            }
        }
    }
}
