package com.meeting.support;

import com.meeting.model.ActionItem;

import java.time.LocalDate;

public final class ActionItemTestFactory {

    private ActionItemTestFactory() {
    }

    public static ActionItem createDefault() {
        return new ActionItem("Deploy service to staging", "Alice", LocalDate.of(2026, 9, 20));
    }

    public static ActionItem createWithoutOwner(String task, LocalDate deadline) {
        return new ActionItem(task, null, deadline);
    }

    public static ActionItem createWithoutDeadline(String task, String owner) {
        return new ActionItem(task, owner, null);
    }

    public static ActionItem createWithoutOwnerAndDeadline(String task) {
        return new ActionItem(task, null, null);
    }
}
