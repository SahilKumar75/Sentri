package com.sentri.backend.util;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Utility class for collection operations
 */
public class CollectionUtils {
    
    /**
     * Check if collection is null or empty
     */
    public static <T> boolean isEmpty(Collection<T> collection) {
        return collection == null || collection.isEmpty();
    }
    
    /**
     * Check if collection is not null and not empty
     */
    public static <T> boolean isNotEmpty(Collection<T> collection) {
        return !isEmpty(collection);
    }
    
    /**
     * Get first element or null
     */
    public static <T> T first(List<T> list) {
        return isEmpty(list) ? null : list.get(0);
    }
    
    /**
     * Get last element or null
     */
    public static <T> T last(List<T> list) {
        return isEmpty(list) ? null : list.get(list.size() - 1);
    }
    
    /**
     * Partition list into chunks
     */
    public static <T> List<List<T>> partition(List<T> list, int size) {
        if (isEmpty(list) || size <= 0) {
            return Collections.emptyList();
        }
        
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            partitions.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return partitions;
    }
    
    /**
     * Remove duplicates from list
     */
    public static <T> List<T> removeDuplicates(List<T> list) {
        if (isEmpty(list)) return list;
        return new ArrayList<>(new LinkedHashSet<>(list));
    }
    
    /**
     * Intersection of two collections
     */
    public static <T> Set<T> intersection(Collection<T> c1, Collection<T> c2) {
        if (isEmpty(c1) || isEmpty(c2)) {
            return Collections.emptySet();
        }
        
        Set<T> result = new HashSet<>(c1);
        result.retainAll(c2);
        return result;
    }
    
    /**
     * Union of two collections
     */
    public static <T> Set<T> union(Collection<T> c1, Collection<T> c2) {
        Set<T> result = new HashSet<>();
        if (isNotEmpty(c1)) result.addAll(c1);
        if (isNotEmpty(c2)) result.addAll(c2);
        return result;
    }
    
    /**
     * Difference of two collections (c1 - c2)
     */
    public static <T> Set<T> difference(Collection<T> c1, Collection<T> c2) {
        if (isEmpty(c1)) return Collections.emptySet();
        
        Set<T> result = new HashSet<>(c1);
        if (isNotEmpty(c2)) {
            result.removeAll(c2);
        }
        return result;
    }
    
    /**
     * Safe get from list with default value
     */
    public static <T> T getOrDefault(List<T> list, int index, T defaultValue) {
        if (isEmpty(list) || index < 0 || index >= list.size()) {
            return defaultValue;
        }
        return list.get(index);
    }
}