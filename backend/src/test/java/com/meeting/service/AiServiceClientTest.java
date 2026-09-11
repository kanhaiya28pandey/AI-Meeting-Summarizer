package com.meeting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeting.dto.AiProcessResponse;
import com.meeting.exception.AiServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class AiServiceClientTest {

    private MockRestServiceServer mockServer;
    private AiServiceClient aiServiceClient;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        RestClient.Builder restClientBuilder = RestClient.builder().baseUrl("http://localhost:8000");
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        RestClient restClient = restClientBuilder.build();
        aiServiceClient = new AiServiceClient(restClient);
        objectMapper = new ObjectMapper();
    }

    @Test
    void triggerProcessing_success_returnsResponse() throws Exception {
        UUID meetingId = UUID.randomUUID();
        AiProcessResponse expected = new AiProcessResponse(true, meetingId, "AI Meeting Summarizer AI Service", "Meeting processing request accepted");

        mockServer.expect(requestTo("http://localhost:8000/api/v1/process"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.meetingId").value(meetingId.toString()))
                .andRespond(withStatus(HttpStatus.ACCEPTED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(objectMapper.writeValueAsString(expected)));

        AiProcessResponse actual = aiServiceClient.triggerProcessing(meetingId);

        assertNotNull(actual);
        assertTrue(actual.success());
        assertEquals(meetingId, actual.meetingId());
        assertEquals("AI Meeting Summarizer AI Service", actual.service());
        assertEquals("Meeting processing request accepted", actual.message());
        mockServer.verify();
    }

    @Test
    void triggerProcessing_serverError_throwsAiServiceException() {
        UUID meetingId = UUID.randomUUID();

        mockServer.expect(requestTo("http://localhost:8000/api/v1/process"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        AiServiceException ex = assertThrows(AiServiceException.class, () ->
                aiServiceClient.triggerProcessing(meetingId)
        );

        assertTrue(ex.getMessage().contains("The AI service returned an error"));
        mockServer.verify();
    }
}
