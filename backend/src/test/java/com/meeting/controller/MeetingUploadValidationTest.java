package com.meeting.controller;

import com.meeting.repository.MeetingRepository;
import com.meeting.service.AiServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.File;
import java.nio.file.Paths;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MeetingUploadValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MeetingRepository meetingRepository;

    @MockitoBean
    private AiServiceClient aiServiceClient;

    @Value("${app.upload.temp-dir:./temp/uploads}")
    private String tempUploadDir;

    @BeforeEach
    void setUp() {
        meetingRepository.deleteAll();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "audio.mp3",
            "audio.wav",
            "audio.m4a",
            "video.mp4",
            "video.mov",
            "UPPERCASE.MP3",
            "UPPERCASE.MP4"
    })
    @DisplayName("Upload accepts valid supported audio and video media extensions")
    void upload_SupportedMediaExtensions(String filename) throws Exception {
        String contentType = filename.toLowerCase().endsWith(".mp4") ? "video/mp4"
                : filename.toLowerCase().endsWith(".mov") ? "video/quicktime" : "audio/mpeg";

        MockMultipartFile file = new MockMultipartFile("file", filename, contentType, "dummy media content".getBytes());

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(file)
                        .param("title", "Valid Media " + filename))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.status", is("UPLOADED")));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "malware.exe",
            "notes.txt",
            "document.pdf",
            "archive.zip",
            "video.avi",
            "video.mkv",
            "audio.flac",
            "audio.ogg"
    })
    @DisplayName("Upload rejects unsupported extensions with 400 Bad Request")
    void upload_RejectsUnsupportedExtensions(String filename) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", filename, "application/octet-stream", "dummy content".getBytes());

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(file)
                        .param("title", "Unsupported File"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Unsupported media format")));
    }

    @Test
    @DisplayName("Upload rejects empty file (0 bytes) with 400 Bad Request")
    void upload_RejectsEmptyFile() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.mp3", "audio/mpeg", new byte[0]);

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(emptyFile)
                        .param("title", "Empty Recording"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("empty")));
    }

    @Test
    @DisplayName("Upload gracefully defaults to filename base when title is omitted or blank")
    void upload_DefaultsTitleWhenBlankOrOmitted() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "presentation.mp3", "audio/mpeg", "content".getBytes());

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(file)
                        .param("title", "   "))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.title", is("presentation")));
    }

    @Test
    @DisplayName("Upload rejects title exceeding 200 characters with 400 Bad Request")
    void upload_RejectsTooLongTitle() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "valid.mp3", "audio/mpeg", "content".getBytes());
        String longTitle = "A".repeat(201);

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(file)
                        .param("title", longTitle))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("200 characters")));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "../../etc/passwd.mp3",
            "..\\..\\Windows\\System32\\calc.mp3",
            "/absolute/root/file.mp3",
            "C:\\Windows\\System32\\file.mp3"
    })
    @DisplayName("Upload sanitizes path-traversal filenames and prevents escaping temp directory")
    void upload_SanitizesPathTraversal(String traversalFilename) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", traversalFilename, "audio/mpeg", "sample".getBytes());

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(file)
                        .param("title", "Traversal Test"))
                .andExpect(status().isAccepted());

        assertFalse(new File("/etc/passwd.mp3").exists());
        assertFalse(new File("C:\\Windows\\System32\\file.mp3").exists());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "meeting;rm -rf;.mp3",
            "meeting && echo hacked.mp3",
            "meeting | dir.mp3",
            "meeting $(whoami).mp3",
            "meeting `calc`.mp3"
    })
    @DisplayName("Upload neutralizes command-injection characters in filename")
    void upload_SanitizesCommandInjectionFilenames(String maliciousFilename) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", maliciousFilename, "audio/mpeg", "sample".getBytes());

        mockMvc.perform(multipart("/api/meetings/upload")
                        .file(file)
                        .param("title", "Command Injection Test"))
                .andExpect(status().isAccepted());
    }
}
