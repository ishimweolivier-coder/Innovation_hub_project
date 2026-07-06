package com.innovationhub.rw.controller;

import com.innovationhub.rw.entity.Notification;
import com.innovationhub.rw.repository.NotificationRepository;
import com.innovationhub.rw.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Map<String, Object>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(principal.getUser()).stream()
                .map(this::toDto)
                .toList();
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public void markRead(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!n.getUser().getId().equals(principal.getUser().getId())) {
            throw new IllegalArgumentException("Notification not found");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @PatchMapping("/read-all")
    @Transactional
    public void markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationRepository.findByUserOrderByCreatedAtDesc(principal.getUser())
                .forEach(n -> n.setRead(true));
    }

    private Map<String, Object> toDto(Notification n) {
        return Map.of(
                "id", n.getId(),
                "message", n.getMessage(),
                "type", n.getType(),
                "read", n.isRead(),
                "time", formatRelativeTime(n.getCreatedAt())
        );
    }

    private String formatRelativeTime(LocalDateTime createdAt) {
        Duration d = Duration.between(createdAt, LocalDateTime.now());
        long hours = d.toHours();
        if (hours < 1) return "just now";
        if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        long days = d.toDays();
        return days + " day" + (days > 1 ? "s" : "") + " ago";
    }
}
