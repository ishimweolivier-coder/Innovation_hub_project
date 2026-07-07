package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.PasswordResetToken;
import com.innovationhub.rw.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);

    @Query("SELECT t FROM PasswordResetToken t JOIN t.user u WHERE LOWER(u.email) = LOWER(:email) AND t.token = :token AND t.used = false")
    Optional<PasswordResetToken> findByUserEmailAndTokenAndUsedFalse(@Param("email") String email, @Param("token") String token);

    Optional<PasswordResetToken> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);

    @Modifying
    @Transactional
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user = :user AND t.used = false")
    void markAllAsUsed(@Param("user") User user);
}
