package com.sentri.backend.embedding.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Factory for creating embedding provider instances based on configuration.
 */
public class EmbeddingProviderFactory {
    
    private static final Logger logger = LoggerFactory.getLogger(EmbeddingProviderFactory.class);
    
    /**
     * Create an embedding provider based on the provider type.
     *
     * @param providerType the type of provider (openai, huggingface, local)
     * @param config the provider configuration
     * @return the created embedding provider
     * @throws ConfigurationException if provider type is unknown or configuration is invalid
     */
    public static EmbeddingProvider createProvider(String providerType, ProviderConfig config) 
            throws ConfigurationException {
        
        if (providerType == null || providerType.trim().isEmpty()) {
            throw new ConfigurationException("Provider type cannot be null or empty");
        }
        
        String normalizedType = providerType.toLowerCase().trim();
        
        logger.info("Creating embedding provider: {}", normalizedType);
        
        EmbeddingProvider provider = switch (normalizedType) {
            case "openai" -> new OpenAIProvider(config);
            case "huggingface" -> new HuggingFaceProvider(config);
            case "local" -> new LocalModelProvider(config);
            default -> throw new ConfigurationException("Unknown provider type: " + providerType);
        };
        
        provider.validateConfiguration();
        logger.info("Successfully created {} provider with dimension {}", normalizedType, provider.getDimension());
        
        return provider;
    }
    
    /**
     * Configuration object for embedding providers.
     */
    public static class ProviderConfig {
        private final String apiKey;
        private final String modelName;
        private final int dimension;
        private final String modelPath;
        
        public ProviderConfig(String apiKey, String modelName, int dimension, String modelPath) {
            this.apiKey = apiKey;
            this.modelName = modelName;
            this.dimension = dimension;
            this.modelPath = modelPath;
        }
        
        public String getApiKey() {
            return apiKey;
        }
        
        public String getModelName() {
            return modelName;
        }
        
        public int getDimension() {
            return dimension;
        }
        
        public String getModelPath() {
            return modelPath;
        }
    }
}
