package com.meeting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
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

    @Test
    void test1_successfulPipeline_shouldReturn201AndPersistCompletedMeeting() throws Exception {
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

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile)
                        .param("title", "Weekly Team Meeting"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/meetings/")))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Weekly Team Meeting")))
                .andExpect(jsonPath("$.originalFileName", is("meeting.mp3")))
                .andExpect(jsonPath("$.fileType", is("audio/mpeg")))
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.transcript", is(sampleTranscript)))
                .andExpect(jsonPath("$.summary", is("The team agreed to launch Friday after testing.")))
                .andExpect(jsonPath("$.keyDecisions", hasSize(1)))
                .andExpect(jsonPath("$.keyDecisions[0]", is("Launch on Friday")))
                .andExpect(jsonPath("$.actionItems", hasSize(1)))
                .andExpect(jsonPath("$.actionItems[0].task", is("Complete testing")))
                .andExpect(jsonPath("$.actionItems[0].owner", is("Rahul")))
                .andExpect(jsonPath("$.actionItems[0].deadline", is("Thursday")));

        // Verify in PostgreSQL database
        List<Meeting> meetings = meetingRepository.findAll();
        assertEquals(1, meetings.size());
        Meeting persisted = meetings.get(0);
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

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile)
                        .param("title", "Planning Sync"))
                .andExpect(status().isServiceUnavailable());

        // Verify analysis was not invoked
        verify(aiServiceClient, never()).analyze(anyString());

        // Verify meeting remains in PostgreSQL with FAILED status
        List<Meeting> meetings = meetingRepository.findAll();
        assertEquals(1, meetings.size());
        Meeting failedMeeting = meetings.get(0);
        assertEquals(MeetingStatus.FAILED, failedMeeting.getStatus());
        assertNull(failedMeeting.getTranscript());
        assertNull(failedMeeting.getSummary());

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

        when(aiServiceClient.transcribe(any(Path.class), anyString())).thenThrow(
                new AiServiceException("AI service returned an empty or unsuccessful transcript")
        );

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile))
                .andExpect(status().isServiceUnavailable());

        verify(aiServiceClient, never()).analyze(anyString());

        List<Meeting> meetings = meetingRepository.findAll();
        assertEquals(1, meetings.size());
        assertEquals(MeetingStatus.FAILED, meetings.get(0).getStatus());
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

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile)
                        .param("title", "Quarterly Planning"))
                .andExpect(status().isServiceUnavailable());

        // Verify meeting has status FAILED, but transcript is preserved
        List<Meeting> meetings = meetingRepository.findAll();
        assertEquals(1, meetings.size());
        Meeting persisted = meetings.get(0);
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

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(audioFile))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.actionItems[0].task", is("Review deployment logs")))
                .andExpect(jsonPath("$.actionItems[0].owner").doesNotExist())
                .andExpect(jsonPath("$.actionItems[0].deadline").doesNotExist());

        List<Meeting> meetings = meetingRepository.findAll();
        assertEquals(1, meetings.size());
        ActionItem item = meetings.get(0).getActionItems().get(0);
        assertEquals("Review deployment logs", item.getTask());
        assertNull(item.getOwner());
        assertNull(item.getDeadline());
    }
}
