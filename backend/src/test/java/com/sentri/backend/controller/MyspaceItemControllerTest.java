package com.sentri.backend.controller;

import com.sentri.backend.dto.response.MyspaceItemResponse;
import com.sentri.backend.service.MyspaceItemService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MyspaceItemController.class)
class MyspaceItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MyspaceItemService myspaceItemService;

    @Test
    void upsertsItem() throws Exception {
        when(myspaceItemService.upsert(any())).thenReturn(new MyspaceItemResponse(
                "item-1",
                "DBMS notes",
                "Normalization summary",
                "DBMS",
                List.of("dbms"),
                "Screenshot",
                "Today",
                "ocr",
                true,
                false,
                Instant.parse("2026-04-23T00:00:00Z"),
                Instant.parse("2026-04-23T00:00:00Z")
        ));

        mockMvc.perform(post("/api/v1/myspace/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": "item-1",
                                  "title": "DBMS notes",
                                  "body": "Normalization summary",
                                  "subject": "DBMS",
                                  "tags": ["dbms"],
                                  "source": "Screenshot",
                                  "dateLabel": "Today",
                                  "ocrText": "ocr",
                                  "pinned": true,
                                  "featured": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("item-1"))
                .andExpect(jsonPath("$.subject").value("DBMS"));
    }

    @Test
    void listsItems() throws Exception {
        when(myspaceItemService.listItems()).thenReturn(List.of(new MyspaceItemResponse(
                "item-1",
                "DBMS notes",
                "Normalization summary",
                "DBMS",
                List.of("dbms"),
                "Screenshot",
                "Today",
                "ocr",
                true,
                false,
                Instant.parse("2026-04-23T00:00:00Z"),
                Instant.parse("2026-04-23T00:00:00Z")
        )));

        mockMvc.perform(get("/api/v1/myspace/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("item-1"));
    }

    @Test
    void deletesItem() throws Exception {
        doNothing().when(myspaceItemService).deleteItem("item-1");

        mockMvc.perform(delete("/api/v1/myspace/items/item-1"))
                .andExpect(status().isNoContent());
    }
}
