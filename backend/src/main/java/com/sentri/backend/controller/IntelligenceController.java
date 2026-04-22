package com.sentri.backend.controller;

import com.sentri.backend.dto.request.MyspaceVectorItemRequest;
import com.sentri.backend.dto.request.MyspaceVectorSearchRequest;
import com.sentri.backend.dto.request.MyspaceSearchRequest;
import com.sentri.backend.dto.request.MyspaceVectorUpsertRequest;
import com.sentri.backend.dto.response.MyspaceVectorMatchResponse;
import com.sentri.backend.dto.response.MyspaceVectorSearchResponse;
import com.sentri.backend.dto.response.MyspaceVectorUpsertResponse;
import com.sentri.backend.dto.response.MyspaceSearchResponse;
import com.sentri.backend.service.MyspaceIntelligenceService;
import com.sentri.backend.service.MyspaceVectorDocument;
import com.sentri.backend.service.MyspaceVectorMatch;
import com.sentri.backend.service.MyspaceVectorStoreService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/intelligence", produces = MediaType.APPLICATION_JSON_VALUE)
public class IntelligenceController {

    private final MyspaceIntelligenceService myspaceIntelligenceService;
    private final MyspaceVectorStoreService myspaceVectorStoreService;

    public IntelligenceController(
            MyspaceIntelligenceService myspaceIntelligenceService,
            MyspaceVectorStoreService myspaceVectorStoreService
    ) {
        this.myspaceIntelligenceService = myspaceIntelligenceService;
        this.myspaceVectorStoreService = myspaceVectorStoreService;
    }

    @PostMapping("/myspace/search")
    public MyspaceSearchResponse searchMyspace(@Valid @RequestBody MyspaceSearchRequest request) {
        return myspaceIntelligenceService.search(request);
    }

    @PostMapping("/myspace/vector/upsert")
    public MyspaceVectorUpsertResponse upsertMyspaceVectors(@Valid @RequestBody MyspaceVectorUpsertRequest request) {
        myspaceVectorStoreService.upsertAll(
                request.items().stream()
                        .map(this::toDocument)
                        .toList()
        );
        return new MyspaceVectorUpsertResponse(request.items().size(), myspaceVectorStoreService.isAvailable());
    }

    @PostMapping("/myspace/vector/search")
    public MyspaceVectorSearchResponse searchMyspaceVectors(@Valid @RequestBody MyspaceVectorSearchRequest request) {
        var matches = myspaceVectorStoreService.search(toFloatArray(request.embedding()), request.limit() == null ? 5 : request.limit())
                .stream()
                .map(this::toResponse)
                .toList();
        return new MyspaceVectorSearchResponse(matches.size(), matches);
    }

    private MyspaceVectorDocument toDocument(MyspaceVectorItemRequest item) {
        return new MyspaceVectorDocument(
                item.itemId(),
                item.title(),
                item.subject(),
                item.source(),
                item.dateLabel(),
                item.embeddingModel(),
                toFloatArray(item.embedding()),
                item.metadataJson()
        );
    }

    private MyspaceVectorMatchResponse toResponse(MyspaceVectorMatch match) {
        return new MyspaceVectorMatchResponse(
                match.itemId(),
                match.title(),
                match.subject(),
                match.source(),
                match.dateLabel(),
                match.embeddingModel(),
                match.similarity(),
                match.metadataJson()
        );
    }

    private float[] toFloatArray(java.util.List<Float> embedding) {
        float[] values = new float[embedding.size()];
        for (int index = 0; index < embedding.size(); index++) {
            values[index] = embedding.get(index);
        }
        return values;
    }
}
