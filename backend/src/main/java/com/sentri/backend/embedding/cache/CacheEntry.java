package com.sentri.backend.embedding.cache;

/**
 * Represents a single entry in the embedding cache.
 */
public class CacheEntry {
    
    private final float[] embedding;
    private final long createdAt;
    private long lastAccessedAt;
    
    public CacheEntry(float[] embedding) {
        this.embedding = embedding;
        this.createdAt = System.currentTimeMillis();
        this.lastAccessedAt = createdAt;
    }
    
    public float[] getEmbedding() {
        this.lastAccessedAt = System.currentTimeMillis();
        return embedding;
    }
    
    public long getCreatedAt() {
        return createdAt;
    }
    
    public long getLastAccessedAt() {
        return lastAccessedAt;
    }
    
    public boolean isExpired(long ttlMillis) {
        return System.currentTimeMillis() - createdAt > ttlMillis;
    }
}
