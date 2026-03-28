package com.sentri.backend.controller;

import com.sentri.backend.dto.request.CreateTimetableBatchRequest;
import com.sentri.backend.dto.request.ParsedTimetableImportRequest;
import com.sentri.backend.dto.response.TimetableBatchDetailResponse;
import com.sentri.backend.dto.response.TimetableInsightResponse;
import com.sentri.backend.dto.response.TimetableBatchSummaryResponse;
import com.sentri.backend.service.TimetableIntelligenceService;
import com.sentri.backend.service.TimetableBatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/timetable-batches", produces = MediaType.APPLICATION_JSON_VALUE)
public class TimetableBatchController {

    private final TimetableBatchService timetableBatchService;
    private final TimetableIntelligenceService timetableIntelligenceService;

    public TimetableBatchController(
            TimetableBatchService timetableBatchService,
            TimetableIntelligenceService timetableIntelligenceService
    ) {
        this.timetableBatchService = timetableBatchService;
        this.timetableIntelligenceService = timetableIntelligenceService;
    }

    @PostMapping
    public ResponseEntity<TimetableBatchDetailResponse> create(@RequestBody(required = false) CreateTimetableBatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timetableBatchService.createPlaceholderBatch(request));
    }

    @GetMapping
    public List<TimetableBatchSummaryResponse> list() {
        return timetableBatchService.listBatches();
    }

    @GetMapping("/{batchId}")
    public TimetableBatchDetailResponse get(@PathVariable Long batchId) {
        return timetableBatchService.getBatch(batchId);
    }

    @GetMapping("/{batchId}/insights")
    public TimetableInsightResponse getInsights(
            @PathVariable Long batchId,
            @RequestParam(name = "at", required = false) OffsetDateTime at
    ) {
        return timetableIntelligenceService.buildInsight(batchId, at);
    }

    @PostMapping("/{batchId}/parsed-data")
    public TimetableBatchDetailResponse saveParsedData(
            @PathVariable Long batchId,
            @Valid @RequestBody ParsedTimetableImportRequest request
    ) {
        return timetableBatchService.saveParsedTimetable(batchId, request);
    }
}
