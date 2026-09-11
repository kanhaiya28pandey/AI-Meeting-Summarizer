package com.meeting.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class AiAnalysisResponse {

    private String summary;

    @JsonProperty("key_decisions")
    private List<String> keyDecisions = new ArrayList<>();

    @JsonProperty("action_items")
    private List<AiActionItem> actionItems = new ArrayList<>();

    public AiAnalysisResponse() {
    }

    public AiAnalysisResponse(String summary, List<String> keyDecisions, List<AiActionItem> actionItems) {
        this.summary = summary;
        this.keyDecisions = keyDecisions != null ? keyDecisions : new ArrayList<>();
        this.actionItems = actionItems != null ? actionItems : new ArrayList<>();
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

    public List<AiActionItem> getActionItems() {
        return actionItems;
    }

    public void setActionItems(List<AiActionItem> actionItems) {
        this.actionItems = actionItems;
    }
}
