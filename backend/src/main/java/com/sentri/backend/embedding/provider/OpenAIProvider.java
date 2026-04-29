package com.sentri.backend.embedding.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * OpenAI embedding provider using the OpenAI API.
 * Supports text-embedding-3-small (1536 dimensions) and text-embedding-3-large (3072 dimensions).
 */
public class OpenAIProvider extends BaseEmbeddingProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenAIProvider.class);
    
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/embeddings";
    private static final int BATCH_SIZE = 2048;
    private static final int RATE_LIMIT_REQUESTS_PER_MINUTE = 3000;
    
    private final String apiKey;
    private final String modelName;
    private final int dimension;
    private final HttpClient httpClient;
    
    public OpenAIProvider(EmbeddingProviderFactory.ProviderConfig config) throws ConfigurationException {
        this.apiKey = config.getApiKey();
        this.modelName = config.getModelName();
        this.dimension = config.getDimension();
        this.httpClient = HttpClient.newHttpClient();
        
        validateConfiguration();
    }
    
    @Override
    public float[] embed(String text) throws EmbeddingException {
        validateText(text);
        
        List<float[]> embeddings = embedBatch(List.of(text));
        if (embeddings.isEmpty()) {
            throw new EmbeddingException("No embedding returned from OpenAI API");
        }
        
        return embeddings.get(0);
    }
    
    @Override
    public List<float[]> embedBatch(List<String> texts) throws EmbeddingException {
        if (texts == null || texts.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<float[]> allEmbeddings = new ArrayList<>();
        
        // Split into batches if necessary
        for (int i = 0; i < texts.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, texts.size());
            List<String> batch = texts.subList(i, end);
            
            List<float[]> batchEmbeddings = executeWithRetry(
                    () -> callOpenAIAPI(batch),
                    "OpenAI batch embedding for " + batch.size() + " texts"
            );
            
            allEmbeddings.addAll(batchEmbeddings);
        }
        
        return allEmbeddings;
    }
    
    @Override
    public int getDimension() {
        return dimension;
    }
    
    @Override
    public String getProviderName() {
        return "openai";
    }
    
    @Override
    public void validateConfiguration() throws ConfigurationException {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new ConfigurationException("OpenAI API key is required");
        }
        
        if (modelName == null || modelName.trim().isEmpty()) {
            throw new ConfigurationException("OpenAI model name is required");
        }
        
        // Validate model name and dimension
        if ("text-embedding-3-small".equals(modelName)) {
            if (dimension != 1536) {
                throw new ConfigurationException(
                        "text-embedding-3-small requires dimension 1536, got " + dimension
                );
            }
        } else if ("text-embedding-3-large".equals(modelName)) {
            if (dimension != 3072) {
                throw new ConfigurationException(
                        "text-embedding-3-large requires dimension 3072, got " + dimension
                );
            }
        } else {
            logger.warn("Unknown OpenAI model: {}. Proceeding with dimension {}", modelName, dimension);
        }
    }
    
    /**
     * Call the OpenAI API to generate embeddings.
     */
    private List<float[]> callOpenAIAPI(List<String> texts) throws Exception {
        String requestBody = buildRequestBody(texts);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(OPENAI_API_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 429) {
            throw new RateLimitException("OpenAI API rate limit exceeded");
        }
        
        if (response.statusCode() != 200) {
            throw new TransientException(
                    "OpenAI API error: " + response.statusCode() + " - " + response.body()
            );
        }
        
        return parseResponse(response.body());
    }
    
    /**
     * Build the request body for the OpenAI API.
     */
    private String buildRequestBody(List<String> texts) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"model\":\"").append(modelName).append("\",\"input\":[");
        
        for (int i = 0; i < texts.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escapeJson(texts.get(i))).append("\"");
        }
        
        sb.append("]}");
        return sb.toString();
    }
    
    /**
     * Parse the OpenAI API response.
     */
    private List<float[]> parseResponse(String responseBody) throws EmbeddingException {
        // Simple JSON parsing for OpenAI response
        // In production, use a proper JSON library like Jackson or Gson
        List<float[]> embeddings = new ArrayList<>();
        
        try {
            // Extract embeddings from response
            // This is a simplified implementation
            String[] parts = responseBody.split("\"embedding\":");
            
            for (int i = 1; i < parts.length; i++) {
                String embeddingStr = parts[i].split("]")[0] + "]";
                float[] embedding = parseEmbeddingArray(embeddingStr);
                validateEmbedding(embedding);
                embeddings.add(embedding);
            }
            
            return embeddings;
        } catch (Exception e) {
            throw new EmbeddingException("Failed to parse OpenAI API response: " + e.getMessage(), e);
        }
    }
    
    /**
     * Parse a JSON array string into a float array.
     */
    private float[] parseEmbeddingArray(String arrayStr) throws EmbeddingException {
        try {
            String cleaned = arrayStr.replaceAll("[\\[\\]\\s]", "");
            String[] values = cleaned.split(",");
            float[] embedding = new float[values.length];
            
            for (int i = 0; i < values.length; i++) {
                embedding[i] = Float.parseFloat(values[i]);
            }
            
            return embedding;
        } catch (Exception e) {
            throw new EmbeddingException("Failed to parse embedding array: " + e.getMessage(), e);
        }
    }
    
    /**
     * Escape special characters in JSON strings.
     */
    private String escapeJson(String text) {
        return text
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
