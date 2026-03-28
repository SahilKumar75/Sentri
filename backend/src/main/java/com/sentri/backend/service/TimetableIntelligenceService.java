package com.sentri.backend.service;

import com.sentri.backend.dto.response.TimetableInsightResponse;

import java.time.OffsetDateTime;

public interface TimetableIntelligenceService {

    TimetableInsightResponse buildInsight(Long batchId, OffsetDateTime at);
}
