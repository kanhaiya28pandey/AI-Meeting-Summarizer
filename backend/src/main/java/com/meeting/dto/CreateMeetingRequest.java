package com.meeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class CreateMeetingRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Original file name is required")
    @Size(max = 255, message = "Original file name must not exceed 255 characters")
    private String originalFileName;

    @NotBlank(message = "File type is required")
    @Size(max = 100, message = "File type must not exceed 100 characters")
    private String fileType;

    @PositiveOrZero(message = "Duration must be zero or greater")
    private Integer duration;

    public CreateMeetingRequest() {
    }

    public CreateMeetingRequest(String title, String originalFileName, String fileType, Integer duration) {
        this.title = title;
        this.originalFileName = originalFileName;
        this.fileType = fileType;
        this.duration = duration;
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
}
