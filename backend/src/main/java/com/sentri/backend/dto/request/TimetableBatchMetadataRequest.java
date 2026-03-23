package com.sentri.backend.dto.request;

import java.time.LocalDate;

public record TimetableBatchMetadataRequest(
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
        String sourceNotes
) {
}
