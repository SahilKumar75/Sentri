package com.sentri.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkUpsertMyspaceItemsRequest(
        @NotEmpty(message = "items are required")
        List<@Valid UpsertMyspaceItemRequest> items
) {
}
