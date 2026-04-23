package com.sentri.backend.dto.response;

import java.time.Instant;
import java.util.List;

public record MyspaceItemResponse(
        String id,
        String title,
        String body,
        String subject,
        List<String> tags,
        String source,
        String dateLabel,
        String ocrText,
        Boolean pinned,
        Boolean featured,
        Instant createdAt,
        Instant updatedAt
) {
}
