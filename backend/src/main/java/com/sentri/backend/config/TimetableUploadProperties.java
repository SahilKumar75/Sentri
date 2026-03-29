package com.sentri.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sentri.timetable.upload")
public record TimetableUploadProperties(String storageDir) {

    public String resolvedStorageDir() {
        return storageDir == null || storageDir.isBlank() ? "./data/timetable-uploads" : storageDir;
    }
}
