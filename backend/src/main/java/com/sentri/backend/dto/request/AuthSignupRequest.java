package com.sentri.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthSignupRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String dob,
        String phone,
        String email,
        @NotBlank @Size(min = 6, max = 120) String password,
        @NotBlank String contactMethod
) {
}
