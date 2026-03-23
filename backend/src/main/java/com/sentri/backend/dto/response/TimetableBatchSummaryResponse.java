package com.sentri.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;

public record TimetableBatchSummaryResponse(
        Long id,
        String yearLabel,
        String branchLabel,
        String divisionLabel,
        String semesterLabel,
        String academicPatternLabel,
        LocalDate effectiveFrom,
        String venue,
        String sourceImageName,
        String status,
        Double extractionConfidence,
        int entryCount,
        Instant createdAt,
        Instant updatedAt
) {
}
