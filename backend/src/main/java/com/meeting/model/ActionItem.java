package com.meeting.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

public class ActionItem implements Serializable {

    private String task;
    private String owner;
    private String deadline;

    public ActionItem() {
    }

    public ActionItem(String task, String owner, String deadline) {
        this.task = task;
        this.owner = owner;
        this.deadline = deadline;
    }

    @JsonCreator
    public ActionItem(
            @JsonProperty("task") String task,
            @JsonProperty("owner") String owner,
            @JsonProperty("deadline") Object deadline) {
        this.task = task;
        this.owner = owner;
        this.deadline = deadline != null ? deadline.toString() : null;
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

    public Object getDeadline() {
        if (deadline == null) {
            return null;
        }
        try {
            return LocalDate.parse(deadline);
        } catch (Exception e) {
            return deadline;
        }
    }

    @JsonIgnore
    public String getDeadlineString() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline != null ? deadline.toString() : null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ActionItem that = (ActionItem) o;
        return Objects.equals(task, that.task) &&
                Objects.equals(owner, that.owner) &&
                Objects.equals(getDeadline(), that.getDeadline());
    }

    @Override
    public int hashCode() {
        return Objects.hash(task, owner, getDeadline());
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
