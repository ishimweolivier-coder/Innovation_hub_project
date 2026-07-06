package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByUserId(Long userId);
    Optional<EventRegistration> findByUserIdAndEventId(Long userId, Long eventId);
    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    @Query("SELECT r FROM EventRegistration r JOIN FETCH r.user WHERE r.event.id = :eventId")
    List<EventRegistration> findByEventId(@Param("eventId") Long eventId);
}
