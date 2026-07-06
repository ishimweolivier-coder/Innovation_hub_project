package com.innovationhub.rw.controller;

import com.innovationhub.rw.entity.Announcement;
import com.innovationhub.rw.entity.Notification;
import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.repository.AnnouncementRepository;
import com.innovationhub.rw.repository.NotificationRepository;
import com.innovationhub.rw.repository.UserRepository;
import com.innovationhub.rw.service.EmailService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public AnnouncementController(
            AnnouncementRepository announcementRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            EmailService emailService
    ) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return announcementRepository.findAllByOrderByDateDesc().stream()
                .map(this::toDto)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Map<String, Object> create(@RequestBody Announcement announcement) {
        announcement.setStatus("Published");
        Announcement saved = announcementRepository.save(announcement);

        userRepository.findAll().stream()
                .filter(u -> matchesAudience(u, saved.getAudience()))
                .forEach(u -> {
                    Notification n = new Notification();
                    n.setUser(u);
                    n.setMessage(saved.getTitle() + ": " + saved.getMessage());
                    n.setType("announcement");
                    notificationRepository.save(n);
                    emailService.sendNotification(u, saved.getTitle(), saved.getMessage());
                });

        return toDto(saved);
    }

    private boolean matchesAudience(User user, String audience) {
        if (audience == null || "all".equals(audience)) return true;
        if ("entrepreneurs".equals(audience)) return user.getRole() == Role.ENTREPRENEUR;
        if ("investors".equals(audience)) return user.getRole() == Role.INVESTOR;
        return true;
    }

    private Map<String, Object> toDto(Announcement a) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", a.getId());
        dto.put("title", a.getTitle());
        dto.put("message", a.getMessage());
        dto.put("audience", formatAudience(a.getAudience()));
        dto.put("date", a.getDate() != null ? a.getDate().toString() : "");
        dto.put("status", a.getStatus());
        return dto;
    }

    private String formatAudience(String audience) {
        if (audience == null || "all".equals(audience)) return "All Users";
        if ("entrepreneurs".equals(audience)) return "Entrepreneurs Only";
        if ("investors".equals(audience)) return "Investors Only";
        return audience;
    }
}
