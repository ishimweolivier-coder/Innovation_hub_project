package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.AdminLoginOtp;
import com.innovationhub.rw.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AdminLoginOtpRepository extends JpaRepository<AdminLoginOtp, Long> {
    void deleteByUser(User user);

    Optional<AdminLoginOtp> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);

    @Query("SELECT o FROM AdminLoginOtp o JOIN o.user u WHERE LOWER(u.email) = LOWER(:email) AND o.otp = :otp AND o.used = false")
    Optional<AdminLoginOtp> findByUserEmailAndOtpAndUsedFalse(@Param("email") String email, @Param("otp") String otp);
}
