package com.sentri.backend.embedding.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Abstract base class for embedding providers with common retry logic and error handling.
 */
public abstract class BaseEmbeddingProvider implements EmbeddingProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(BaseEmbeddingProvider.class);
    
    protected static final int MAX_RETRIES = 3;
    protected static final long INITIAL_BACKOFF_MS = 100;
    protected static final long MAX_BACKOFF_MS = 10000;
    
    /**
     * Execute an operation with exponential backoff retry logic.
     *
     * @param operation the operation to execute
     * @param operationName the name of the operation for logging
     * @param <T> the return type
     * @return the result of the operation
     * @throws EmbeddingException if all retries fail
     */
    protected <T> T executeWithRetry(
            RetryableOperation<T> operation,
            String operationName
    ) throws EmbeddingException {
        long backoff = INITIAL_BACKOFF_MS;
        Exception lastException = null;
        
        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                logger.debug("Executing {} (attempt {}/{})", operationName, attempt + 1, MAX_RETRIES);
                return operation.execute();
            } catch (RateLimitException e) {
                lastException = e;
                if (attempt < MAX_RETRIES - 1) {
                    long waitTime = Math.min(backoff, MAX_BACKOFF_MS);
                    logger.warn("Rate limited on {}. Retrying after {}ms", operationName, waitTime);
                    try {
                        Thread.sleep(waitTime);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new EmbeddingException("Interrupted while retrying " + operationName, ie);
                    }
                    backoff *= 2;
                }
            } catch (TransientException e) {
                lastException = e;
                if (attempt < MAX_RETRIES - 1) {
                    long waitTime = Math.min(backoff, MAX_BACKOFF_MS);
                    logger.warn("Transient error on {}. Retrying after {}ms: {}", operationName, waitTime, e.getMessage());
                    try {
                        Thread.sleep(waitTime);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new EmbeddingException("Interrupted while retrying " + operationName, ie);
                    }
                    backoff *= 2;
                }
            } catch (Exception e) {
                logger.error("Failed to execute {}: {}", operationName, e.getMessage(), e);
                throw new EmbeddingException("Failed to execute " + operationName + ": " + e.getMessage(), e);
            }
        }
        
        throw new EmbeddingException("Failed to execute " + operationName + " after " + MAX_RETRIES + " retries", lastException);
    }
    
    /**
     * Validate that a text is not null or empty.
     *
     * @param text the text to validate
     * @throws EmbeddingException if text is null or empty
     */
    protected void validateText(String text) throws EmbeddingException {
        if (text == null || text.trim().isEmpty()) {
            throw new EmbeddingException("Text cannot be null or empty");
        }
    }
    
    /**
     * Validate that an embedding has the correct dimension.
     *
     * @param embedding the embedding to validate
     * @throws EmbeddingException if embedding dimension is incorrect
     */
    protected void validateEmbedding(float[] embedding) throws EmbeddingException {
        if (embedding == null || embedding.length != getDimension()) {
            throw new EmbeddingException(
                    "Embedding dimension mismatch. Expected " + getDimension() + 
                    ", got " + (embedding == null ? "null" : embedding.length)
            );
        }
    }
    
    /**
     * Functional interface for retryable operations.
     */
    @FunctionalInterface
    protected interface RetryableOperation<T> {
        T execute() throws Exception;
    }
    
    /**
     * Exception indicating a rate limit was encountered.
     */
    public static class RateLimitException extends Exception {
        public RateLimitException(String message) {
            super(message);
        }
        
        public RateLimitException(String message, Throwable cause) {
            super(message, cause);
        }
    }
    
    /**
     * Exception indicating a transient error that can be retried.
     */
    public static class TransientException extends Exception {
        public TransientException(String message) {
            super(message);
        }
        
        public TransientException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
