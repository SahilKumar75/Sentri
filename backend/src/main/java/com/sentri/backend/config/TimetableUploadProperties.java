package com.sentri.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sentri.timetable.upload")
public record TimetableUploadProperties(String storageDir, Long maxFileSizeBytes) {

    private static final long DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

    public String resolvedStorageDir() {
        return storageDir == null || storageDir.isBlank() ? "./data/timetable-uploads" : storageDir;
    }

    public long resolvedMaxFileSizeBytes() {
        return maxFileSizeBytes == null || maxFileSizeBytes <= 0
                ? DEFAULT_MAX_FILE_SIZE_BYTES
                : maxFileSizeBytes;
    }
}
