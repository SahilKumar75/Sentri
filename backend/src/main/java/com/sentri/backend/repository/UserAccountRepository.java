package com.sentri.backend.repository;

import com.sentri.backend.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByPhoneNormalized(String phoneNormalized);

    Optional<UserAccount> findByEmailNormalized(String emailNormalized);
}
