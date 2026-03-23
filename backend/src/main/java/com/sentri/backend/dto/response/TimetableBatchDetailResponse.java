package com.sentri.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record TimetableBatchDetailResponse(
        Long id,
        String yearLabel,
        String branchLabel,
        String divisionLabel,
        String semesterLabel,
        String academicPatternLabel,
        LocalDate effectiveFrom,
        String venue,
        String sourceImageName,
        String sourceImageMimeType,
        String sourceImageChecksum,
        String sourceHint,
        String sourceNotes,
        String rawOcrText,
        Double extractionConfidence,
        String status,
        Instant createdAt,
        Instant updatedAt,
        List<TimetableEntryResponse> entries
) {
}
