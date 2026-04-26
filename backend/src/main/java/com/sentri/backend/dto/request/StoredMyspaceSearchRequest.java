package com.sentri.backend.dto.request;

import java.util.List;

public record StoredMyspaceSearchRequest(
        String query,
        String selectedSubject,
        List<Float> queryEmbedding,
        Integer vectorLimit
) {
}
