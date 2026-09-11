package com.meeting.dto.ai;

public class AiActionItem {

    private String task;
    private String owner;
    private String deadline;

    public AiActionItem() {
    }

    public AiActionItem(String task, String owner, String deadline) {
        this.task = task;
        this.owner = owner;
        this.deadline = deadline;
    }

    public String getTask() {
        return task;
    }

    public void setTask(String task) {
        this.task = task;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }
}
