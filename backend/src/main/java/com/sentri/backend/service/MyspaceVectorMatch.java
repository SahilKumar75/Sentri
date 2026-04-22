package com.sentri.backend.service;

public record MyspaceVectorMatch(
        String itemId,
        String title,
        String subject,
        String source,
        String dateLabel,
        String embeddingModel,
        double similarity,
        String metadataJson
) {
}
