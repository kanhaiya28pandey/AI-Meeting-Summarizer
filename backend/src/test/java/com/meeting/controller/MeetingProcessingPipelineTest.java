package com.meeting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeting.dto.MeetingResponse;
import com.meeting.dto.ai.AiActionItem;
import com.meeting.dto.ai.AiAnalysisResponse;
import com.meeting.dto.ai.AiTranscriptionResponse;
import com.meeting.dto.ai.TranscriptSegment;
import com.meeting.exception.AiServiceException;
import com.meeting.model.ActionItem;
import com.meeting.model.Meeting;
import com.meeting.model.MeetingStatus;
import com.meeting.repository.MeetingRepository;
import com.meeting.service.AiServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MeetingProcessingPipelineTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MeetingRepository meetingRepository;

    @MockitoBean
    private AiServiceClient aiServiceClient;

    @Value("${app.upload.temp-dir:./temp/uploads}")
    private String tempUploadDir;

    @BeforeEach
    void cleanDatabase() {
        meetingRepository.deleteAll();
    }

    private Meeting waitForTerminalStatus(UUID id, long timeoutMs) throws InterruptedException {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            Optional<Meeting> opt = meetingRepository.findById(id);
            if (opt.isPresent()) {
                MeetingStatus currentStatus = opt.get().getStatus();
                if (currentStatus == MeetingStatus.COMPLETED || currentStatus == MeetingStatus.FAILED) {
                    return opt.get();
                }
            }
            Thread.sleep(50);
        }
        return meetingRepository.findById(id).orElseThrow();
    }

    @Test
    void test1_successfulPipeline_shouldReturn202AndPersistCompletedMeeting() throws Exception {
        MockMultipartFile audioFile = new MockMultipartFile(
                "file",
                "meeting.mp3",
                "audio/mpeg",
                "fake mp3 audio content".getBytes()
        );

        String sampleTranscript = "The team decided to launch Friday. Rahul will complete testing by Thursday.";
        when(aiServiceClient.transcribe(any(Path.class), anyString())).thenReturn(
                new AiTranscriptionResponse(true, sampleTranscript, "en", List.of())
        );

        when(aiServiceClient.analyze(sampleTranscript)).thenReturn(
                new AiAnalysisResponse(
                        "The team agreed to launch Friday after testing.",
                        List.of("Launch on Friday"),
                        List.of(new AiActionItem("Complete testing", "Rahul", "Thursday"))
                )
        );

        MvcResult result = mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile)
                        .param("title", "Weekly Team Meeting"))
                .andExpect(status().isAccepted())
                .andExpect(header().string("Location", containsString("/api/meetings/")))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Weekly Team Meeting")))
                .andExpect(jsonPath("$.originalFileName", is("meeting.mp3")))
                .andExpect(jsonPath("$.fileType", is("audio/mpeg")))
                .andExpect(jsonPath("$.status", is("UPLOADED")))
                .andReturn();

        MeetingResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), MeetingResponse.class);
        UUID meetingId = response.getId();

        // Wait for background processing to reach COMPLETED
        Meeting persisted = waitForTerminalStatus(meetingId, 5000);
        assertEquals(MeetingStatus.COMPLETED, persisted.getStatus());
        assertEquals("Weekly Team Meeting", persisted.getTitle());
        assertEquals(sampleTranscript, persisted.getTranscript());
        assertEquals("The team agreed to launch Friday after testing.", persisted.getSummary());
        assertEquals(1, persisted.getKeyDecisions().size());
        assertEquals("Launch on Friday", persisted.getKeyDecisions().get(0));
        assertEquals(1, persisted.getActionItems().size());
        assertEquals("Complete testing", persisted.getActionItems().get(0).getTask());
        assertEquals("Rahul", persisted.getActionItems().get(0).getOwner());
        assertEquals("Thursday", persisted.getActionItems().get(0).getDeadline());

        // Verify temp directory cleanup
        File tempFolder = Paths.get(tempUploadDir).toFile();
        File[] remainingFiles = tempFolder.listFiles((dir, name) -> name.endsWith(".mp3"));
        assertTrue(remainingFiles == null || remainingFiles.length == 0);
    }

    @Test
    void test2_transcriptionFailure_shouldPersistFailedStatusAndNotCallAnalysis() throws Exception {
        MockMultipartFile audioFile = new MockMultipartFile(
                "file",
                "corrupted.wav",
                "audio/wav",
                "corrupted wav data".getBytes()
        );

        when(aiServiceClient.transcribe(any(Path.class), anyString())).thenThrow(
                new AiServiceException("The AI service transcription returned an error: 503")
        );

        MvcResult result = mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile)
                        .param("title", "Planning Sync"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status", is("UPLOADED")))
                .andReturn();

        MeetingResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), MeetingResponse.class);
        UUID meetingId = response.getId();

        Meeting failedMeeting = waitForTerminalStatus(meetingId, 5000);
        assertEquals(MeetingStatus.FAILED, failedMeeting.getStatus());
        assertNull(failedMeeting.getTranscript());
        assertNull(failedMeeting.getSummary());

        // Verify analysis was not invoked
        verify(aiServiceClient, never()).analyze(anyString());

        // Verify temp directory cleanup
        File tempFolder = Paths.get(tempUploadDir).toFile();
        File[] remainingFiles = tempFolder.listFiles((dir, name) -> name.endsWith(".wav"));
        assertTrue(remainingFiles == null || remainingFiles.length == 0);
    }

    @Test
    void test3_emptyTranscript_shouldPersistFailedStatusAndNotCallAnalysis() throws Exception {
        MockMultipartFile audioFile = new MockMultipartFile(
                "file",
                "silence.m4a",
                "audio/mp4",
                "silent audio data".getBytes()
        );

        when(aiServiceClient.transcribe(any(Path.class), anyString())).thenReturn(
                new AiTranscriptionResponse(true, "", "en", List.of())
        );

        MvcResult result = mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status", is("UPLOADED")))
                .andReturn();

        MeetingResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), MeetingResponse.class);
        UUID meetingId = response.getId();

        Meeting failedMeeting = waitForTerminalStatus(meetingId, 5000);
        assertEquals(MeetingStatus.FAILED, failedMeeting.getStatus());
        verify(aiServiceClient, never()).analyze(anyString());
    }

    @Test
    void test4_analysisFailure_shouldPreserveTranscriptAndMarkFailed() throws Exception {
        MockMultipartFile audioFile = new MockMultipartFile(
                "file",
                "discussion.mp3",
                "audio/mpeg",
                "discussion audio".getBytes()
        );

        String validTranscript = "Discussion on Q3 targets and infrastructure improvements.";
        when(aiServiceClient.transcribe(any(Path.class), anyString())).thenReturn(
                new AiTranscriptionResponse(true, validTranscript, "en", List.of())
        );

        when(aiServiceClient.analyze(validTranscript)).thenThrow(
                new AiServiceException("The AI service analysis is currently unavailable or timed out")
        );

        MvcResult result = mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile)
                        .param("title", "Quarterly Planning"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status", is("UPLOADED")))
                .andReturn();

        MeetingResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), MeetingResponse.class);
        UUID meetingId = response.getId();

        Meeting persisted = waitForTerminalStatus(meetingId, 5000);
        assertEquals(MeetingStatus.FAILED, persisted.getStatus());
        assertEquals(validTranscript, persisted.getTranscript());
        assertNull(persisted.getSummary());

        // Verify temp directory cleanup
        File tempFolder = Paths.get(tempUploadDir).toFile();
        File[] remainingFiles = tempFolder.listFiles((dir, name) -> name.endsWith(".mp3"));
        assertTrue(remainingFiles == null || remainingFiles.length == 0);
    }

    @Test
    void test5_unsupportedFileExtension_shouldReturn400AndNotCreateMeeting() throws Exception {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "notes.pdf",
                "application/pdf",
                "PDF document data".getBytes()
        );

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(pdfFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message", containsString("Unsupported audio format")));

        verify(aiServiceClient, never()).transcribe(any(), any());
        assertEquals(0, meetingRepository.count());
    }

    @Test
    void test6_emptyFile_shouldReturn400AndNotCreateMeeting() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.mp3",
                "audio/mpeg",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("cannot be empty")));

        verify(aiServiceClient, never()).transcribe(any(), any());
        assertEquals(0, meetingRepository.count());
    }

    @Test
    void test7_nullOwnerAndDeadline_shouldPersistAsNull() throws Exception {
        MockMultipartFile audioFile = new MockMultipartFile(
                "file",
                "task.wav",
                "audio/wav",
                "wav data".getBytes()
        );

        String transcript = "Someone should review the deployment logs.";
        when(aiServiceClient.transcribe(any(Path.class), anyString())).thenReturn(
                new AiTranscriptionResponse(true, transcript, "en", List.of())
        );

        when(aiServiceClient.analyze(transcript)).thenReturn(
                new AiAnalysisResponse(
                        "Discussion on reviewing deployment logs.",
                        List.of(),
                        List.of(new AiActionItem("Review deployment logs", null, null))
                )
        );

        MvcResult result = mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status", is("UPLOADED")))
                .andReturn();

        MeetingResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), MeetingResponse.class);
        UUID meetingId = response.getId();

        Meeting persisted = waitForTerminalStatus(meetingId, 5000);
        assertEquals(MeetingStatus.COMPLETED, persisted.getStatus());
        assertEquals(1, persisted.getActionItems().size());
        ActionItem item = persisted.getActionItems().get(0);
        assertEquals("Review deployment logs", item.getTask());
        assertNull(item.getOwner());
        assertNull(item.getDeadline());
    }
}
