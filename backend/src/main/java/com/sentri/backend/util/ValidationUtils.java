package com.sentri.backend.util;

import java.util.regex.Pattern;

/**
 * Utility class for common validation operations
 */
public class ValidationUtils {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[+]?[1-9]\\d{1,14}$"
    );
    
    /**
     * Validates email format
     * @param email the email to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validates phone number format
     * @param phone the phone number to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }
    
    /**
     * Checks if string is not null and not empty
     * @param str the string to check
     * @return true if not null and not empty
     */
    public static boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }
    
    /**
     * Validates password strength
     * @param password the password to validate
     * @return true if password meets criteria
     */
    public static boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        
        return hasUpper && hasLower && hasDigit;
    }
}