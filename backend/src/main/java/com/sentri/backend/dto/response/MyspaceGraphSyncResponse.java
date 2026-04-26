package com.sentri.backend.dto.response;

public record MyspaceGraphSyncResponse(
        Boolean graphAvailable,
        Integer syncedItems
) {
}
