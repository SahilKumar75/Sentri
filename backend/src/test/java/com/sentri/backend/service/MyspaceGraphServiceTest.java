package com.sentri.backend.service;

import com.sentri.backend.config.MyspaceGraphProperties;
import com.sentri.backend.dto.response.MyspaceGraphRelatedItemResponse;
import com.sentri.backend.dto.response.MyspaceItemResponse;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import org.neo4j.driver.TransactionContext;
import org.neo4j.driver.Value;
import org.neo4j.driver.Values;
import org.springframework.beans.factory.ObjectProvider;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MyspaceGraphServiceTest {

    @Test
    void returnsRelatedItemsFromGraphQuery() {
        Driver driver = mock(Driver.class);
        Session session = mock(Session.class);
        Result result = mock(Result.class);
        Record record = mock(Record.class);
        Value signals = Values.value(List.of("subject", "tag"));

        when(driver.session(any(SessionConfig.class))).thenReturn(session);
        when(session.run(anyString(), anyMap())).thenReturn(result);
        when(result.list(any(Function.class))).thenAnswer(invocation -> {
            Function<Record, MyspaceGraphRelatedItemResponse> mapper = invocation.getArgument(0);
            return List.of(mapper.apply(record));
        });
        when(record.get("itemId")).thenReturn(Values.value("item-2"));
        when(record.get("title")).thenReturn(Values.value("DBMS notes"));
        when(record.get("subject")).thenReturn(Values.value("DBMS"));
        when(record.get("score")).thenReturn(Values.value(3));
        when(record.get("signals")).thenReturn(signals);

        MyspaceGraphService service = new MyspaceGraphServiceImpl(
                new NoOpItemService(),
                new MyspaceGraphProperties(true, "bolt://localhost:7687", "neo4j", "password", "neo4j", 12),
                provider(driver)
        );

        List<MyspaceGraphRelatedItemResponse> relatedItems = service.relatedItems("item-1", 5);
        assertThat(relatedItems).hasSize(1);
        assertThat(relatedItems.get(0).itemId()).isEqualTo("item-2");
        assertThat(relatedItems.get(0).signals()).containsExactly("subject", "tag");
    }

    @Test
    void syncsAllPersistedItemsIntoGraph() {
        Driver driver = mock(Driver.class);
        Session session = mock(Session.class);
        TransactionContext tx = mock(TransactionContext.class);

        when(driver.session(any(SessionConfig.class))).thenReturn(session);
        when(session.executeWrite(any())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            var callback = (org.neo4j.driver.TransactionCallback<Object>) invocation.getArgument(0);
            return callback.execute(tx);
        });
        when(tx.run(anyString(), anyMap())).thenReturn(mock(Result.class));
        when(session.run(anyString())).thenReturn(mock(Result.class));

        MyspaceGraphService service = new MyspaceGraphServiceImpl(
                new FixedItemService(),
                new MyspaceGraphProperties(true, "bolt://localhost:7687", "neo4j", "password", "neo4j", 12),
                provider(driver)
        );

        assertThat(service.syncAll()).isEqualTo(1);
    }

    private ObjectProvider<Driver> provider(Driver driver) {
        return new ObjectProvider<>() {
            @Override
            public Driver getObject(Object... args) {
                return driver;
            }

            @Override
            public Driver getIfAvailable() {
                return driver;
            }

            @Override
            public Driver getIfUnique() {
                return driver;
            }

            @Override
            public Driver getObject() {
                return driver;
            }
        };
    }

    private static class NoOpItemService implements MyspaceItemService {
        @Override
        public MyspaceItemResponse upsert(com.sentri.backend.dto.request.UpsertMyspaceItemRequest request) { throw new UnsupportedOperationException(); }
        @Override
        public List<MyspaceItemResponse> bulkUpsert(List<com.sentri.backend.dto.request.UpsertMyspaceItemRequest> requests) { return List.of(); }
        @Override
        public MyspaceItemResponse getItem(String itemId) { throw new UnsupportedOperationException(); }
        @Override
        public List<MyspaceItemResponse> listItems() { return List.of(); }
        @Override
        public void deleteItem(String itemId) { throw new UnsupportedOperationException(); }
        @Override
        public List<com.sentri.backend.dto.request.MyspaceSearchItemRequest> listSearchItems() { return List.of(); }
    }

    private static final class FixedItemService extends NoOpItemService {
        @Override
        public List<MyspaceItemResponse> listItems() {
            return List.of(new MyspaceItemResponse(
                    "item-1",
                    "DBMS notes",
                    "Normalization",
                    "DBMS",
                    List.of("dbms", "sql"),
                    "Screenshot",
                    "Today",
                    "ocr",
                    true,
                    false,
                    Instant.parse("2026-04-26T00:00:00Z"),
                    Instant.parse("2026-04-26T00:00:00Z")
            ));
        }
    }
}
