package com.innovationhub.rw.config;

import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.entity.UserStatus;
import com.innovationhub.rw.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@Profile("!test")
public class AdminUserBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserBootstrap.class);

    @Value("${ADMIN_EMAIL:olivierishimwe006@gmail.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Value("${ADMIN_NAME:olivier Ishimwe}")
    private String adminName;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("ADMIN_PASSWORD not set — skipping admin bootstrap. Set ADMIN_EMAIL and ADMIN_PASSWORD env vars.");
            return;
        }
        userRepository.findByEmail(adminEmail).ifPresentOrElse(
                this::ensureAdmin,
                this::createAdmin
        );
    }

    private void createAdmin() {
        User user = new User();
        user.setFullName(adminName);
        user.setEmail(adminEmail);
        user.setPasswordHash(passwordEncoder.encode(adminPassword));
        user.setRole(Role.ADMIN);
        user.setAvatar("OI");
        user.setStatus(UserStatus.ACTIVE);
        user.setJoined(LocalDate.now());
        userRepository.save(user);
        log.info("Created admin account for {}", adminEmail);
    }

    private void ensureAdmin(User user) {
        boolean changed = false;
        if (user.getRole() != Role.ADMIN) {
            user.setRole(Role.ADMIN);
            changed = true;
        }
        if (!adminName.equals(user.getFullName())) {
            user.setFullName(adminName);
            changed = true;
        }
        if (user.getAvatar() == null || user.getAvatar().isBlank()) {
            user.setAvatar("OI");
            changed = true;
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            user.setStatus(UserStatus.ACTIVE);
            changed = true;
        }
        if (user.getPasswordHash() == null) {
            user.setPasswordHash(passwordEncoder.encode(adminPassword));
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
            log.info("Ensured admin account for {}", adminEmail);
        }
    }
}
