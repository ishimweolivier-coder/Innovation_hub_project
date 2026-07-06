package com.innovationhub.rw.service;

import com.innovationhub.rw.entity.User;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.InternetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final HttpClient httpClient;

    @Value("${app.mail.enabled:true}")
    private boolean enabled;

    @Value("${app.mail.reply-to:innovationhub@gmail.com}")
    private String replyTo;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.password:}")
    private String smtpPassword;

    @Value("${app.mail.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${RESEND_API_KEY:${app.mail.resend-api-key:}}")
    private String resendApiKey;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    @PostConstruct
    void validateMailConfig() {
        if (!enabled) return;
        boolean hasSmtp = smtpUsername != null && !smtpUsername.isBlank();
        boolean hasResend = resendApiKey != null && !resendApiKey.isBlank();
        if (!hasSmtp && !hasResend) {
            log.warn("Email will NOT work — set MAIL_USERNAME/MAIL_PASSWORD or RESEND_API_KEY");
        }
    }

    public boolean isEnabled() { return enabled; }

    public String getSmtpUsername() { return smtpUsername; }

    public void sendPasswordResetLink(User user, String token, int expiryHours) {
        String resetUrl = frontendUrl + "/reset-password?email="
                + urlEncode(user.getEmail()) + "&token=" + urlEncode(token);
        String html = """
                <p>Hello %s,</p>
                <p>We received a request to reset your password on Innovation Hub Rwanda.</p>
                <p><a href="%s" style="display:inline-block;padding:12px 24px;background:#15803d;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a></p>
                <p>This link expires in %d hours.</p>
                <p>— Innovation Hub Rwanda</p>
                """.formatted(user.getFullName(), resetUrl, expiryHours);
        send(user.getEmail(), "Reset your Innovation Hub password", html);
    }

    public void sendAdminLoginOtp(User user, String otp, int expiryMinutes) {
        String html = """
                <p>Hello %s,</p>
                <p>Your admin login code:</p>
                <p style="font-size:32px;font-family:monospace;letter-spacing:8px;font-weight:bold;color:#15803d;">%s</p>
                <p>Expires in %d minutes.</p>
                <p>— Innovation Hub Rwanda</p>
                """.formatted(user.getFullName(), otp, expiryMinutes);
        send(user.getEmail(), "Your Innovation Hub admin login code", html);
    }

    public void sendAdminPasswordResetOtp(User user, String otp, int expiryMinutes) {
        String html = """
                <p>Hello %s,</p>
                <p>Use the code below to reset your password:</p>
                <p style="font-size:32px;font-family:monospace;letter-spacing:8px;font-weight:bold;color:#15803d;">%s</p>
                <p>Expires in %d minutes.</p>
                <p>— Innovation Hub Rwanda</p>
                """.formatted(user.getFullName(), otp, expiryMinutes);
        send(user.getEmail(), "Your password reset code — Innovation Hub", html);
    }

    public void sendNotification(User user, String subject, String message) {
        String html = """
                <p>Hello %s,</p>
                <p>%s</p>
                <p><a href="%s">Sign in to Innovation Hub</a></p>
                <p>— Innovation Hub Rwanda</p>
                """.formatted(user.getFullName(), message.replace("\n", "<br>"), frontendUrl);
        send(user.getEmail(), subject, html);
    }

    private void send(String to, String subject, String htmlBody) {
        if (!enabled) {
            log.warn("Mail disabled — would send to {}: {}", to, subject);
            throw new IllegalStateException("Email is not enabled on this server.");
        }

        if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendViaResend(to, subject, htmlBody);
        } else if (smtpUsername != null && !smtpUsername.isBlank()) {
            sendViaSmtp(to, subject, htmlBody);
        } else {
            throw new IllegalStateException("Email is not configured. Contact the administrator.");
        }
    }

    private void sendViaSmtp(String to, String subject, String htmlBody) {
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
            log.info("Email sent via SMTP to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("SMTP failed to {}: {}", to, e.getMessage());
            throw new IllegalStateException("Could not send email: " + e.getMessage());
        }
    }

    private void sendViaResend(String to, String subject, String htmlBody) {
        try {
            String json = """
                    {"from":"Olivier Ishimwe — Innovation Hub Rwanda <onboarding@resend.dev>","to":[%s],"subject":%s,"html":%s,"reply_to":%s}
                    """.formatted(
                    escapeJson(to),
                    escapeJson(subject),
                    escapeJson(htmlBody),
                    escapeJson(replyTo));

            var request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .timeout(Duration.ofSeconds(20))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent via Resend to {}: {}", to, subject);
            } else {
                log.error("Resend API error {}: {}", response.statusCode(), response.body());
                throw new IllegalStateException("Email delivery failed (" + response.statusCode() + ")");
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Resend failed to {}: {}", to, e.getMessage());
            throw new IllegalStateException("Could not send email: " + e.getMessage());
        }
    }

    private String escapeJson(String value) {
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t") + "\"";
    }

    private String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
