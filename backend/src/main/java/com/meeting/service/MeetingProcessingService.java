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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

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

    public MeetingResponse processMeeting(String title, MultipartFile file) throws IOException {
        long startTime = System.currentTimeMillis();
        temporaryFileService.validateAudioFile(file);

        String originalFilename = file.getOriginalFilename();
        String effectiveTitle = (title != null && !title.isBlank())
                ? title.trim()
                : TemporaryFileService.getBaseName(originalFilename);

        if (effectiveTitle.length() > 200) {
            effectiveTitle = effectiveTitle.substring(0, 200);
        }

        Path tempAudioPath = temporaryFileService.saveTemporaryFile(file);
        Meeting meeting = null;

        try {
            // 1. Create meeting record in PostgreSQL
            meeting = new Meeting();
            meeting.setTitle(effectiveTitle);
            meeting.setOriginalFileName(originalFilename);
            meeting.setFileType(file.getContentType() != null ? file.getContentType() : "audio/mpeg");
            meeting.setStatus(MeetingStatus.UPLOADED);
            meeting.setKeyDecisions(new ArrayList<>());
            meeting.setActionItems(new ArrayList<>());
            meeting = meetingRepository.save(meeting);
            log.info("Created meeting record with id={} in status UPLOADED", meeting.getId());

            // 2. Status: TRANSCRIBING
            meeting.setStatus(MeetingStatus.TRANSCRIBING);
            meeting = meetingRepository.save(meeting);
            log.info("Transitioned meeting id={} to status TRANSCRIBING", meeting.getId());

            // 3. FastAPI Audio Transcription
            AiTranscriptionResponse transcription = aiServiceClient.transcribe(tempAudioPath, originalFilename);
            String transcript = transcription.getTranscript();
            meeting.setTranscript(transcript);

            // 4. Status: ANALYZING
            meeting.setStatus(MeetingStatus.ANALYZING);
            meeting = meetingRepository.save(meeting);
            log.info("Transitioned meeting id={} to status ANALYZING", meeting.getId());

            // 5. FastAPI Meeting Intelligence Analysis
            AiAnalysisResponse analysis = aiServiceClient.analyze(transcript);

            // 6. Status: SAVING
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
            log.info("Transitioned meeting id={} to status SAVING", meeting.getId());

            // 7. Status: COMPLETED
            meeting.setStatus(MeetingStatus.COMPLETED);
            meeting = meetingRepository.save(meeting);

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("Meeting processing completed successfully for id={} in {} ms", meeting.getId(), elapsed);

            return MeetingResponse.fromEntity(meeting);

        } catch (Exception ex) {
            log.error("Meeting processing failed: {}", ex.getMessage());
            if (meeting != null && meeting.getId() != null) {
                try {
                    meeting.setStatus(MeetingStatus.FAILED);
                    meetingRepository.save(meeting);
                    log.info("Saved FAILED status for meeting id={}", meeting.getId());
                } catch (Exception saveEx) {
                    log.error("Failed to update status to FAILED for meeting id={}: {}", meeting.getId(), saveEx.getMessage());
                }
            }
            throw ex;
        } finally {
            if (tempAudioPath != null) {
                temporaryFileService.deleteTemporaryFile(tempAudioPath);
            }
        }
    }
}
