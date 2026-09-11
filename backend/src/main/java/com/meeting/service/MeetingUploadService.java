package com.meeting.service;

import com.meeting.dto.MeetingResponse;
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

@Service
public class MeetingUploadService {

    private static final Logger log = LoggerFactory.getLogger(MeetingUploadService.class);

    private final MeetingRepository meetingRepository;
    private final TemporaryFileService temporaryFileService;
    private final MeetingProcessingAsyncService meetingProcessingAsyncService;

    public MeetingUploadService(
            MeetingRepository meetingRepository,
            TemporaryFileService temporaryFileService,
            MeetingProcessingAsyncService meetingProcessingAsyncService) {
        this.meetingRepository = meetingRepository;
        this.temporaryFileService = temporaryFileService;
        this.meetingProcessingAsyncService = meetingProcessingAsyncService;
    }

    public MeetingResponse uploadAndQueueMeeting(String title, MultipartFile file) throws IOException {
        temporaryFileService.validateAudioFile(file);

        String originalFilename = file.getOriginalFilename();
        if (title != null && !title.isBlank() && title.trim().length() > 200) {
            throw new IllegalArgumentException("Meeting title must be 200 characters or fewer");
        }

        String effectiveTitle = (title != null && !title.isBlank())
                ? title.trim()
                : TemporaryFileService.getBaseName(originalFilename);

        if (effectiveTitle.length() > 200) {
            effectiveTitle = effectiveTitle.substring(0, 200);
        }

        Path tempAudioPath = temporaryFileService.saveTemporaryFile(file);

        Meeting meeting = new Meeting();
        meeting.setTitle(effectiveTitle);
        String safeOriginalName = originalFilename != null && originalFilename.length() > 255
                ? originalFilename.substring(0, 255)
                : originalFilename;
        meeting.setOriginalFileName(safeOriginalName);
        String contentType = file.getContentType();
        String extension = TemporaryFileService.getExtension(originalFilename).toLowerCase();
        String effectiveFileType;
        if (contentType != null && !contentType.isBlank() && !contentType.equalsIgnoreCase("application/octet-stream")) {
            effectiveFileType = contentType.toLowerCase().split(";")[0].trim();
        } else if (extension.equals(".mp4")) {
            effectiveFileType = "video/mp4";
        } else if (extension.equals(".mov")) {
            effectiveFileType = "video/quicktime";
        } else if (extension.equals(".wav")) {
            effectiveFileType = "audio/wav";
        } else if (extension.equals(".m4a")) {
            effectiveFileType = "audio/mp4";
        } else {
            effectiveFileType = "audio/mpeg";
        }

        meeting.setFileType(effectiveFileType);
        meeting.setStatus(MeetingStatus.UPLOADED);
        meeting.setKeyDecisions(new ArrayList<>());
        meeting.setActionItems(new ArrayList<>());
        meeting = meetingRepository.save(meeting);

        log.info("Created meeting id={} with status UPLOADED. Submitting for background processing.", meeting.getId());

        try {
            meetingProcessingAsyncService.processMeetingAsync(meeting.getId(), tempAudioPath, originalFilename);
        } catch (Exception ex) {
            log.error("Failed to enqueue background processing for meeting id={}: {}", meeting.getId(), ex.getMessage());
            // Meeting remains in UPLOADED or FAILED
            meeting.setStatus(MeetingStatus.FAILED);
            meetingRepository.save(meeting);
            temporaryFileService.deleteTemporaryFile(tempAudioPath);
            throw ex;
        }

        return MeetingResponse.fromEntity(meeting);
    }
}
