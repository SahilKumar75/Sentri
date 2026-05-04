package com.sentri.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Represents a single calorie log entry for a user on a specific date.
 * Part of the Sentri calorie tracking shell.
 */
@Entity
@Table(
        name = "calorie_logs",
        indexes = {
                @Index(name = "idx_calorie_logs_user_id", columnList = "user_id"),
                @Index(name = "idx_calorie_logs_user_date", columnList = "user_id, log_date")
        }
)
public class CalorieLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    /** Date this log entry applies to (UTC day). */
    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    /** Short label for the food item or meal (e.g. "Lunch – Dal Rice"). */
    @Column(nullable = false, length = 255)
    private String foodLabel;

    /** Estimated calorie count for this entry (kcal). */
    @Column(nullable = false)
    private Integer calories;

    /** Optional meal slot: BREAKFAST, LUNCH, SNACK, DINNER, OTHER. */
    @Column(length = 32)
    private String mealSlot;

    /** Optional free-text note (e.g. portion size, brand). */
    @Column(columnDefinition = "TEXT")
    private String noteText;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public CalorieLog() {
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // --- Getters and setters ---

    public Long getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public void setUser(UserAccount user) {
        this.user = user;
    }

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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
