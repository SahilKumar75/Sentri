package com.sentri.backend.dto.response;

import java.time.Instant;

public record HangoutRoomResponse(
        Long id,
        String roomCode,
        String roomName,
        String roomType,
        String ownerDisplayName,
        Integer participantCount,
        boolean active,
        String joinLink,
        Instant createdAt,
        Instant updatedAt,
        Instant lastJoinedAt
) {
}
