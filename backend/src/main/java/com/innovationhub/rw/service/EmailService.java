package com.innovationhub.rw.service;

import com.innovationhub.rw.entity.User;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.InternetAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:true}")
    private boolean enabled;

    @Value("${app.mail.reply-to:innovationhub@gmail.com}")
    private String replyTo;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${app.mail.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    void validateMailConfig() {
        if (!enabled) {
            log.warn("Email sending is DISABLED (app.mail.enabled=false)");
            return;
        }
        if (smtpUsername == null || smtpUsername.isBlank()) {
            log.error("Email will NOT work — spring.mail.username is not set. Add credentials to application-local.yml");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getSmtpUsername() {
        return smtpUsername;
    }

    public void sendPasswordResetLink(User user, String token, int expiryHours) {
        String resetUrl = frontendUrl + "/reset-password?email="
                + urlEncode(user.getEmail()) + "&token=" + urlEncode(token);
        String subject = "Reset your Innovation Hub password";
        String html = """
                <p>Hello %s,</p>
                <p>We received a request to reset your password on Innovation Hub Rwanda.</p>
                <p><a href="%s" style="display:inline-block;padding:12px 24px;background:#15803d;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a></p>
                <p>Or copy this link:<br><a href="%s">%s</a></p>
                <p>This link expires in %d hours. If you did not request this, ignore this email.</p>
                <p>— Innovation Hub Rwanda</p>
                """.formatted(user.getFullName(), resetUrl, resetUrl, resetUrl, expiryHours);

        sendHtml(user.getEmail(), subject, html);
    }

    public void sendAdminLoginOtp(User user, String otp, int expiryMinutes) {
        String subject = "Your Innovation Hub admin login code";
        String html = """
                <p>Hello %s,</p>
                <p>Someone is signing in to your <strong>Admin</strong> account on Innovation Hub Rwanda.</p>
                <p style="font-size:32px;font-family:monospace;letter-spacing:8px;font-weight:bold;color:#15803d;">%s</p>
                <p>This code expires in %d minutes. If this wasn't you, change your password immediately.</p>
                <p>— Innovation Hub Rwanda</p>
                """.formatted(user.getFullName(), otp, expiryMinutes);

        sendHtml(user.getEmail(), subject, html);
    }

    public void sendAdminPasswordResetOtp(User user, String otp, int expiryMinutes) {
        String subject = "Your password reset code — Innovation Hub";
        String html = """
                <p>Hello %s,</p>
                <p>An administrator has initiated a password reset for your Innovation Hub account.</p>
                <p>Use the code below to verify this change:</p>
                <p style="font-size:32px;font-family:monospace;letter-spacing:8px;font-weight:bold;color:#15803d;">%s</p>
                <p>This code expires in %d minutes. A password reset link has also been sent to this email.</p>
                <p>If you did not request this, please contact the administrator immediately.</p>
                <p>— Innovation Hub Rwanda</p>
                """.formatted(user.getFullName(), otp, expiryMinutes);

        sendHtml(user.getEmail(), subject, html);
    }

    public void sendNotification(User user, String subject, String message) {
        String html = """
                <p>Hello %s,</p>
                <p>%s</p>
                <p><a href="%s">Sign in to Innovation Hub</a></p>
                <p>— Innovation Hub Rwanda</p>
                """.formatted(user.getFullName(), message.replace("\n", "<br>"), frontendUrl);

        sendHtml(user.getEmail(), subject, html);
    }

    private void sendHtml(String to, String subject, String htmlBody) {
        if (!enabled) {
            log.warn("Mail disabled — would send to {}: {}", to, subject);
            throw new IllegalStateException("Email is not enabled on this server.");
        }
        if (smtpUsername == null || smtpUsername.isBlank()) {
            throw new IllegalStateException("Email is not configured. Contact the administrator.");
        }

        try {
            var mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom(new InternetAddress(smtpUsername, "Innovation Hub Rwanda"));
            if (replyTo != null && !replyTo.isBlank()) {
                helper.setReplyTo(replyTo);
            }
            mailSender.send(mimeMessage);
            log.info("Email sent to {} from {}: {}", to, smtpUsername, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw new IllegalStateException("Could not send email: " + e.getMessage());
        }
    }

    private String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
