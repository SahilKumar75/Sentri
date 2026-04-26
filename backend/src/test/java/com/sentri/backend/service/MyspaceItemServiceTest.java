package com.sentri.backend.service;

import com.sentri.backend.dto.request.UpsertMyspaceItemRequest;
import com.sentri.backend.dto.response.MyspaceItemResponse;
import com.sentri.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class MyspaceItemServiceTest {

    @Autowired
    private MyspaceItemService myspaceItemService;

    @Test
    void upsertsAndListsMyspaceItems() {
        myspaceItemService.upsert(new UpsertMyspaceItemRequest(
                "item-1",
                "DBMS notes",
                "Normalization summary",
                "DBMS",
                List.of("dbms", "sql"),
                "Screenshot",
                "Today",
                "normalization summary",
                true,
                false
        ));

        List<MyspaceItemResponse> items = myspaceItemService.listItems();
        assertThat(items).isNotEmpty();
        assertThat(items.get(0).id()).isEqualTo("item-1");
        assertThat(items.get(0).tags()).containsExactly("dbms", "sql");
    }

    @Test
    void deletesPersistedItem() {
        myspaceItemService.upsert(new UpsertMyspaceItemRequest(
                "item-2",
                "Placement sheet",
                "Interview timeline",
                "Placement",
                List.of("job"),
                "PDF",
                "Tomorrow",
                "interview timeline",
                false,
                true
        ));

        myspaceItemService.deleteItem("item-2");

        assertThatThrownBy(() -> myspaceItemService.getItem("item-2"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void bulkUpsertsItems() {
        List<MyspaceItemResponse> responses = myspaceItemService.bulkUpsert(List.of(
                new UpsertMyspaceItemRequest(
                        "item-3",
                        "CG notes",
                        "Z buffer",
                        "CG",
                        List.of("graphics"),
                        "Board",
                        "Today",
                        "z buffer",
                        false,
                        true
                ),
                new UpsertMyspaceItemRequest(
                        "item-4",
                        "OS notes",
                        "Paging",
                        "OS",
                        List.of("os"),
                        "Screenshot",
                        "Today",
                        "paging",
                        false,
                        false
                )
        ));

        assertThat(responses).hasSize(2);
        assertThat(myspaceItemService.listItems())
                .extracting(MyspaceItemResponse::id)
                .contains("item-3", "item-4");
    }
}
