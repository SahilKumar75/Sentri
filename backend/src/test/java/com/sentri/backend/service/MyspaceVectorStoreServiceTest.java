package com.sentri.backend.service;

import com.sentri.backend.config.MyspaceVectorProperties;
import com.sentri.backend.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.postgresql.PGConnection;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.Statement;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MyspaceVectorStoreServiceTest {

    @Test
    void initializesPgvectorSchemaOnPostgresql() throws Exception {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);
        Statement statement = mock(Statement.class);
        PGConnection pgConnection = mock(PGConnection.class);

        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(connection.unwrap(PGConnection.class)).thenReturn(pgConnection);
        when(metaData.getDatabaseProductName()).thenReturn("PostgreSQL");
        when(connection.createStatement()).thenReturn(statement);

        MyspaceVectorProperties properties = new MyspaceVectorProperties();
        properties.setDimension(384);

        MyspaceVectorStoreServiceImpl service = new MyspaceVectorStoreServiceImpl(jdbcTemplate, dataSource, properties);
        service.initializeStore();

        assertThat(service.isAvailable()).isTrue();
        verify(statement).execute("CREATE EXTENSION IF NOT EXISTS vector");
        verify(statement).execute(Mockito.contains("CREATE TABLE IF NOT EXISTS myspace_vector_items"));
        verify(statement).execute(Mockito.contains("vector_cosine_ops"));
    }

    @Test
    void skipsVectorInitializationOnNonPostgresql() throws Exception {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);

        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(metaData.getDatabaseProductName()).thenReturn("H2");

        MyspaceVectorStoreServiceImpl service = new MyspaceVectorStoreServiceImpl(jdbcTemplate, dataSource, new MyspaceVectorProperties());
        service.initializeStore();

        assertThat(service.isAvailable()).isFalse();
    }

    @Test
    void rejectsEmbeddingsWithWrongDimension() throws Exception {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);
        Statement statement = mock(Statement.class);
        PGConnection pgConnection = mock(PGConnection.class);

        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(connection.unwrap(PGConnection.class)).thenReturn(pgConnection);
        when(metaData.getDatabaseProductName()).thenReturn("PostgreSQL");
        when(connection.createStatement()).thenReturn(statement);

        MyspaceVectorProperties properties = new MyspaceVectorProperties();
        properties.setDimension(4);

        MyspaceVectorStoreServiceImpl service = new MyspaceVectorStoreServiceImpl(jdbcTemplate, dataSource, properties);
        service.initializeStore();

        assertThatThrownBy(() -> service.upsertAll(List.of(new MyspaceVectorDocument(
                "item-1",
                "DBMS notes",
                "DBMS",
                "Screenshot",
                "Today",
                "test-model",
                new float[]{0.1f, 0.2f},
                "{\"kind\":\"screenshot\"}"
        )))).isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Embedding dimension must be 4");
    }
}
