package com.innovationhub.rw.controller;

import com.innovationhub.rw.entity.Notification;
import com.innovationhub.rw.entity.Opportunity;
import com.innovationhub.rw.entity.OpportunityApplication;
import com.innovationhub.rw.repository.NotificationRepository;
import com.innovationhub.rw.repository.OpportunityApplicationRepository;
import com.innovationhub.rw.repository.OpportunityRepository;
import com.innovationhub.rw.security.UserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {

    private final OpportunityRepository opportunityRepository;
    private final OpportunityApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;

    public OpportunityController(
            OpportunityRepository opportunityRepository,
            OpportunityApplicationRepository applicationRepository,
            NotificationRepository notificationRepository
    ) {
        this.opportunityRepository = opportunityRepository;
        this.applicationRepository = applicationRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<Opportunity> list() {
        return opportunityRepository.findAll();
    }

    @GetMapping("/my-applications")
    public List<Long> myApplications(@AuthenticationPrincipal UserPrincipal principal) {
        return applicationRepository.findByUserId(principal.getUser().getId()).stream()
                .map(a -> a.getOpportunity().getId())
                .toList();
    }

    @PostMapping("/{id}/apply")
    @Transactional
    public Map<String, Object> apply(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));

        if (applicationRepository.existsByUserIdAndOpportunityId(principal.getUser().getId(), id)) {
            throw new IllegalArgumentException("Already applied to this opportunity");
        }

        OpportunityApplication app = new OpportunityApplication();
        app.setUser(principal.getUser());
        app.setOpportunity(opportunity);
        applicationRepository.save(app);

        Notification notification = new Notification();
        notification.setUser(principal.getUser());
        notification.setMessage("Application submitted for \"" + opportunity.getTitle() + "\". We will notify you of updates.");
        notification.setType("opportunity");
        notificationRepository.save(notification);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Application submitted successfully");
        result.put("opportunityId", id);
        return result;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Opportunity create(@RequestBody Opportunity opportunity) {
        return opportunityRepository.save(opportunity);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Opportunity update(@PathVariable Long id, @RequestBody Opportunity body) {
        Opportunity existing = opportunityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));
        existing.setTitle(body.getTitle());
        existing.setType(body.getType());
        existing.setDescription(body.getDescription());
        existing.setDeadline(body.getDeadline());
        existing.setOrganization(body.getOrganization());
        existing.setImage(body.getImage());
        return opportunityRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        opportunityRepository.deleteById(id);
    }
}
