package com.innovationhub.rw.controller;

import com.innovationhub.rw.entity.Event;
import com.innovationhub.rw.entity.EventRegistration;
import com.innovationhub.rw.entity.Notification;
import com.innovationhub.rw.repository.EventRegistrationRepository;
import com.innovationhub.rw.repository.EventRepository;
import com.innovationhub.rw.repository.NotificationRepository;
import com.innovationhub.rw.security.UserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final NotificationRepository notificationRepository;

    public EventController(
            EventRepository eventRepository,
            EventRegistrationRepository registrationRepository,
            NotificationRepository notificationRepository
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Event> list() {
        return eventRepository.findAll();
    }

    @GetMapping("/my-registrations")
    public List<Long> myRegistrations(@AuthenticationPrincipal UserPrincipal principal) {
        return registrationRepository.findByUserId(principal.getUser().getId()).stream()
                .map(r -> r.getEvent().getId())
                .toList();
    }

    @PostMapping("/{id}/register")
    @Transactional
    public Map<String, Object> register(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (registrationRepository.existsByUserIdAndEventId(principal.getUser().getId(), id)) {
            throw new IllegalArgumentException("Already registered for this event");
        }

        EventRegistration reg = new EventRegistration();
        reg.setUser(principal.getUser());
        reg.setEvent(event);
        registrationRepository.save(reg);

        Notification notification = new Notification();
        notification.setUser(principal.getUser());
        notification.setMessage("You are registered for \"" + event.getTitle() + "\" on " + event.getDate());
        notification.setType("approved");
        notificationRepository.save(notification);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Successfully registered");
        result.put("eventId", id);
        return result;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Event create(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Event update(@PathVariable Long id, @RequestBody Event body) {
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        existing.setTitle(body.getTitle());
        existing.setType(body.getType());
        existing.setDate(body.getDate());
        existing.setLocation(body.getLocation());
        existing.setDescription(body.getDescription());
        existing.setImage(body.getImage());
        return eventRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        eventRepository.deleteById(id);
    }
}
