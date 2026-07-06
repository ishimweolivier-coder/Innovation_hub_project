package com.innovationhub.rw.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.expiry-minutes:15}")
    private int expiryMinutes;

    public String generateOtp() {
        int max = (int) Math.pow(10, otpLength);
        int min = max / 10;
        int code = min + random.nextInt(max - min);
        return String.format("%0" + otpLength + "d", code);
    }

    public LocalDateTime expiryTime() {
        return LocalDateTime.now().plusMinutes(expiryMinutes);
    }

    public int getExpiryMinutes() {
        return expiryMinutes;
    }
}
