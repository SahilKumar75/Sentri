package com.sentri.backend.dto.response;

import java.util.List;

public record MyspaceSearchResponse(
        String query,
        String selectedSubject,
        Integer totalMatches,
        List<MyspaceSearchMatchResponse> matches
) {
}
