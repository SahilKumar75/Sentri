package com.sentri.backend.service;

import com.sentri.backend.config.MyspaceGraphProperties;
import com.sentri.backend.dto.response.MyspaceGraphRelatedItemResponse;
import com.sentri.backend.dto.response.MyspaceItemResponse;
import jakarta.annotation.PostConstruct;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MyspaceGraphServiceImpl implements MyspaceGraphService {

    private final MyspaceItemService myspaceItemService;
    private final MyspaceGraphProperties properties;
    private final Driver driver;

    public MyspaceGraphServiceImpl(
            MyspaceItemService myspaceItemService,
            MyspaceGraphProperties properties,
            ObjectProvider<Driver> driverProvider
    ) {
        this.myspaceItemService = myspaceItemService;
        this.properties = properties;
        this.driver = driverProvider.getIfAvailable();
    }

    @PostConstruct
    void initializeGraph() {
        if (!isAvailable()) {
            return;
        }

        try (Session session = openSession()) {
            session.run("CREATE CONSTRAINT myspace_item_id IF NOT EXISTS FOR (n:MyspaceItem) REQUIRE n.id IS UNIQUE");
            session.run("CREATE CONSTRAINT myspace_subject_name IF NOT EXISTS FOR (n:Subject) REQUIRE n.name IS UNIQUE");
            session.run("CREATE CONSTRAINT myspace_tag_name IF NOT EXISTS FOR (n:Tag) REQUIRE n.name IS UNIQUE");
        }
    }

    @Override
    public boolean isAvailable() {
        return properties.enabled() && driver != null;
    }

    @Override
    public int syncItem(String itemId) {
        if (!isAvailable()) {
            return 0;
        }
        sync(myspaceItemService.getItem(itemId));
        return 1;
    }

    @Override
    public int syncAll() {
        if (!isAvailable()) {
            return 0;
        }
        List<MyspaceItemResponse> items = myspaceItemService.listItems();
        items.forEach(this::sync);
        return items.size();
    }

    @Override
    public List<MyspaceGraphRelatedItemResponse> relatedItems(String itemId, Integer limit) {
        if (!isAvailable()) {
            return List.of();
        }

        int safeLimit = limit == null || limit < 1
                ? properties.maxRelatedLimit()
                : Math.min(limit, properties.maxRelatedLimit());

        try (Session session = openSession()) {
            return session.run("""
                    MATCH (source:MyspaceItem {id: $itemId})
                    CALL {
                      WITH source
                      MATCH (source)-[:IN_SUBJECT]->(:Subject)<-[:IN_SUBJECT]-(related:MyspaceItem)
                      WHERE related.id <> source.id
                      RETURN related.id AS itemId, related.title AS title, related.subject AS subject, 2 AS weight, 'subject' AS signal
                      UNION ALL
                      WITH source
                      MATCH (source)-[:HAS_TAG]->(:Tag)<-[:HAS_TAG]-(related:MyspaceItem)
                      WHERE related.id <> source.id
                      RETURN related.id AS itemId, related.title AS title, related.subject AS subject, 1 AS weight, 'tag' AS signal
                    }
                    WITH itemId, title, subject, sum(weight) AS score, collect(DISTINCT signal) AS signals
                    RETURN itemId, title, subject, score, signals
                    ORDER BY score DESC, title ASC
                    LIMIT $limit
                    """, Map.of("itemId", itemId, "limit", safeLimit))
                    .list(record -> new MyspaceGraphRelatedItemResponse(
                            record.get("itemId").asString(),
                            record.get("title").asString(),
                            record.get("subject").asString(),
                            record.get("score").asInt(),
                            record.get("signals").asList(value -> value.asString())
                    ));
        }
    }

    private void sync(MyspaceItemResponse item) {
        try (Session session = openSession()) {
            session.executeWrite(tx -> {
                tx.run("""
                        MERGE (item:MyspaceItem {id: $id})
                        SET item.title = $title,
                            item.subject = $subject,
                            item.source = $source,
                            item.dateLabel = $dateLabel,
                            item.pinned = $pinned,
                            item.featured = $featured
                        """, itemParameters(item));
                tx.run("""
                        MATCH (item:MyspaceItem {id: $id})
                        OPTIONAL MATCH (item)-[r:HAS_TAG|IN_SUBJECT]->()
                        DELETE r
                        """, Map.of("id", item.id()));
                tx.run("""
                        MATCH (item:MyspaceItem {id: $id})
                        MERGE (subject:Subject {name: $subject})
                        MERGE (item)-[:IN_SUBJECT]->(subject)
                        """, Map.of("id", item.id(), "subject", item.subject()));
                for (String tag : item.tags()) {
                    tx.run("""
                            MATCH (item:MyspaceItem {id: $id})
                            MERGE (tag:Tag {name: $tag})
                            MERGE (item)-[:HAS_TAG]->(tag)
                            """, Map.of("id", item.id(), "tag", tag));
                }
                return null;
            });
        }
    }

    private Map<String, Object> itemParameters(MyspaceItemResponse item) {
        return Map.of(
                "id", item.id(),
                "title", item.title(),
                "subject", item.subject(),
                "source", item.source(),
                "dateLabel", item.dateLabel(),
                "pinned", item.pinned(),
                "featured", item.featured()
        );
    }

    private Session openSession() {
        String database = properties.database();
        return (database == null || database.isBlank())
                ? driver.session()
                : driver.session(SessionConfig.forDatabase(database));
    }
}
