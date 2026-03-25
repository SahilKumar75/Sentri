package com.sentri.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateHangoutRoomRequest(
        @NotBlank String roomName,
        @NotBlank String roomType
) {
}
