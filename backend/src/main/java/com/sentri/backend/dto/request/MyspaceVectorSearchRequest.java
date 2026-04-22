package com.sentri.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record MyspaceVectorSearchRequest(
        @NotEmpty List<@NotNull Float> embedding,
        Integer limit
) {
}
