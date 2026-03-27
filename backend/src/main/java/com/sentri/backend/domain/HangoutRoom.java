package com.sentri.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(
        name = "hangout_rooms",
        indexes = {
                @Index(name = "idx_hangout_rooms_room_code", columnList = "roomCode"),
                @Index(name = "idx_hangout_rooms_active_updated_at", columnList = "active, updatedAt"),
                @Index(name = "idx_hangout_rooms_owner_user_id", columnList = "ownerUserId")
        }
)
public class HangoutRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false, unique = true)
    private String roomCode;

    @Column(nullable = false)
    private String roomName;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private String ownerDisplayName;

    private Long ownerUserId;

    @Column(nullable = false)
    private Integer participantCount = 1;

    @Column(nullable = false)
    private Boolean active = Boolean.TRUE;

    private Instant lastJoinedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public HangoutRoom() {
    }

    public Long getId() {
        return id;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getOwnerDisplayName() {
        return ownerDisplayName;
    }

    public void setOwnerDisplayName(String ownerDisplayName) {
        this.ownerDisplayName = ownerDisplayName;
    }

    public Long getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(Long ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public Integer getParticipantCount() {
        return participantCount;
    }

    public void setParticipantCount(Integer participantCount) {
        this.participantCount = participantCount;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Instant getLastJoinedAt() {
        return lastJoinedAt;
    }

    public void setLastJoinedAt(Instant lastJoinedAt) {
        this.lastJoinedAt = lastJoinedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (participantCount == null || participantCount < 1) {
            participantCount = 1;
        }
        if (active == null) {
            active = Boolean.TRUE;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
        if (participantCount == null || participantCount < 1) {
            participantCount = 1;
        }
        if (active == null) {
            active = Boolean.TRUE;
        }
    }
}
