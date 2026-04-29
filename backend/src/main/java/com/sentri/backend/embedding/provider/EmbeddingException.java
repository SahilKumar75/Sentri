package com.sentri.backend.embedding.provider;

/**
 * Exception thrown when embedding generation fails.
 */
public class EmbeddingException extends Exception {
    
    public EmbeddingException(String message) {
        super(message);
    }
    
    public EmbeddingException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public EmbeddingException(Throwable cause) {
        super(cause);
    }
}
