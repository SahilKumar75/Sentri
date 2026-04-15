package com.sentri.backend.service;

import com.sentri.backend.dto.request.CreateTimetableBatchRequest;
import com.sentri.backend.dto.request.ParsedTimetableImportRequest;
import com.sentri.backend.dto.request.TimetableBatchMetadataRequest;
import com.sentri.backend.dto.request.TimetableEntryRequest;
import com.sentri.backend.dto.response.TimetableBatchDetailResponse;
import com.sentri.backend.dto.response.TimetableInsightResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TimetableIntelligenceServiceTest {

    @Autowired
    private TimetableBatchService timetableBatchService;

    @Autowired
    private TimetableIntelligenceService timetableIntelligenceService;

    @Test
    void returnsLiveClassAndNextClassForActiveSlot() {
        TimetableBatchDetailResponse batch = createParsedBatch();

        TimetableInsightResponse insight = timetableIntelligenceService.buildInsight(
                batch.id(),
                OffsetDateTime.of(2026, 3, 23, 9, 0, 0, 0, ZoneOffset.ofHoursMinutes(5, 30))
        );

        assertThat(insight.status()).isEqualTo("live");
        assertThat(insight.currentClass()).isNotNull();
        assertThat(insight.currentClass().title()).isEqualTo("DBMS");
        assertThat(insight.nextClass()).isNotNull();
        assertThat(insight.nextClass().title()).isEqualTo("Project Management");
    }

    @Test
    void returnsUpcomingClassBeforeFirstSlot() {
        TimetableBatchDetailResponse batch = createParsedBatch();

        TimetableInsightResponse insight = timetableIntelligenceService.buildInsight(
                batch.id(),
                OffsetDateTime.of(2026, 3, 23, 8, 0, 0, 0, ZoneOffset.ofHoursMinutes(5, 30))
        );

        assertThat(insight.status()).isEqualTo("upcoming");
        assertThat(insight.currentClass()).isNull();
        assertThat(insight.nextClass()).isNotNull();
        assertThat(insight.nextClass().title()).isEqualTo("DBMS");
    }

    @Test
    void skipsBreakEntriesWhenResolvingUpcomingClass() {
        TimetableBatchDetailResponse created = timetableBatchService.createPlaceholderBatch(null);
        TimetableBatchDetailResponse batch = timetableBatchService.saveParsedTimetable(created.id(), new ParsedTimetableImportRequest(
                null,
                "MON entries",
                0.9,
                List.of(
                        new TimetableEntryRequest(
                                "MON",
                                LocalTime.of(8, 45),
                                LocalTime.of(9, 0),
                                "Morning Break",
                                null,
                                null,
                                "BREAK",
                                null,
                                "BREAK row",
                                1,
                                true,
                                false
                        ),
                        new TimetableEntryRequest(
                                "MON",
                                LocalTime.of(9, 0),
                                LocalTime.of(9, 45),
                                "DBMS",
                                "Prof. Deshmukh",
                                "LH 19",
                                "LECTURE",
                                null,
                                "DBMS row",
                                2,
                                false,
                                false
                        )
                )
        ));

        TimetableInsightResponse insight = timetableIntelligenceService.buildInsight(
                batch.id(),
                OffsetDateTime.of(2026, 3, 23, 8, 50, 0, 0, ZoneOffset.ofHoursMinutes(5, 30))
        );

        assertThat(insight.status()).isEqualTo("upcoming");
        assertThat(insight.nextClass()).isNotNull();
        assertThat(insight.nextClass().title()).isEqualTo("DBMS");
    }

    @Test
    void returnsHolidayWhenOnlyHolidayEntryExists() {
        TimetableBatchDetailResponse created = timetableBatchService.createPlaceholderBatch(null);
        TimetableBatchDetailResponse batch = timetableBatchService.saveParsedTimetable(created.id(), new ParsedTimetableImportRequest(
                null,
                "MON holiday",
                0.8,
                List.of(
                        new TimetableEntryRequest(
                                "MON",
                                null,
                                null,
                                "Festival Holiday",
                                null,
                                null,
                                "HOLIDAY",
                                "No classes",
                                "HOLIDAY row",
                                1,
                                false,
                                true
                        )
                )
        ));

        TimetableInsightResponse insight = timetableIntelligenceService.buildInsight(
                batch.id(),
                OffsetDateTime.of(2026, 3, 23, 10, 0, 0, 0, ZoneOffset.ofHoursMinutes(5, 30))
        );

        assertThat(insight.status()).isEqualTo("holiday");
        assertThat(insight.headline()).isEqualTo("Festival Holiday");
        assertThat(insight.nextClass()).isNull();
    }

    private TimetableBatchDetailResponse createParsedBatch() {
        TimetableBatchDetailResponse created = timetableBatchService.createPlaceholderBatch(
                new CreateTimetableBatchRequest(
                        new TimetableBatchMetadataRequest(
                                "SE",
                                "IT",
                                "B",
                                "II",
                                "Autonomous",
                                LocalDate.of(2026, 3, 23),
                                "LH 20",
                                "parsed.png",
                                "image/png",
                                "checksum",
                                "ocr-worker",
                                "imported from screenshot"
                        )
                )
        );

        return timetableBatchService.saveParsedTimetable(created.id(), new ParsedTimetableImportRequest(
                new TimetableBatchMetadataRequest(
                        "SE",
                        "IT",
                        "B",
                        "II",
                        "Autonomous",
                        LocalDate.of(2026, 3, 23),
                        "LH 20",
                        "parsed.png",
                        "image/png",
                        "checksum",
                        "ocr-worker",
                        "imported from screenshot"
                ),
                "MON entries",
                0.93,
                List.of(
                        new TimetableEntryRequest(
                                "MON",
                                LocalTime.of(8, 45),
                                LocalTime.of(9, 45),
                                "DBMS",
                                "Prof. Deshmukh",
                                "LH 19",
                                "LECTURE",
                                "Parallel databases",
                                "DBMS row",
                                1,
                                false,
                                false
                        ),
                        new TimetableEntryRequest(
                                "MON",
                                LocalTime.of(9, 50),
                                LocalTime.of(10, 45),
                                "Project Management",
                                "Dr. Kulkarni",
                                "LH 20",
                                "LECTURE",
                                "Sprint review",
                                "PM row",
                                2,
                                false,
                                false
                        )
                )
        ));
    }
}
