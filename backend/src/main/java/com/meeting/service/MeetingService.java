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
    private final com.meeting.repository.UserRepository userRepository;

    public MeetingService(MeetingRepository meetingRepository, AiServiceClient aiServiceClient) {
        this(meetingRepository, aiServiceClient, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public MeetingService(MeetingRepository meetingRepository,
                          AiServiceClient aiServiceClient,
                          com.meeting.repository.UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.aiServiceClient = aiServiceClient;
        this.userRepository = userRepository;
    }

    public MeetingResponse createMeeting(CreateMeetingRequest request) {
        return createMeeting(null, request);
    }

    public MeetingResponse createMeeting(UUID userId, CreateMeetingRequest request) {
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

        if (userId != null && userRepository != null) {
            userRepository.findById(userId).ifPresent(meeting::setUser);
        }

        Meeting saved = meetingRepository.save(meeting);
        return MeetingResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> getAllMeetings() {
        return getAllMeetings(null);
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> getAllMeetings(UUID userId) {
        List<Meeting> meetings;
        if (userId != null) {
            meetings = meetingRepository.findAllByUser_IdOrderByCreatedAtDesc(userId);
        } else {
            meetings = meetingRepository.findAllByOrderByCreatedAtDesc();
        }
        return meetings.stream()
                .map(MeetingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeetingById(UUID id) {
        return getMeetingById(id, null);
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeetingById(UUID id, UUID userId) {
        Meeting meeting;
        if (userId != null) {
            meeting = meetingRepository.findByIdAndUser_Id(id, userId)
                    .orElseThrow(() -> new MeetingNotFoundException(id));
        } else {
            meeting = meetingRepository.findById(id)
                    .orElseThrow(() -> new MeetingNotFoundException(id));
        }
        return MeetingResponse.fromEntity(meeting);
    }

    public void deleteMeeting(UUID id) {
        deleteMeeting(id, null);
    }

    public void deleteMeeting(UUID id, UUID userId) {
        if (userId != null) {
            if (!meetingRepository.existsByIdAndUser_Id(id, userId)) {
                throw new MeetingNotFoundException(id);
            }
            meetingRepository.deleteByIdAndUser_Id(id, userId);
        } else {
            if (!meetingRepository.existsById(id)) {
                throw new MeetingNotFoundException(id);
            }
            meetingRepository.deleteById(id);
        }
    }

    public AiProcessResponse processMeeting(UUID id) {
        return processMeeting(id, null);
    }

    public AiProcessResponse processMeeting(UUID id, UUID userId) {
        Meeting meeting;
        if (userId != null) {
            meeting = meetingRepository.findByIdAndUser_Id(id, userId)
                    .orElseThrow(() -> new MeetingNotFoundException(id));
        } else {
            meeting = meetingRepository.findById(id)
                    .orElseThrow(() -> new MeetingNotFoundException(id));
        }
        if (meeting.getStatus() == MeetingStatus.COMPLETED) {
            return new AiProcessResponse(true, id, "AI Meeting Summarizer", "Meeting has already completed processing");
        }
        if (meeting.getStatus() == MeetingStatus.TRANSCRIBING ||
            meeting.getStatus() == MeetingStatus.ANALYZING ||
            meeting.getStatus() == MeetingStatus.SAVING) {
            return new AiProcessResponse(true, id, "AI Meeting Summarizer", "Meeting is currently being processed");
        }
        return aiServiceClient.triggerProcessing(id);
    }
}

