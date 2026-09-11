package com.meeting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meeting.config.SecurityHeadersFilter;
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
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.File;
import java.nio.file.Paths;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityHardeningTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MeetingRepository meetingRepository;

    @MockitoBean
    private AiServiceClient aiServiceClient;

    @Value("${app.upload.temp-dir:./temp/uploads}")
    private String tempUploadDir;

    @BeforeEach
    void clean() {
        meetingRepository.deleteAll();
        File tempFolder = Paths.get(tempUploadDir).toFile();
        if (tempFolder.exists() && tempFolder.isDirectory()) {
            File[] files = tempFolder.listFiles();
            if (files != null) {
                for (File f : files) {
                    f.delete();
                }
            }
        }
    }

    @Test
    void testSecurityHeaders_onEndpoints() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().exists("X-Request-ID"));
    }

    @Test
    void testSecurityHeaders_cacheControlOnMeetingEndpoints() throws Exception {
        mockMvc.perform(get("/api/meetings"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0"))
                .andExpect(header().string("Pragma", "no-cache"));
    }

    @Test
    void testRequestId_customSafeHeaderIsPreserved() throws Exception {
        mockMvc.perform(get("/api/health")
                        .header("X-Request-ID", "custom-trace-uuid-12345"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-ID", "custom-trace-uuid-12345"));
    }

    @Test
    void testRequestId_malformedHeaderGeneratesFreshSafeId() throws Exception {
        mockMvc.perform(get("/api/health")
                        .header("X-Request-ID", "malicious\r\nInjected-Header: evil"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-ID", org.hamcrest.Matchers.not("malicious\r\nInjected-Header: evil")));
    }

    @Test
    void testReadinessEndpoint_shouldReportDatabaseUp() throws Exception {
        mockMvc.perform(get("/api/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.database", is("CONNECTED")));
    }

    @Test
    void testInvalidUuidFormat_shouldReturnClean400BadRequest() throws Exception {
        mockMvc.perform(get("/api/meetings/not-a-valid-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message", is("Invalid meeting ID format. Expected a valid UUID.")));
    }

    @Test
    void testPathTraversalInFilename_shouldSaveSafelyInsideTempDir() throws Exception {
        MockMultipartFile traversalFile = new MockMultipartFile(
                "file",
                "../../../../etc/passwd.mp4",
                "video/mp4",
                "dummy mp4 data".getBytes()
        );

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(traversalFile)
                        .param("title", "Path Traversal Test"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.id", notNullValue()));

        File tempFolder = Paths.get(tempUploadDir).toFile();
        assertTrue(tempFolder.exists());
        // Verify no files escaped outside tempFolder
        File[] files = tempFolder.listFiles();
        assertNotNull(files);
        for (File f : files) {
            assertTrue(f.getCanonicalPath().startsWith(tempFolder.getCanonicalPath()));
            assertFalse(f.getName().contains(".."));
        }
    }

    @Test
    void testCommandInjectionFilename_shouldSanitizeWithoutCommandExecution() throws Exception {
        MockMultipartFile injectionFile = new MockMultipartFile(
                "file",
                "test;rm -rf;$(echo hacked).mp4",
                "video/mp4",
                "dummy mp4 data".getBytes()
        );

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(injectionFile)
                        .param("title", "Command Injection Test"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.id", notNullValue()));

        File tempFolder = Paths.get(tempUploadDir).toFile();
        File[] files = tempFolder.listFiles();
        assertNotNull(files);
        for (File f : files) {
            assertTrue(f.getCanonicalPath().startsWith(tempFolder.getCanonicalPath()));
            // Special characters like ; $ ( ) must have been sanitized to underscores
            assertFalse(f.getName().contains(";"));
            assertFalse(f.getName().contains("$"));
            assertFalse(f.getName().contains("("));
        }
    }

    @Test
    void testTitleTooLong_shouldReturn400BadRequest() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "valid.mp3",
                "audio/mpeg",
                "audio bytes".getBytes()
        );

        String excessiveTitle = "a".repeat(201);
        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(file)
                        .param("title", excessiveTitle))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", is("Meeting title must be 200 characters or fewer")));
    }
}
