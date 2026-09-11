package com.meeting.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TranscriptSegment {

    private String speaker;
    private String text;

    @JsonProperty("start_time")
    private Double startTime;

    @JsonProperty("end_time")
    private Double endTime;

    public TranscriptSegment() {
    }

    public TranscriptSegment(String speaker, String text, Double startTime, Double endTime) {
        this.speaker = speaker;
        this.text = text;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getSpeaker() {
        return speaker;
    }

    public void setSpeaker(String speaker) {
        this.speaker = speaker;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Double getStartTime() {
        return startTime;
    }

    public void setStartTime(Double startTime) {
        this.startTime = startTime;
    }

    public Double getEndTime() {
        return endTime;
    }

    public void setEndTime(Double endTime) {
        this.endTime = endTime;
    }
}
