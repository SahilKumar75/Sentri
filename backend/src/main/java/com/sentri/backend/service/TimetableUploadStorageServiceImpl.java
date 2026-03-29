package com.sentri.backend.service;

import com.sentri.backend.config.TimetableUploadProperties;
import com.sentri.backend.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class TimetableUploadStorageServiceImpl implements TimetableUploadStorageService {

    private final Path storageRoot;

    public TimetableUploadStorageServiceImpl(TimetableUploadProperties properties) {
        this.storageRoot = Path.of(properties.resolvedStorageDir()).toAbsolutePath().normalize();
    }

    @Override
    public StoredTimetableUpload store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("A timetable screenshot is required");
        }

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String extension = extractExtension(originalFilename);
        String storageFilename = UUID.randomUUID() + extension;
        Path destination = storageRoot.resolve(storageFilename);

        try {
            Files.createDirectories(storageRoot);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StoredTimetableUpload(
                    originalFilename,
                    file.getContentType(),
                    sha256(destination),
                    destination.toString()
            );
        } catch (IOException exception) {
            throw new IllegalStateException("Could not store timetable screenshot", exception);
        }
    }

    private String sanitizeFilename(String originalFilename) {
        String candidate = StringUtils.hasText(originalFilename) ? originalFilename : "timetable-upload";
        return Path.of(candidate).getFileName().toString().replaceAll("[^A-Za-z0-9._-]", "-");
    }

    private String extractExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot < 0 || lastDot == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDot);
    }

    private String sha256(Path file) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(Files.readAllBytes(file)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
