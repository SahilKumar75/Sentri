package com.sentri.backend.controller;

import com.sentri.backend.dto.response.MyspaceGraphRelatedItemResponse;
import com.sentri.backend.service.MyspaceGraphService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MyspaceGraphController.class)
class MyspaceGraphControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MyspaceGraphService myspaceGraphService;

    @Test
    void syncsAllItems() throws Exception {
        when(myspaceGraphService.isAvailable()).thenReturn(true);
        when(myspaceGraphService.syncAll()).thenReturn(4);

        mockMvc.perform(post("/api/v1/myspace/graph/sync-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.graphAvailable").value(true))
                .andExpect(jsonPath("$.syncedItems").value(4));
    }

    @Test
    void listsRelatedItems() throws Exception {
        when(myspaceGraphService.isAvailable()).thenReturn(true);
        when(myspaceGraphService.relatedItems("item-1", 5)).thenReturn(List.of(
                new MyspaceGraphRelatedItemResponse("item-2", "DBMS notes", "DBMS", 3, List.of("subject", "tag"))
        ));

        mockMvc.perform(get("/api/v1/myspace/graph/item-1/related").param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.graphAvailable").value(true))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].itemId").value("item-2"));
    }
}
