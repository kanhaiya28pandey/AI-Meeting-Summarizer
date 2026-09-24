package com.meeting.service;

import com.meeting.dto.AiProcessRequest;
import com.meeting.dto.AiProcessResponse;
import com.meeting.dto.ai.AiAnalysisRequest;
import com.meeting.dto.ai.AiAnalysisResponse;
import com.meeting.dto.ai.AiTranscriptionResponse;
import com.meeting.exception.AiServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.nio.file.Path;
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

    public AiTranscriptionResponse transcribe(Path audioFilePath, String originalFilename) {
        log.info("Dispatching audio transcription request to AI service: originalFilename={}", originalFilename);
        try {
            FileSystemResource fileResource = new FileSystemResource(audioFilePath.toFile()) {
                @Override
                public String getFilename() {
                    return originalFilename != null ? originalFilename : super.getFilename();
                }
            };

            String ext = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase()
                    : "";
            MediaType partMediaType;
            if (ext.equals(".mp3")) {
                partMediaType = MediaType.valueOf("audio/mp3");
            } else if (ext.equals(".wav")) {
                partMediaType = MediaType.valueOf("audio/wav");
            } else if (ext.equals(".m4a")) {
                partMediaType = MediaType.valueOf("audio/m4a");
            } else if (ext.equals(".mp4")) {
                partMediaType = MediaType.valueOf("video/mp4");
            } else if (ext.equals(".mov")) {
                partMediaType = MediaType.valueOf("video/quicktime");
            } else {
                partMediaType = MediaType.valueOf("audio/mpeg");
            }

            org.springframework.http.HttpHeaders partHeaders = new org.springframework.http.HttpHeaders();
            partHeaders.setContentType(partMediaType);
            org.springframework.http.HttpEntity<FileSystemResource> fileEntity = new org.springframework.http.HttpEntity<>(fileResource, partHeaders);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileEntity);

            AiTranscriptionResponse response = restClient.post()
                    .uri("/api/v1/transcription")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(AiTranscriptionResponse.class);

            if (response == null) {
                throw new AiServiceException("AI service returned empty transcription response");
            }

            if (!response.isSuccess() || response.getTranscript() == null || response.getTranscript().trim().isEmpty()) {
                throw new AiServiceException("AI service returned an empty or unsuccessful transcript");
            }

            log.info("Audio transcription completed successfully: characters={}", response.getTranscript().length());
            return response;
        } catch (ResourceAccessException ex) {
            log.error("Failed to communicate with AI service transcription endpoint: {}", ex.getMessage());
            throw new AiServiceException("The AI service transcription is currently unavailable or timed out", ex);
        } catch (RestClientResponseException ex) {
            log.error("AI service transcription returned error HTTP {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new AiServiceException("The AI service transcription returned an error: " + ex.getStatusCode(), ex);
        } catch (AiServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error during AI service transcription: {}", ex.getMessage());
            throw new AiServiceException("Failed to complete transcription with AI service: " + ex.getMessage(), ex);
        }
    }

    public AiAnalysisResponse analyze(String transcript) {
        log.info("Dispatching meeting analysis request to AI service (transcript length={})",
                transcript != null ? transcript.length() : 0);
        try {
            AiAnalysisResponse response = restClient.post()
                    .uri("/api/v1/analyze")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new AiAnalysisRequest(transcript))
                    .retrieve()
                    .body(AiAnalysisResponse.class);

            if (response == null) {
                throw new AiServiceException("AI service returned empty analysis response");
            }

            if (response.getSummary() == null || response.getSummary().trim().isEmpty()) {
                throw new AiServiceException("AI service returned an empty summary in meeting analysis");
            }

            log.info("Meeting analysis completed successfully: decisions={}, actionItems={}",
                    response.getKeyDecisions() != null ? response.getKeyDecisions().size() : 0,
                    response.getActionItems() != null ? response.getActionItems().size() : 0);
            return response;
        } catch (ResourceAccessException ex) {
            log.error("Failed to communicate with AI service analysis endpoint: {}", ex.getMessage());
            throw new AiServiceException("The AI service analysis is currently unavailable or timed out", ex);
        } catch (RestClientResponseException ex) {
            log.error("AI service analysis returned error HTTP {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new AiServiceException("The AI service analysis returned an error: " + ex.getStatusCode(), ex);
        } catch (AiServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error during AI service analysis: {}", ex.getMessage());
            throw new AiServiceException("Failed to complete meeting analysis with AI service: " + ex.getMessage(), ex);
        }
    }
}
