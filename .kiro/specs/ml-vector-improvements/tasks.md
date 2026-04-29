# Implementation Plan: ML Vector Search Improvements

## Overview

This implementation plan breaks down the ML Vector Search Improvements feature into 6 phases with 15+ tasks. The feature enhances the vector search system by supporting multiple embedding providers, improving search accuracy, optimizing performance, and adding comprehensive monitoring. Implementation follows a bottom-up approach: foundation → caching → search improvements → configuration → monitoring → API updates.

## Phase 1: Foundation (Commits 1-3)

### Objective
Establish the embedding provider abstraction layer and implement core providers (OpenAI, HuggingFace).

---

- [ ] 1. Create embedding provider interfaces and base classes
  - Create `EmbeddingProvider` interface with methods: `embed()`, `embedBatch()`, `getDimension()`, `getProviderName()`, `validateConfiguration()`
  - Create `EmbeddingException` and `ConfigurationException` custom exceptions
  - Create abstract base class `BaseEmbeddingProvider` with common retry logic and error handling
  - Create `EmbeddingProviderFactory` for provider instantiation
  - Files to create: `backend/src/main/java/com/sentri/backend/embedding/provider/EmbeddingProvider.java`, `BaseEmbeddingProvider.java`, `EmbeddingProviderFactory.java`, exception classes
  - _Requirements: 1.1, 1.5, 1.10_

- [ ] 2. Implement OpenAI embedding provider with batch support
  - Implement `OpenAIProvider` class using OpenAI API (text-embedding-3-small, text-embedding-3-large)
  - Add batch API support (up to 2048 texts per request)
  - Implement rate limiting (3,000 requests per minute)
  - Add exponential backoff retry logic for transient failures
  - Implement dimension validation (1536 for text-embedding-3-small, 3072 for text-embedding-3-large)
  - Add configuration validation for API key and model name
  - Files to create: `backend/src/main/java/com/sentri/backend/embedding/provider/OpenAIProvider.java`
  - Files to modify: `pom.xml` (add OpenAI client library dependency)
  - _Requirements: 1.1, 1.2, 1.8, 1.10_

- [ ] 3. Implement HuggingFace embedding provider
  - Implement `HuggingFaceProvider` class using Hugging Face Inference API
  - Support multiple models (all-MiniLM-L6-v2, all-mpnet-base-v2, etc.)
  - Add batch processing support
  - Implement rate limiting based on API tier
  - Add configuration validation for API key and model name
  - Implement dimension detection from model metadata
  - Files to create: `backend/src/main/java/com/sentri/backend/embedding/provider/HuggingFaceProvider.java`
  - Files to modify: `pom.xml` (add HuggingFace client library dependency)
  - _Requirements: 1.1, 1.8, 1.10_

---

## Phase 2: Caching & Local Models (Commits 4-5)

### Objective
Implement embedding cache with LRU eviction and local model provider for offline embedding generation.

---

- [ ] 4. Implement embedding cache with LRU eviction
  - Create `EmbeddingCache` class using `ConcurrentHashMap` for thread-safe access
  - Implement LRU eviction policy using `LinkedHashMap` or similar
  - Add configurable TTL (default 1 hour) with expiration checking
  - Add configurable max size (default 10,000 entries)
  - Implement cache key generation: `hash(text + model_name)`
  - Add cache statistics tracking: hit count, miss count, eviction count, current size
  - Implement cache invalidation on upsert operations
  - Files to create: `backend/src/main/java/com/sentri/backend/embedding/cache/EmbeddingCache.java`, `CacheEntry.java`, `CacheStatistics.java`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8_

- [ ] 5. Implement local model embedding provider
  - Implement `LocalModelProvider` class using ONNX Runtime or similar
  - Support sentence-transformers models (all-MiniLM-L6-v2, etc.)
  - Add model loading and caching in memory
  - Implement batch processing with configurable batch size
  - Add model path configuration and validation
  - Implement dimension detection from model metadata
  - Files to create: `backend/src/main/java/com/sentri/backend/embedding/provider/LocalModelProvider.java`
  - Files to modify: `pom.xml` (add ONNX Runtime or similar dependency)
  - _Requirements: 1.1, 1.4, 1.10_

---

## Phase 3: Search Improvements (Commits 6-8)

### Objective
Enhance search accuracy through relevance ranking, hybrid search, and metadata filtering.

---

- [ ] 6. Add relevance ranking and similarity scoring
  - Create `SimilarityScorer` class for cosine similarity calculation
  - Implement similarity score normalization to 0-1 range
  - Create `RelevanceRanker` class for primary ranking by cosine similarity
  - Add support for configurable similarity threshold filtering
  - Implement cross-encoder model support for reranking (optional, configurable)
  - Add reranking logic to refine top-k results (default k=10)
  - Create `SearchResult` DTO with similarity score and ranking metadata
  - Files to create: `backend/src/main/java/com/sentri/backend/search/SimilarityScorer.java`, `RelevanceRanker.java`, `SearchResult.java`
  - Files to modify: `backend/src/main/java/com/sentri/backend/dto/response/MyspaceVectorSearchResponse.java` (add similarity field)
  - _Requirements: 2.1, 2.2, 2.6_

- [ ] 7. Implement hybrid search (vector + keyword)
  - Create `HybridSearchEngine` class combining vector and keyword search
  - Implement vector similarity search using existing pgvector queries
  - Implement keyword search on title and subject fields
  - Add configurable weighting: `score = (vectorScore * vectorWeight) + (keywordScore * keywordWeight)`
  - Implement result deduplication and merging
  - Add support for hybrid search configuration (enabled, weights)
  - Create `HybridSearchConfig` configuration class
  - Files to create: `backend/src/main/java/com/sentri/backend/search/HybridSearchEngine.java`, `HybridSearchConfig.java`
  - Files to modify: `backend/src/main/java/com/sentri/backend/dto/request/MyspaceVectorSearchRequest.java` (add hybrid search fields)
  - _Requirements: 2.8, 2.9_

- [ ] 8. Add metadata filtering and query optimization
  - Create `MetadataFilter` class supporting subject, source, date_label, and custom JSON metadata queries
  - Implement filter validation and SQL generation
  - Add support for date range filtering
  - Optimize queries to use prepared statements and column selection
  - Implement connection pooling configuration (HikariCP)
  - Add HNSW index parameter configuration (ef_construction=200, ef_search=100)
  - Create `QueryOptimizer` class for query planning and optimization
  - Files to create: `backend/src/main/java/com/sentri/backend/search/MetadataFilter.java`, `QueryOptimizer.java`
  - Files to modify: `backend/src/main/java/com/sentri/backend/dto/request/MyspaceVectorSearchRequest.java` (add filter fields)
  - _Requirements: 2.3, 3.1, 3.5, 3.6, 3.7, 3.8_

---

## Phase 4: Configuration & Management (Commits 9-10)

### Objective
Create configuration management system and implement provider manager with routing.

---

- [ ] 9. Create configuration management system
  - Create `VectorStoreProperties` configuration class with all vector store settings
  - Add provider configuration: type (openai, huggingface, local), credentials, model name, dimension
  - Add cache configuration: enabled, max-size, ttl-minutes
  - Add index configuration: ef-construction, ef-search
  - Add reranking configuration: enabled, model, top-k
  - Add hybrid search configuration: enabled, vector-weight, keyword-weight
  - Add distance metric configuration: cosine, l2, inner_product
  - Implement configuration validation with descriptive error messages
  - Add configuration loading from `application.yml` with environment variable support
  - Files to create: `backend/src/main/java/com/sentri/backend/config/VectorStoreProperties.java`, nested configuration classes
  - Files to modify: `backend/src/main/resources/application.yml` (add vector store configuration section)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

- [ ] 10. Implement provider manager with routing
  - Create `EmbeddingProviderManager` class that routes to configured provider
  - Implement `embed()` method with cache checking, provider call, and result caching
  - Implement `embedBatch()` method with batch splitting, caching, and partial failure handling
  - Add provider validation on startup
  - Implement dimension validation against configured dimension
  - Add error handling with descriptive messages
  - Implement metrics collection integration (to be used in Phase 5)
  - Files to create: `backend/src/main/java/com/sentri/backend/embedding/EmbeddingProviderManager.java`
  - Files to modify: `backend/src/main/java/com/sentri/backend/config/VectorStoreProperties.java` (reference in manager)
  - _Requirements: 1.2, 1.3, 1.6, 1.7, 1.8, 1.10_

---

## Phase 5: Monitoring & Resilience (Commits 11-12)

### Objective
Add metrics collection, Prometheus exposure, error handling, retry logic, and health checks.

---

- [ ] 11. Add metrics collection and Prometheus exposure
  - Create `MetricsCollector` class for tracking all metrics
  - Implement query metrics: latency (min, max, avg, p95, p99), count by type, result count distribution
  - Implement embedding metrics: API call count by provider, latency by provider, error rate by provider, batch size distribution
  - Implement cache metrics: hit rate, miss rate, eviction count, cache size
  - Implement index metrics: queries per second, index efficiency
  - Create Prometheus metrics using Micrometer: `vector_search_latency_ms`, `vector_search_total`, `embedding_api_calls_total`, `embedding_cache_hits_total`, etc.
  - Add metrics endpoint for Prometheus scraping
  - Integrate metrics collection into `EmbeddingProviderManager` and search operations
  - Files to create: `backend/src/main/java/com/sentri/backend/metrics/MetricsCollector.java`, `PrometheusMetricsExporter.java`
  - Files to modify: `pom.xml` (add Micrometer Prometheus dependency)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 12. Implement error handling, retry logic, and health checks
  - Create `RetryPolicy` class with exponential backoff (max 3 retries, initial backoff 100ms)
  - Implement `RateLimitException` and `TimeoutException` custom exceptions
  - Add retry logic to `EmbeddingProviderManager` for transient failures
  - Implement connection retry logic for database failures
  - Add partial failure handling for batch operations
  - Create `VectorStoreHealthChecker` class for health checks
  - Implement health check validations: database connection, pgvector extension, table existence, index existence, provider accessibility, query latency
  - Create `/health/vector-store` endpoint returning detailed health status
  - Add error logging with sufficient context for debugging
  - Files to create: `backend/src/main/java/com/sentri/backend/error/RetryPolicy.java`, `VectorStoreHealthChecker.java`, exception classes
  - Files to modify: `backend/src/main/java/com/sentri/backend/controller/HealthController.java` (add vector store health endpoint)
  - _Requirements: 4.7, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

---

## Phase 6: API & Documentation (Commits 13+)

### Objective
Update API endpoints with new request/response contracts, add documentation, and integration tests.

---

- [ ] 13. Update API endpoints with new request/response contracts
  - Update `MyspaceVectorSearchRequest` DTO: add filters, similarity_threshold, hybrid_search config
  - Update `MyspaceVectorSearchResponse` DTO: add similarity scores, embedding_model, query_time_ms, cache_hit flag
  - Update `MyspaceVectorUpsertRequest` DTO: add batch_size, support text-to-embedding conversion
  - Update `MyspaceVectorUpsertResponse` DTO: add upserted count, failed count, error details, time_ms
  - Update `MyspaceVectorItemRequest` DTO: add metadata_json field
  - Implement request validation with descriptive error messages
  - Update `MyspaceVectorController` to use new service layer with `VectorSearchService`
  - Add endpoint for health checks: `GET /api/vector-store/health`
  - Files to modify: `backend/src/main/java/com/sentri/backend/dto/request/MyspaceVectorSearchRequest.java`, response DTOs, `MyspaceVectorController.java`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [ ] 14. Create VectorSearchService orchestrating all components
  - Create `VectorSearchService` class orchestrating embedding generation, caching, search, and ranking
  - Implement `search()` method: generate query embedding, apply filters, perform hybrid search, apply reranking, return results
  - Implement `upsert()` method: validate inputs, generate embeddings (batch), store in database, update cache
  - Implement `health()` method: delegate to `VectorStoreHealthChecker`
  - Add transaction management for batch operations
  - Integrate metrics collection
  - Integrate error handling and retry logic
  - Files to create: `backend/src/main/java/com/sentri/backend/service/VectorSearchService.java`
  - _Requirements: 1.2, 2.1, 3.1, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [ ] 15. Add comprehensive documentation and examples
  - Create `VECTOR_SEARCH_SETUP.md`: setup instructions for each provider (OpenAI, HuggingFace, local)
  - Create `VECTOR_SEARCH_API.md`: API documentation for all endpoints with request/response examples
  - Create `VECTOR_SEARCH_CONFIG.md`: configuration examples for different use cases
  - Create `VECTOR_SEARCH_TUNING.md`: performance tuning guidelines
  - Create `VECTOR_SEARCH_TROUBLESHOOTING.md`: troubleshooting guides for common issues
  - Create `VECTOR_SEARCH_EXAMPLES.md`: code examples for common operations (search, upsert, batch)
  - Create `VECTOR_SEARCH_MIGRATION.md`: migration guide from current implementation
  - Add inline code documentation (JavaDoc) for all public classes and methods
  - Files to create: `backend/docs/VECTOR_SEARCH_*.md`
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

- [ ] 16. Add integration tests and performance benchmarks
  - Create integration tests for end-to-end search flow with real database
  - Create integration tests for batch operations
  - Create integration tests for provider failover and error handling
  - Create integration tests for database operations (upsert, search, filtering)
  - Create performance benchmarks for query latency (target: < 200ms p95)
  - Create performance benchmarks for embedding generation (target: < 500ms p95 for single, < 2s for batch of 32)
  - Create performance benchmarks for cache hit rate (target: > 50%)
  - Create tests for metadata filtering and hybrid search
  - Files to create: `backend/src/test/java/com/sentri/backend/integration/VectorSearchIntegrationTest.java`, benchmark classes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

---

## Checkpoint Tasks

- [ ] 17. Checkpoint - Phase 1-2 Complete
  - Ensure all embedding providers are implemented and tested
  - Ensure cache is working with proper LRU eviction
  - Ensure all tests pass
  - Ask the user if questions arise

- [ ] 18. Checkpoint - Phase 3-4 Complete
  - Ensure search improvements are working (relevance ranking, hybrid search, filtering)
  - Ensure configuration management is working
  - Ensure provider manager is routing correctly
  - Ensure all tests pass
  - Ask the user if questions arise

- [ ] 19. Checkpoint - Phase 5-6 Complete
  - Ensure metrics are being collected and exposed
  - Ensure health checks are working
  - Ensure API endpoints are updated with new contracts
  - Ensure documentation is complete
  - Ensure integration tests pass
  - Ensure performance benchmarks meet targets
  - Ask the user if questions arise

---

## Implementation Notes

### Task Dependencies

- Phase 1 (tasks 1-3) must be completed before Phase 2
- Phase 2 (tasks 4-5) must be completed before Phase 4
- Phase 3 (tasks 6-8) must be completed before Phase 4
- Phase 4 (tasks 9-10) must be completed before Phase 5
- Phase 5 (tasks 11-12) must be completed before Phase 6
- Phase 6 (tasks 13-16) can begin after Phase 4 is complete

### Complexity Estimates

- Task 1: Medium (interface design, base classes)
- Task 2: High (OpenAI API integration, batch support, retry logic)
- Task 3: High (HuggingFace API integration, batch support)
- Task 4: Medium (cache implementation, LRU eviction, thread safety)
- Task 5: High (ONNX Runtime integration, model loading)
- Task 6: Medium (similarity scoring, reranking logic)
- Task 7: Medium (hybrid search implementation, result merging)
- Task 8: Medium (metadata filtering, query optimization)
- Task 9: Low (configuration management, property classes)
- Task 10: Medium (provider manager, routing logic)
- Task 11: Medium (metrics collection, Prometheus integration)
- Task 12: High (error handling, retry logic, health checks)
- Task 13: Low (DTO updates, endpoint modifications)
- Task 14: High (service orchestration, transaction management)
- Task 15: Low (documentation writing)
- Task 16: High (integration tests, performance benchmarks)

### Key Considerations

1. **Thread Safety**: Embedding cache and provider manager must be thread-safe for concurrent requests
2. **Error Handling**: All external API calls must have retry logic and graceful degradation
3. **Performance**: Query latency target is < 200ms p95; cache hit rate target is > 50%
4. **Configuration**: All settings must be configurable via `application.yml` with environment variable support
5. **Monitoring**: All operations must be instrumented with metrics for observability
6. **Testing**: Each phase should have corresponding unit and integration tests
7. **Documentation**: Clear setup and usage documentation for each provider

### Migration Strategy

1. Deploy new code with feature flags disabled
2. Enable embedding cache first (low risk)
3. Enable new providers (with fallback to existing)
4. Enable hybrid search (optional feature)
5. Enable reranking (optional feature)
6. Monitor metrics and adjust configuration

