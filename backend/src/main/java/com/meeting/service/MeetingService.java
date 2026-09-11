package com.meeting.service;

import com.meeting.dto.AiProcessResponse;
import com.meeting.dto.CreateMeetingRequest;
import com.meeting.dto.MeetingResponse;
import com.meeting.exception.MeetingNotFoundException;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;
import com.meeting.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final AiServiceClient aiServiceClient;

    public MeetingService(MeetingRepository meetingRepository, AiServiceClient aiServiceClient) {
        this.meetingRepository = meetingRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public MeetingResponse createMeeting(CreateMeetingRequest request) {
        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle().trim());
        meeting.setOriginalFileName(request.getOriginalFileName().trim());
        meeting.setFileType(request.getFileType().trim());
        meeting.setDuration(request.getDuration());
        meeting.setStatus(MeetingStatus.UPLOADED);
        meeting.setTranscript(null);
        meeting.setSummary(null);
        meeting.setKeyDecisions(new ArrayList<>());
        meeting.setActionItems(new ArrayList<>());

        Meeting saved = meetingRepository.save(meeting);
        return MeetingResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> getAllMeetings() {
        return meetingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MeetingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeetingById(UUID id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new MeetingNotFoundException(id));
        return MeetingResponse.fromEntity(meeting);
    }

    public void deleteMeeting(UUID id) {
        if (!meetingRepository.existsById(id)) {
            throw new MeetingNotFoundException(id);
        }
        meetingRepository.deleteById(id);
    }

    public AiProcessResponse processMeeting(UUID id) {
        if (!meetingRepository.existsById(id)) {
            throw new MeetingNotFoundException(id);
        }
        return aiServiceClient.triggerProcessing(id);
    }
}
