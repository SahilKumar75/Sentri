package com.sentri.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpsertMyspaceItemRequest(
        @NotBlank(message = "id is required")
        String id,
        @NotBlank(message = "title is required")
        String title,
        @NotBlank(message = "body is required")
        String body,
        @NotBlank(message = "subject is required")
        String subject,
        @NotNull(message = "tags are required")
        List<String> tags,
        @NotBlank(message = "source is required")
        String source,
        @NotBlank(message = "dateLabel is required")
        String dateLabel,
        @NotBlank(message = "ocrText is required")
        String ocrText,
        @NotNull(message = "pinned is required")
        Boolean pinned,
        @NotNull(message = "featured is required")
        Boolean featured
) {
}
