package com.sentri.backend.dto.request;

import java.util.List;

public record MyspaceSearchRequest(
        String query,
        String selectedSubject,
        List<MyspaceSearchItemRequest> items
) {
}
