package com.innovationhub.rw.controller;

import com.innovationhub.rw.dto.AdminCreateUserRequest;
import com.innovationhub.rw.dto.AdminUpdateUserRequest;
import com.innovationhub.rw.dto.CreateInvestmentRequest;
import com.innovationhub.rw.entity.*;
import com.innovationhub.rw.repository.*;
import com.innovationhub.rw.security.UserPrincipal;
import com.innovationhub.rw.service.AdminUserService;
import com.innovationhub.rw.service.FacilitationTrackingService;
import com.innovationhub.rw.service.InvestmentService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StartupApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final InvestmentRepository investmentRepository;
    private final AdminUserService adminUserService;
    private final NotificationRepository notificationRepository;
    private final OpportunityApplicationRepository opportunityApplicationRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final InvestmentService investmentService;
    private final FacilitationTrackingService facilitationTrackingService;

    public AdminController(
            StartupApplicationRepository applicationRepository,
            UserRepository userRepository,
            InvestmentRepository investmentRepository,
            AdminUserService adminUserService,
            NotificationRepository notificationRepository,
            OpportunityApplicationRepository opportunityApplicationRepository,
            EventRegistrationRepository eventRegistrationRepository,
            InvestmentService investmentService,
            FacilitationTrackingService facilitationTrackingService
    ) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.investmentRepository = investmentRepository;
        this.adminUserService = adminUserService;
        this.notificationRepository = notificationRepository;
        this.opportunityApplicationRepository = opportunityApplicationRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.investmentService = investmentService;
        this.facilitationTrackingService = facilitationTrackingService;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        long total = applicationRepository.count();
        long approved = applicationRepository.countByStatus("Approved")
                + applicationRepository.countByStatus("In Incubation")
                + applicationRepository.countByStatus("Seeking Funding")
                + applicationRepository.countByStatus("Funded")
                + applicationRepository.countByStatus("Graduated");
        long rejected = applicationRepository.countByStatus("Rejected");
        long pending = applicationRepository.countByStatus("Under Review") + applicationRepository.countByStatus("Submitted");
        long investors = userRepository.findByRole(Role.INVESTOR).size();
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newInvestors = userRepository.findByRole(Role.INVESTOR).stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();
        long investmentRequests = notificationRepository.countByType("interest");

        long fundingVolume = investmentRepository.findAll().stream()
                .mapToLong(i -> i.getAmount() != null ? i.getAmount() : 0)
                .sum();

        Map<String, Long> categoryCounts = new HashMap<>();
        applicationRepository.findAll().forEach(a ->
                categoryCounts.merge(a.getCategory(), 1L, Long::sum));

        List<Map<String, Object>> categoryDistribution = categoryCounts.entrySet().stream()
                .map(e -> Map.<String, Object>of("name", e.getKey(), "value", e.getValue()))
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStartups", total);
        result.put("approvedStartups", approved);
        result.put("rejectedStartups", rejected);
        result.put("pendingReview", pending);
        result.put("activeInvestors", investors);
        result.put("newInvestorRegistrations", newInvestors);
        result.put("investmentRequests", investmentRequests);
        result.put("fundingVolume", fundingVolume);
        result.put("successRate", total > 0 ? Math.round(approved * 100.0 / total) : 0);
        result.put("monthlyGrowth", buildMonthlyGrowth());
        result.put("categoryDistribution", categoryDistribution);
        return result;
    }

    private List<Map<String, Object>> buildMonthlyGrowth() {
        Map<String, long[]> byMonth = new LinkedHashMap<>();
        String[] months = {"Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"};
        for (String m : months) {
            byMonth.put(m, new long[]{0, 0});
        }

        applicationRepository.findAll().forEach(app -> {
            if (app.getCreatedAt() == null) return;
            String month = app.getCreatedAt().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            if (byMonth.containsKey(month)) {
                byMonth.get(month)[0]++;
            }
        });

        investmentRepository.findAll().forEach(inv -> {
            if (inv.getDate() == null) return;
            String month = inv.getDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            if (byMonth.containsKey(month)) {
                byMonth.get(month)[1] += (inv.getAmount() != null ? inv.getAmount() : 0) / 1_000_000L;
            }
        });

        return byMonth.entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "month", e.getKey(),
                        "startups", e.getValue()[0],
                        "funding", e.getValue()[1]
                ))
                .toList();
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return adminUserService.listUsers();
    }

    @PostMapping("/users")
    public Map<String, Object> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return adminUserService.createUser(request);
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(@PathVariable Long id, @Valid @RequestBody AdminUpdateUserRequest request) {
        return adminUserService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        adminUserService.deleteUser(id, principal.getUser().getId());
        return Map.of("message", "User deleted");
    }

    @PatchMapping("/users/{id}/status")
    public Map<String, String> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return adminUserService.updateStatus(id, body.get("status"));
    }

    @PostMapping("/users/{id}/reset-password")
    public Map<String, String> requestPasswordReset(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return adminUserService.requestPasswordReset(id, principal.getUser().getId());
    }

    @GetMapping("/investors")
    public List<Map<String, Object>> investors() {
        return userRepository.findByRole(Role.INVESTOR).stream()
                .map(inv -> {
                    List<Investment> investments = investmentRepository.findByInvestor(inv);
                    long total = investments.stream().mapToLong(i -> i.getAmount() != null ? i.getAmount() : 0).sum();
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", inv.getId());
                    row.put("name", inv.getFullName());
                    row.put("company", inv.getCompany() != null ? inv.getCompany() : "");
                    row.put("type", inv.getInvestorType() != null ? inv.getInvestorType() : "Angel Investor");
                    row.put("email", inv.getEmail());
                    row.put("totalInvested", total);
                    row.put("startups", investments.size());
                    return row;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/opportunity-applications")
    public List<Map<String, Object>> opportunityApplications() {
        return opportunityApplicationRepository.findAllWithDetails().stream()
                .map(app -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", app.getId());
                    row.put("applicantName", app.getUser().getFullName());
                    row.put("applicantEmail", app.getUser().getEmail());
                    row.put("applicantId", app.getUser().getId());
                    row.put("opportunityId", app.getOpportunity().getId());
                    row.put("opportunityTitle", app.getOpportunity().getTitle());
                    row.put("opportunityType", app.getOpportunity().getType());
                    row.put("status", app.getStatus());
                    row.put("reviewNotes", app.getReviewNotes());
                    row.put("appliedAt", app.getAppliedAt() != null ? app.getAppliedAt().toString() : "");
                    row.put("reviewedAt", app.getReviewedAt() != null ? app.getReviewedAt().toString() : null);
                    return row;
                })
                .toList();
    }

    @PatchMapping("/opportunity-applications/{id}/status")
    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> reviewOpportunityApplication(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        OpportunityApplication app = opportunityApplicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        String status = body.getOrDefault("status", "Pending");
        if (!List.of("Pending", "Approved", "Rejected").contains(status)) {
            throw new IllegalArgumentException("Invalid status");
        }

        app.setStatus(status);
        app.setReviewNotes(body.get("reviewNotes"));
        app.setReviewedAt(LocalDateTime.now());
        opportunityApplicationRepository.save(app);

        Notification notification = new Notification();
        notification.setUser(app.getUser());
        notification.setMessage("Your application for \"" + app.getOpportunity().getTitle() + "\" was " + status.toLowerCase() + ".");
        notification.setType("Approved".equals(status) ? "approved" : "rejected");
        notificationRepository.save(notification);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", app.getId());
        result.put("status", app.getStatus());
        result.put("reviewNotes", app.getReviewNotes());
        return result;
    }

    @GetMapping("/events/{eventId}/registrations")
    public List<Map<String, Object>> eventRegistrations(@PathVariable Long eventId) {
        return eventRegistrationRepository.findByEventId(eventId).stream()
                .map(reg -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", reg.getId());
                    row.put("userId", reg.getUser().getId());
                    row.put("name", reg.getUser().getFullName());
                    row.put("email", reg.getUser().getEmail());
                    row.put("registeredAt", reg.getRegisteredAt() != null ? reg.getRegisteredAt().toString() : "");
                    return row;
                })
                .toList();
    }

    @PostMapping("/investments")
    public Map<String, Object> createInvestment(
            @Valid @RequestBody CreateInvestmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return investmentService.create(request, principal.getUser());
    }

    @GetMapping("/facilitation-tracking")
    public Map<String, Object> facilitationTracking(@RequestParam(required = false) Long startupId) {
        return facilitationTrackingService.buildTracking(startupId);
    }
}
