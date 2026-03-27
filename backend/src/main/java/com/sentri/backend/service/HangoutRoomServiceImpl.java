package com.sentri.backend.service;

import com.sentri.backend.domain.AuthSession;
import com.sentri.backend.domain.HangoutRoom;
import com.sentri.backend.domain.UserAccount;
import com.sentri.backend.dto.request.CreateHangoutRoomRequest;
import com.sentri.backend.dto.request.JoinHangoutRoomRequest;
import com.sentri.backend.dto.response.HangoutRoomResponse;
import com.sentri.backend.exception.BadRequestException;
import com.sentri.backend.exception.ResourceNotFoundException;
import com.sentri.backend.exception.UnauthorizedException;
import com.sentri.backend.repository.AuthSessionRepository;
import com.sentri.backend.repository.HangoutRoomRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class HangoutRoomServiceImpl implements HangoutRoomService {

    private final HangoutRoomRepository hangoutRoomRepository;
    private final AuthSessionRepository authSessionRepository;

    public HangoutRoomServiceImpl(
            HangoutRoomRepository hangoutRoomRepository,
            AuthSessionRepository authSessionRepository
    ) {
        this.hangoutRoomRepository = hangoutRoomRepository;
        this.authSessionRepository = authSessionRepository;
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"hangoutActiveRooms", "hangoutRoomByCode"}, allEntries = true)
    public HangoutRoomResponse createRoom(String authorization, CreateHangoutRoomRequest request) {
        if (request == null) {
            throw new BadRequestException("Room payload is required");
        }

        UserAccount user = requireUser(authorization);
        HangoutRoom room = new HangoutRoom();
        room.setRoomCode(generateUniqueRoomCode());
        room.setRoomName(cleanRoomName(request.roomName()));
        room.setRoomType(cleanRoomType(request.roomType()));
        room.setOwnerDisplayName((user.getFirstName() + " " + user.getLastName()).trim());
        room.setOwnerUserId(user.getId());
        room.setParticipantCount(1);
        room.setActive(Boolean.TRUE);
        room.setLastJoinedAt(Instant.now());

        HangoutRoom saved = hangoutRoomRepository.saveAndFlush(room);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "hangoutActiveRooms")
    public List<HangoutRoomResponse> listRooms() {
        return hangoutRoomRepository.findTop12ByActiveTrueOrderByUpdatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "hangoutRoomByCode", key = "#roomCode.trim().toUpperCase()")
    public HangoutRoomResponse getRoom(String roomCode) {
        return toResponse(findRoom(roomCode));
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = {"hangoutActiveRooms", "hangoutRoomByCode"}, allEntries = true)
    public HangoutRoomResponse joinRoom(String roomCode, JoinHangoutRoomRequest request) {
        HangoutRoom room = findRoom(roomCode);
        room.setLastJoinedAt(Instant.now());
        room.setParticipantCount(Math.max((room.getParticipantCount() == null ? 0 : room.getParticipantCount()) + 1, 1));
        HangoutRoom saved = hangoutRoomRepository.saveAndFlush(room);
        return toResponse(saved);
    }

    private HangoutRoom findRoom(String roomCode) {
        if (roomCode == null || roomCode.isBlank()) {
            throw new BadRequestException("Room code is required");
        }
        return hangoutRoomRepository.findByRoomCode(roomCode.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException("Hangout room " + roomCode + " was not found"));
    }

    private UserAccount requireUser(String authorization) {
        String token = extractBearerToken(authorization);
        AuthSession session = authSessionRepository.findBySessionToken(token)
                .orElseThrow(() -> new UnauthorizedException("Valid login session required to create a room."));
        return session.getUser();
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            throw new UnauthorizedException("Authorization header is required.");
        }
        if (authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authorization.substring(7).trim();
        }
        return authorization.trim();
    }

    private String cleanRoomName(String roomName) {
        if (roomName == null || roomName.isBlank()) {
            throw new BadRequestException("Room name is required");
        }
        return roomName.trim();
    }

    private String cleanRoomType(String roomType) {
        if (roomType == null || roomType.isBlank()) {
            return "Study";
        }
        return roomType.trim();
    }

    private String generateUniqueRoomCode() {
        String roomCode;
        do {
            roomCode = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
        } while (hangoutRoomRepository.existsByRoomCode(roomCode));
        return roomCode;
    }

    private HangoutRoomResponse toResponse(HangoutRoom room) {
        return new HangoutRoomResponse(
                room.getId(),
                room.getRoomCode(),
                room.getRoomName(),
                room.getRoomType(),
                room.getOwnerDisplayName(),
                room.getParticipantCount(),
                Boolean.TRUE.equals(room.getActive()),
                "sentri://hangout/" + room.getRoomCode(),
                room.getCreatedAt(),
                room.getUpdatedAt(),
                room.getLastJoinedAt()
        );
    }
}
