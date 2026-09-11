package com.meeting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeting.dto.AiProcessResponse;
import com.meeting.dto.CreateMeetingRequest;
import com.meeting.dto.MeetingResponse;
import com.meeting.exception.AiServiceException;
import com.meeting.model.MeetingStatus;
import com.meeting.service.AiServiceClient;
import com.meeting.service.MeetingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MeetingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MeetingService meetingService;

    @MockitoBean
    private AiServiceClient aiServiceClient;

    private CreateMeetingRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new CreateMeetingRequest(
                "Sprint Planning Meeting",
                "sprint-planning.mp3",
                "audio/mpeg",
                3600
        );
    }

    @Test
    void test1_createValidMeeting_shouldReturn201WithLocation() throws Exception {
        mockMvc.perform(post("/api/meetings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/meetings/")))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Sprint Planning Meeting")))
                .andExpect(jsonPath("$.originalFileName", is("sprint-planning.mp3")))
                .andExpect(jsonPath("$.fileType", is("audio/mpeg")))
                .andExpect(jsonPath("$.duration", is(3600)))
                .andExpect(jsonPath("$.status", is("UPLOADED")))
                .andExpect(jsonPath("$.keyDecisions", hasSize(0)))
                .andExpect(jsonPath("$.actionItems", hasSize(0)))
                .andExpect(jsonPath("$.createdAt", notNullValue()))
                .andExpect(jsonPath("$.updatedAt", notNullValue()));
    }

    @Test
    void test2_createMeeting_missingTitle_shouldReturn400() throws Exception {
        CreateMeetingRequest invalid = new CreateMeetingRequest("", "recording.mp3", "audio/mpeg", 1200);

        mockMvc.perform(post("/api/meetings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Failed")))
                .andExpect(jsonPath("$.fieldErrors.title", notNullValue()));
    }

    @Test
    void test3_createMeeting_missingFilename_shouldReturn400() throws Exception {
        CreateMeetingRequest invalid = new CreateMeetingRequest("Design Review", "   ", "audio/mpeg", 1200);

        mockMvc.perform(post("/api/meetings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.fieldErrors.originalFileName", notNullValue()));
    }

    @Test
    void test4_createMeeting_missingFileType_shouldReturn400() throws Exception {
        CreateMeetingRequest invalid = new CreateMeetingRequest("Design Review", "recording.mp3", null, 1200);

        mockMvc.perform(post("/api/meetings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.fieldErrors.fileType", notNullValue()));
    }

    @Test
    void test5_createMeeting_negativeDuration_shouldReturn400() throws Exception {
        CreateMeetingRequest invalid = new CreateMeetingRequest("Design Review", "recording.mp3", "audio/mpeg", -10);

        mockMvc.perform(post("/api/meetings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.fieldErrors.duration", notNullValue()));
    }

    @Test
    void test6_getAllMeetings_shouldReturn200() throws Exception {
        meetingService.createMeeting(validRequest);

        mockMvc.perform(get("/api/meetings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()));
    }

    @Test
    void test7_getMeetingById_existing_shouldReturn200() throws Exception {
        MeetingResponse created = meetingService.createMeeting(validRequest);

        mockMvc.perform(get("/api/meetings/{id}", created.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(created.getId().toString())))
                .andExpect(jsonPath("$.title", is("Sprint Planning Meeting")));
    }

    @Test
    void test8_getMeetingById_nonexistent_shouldReturn404() throws Exception {
        UUID nonExistentId = UUID.fromString("00000000-0000-0000-0000-000000000000");

        mockMvc.perform(get("/api/meetings/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString("Meeting not found with ID")));
    }

    @Test
    void test9_getMeetingById_invalidUuid_shouldReturn400() throws Exception {
        mockMvc.perform(get("/api/meetings/not-a-valid-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")));
    }

    @Test
    void test10_deleteMeeting_existing_shouldReturn204AndThen404() throws Exception {
        MeetingResponse created = meetingService.createMeeting(validRequest);

        // Delete
        mockMvc.perform(delete("/api/meetings/{id}", created.getId()))
                .andExpect(status().isNoContent());

        // Subsequent GET should return 404
        mockMvc.perform(get("/api/meetings/{id}", created.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void test11_deleteMeeting_nonexistent_shouldReturn404() throws Exception {
        UUID nonExistentId = UUID.fromString("00000000-0000-0000-0000-000000000000");

        mockMvc.perform(delete("/api/meetings/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")));
    }

    @Test
    void test12_healthEndpoint_shouldStillReturn200() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.service", is("AI Meeting Summarizer Backend")));
    }

    @Test
    void test13_processMeeting_success_shouldReturn202() throws Exception {
        MeetingResponse created = meetingService.createMeeting(validRequest);
        UUID meetingId = created.getId();

        when(aiServiceClient.triggerProcessing(meetingId)).thenReturn(
                new AiProcessResponse(true, meetingId, "AI Meeting Summarizer AI Service", "Meeting processing request accepted")
        );

        mockMvc.perform(post("/api/meetings/{id}/process", meetingId))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.meetingId", is(meetingId.toString())))
                .andExpect(jsonPath("$.service", is("AI Meeting Summarizer AI Service")))
                .andExpect(jsonPath("$.message", is("Meeting processing request accepted")));

        verify(aiServiceClient).triggerProcessing(meetingId);
    }

    @Test
    void test14_processMeeting_nonExistentMeeting_shouldReturn404AndNotCallAiService() throws Exception {
        UUID nonExistentId = UUID.fromString("00000000-0000-0000-0000-000000000000");

        mockMvc.perform(post("/api/meetings/{id}/process", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")));

        verifyNoInteractions(aiServiceClient);
    }

    @Test
    void test15_processMeeting_invalidUuid_shouldReturn400AndNotCallAiService() throws Exception {
        mockMvc.perform(post("/api/meetings/not-a-valid-uuid/process"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")));

        verifyNoInteractions(aiServiceClient);
    }

    @Test
    void test16_processMeeting_aiServiceUnavailable_shouldReturn503() throws Exception {
        MeetingResponse created = meetingService.createMeeting(validRequest);
        UUID meetingId = created.getId();

        when(aiServiceClient.triggerProcessing(meetingId)).thenThrow(
                new AiServiceException("The AI service is currently unavailable or timed out")
        );

        mockMvc.perform(post("/api/meetings/{id}/process", meetingId))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.error", is("AI Service Unavailable")))
                .andExpect(jsonPath("$.message", is("The AI service is currently unavailable or timed out")))
                .andExpect(jsonPath("$.path", is("/api/meetings/" + meetingId + "/process")));

        verify(aiServiceClient).triggerProcessing(meetingId);
    }

    @Test
    void test17_processMeeting_success_doesNotAlterMeetingStatusOrFields() throws Exception {
        MeetingResponse created = meetingService.createMeeting(validRequest);
        UUID meetingId = created.getId();

        when(aiServiceClient.triggerProcessing(meetingId)).thenReturn(
                new AiProcessResponse(true, meetingId, "AI Meeting Summarizer AI Service", "Meeting processing request accepted")
        );

        mockMvc.perform(post("/api/meetings/{id}/process", meetingId))
                .andExpect(status().isAccepted());

        // Verify state of meeting in database remains unchanged
        MeetingResponse reloaded = meetingService.getMeetingById(meetingId);
        org.junit.jupiter.api.Assertions.assertEquals(MeetingStatus.UPLOADED, reloaded.getStatus());
        org.junit.jupiter.api.Assertions.assertNull(reloaded.getTranscript());
        org.junit.jupiter.api.Assertions.assertNull(reloaded.getSummary());
        org.junit.jupiter.api.Assertions.assertTrue(reloaded.getKeyDecisions().isEmpty());
        org.junit.jupiter.api.Assertions.assertTrue(reloaded.getActionItems().isEmpty());
    }
}
