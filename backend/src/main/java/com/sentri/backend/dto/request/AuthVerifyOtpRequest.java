package com.sentri.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AuthVerifyOtpRequest(
        @NotNull Long pendingUserId,
        @NotBlank String otpCode
) {
}
