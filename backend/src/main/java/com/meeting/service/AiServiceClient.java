package com.meeting.service;

import com.meeting.dto.AiProcessRequest;
import com.meeting.dto.AiProcessResponse;
import com.meeting.exception.AiServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.UUID;

@Service
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestClient restClient;

    public AiServiceClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public AiProcessResponse triggerProcessing(UUID meetingId) {
        log.info("Sending meeting processing request to AI service for meetingId={}", meetingId);
        try {
            AiProcessResponse response = restClient.post()
                    .uri("/api/v1/process")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new AiProcessRequest(meetingId))
                    .retrieve()
                    .body(AiProcessResponse.class);

            if (response == null) {
                throw new AiServiceException("Received empty response from AI service");
            }

            log.info("Received processing acknowledgment from AI service: {}", response);
            return response;
        } catch (ResourceAccessException ex) {
            log.error("Failed to communicate with AI service for meetingId={}: {}", meetingId, ex.getMessage());
            throw new AiServiceException("The AI service is currently unavailable or timed out", ex);
        } catch (RestClientResponseException ex) {
            log.error("AI service returned error HTTP {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new AiServiceException("The AI service returned an error: " + ex.getStatusCode(), ex);
        } catch (AiServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while calling AI service: {}", ex.getMessage());
            throw new AiServiceException("Failed to communicate with AI service: " + ex.getMessage(), ex);
        }
    }
}
