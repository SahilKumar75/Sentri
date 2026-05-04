package com.sentri.backend.dto.response;

import java.time.LocalDate;
import java.util.List;

/**
 * Daily summary response: all calorie log entries for a user on one date
 * plus the running total for that day.
 */
public class DailyCalorieSummaryResponse {

    private LocalDate date;
    private int totalCalories;
    private List<CalorieLogResponse> entries;

    public DailyCalorieSummaryResponse() {
    }

    public DailyCalorieSummaryResponse(LocalDate date, int totalCalories, List<CalorieLogResponse> entries) {
        this.date = date;
        this.totalCalories = totalCalories;
        this.entries = entries;
    }

    public LocalDate getDate() { return date; }
    public int getTotalCalories() { return totalCalories; }
    public List<CalorieLogResponse> getEntries() { return entries; }
}
