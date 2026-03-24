package com.sentri.backend.service;

import com.sentri.backend.dto.request.AuthLoginRequest;
import com.sentri.backend.dto.request.AuthSignupRequest;
import com.sentri.backend.dto.request.AuthVerifyOtpRequest;
import com.sentri.backend.dto.response.AuthResultResponse;

public interface AuthService {

    AuthResultResponse signup(AuthSignupRequest request);

    AuthResultResponse verifyOtp(AuthVerifyOtpRequest request);

    AuthResultResponse login(AuthLoginRequest request);

    AuthResultResponse restoreSession(String sessionToken);

    void logout(String sessionToken);
}
