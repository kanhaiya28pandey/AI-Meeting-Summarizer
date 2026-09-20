package com.meeting.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class AiTranscriptionResponse {

    private boolean success;
    private String transcript;
    private String language;
    private List<TranscriptSegment> segments = new ArrayList<>();
    private Integer duration;

    public AiTranscriptionResponse() {
    }

    public AiTranscriptionResponse(boolean success, String transcript, String language, List<TranscriptSegment> segments) {
        this(success, transcript, language, segments, null);
    }

    public AiTranscriptionResponse(boolean success, String transcript, String language, List<TranscriptSegment> segments, Integer duration) {
        this.success = success;
        this.transcript = transcript;
        this.language = language;
        this.segments = segments != null ? segments : new ArrayList<>();
        this.duration = duration;
    }


    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public List<TranscriptSegment> getSegments() {
        return segments;
    }

    public void setSegments(List<TranscriptSegment> segments) {
        this.segments = segments;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}

