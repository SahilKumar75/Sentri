package com.sentri.backend.dto.response;

import java.util.List;

public record MyspaceSearchMatchResponse(
        String id,
        String title,
        String subject,
        String source,
        String dateLabel,
        Integer score,
        Double vectorSimilarity,
        List<String> reasons,
        String explanation
) {
}
