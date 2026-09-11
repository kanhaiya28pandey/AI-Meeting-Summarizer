package com.meeting.controller;

import com.meeting.dto.AiProcessResponse;
import com.meeting.dto.CreateMeetingRequest;
import com.meeting.dto.MeetingResponse;
import com.meeting.service.MeetingService;
import com.meeting.service.MeetingUploadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;
    private final MeetingUploadService meetingUploadService;

    public MeetingController(MeetingService meetingService, MeetingUploadService meetingUploadService) {
        this.meetingService = meetingService;
        this.meetingUploadService = meetingUploadService;
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@Valid @RequestBody CreateMeetingRequest request) {
        MeetingResponse response = meetingService.createMeeting(request);
        URI location = URI.create("/api/meetings/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MeetingResponse> uploadMeeting(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("file") MultipartFile file) throws Exception {
        MeetingResponse response = meetingUploadService.uploadAndQueueMeeting(title, file);
        URI location = URI.create("/api/meetings/" + response.getId());
        return ResponseEntity.status(HttpStatus.ACCEPTED).location(location).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getAllMeetings() {
        List<MeetingResponse> meetings = meetingService.getAllMeetings();
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getMeetingById(@PathVariable UUID id) {
        MeetingResponse meeting = meetingService.getMeetingById(id);
        return ResponseEntity.ok(meeting);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable UUID id) {
        meetingService.deleteMeeting(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<AiProcessResponse> processMeeting(@PathVariable UUID id) {
        AiProcessResponse response = meetingService.processMeeting(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
}
