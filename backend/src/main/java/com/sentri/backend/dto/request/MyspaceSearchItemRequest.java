package com.sentri.backend.dto.request;

import java.util.List;

public record MyspaceSearchItemRequest(
        String id,
        String title,
        String body,
        String subject,
        List<String> tags,
        String source,
        String dateLabel,
        String ocrText,
        Boolean pinned,
        Boolean featured
) {
}
