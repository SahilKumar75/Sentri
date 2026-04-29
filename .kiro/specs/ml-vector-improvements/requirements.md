# ML Vector Search Improvements - Requirements Document

## Introduction

The Sentri backend currently uses PostgreSQL with pgvector extension for vector storage and similarity search. This feature aims to enhance the vector search system by improving search accuracy and relevance ranking, supporting multiple embedding model providers, optimizing query performance, and fixing existing bugs in the vector store implementation.

The improvements will enable the system to:
- Support multiple embedding model providers (OpenAI, Hugging Face, local models)
- Improve search relevance through better ranking algorithms
- Optimize query performance and reduce memory usage
- Fix bugs in the current vector store implementation
- Provide flexible configuration for different use cases

## Glossary

- **Vector_Store**: The PostgreSQL database with pgvector extension that stores embeddings and metadata
- **Embedding_Model**: A machine learning model that converts text into vector representations
- **Embedding_Provider**: A service that generates embeddings (e.g., OpenAI, Hugging Face, local)
- **Similarity_Score**: A numerical value (0-1) indicating how similar two vectors are
- **Relevance_Ranking**: The process of ordering search results by relevance to the query
- **Query_Vector**: The embedding representation of a search query
- **Vector_Dimension**: The size of the embedding vector (e.g., 384, 1536)
- **Distance_Metric**: The mathematical method for calculating similarity (cosine, L2, inner product)
- **Metadata**: Additional information stored with each vector item (title, subject, source, date)
- **HNSW_Index**: Hierarchical Navigable Small World index for fast approximate nearest neighbor search
- **Embedding_Cache**: In-memory cache of recently generated embeddings to reduce API calls
- **Reranking**: A secondary ranking step that refines initial search results for better accuracy
- **Hybrid_Search**: Combining vector similarity search with keyword-based filtering
- **Batch_Embedding**: Processing multiple texts into embeddings in a single operation
- **Model_Configuration**: Settings that define how an embedding model operates (dimension, provider, API key)

## Requirements

### Requirement 1: Support Multiple Embedding Model Providers

**User Story:** As a developer, I want to use different embedding model providers, so that I can choose the best model for my use case and avoid vendor lock-in.

#### Acceptance Criteria

1. WHEN an embedding model provider is configured, THE Embedding_Provider_Manager SHALL support OpenAI, Hugging Face, and local model providers
2. WHEN a request is made to generate embeddings, THE Embedding_Provider_Manager SHALL route to the configured provider
3. WHEN switching between providers, THE Vector_Store SHALL support embeddings of different dimensions
4. WHERE a local embedding model is configured, THE Embedding_Provider_Manager SHALL load and cache the model in memory
5. WHEN an embedding provider API call fails, THE Embedding_Provider_Manager SHALL return a descriptive error with retry information
6. THE Embedding_Provider_Manager SHALL validate that the embedding dimension matches the configured Vector_Store dimension
7. WHEN multiple embedding models are used, THE Vector_Store SHALL track which model generated each embedding in the embedding_model field

#### Acceptance Criteria (Continued)

8. WHERE batch embedding is supported by the provider, THE Embedding_Provider_Manager SHALL process multiple texts in a single API call
9. WHEN an embedding provider is configured, THE system configuration SHALL allow specifying provider type, API credentials, model name, and vector dimension
10. THE Embedding_Provider_Manager SHALL implement provider-specific error handling and rate limiting

### Requirement 2: Improve Search Accuracy and Relevance Ranking

**User Story:** As a user, I want search results to be more relevant and accurate, so that I can find the information I need more quickly.

#### Acceptance Criteria

1. WHEN a vector search is performed, THE Search_Engine SHALL return results ranked by similarity score in descending order
2. WHEN search results are returned, THE Search_Engine SHALL include the similarity score (0-1) for each result
3. WHEN a search query is provided, THE Search_Engine SHALL support filtering results by metadata fields (subject, source, date_label)
4. WHERE reranking is enabled, THE Search_Engine SHALL apply a secondary ranking algorithm to refine top-k results
5. WHEN reranking is applied, THE Search_Engine SHALL use a cross-encoder model or semantic similarity metric to improve ranking accuracy
6. WHEN search results are returned, THE Search_Engine SHALL support configurable similarity thresholds to filter low-relevance results
7. WHEN a search is performed with metadata filters, THE Search_Engine SHALL combine vector similarity with metadata matching
8. THE Search_Engine SHALL support hybrid search combining vector similarity with keyword-based matching on title and subject fields
9. WHEN hybrid search is used, THE Search_Engine SHALL weight vector similarity and keyword relevance according to configurable parameters
10. WHEN search results are limited, THE Search_Engine SHALL enforce a maximum result limit (configurable, default 20)

### Requirement 3: Optimize Query Performance

**User Story:** As an operator, I want vector search queries to execute quickly, so that users experience responsive search results.

#### Acceptance Criteria

1. WHEN a vector search query is executed, THE Query_Optimizer SHALL complete within 200ms for typical queries (p95)
2. WHEN the Vector_Store is initialized, THE Query_Optimizer SHALL create and maintain HNSW indexes on embedding vectors
3. WHEN multiple queries are executed, THE Query_Optimizer SHALL cache frequently accessed embeddings in memory
4. WHERE batch operations are performed, THE Query_Optimizer SHALL process multiple upserts in a single transaction
5. WHEN the Vector_Store is queried, THE Query_Optimizer SHALL use prepared statements to reduce query compilation overhead
6. WHEN search results are retrieved, THE Query_Optimizer SHALL only fetch necessary columns (item_id, title, subject, source, date_label, similarity)
7. WHEN the database connection pool is configured, THE Query_Optimizer SHALL use connection pooling to reduce connection overhead
8. WHEN vector indexes are created, THE Query_Optimizer SHALL use appropriate index parameters (ef_construction, ef_search) for HNSW
9. WHEN the Vector_Store grows large, THE Query_Optimizer SHALL support partitioning or archiving of old vectors
10. THE Query_Optimizer SHALL provide metrics on query execution time, cache hit rate, and index efficiency

### Requirement 4: Fix Vector Store Implementation Bugs

**User Story:** As a developer, I want the vector store to be reliable and correct, so that I can trust the search results and data integrity.

#### Acceptance Criteria

1. WHEN a vector is upserted, THE Vector_Store SHALL validate that the embedding dimension matches the configured dimension
2. WHEN a vector is upserted, THE Vector_Store SHALL validate that the embedding is not null or empty
3. WHEN a vector is upserted with duplicate item_id, THE Vector_Store SHALL update the existing record (upsert semantics)
4. WHEN a vector search is performed, THE Vector_Store SHALL return results sorted by similarity in descending order
5. WHEN the Vector_Store is initialized, THE Vector_Store SHALL create the myspace_vector_items table if it does not exist
6. WHEN the Vector_Store is initialized, THE Vector_Store SHALL create HNSW indexes if they do not exist
7. IF a database connection fails, THEN THE Vector_Store SHALL handle the error gracefully and provide retry logic
8. WHEN metadata_json is stored, THE Vector_Store SHALL validate that it is valid JSON or null
9. WHEN vectors are searched, THE Vector_Store SHALL handle edge cases (empty result set, single result, max limit exceeded)
10. WHEN the Vector_Store is queried, THE Vector_Store SHALL use consistent distance metrics (cosine, L2, inner product)

### Requirement 5: Enhance Vector Store Configuration

**User Story:** As an operator, I want to configure the vector store flexibly, so that I can optimize for different use cases and environments.

#### Acceptance Criteria

1. WHEN the application starts, THE Configuration_Manager SHALL load vector store settings from application properties
2. THE Configuration_Manager SHALL support configuring embedding provider type (openai, huggingface, local)
3. THE Configuration_Manager SHALL support configuring embedding model name and API credentials
4. THE Configuration_Manager SHALL support configuring vector dimension (default 384)
5. THE Configuration_Manager SHALL support configuring distance metric (cosine, l2, inner_product)
6. THE Configuration_Manager SHALL support configuring maximum search result limit (default 20)
7. THE Configuration_Manager SHALL support enabling/disabling vector store functionality
8. THE Configuration_Manager SHALL support configuring HNSW index parameters (ef_construction, ef_search)
9. THE Configuration_Manager SHALL support configuring embedding cache size and TTL
10. WHERE configuration is invalid, THE Configuration_Manager SHALL fail fast with descriptive error messages

### Requirement 6: Add Embedding Caching

**User Story:** As an operator, I want to reduce API calls to embedding providers, so that I can lower costs and improve performance.

#### Acceptance Criteria

1. WHEN an embedding is requested, THE Embedding_Cache SHALL check if the embedding exists in cache before calling the provider
2. WHEN an embedding is generated, THE Embedding_Cache SHALL store it in memory with a configurable TTL
3. WHEN the cache reaches maximum size, THE Embedding_Cache SHALL evict least-recently-used entries
4. WHEN cache statistics are requested, THE Embedding_Cache SHALL report hit rate, miss rate, and size
5. WHERE cache is enabled, THE Embedding_Cache SHALL reduce API calls to embedding providers by at least 50% for typical workloads
6. WHEN the application restarts, THE Embedding_Cache SHALL be cleared (no persistence required)
7. WHEN an embedding is cached, THE Embedding_Cache SHALL use a hash of the text and model name as the cache key
8. THE Embedding_Cache SHALL be thread-safe for concurrent access

### Requirement 7: Support Batch Embedding Operations

**User Story:** As a developer, I want to generate embeddings for multiple texts efficiently, so that I can reduce latency and API costs.

#### Acceptance Criteria

1. WHEN a batch embedding request is made, THE Batch_Embedder SHALL accept a list of texts and generate embeddings for all of them
2. WHEN batch embedding is performed, THE Batch_Embedder SHALL use the embedding provider's batch API if available
3. WHEN batch embedding is performed, THE Batch_Embedder SHALL return embeddings in the same order as the input texts
4. WHEN a batch embedding request exceeds the provider's batch size limit, THE Batch_Embedder SHALL split the request into multiple batches
5. WHEN batch embedding is performed, THE Batch_Embedder SHALL cache results to avoid duplicate API calls
6. WHEN batch embedding fails for some items, THE Batch_Embedder SHALL return partial results with error information for failed items
7. WHEN batch embedding is performed, THE Batch_Embedder SHALL support configurable batch size (default 32)
8. THE Batch_Embedder SHALL be more efficient than sequential embedding requests (at least 2x faster for typical workloads)

### Requirement 8: Improve Vector Search API Contract

**User Story:** As a developer, I want a clear and flexible API for vector search, so that I can easily integrate vector search into my application.

#### Acceptance Criteria

1. WHEN a vector search request is made, THE Search_API SHALL accept a query string or embedding vector
2. WHERE a query string is provided, THE Search_API SHALL generate an embedding using the configured provider
3. WHEN a search request is made, THE Search_API SHALL support optional metadata filters (subject, source, date_label)
4. WHEN a search request is made, THE Search_API SHALL support configurable result limit and similarity threshold
5. WHEN search results are returned, THE Search_API SHALL include item_id, title, subject, source, date_label, similarity, and metadata
6. WHEN a vector upsert request is made, THE Search_API SHALL accept a list of items with embeddings or text content
7. WHERE text content is provided instead of embeddings, THE Search_API SHALL generate embeddings automatically
8. WHEN a vector upsert request is made, THE Search_API SHALL support batch operations with configurable batch size
9. WHEN a vector upsert response is returned, THE Search_API SHALL include the number of items upserted and success/failure status
10. THE Search_API SHALL validate all input parameters and return descriptive error messages for invalid requests

### Requirement 9: Add Vector Store Monitoring and Metrics

**User Story:** As an operator, I want to monitor vector store performance, so that I can identify and fix performance issues.

#### Acceptance Criteria

1. WHEN vector store operations are performed, THE Metrics_Collector SHALL track query execution time (min, max, avg, p95, p99)
2. WHEN vector store operations are performed, THE Metrics_Collector SHALL track the number of queries, upserts, and errors
3. WHEN embedding generation is performed, THE Metrics_Collector SHALL track API call count, latency, and error rate by provider
4. WHEN the embedding cache is used, THE Metrics_Collector SHALL track cache hit rate, miss rate, and eviction count
5. WHEN vector search is performed, THE Metrics_Collector SHALL track result count, similarity score distribution, and filter effectiveness
6. WHEN the Vector_Store is queried, THE Metrics_Collector SHALL track index efficiency (queries per second, index size)
7. THE Metrics_Collector SHALL expose metrics in a format compatible with Prometheus or similar monitoring systems
8. WHEN metrics are queried, THE Metrics_Collector SHALL provide aggregated statistics over configurable time windows

### Requirement 10: Support Multiple Distance Metrics

**User Story:** As a developer, I want to choose the distance metric that best fits my use case, so that I can optimize search accuracy.

#### Acceptance Criteria

1. WHEN the Vector_Store is configured, THE Distance_Metric_Manager SHALL support cosine, L2, and inner product distance metrics
2. WHEN a vector search is performed, THE Distance_Metric_Manager SHALL use the configured distance metric consistently
3. WHEN the distance metric is changed, THE Distance_Metric_Manager SHALL validate that existing indexes are compatible
4. WHEN similarity scores are calculated, THE Distance_Metric_Manager SHALL normalize scores to a 0-1 range for consistency
5. WHEN search results are returned, THE Distance_Metric_Manager SHALL include the distance metric used in the response metadata
6. THE Distance_Metric_Manager SHALL document the mathematical definition and use cases for each supported metric

### Requirement 11: Add Vector Store Health Checks

**User Story:** As an operator, I want to verify that the vector store is healthy and operational, so that I can detect issues early.

#### Acceptance Criteria

1. WHEN a health check is performed, THE Health_Checker SHALL verify that the database connection is active
2. WHEN a health check is performed, THE Health_Checker SHALL verify that the pgvector extension is installed
3. WHEN a health check is performed, THE Health_Checker SHALL verify that the myspace_vector_items table exists
4. WHEN a health check is performed, THE Health_Checker SHALL verify that HNSW indexes are present and valid
5. WHEN a health check is performed, THE Health_Checker SHALL verify that the embedding provider is accessible
6. WHEN a health check is performed, THE Health_Checker SHALL measure query latency and report if it exceeds thresholds
7. WHEN a health check fails, THE Health_Checker SHALL provide detailed error information for troubleshooting
8. THE Health_Checker SHALL be callable via a REST endpoint for integration with monitoring systems

### Requirement 12: Support Vector Store Maintenance Operations

**User Story:** As an operator, I want to perform maintenance operations on the vector store, so that I can keep it healthy and efficient.

#### Acceptance Criteria

1. WHEN a maintenance operation is requested, THE Maintenance_Manager SHALL support rebuilding HNSW indexes
2. WHEN a maintenance operation is requested, THE Maintenance_Manager SHALL support vacuuming the database to reclaim space
3. WHEN a maintenance operation is requested, THE Maintenance_Manager SHALL support analyzing table statistics for query optimization
4. WHEN a maintenance operation is requested, THE Maintenance_Manager SHALL support archiving or deleting old vectors based on date
5. WHEN a maintenance operation is requested, THE Maintenance_Manager SHALL support exporting vectors for backup or analysis
6. WHEN a maintenance operation is performed, THE Maintenance_Manager SHALL provide progress updates and completion status
7. WHEN a maintenance operation is performed, THE Maintenance_Manager SHALL not block normal vector store operations (non-blocking)
8. THE Maintenance_Manager SHALL be callable via REST endpoints or scheduled jobs

### Requirement 13: Improve Error Handling and Resilience

**User Story:** As a developer, I want robust error handling and resilience, so that the system can recover from failures gracefully.

#### Acceptance Criteria

1. WHEN an embedding provider API call fails, THE Error_Handler SHALL implement exponential backoff retry logic
2. WHEN a database connection fails, THE Error_Handler SHALL implement connection retry logic with configurable attempts
3. WHEN a vector search fails, THE Error_Handler SHALL return a descriptive error message with the root cause
4. WHEN an embedding generation fails, THE Error_Handler SHALL fall back to a default embedding or return an error
5. WHEN a batch operation partially fails, THE Error_Handler SHALL return partial results with error information for failed items
6. WHEN rate limiting is encountered, THE Error_Handler SHALL implement adaptive rate limiting to respect provider limits
7. WHEN a timeout occurs, THE Error_Handler SHALL cancel the operation and return a timeout error
8. THE Error_Handler SHALL log all errors with sufficient context for debugging

### Requirement 14: Add Vector Store Documentation and Examples

**User Story:** As a developer, I want clear documentation and examples, so that I can easily integrate vector search into my application.

#### Acceptance Criteria

1. THE Documentation SHALL include setup instructions for each embedding provider (OpenAI, Hugging Face, local)
2. THE Documentation SHALL include API documentation for all vector search endpoints
3. THE Documentation SHALL include configuration examples for different use cases
4. THE Documentation SHALL include performance tuning guidelines
5. THE Documentation SHALL include troubleshooting guides for common issues
6. THE Documentation SHALL include code examples for common operations (search, upsert, batch operations)
7. THE Documentation SHALL include migration guides for upgrading from the current implementation
8. THE Documentation SHALL be maintained and updated with each release

