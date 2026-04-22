package com.sentri.backend.service;

import com.pgvector.PGvector;
import com.sentri.backend.config.MyspaceVectorProperties;
import com.sentri.backend.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Locale;

@Service
public class MyspaceVectorStoreServiceImpl implements MyspaceVectorStoreService {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final MyspaceVectorProperties properties;
    private volatile boolean available;

    public MyspaceVectorStoreServiceImpl(
            JdbcTemplate jdbcTemplate,
            DataSource dataSource,
            MyspaceVectorProperties properties
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.properties = properties;
    }

    @PostConstruct
    void initializeStore() {
        if (!properties.isEnabled()) {
            available = false;
            return;
        }

        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            String productName = metaData.getDatabaseProductName();
            if (productName == null || !productName.toLowerCase(Locale.ROOT).contains("postgresql")) {
                available = false;
                return;
            }

            PGvector.registerTypes(connection);
            try (Statement statement = connection.createStatement()) {
                statement.execute("CREATE EXTENSION IF NOT EXISTS vector");
                statement.execute("""
                        CREATE TABLE IF NOT EXISTS myspace_vector_items (
                            item_id VARCHAR(128) PRIMARY KEY,
                            title VARCHAR(255) NOT NULL,
                            subject VARCHAR(128) NOT NULL,
                            source VARCHAR(255) NOT NULL,
                            date_label VARCHAR(128) NOT NULL,
                            embedding_model VARCHAR(255) NOT NULL,
                            embedding VECTOR(%d) NOT NULL,
                            metadata_json TEXT,
                            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                        )
                        """.formatted(properties.getDimension()));
                statement.execute("""
                        CREATE INDEX IF NOT EXISTS idx_myspace_vector_items_embedding
                        ON myspace_vector_items USING hnsw (embedding %s)
                        """.formatted(vectorOperatorClass()));
            }
            available = true;
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to initialize Myspace vector store", exception);
        }
    }

    @Override
    public boolean isAvailable() {
        return available;
    }

    @Override
    public void upsert(MyspaceVectorDocument document) {
        if (document == null) {
            throw new BadRequestException("Vector document is required");
        }
        upsertAll(List.of(document));
    }

    @Override
    public void upsertAll(List<MyspaceVectorDocument> documents) {
        ensureAvailable();
        if (documents == null || documents.isEmpty()) {
            return;
        }
        for (MyspaceVectorDocument document : documents) {
            validateEmbedding(document.embedding());
            jdbcTemplate.update(connection -> prepareUpsert(connection, document));
        }
    }

    @Override
    public List<MyspaceVectorMatch> search(float[] embedding, int limit) {
        ensureAvailable();
        validateEmbedding(embedding);
        int boundedLimit = Math.max(1, Math.min(limit, properties.getMaxSearchLimit()));
        String distanceOperator = distanceOperator();
        return jdbcTemplate.query(
                connection -> {
                    PGvector.registerTypes(connection);
                    PreparedStatement statement = connection.prepareStatement("""
                            SELECT item_id, title, subject, source, date_label, embedding_model, metadata_json,
                                   1 - (embedding %s ?) AS similarity
                            FROM myspace_vector_items
                            ORDER BY embedding %s ?
                            LIMIT ?
                            """.formatted(distanceOperator, distanceOperator));
                    PGvector queryVector = new PGvector(embedding);
                    statement.setObject(1, queryVector);
                    statement.setObject(2, queryVector);
                    statement.setInt(3, boundedLimit);
                    return statement;
                },
                (resultSet, rowNum) -> new MyspaceVectorMatch(
                        resultSet.getString("item_id"),
                        resultSet.getString("title"),
                        resultSet.getString("subject"),
                        resultSet.getString("source"),
                        resultSet.getString("date_label"),
                        resultSet.getString("embedding_model"),
                        resultSet.getDouble("similarity"),
                        resultSet.getString("metadata_json")
                )
        );
    }

    private PreparedStatement prepareUpsert(Connection connection, MyspaceVectorDocument document) throws SQLException {
        PGvector.registerTypes(connection);
        PreparedStatement statement = connection.prepareStatement("""
                INSERT INTO myspace_vector_items (
                    item_id, title, subject, source, date_label, embedding_model, embedding, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (item_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    subject = EXCLUDED.subject,
                    source = EXCLUDED.source,
                    date_label = EXCLUDED.date_label,
                    embedding_model = EXCLUDED.embedding_model,
                    embedding = EXCLUDED.embedding,
                    metadata_json = EXCLUDED.metadata_json,
                    updated_at = NOW()
                """);
        statement.setString(1, document.itemId());
        statement.setString(2, document.title());
        statement.setString(3, document.subject());
        statement.setString(4, document.source());
        statement.setString(5, document.dateLabel());
        statement.setString(6, document.embeddingModel());
        statement.setObject(7, new PGvector(document.embedding()));
        statement.setString(8, document.metadataJson());
        return statement;
    }

    private void ensureAvailable() {
        if (!available) {
            throw new IllegalStateException("Myspace vector store is not available for the current database");
        }
    }

    private void validateEmbedding(float[] embedding) {
        if (embedding == null || embedding.length == 0) {
            throw new BadRequestException("Embedding vector is required");
        }
        if (embedding.length != properties.getDimension()) {
            throw new BadRequestException("Embedding dimension must be " + properties.getDimension());
        }
    }

    private String vectorOperatorClass() {
        return switch (properties.getDistanceMetric().toLowerCase(Locale.ROOT)) {
            case "l2" -> "vector_l2_ops";
            case "inner_product" -> "vector_ip_ops";
            default -> "vector_cosine_ops";
        };
    }

    private String distanceOperator() {
        return switch (properties.getDistanceMetric().toLowerCase(Locale.ROOT)) {
            case "l2" -> "<->";
            case "inner_product" -> "<#>";
            default -> "<=>";
        };
    }
}
