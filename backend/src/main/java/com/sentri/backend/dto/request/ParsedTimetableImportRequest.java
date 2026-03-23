package com.sentri.backend.dto.request;

import java.util.List;

public record ParsedTimetableImportRequest(
        TimetableBatchMetadataRequest metadata,
        String rawOcrText,
        Double extractionConfidence,
        List<TimetableEntryRequest> entries
) {
}
