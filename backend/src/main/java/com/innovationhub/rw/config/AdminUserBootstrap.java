package com.innovationhub.rw.config;

import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.entity.UserStatus;
import com.innovationhub.rw.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    static final String EMAIL = "olivierishimwe006@gmail.com";
    static final String PASSWORD = "@olivier";
    static final String FULL_NAME = "olivier Ishimwe";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findByEmail(EMAIL).ifPresentOrElse(
                this::ensureAdmin,
                this::createAdmin
        );
    }

    private void createAdmin() {
        User user = new User();
        user.setFullName(FULL_NAME);
        user.setEmail(EMAIL);
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole(Role.ADMIN);
        user.setAvatar("OI");
        user.setStatus(UserStatus.ACTIVE);
        user.setJoined(LocalDate.now());
        userRepository.save(user);
        log.info("Created admin account for {}", EMAIL);
    }

    private void ensureAdmin(User user) {
        boolean changed = false;
        if (user.getRole() != Role.ADMIN) {
            user.setRole(Role.ADMIN);
            changed = true;
        }
        if (!FULL_NAME.equals(user.getFullName())) {
            user.setFullName(FULL_NAME);
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
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        changed = true;

        if (changed) {
            userRepository.save(user);
            log.info("Ensured admin account for {}", EMAIL);
        }
    }
}
