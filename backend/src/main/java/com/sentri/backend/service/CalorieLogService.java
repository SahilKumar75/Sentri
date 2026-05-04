package com.sentri.backend.service;

import com.sentri.backend.dto.request.CreateCalorieLogRequest;
import com.sentri.backend.dto.response.CalorieLogResponse;
import com.sentri.backend.dto.response.DailyCalorieSummaryResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * Service contract for calorie log operations.
 */
public interface CalorieLogService {

    /**
     * Records a new calorie log entry for the given user.
     *
     * @param userId  the internal user account id
     * @param request the food-and-calorie details
     * @return the persisted log entry
     */
    CalorieLogResponse addEntry(Long userId, CreateCalorieLogRequest request);

    /**
     * Returns a daily summary (entries + total) for the given user and date.
     *
     * @param userId  the internal user account id
     * @param date    the calendar date to query
     * @return daily summary
     */
    DailyCalorieSummaryResponse getDailySummary(Long userId, LocalDate date);

    /**
     * Returns all log entries for the given user ordered by date desc.
     *
     * @param userId the internal user account id
     * @return list of calorie log responses
     */
    List<CalorieLogResponse> listAll(Long userId);

    /**
     * Deletes a specific calorie log entry that belongs to the given user.
     *
     * @param userId the internal user account id
     * @param logId  the id of the entry to delete
     * @throws com.sentri.backend.exception.ResourceNotFoundException if not found
     * @throws com.sentri.backend.exception.BadRequestException       if the entry belongs to another user
     */
    void deleteEntry(Long userId, Long logId);
}
