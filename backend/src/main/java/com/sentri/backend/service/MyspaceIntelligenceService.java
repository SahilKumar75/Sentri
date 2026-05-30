package com.sentri.backend.service;

import com.sentri.backend.dto.request.MyspaceSearchRequest;
import com.sentri.backend.dto.response.MyspaceSearchResponse;

public interface MyspaceIntelligenceService {

    MyspaceSearchResponse search(MyspaceSearchRequest request);
    
    MyspaceSearchResponse classify(MyspaceSearchRequest request);
}
