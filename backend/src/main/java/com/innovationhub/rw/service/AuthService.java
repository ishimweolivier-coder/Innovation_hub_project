package com.innovationhub.rw.service;

import com.innovationhub.rw.dto.*;
import com.innovationhub.rw.entity.*;
import com.innovationhub.rw.repository.AdminLoginOtpRepository;
import com.innovationhub.rw.repository.NotificationRepository;
import com.innovationhub.rw.repository.PasswordResetTokenRepository;
import com.innovationhub.rw.repository.UserRepository;
import com.innovationhub.rw.security.JwtService;
import com.innovationhub.rw.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository tokenRepository;
    private final AdminLoginOtpRepository adminLoginOtpRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final OtpService otpService;

    @Value("${app.reset.link-expiry-hours:24}")
    private int linkExpiryHours;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            PasswordResetTokenRepository tokenRepository,
            AdminLoginOtpRepository adminLoginOtpRepository,
            NotificationRepository notificationRepository,
            EmailService emailService,
            OtpService otpService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.tokenRepository = tokenRepository;
        this.adminLoginOtpRepository = adminLoginOtpRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.otpService = otpService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = principal.getUser();

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new IllegalArgumentException("This account is suspended. Contact support.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            user.setStatus(UserStatus.ACTIVE);
        }
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(principal);
        return LoginResponse.complete(token, UserDto.from(user));
    }

    @Transactional
    public AuthResponse verifyAdminLoginOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code"));

        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Invalid or expired verification code");
        }

        AdminLoginOtp otpRecord = adminLoginOtpRepository
                .findByUserEmailAndOtpAndUsedFalse(request.email().trim(), request.otp().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code"));

        if (otpRecord.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired. Sign in again to receive a new code.");
        }

        otpRecord.setUsed(true);
        adminLoginOtpRepository.save(otpRecord);

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, UserDto.from(user));
    }

    @Transactional
    public Map<String, Object> resendAdminLoginOtp(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("No pending admin login found. Sign in with your password first."));

        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("No pending admin login found. Sign in with your password first.");
        }

        AdminLoginOtp existing = adminLoginOtpRepository
                .findTopByUserAndUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new IllegalArgumentException("No pending admin login found. Sign in with your password first."));

        if (existing.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
            throw new IllegalArgumentException("Please wait 60 seconds before requesting a new code.");
        }

        issueAdminLoginOtp(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "A new verification code was sent to your email.");
        response.put("expiresInMinutes", otpService.getExpiryMinutes());
        return response;
    }

    private LoginResponse initiateAdminOtpLogin(User user) {
        issueAdminLoginOtp(user);
        return LoginResponse.otpRequired(
                user.getEmail(),
                "A 6-digit verification code was sent to your email. Enter it to access the admin dashboard.",
                otpService.getExpiryMinutes()
        );
    }

    private void issueAdminLoginOtp(User user) {
        adminLoginOtpRepository.deleteByUser(user);

        String otp = otpService.generateOtp();
        AdminLoginOtp record = new AdminLoginOtp();
        record.setUser(user);
        record.setOtp(otp);
        record.setExpiresAt(otpService.expiryTime());
        adminLoginOtpRepository.save(record);

        emailService.sendAdminLoginOtp(user, otp, otpService.getExpiryMinutes());
        log.info("Admin login OTP emailed to {}", user.getEmail());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, Role role) {
        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new IllegalArgumentException("If your email is valid, registration successful. Please sign in.");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setPhone(request.phone());
        user.setCompany(request.company());
        user.setInvestorType(request.investorType());
        user.setAvatar(buildAvatar(request.fullName()));
        user.setStatus(UserStatus.ACTIVE);

        if (role == Role.INVESTOR) {
            user.setMinInnovation(65);
        }

        userRepository.save(user);
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);
        return new AuthResponse(token, UserDto.from(user));
    }

    public UserDto getCurrentUser(User user) {
        return UserDto.from(user);
    }

    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "If an account exists for this email, a password reset OTP has been sent.");

        if (user != null) {
            issueResetOtp(user);
        }

        return response;
    }

    @Transactional
    public Map<String, Object> resendResetLink(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "If an account exists for this email, a new OTP has been sent.");

        if (user != null) {
            PasswordResetToken existing = tokenRepository
                    .findTopByUserAndUsedFalseOrderByCreatedAtDesc(user)
                    .orElse(null);

            if (existing != null && existing.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
                throw new IllegalArgumentException("Please wait 60 seconds before requesting a new OTP.");
            }

            issueResetOtp(user);
        }

        return response;
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = validateResetOtp(request.email(), request.token());

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        token.setUsed(true);
        tokenRepository.save(token);

        jwtService.invalidateUserTokens(user.getEmail());

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Your password was changed successfully. If this wasn't you, contact support immediately.");
        notification.setType("approved");
        notificationRepository.save(notification);

        return Map.of("message", "Password updated successfully. You can now sign in.");
    }

    private final SecureRandom secureRandom = new SecureRandom();

    private void issueResetOtp(User user) {
        tokenRepository.markAllAsUsed(user);

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(otp);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(token);

        emailService.sendPasswordResetOtp(user, otp, 15);

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("A password reset OTP was sent to your email. Check your inbox.");
        notification.setType("approved");
        notificationRepository.save(notification);

        log.info("Password reset OTP sent to {}", user.getEmail());
    }

    private PasswordResetToken validateResetOtp(String email, String otpValue) {
        String normalizedEmail = email.trim().toLowerCase();
        String normalizedOtp = otpValue.trim();

        PasswordResetToken token = tokenRepository
                .findByUserEmailAndTokenAndUsedFalse(normalizedEmail, normalizedOtp)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired. Request a new one from the forgot password page.");
        }

        return token;
    }

    private String buildAvatar(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) sb.append(part.charAt(0));
        }
        return sb.toString().toUpperCase().substring(0, Math.min(2, sb.length()));
    }
}
