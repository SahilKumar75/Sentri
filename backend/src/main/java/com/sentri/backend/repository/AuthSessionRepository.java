package com.sentri.backend.repository;

import com.sentri.backend.domain.AuthSession;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {

    @EntityGraph(attributePaths = "user")
    Optional<AuthSession> findBySessionToken(String sessionToken);

    void deleteBySessionToken(String sessionToken);
}
