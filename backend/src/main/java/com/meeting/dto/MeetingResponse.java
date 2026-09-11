package com.meeting.dto;

import com.meeting.model.ActionItem;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class MeetingResponse {

    private UUID id;
    private String title;
    private String originalFileName;
    private String fileType;
    private Integer duration;
    private String transcript;
    private String summary;
    private List<String> keyDecisions;
    private List<ActionItem> actionItems;
    private MeetingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MeetingResponse() {
    }

    public MeetingResponse(UUID id, String title, String originalFileName, String fileType, Integer duration,
                           String transcript, String summary, List<String> keyDecisions,
                           List<ActionItem> actionItems, MeetingStatus status,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.originalFileName = originalFileName;
        this.fileType = fileType;
        this.duration = duration;
        this.transcript = transcript;
        this.summary = summary;
        this.keyDecisions = keyDecisions != null ? keyDecisions : new ArrayList<>();
        this.actionItems = actionItems != null ? actionItems : new ArrayList<>();
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static MeetingResponse fromEntity(Meeting meeting) {
        if (meeting == null) {
            return null;
        }
        return new MeetingResponse(
                meeting.getId(),
                meeting.getTitle(),
                meeting.getOriginalFileName(),
                meeting.getFileType(),
                meeting.getDuration(),
                meeting.getTranscript(),
                meeting.getSummary(),
                meeting.getKeyDecisions(),
                meeting.getActionItems(),
                meeting.getStatus(),
                meeting.getCreatedAt(),
                meeting.getUpdatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getKeyDecisions() {
        return keyDecisions;
    }

    public void setKeyDecisions(List<String> keyDecisions) {
        this.keyDecisions = keyDecisions;
    }

    public List<ActionItem> getActionItems() {
        return actionItems;
    }

    public void setActionItems(List<ActionItem> actionItems) {
        this.actionItems = actionItems;
    }

    public MeetingStatus getStatus() {
        return status;
    }

    public void setStatus(MeetingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
