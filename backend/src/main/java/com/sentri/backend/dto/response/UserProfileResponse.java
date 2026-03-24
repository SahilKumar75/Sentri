package com.sentri.backend.dto.response;

import java.time.Instant;
import java.time.LocalDate;

public record UserProfileResponse(
        Long id,
        String firstName,
        String lastName,
        LocalDate dob,
        String phone,
        String email,
        boolean verifiedPhone,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLoginAt
) {
}
