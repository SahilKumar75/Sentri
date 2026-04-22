package com.sentri.backend.controller;

import com.sentri.backend.dto.response.MyspaceSearchResponse;
import com.sentri.backend.dto.response.MyspaceVectorMatchResponse;
import com.sentri.backend.dto.response.MyspaceVectorSearchResponse;
import com.sentri.backend.service.MyspaceIntelligenceService;
import com.sentri.backend.service.MyspaceVectorStoreService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(IntelligenceController.class)
class IntelligenceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MyspaceIntelligenceService myspaceIntelligenceService;

    @MockBean
    private MyspaceVectorStoreService myspaceVectorStoreService;

    @Test
    void upsertsMyspaceVectors() throws Exception {
        doNothing().when(myspaceVectorStoreService).upsertAll(any());
        when(myspaceVectorStoreService.isAvailable()).thenReturn(true);

        mockMvc.perform(post("/api/v1/intelligence/myspace/vector/upsert")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "items": [
                                    {
                                      "itemId": "dbms-1",
                                      "title": "DBMS notes",
                                      "subject": "DBMS",
                                      "source": "Screenshot",
                                      "dateLabel": "Today",
                                      "embeddingModel": "test-embedding",
                                      "embedding": [0.1, 0.2, 0.3],
                                      "metadataJson": "{\\\"kind\\\":\\\"screenshot\\\"}"
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.indexedCount").value(1))
                .andExpect(jsonPath("$.vectorStoreAvailable").value(true));
    }

    @Test
    void searchesMyspaceVectors() throws Exception {
        when(myspaceVectorStoreService.search(any(), any(Integer.class))).thenReturn(List.of(
                new com.sentri.backend.service.MyspaceVectorMatch(
                        "dbms-1",
                        "DBMS notes",
                        "DBMS",
                        "Screenshot",
                        "Today",
                        "test-embedding",
                        0.91,
                        "{\"kind\":\"screenshot\"}"
                )
        ));

        mockMvc.perform(post("/api/v1/intelligence/myspace/vector/search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "embedding": [0.1, 0.2, 0.3],
                                  "limit": 5
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMatches").value(1))
                .andExpect(jsonPath("$.matches[0].itemId").value("dbms-1"))
                .andExpect(jsonPath("$.matches[0].similarity").value(0.91));
    }

    @Test
    void rejectsEmptyEmbeddingPayload() throws Exception {
        mockMvc.perform(post("/api/v1/intelligence/myspace/vector/search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "embedding": []
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
