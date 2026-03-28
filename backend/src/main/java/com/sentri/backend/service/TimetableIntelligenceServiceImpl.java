package com.sentri.backend.service;

import com.sentri.backend.domain.TimetableBatch;
import com.sentri.backend.domain.TimetableEntry;
import com.sentri.backend.dto.response.TimetableInsightClassResponse;
import com.sentri.backend.dto.response.TimetableInsightResponse;
import com.sentri.backend.exception.ResourceNotFoundException;
import com.sentri.backend.repository.TimetableBatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;

@Service
public class TimetableIntelligenceServiceImpl implements TimetableIntelligenceService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");

    private final TimetableBatchRepository timetableBatchRepository;

    public TimetableIntelligenceServiceImpl(TimetableBatchRepository timetableBatchRepository) {
        this.timetableBatchRepository = timetableBatchRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public TimetableInsightResponse buildInsight(Long batchId, OffsetDateTime at) {
        TimetableBatch batch = timetableBatchRepository.findByIdWithEntries(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable batch " + batchId + " was not found"));

        OffsetDateTime anchor = at == null ? OffsetDateTime.now(APP_ZONE) : at;
        LocalDate focusDate = anchor.toLocalDate();
        LocalTime focusTime = anchor.toLocalTime();

        List<TimetableEntry> entries = batch.getEntries().stream()
                .filter(entry -> normalizeDay(entry.getDayOfWeek()).equals(normalizeDay(focusDate.getDayOfWeek().name())))
                .sorted(Comparator.comparing(TimetableEntry::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(TimetableEntry::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        if (entries.isEmpty()) {
            return new TimetableInsightResponse(
                    batch.getId(),
                    "empty",
                    "Nothing planned",
                    "No timetable items are available for this day yet.",
                    "upload_timetable",
                    resolveRefreshState(batch, focusDate),
                    null,
                    null
            );
        }

        TimetableEntry holiday = entries.size() == 1 && Boolean.TRUE.equals(entries.get(0).getHolidayEntry()) ? entries.get(0) : null;
        if (holiday != null) {
            return new TimetableInsightResponse(
                    batch.getId(),
                    "holiday",
                    holiday.getSubjectName() != null ? holiday.getSubjectName() : "Holiday",
                    holiday.getNoteText() != null ? holiday.getNoteText() : "No classes are scheduled for this day.",
                    "none",
                    resolveRefreshState(batch, focusDate),
                    null,
                    null
            );
        }

        int currentIndex = findCurrentIndex(entries, focusTime);
        if (currentIndex >= 0) {
            TimetableEntry current = entries.get(currentIndex);
            TimetableEntry next = currentIndex + 1 < entries.size() ? entries.get(currentIndex + 1) : null;
            long minutesLeft = current.getEndTime() == null ? 0 : Math.max(java.time.Duration.between(focusTime, current.getEndTime()).toMinutes(), 0);

            return new TimetableInsightResponse(
                    batch.getId(),
                    "live",
                    minutesLeft > 0 ? "Live now • " + minutesLeft + " min left" : "Live now",
                    describeEntry(current, "is active right now"),
                    next != null ? "check_next_class" : "none",
                    resolveRefreshState(batch, focusDate),
                    toInsightEntry(current),
                    next == null ? null : toInsightEntry(next)
            );
        }

        int nextIndex = findNextIndex(entries, focusTime);
        if (nextIndex >= 0) {
            TimetableEntry next = entries.get(nextIndex);
            long minutesUntil = next.getStartTime() == null ? 0 : Math.max(java.time.Duration.between(focusTime, next.getStartTime()).toMinutes(), 0);

            return new TimetableInsightResponse(
                    batch.getId(),
                    "upcoming",
                    "Starts in " + minutesUntil + " min",
                    describeEntry(next, "is the next scheduled class"),
                    "check_next_class",
                    resolveRefreshState(batch, focusDate),
                    null,
                    toInsightEntry(next)
            );
        }

        return new TimetableInsightResponse(
                batch.getId(),
                "complete",
                "Day complete",
                "All scheduled classes for today are already finished.",
                "upload_timetable",
                resolveRefreshState(batch, focusDate),
                null,
                null
        );
    }

    private int findCurrentIndex(List<TimetableEntry> entries, LocalTime focusTime) {
        for (int index = 0; index < entries.size(); index++) {
            TimetableEntry entry = entries.get(index);
            if (entry.getStartTime() == null || entry.getEndTime() == null) {
                continue;
            }
            if (!focusTime.isBefore(entry.getStartTime()) && focusTime.isBefore(entry.getEndTime())) {
                return index;
            }
        }
        return -1;
    }

    private int findNextIndex(List<TimetableEntry> entries, LocalTime focusTime) {
        for (int index = 0; index < entries.size(); index++) {
            TimetableEntry entry = entries.get(index);
            if (entry.getStartTime() != null && focusTime.isBefore(entry.getStartTime())) {
                return index;
            }
        }
        return -1;
    }

    private String resolveRefreshState(TimetableBatch batch, LocalDate focusDate) {
        if (batch.getEffectiveFrom() == null) {
            return "unknown";
        }
        return focusDate.isAfter(batch.getEffectiveFrom().plusDays(5)) ? "due" : "fresh";
    }

    private String describeEntry(TimetableEntry entry, String suffix) {
        String subject = safe(entry.getSubjectName(), "Class");
        String room = safe(entry.getLocationLabel(), "room TBD");
        String teacher = safe(entry.getFacultyCode(), "faculty TBD");
        return subject + " in " + room + " with " + teacher + " " + suffix + ".";
    }

    private TimetableInsightClassResponse toInsightEntry(TimetableEntry entry) {
        return new TimetableInsightClassResponse(
                entry.getId(),
                entry.getSubjectName(),
                entry.getFacultyCode(),
                entry.getLocationLabel(),
                entry.getStartTime() == null ? null : entry.getStartTime().toString(),
                entry.getEndTime() == null ? null : entry.getEndTime().toString(),
                entry.getEntryType(),
                entry.getNoteText()
        );
    }

    private String normalizeDay(String value) {
        if (value == null) {
            return "";
        }
        String upper = value.trim().toUpperCase();
        return upper.length() <= 3 ? upper : upper.substring(0, 3);
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
