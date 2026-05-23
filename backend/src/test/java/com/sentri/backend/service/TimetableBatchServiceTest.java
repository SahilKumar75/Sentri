package com.sentri.backend.service;

import com.sentri.backend.dto.request.CreateTimetableBatchRequest;
import com.sentri.backend.dto.request.ParsedTimetableImportRequest;
import com.sentri.backend.dto.request.TimetableBatchMetadataRequest;
import com.sentri.backend.dto.request.TimetableEntryRequest;
import com.sentri.backend.domain.TimetableBatch;
import com.sentri.backend.dto.response.TimetableBatchDetailResponse;
import com.sentri.backend.exception.BadRequestException;
import com.sentri.backend.repository.TimetableBatchRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
    void deletesBatch() {
        TimetableBatchDetailResponse created = timetableBatchService.createPlaceholderBatch(null);

        timetableBatchService.deleteBatch(created.id());

        assertThat(timetableBatchRepository.findById(created.id())).isEmpty();
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

    @Test
    void normalizesParsedEntryFieldsAndClampsExtractionConfidence() {
        TimetableBatchDetailResponse created = timetableBatchService.createPlaceholderBatch(null);

        TimetableBatchDetailResponse saved = timetableBatchService.saveParsedTimetable(
                created.id(),
                new ParsedTimetableImportRequest(
                        null,
                        "MON 8.45-9.45",
                        1.8,
                        List.of(
                                new TimetableEntryRequest(
                                        "monday",
                                        LocalTime.of(8, 45),
                                        LocalTime.of(9, 45),
                                        "  DBMS  ",
                                        "  MA ",
                                        " LH 20 ",
                                        " lecture ",
                                        "  intro class ",
                                        " raw ",
                                        1,
                                        false,
                                        false
                                )
                        )
                )
        );

        assertThat(saved.extractionConfidence()).isEqualTo(1.0);
        assertThat(saved.entries()).hasSize(1);
        assertThat(saved.entries().get(0).dayOfWeek()).isEqualTo("MON");
        assertThat(saved.entries().get(0).entryType()).isEqualTo("LECTURE");
        assertThat(saved.entries().get(0).subjectName()).isEqualTo("DBMS");
    }

    @Test
    void rejectsParsedEntryWithInvalidTimeRange() {
        TimetableBatchDetailResponse created = timetableBatchService.createPlaceholderBatch(null);

        assertThatThrownBy(() -> timetableBatchService.saveParsedTimetable(
                created.id(),
                new ParsedTimetableImportRequest(
                        null,
                        "invalid range",
                        0.7,
                        List.of(
                                new TimetableEntryRequest(
                                        "MON",
                                        LocalTime.of(10, 0),
                                        LocalTime.of(9, 30),
                                        "DBMS",
                                        null,
                                        null,
                                        "LECTURE",
                                        null,
                                        null,
                                        1,
                                        false,
                                        false
                                )
                        )
                )
        )).isInstanceOf(BadRequestException.class)
                .hasMessageContaining("endTime must be after startTime");
    }

    @Test
    void createsUploadBatchAndPersistsStoredScreenshotMetadata() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "week-13.png",
                "image/png",
                "fake-image".getBytes()
        );

        TimetableBatchDetailResponse created = timetableBatchService.createUploadBatch(
                file,
                "outlook-screenshot",
                "Uploaded from Home"
        );

        assertThat(created.id()).isNotNull();
        assertThat(created.status()).isEqualTo("PLACEHOLDER");
        assertThat(created.sourceImageName()).isEqualTo("week-13.png");
        assertThat(created.sourceImageMimeType()).isEqualTo("image/png");
        assertThat(created.sourceImageChecksum()).isNotBlank();

        TimetableBatch persisted = timetableBatchRepository.findByIdWithEntries(created.id()).orElseThrow();
        assertThat(persisted.getSourceImageStoragePath()).isNotBlank();
        assertThat(Files.exists(Path.of(persisted.getSourceImageStoragePath()))).isTrue();
    }

        @Test
        void rejectsUploadBatchForUnsupportedFileType() {
                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "week-13.txt",
                                "text/plain",
                                "not-an-image".getBytes()
                );

                assertThatThrownBy(() -> timetableBatchService.createUploadBatch(file, "test", null))
                                .isInstanceOf(BadRequestException.class)
                                .hasMessageContaining("Only PNG/JPG/WEBP screenshot files are supported");
        }

        @Test
        void rejectsUploadBatchWhenFileIsTooLarge() {
                byte[] oversized = new byte[2048];
                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "week-13.png",
                                "image/png",
                                oversized
                );

                assertThatThrownBy(() -> timetableBatchService.createUploadBatch(file, "test", null))
                                .isInstanceOf(BadRequestException.class)
                                .hasMessageContaining("Uploaded screenshot exceeds size limit");
        }
}
