package com.sentri.backend.service;

import com.sentri.backend.dto.request.MyspaceSearchItemRequest;
import com.sentri.backend.dto.request.UpsertMyspaceItemRequest;
import com.sentri.backend.dto.response.MyspaceItemResponse;

import java.util.List;

public interface MyspaceItemService {

    MyspaceItemResponse upsert(UpsertMyspaceItemRequest request);

    List<MyspaceItemResponse> bulkUpsert(List<UpsertMyspaceItemRequest> requests);

    MyspaceItemResponse getItem(String itemId);

    List<MyspaceItemResponse> listItems();

    void deleteItem(String itemId);

    List<MyspaceSearchItemRequest> listSearchItems();
}
