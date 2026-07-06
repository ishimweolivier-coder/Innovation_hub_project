package com.innovationhub.rw.config;

import com.innovationhub.rw.entity.*;
import com.innovationhub.rw.repository.*;
import com.innovationhub.rw.service.AiEngineService;
import com.innovationhub.rw.service.DocumentService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StartupApplicationRepository applicationRepository;
    private final OpportunityRepository opportunityRepository;
    private final EventRepository eventRepository;
    private final NotificationRepository notificationRepository;
    private final ConversationRepository conversationRepository;
    private final InvestmentRepository investmentRepository;
    private final InvestorMatchRepository investorMatchRepository;
    private final AiEngineService aiEngineService;
    private final DocumentService documentService;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            StartupApplicationRepository applicationRepository,
            OpportunityRepository opportunityRepository,
            EventRepository eventRepository,
            NotificationRepository notificationRepository,
            ConversationRepository conversationRepository,
            InvestmentRepository investmentRepository,
            InvestorMatchRepository investorMatchRepository,
            AiEngineService aiEngineService,
            DocumentService documentService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.opportunityRepository = opportunityRepository;
        this.eventRepository = eventRepository;
        this.notificationRepository = notificationRepository;
        this.conversationRepository = conversationRepository;
        this.investmentRepository = investmentRepository;
        this.investorMatchRepository = investorMatchRepository;
        this.aiEngineService = aiEngineService;
        this.documentService = documentService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        String demoPassword = passwordEncoder.encode("demo123");

        User entrepreneur = createUser("Jean Baptiste Uwimana", "jean@startup.rw", demoPassword, Role.ENTREPRENEUR, "JU", null, null, 65);
        User investor = createUser("Sarah Mukamana", "sarah@invest.rw", demoPassword, Role.INVESTOR, "SM", "Kigali Ventures", "Venture Capital", 70);
        User admin = createUser("Admin User", "admin@innovationhub.rw", demoPassword, Role.ADMIN, "AU", null, null, null);
        createUser("olivier Ishimwe", "olivierishimwe006@gmail.com", passwordEncoder.encode("@olivier"), Role.ADMIN, "OI", null, null, null);

        User kigaliAngels = createUser("Kigali Angels", "angels@invest.rw", demoPassword, Role.INVESTOR, "KA", "Kigali Angels Network", "Angel Investor", 65);
        User eastAfricaFund = createUser("East Africa Fund", "eaf@invest.rw", demoPassword, Role.INVESTOR, "EF", "EAF Partners", "Development Finance", 72);
        User rwandaInnovationFund = createUser("Rwanda Innovation Fund", "rif@invest.rw", demoPassword, Role.INVESTOR, "RF", "RIF", "Government Fund", 75);

        User alice = createUser("Alice Uwase", "alice@startup.rw", demoPassword, Role.ENTREPRENEUR, "AU", null, null, null);
        User patrick = createUser("Patrick Nshimiyimana", "patrick@startup.rw", demoPassword, Role.ENTREPRENEUR, "PN", null, null, null);
        User marie = createUser("Marie Claire Ingabire", "marie@startup.rw", demoPassword, Role.ENTREPRENEUR, "MI", null, null, null);
        User emmanuel = createUser("Emmanuel Habimana", "emmanuel@startup.rw", demoPassword, Role.ENTREPRENEUR, "EH", null, null, null);

        seedOpportunities();
        seedEvents();

        seedStartup(entrepreneur, "AgriSmart Rwanda", "AgriTech",
                "IoT-powered smart farming solutions helping smallholder farmers increase yield by 40% through precision agriculture.",
                "Seeking Funding", 5, 15_000_000L, 8_000_000L, LocalDate.parse("2025-11-15"),
                "/images/startup-agritech.jpg", 8_000_000L, 12_000_000L, WorkflowStage.ADMIN_REVIEW, true);

        seedStartup(alice, "MedConnect", "HealthTech",
                "Telemedicine platform connecting rural patients with specialists across Rwanda and East Africa.",
                "In Incubation", 4, 25_000_000L, 5_000_000L, LocalDate.parse("2025-10-20"),
                "/images/startup-healthtech.jpg", 10_000_000L, 18_000_000L, WorkflowStage.ADMIN_REVIEW, true);

        seedStartup(patrick, "EduBridge", "EdTech",
                "Digital learning platform providing STEM education to underserved communities in Rwanda.",
                "Approved", 3, 10_000_000L, 0L, LocalDate.parse("2026-01-05"),
                "/images/startup-edtech.jpg", 4_000_000L, 8_000_000L, WorkflowStage.FUNDING_DECISION, true);

        seedStartup(marie, "GreenPay", "FinTech",
                "Mobile payment solution for green energy subscriptions in off-grid communities.",
                "Under Review", 2, 20_000_000L, 0L, LocalDate.parse("2026-02-10"),
                "/images/startup-fintech.jpg", 8_000_000L, 16_000_000L, WorkflowStage.ADMIN_REVIEW, false);

        seedStartup(emmanuel, "CraftRwanda", "Creative Industries",
                "E-commerce marketplace connecting Rwandan artisans with global buyers.",
                "Funded", 6, 8_000_000L, 8_000_000L, LocalDate.parse("2025-08-01"),
                "/images/startup-creative.jpg", 3_200_000L, 15_000_000L, WorkflowStage.FUNDING_DECISION, true);

        seedNotifications(entrepreneur);
        seedConversations(entrepreneur, investor, admin);
        seedInvestments(investor, kigaliAngels, eastAfricaFund, applicationRepository.findAll());
        seedMedConnectInvestorThread(alice, eastAfricaFund);
    }

    private User createUser(String name, String email, String password, Role role, String avatar,
                            String company, String investorType, Integer minInnovation) {
        User user = new User();
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(password);
        user.setRole(role);
        user.setAvatar(avatar);
        user.setCompany(company);
        user.setInvestorType(investorType);
        user.setMinInnovation(minInnovation);
        user.setStatus(UserStatus.ACTIVE);
        user.setJoined(LocalDate.now().minusMonths(3));
        return userRepository.save(user);
    }

    private StartupApplication seedStartup(User founder, String name, String category, String description,
                                           String status, int stage, long fundingGoal, long fundingRaised,
                                           LocalDate createdAt, String image, long budgetAmount,
                                           long projectedProfit, WorkflowStage workflowStage, boolean runAi) {
        StartupApplication app = new StartupApplication();
        app.setName(name);
        app.setFounder(founder);
        app.setCategory(category);
        app.setDescription(description);
        app.setStatus(status);
        app.setStage(stage);
        app.setFundingGoal(fundingGoal);
        app.setFundingRaised(fundingRaised);
        app.setCreatedAt(createdAt);
        app.setImage(image);
        app.setBusinessPlan(name.toLowerCase().replace(" ", "-") + "-plan.pdf");
        app.setBudget(name.toLowerCase().replace(" ", "-") + "-budget.pdf");
        app.setBudgetAmount(budgetAmount);
        app.setProjectedProfit(projectedProfit);
        app.setWorkflowStage(workflowStage);
        applicationRepository.save(app);

        try {
            documentService.seedDocuments(app);
            applicationRepository.save(app);
        } catch (Exception ignored) {
            // documents optional during seed
        }

        if (runAi) {
            var investors = userRepository.findByRole(Role.INVESTOR);
            var result = aiEngineService.evaluate(app, investors);
            app.setAiAssessment(result.assessment());
            result.assessment().setApplication(app);
            applicationRepository.save(app);

            for (var matchDto : result.investorMatches()) {
                User inv = userRepository.findById(matchDto.id()).orElseThrow();
                InvestorMatch match = new InvestorMatch();
                match.setApplication(app);
                match.setInvestor(inv);
                match.setMatchScore(matchDto.matchScore());
                match.setCategoryFit(matchDto.categoryFit());
                investorMatchRepository.save(match);
            }
        }

        return app;
    }

    private void seedOpportunities() {
        saveOpportunity("Youth Innovation Grant 2026", "Grant",
                "RWF 5M grant for youth-led startups addressing climate change challenges.",
                LocalDate.parse("2026-04-30"), "MINEDUC Rwanda", "/images/opp-grant.jpg");
        saveOpportunity("Hanga Pitchfest 2026", "Competition",
                "National startup competition with RWF 20M prize pool and mentorship.",
                LocalDate.parse("2026-05-15"), "RDB", "/images/opp-competition.jpg");
        saveOpportunity("STEM Scholarship Program", "Scholarship",
                "Full scholarship for tech entrepreneurs pursuing advanced degrees.",
                LocalDate.parse("2026-03-31"), "University of Rwanda", "/images/opp-scholarship.jpg");
        saveOpportunity("Kigali Innovation Hub Incubation", "Incubation",
                "6-month incubation program with workspace, mentorship, and seed funding.",
                LocalDate.parse("2026-06-01"), "Kigali Innovation City", "/images/opp-incubation.jpg");
    }

    private void saveOpportunity(String title, String type, String desc, LocalDate deadline, String org, String image) {
        Opportunity o = new Opportunity();
        o.setTitle(title);
        o.setType(type);
        o.setDescription(desc);
        o.setDeadline(deadline);
        o.setOrganization(org);
        o.setImage(image);
        opportunityRepository.save(o);
    }

    private void seedEvents() {
        saveEvent("Startup Weekend Kigali", "Event", LocalDate.parse("2026-04-12"),
                "Kigali Convention Centre", "54-hour event where developers, designers, and entrepreneurs build startups.",
                "/images/event-startup-weekend.jpg");
        saveEvent("Business Plan Writing Workshop", "Workshop", LocalDate.parse("2026-03-28"),
                "Online", "Learn to craft compelling business plans that attract investors.",
                "/images/event-workshop.jpg");
        saveEvent("Investor Readiness Training", "Training", LocalDate.parse("2026-04-05"),
                "Norrsken House Kigali", "Prepare your startup for due diligence and investor meetings.",
                "/images/event-training.jpg");
    }

    private void saveEvent(String title, String type, LocalDate date, String location, String desc, String image) {
        Event e = new Event();
        e.setTitle(title);
        e.setType(type);
        e.setDate(date);
        e.setLocation(location);
        e.setDescription(desc);
        e.setImage(image);
        eventRepository.save(e);
    }

    private void seedNotifications(User entrepreneur) {
        saveNotification(entrepreneur, "Your application for AgriSmart Rwanda has been approved!", "approved", false, 2);
        saveNotification(entrepreneur, "New opportunity: Youth Innovation Grant 2026 is now open.", "opportunity", false, 5);
        saveNotification(entrepreneur, "Investor Sarah Mukamana expressed interest in your startup.", "interest", true, 24);
        saveNotification(entrepreneur, "AI evaluation completed for your business plan.", "ai", true, 48);
    }

    private void saveNotification(User user, String message, String type, boolean read, int hoursAgo) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setType(type);
        n.setRead(read);
        n.setCreatedAt(LocalDateTime.now().minusHours(hoursAgo));
        notificationRepository.save(n);
    }

    private void seedConversations(User entrepreneur, User investor, User admin) {
        Conversation c1 = new Conversation();
        c1.setUser(entrepreneur);
        c1.setParticipant(investor);
        c1.setParticipantRoleLabel("Investor · Kigali Ventures");
        c1.setUnread(2);
        c1.setOnline(true);
        conversationRepository.save(c1);
        addMessage(c1, investor, "Hello Jean, I came across AgriSmart Rwanda on the platform.", LocalDateTime.now().minusDays(1).minusHours(2));
        addMessage(c1, entrepreneur, "Thank you Sarah! We are excited about the traction we are getting.", LocalDateTime.now().minusDays(1).minusHours(1));
        addMessage(c1, investor, "I reviewed your AI evaluation. Can we schedule a call?", LocalDateTime.now().minusHours(2));

        Conversation c2 = new Conversation();
        c2.setUser(entrepreneur);
        c2.setParticipant(admin);
        c2.setParticipantRoleLabel("Innovation Hub Team");
        c2.setUnread(0);
        c2.setOnline(true);
        conversationRepository.save(c2);
        addMessage(c2, admin, "Congratulations! Your startup application has been approved.", LocalDateTime.now().minusDays(2));
        addMessage(c2, admin, "Your application has moved to Seeking Funding stage.", LocalDateTime.now().minusDays(1));
        addMessage(c2, entrepreneur, "Thank you for the update!", LocalDateTime.now().minusDays(1).plusMinutes(30));

        Conversation c3 = new Conversation();
        c3.setUser(admin);
        c3.setParticipant(entrepreneur);
        c3.setParticipantRoleLabel("Entrepreneur · AgriSmart Rwanda");
        c3.setUnread(1);
        c3.setOnline(true);
        conversationRepository.save(c3);
        addMessage(c3, entrepreneur, "Hi Admin, I have a question about my funding application status.", LocalDateTime.now().minusHours(5));
        addMessage(c3, admin, "Hello Jean, I'll review your file and get back to you shortly.", LocalDateTime.now().minusHours(3));

        Conversation c4 = new Conversation();
        c4.setUser(admin);
        c4.setParticipant(investor);
        c4.setParticipantRoleLabel("Investor · Kigali Ventures");
        c4.setUnread(0);
        c4.setOnline(true);
        conversationRepository.save(c4);
        addMessage(c4, investor, "I'd like to discuss co-investment opportunities on the platform.", LocalDateTime.now().minusDays(3));
        addMessage(c4, admin, "Thank you Sarah, let's schedule a briefing call this week.", LocalDateTime.now().minusDays(2));
    }

    private void addMessage(Conversation conversation, User sender, String text, LocalDateTime time) {
        Message m = new Message();
        m.setConversation(conversation);
        m.setSender(sender);
        m.setText(text);
        m.setCreatedAt(time);
        conversation.getMessages().add(m);
        conversationRepository.save(conversation);
    }

    private void seedInvestments(User sarah, User angels, User eaf, java.util.List<StartupApplication> startups) {
        StartupApplication agrismart = startups.stream().filter(s -> s.getName().equals("AgriSmart Rwanda")).findFirst().orElse(null);
        StartupApplication craft = startups.stream().filter(s -> s.getName().equals("CraftRwanda")).findFirst().orElse(null);
        StartupApplication med = startups.stream().filter(s -> s.getName().equals("MedConnect")).findFirst().orElse(null);

        if (agrismart != null) saveInvestment(sarah, agrismart, 5_000_000L, LocalDate.parse("2026-01-20"), "Active");
        if (craft != null) saveInvestment(angels, craft, 8_000_000L, LocalDate.parse("2025-11-10"), "Active");
        if (med != null) saveInvestment(eaf, med, 5_000_000L, LocalDate.parse("2025-12-05"), "Pending");
    }

    private void saveInvestment(User investor, StartupApplication startup, long amount, LocalDate date, String status) {
        Investment inv = new Investment();
        inv.setInvestor(investor);
        inv.setStartup(startup);
        inv.setAmount(amount);
        inv.setDate(date);
        inv.setStatus(status);
        investmentRepository.save(inv);
    }

    private void seedMedConnectInvestorThread(User alice, User eastAfricaFund) {
        StartupApplication med = applicationRepository.findAll().stream()
                .filter(s -> "MedConnect".equals(s.getName()))
                .findFirst()
                .orElse(null);
        if (med == null) return;

        Conversation c = new Conversation();
        c.setUser(alice);
        c.setParticipant(eastAfricaFund);
        c.setStartup(med);
        c.setParticipantRoleLabel("Investor · EAF Partners");
        c.setOnline(true);
        conversationRepository.save(c);

        addMessage(c, eastAfricaFund, "Hello Alice, MedConnect aligns with our health portfolio. We are interested in learning more.", LocalDateTime.now().minusDays(20));
        addMessage(c, alice, "Thank you! We have strong traction in rural telemedicine and would welcome a partnership discussion.", LocalDateTime.now().minusDays(19));
        addMessage(c, eastAfricaFund, "We agree to proceed with a RWF 5M investment commitment pending final due diligence.", LocalDateTime.now().minusDays(10));
        addMessage(c, alice, "Wonderful — we accept and look forward to closing the funding round together.", LocalDateTime.now().minusDays(9));
    }
}
