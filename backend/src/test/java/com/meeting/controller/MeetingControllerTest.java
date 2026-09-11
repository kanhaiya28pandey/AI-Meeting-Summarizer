package com.meeting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeting.dto.CreateMeetingRequest;
import com.meeting.dto.MeetingResponse;
import com.meeting.service.MeetingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
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
}
