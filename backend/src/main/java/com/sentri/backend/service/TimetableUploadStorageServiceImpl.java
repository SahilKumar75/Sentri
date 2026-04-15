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
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class TimetableUploadStorageServiceImpl implements TimetableUploadStorageService {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".png",
            ".jpg",
            ".jpeg",
            ".webp"
    );

    private final Path storageRoot;
    private final long maxFileSizeBytes;

    public TimetableUploadStorageServiceImpl(TimetableUploadProperties properties) {
        this.storageRoot = Path.of(properties.resolvedStorageDir()).toAbsolutePath().normalize();
        this.maxFileSizeBytes = properties.resolvedMaxFileSizeBytes();
    }

    @Override
    public StoredTimetableUpload store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("A timetable screenshot is required");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("Uploaded screenshot exceeds size limit");
        }

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String extension = extractExtension(originalFilename);
        String mimeType = normalizeMimeType(file.getContentType());
        if (!isSupportedFile(extension, mimeType)) {
            throw new BadRequestException("Only PNG/JPG/WEBP screenshot files are supported");
        }

        String storageFilename = UUID.randomUUID() + extension;
        Path destination = storageRoot.resolve(storageFilename);

        try {
            Files.createDirectories(storageRoot);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StoredTimetableUpload(
                    originalFilename,
                    mimeType,
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
        return filename.substring(lastDot).toLowerCase(Locale.ROOT);
    }

    private String normalizeMimeType(String mimeType) {
        if (!StringUtils.hasText(mimeType)) {
            return null;
        }
        String normalized = mimeType.toLowerCase(Locale.ROOT).trim();
        int separatorIndex = normalized.indexOf(';');
        return separatorIndex < 0 ? normalized : normalized.substring(0, separatorIndex).trim();
    }

    private boolean isSupportedFile(String extension, String mimeType) {
        return ALLOWED_EXTENSIONS.contains(extension)
                || (mimeType != null && ALLOWED_MIME_TYPES.contains(mimeType));
    }

    private String sha256(Path file) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream inputStream = new DigestInputStream(Files.newInputStream(file), digest)) {
                byte[] buffer = new byte[8192];
                while (inputStream.read(buffer) != -1) {
                    // Stream file to digest without loading entire upload into memory.
                }
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
