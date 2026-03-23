package com.sentri.backend.dto.response;

import java.time.LocalTime;

public record TimetableEntryResponse(
        Long id,
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        String subjectName,
        String facultyCode,
        String locationLabel,
        String entryType,
        Boolean breakEntry,
        Boolean holidayEntry,
        Integer sortOrder,
        String noteText,
        String rawCellText
) {
}
