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
import java.time.LocalDate;

@Entity
@Table(
        name = "user_accounts",
        indexes = {
                @Index(name = "idx_user_accounts_phone_normalized", columnList = "phoneNormalized"),
                @Index(name = "idx_user_accounts_email_normalized", columnList = "emailNormalized"),
                @Index(name = "idx_user_accounts_last_login_at", columnList = "lastLoginAt")
        }
)
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private LocalDate dob;

    private String phone;

    @Column(unique = true)
    private String phoneNormalized;

    private String email;

    @Column(unique = true)
    private String emailNormalized;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private Boolean verifiedPhone = Boolean.FALSE;

    private String pendingOtpCode;

    private Instant pendingOtpRequestedAt;

    private Instant lastLoginAt;

    public UserAccount() {
    }

    public Long getId() {
        return id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPhoneNormalized() {
        return phoneNormalized;
    }

    public void setPhoneNormalized(String phoneNormalized) {
        this.phoneNormalized = phoneNormalized;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmailNormalized() {
        return emailNormalized;
    }

    public void setEmailNormalized(String emailNormalized) {
        this.emailNormalized = emailNormalized;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Boolean getVerifiedPhone() {
        return verifiedPhone;
    }

    public void setVerifiedPhone(Boolean verifiedPhone) {
        this.verifiedPhone = verifiedPhone;
    }

    public String getPendingOtpCode() {
        return pendingOtpCode;
    }

    public void setPendingOtpCode(String pendingOtpCode) {
        this.pendingOtpCode = pendingOtpCode;
    }

    public Instant getPendingOtpRequestedAt() {
        return pendingOtpRequestedAt;
    }

    public void setPendingOtpRequestedAt(Instant pendingOtpRequestedAt) {
        this.pendingOtpRequestedAt = pendingOtpRequestedAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (verifiedPhone == null) {
            verifiedPhone = Boolean.FALSE;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
        if (verifiedPhone == null) {
            verifiedPhone = Boolean.FALSE;
        }
    }
}
