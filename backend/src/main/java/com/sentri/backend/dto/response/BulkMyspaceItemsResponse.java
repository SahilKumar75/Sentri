package com.sentri.backend.dto.response;

import java.util.List;

public record BulkMyspaceItemsResponse(
        Integer totalItems,
        List<MyspaceItemResponse> items
) {
}
