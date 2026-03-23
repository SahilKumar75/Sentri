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
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class TimetableBatchServiceImpl implements TimetableBatchService {

    private final TimetableBatchRepository timetableBatchRepository;

    public TimetableBatchServiceImpl(TimetableBatchRepository timetableBatchRepository) {
        this.timetableBatchRepository = timetableBatchRepository;
    }

    @Override
    @Transactional
    public TimetableBatchDetailResponse createPlaceholderBatch(CreateTimetableBatchRequest request) {
        TimetableBatch batch = new TimetableBatch();
        batch.setStatus(TimetableBatchStatus.PLACEHOLDER);
        applyMetadata(batch, request == null ? null : request.metadata());
        TimetableBatch saved = timetableBatchRepository.saveAndFlush(batch);
        return toDetailResponse(saved);
    }

    @Override
    @Transactional
    public List<TimetableBatchSummaryResponse> listBatches() {
        return timetableBatchRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional
    public TimetableBatchDetailResponse getBatch(Long batchId) {
        TimetableBatch batch = timetableBatchRepository.findByIdWithEntries(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable batch " + batchId + " was not found"));
        return toDetailResponse(batch);
    }

    @Override
    @Transactional
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
        batch.setExtractionConfidence(request.extractionConfidence());
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
        TimetableEntry entry = new TimetableEntry();
        entry.setDayOfWeek(request.dayOfWeek());
        entry.setStartTime(request.startTime());
        entry.setEndTime(request.endTime());
        entry.setSubjectName(request.subjectName());
        entry.setFacultyCode(request.facultyCode());
        entry.setLocationLabel(request.locationLabel());
        entry.setEntryType(request.entryType());
        entry.setNoteText(request.noteText());
        entry.setRawCellText(request.rawCellText());
        entry.setSortOrder(request.sortOrder() == null ? fallbackSortOrder : request.sortOrder());
        entry.setBreakEntry(Boolean.TRUE.equals(request.breakEntry()));
        entry.setHolidayEntry(Boolean.TRUE.equals(request.holidayEntry()));
        return entry;
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
