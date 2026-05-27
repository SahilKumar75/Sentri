package com.sentri.backend.controller;

import com.sentri.backend.dto.request.AuthLoginRequest;
import com.sentri.backend.dto.request.AuthSignupRequest;
import com.sentri.backend.dto.request.AuthVerifyOtpRequest;
import com.sentri.backend.dto.response.AuthResultResponse;
import com.sentri.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public AuthResultResponse signup(@Valid @RequestBody AuthSignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/verify-otp")
    public AuthResultResponse verifyOtp(@Valid @RequestBody AuthVerifyOtpRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/login")
    public AuthResultResponse login(@Valid @RequestBody AuthLoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/dev-login")
    public AuthResultResponse devLogin(@RequestBody java.util.Map<String, String> request) {
        return authService.devLogin(request.get("email"));
    }

    @GetMapping("/session")
    public AuthResultResponse session(@RequestHeader(name = "Authorization", required = false) String authorization) {
        return authService.restoreSession(extractBearerToken(authorization));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(name = "Authorization", required = false) String authorization) {
        authService.logout(extractBearerToken(authorization));
        return ResponseEntity.noContent().build();
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return null;
        }
        if (authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authorization.substring(7).trim();
        }
        return authorization.trim();
    }
}
