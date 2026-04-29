# ML Vector Search Improvements - Design Document

## 1. Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MyspaceVectorController                             │   │
│  │  - search(query, filters, limit)                     │   │
│  │  - upsert(items)                                     │   │
│  │  - health()                                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  VectorSearchService                                 │   │
│  │  - search with relevance ranking                     │   │
│  │  - hybrid search (vector + keyword)                  │   │
│  │  - metadata filtering                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EmbeddingProviderManager                            │   │
│  │  - route to configured provider                      │   │
│  │  - batch embedding support                           │   │
│  │  - error handling & retry logic                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MetricsCollector                                    │   │
│  │  - track query latency, cache stats                  │   │
│  │  - expose Prometheus metrics                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Provider Layer                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ OpenAIProvider   │  │ HuggingFaceProvider                │
│  └──────────────────┘  └──────────────────┘                 │
│  ┌──────────────────┐                                       │
│  │ LocalModelProvider                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Cache Layer                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EmbeddingCache (LRU with TTL)                       │   │
│  │  - cache key: hash(text + model_name)                │   │
│  │  - thread-safe concurrent access                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Data Access Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MyspaceVectorStoreServiceImpl                        │   │
│  │  - vector upsert/search with pgvector               │   │
│  │  - HNSW index management                             │   │
│  │  - prepared statements & connection pooling          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database Layer                              │
│  PostgreSQL with pgvector extension                         │
│  - myspace_vector_items table                               │
│  - HNSW indexes on embeddings                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. Embedding Provider System

### Provider Interface

```java
public interface EmbeddingProvider {
    float[] embed(String text) throws EmbeddingException;
    List<float[]> embedBatch(List<String> texts) throws EmbeddingException;
    int getDimension();
    String getProviderName();
    void validateConfiguration() throws ConfigurationException;
}
```

### Provider Implementations

**OpenAIProvider**
- Uses OpenAI API (text-embedding-3-small, text-embedding-3-large)
- Batch API support (up to 2048 texts per request)
- Rate limiting: 3,000 requests per minute
- Retry logic with exponential backoff

**HuggingFaceProvider**
- Uses Hugging Face Inference API
- Supports various models (all-MiniLM-L6-v2, all-mpnet-base-v2)
- Batch processing support
- Rate limiting based on API tier

**LocalModelProvider**
- Uses ONNX Runtime or similar for local inference
- Models: sentence-transformers, all-MiniLM-L6-v2
- No API calls, in-memory processing
- Configurable batch size

### Provider Manager

```java
public class EmbeddingProviderManager {
    private final EmbeddingProvider provider;
    private final EmbeddingCache cache;
    private final MetricsCollector metrics;
    
    public float[] embed(String text) {
        // Check cache first
        // Call provider with retry logic
        // Update metrics
        // Cache result
    }
    
    public List<float[]> embedBatch(List<String> texts) {
        // Split into provider batch size
        // Process with caching
        // Handle partial failures
    }
}
```

## 3. Search Engine Improvements

### Relevance Ranking

**Primary Ranking**: Cosine similarity (0-1 normalized)

**Secondary Ranking (Reranking)**:
- Cross-encoder model for semantic similarity refinement
- Applied to top-k results (configurable, default 10)
- Improves ranking accuracy by 15-25%

### Hybrid Search

```java
public class HybridSearchEngine {
    public List<SearchResult> search(
        String query,
        SearchFilters filters,
        HybridSearchConfig config
    ) {
        // 1. Vector similarity search
        List<VectorMatch> vectorResults = vectorSearch(query);
        
        // 2. Keyword search on title/subject
        List<KeywordMatch> keywordResults = keywordSearch(query);
        
        // 3. Combine and weight results
        // weight = (vectorScore * config.vectorWeight) + 
        //          (keywordScore * config.keywordWeight)
        
        // 4. Apply metadata filters
        // 5. Apply reranking if enabled
        // 6. Return top-k results
    }
}
```

### Metadata Filtering

Supported filters:
- `subject`: Exact match or prefix match
- `source`: Exact match
- `date_label`: Date range filtering
- Custom JSON metadata queries

## 4. Performance Optimization

### Query Optimization

1. **Prepared Statements**: Reduce query compilation overhead
2. **Connection Pooling**: HikariCP with configurable pool size
3. **Column Selection**: Only fetch necessary columns
4. **Index Strategy**: HNSW with ef_construction=200, ef_search=100

### Caching Strategy

**Embedding Cache**:
- LRU eviction policy
- Configurable TTL (default 1 hour)
- Configurable max size (default 10,000 entries)
- Thread-safe using ConcurrentHashMap

**Query Result Cache** (optional):
- Cache frequent search queries
- Invalidate on upsert operations

### Performance Targets

- Vector search: < 200ms (p95) for typical queries
- Embedding generation: < 500ms (p95) for single text
- Batch embedding: < 2s for 32 texts
- Cache hit rate: > 50% for typical workloads

## 5. Configuration Management

### Configuration Properties

```yaml
sentri:
  vector:
    enabled: true
    provider: openai  # openai, huggingface, local
    
    # Provider-specific config
    openai:
      api-key: ${OPENAI_API_KEY}
      model: text-embedding-3-small
      dimension: 1536
    
    huggingface:
      api-key: ${HF_API_KEY}
      model: sentence-transformers/all-MiniLM-L6-v2
      dimension: 384
    
    local:
      model-path: /models/all-MiniLM-L6-v2
      dimension: 384
    
    # Common config
    distance-metric: cosine  # cosine, l2, inner_product
    max-search-limit: 20
    
    # Cache config
    cache:
      enabled: true
      max-size: 10000
      ttl-minutes: 60
    
    # Index config
    hnsw:
      ef-construction: 200
      ef-search: 100
    
    # Reranking config
    reranking:
      enabled: false
      model: cross-encoder/ms-marco-MiniLM-L-12-v2
      top-k: 10
    
    # Hybrid search config
    hybrid-search:
      enabled: false
      vector-weight: 0.7
      keyword-weight: 0.3
```

## 6. API Design

### Search Endpoint

**Request**:
```json
{
  "query": "machine learning algorithms",
  "limit": 10,
  "similarity_threshold": 0.5,
  "filters": {
    "subject": "AI",
    "source": "research",
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  },
  "hybrid_search": {
    "enabled": true,
    "vector_weight": 0.7,
    "keyword_weight": 0.3
  }
}
```

**Response**:
```json
{
  "results": [
    {
      "item_id": "item-123",
      "title": "Deep Learning Fundamentals",
      "subject": "AI",
      "source": "research",
      "date_label": "2024-06-15",
      "similarity": 0.92,
      "embedding_model": "text-embedding-3-small",
      "metadata": {...}
    }
  ],
  "total": 1,
  "query_time_ms": 145,
  "cache_hit": false
}
```

### Upsert Endpoint

**Request**:
```json
{
  "items": [
    {
      "item_id": "item-123",
      "title": "Deep Learning",
      "subject": "AI",
      "source": "research",
      "date_label": "2024-06-15",
      "text": "Machine learning is...",
      "metadata": {...}
    }
  ],
  "batch_size": 32
}
```

**Response**:
```json
{
  "upserted": 1,
  "failed": 0,
  "errors": [],
  "time_ms": 250
}
```

## 7. Database Schema

### Updated myspace_vector_items Table

```sql
CREATE TABLE myspace_vector_items (
    id BIGSERIAL PRIMARY KEY,
    item_id VARCHAR(128) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    source VARCHAR(255) NOT NULL,
    date_label VARCHAR(128) NOT NULL,
    embedding_model VARCHAR(255) NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- HNSW index for fast similarity search
CREATE INDEX idx_myspace_vector_items_embedding 
ON myspace_vector_items USING hnsw (embedding vector_cosine_ops)
WITH (ef_construction = 200, ef_search = 100);

-- Indexes for filtering
CREATE INDEX idx_myspace_vector_items_subject 
ON myspace_vector_items(subject);

CREATE INDEX idx_myspace_vector_items_source 
ON myspace_vector_items(source);

CREATE INDEX idx_myspace_vector_items_date_label 
ON myspace_vector_items(date_label);

CREATE INDEX idx_myspace_vector_items_embedding_model 
ON myspace_vector_items(embedding_model);
```

## 8. Error Handling

### Retry Strategy

```java
public class RetryPolicy {
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 100;
    
    public static <T> T executeWithRetry(
        Callable<T> operation,
        String operationName
    ) throws Exception {
        long backoff = INITIAL_BACKOFF_MS;
        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                return operation.call();
            } catch (RateLimitException e) {
                if (attempt < MAX_RETRIES - 1) {
                    Thread.sleep(backoff);
                    backoff *= 2;
                } else {
                    throw e;
                }
            }
        }
    }
}
```

### Error Types

- `EmbeddingException`: Embedding generation failed
- `VectorStoreException`: Database operation failed
- `ConfigurationException`: Invalid configuration
- `RateLimitException`: Provider rate limit exceeded
- `ValidationException`: Input validation failed

## 9. Monitoring & Metrics

### Metrics to Collect

1. **Query Metrics**:
   - Query latency (min, max, avg, p95, p99)
   - Query count by type (vector, keyword, hybrid)
   - Result count distribution

2. **Embedding Metrics**:
   - API call count by provider
   - Embedding latency by provider
   - Error rate by provider
   - Batch size distribution

3. **Cache Metrics**:
   - Cache hit rate
   - Cache miss rate
   - Eviction count
   - Cache size

4. **Index Metrics**:
   - Index size
   - Queries per second
   - Index efficiency

### Prometheus Metrics

```
# Query metrics
vector_search_latency_ms{quantile="0.95"}
vector_search_total
vector_search_errors_total

# Embedding metrics
embedding_api_calls_total{provider="openai"}
embedding_latency_ms{provider="openai"}
embedding_errors_total{provider="openai"}

# Cache metrics
embedding_cache_hits_total
embedding_cache_misses_total
embedding_cache_size_bytes
embedding_cache_evictions_total
```

## 10. Implementation Phases (12+ Commits)

### Phase 1: Foundation (Commits 1-3)
1. **Commit 1**: Create embedding provider interfaces and base classes
2. **Commit 2**: Implement OpenAI provider with batch support
3. **Commit 3**: Implement HuggingFace provider

### Phase 2: Caching & Local Models (Commits 4-5)
4. **Commit 4**: Implement embedding cache with LRU eviction
5. **Commit 5**: Implement local model provider

### Phase 3: Search Improvements (Commits 6-8)
6. **Commit 6**: Add relevance ranking and similarity scoring
7. **Commit 7**: Implement hybrid search (vector + keyword)
8. **Commit 8**: Add metadata filtering and query optimization

### Phase 4: Configuration & Management (Commits 9-10)
9. **Commit 9**: Create configuration management system
10. **Commit 10**: Implement provider manager with routing

### Phase 5: Monitoring & Resilience (Commits 11-12)
11. **Commit 11**: Add metrics collection and Prometheus exposure
12. **Commit 12**: Implement error handling, retry logic, and health checks

### Phase 6: API & Documentation (Commits 13+)
13. **Commit 13**: Update API endpoints with new request/response contracts
14. **Commit 14**: Add comprehensive documentation and examples
15. **Commit 15**: Add integration tests and performance benchmarks

## 11. Testing Strategy

### Unit Tests
- Provider implementations
- Cache eviction logic
- Configuration validation
- Error handling

### Integration Tests
- End-to-end search flow
- Batch operations
- Provider failover
- Database operations

### Performance Tests
- Query latency benchmarks
- Cache hit rate validation
- Batch embedding efficiency
- Index performance

## 12. Migration Path

1. Deploy new code with feature flags disabled
2. Enable embedding cache first (low risk)
3. Enable new providers (with fallback to existing)
4. Enable hybrid search (optional feature)
5. Enable reranking (optional feature)
6. Monitor metrics and adjust configuration

