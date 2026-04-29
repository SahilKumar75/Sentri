package com.sentri.backend.embedding.provider;

import java.util.List;

/**
 * Interface for embedding providers that generate vector embeddings from text.
 * Implementations support different embedding models and providers (OpenAI, HuggingFace, local).
 */
public interface EmbeddingProvider {
    
    /**
     * Generate an embedding for a single text.
     *
     * @param text the text to embed
     * @return the embedding vector as a float array
     * @throws EmbeddingException if embedding generation fails
     */
    float[] embed(String text) throws EmbeddingException;
    
    /**
     * Generate embeddings for multiple texts in a batch.
     * Implementations should use the provider's batch API if available.
     *
     * @param texts the list of texts to embed
     * @return a list of embedding vectors in the same order as input texts
     * @throws EmbeddingException if batch embedding fails
     */
    List<float[]> embedBatch(List<String> texts) throws EmbeddingException;
    
    /**
     * Get the dimension of embeddings produced by this provider.
     *
     * @return the embedding dimension (e.g., 384, 1536)
     */
    int getDimension();
    
    /**
     * Get the name of this embedding provider.
     *
     * @return the provider name (e.g., "openai", "huggingface", "local")
     */
    String getProviderName();
    
    /**
     * Validate that the provider is properly configured.
     * Called during initialization to fail fast on configuration errors.
     *
     * @throws ConfigurationException if configuration is invalid
     */
    void validateConfiguration() throws ConfigurationException;
}
