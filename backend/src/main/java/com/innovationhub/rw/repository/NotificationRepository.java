package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.Notification;
import com.innovationhub.rw.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByType(String type);
    void deleteByUser(User user);
}
