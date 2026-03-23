package com.sentri.backend.service;

import com.sentri.backend.dto.request.CreateTimetableBatchRequest;
import com.sentri.backend.dto.request.ParsedTimetableImportRequest;
import com.sentri.backend.dto.request.TimetableBatchMetadataRequest;
import com.sentri.backend.dto.request.TimetableEntryRequest;
import com.sentri.backend.domain.TimetableBatch;
import com.sentri.backend.dto.response.TimetableBatchDetailResponse;
import com.sentri.backend.repository.TimetableBatchRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TimetableBatchServiceTest {

    @Autowired
    private TimetableBatchService timetableBatchService;

    @Autowired
    private TimetableBatchRepository timetableBatchRepository;

    @Test
    void createsPlaceholderBatchAndListsIt() {
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
                                "timetable.png",
                                "image/png",
                                "checksum",
                                "share-sheet",
                                "student upload"
                        )
                )
        );

        assertThat(created.id()).isNotNull();
        assertThat(created.status()).isEqualTo("PLACEHOLDER");

        assertThat(timetableBatchService.listBatches()).hasSize(1);
        assertThat(timetableBatchService.listBatches().get(0).sourceImageName()).isEqualTo("timetable.png");
    }

    @Test
    void savesParsedTimetableAndReplacesEntries() {
        TimetableBatchDetailResponse created = timetableBatchService.createPlaceholderBatch(null);

        ParsedTimetableImportRequest importRequest = new ParsedTimetableImportRequest(
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
                "MON 8.45-9.45 DM & SM",
                0.91,
                List.of(
                        new TimetableEntryRequest(
                                "MON",
                                LocalTime.of(8, 45),
                                LocalTime.of(9, 45),
                                "DM & SM",
                                "MA",
                                "Lab-III",
                                "LAB",
                                "Assignment No. 7",
                                "DM & SM (A) Lab-III",
                                1,
                                false,
                                false
                        )
                )
        );

        TimetableBatchDetailResponse saved = timetableBatchService.saveParsedTimetable(created.id(), importRequest);

        assertThat(saved.status()).isEqualTo("PARSED");
        assertThat(saved.entries()).hasSize(1);
        assertThat(saved.entries().get(0).subjectName()).isEqualTo("DM & SM");
        TimetableBatch persisted = timetableBatchRepository.findByIdWithEntries(created.id()).orElseThrow();
        assertThat(persisted.getEntries()).hasSize(1);
    }
}
