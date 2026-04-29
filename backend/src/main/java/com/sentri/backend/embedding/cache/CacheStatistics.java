package com.sentri.backend.embedding.cache;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Statistics for the embedding cache.
 */
public class CacheStatistics {
    
    private final AtomicLong hitCount = new AtomicLong(0);
    private final AtomicLong missCount = new AtomicLong(0);
    private final AtomicLong evictionCount = new AtomicLong(0);
    
    public void recordHit() {
        hitCount.incrementAndGet();
    }
    
    public void recordMiss() {
        missCount.incrementAndGet();
    }
    
    public void recordEviction() {
        evictionCount.incrementAndGet();
    }
    
    public long getHitCount() {
        return hitCount.get();
    }
    
    public long getMissCount() {
        return missCount.get();
    }
    
    public long getEvictionCount() {
        return evictionCount.get();
    }
    
    public double getHitRate() {
        long total = hitCount.get() + missCount.get();
        if (total == 0) {
            return 0.0;
        }
        return (double) hitCount.get() / total;
    }
    
    public void reset() {
        hitCount.set(0);
        missCount.set(0);
        evictionCount.set(0);
    }
    
    @Override
    public String toString() {
        return "CacheStatistics{" +
                "hitCount=" + hitCount.get() +
                ", missCount=" + missCount.get() +
                ", evictionCount=" + evictionCount.get() +
                ", hitRate=" + String.format("%.2f%%", getHitRate() * 100) +
                '}';
    }
}
