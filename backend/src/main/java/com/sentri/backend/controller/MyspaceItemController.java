package com.sentri.backend.controller;

import com.sentri.backend.dto.request.UpsertMyspaceItemRequest;
import com.sentri.backend.dto.response.MyspaceItemResponse;
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

    public MyspaceItemController(MyspaceItemService myspaceItemService) {
        this.myspaceItemService = myspaceItemService;
    }

    @PostMapping
    public MyspaceItemResponse upsert(@Valid @RequestBody UpsertMyspaceItemRequest request) {
        return myspaceItemService.upsert(request);
    }

    @GetMapping
    public List<MyspaceItemResponse> listItems() {
        return myspaceItemService.listItems();
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
