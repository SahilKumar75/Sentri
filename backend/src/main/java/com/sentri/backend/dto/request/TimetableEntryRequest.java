package com.sentri.backend.dto.request;

import java.time.LocalTime;

public record TimetableEntryRequest(
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        String subjectName,
        String facultyCode,
        String locationLabel,
        String entryType,
        String noteText,
        String rawCellText,
        Integer sortOrder,
        Boolean breakEntry,
        Boolean holidayEntry
) {
}
