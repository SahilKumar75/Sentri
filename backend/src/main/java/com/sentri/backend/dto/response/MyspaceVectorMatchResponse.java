package com.sentri.backend.dto.response;

public record MyspaceVectorMatchResponse(
        String itemId,
        String title,
        String subject,
        String source,
        String dateLabel,
        String embeddingModel,
        Double similarity,
        String metadataJson
) {
}
