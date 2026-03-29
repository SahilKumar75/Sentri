package com.sentri.backend.service;

public record StoredTimetableUpload(
        String originalFilename,
        String mimeType,
        String checksum,
        String storagePath
) {
}
