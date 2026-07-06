package com.innovationhub.rw.controller;

import com.innovationhub.rw.repository.*;
import com.innovationhub.rw.entity.Role;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final StartupApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final OpportunityRepository opportunityRepository;
    private final EventRepository eventRepository;
    private final InvestmentRepository investmentRepository;

    public PublicController(
            StartupApplicationRepository applicationRepository,
            UserRepository userRepository,
            OpportunityRepository opportunityRepository,
            EventRepository eventRepository,
            InvestmentRepository investmentRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.opportunityRepository = opportunityRepository;
        this.eventRepository = eventRepository;
        this.investmentRepository = investmentRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        long total = applicationRepository.count();
        long investors = userRepository.findByRole(Role.INVESTOR).size();
        long fundingVolume = investmentRepository.findAll().stream()
                .mapToLong(i -> i.getAmount() != null ? i.getAmount() : 0)
                .sum();
        long approved = applicationRepository.countByStatus("Approved")
                + applicationRepository.countByStatus("In Incubation")
                + applicationRepository.countByStatus("Seeking Funding")
                + applicationRepository.countByStatus("Funded")
                + applicationRepository.countByStatus("Graduated");
        return Map.of(
                "totalStartups", total,
                "activeInvestors", investors,
                "successRate", total > 0 ? Math.round(approved * 100.0 / total) : 0,
                "fundingVolume", fundingVolume
        );
    }

    @GetMapping("/opportunities")
    public Object opportunities() {
        return opportunityRepository.findAll();
    }

    @GetMapping("/events")
    public Object events() {
        return eventRepository.findAll();
    }
}
