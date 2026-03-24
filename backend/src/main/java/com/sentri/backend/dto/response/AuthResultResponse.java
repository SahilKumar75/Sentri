package com.sentri.backend.dto.response;

public record AuthResultResponse(
        String message,
        boolean requiresOtp,
        Long pendingUserId,
        String debugOtpCode,
        String sessionToken,
        UserProfileResponse user
) {
}
