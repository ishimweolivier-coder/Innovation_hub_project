package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}
