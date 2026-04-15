package com.sentri.backend.service;

import com.sentri.backend.domain.TimetableBatch;
import com.sentri.backend.domain.TimetableBatchStatus;
import com.sentri.backend.domain.TimetableEntry;
import com.sentri.backend.dto.request.CreateTimetableBatchRequest;
import com.sentri.backend.dto.request.ParsedTimetableImportRequest;
import com.sentri.backend.dto.request.TimetableBatchMetadataRequest;
import com.sentri.backend.dto.request.TimetableEntryRequest;
import com.sentri.backend.dto.response.TimetableBatchDetailResponse;
import com.sentri.backend.dto.response.TimetableBatchSummaryResponse;
import com.sentri.backend.dto.response.TimetableEntryResponse;
import com.sentri.backend.exception.BadRequestException;
import com.sentri.backend.exception.ResourceNotFoundException;
import com.sentri.backend.repository.TimetableBatchRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class TimetableBatchServiceImpl implements TimetableBatchService {

    private static final Set<String> SUPPORTED_ENTRY_TYPES = Set.of(
            "LECTURE",
            "LAB",
            "TUTORIAL",
            "BREAK",
            "HOLIDAY"
    );

    private final TimetableBatchRepository timetableBatchRepository;
    private final TimetableUploadStorageService timetableUploadStorageService;

    public TimetableBatchServiceImpl(
            TimetableBatchRepository timetableBatchRepository,
            TimetableUploadStorageService timetableUploadStorageService
    ) {
        this.timetableBatchRepository = timetableBatchRepository;
        this.timetableUploadStorageService = timetableUploadStorageService;
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"timetableBatchSummaries", "timetableBatchDetails"}, allEntries = true)
    public TimetableBatchDetailResponse createPlaceholderBatch(CreateTimetableBatchRequest request) {
        TimetableBatch batch = new TimetableBatch();
        batch.setStatus(TimetableBatchStatus.PLACEHOLDER);
        applyMetadata(batch, request == null ? null : request.metadata());
        TimetableBatch saved = timetableBatchRepository.saveAndFlush(batch);
        return toDetailResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"timetableBatchSummaries", "timetableBatchDetails"}, allEntries = true)
    public TimetableBatchDetailResponse createUploadBatch(MultipartFile file, String sourceHint, String sourceNotes) {
        StoredTimetableUpload storedUpload = timetableUploadStorageService.store(file);
        TimetableBatch batch = new TimetableBatch();
        batch.setStatus(TimetableBatchStatus.PLACEHOLDER);
        batch.setSourceImageName(storedUpload.originalFilename());
        batch.setSourceImageMimeType(storedUpload.mimeType());
        batch.setSourceImageChecksum(storedUpload.checksum());
        batch.setSourceImageStoragePath(storedUpload.storagePath());
        batch.setSourceHint(sourceHint);
        batch.setSourceNotes(sourceNotes);
        TimetableBatch saved = timetableBatchRepository.saveAndFlush(batch);
        return toDetailResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "timetableBatchSummaries")
    public List<TimetableBatchSummaryResponse> listBatches() {
        return timetableBatchRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "timetableBatchDetails", key = "#batchId")
    public TimetableBatchDetailResponse getBatch(Long batchId) {
        TimetableBatch batch = timetableBatchRepository.findByIdWithEntries(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable batch " + batchId + " was not found"));
        return toDetailResponse(batch);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"timetableBatchSummaries", "timetableBatchDetails"}, allEntries = true)
    public TimetableBatchDetailResponse saveParsedTimetable(Long batchId, ParsedTimetableImportRequest request) {
        if (request == null) {
            throw new BadRequestException("Parsed timetable payload is required");
        }
        if (request.entries() == null || request.entries().isEmpty()) {
            throw new BadRequestException("Parsed timetable must include at least one entry");
        }

        TimetableBatch batch = timetableBatchRepository.findByIdWithEntries(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable batch " + batchId + " was not found"));

        applyMetadata(batch, request.metadata());
        batch.setRawOcrText(request.rawOcrText());
        batch.setExtractionConfidence(normalizeExtractionConfidence(request.extractionConfidence()));
        batch.setStatus(TimetableBatchStatus.PARSED);
        batch.replaceEntries(toEntities(request.entries()));

        TimetableBatch saved = timetableBatchRepository.saveAndFlush(batch);
        return toDetailResponse(saved);
    }

    private void applyMetadata(TimetableBatch batch, TimetableBatchMetadataRequest metadata) {
        if (metadata == null) {
            return;
        }
        if (metadata.yearLabel() != null) {
            batch.setYearLabel(metadata.yearLabel());
        }
        if (metadata.branchLabel() != null) {
            batch.setBranchLabel(metadata.branchLabel());
        }
        if (metadata.divisionLabel() != null) {
            batch.setDivisionLabel(metadata.divisionLabel());
        }
        if (metadata.semesterLabel() != null) {
            batch.setSemesterLabel(metadata.semesterLabel());
        }
        if (metadata.academicPatternLabel() != null) {
            batch.setAcademicPatternLabel(metadata.academicPatternLabel());
        }
        if (metadata.effectiveFrom() != null) {
            batch.setEffectiveFrom(metadata.effectiveFrom());
        }
        if (metadata.venue() != null) {
            batch.setVenue(metadata.venue());
        }
        if (metadata.sourceImageName() != null) {
            batch.setSourceImageName(metadata.sourceImageName());
        }
        if (metadata.sourceImageMimeType() != null) {
            batch.setSourceImageMimeType(metadata.sourceImageMimeType());
        }
        if (metadata.sourceImageChecksum() != null) {
            batch.setSourceImageChecksum(metadata.sourceImageChecksum());
        }
        if (metadata.sourceHint() != null) {
            batch.setSourceHint(metadata.sourceHint());
        }
        if (metadata.sourceNotes() != null) {
            batch.setSourceNotes(metadata.sourceNotes());
        }
    }

    private List<TimetableEntry> toEntities(List<TimetableEntryRequest> requests) {
        return java.util.stream.IntStream.range(0, requests.size())
                .mapToObj(index -> toEntity(requests.get(index), index + 1))
                .sorted(Comparator.comparingInt(entry -> entry.getSortOrder() == null ? Integer.MAX_VALUE : entry.getSortOrder()))
                .toList();
    }

    private TimetableEntry toEntity(TimetableEntryRequest request, int fallbackSortOrder) {
        if (request == null) {
            throw new BadRequestException("Parsed timetable entry at position " + fallbackSortOrder + " is null");
        }
        String normalizedDay = normalizeDayOfWeek(request.dayOfWeek());
        if (normalizedDay.isBlank()) {
            throw new BadRequestException("dayOfWeek is required for parsed entry at position " + fallbackSortOrder);
        }
        if (request.startTime() != null && request.endTime() != null && !request.endTime().isAfter(request.startTime())) {
            throw new BadRequestException("endTime must be after startTime for parsed entry at position " + fallbackSortOrder);
        }

        String normalizedType = normalizeEntryType(request.entryType());
        String normalizedSubject = normalizeSubjectName(request.subjectName(), normalizedType);

        TimetableEntry entry = new TimetableEntry();
        entry.setDayOfWeek(normalizedDay);
        entry.setStartTime(request.startTime());
        entry.setEndTime(request.endTime());
        entry.setSubjectName(normalizedSubject);
        entry.setFacultyCode(normalizeNullable(request.facultyCode()));
        entry.setLocationLabel(normalizeNullable(request.locationLabel()));
        entry.setEntryType(normalizedType);
        entry.setNoteText(normalizeNullable(request.noteText()));
        entry.setRawCellText(normalizeNullable(request.rawCellText()));
        entry.setSortOrder(request.sortOrder() == null ? fallbackSortOrder : request.sortOrder());
        entry.setBreakEntry("BREAK".equals(normalizedType) || Boolean.TRUE.equals(request.breakEntry()));
        entry.setHolidayEntry("HOLIDAY".equals(normalizedType) || Boolean.TRUE.equals(request.holidayEntry()));
        return entry;
    }

    private Double normalizeExtractionConfidence(Double extractionConfidence) {
        if (extractionConfidence == null) {
            return null;
        }
        return Math.max(0.0d, Math.min(1.0d, extractionConfidence));
    }

    private String normalizeDayOfWeek(String dayOfWeek) {
        String normalized = normalizeNullable(dayOfWeek);
        if (normalized == null) {
            return "";
        }
        String upper = normalized.toUpperCase();
        return upper.length() <= 3 ? upper : upper.substring(0, 3);
    }

    private String normalizeEntryType(String entryType) {
        String normalized = normalizeNullable(entryType);
        if (normalized == null) {
            return "LECTURE";
        }
        String upper = normalized.toUpperCase();
        if (!SUPPORTED_ENTRY_TYPES.contains(upper)) {
            throw new BadRequestException("Unsupported entryType: " + entryType);
        }
        return upper;
    }

    private String normalizeSubjectName(String subjectName, String entryType) {
        String normalized = normalizeNullable(subjectName);
        if (normalized != null) {
            return normalized;
        }
        if ("BREAK".equals(entryType)) {
            return "Break";
        }
        if ("HOLIDAY".equals(entryType)) {
            return "Holiday";
        }
        throw new BadRequestException("subjectName is required for non-break timetable entries");
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private TimetableBatchSummaryResponse toSummaryResponse(TimetableBatch batch) {
        return new TimetableBatchSummaryResponse(
                batch.getId(),
                batch.getYearLabel(),
                batch.getBranchLabel(),
                batch.getDivisionLabel(),
                batch.getSemesterLabel(),
                batch.getAcademicPatternLabel(),
                batch.getEffectiveFrom(),
                batch.getVenue(),
                batch.getSourceImageName(),
                batch.getStatus().name(),
                batch.getExtractionConfidence(),
                batch.getEntries().size(),
                batch.getCreatedAt(),
                batch.getUpdatedAt()
        );
    }

    private TimetableBatchDetailResponse toDetailResponse(TimetableBatch batch) {
        List<TimetableEntryResponse> entries = batch.getEntries().stream()
                .sorted(Comparator.comparing(TimetableEntry::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(TimetableEntry::getStartTime, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(TimetableEntry::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toResponse)
                .toList();

        return new TimetableBatchDetailResponse(
                batch.getId(),
                batch.getYearLabel(),
                batch.getBranchLabel(),
                batch.getDivisionLabel(),
                batch.getSemesterLabel(),
                batch.getAcademicPatternLabel(),
                batch.getEffectiveFrom(),
                batch.getVenue(),
                batch.getSourceImageName(),
                batch.getSourceImageMimeType(),
                batch.getSourceImageChecksum(),
                batch.getSourceHint(),
                batch.getSourceNotes(),
                batch.getRawOcrText(),
                batch.getExtractionConfidence(),
                batch.getStatus().name(),
                batch.getCreatedAt(),
                batch.getUpdatedAt(),
                entries
        );
    }

    private TimetableEntryResponse toResponse(TimetableEntry entry) {
        return new TimetableEntryResponse(
                entry.getId(),
                entry.getDayOfWeek(),
                entry.getStartTime(),
                entry.getEndTime(),
                entry.getSubjectName(),
                entry.getFacultyCode(),
                entry.getLocationLabel(),
                entry.getEntryType(),
                entry.getBreakEntry(),
                entry.getHolidayEntry(),
                entry.getSortOrder(),
                entry.getNoteText(),
                entry.getRawCellText()
        );
    }
}
