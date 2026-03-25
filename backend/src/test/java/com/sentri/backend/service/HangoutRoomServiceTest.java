package com.sentri.backend.service;

import com.sentri.backend.dto.request.AuthSignupRequest;
import com.sentri.backend.dto.request.AuthVerifyOtpRequest;
import com.sentri.backend.dto.request.CreateHangoutRoomRequest;
import com.sentri.backend.dto.request.JoinHangoutRoomRequest;
import com.sentri.backend.dto.response.AuthResultResponse;
import com.sentri.backend.dto.response.HangoutRoomResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class HangoutRoomServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private HangoutRoomService hangoutRoomService;

    @Test
    void createsRoomAndJoinsByCode() {
        AuthResultResponse signup = authService.signup(new AuthSignupRequest(
                "Sahil",
                "Kumar",
                "23/03/2005",
                "+91 98765 43210",
                null,
                "secret123",
                "phone"
        ));

        AuthResultResponse verified = authService.verifyOtp(new AuthVerifyOtpRequest(
                signup.pendingUserId(),
                signup.debugOtpCode()
        ));

        HangoutRoomResponse created = hangoutRoomService.createRoom(
                "Bearer " + verified.sessionToken(),
                new CreateHangoutRoomRequest("DBMS Revision Room", "Study")
        );

        assertThat(created.roomCode()).hasSize(8);
        assertThat(created.roomName()).isEqualTo("DBMS Revision Room");
        assertThat(created.participantCount()).isEqualTo(1);
        assertThat(created.joinLink()).endsWith(created.roomCode());

        HangoutRoomResponse joined = hangoutRoomService.joinRoom(created.roomCode(), new JoinHangoutRoomRequest("Aditi"));
        assertThat(joined.participantCount()).isEqualTo(2);
    }
}
