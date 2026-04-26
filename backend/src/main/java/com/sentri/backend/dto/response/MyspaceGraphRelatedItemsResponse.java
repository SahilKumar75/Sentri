package com.sentri.backend.dto.response;

import java.util.List;

public record MyspaceGraphRelatedItemsResponse(
        Boolean graphAvailable,
        Integer totalItems,
        List<MyspaceGraphRelatedItemResponse> items
) {
}
