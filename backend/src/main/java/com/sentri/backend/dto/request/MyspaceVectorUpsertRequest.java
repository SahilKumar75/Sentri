package com.sentri.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record MyspaceVectorUpsertRequest(
        @NotEmpty List<@Valid MyspaceVectorItemRequest> items
) {
}
