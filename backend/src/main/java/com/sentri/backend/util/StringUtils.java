package com.sentri.backend.util;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for string operations
 */
public class StringUtils {
    
    /**
     * Check if string is null or empty
     */
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
    
    /**
     * Check if string is not null and not empty
     */
    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }
    
    /**
     * Capitalize first letter of string
     */
    public static String capitalize(String str) {
        if (isEmpty(str)) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
    
    /**
     * Convert string to title case
     */
    public static String toTitleCase(String str) {
        if (isEmpty(str)) return str;
        
        return Arrays.stream(str.split("\\s+"))
            .map(StringUtils::capitalize)
            .collect(Collectors.joining(" "));
    }
    
    /**
     * Truncate string to max length with ellipsis
     */
    public static String truncate(String str, int maxLength) {
        if (isEmpty(str) || str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength - 3) + "...";
    }
    
    /**
     * Remove all whitespace from string
     */
    public static String removeWhitespace(String str) {
        if (isEmpty(str)) return str;
        return str.replaceAll("\\s+", "");
    }
    
    /**
     * Join list of strings with delimiter
     */
    public static String join(List<String> strings, String delimiter) {
        if (strings == null || strings.isEmpty()) {
            return "";
        }
        return String.join(delimiter, strings);
    }
    
    /**
     * Check if string contains only digits
     */
    public static boolean isNumeric(String str) {
        if (isEmpty(str)) return false;
        return str.matches("\\d+");
    }
    
    /**
     * Check if string contains only letters
     */
    public static boolean isAlpha(String str) {
        if (isEmpty(str)) return false;
        return str.matches("[a-zA-Z]+");
    }
    
    /**
     * Check if string contains only letters and digits
     */
    public static boolean isAlphanumeric(String str) {
        if (isEmpty(str)) return false;
        return str.matches("[a-zA-Z0-9]+");
    }
    
    /**
     * Reverse a string
     */
    public static String reverse(String str) {
        if (isEmpty(str)) return str;
        return new StringBuilder(str).reverse().toString();
    }
    
    /**
     * Count occurrences of substring
     */
    public static int countOccurrences(String str, String substring) {
        if (isEmpty(str) || isEmpty(substring)) return 0;
        
        int count = 0;
        int index = 0;
        
        while ((index = str.indexOf(substring, index)) != -1) {
            count++;
            index += substring.length();
        }
        
        return count;
    }
}