package com.sentri.backend.dto.response;

public record TimetableInsightResponse(
        Long batchId,
        String status,
        String headline,
        String explanation,
        String recommendedAction,
        String refreshState,
        TimetableInsightClassResponse currentClass,
        TimetableInsightClassResponse nextClass
) {
}
