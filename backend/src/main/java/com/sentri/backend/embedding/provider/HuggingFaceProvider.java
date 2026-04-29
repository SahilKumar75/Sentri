package com.sentri.backend.embedding.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HuggingFace embedding provider using the HuggingFace Inference API.
 * Supports various sentence-transformer models (all-MiniLM-L6-v2, all-mpnet-base-v2, etc.).
 */
public class HuggingFaceProvider extends BaseEmbeddingProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(HuggingFaceProvider.class);
    
    private static final String HUGGINGFACE_API_URL_TEMPLATE = "https://api-inference.huggingface.co/models/%s";
    private static final int BATCH_SIZE = 512;
    
    private final String apiKey;
    private final String modelName;
    private final int dimension;
    private final String apiUrl;
    private final HttpClient httpClient;
    
    // Model dimension mappings
    private static final Map<String, Integer> MODEL_DIMENSIONS = new HashMap<>();
    
    static {
        MODEL_DIMENSIONS.put("sentence-transformers/all-MiniLM-L6-v2", 384);
        MODEL_DIMENSIONS.put("sentence-transformers/all-mpnet-base-v2", 768);
        MODEL_DIMENSIONS.put("sentence-transformers/all-distilroberta-v1", 768);
        MODEL_DIMENSIONS.put("sentence-transformers/paraphrase-MiniLM-L6-v2", 384);
        MODEL_DIMENSIONS.put("sentence-transformers/paraphrase-mpnet-base-v2", 768);
    }
    
    public HuggingFaceProvider(EmbeddingProviderFactory.ProviderConfig config) throws ConfigurationException {
        this.apiKey = config.getApiKey();
        this.modelName = config.getModelName();
        this.dimension = config.getDimension();
        this.apiUrl = String.format(HUGGINGFACE_API_URL_TEMPLATE, modelName);
        this.httpClient = HttpClient.newHttpClient();
        
        validateConfiguration();
    }
    
    @Override
    public float[] embed(String text) throws EmbeddingException {
        validateText(text);
        
        List<float[]> embeddings = embedBatch(List.of(text));
        if (embeddings.isEmpty()) {
            throw new EmbeddingException("No embedding returned from HuggingFace API");
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
                    () -> callHuggingFaceAPI(batch),
                    "HuggingFace batch embedding for " + batch.size() + " texts"
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
        return "huggingface";
    }
    
    @Override
    public void validateConfiguration() throws ConfigurationException {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new ConfigurationException("HuggingFace API key is required");
        }
        
        if (modelName == null || modelName.trim().isEmpty()) {
            throw new ConfigurationException("HuggingFace model name is required");
        }
        
        // Validate dimension if model is known
        Integer expectedDimension = MODEL_DIMENSIONS.get(modelName);
        if (expectedDimension != null && dimension != expectedDimension) {
            throw new ConfigurationException(
                    "Model " + modelName + " requires dimension " + expectedDimension + 
                    ", got " + dimension
            );
        }
        
        if (dimension <= 0) {
            throw new ConfigurationException("Embedding dimension must be positive, got " + dimension);
        }
    }
    
    /**
     * Call the HuggingFace API to generate embeddings.
     */
    private List<float[]> callHuggingFaceAPI(List<String> texts) throws Exception {
        String requestBody = buildRequestBody(texts);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 429) {
            throw new RateLimitException("HuggingFace API rate limit exceeded");
        }
        
        if (response.statusCode() == 503) {
            throw new TransientException("HuggingFace API service unavailable (503)");
        }
        
        if (response.statusCode() != 200) {
            throw new TransientException(
                    "HuggingFace API error: " + response.statusCode() + " - " + response.body()
            );
        }
        
        return parseResponse(response.body());
    }
    
    /**
     * Build the request body for the HuggingFace API.
     */
    private String buildRequestBody(List<String> texts) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"inputs\":[");
        
        for (int i = 0; i < texts.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escapeJson(texts.get(i))).append("\"");
        }
        
        sb.append("]}");
        return sb.toString();
    }
    
    /**
     * Parse the HuggingFace API response.
     */
    private List<float[]> parseResponse(String responseBody) throws EmbeddingException {
        List<float[]> embeddings = new ArrayList<>();
        
        try {
            // Simple JSON parsing for HuggingFace response
            // In production, use a proper JSON library like Jackson or Gson
            String[] embeddingBlocks = responseBody.split("\\[\\[");
            
            for (int i = 1; i < embeddingBlocks.length; i++) {
                String embeddingStr = "[" + embeddingBlocks[i].split("\\]\\]")[0] + "]";
                float[] embedding = parseEmbeddingArray(embeddingStr);
                validateEmbedding(embedding);
                embeddings.add(embedding);
            }
            
            return embeddings;
        } catch (Exception e) {
            throw new EmbeddingException("Failed to parse HuggingFace API response: " + e.getMessage(), e);
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
