package com.sentri.backend.dto.response;

public record MyspaceVectorUpsertResponse(
        Integer indexedCount,
        Boolean vectorStoreAvailable
) {
}
