package com.sentri.backend.service;

import com.sentri.backend.dto.request.CreateHangoutRoomRequest;
import com.sentri.backend.dto.request.JoinHangoutRoomRequest;
import com.sentri.backend.dto.response.HangoutRoomResponse;

import java.util.List;

public interface HangoutRoomService {

    HangoutRoomResponse createRoom(String authorization, CreateHangoutRoomRequest request);

    List<HangoutRoomResponse> listRooms();

    HangoutRoomResponse getRoom(String roomCode);

    HangoutRoomResponse joinRoom(String roomCode, JoinHangoutRoomRequest request);
}
