package com.sentri.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request body for creating a calorie log entry.
 */
public class CreateCalorieLogRequest {

    @NotNull(message = "logDate is required")
    private LocalDate logDate;

    @NotBlank(message = "foodLabel is required")
    @Size(max = 255, message = "foodLabel must be 255 characters or fewer")
    private String foodLabel;

    @NotNull(message = "calories is required")
    @Min(value = 0, message = "calories must be >= 0")
    @Max(value = 10000, message = "calories must be <= 10000")
    private Integer calories;

    /** Optional: BREAKFAST, LUNCH, SNACK, DINNER, OTHER */
    @Size(max = 32, message = "mealSlot must be 32 characters or fewer")
    private String mealSlot;

    @Size(max = 2000, message = "noteText must be 2000 characters or fewer")
    private String noteText;

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public String getFoodLabel() {
        return foodLabel;
    }

    public void setFoodLabel(String foodLabel) {
        this.foodLabel = foodLabel;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public String getMealSlot() {
        return mealSlot;
    }

    public void setMealSlot(String mealSlot) {
        this.mealSlot = mealSlot;
    }

    public String getNoteText() {
        return noteText;
    }

    public void setNoteText(String noteText) {
        this.noteText = noteText;
    }
}
