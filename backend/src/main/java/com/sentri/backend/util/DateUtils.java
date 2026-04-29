package com.sentri.backend.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Utility class for date and time operations
 */
public class DateUtils {
    
    private static final DateTimeFormatter ISO_DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter ISO_DATETIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    /**
     * Get current date in IST timezone
     */
    public static LocalDate getCurrentDateIST() {
        return LocalDate.now(ZoneId.of("Asia/Kolkata"));
    }
    
    /**
     * Get current datetime in IST timezone
     */
    public static LocalDateTime getCurrentDateTimeIST() {
        return LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
    }
    
    /**
     * Check if date is today
     */
    public static boolean isToday(LocalDate date) {
        return date.equals(getCurrentDateIST());
    }
    
    /**
     * Get days between two dates
     */
    public static long daysBetween(LocalDate start, LocalDate end) {
        return ChronoUnit.DAYS.between(start, end);
    }
    
    /**
     * Format date to ISO string
     */
    public static String formatDate(LocalDate date) {
        return date.format(ISO_DATE_FORMATTER);
    }
    
    /**
     * Format datetime to ISO string
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(ISO_DATETIME_FORMATTER);
    }
    
    /**
     * Parse ISO date string
     */
    public static LocalDate parseDate(String dateString) {
        return LocalDate.parse(dateString, ISO_DATE_FORMATTER);
    }
    
    /**
     * Check if date is in the past
     */
    public static boolean isPast(LocalDate date) {
        return date.isBefore(getCurrentDateIST());
    }
    
    /**
     * Check if date is in the future
     */
    public static boolean isFuture(LocalDate date) {
        return date.isAfter(getCurrentDateIST());
    }
}