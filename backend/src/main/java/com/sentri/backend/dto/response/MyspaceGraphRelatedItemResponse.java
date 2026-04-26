package com.sentri.backend.dto.response;

import java.util.List;

public record MyspaceGraphRelatedItemResponse(
        String itemId,
        String title,
        String subject,
        Integer score,
        List<String> signals
) {
}
