package com.sentri.backend.service;

import com.sentri.backend.dto.request.MyspaceSearchItemRequest;
import com.sentri.backend.dto.request.MyspaceSearchRequest;
import com.sentri.backend.dto.response.MyspaceSearchResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MyspaceIntelligenceServiceTest {

    private final MyspaceIntelligenceService myspaceIntelligenceService = new MyspaceIntelligenceServiceImpl();

    @Test
    void ranksAliasBasedMathQueryAgainstPsNotes() {
        MyspaceSearchResponse response = myspaceIntelligenceService.search(new MyspaceSearchRequest(
                "math blackboard",
                "All",
                List.of(
                        new MyspaceSearchItemRequest(
                                "item-1",
                                "Permutation and Combination",
                                "Blackboard photo from class",
                                "P&S",
                                List.of("math", "blackboard"),
                                "Board photo",
                                "Today",
                                "Permutation and Combination examples",
                                true,
                                true
                        ),
                        new MyspaceSearchItemRequest(
                                "item-2",
                                "Placement drive schedule",
                                "Interview rounds and company details",
                                "Placement",
                                List.of("placement", "interview"),
                                "PDF",
                                "Yesterday",
                                "Interview and company details",
                                false,
                                false
                        )
                ),
                null,
                null
        ));

        assertThat(response.totalMatches()).isEqualTo(1);
        assertThat(response.matches().get(0).id()).isEqualTo("item-1");
        assertThat(response.matches().get(0).reasons()).contains("subject-alias");
    }

    @Test
    void keepsFeaturedAndPinnedItemsFirstForEmptyQuery() {
        MyspaceSearchResponse response = myspaceIntelligenceService.search(new MyspaceSearchRequest(
                "",
                "All",
                List.of(
                        new MyspaceSearchItemRequest(
                                "item-1",
                                "Normal note",
                                "Body",
                                "DBMS",
                                List.of("study"),
                                "Screenshot",
                                "Today",
                                "normal note text",
                                false,
                                false
                        ),
                        new MyspaceSearchItemRequest(
                                "item-2",
                                "Pinned note",
                                "Body",
                                "DBMS",
                                List.of("study"),
                                "Screenshot",
                                "Today",
                                "pinned note text",
                                true,
                                true
                        )
                ),
                null,
                null
        ));

        assertThat(response.matches()).hasSize(2);
        assertThat(response.matches().get(0).id()).isEqualTo("item-2");
    }

    @Test
    void includesVectorOnlyMatchesWhenQueryEmbeddingIsPresent() {
        MyspaceVectorStoreService vectorStoreService = new MyspaceVectorStoreService() {
            @Override
            public boolean isAvailable() {
                return true;
            }

            @Override
            public void upsert(MyspaceVectorDocument document) {
            }

            @Override
            public void upsertAll(List<MyspaceVectorDocument> documents) {
            }

            @Override
            public List<MyspaceVectorMatch> search(float[] embedding, int limit) {
                return List.of(new MyspaceVectorMatch(
                        "item-1",
                        "Permutation and Combination",
                        "P&S",
                        "Board photo",
                        "Today",
                        "test-embedding",
                        0.84,
                        "{\"kind\":\"board\"}"
                ));
            }
        };

        MyspaceIntelligenceService service = new MyspaceIntelligenceServiceImpl(vectorStoreService);
        MyspaceSearchResponse response = service.search(new MyspaceSearchRequest(
                "",
                "All",
                List.of(
                        new MyspaceSearchItemRequest(
                                "item-1",
                                "Permutation and Combination",
                                "Blackboard photo from class",
                                "P&S",
                                List.of("math"),
                                "Board photo",
                                "Today",
                                "Permutation notes",
                                false,
                                false
                        )
                ),
                List.of(0.1f, 0.2f, 0.3f),
                5
        ));

        assertThat(response.totalMatches()).isEqualTo(1);
        assertThat(response.matches().get(0).vectorSimilarity()).isEqualTo(0.84);
        assertThat(response.matches().get(0).reasons()).contains("vector");
    }

    @Test
    void boostsLexicalMatchesWithVectorSimilarity() {
        MyspaceVectorStoreService vectorStoreService = new MyspaceVectorStoreService() {
            @Override
            public boolean isAvailable() {
                return true;
            }

            @Override
            public void upsert(MyspaceVectorDocument document) {
            }

            @Override
            public void upsertAll(List<MyspaceVectorDocument> documents) {
            }

            @Override
            public List<MyspaceVectorMatch> search(float[] embedding, int limit) {
                return List.of(new MyspaceVectorMatch(
                        "item-2",
                        "DBMS normalization quick sheet",
                        "DBMS",
                        "Screenshot",
                        "Today",
                        "test-embedding",
                        0.95,
                        "{\"kind\":\"sheet\"}"
                ));
            }
        };

        MyspaceIntelligenceService service = new MyspaceIntelligenceServiceImpl(vectorStoreService);
        MyspaceSearchResponse response = service.search(new MyspaceSearchRequest(
                "normalization",
                "All",
                List.of(
                        new MyspaceSearchItemRequest(
                                "item-1",
                                "Normalization basics",
                                "Short lexical hit",
                                "DBMS",
                                List.of("sql"),
                                "Screenshot",
                                "Today",
                                "normalization",
                                false,
                                false
                        ),
                        new MyspaceSearchItemRequest(
                                "item-2",
                                "DBMS normalization quick sheet",
                                "Detailed vector-backed note",
                                "DBMS",
                                List.of("sql", "dbms"),
                                "Screenshot",
                                "Today",
                                "normalization forms",
                                false,
                                false
                        )
                ),
                List.of(0.5f, 0.4f, 0.3f),
                5
        ));

        assertThat(response.matches().get(0).id()).isEqualTo("item-2");
        assertThat(response.matches().get(0).reasons()).contains("vector");
        assertThat(response.matches().get(0).explanation()).isEqualTo("Matched text and vector similarity");
    }
}
