package com.innovationhub.rw.service;

import com.innovationhub.rw.dto.CreateInvestmentRequest;
import com.innovationhub.rw.entity.Role;
import com.innovationhub.rw.entity.StartupApplication;
import com.innovationhub.rw.entity.User;
import com.innovationhub.rw.entity.UserStatus;
import com.innovationhub.rw.repository.InvestmentRepository;
import com.innovationhub.rw.repository.StartupApplicationRepository;
import com.innovationhub.rw.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class InvestmentServiceTest {

    @Autowired
    private InvestmentService investmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StartupApplicationRepository applicationRepository;

    @Autowired
    private InvestmentRepository investmentRepository;

    @Test
    void activeInvestmentUpdatesFundingRaised() {
        User investor = new User();
        investor.setFullName("Test Investor");
        investor.setEmail("investor-test@example.com");
        investor.setPasswordHash("hash");
        investor.setRole(Role.INVESTOR);
        investor.setStatus(UserStatus.ACTIVE);
        userRepository.save(investor);

        User founder = new User();
        founder.setFullName("Test Founder");
        founder.setEmail("founder-test@example.com");
        founder.setPasswordHash("hash");
        founder.setRole(Role.ENTREPRENEUR);
        founder.setStatus(UserStatus.ACTIVE);
        userRepository.save(founder);

        StartupApplication startup = new StartupApplication();
        startup.setName("Test Startup");
        startup.setCategory("SaaS");
        startup.setDescription("Test");
        startup.setFounder(founder);
        startup.setFundingGoal(10_000_000L);
        startup.setFundingRaised(0L);
        applicationRepository.save(startup);

        User admin = new User();
        admin.setFullName("Test Admin");
        admin.setEmail("admin-test@example.com");
        admin.setPasswordHash("hash");
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        userRepository.save(admin);

        investmentService.create(
                new CreateInvestmentRequest(startup.getId(), investor.getId(), 2_000_000L, "Active"),
                admin
        );

        StartupApplication updated = applicationRepository.findById(startup.getId()).orElseThrow();
        assertEquals(2_000_000L, updated.getFundingRaised());
        assertEquals(1, investmentRepository.findAll().size());
    }
}
