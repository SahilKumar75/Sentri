package com.sentri.backend.service;

import com.sentri.backend.dto.request.CreateTimetableBatchRequest;
import com.sentri.backend.dto.request.ParsedTimetableImportRequest;
import com.sentri.backend.dto.response.TimetableBatchDetailResponse;
import com.sentri.backend.dto.response.TimetableBatchSummaryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TimetableBatchService {

    TimetableBatchDetailResponse createPlaceholderBatch(CreateTimetableBatchRequest request);

    TimetableBatchDetailResponse createUploadBatch(MultipartFile file, String sourceHint, String sourceNotes);

    List<TimetableBatchSummaryResponse> listBatches();

    TimetableBatchDetailResponse getBatch(Long batchId);

    TimetableBatchDetailResponse saveParsedTimetable(Long batchId, ParsedTimetableImportRequest request);
}
