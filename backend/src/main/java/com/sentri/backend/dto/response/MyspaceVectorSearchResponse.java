package com.sentri.backend.dto.response;

import java.util.List;

public record MyspaceVectorSearchResponse(
        Integer totalMatches,
        List<MyspaceVectorMatchResponse> matches
) {
}
