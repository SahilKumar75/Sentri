package com.sentri.backend.controller;

import com.sentri.backend.dto.request.BulkUpsertMyspaceItemsRequest;
import com.sentri.backend.dto.request.MyspaceSearchRequest;
import com.sentri.backend.dto.request.StoredMyspaceSearchRequest;
import com.sentri.backend.dto.request.UpsertMyspaceItemRequest;
import com.sentri.backend.dto.response.BulkMyspaceItemsResponse;
import com.sentri.backend.dto.response.MyspaceItemResponse;
import com.sentri.backend.dto.response.MyspaceSearchResponse;
import com.sentri.backend.service.MyspaceIntelligenceService;
import com.sentri.backend.service.MyspaceItemService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/myspace/items", produces = MediaType.APPLICATION_JSON_VALUE)
public class MyspaceItemController {

    private final MyspaceItemService myspaceItemService;
    private final MyspaceIntelligenceService myspaceIntelligenceService;

    public MyspaceItemController(
            MyspaceItemService myspaceItemService,
            MyspaceIntelligenceService myspaceIntelligenceService
    ) {
        this.myspaceItemService = myspaceItemService;
        this.myspaceIntelligenceService = myspaceIntelligenceService;
    }

    @PostMapping
    public MyspaceItemResponse upsert(@Valid @RequestBody UpsertMyspaceItemRequest request) {
        return myspaceItemService.upsert(request);
    }

    @PostMapping("/bulk")
    public BulkMyspaceItemsResponse bulkUpsert(@Valid @RequestBody BulkUpsertMyspaceItemsRequest request) {
        List<MyspaceItemResponse> items = myspaceItemService.bulkUpsert(request.items());
        return new BulkMyspaceItemsResponse(items.size(), items);
    }

    @GetMapping
    public List<MyspaceItemResponse> listItems() {
        return myspaceItemService.listItems();
    }

    @PostMapping("/search")
    public MyspaceSearchResponse searchStoredItems(@RequestBody(required = false) StoredMyspaceSearchRequest request) {
        StoredMyspaceSearchRequest safeRequest = request == null
                ? new StoredMyspaceSearchRequest("", "All", null, null)
                : request;
        return myspaceIntelligenceService.search(new MyspaceSearchRequest(
                safeRequest.query(),
                safeRequest.selectedSubject(),
                List.of(),
                safeRequest.queryEmbedding(),
                safeRequest.vectorLimit()
        ));
    }

    @GetMapping("/{itemId}")
    public MyspaceItemResponse getItem(@PathVariable String itemId) {
        return myspaceItemService.getItem(itemId);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable String itemId) {
        myspaceItemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
