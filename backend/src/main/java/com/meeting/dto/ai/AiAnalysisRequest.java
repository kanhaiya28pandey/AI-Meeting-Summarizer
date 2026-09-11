package com.meeting.dto.ai;

public class AiAnalysisRequest {

    private String transcript;

    public AiAnalysisRequest() {
    }

    public AiAnalysisRequest(String transcript) {
        this.transcript = transcript;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }
}
