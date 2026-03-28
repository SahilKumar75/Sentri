package com.sentri.backend.dto.response;

public record TimetableInsightClassResponse(
        Long entryId,
        String title,
        String teacher,
        String room,
        String start,
        String end,
        String entryType,
        String note
) {
}
