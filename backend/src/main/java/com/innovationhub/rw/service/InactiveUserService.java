package com.innovationhub.rw.service;

import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.entity.UserStatus;
import com.innovationhub.rw.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InactiveUserService {

    private static final Logger log = LoggerFactory.getLogger(InactiveUserService.class);

    private final UserRepository userRepository;

    @Value("${app.inactivity.days:90}")
    private int inactivityDays;

    public InactiveUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    @Scheduled(cron = "${app.inactivity.cron:0 0 3 * * ?}")
    public void markInactiveUsers() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(inactivityDays);
        List<User> users = userRepository.findAll();
        int marked = 0;

        for (User user : users) {
            if (user.getStatus() != UserStatus.ACTIVE) continue;
            if (user.getLastLoginAt() == null) {
                if (user.getCreatedAt() != null && user.getCreatedAt().isBefore(cutoff)) {
                    user.setStatus(UserStatus.INACTIVE);
                    userRepository.save(user);
                    marked++;
                }
                continue;
            }
            if (user.getLastLoginAt().isBefore(cutoff)) {
                user.setStatus(UserStatus.INACTIVE);
                userRepository.save(user);
                marked++;
            }
        }

        if (marked > 0) {
            log.info("Marked {} users as INACTIVE (no login in {} days)", marked, inactivityDays);
        }
    }
}