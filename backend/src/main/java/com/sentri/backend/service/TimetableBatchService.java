package com.sentri.backend.service;

import com.sentri.backend.dto.request.CreateTimetableBatchRequest;
import com.sentri.backend.dto.request.ParsedTimetableImportRequest;
import com.sentri.backend.dto.response.TimetableBatchDetailResponse;
import com.sentri.backend.dto.response.TimetableBatchSummaryResponse;

import java.util.List;

public interface TimetableBatchService {

    TimetableBatchDetailResponse createPlaceholderBatch(CreateTimetableBatchRequest request);

    List<TimetableBatchSummaryResponse> listBatches();

    TimetableBatchDetailResponse getBatch(Long batchId);

    TimetableBatchDetailResponse saveParsedTimetable(Long batchId, ParsedTimetableImportRequest request);
}
