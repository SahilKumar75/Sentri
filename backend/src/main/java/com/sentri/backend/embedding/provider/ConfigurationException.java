package com.sentri.backend.embedding.provider;

/**
 * Exception thrown when embedding provider configuration is invalid.
 */
public class ConfigurationException extends Exception {
    
    public ConfigurationException(String message) {
        super(message);
    }
    
    public ConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public ConfigurationException(Throwable cause) {
        super(cause);
    }
}
