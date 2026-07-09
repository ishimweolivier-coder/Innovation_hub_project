package com.innovationhub.rw.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.innovationhub.rw.dto.AdminCreateUserRequest;
import com.innovationhub.rw.dto.AdminUpdateUserRequest;
import com.innovationhub.rw.entity.Notification;
import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.entity.UserStatus;
import com.innovationhub.rw.repository.NotificationRepository;
import com.innovationhub.rw.repository.PasswordResetTokenRepository;
import com.innovationhub.rw.repository.UserRepository;

import jakarta.persistence.EntityManager;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final EntityManager entityManager;

    public AdminUserService(
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            EmailService emailService,
            EntityManager entityManager
    ) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toMap)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Role role = Role.fromFrontend(request.role());
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

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Your Innovation Hub account was created by an administrator. Please sign in and change your password.");
        notification.setType("approved");
        notificationRepository.save(notification);

        return toMap(user);
    }

    @Transactional
    public Map<String, Object> updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setRole(Role.fromFrontend(request.role()));
        user.setPhone(request.phone());
        user.setCompany(request.company());
        user.setInvestorType(request.investorType());
        if (request.status() != null) {
            user.setStatus("Suspended".equalsIgnoreCase(request.status()) ? UserStatus.SUSPENDED : UserStatus.ACTIVE);
        }

        userRepository.save(user);
        return toMap(user);
    }

    @Transactional
    public void deleteUser(Long id, Long adminId) {
        if (id.equals(adminId)) {
            throw new IllegalArgumentException("You cannot delete your own account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

        boolean isSuperAdmin = "olivierishimwe006@gmail.com".equalsIgnoreCase(admin.getEmail());

        if (user.getRole() == Role.ADMIN && !isSuperAdmin) {
            long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Cannot delete the last administrator");
            }
        }

        if (user.getRole() == Role.ADMIN && !isSuperAdmin) {
            throw new IllegalArgumentException("Only the super administrator can delete admin users");
        }

        // Remove all FK references before deleting the user
        // Order matters: child tables first, then parents

        // 1. Messages referencing user's conversations
        entityManager.createNativeQuery("DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = :id OR participant_id = :id)")
                .setParameter("id", id).executeUpdate();

        // 2. Conversations referencing user's startups
        entityManager.createNativeQuery("DELETE FROM conversations WHERE startup_id IN (SELECT id FROM startup_applications WHERE founder_id = :id)")
                .setParameter("id", id).executeUpdate();

        // 3. Conversations where user is owner or participant
        entityManager.createNativeQuery("DELETE FROM conversations WHERE user_id = :id OR participant_id = :id")
                .setParameter("id", id).executeUpdate();

        // 4. Investor matches referencing user's startups
        entityManager.createNativeQuery("DELETE FROM investor_matches WHERE application_id IN (SELECT id FROM startup_applications WHERE founder_id = :id)")
                .setParameter("id", id).executeUpdate();

        // 5. Investor matches where user is the investor
        entityManager.createNativeQuery("DELETE FROM investor_matches WHERE investor_id = :id")
                .setParameter("id", id).executeUpdate();

        // 6. Startup interests that reference user's startups
        entityManager.createNativeQuery("DELETE FROM startup_interests WHERE startup_id IN (SELECT id FROM startup_applications WHERE founder_id = :id)")
                .setParameter("id", id).executeUpdate();

        // 7. AI assessments for user's startups
        entityManager.createNativeQuery("DELETE FROM ai_assessments WHERE application_id IN (SELECT id FROM startup_applications WHERE founder_id = :id)")
                .setParameter("id", id).executeUpdate();

        // 8. Startups founded by user
        entityManager.createNativeQuery("DELETE FROM startup_applications WHERE founder_id = :id")
                .setParameter("id", id).executeUpdate();

        // 9. Investments made by user
        entityManager.createNativeQuery("DELETE FROM investments WHERE investor_id = :id")
                .setParameter("id", id).executeUpdate();

        // 10. Opportunity applications by user
        entityManager.createNativeQuery("DELETE FROM opportunity_applications WHERE user_id = :id")
                .setParameter("id", id).executeUpdate();

        // 11. Event registrations
        entityManager.createNativeQuery("DELETE FROM event_registrations WHERE user_id = :id")
                .setParameter("id", id).executeUpdate();

        // 12. Startup interests where user is investor
        entityManager.createNativeQuery("DELETE FROM startup_interests WHERE investor_id = :id")
                .setParameter("id", id).executeUpdate();

        // 13. Notifications
        entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :id")
                .setParameter("id", id).executeUpdate();

        // 14. Password reset tokens
        entityManager.createNativeQuery("DELETE FROM password_reset_tokens WHERE user_id = :id")
                .setParameter("id", id).executeUpdate();

        // 15. Admin login OTPs
        entityManager.createNativeQuery("DELETE FROM admin_login_otps WHERE user_id = :id")
                .setParameter("id", id).executeUpdate();

        userRepository.delete(user);
    }

    @Transactional
    public Map<String, String> updateStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus("Suspended".equalsIgnoreCase(status) ? UserStatus.SUSPENDED : UserStatus.ACTIVE);
        userRepository.save(user);
        return Map.of("status", user.getStatus() == UserStatus.ACTIVE ? "Active" : "Suspended");
    }

    @Transactional
    public Map<String, String> requestPasswordReset(Long id, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        tokenRepository.markAllAsUsed(user);

        String resetToken = java.util.UUID.randomUUID().toString().replace("-", "");
        com.innovationhub.rw.entity.PasswordResetToken token = new com.innovationhub.rw.entity.PasswordResetToken();
        token.setUser(user);
        token.setToken(resetToken);
        token.setExpiresAt(java.time.LocalDateTime.now().plusHours(24));
        tokenRepository.save(token);

        emailService.sendPasswordResetLink(user, resetToken, 24);

        String otp = otpService.generateOtp();
        emailService.sendAdminPasswordResetOtp(user, otp, otpService.getExpiryMinutes());

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("An administrator initiated a password reset. Check your email for a reset link.");
        notification.setType("approved");
        notificationRepository.save(notification);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Password reset link and verification code sent to " + user.getEmail());
        return response;
    }

    private Map<String, Object> toMap(User u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", u.getId());
        map.put("fullName", u.getFullName());
        map.put("email", u.getEmail());
        map.put("role", capitalizeRole(u.getRole()));
        map.put("status", u.getStatus() == UserStatus.ACTIVE ? "Active" : "Suspended");
        map.put("joined", u.getJoined().toString());
        map.put("phone", u.getPhone());
        map.put("company", u.getCompany());
        map.put("investorType", u.getInvestorType());
        return map;
    }

    private String capitalizeRole(Role role) {
        String r = role.toFrontend();
        return r.substring(0, 1).toUpperCase() + r.substring(1);
    }

    private String buildAvatar(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) sb.append(part.charAt(0));
        }
        return sb.length() > 0 ? sb.toString().toUpperCase().substring(0, Math.min(2, sb.length())) : "U";
    }
}
