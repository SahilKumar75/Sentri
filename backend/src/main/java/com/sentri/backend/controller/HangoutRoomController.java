package com.sentri.backend.controller;

import com.sentri.backend.dto.request.CreateHangoutRoomRequest;
import com.sentri.backend.dto.request.JoinHangoutRoomRequest;
import com.sentri.backend.dto.response.HangoutRoomResponse;
import com.sentri.backend.service.HangoutRoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/hangout/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
public class HangoutRoomController {

    private final HangoutRoomService hangoutRoomService;

    public HangoutRoomController(HangoutRoomService hangoutRoomService) {
        this.hangoutRoomService = hangoutRoomService;
    }

    @PostMapping
    public ResponseEntity<HangoutRoomResponse> createRoom(
            @RequestHeader(name = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateHangoutRoomRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hangoutRoomService.createRoom(authorization, request));
    }

    @GetMapping
    public List<HangoutRoomResponse> listRooms() {
        return hangoutRoomService.listRooms();
    }

    @GetMapping("/{roomCode}")
    public HangoutRoomResponse getRoom(@PathVariable String roomCode) {
        return hangoutRoomService.getRoom(roomCode);
    }

    @PostMapping("/{roomCode}/join")
    public HangoutRoomResponse joinRoom(
            @PathVariable String roomCode,
            @RequestBody(required = false) JoinHangoutRoomRequest request
    ) {
        return hangoutRoomService.joinRoom(roomCode, request);
    }
}
