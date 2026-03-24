package com.sentri.backend.service;

import com.sentri.backend.dto.request.AuthLoginRequest;
import com.sentri.backend.dto.request.AuthSignupRequest;
import com.sentri.backend.dto.request.AuthVerifyOtpRequest;
import com.sentri.backend.dto.response.AuthResultResponse;
import com.sentri.backend.repository.AuthSessionRepository;
import com.sentri.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private AuthSessionRepository authSessionRepository;

    @Test
    void signsUpWithPhoneThenVerifiesAndRestoresSession() {
        AuthResultResponse signup = authService.signup(new AuthSignupRequest(
                "Sahil",
                "Kumar",
                "23/03/2005",
                "+91 98765 43210",
                null,
                "secret123",
                "phone"
        ));

        assertThat(signup.requiresOtp()).isTrue();
        assertThat(signup.pendingUserId()).isNotNull();
        assertThat(signup.debugOtpCode()).hasSize(4);
        assertThat(userAccountRepository.count()).isEqualTo(1);

        AuthResultResponse verified = authService.verifyOtp(new AuthVerifyOtpRequest(
                signup.pendingUserId(),
                signup.debugOtpCode()
        ));

        assertThat(verified.sessionToken()).isNotBlank();
        assertThat(verified.user()).isNotNull();
        assertThat(verified.user().verifiedPhone()).isTrue();

        AuthResultResponse restored = authService.restoreSession(verified.sessionToken());
        assertThat(restored.user()).isNotNull();
        assertThat(restored.user().firstName()).isEqualTo("Sahil");
        assertThat(authSessionRepository.findBySessionToken(verified.sessionToken())).isPresent();
    }

    @Test
    void signsUpWithEmailAndLogsInLater() {
        AuthResultResponse signup = authService.signup(new AuthSignupRequest(
                "Aditi",
                "Patil",
                "01/02/2004",
                null,
                "aditi@example.com",
                "secret123",
                "email"
        ));

        assertThat(signup.requiresOtp()).isFalse();
        assertThat(signup.sessionToken()).isNotBlank();
        assertThat(signup.user()).isNotNull();

        AuthResultResponse login = authService.login(new AuthLoginRequest(
                "aditi@example.com",
                "secret123"
        ));

        assertThat(login.sessionToken()).isNotBlank();
        assertThat(login.user().email()).isEqualTo("aditi@example.com");
    }
}
