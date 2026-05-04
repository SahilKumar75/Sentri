package com.sentri.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Response body for a single calorie log entry.
 */
public class CalorieLogResponse {

    private Long id;
    private LocalDate logDate;
    private String foodLabel;
    private Integer calories;
    private String mealSlot;
    private String noteText;
    private Instant createdAt;
    private Instant updatedAt;

    public CalorieLogResponse() {
    }

    public CalorieLogResponse(
            Long id,
            LocalDate logDate,
            String foodLabel,
            Integer calories,
            String mealSlot,
            String noteText,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.logDate = logDate;
        this.foodLabel = foodLabel;
        this.calories = calories;
        this.mealSlot = mealSlot;
        this.noteText = noteText;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public LocalDate getLogDate() { return logDate; }
    public String getFoodLabel() { return foodLabel; }
    public Integer getCalories() { return calories; }
    public String getMealSlot() { return mealSlot; }
    public String getNoteText() { return noteText; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
