package com.sentri.backend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Generic caching service for application-wide caching needs
 */
@Service
public class CacheService {
    
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final long defaultTtlMinutes = 30;
    
    private static class CacheEntry {
        private final Object value;
        private final LocalDateTime expiry;
        
        public CacheEntry(Object value, long ttlMinutes) {
            this.value = value;
            this.expiry = LocalDateTime.now().plusMinutes(ttlMinutes);
        }
        
        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiry);
        }
        
        public Object getValue() {
            return value;
        }
    }
    
    /**
     * Store value in cache with default TTL
     */
    public void put(String key, Object value) {
        put(key, value, defaultTtlMinutes);
    }
    
    /**
     * Store value in cache with custom TTL
     */
    public void put(String key, Object value, long ttlMinutes) {
        cache.put(key, new CacheEntry(value, ttlMinutes));
    }
    
    /**
     * Retrieve value from cache
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key, Class<T> type) {
        CacheEntry entry = cache.get(key);
        
        if (entry == null || entry.isExpired()) {
            cache.remove(key);
            return null;
        }
        
        return type.cast(entry.getValue());
    }
    
    /**
     * Check if key exists and is not expired
     */
    public boolean containsKey(String key) {
        CacheEntry entry = cache.get(key);
        
        if (entry == null || entry.isExpired()) {
            cache.remove(key);
            return false;
        }
        
        return true;
    }
    
    /**
     * Remove specific key from cache
     */
    public void evict(String key) {
        cache.remove(key);
    }
    
    /**
     * Clear all cache entries
     */
    public void clear() {
        cache.clear();
    }
    
    /**
     * Get cache statistics
     */
    public Map<String, Object> getStats() {
        long expiredCount = cache.values().stream()
            .mapToLong(entry -> entry.isExpired() ? 1 : 0)
            .sum();
            
        Map<String, Object> stats = new ConcurrentHashMap<>();
        stats.put("totalEntries", cache.size());
        stats.put("expiredEntries", expiredCount);
        stats.put("activeEntries", cache.size() - expiredCount);
        
        return stats;
    }
    
    /**
     * Clean up expired entries
     */
    public void cleanup() {
        cache.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}