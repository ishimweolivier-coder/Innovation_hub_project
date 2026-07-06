package com.innovationhub.rw.service;

import com.innovationhub.rw.dto.CreateInvestmentRequest;
import com.innovationhub.rw.entity.Investment;
import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.entity.StartupApplication;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.repository.InvestmentRepository;
import com.innovationhub.rw.repository.StartupApplicationRepository;
import com.innovationhub.rw.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final StartupApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public InvestmentService(
            InvestmentRepository investmentRepository,
            StartupApplicationRepository applicationRepository,
            UserRepository userRepository
    ) {
        this.investmentRepository = investmentRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listForUser(User user) {
        return investmentRepository.findAllWithDetails().stream()
                .filter(i -> user.getRole() == Role.ADMIN
                        || (user.getRole() == Role.INVESTOR && i.getInvestor().getId().equals(user.getId())))
                .map(this::toMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> create(CreateInvestmentRequest request, User actor) {
        StartupApplication startup = applicationRepository.findById(request.startupId())
                .orElseThrow(() -> new IllegalArgumentException("Startup not found"));

        User investor;
        if (actor.getRole() == Role.ADMIN) {
            if (request.investorId() == null) {
                throw new IllegalArgumentException("investorId is required for admin investment creation");
            }
            investor = userRepository.findById(request.investorId())
                    .orElseThrow(() -> new IllegalArgumentException("Investor not found"));
            if (investor.getRole() != Role.INVESTOR) {
                throw new IllegalArgumentException("Selected user is not an investor");
            }
        } else if (actor.getRole() == Role.INVESTOR) {
            investor = actor;
        } else {
            throw new IllegalArgumentException("Only investors or admins can record investments");
        }

        String status = normalizeStatus(request.status());
        if (actor.getRole() != Role.ADMIN) {
            status = "Pending";
        }

        Investment investment = new Investment();
        investment.setInvestor(investor);
        investment.setStartup(startup);
        investment.setAmount(request.amount());
        investment.setDate(LocalDate.now());
        investment.setStatus(status);
        investmentRepository.save(investment);

        if ("Active".equalsIgnoreCase(status)) {
            syncFundingRaised(startup.getId());
        }

        return toMap(investment);
    }

    @Transactional
    public Map<String, Object> updateStatus(Long id, String status) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Investment not found"));

        investment.setStatus(normalizeStatus(status));
        investmentRepository.save(investment);
        syncFundingRaised(investment.getStartup().getId());
        return toMap(investment);
    }

    @Transactional
    public void syncFundingRaised(Long startupId) {
        StartupApplication startup = applicationRepository.findById(startupId)
                .orElseThrow(() -> new IllegalArgumentException("Startup not found"));
        long total = investmentRepository.sumActiveAmountByStartupId(startupId);
        startup.setFundingRaised(total);
        applicationRepository.save(startup);
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Pending";
        }
        return switch (status.toLowerCase()) {
            case "active", "approved" -> "Active";
            case "rejected", "cancelled" -> "Rejected";
            default -> "Pending";
        };
    }

    public Map<String, Object> toMap(Investment i) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", i.getId());
        row.put("investor", i.getInvestor().getFullName());
        row.put("investorId", i.getInvestor().getId());
        row.put("startup", i.getStartup().getName());
        row.put("startupId", i.getStartup().getId());
        row.put("amount", i.getAmount());
        row.put("date", i.getDate() != null ? i.getDate().toString() : "");
        row.put("status", i.getStatus());
        return row;
    }
}
