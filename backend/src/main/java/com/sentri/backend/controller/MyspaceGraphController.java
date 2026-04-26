package com.sentri.backend.controller;

import com.sentri.backend.dto.response.MyspaceGraphRelatedItemsResponse;
import com.sentri.backend.dto.response.MyspaceGraphSyncResponse;
import com.sentri.backend.service.MyspaceGraphService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/myspace/graph", produces = MediaType.APPLICATION_JSON_VALUE)
public class MyspaceGraphController {

    private final MyspaceGraphService myspaceGraphService;

    public MyspaceGraphController(MyspaceGraphService myspaceGraphService) {
        this.myspaceGraphService = myspaceGraphService;
    }

    @PostMapping("/sync-all")
    public MyspaceGraphSyncResponse syncAll() {
        int synced = myspaceGraphService.syncAll();
        return new MyspaceGraphSyncResponse(myspaceGraphService.isAvailable(), synced);
    }

    @PostMapping("/sync/{itemId}")
    public MyspaceGraphSyncResponse syncItem(@PathVariable String itemId) {
        int synced = myspaceGraphService.syncItem(itemId);
        return new MyspaceGraphSyncResponse(myspaceGraphService.isAvailable(), synced);
    }

    @GetMapping("/{itemId}/related")
    public MyspaceGraphRelatedItemsResponse relatedItems(
            @PathVariable String itemId,
            @RequestParam(name = "limit", required = false) Integer limit
    ) {
        var items = myspaceGraphService.relatedItems(itemId, limit);
        return new MyspaceGraphRelatedItemsResponse(myspaceGraphService.isAvailable(), items.size(), items);
    }
}
