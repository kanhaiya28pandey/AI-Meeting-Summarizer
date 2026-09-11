package com.meeting.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class TemporaryFileService {

    private static final Logger log = LoggerFactory.getLogger(TemporaryFileService.class);

    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of(".mp3", ".wav", ".m4a");
    private static final Set<String> SUPPORTED_MIME_TYPES = Set.of(
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/wave",
            "audio/mp4",
            "audio/m4a",
            "audio/x-m4a"
    );

    private final Path tempDir;

    public TemporaryFileService(@Value("${app.upload.temp-dir:./temp/uploads}") String tempDirPath) {
        this.tempDir = Paths.get(tempDirPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.tempDir);
        } catch (IOException e) {
            log.error("Failed to create temporary upload directory: {}", this.tempDir, e);
            throw new IllegalStateException("Could not initialize temporary upload storage", e);
        }
    }

    public void validateAudioFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded audio file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Original filename is required");
        }

        String extension = getExtension(originalFilename).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    String.format("Unsupported audio format '%s'. Supported formats: MP3, WAV, M4A", extension)
            );
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            String normalizedMime = contentType.toLowerCase().split(";")[0].trim();
            if (!SUPPORTED_MIME_TYPES.contains(normalizedMime) && !normalizedMime.equals("application/octet-stream")) {
                throw new IllegalArgumentException(
                        String.format("Unsupported audio MIME type '%s'. Supported formats: MP3, WAV, M4A", contentType)
                );
            }
        }
    }

    public Path saveTemporaryFile(MultipartFile file) throws IOException {
        validateAudioFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename).toLowerCase();
        String safeBaseName = Paths.get(originalFilename).getFileName().toString()
                .replaceAll("[^a-zA-Z0-9._-]", "_");

        String uniqueFileName = UUID.randomUUID() + "_" + safeBaseName;
        Path targetPath = this.tempDir.resolve(uniqueFileName).normalize();

        // Path traversal guard
        if (!targetPath.startsWith(this.tempDir)) {
            throw new SecurityException("Invalid file path specification");
        }

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        log.info("Saved temporary audio file: {}", targetPath.getFileName());
        return targetPath;
    }

    public void deleteTemporaryFile(Path path) {
        if (path == null) {
            return;
        }
        try {
            boolean deleted = Files.deleteIfExists(path);
            if (deleted) {
                log.info("Cleaned up temporary audio file: {}", path.getFileName());
            }
        } catch (Exception e) {
            log.warn("Failed to delete temporary audio file: {}", path, e);
        }
    }

    public static String getExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int dotIdx = filename.lastIndexOf('.');
        return dotIdx >= 0 ? filename.substring(dotIdx) : "";
    }

    public static String getBaseName(String filename) {
        if (filename == null || filename.isBlank()) {
            return "Untitled Meeting";
        }
        String clean = Paths.get(filename).getFileName().toString();
        int dotIdx = clean.lastIndexOf('.');
        return dotIdx > 0 ? clean.substring(0, dotIdx) : clean;
    }
}
