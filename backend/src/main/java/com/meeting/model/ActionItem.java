package com.meeting.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

public class ActionItem implements Serializable {

    private String task;
    private String owner;
    private LocalDate deadline;

    public ActionItem() {
    }

    public ActionItem(String task, String owner, LocalDate deadline) {
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

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ActionItem that = (ActionItem) o;
        return Objects.equals(task, that.task) &&
                Objects.equals(owner, that.owner) &&
                Objects.equals(deadline, that.deadline);
    }

    @Override
    public int hashCode() {
        return Objects.hash(task, owner, deadline);
    }

    @Override
    public String toString() {
        return "ActionItem{" +
                "task='" + task + '\'' +
                ", owner='" + owner + '\'' +
                ", deadline=" + deadline +
                '}';
    }
}
