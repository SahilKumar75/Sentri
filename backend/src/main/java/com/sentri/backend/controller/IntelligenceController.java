package com.sentri.backend.controller;

import com.sentri.backend.dto.request.MyspaceSearchRequest;
import com.sentri.backend.dto.response.MyspaceSearchResponse;
import com.sentri.backend.service.MyspaceIntelligenceService;
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

    public IntelligenceController(MyspaceIntelligenceService myspaceIntelligenceService) {
        this.myspaceIntelligenceService = myspaceIntelligenceService;
    }

    @PostMapping("/myspace/search")
    public MyspaceSearchResponse searchMyspace(@Valid @RequestBody MyspaceSearchRequest request) {
        return myspaceIntelligenceService.search(request);
    }
}
