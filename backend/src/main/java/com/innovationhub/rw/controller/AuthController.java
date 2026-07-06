package com.innovationhub.rw.controller;

import com.innovationhub.rw.dto.*;
import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.security.UserPrincipal;
import com.innovationhub.rw.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/verify-admin-otp")
    public AuthResponse verifyAdminOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return authService.verifyAdminLoginOtp(request);
    }

    @PostMapping("/resend-admin-otp")
    public Map<String, Object> resendAdminOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.resendAdminLoginOtp(request);
    }

    @PostMapping("/register/entrepreneur")
    public AuthResponse registerEntrepreneur(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request, Role.ENTREPRENEUR);
    }

    @PostMapping("/register/investor")
    public AuthResponse registerInvestor(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request, Role.INVESTOR);
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/resend-reset-link")
    public Map<String, Object> resendResetLink(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.resendResetLink(request);
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.getCurrentUser(principal.getUser());
    }
}
