package com.sentri.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequest(
        @NotBlank String identifier,
        @NotBlank String password
) {
}
