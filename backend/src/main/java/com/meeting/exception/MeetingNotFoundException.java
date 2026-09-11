package com.meeting.exception;

import java.util.UUID;

public class MeetingNotFoundException extends RuntimeException {

    public MeetingNotFoundException(String message) {
        super(message);
    }

    public MeetingNotFoundException(UUID id) {
        super("Meeting not found with ID: " + id);
    }
}
