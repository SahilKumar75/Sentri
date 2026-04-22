package com.sentri.backend.service;

public record MyspaceVectorDocument(
        String itemId,
        String title,
        String subject,
        String source,
        String dateLabel,
        String embeddingModel,
        float[] embedding,
        String metadataJson
) {
}
