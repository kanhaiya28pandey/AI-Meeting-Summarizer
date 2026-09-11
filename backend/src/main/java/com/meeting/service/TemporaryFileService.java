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

    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of(".mp3", ".wav", ".m4a", ".mp4", ".mov");
    private static final Set<String> SUPPORTED_MIME_TYPES = Set.of(
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/wave",
            "audio/mp4",
            "audio/m4a",
            "audio/x-m4a",
            "video/mp4",
            "video/quicktime",
            "video/x-m4v"
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
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Original filename is required");
        }

        String extension = getExtension(originalFilename).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    String.format("Unsupported media format '%s'. Supported formats: MP3, WAV, M4A, MP4, MOV", extension)
            );
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            String normalizedMime = contentType.toLowerCase().split(";")[0].trim();
            if (!SUPPORTED_MIME_TYPES.contains(normalizedMime) && !normalizedMime.equals("application/octet-stream")) {
                throw new IllegalArgumentException(
                        String.format("Unsupported media MIME type '%s'. Supported formats: MP3, WAV, M4A, MP4, MOV", contentType)
                );
            }
        }
    }

    public Path saveTemporaryFile(MultipartFile file) throws IOException {
        validateAudioFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename).toLowerCase();

        // Normalize slashes and extract strictly the leaf filename
        String normalizedSlash = originalFilename.replace('\\', '/');
        int lastSlash = normalizedSlash.lastIndexOf('/');
        String leafName = lastSlash >= 0 ? normalizedSlash.substring(lastSlash + 1) : normalizedSlash;
        if (leafName.isBlank()) {
            leafName = "upload" + extension;
        }

        // Sanitize all special and shell-sensitive characters
        String safeBaseName = leafName.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (safeBaseName.length() > 100) {
            safeBaseName = safeBaseName.substring(0, 100);
        }

        String uniqueFileName = UUID.randomUUID() + "_" + safeBaseName;
        Path targetPath = this.tempDir.resolve(uniqueFileName).normalize();

        // Path traversal guard: ensure strictly inside tempDir root
        if (!targetPath.startsWith(this.tempDir) || !targetPath.getParent().equals(this.tempDir)) {
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
        String normalized = filename.replace('\\', '/');
        int lastSlash = normalized.lastIndexOf('/');
        String clean = lastSlash >= 0 ? normalized.substring(lastSlash + 1) : normalized;
        int dotIdx = clean.lastIndexOf('.');
        String base = dotIdx > 0 ? clean.substring(0, dotIdx) : clean;
        return base.isBlank() ? "Untitled Meeting" : base;
    }
}
