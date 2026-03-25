package com.sentri.backend.repository;

import com.sentri.backend.domain.HangoutRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HangoutRoomRepository extends JpaRepository<HangoutRoom, Long> {

    Optional<HangoutRoom> findByRoomCode(String roomCode);

    boolean existsByRoomCode(String roomCode);

    List<HangoutRoom> findTop12ByActiveTrueOrderByUpdatedAtDesc();
}
