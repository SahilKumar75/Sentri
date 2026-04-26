package com.sentri.backend.service;

import com.sentri.backend.dto.response.MyspaceGraphRelatedItemResponse;

import java.util.List;

public interface MyspaceGraphService {

    boolean isAvailable();

    int syncItem(String itemId);

    int syncAll();

    List<MyspaceGraphRelatedItemResponse> relatedItems(String itemId, Integer limit);
}
