package com.sentri.backend.service;

import com.sentri.backend.domain.AuthSession;
import com.sentri.backend.domain.UserAccount;
import com.sentri.backend.dto.request.AuthLoginRequest;
import com.sentri.backend.dto.request.AuthSignupRequest;
import com.sentri.backend.dto.request.AuthVerifyOtpRequest;
import com.sentri.backend.dto.response.AuthResultResponse;
import com.sentri.backend.dto.response.UserProfileResponse;
import com.sentri.backend.exception.BadRequestException;
import com.sentri.backend.exception.UnauthorizedException;
import com.sentri.backend.repository.AuthSessionRepository;
import com.sentri.backend.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserAccountRepository userAccountRepository;
    private final AuthSessionRepository authSessionRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(
            UserAccountRepository userAccountRepository,
            AuthSessionRepository authSessionRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userAccountRepository = userAccountRepository;
        this.authSessionRepository = authSessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public AuthResultResponse signup(AuthSignupRequest request) {
        if (request == null) {
            throw new BadRequestException("Signup payload is required");
        }

        String firstName = cleanText(request.firstName());
        String lastName = cleanText(request.lastName());
        String password = request.password();
        LocalDate dob = parseDob(request.dob());
        String contactMethod = cleanText(request.contactMethod()).toLowerCase();
        String phone = cleanOptionalText(request.phone());
        String phoneNormalized = normalizePhone(phone);
        String email = normalizeEmail(request.email());

        if (firstName.isEmpty() || lastName.isEmpty() || password == null || password.isBlank()) {
            throw new BadRequestException("First name, last name, DOB, and password are required");
        }

        if (!contactMethod.equals("phone") && !contactMethod.equals("email")) {
            throw new BadRequestException("Contact method must be phone or email");
        }

        if (contactMethod.equals("phone") && phoneNormalized.isEmpty()) {
            throw new BadRequestException("Phone number is required for OTP signup");
        }

        if (contactMethod.equals("email") && email == null) {
            throw new BadRequestException("Email is required for email signup");
        }

        Optional<UserAccount> byPhone = phoneNormalized.isEmpty()
                ? Optional.empty()
                : userAccountRepository.findByPhoneNormalized(phoneNormalized);
        Optional<UserAccount> byEmail = email == null
                ? Optional.empty()
                : userAccountRepository.findByEmailNormalized(email);

        UserAccount user = resolveSignupUser(byPhone, byEmail, contactMethod);
        applySignupFields(user, firstName, lastName, dob, phone, phoneNormalized, email, password);

        if (contactMethod.equals("phone")) {
            String otpCode = generateOtp();
            user.setVerifiedPhone(Boolean.FALSE);
            user.setPendingOtpCode(otpCode);
            user.setPendingOtpRequestedAt(Instant.now());
            UserAccount saved = userAccountRepository.saveAndFlush(user);
            return new AuthResultResponse(
                    "OTP sent to " + saved.getPhone(),
                    true,
                    saved.getId(),
                    otpCode,
                    null,
                    null
            );
        }

        user.setPendingOtpCode(null);
        user.setPendingOtpRequestedAt(null);
        UserAccount saved = userAccountRepository.saveAndFlush(user);
        AuthSession session = createSession(saved);
        return new AuthResultResponse(
                "Welcome, " + saved.getFirstName() + ". Your account is ready.",
                false,
                null,
                null,
                session.getSessionToken(),
                toUserProfile(saved)
        );
    }

    @Override
    @Transactional
    public AuthResultResponse verifyOtp(AuthVerifyOtpRequest request) {
        if (request == null) {
            throw new BadRequestException("OTP verification payload is required");
        }

        UserAccount user = userAccountRepository.findById(request.pendingUserId())
                .orElseThrow(() -> new BadRequestException("Pending signup was not found"));

        if (user.getPendingOtpCode() == null || !user.getPendingOtpCode().equals(request.otpCode().trim())) {
            throw new BadRequestException("The OTP did not match. Try the code again.");
        }

        user.setVerifiedPhone(Boolean.TRUE);
        user.setPendingOtpCode(null);
        user.setPendingOtpRequestedAt(null);
        user.setLastLoginAt(Instant.now());

        UserAccount saved = userAccountRepository.saveAndFlush(user);
        AuthSession session = createSession(saved);

        return new AuthResultResponse(
                "Phone verified for " + saved.getFirstName() + ".",
                false,
                null,
                null,
                session.getSessionToken(),
                toUserProfile(saved)
        );
    }

    @Override
    @Transactional
    public AuthResultResponse login(AuthLoginRequest request) {
        if (request == null) {
            throw new BadRequestException("Login payload is required");
        }

        String identifier = cleanText(request.identifier());
        if (identifier.isEmpty()) {
            throw new BadRequestException("Phone number or email is required");
        }

        UserAccount user = findUserByIdentifier(identifier)
                .orElseThrow(() -> new BadRequestException("That phone number or email is not registered yet."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Password mismatch. Please try again.");
        }

        if (user.getPhoneNormalized() != null && !Boolean.TRUE.equals(user.getVerifiedPhone())) {
            throw new BadRequestException("Verify your phone number before logging in.");
        }

        user.setLastLoginAt(Instant.now());
        UserAccount saved = userAccountRepository.saveAndFlush(user);
        AuthSession session = createSession(saved);

        return new AuthResultResponse(
                "Welcome back, " + saved.getFirstName() + ".",
                false,
                null,
                null,
                session.getSessionToken(),
                toUserProfile(saved)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResultResponse restoreSession(String sessionToken) {
        AuthSession session = authSessionRepository.findBySessionToken(requireSessionToken(sessionToken))
                .orElseThrow(() -> new UnauthorizedException("Session is invalid or expired."));
        return new AuthResultResponse(
                "Session restored.",
                false,
                null,
                null,
                session.getSessionToken(),
                toUserProfile(session.getUser())
        );
    }

    @Override
    @Transactional
    public void logout(String sessionToken) {
        authSessionRepository.deleteBySessionToken(requireSessionToken(sessionToken));
    }

    private UserAccount resolveSignupUser(
            Optional<UserAccount> byPhone,
            Optional<UserAccount> byEmail,
            String contactMethod
    ) {
        if (byPhone.isPresent() && byEmail.isPresent() && !byPhone.get().getId().equals(byEmail.get().getId())) {
            throw new BadRequestException("Phone number and email already belong to different accounts.");
        }

        UserAccount existing = byPhone.orElseGet(() -> byEmail.orElse(null));
        if (existing == null) {
            return new UserAccount();
        }

        if (Boolean.TRUE.equals(existing.getVerifiedPhone()) || contactMethod.equals("email")) {
            throw new BadRequestException("An account with this phone number or email already exists.");
        }

        return existing;
    }

    private void applySignupFields(
            UserAccount user,
            String firstName,
            String lastName,
            LocalDate dob,
            String phone,
            String phoneNormalized,
            String email,
            String password
    ) {
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setDob(dob);
        user.setPhone(phone);
        user.setPhoneNormalized(phoneNormalized.isEmpty() ? null : phoneNormalized);
        user.setEmail(email);
        user.setEmailNormalized(email);
        user.setPasswordHash(passwordEncoder.encode(password));
    }

    private Optional<UserAccount> findUserByIdentifier(String identifier) {
        String phoneNormalized = normalizePhone(identifier);
        if (!phoneNormalized.isEmpty()) {
            Optional<UserAccount> byPhone = userAccountRepository.findByPhoneNormalized(phoneNormalized);
            if (byPhone.isPresent()) {
                return byPhone;
            }
        }
        String email = normalizeEmail(identifier);
        if (email != null) {
            return userAccountRepository.findByEmailNormalized(email);
        }
        return Optional.empty();
    }

    private AuthSession createSession(UserAccount user) {
        AuthSession session = new AuthSession();
        session.setUser(user);
        session.setSessionToken(UUID.randomUUID().toString());
        return authSessionRepository.saveAndFlush(session);
    }

    private UserProfileResponse toUserProfile(UserAccount user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getDob(),
                user.getPhone(),
                user.getEmail(),
                Boolean.TRUE.equals(user.getVerifiedPhone()),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLoginAt()
        );
    }

    private LocalDate parseDob(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Date of birth is required");
        }
        try {
            return LocalDate.parse(value.trim(), DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (DateTimeParseException exception) {
            throw new BadRequestException("Date of birth must use DD/MM/YYYY");
        }
    }

    private String cleanText(String value) {
        return value == null ? "" : value.trim();
    }

    private String cleanOptionalText(String value) {
        String cleaned = cleanText(value);
        return cleaned.isEmpty() ? null : cleaned;
    }

    private String normalizePhone(String input) {
        if (input == null) {
            return "";
        }
        String digits = input.replaceAll("\\D", "");
        if (digits.length() > 10) {
            return digits.substring(digits.length() - 10);
        }
        return digits;
    }

    private String normalizeEmail(String input) {
        String cleaned = cleanOptionalText(input);
        return cleaned == null ? null : cleaned.toLowerCase();
    }

    private String generateOtp() {
        return String.valueOf((int) (1000 + Math.random() * 9000));
    }

    private String requireSessionToken(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Session token is required.");
        }
        return token.trim();
    }
}
