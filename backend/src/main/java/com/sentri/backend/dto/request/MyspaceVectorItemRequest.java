package com.sentri.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record MyspaceVectorItemRequest(
        @NotBlank String itemId,
        @NotBlank String title,
        @NotBlank String subject,
        @NotBlank String source,
        @NotBlank String dateLabel,
        @NotBlank String embeddingModel,
        @NotEmpty List<@NotNull Float> embedding,
        String metadataJson
) {
}
