package com.sentri.backend.embedding.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe LRU cache for embeddings with TTL support.
 * Uses ConcurrentHashMap for thread-safe access and LinkedHashMap for LRU ordering.
 */
public class EmbeddingCache {
    
    private static final Logger logger = LoggerFactory.getLogger(EmbeddingCache.class);
    
    private final int maxSize;
    private final long ttlMillis;
    private final ConcurrentHashMap<String, CacheEntry> cache;
    private final CacheStatistics statistics;
    private final LinkedHashMap<String, Long> accessOrder;
    
    public EmbeddingCache(int maxSize, long ttlMinutes) {
        this.maxSize = maxSize;
        this.ttlMillis = ttlMinutes * 60 * 1000;
        this.cache = new ConcurrentHashMap<>();
        this.statistics = new CacheStatistics();
        this.accessOrder = new LinkedHashMap<String, Long>(maxSize, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry eldest) {
                return size() > maxSize;
            }
        };
    }
    
    /**
     * Get an embedding from the cache.
     *
     * @param text the text to look up
     * @param modelName the embedding model name
     * @return the cached embedding, or null if not found or expired
     */
    public float[] get(String text, String modelName) {
        String key = generateKey(text, modelName);
        CacheEntry entry = cache.get(key);
        
        if (entry == null) {
            statistics.recordMiss();
            return null;
        }
        
        // Check if expired
        if (entry.isExpired(ttlMillis)) {
            cache.remove(key);
            accessOrder.remove(key);
            statistics.recordMiss();
            logger.debug("Cache entry expired for key: {}", key);
            return null;
        }
        
        // Update access order for LRU
        synchronized (accessOrder) {
            accessOrder.put(key, System.currentTimeMillis());
        }
        
        statistics.recordHit();
        logger.debug("Cache hit for key: {}", key);
        return entry.getEmbedding();
    }
    
    /**
     * Put an embedding into the cache.
     *
     * @param text the text that was embedded
     * @param modelName the embedding model name
     * @param embedding the embedding vector
     */
    public void put(String text, String modelName, float[] embedding) {
        String key = generateKey(text, modelName);
        
        // Check if we need to evict
        if (cache.size() >= maxSize && !cache.containsKey(key)) {
            evictLRU();
        }
        
        cache.put(key, new CacheEntry(embedding));
        
        synchronized (accessOrder) {
            accessOrder.put(key, System.currentTimeMillis());
        }
        
        logger.debug("Cached embedding for key: {}", key);
    }
    
    /**
     * Evict the least recently used entry.
     */
    private void evictLRU() {
        synchronized (accessOrder) {
            if (!accessOrder.isEmpty()) {
                String lruKey = accessOrder.keySet().iterator().next();
                cache.remove(lruKey);
                accessOrder.remove(lruKey);
                statistics.recordEviction();
                logger.debug("Evicted LRU entry: {}", lruKey);
            }
        }
    }
    
    /**
     * Clear the cache.
     */
    public void clear() {
        cache.clear();
        synchronized (accessOrder) {
            accessOrder.clear();
        }
        logger.info("Cache cleared");
    }
    
    /**
     * Get cache statistics.
     */
    public CacheStatistics getStatistics() {
        return statistics;
    }
    
    /**
     * Get the current size of the cache.
     */
    public int size() {
        return cache.size();
    }
    
    /**
     * Generate a cache key from text and model name.
     */
    private String generateKey(String text, String modelName) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String input = text + "|" + modelName;
            byte[] hash = md.digest(input.getBytes());
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            logger.error("Failed to generate cache key: {}", e.getMessage());
            // Fallback to simple hash
            return Integer.toHexString((text + "|" + modelName).hashCode());
        }
    }
}
