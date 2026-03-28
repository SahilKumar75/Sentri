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
                )
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
                )
        ));

        assertThat(response.matches()).hasSize(2);
        assertThat(response.matches().get(0).id()).isEqualTo("item-2");
    }
}
