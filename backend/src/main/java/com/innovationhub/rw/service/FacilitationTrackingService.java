package com.innovationhub.rw.service;

import com.innovationhub.rw.entity.*;
import com.innovationhub.rw.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FacilitationTrackingService {

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    private final StartupApplicationRepository applicationRepository;
    private final StartupInterestRepository interestRepository;
    private final InvestmentRepository investmentRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final InvestorMatchRepository investorMatchRepository;
    private final UserRepository userRepository;
    private final CommunicationAnalysisService communicationAnalysisService;

    public FacilitationTrackingService(
            StartupApplicationRepository applicationRepository,
            StartupInterestRepository interestRepository,
            InvestmentRepository investmentRepository,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            InvestorMatchRepository investorMatchRepository,
            UserRepository userRepository,
            CommunicationAnalysisService communicationAnalysisService
    ) {
        this.applicationRepository = applicationRepository;
        this.interestRepository = interestRepository;
        this.investmentRepository = investmentRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.investorMatchRepository = investorMatchRepository;
        this.userRepository = userRepository;
        this.communicationAnalysisService = communicationAnalysisService;
    }

    @Transactional
    public Map<String, Object> buildTracking(Long startupIdFilter) {
        Map<PairKey, PairKey> pairs = new LinkedHashMap<>();

        for (StartupInterest interest : interestRepository.findAllWithDetails()) {
            if (startupIdFilter != null && !interest.getStartup().getId().equals(startupIdFilter)) {
                continue;
            }
            PairKey key = new PairKey(interest.getStartup().getId(), interest.getInvestor().getId());
            pairs.putIfAbsent(key, key);
        }

        for (Investment investment : investmentRepository.findAllWithDetails()) {
            if (startupIdFilter != null && !investment.getStartup().getId().equals(startupIdFilter)) {
                continue;
            }
            PairKey key = new PairKey(investment.getStartup().getId(), investment.getInvestor().getId());
            pairs.putIfAbsent(key, key);
        }

        List<Map<String, Object>> journeys = new ArrayList<>();
        long totalMessages = 0;
        int connectionsWithMessages = 0;
        int connectionsWithInvestment = 0;
        int fundedConnections = 0;

        for (PairKey key : pairs.values()) {
            StartupApplication startup = applicationRepository.findByIdWithDetails(key.startupId())
                    .orElse(null);
            if (startup == null) continue;

            User founder = startup.getFounder();
            User investor = userRepository.findById(key.investorId()).orElse(null);

            if (investor == null) continue;

            Optional<StartupInterest> interest = interestRepository.findByStartupIdAndInvestorId(key.startupId(), key.investorId());
            Optional<InvestorMatch> match = investorMatchRepository.findByApplicationAndInvestor(startup, investor);
            Optional<Conversation> conversationOpt = conversationRepository.findBetweenUsers(founder, investor);
            Optional<Investment> investment = investmentRepository.findByStartupAndInvestor(startup, investor);

            Conversation conversationEntity = conversationOpt.orElse(null);
            if (conversationEntity != null && conversationEntity.getStartup() == null) {
                conversationEntity.setStartup(startup);
                conversationRepository.save(conversationEntity);
            }

            long messageCount = 0;
            String firstContact = null;
            String lastContact = null;
            Long conversationId = null;

            if (conversationEntity != null) {
                conversationId = conversationEntity.getId();
                messageCount = messageRepository.countByConversationId(conversationId);
                if (messageCount > 0) {
                    connectionsWithMessages++;
                    var first = messageRepository.findFirstMessageAt(conversationId);
                    var last = messageRepository.findLastMessageAt(conversationId);
                    if (first != null) firstContact = first.format(DT);
                    if (last != null) lastContact = last.format(DT);
                }
            }

            totalMessages += messageCount;

            String investmentStatus = investment.map(Investment::getStatus).orElse(null);
            Long investmentAmount = investment.map(Investment::getAmount).orElse(null);
            String investmentDate = investment.map(i -> i.getDate() != null ? i.getDate().format(DT) : null).orElse(null);

            CommunicationAnalysisService.CommunicationAnalysisResult aiAnalysis = null;
            if (conversationEntity != null && messageCount > 0) {
                aiAnalysis = communicationAnalysisService.analyzeAndPersist(conversationEntity);
            } else if (conversationEntity != null && conversationEntity.getJourneyStatusComment() != null) {
                aiAnalysis = new CommunicationAnalysisService.CommunicationAnalysisResult(
                        conversationEntity.getCommunicationStatus(),
                        conversationEntity.getJourneyStatusComment(),
                        conversationEntity.getAiCommunicationSummary(),
                        conversationEntity.isDecisionDetected(),
                        conversationEntity.isDecisionDetected() ? "Decision recorded" : "",
                        conversationEntity.getCommunicationStatus()
                );
            } else {
                aiAnalysis = communicationAnalysisService.analyzeMessages(
                        startup, founder, investor,
                        conversationId != null ? messageRepository.findByConversationIdsWithSender(List.of(conversationId)) : List.of(),
                        investment.orElse(null)
                );
            }

            if (investment.isPresent()) {
                connectionsWithInvestment++;
                if ("Active".equals(investmentStatus) || isFunded(startup)) {
                    fundedConnections++;
                }
            }

            String currentStage = aiAnalysis != null && aiAnalysis.journeyStage() != null
                    ? aiAnalysis.journeyStage()
                    : resolveStage(interest.isPresent(), messageCount, investmentStatus, startup);
            Map<String, String> journeyStatus = aiAnalysis != null
                    ? Map.of(
                    "communicationStatus", aiAnalysis.communicationStatus(),
                    "statusComment", aiAnalysis.statusComment()
            )
                    : resolveJourneyStatus(match.isPresent(), interest.isPresent(), messageCount, investmentStatus, startup);
            List<Map<String, String>> timeline = buildTimeline(
                    startup, match, interest, messageCount, firstContact, lastContact,
                    investment, aiAnalysis, journeyStatus.get("statusComment")
            );

            Map<String, Object> journey = new LinkedHashMap<>();
            journey.put("startupId", startup.getId());
            journey.put("startupName", startup.getName());
            journey.put("founderName", founder.getFullName());
            journey.put("investorId", investor.getId());
            journey.put("investorName", investor.getFullName());
            journey.put("investorCompany", investor.getCompany());
            journey.put("aiMatched", match.isPresent());
            journey.put("aiMatchScore", match.map(InvestorMatch::getMatchScore).orElse(null));
            journey.put("interestExpressed", interest.isPresent());
            journey.put("interestDate", interest.map(i -> i.getCreatedAt().format(DT)).orElse(null));
            journey.put("conversationId", conversationId);
            journey.put("messageCount", messageCount);
            journey.put("firstContactDate", firstContact);
            journey.put("lastContactDate", lastContact);
            journey.put("investmentAmount", investmentAmount);
            journey.put("investmentStatus", investmentStatus);
            journey.put("investmentDate", investmentDate);
            journey.put("startupStatus", startup.getStatus());
            journey.put("fundingRaised", startup.getFundingRaised());
            journey.put("fundingGoal", startup.getFundingGoal());
            journey.put("fundingProgress", fundingProgress(startup));
            journey.put("currentStage", currentStage);
            journey.put("communicationStatus", journeyStatus.get("communicationStatus"));
            journey.put("statusComment", journeyStatus.get("statusComment"));
            journey.put("aiCommunicationSummary", aiAnalysis != null ? aiAnalysis.aiSummary() : null);
            journey.put("decisionDetected", aiAnalysis != null && aiAnalysis.decisionDetected());
            journey.put("decisionSummary", aiAnalysis != null ? aiAnalysis.decisionSummary() : null);
            journey.put("timeline", timeline);
            journey.put("facilitationInsight", buildJourneyInsight(startup, investor, match.isPresent(), interest.isPresent(), messageCount, investmentStatus));
            journeys.add(journey);
        }

        journeys.sort((a, b) -> String.valueOf(b.get("interestDate")).compareTo(String.valueOf(a.get("interestDate"))));

        List<Map<String, Object>> startupSummaries = buildStartupSummaries(journeys);
        Map<String, Object> summary = buildSummary(journeys, totalMessages, connectionsWithMessages, connectionsWithInvestment, fundedConnections);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("summary", summary);
        result.put("journeys", journeys);
        result.put("startupSummaries", startupSummaries);
        return result;
    }

    private List<Map<String, Object>> buildStartupSummaries(List<Map<String, Object>> journeys) {
        Map<Long, List<Map<String, Object>>> byStartup = new LinkedHashMap<>();
        for (Map<String, Object> j : journeys) {
            Long id = (Long) j.get("startupId");
            byStartup.computeIfAbsent(id, k -> new ArrayList<>()).add(j);
        }

        List<Map<String, Object>> summaries = new ArrayList<>();
        for (var entry : byStartup.entrySet()) {
            List<Map<String, Object>> rows = entry.getValue();
            Map<String, Object> first = rows.get(0);
            long messages = rows.stream().mapToLong(r -> ((Number) r.get("messageCount")).longValue()).sum();
            long invested = rows.stream()
                    .filter(r -> "Active".equals(r.get("investmentStatus")))
                    .mapToLong(r -> r.get("investmentAmount") != null ? ((Number) r.get("investmentAmount")).longValue() : 0)
                    .sum();
            long interested = rows.stream().filter(r -> Boolean.TRUE.equals(r.get("interestExpressed"))).count();

            Map<String, Object> s = new LinkedHashMap<>();
            s.put("startupId", entry.getKey());
            s.put("startupName", first.get("startupName"));
            s.put("founderName", first.get("founderName"));
            s.put("startupStatus", first.get("startupStatus"));
            s.put("fundingRaised", first.get("fundingRaised"));
            s.put("fundingGoal", first.get("fundingGoal"));
            s.put("fundingProgress", first.get("fundingProgress"));
            s.put("interestedInvestors", interested);
            s.put("activeConnections", rows.stream().filter(r -> ((Number) r.get("messageCount")).longValue() > 0).count());
            s.put("totalMessages", messages);
            s.put("totalInvested", invested);
            Map<String, String> startupStatus = resolveStartupSummaryStatus(rows, first, invested);
            s.put("communicationStatus", startupStatus.get("communicationStatus"));
            s.put("statusComment", startupStatus.get("statusComment"));
            s.put("facilitationInsight", startupStatus.get("statusComment"));
            summaries.add(s);
        }
        return summaries;
    }

    private Map<String, Object> buildSummary(
            List<Map<String, Object>> journeys,
            long totalMessages,
            int connectionsWithMessages,
            int connectionsWithInvestment,
            int fundedConnections
    ) {
        long totalStartups = applicationRepository.count();
        long startupsWithActivity = journeys.stream().map(j -> j.get("startupId")).distinct().count();
        long totalInterests = journeys.stream().filter(j -> Boolean.TRUE.equals(j.get("interestExpressed"))).count();
        long aiMatchedInterests = journeys.stream().filter(j -> Boolean.TRUE.equals(j.get("aiMatched"))).count();

        int interestToMessageRate = totalInterests > 0 ? Math.round(connectionsWithMessages * 100f / totalInterests) : 0;
        int interestToInvestmentRate = totalInterests > 0 ? Math.round(connectionsWithInvestment * 100f / totalInterests) : 0;

        long ongoingCommunications = journeys.stream()
                .filter(j -> "Communication Ongoing".equals(j.get("communicationStatus"))
                        || "Facilitation Matched".equals(j.get("communicationStatus")))
                .count();
        long fundingInProgress = journeys.stream()
                .filter(j -> {
                    String s = (String) j.get("communicationStatus");
                    return "Funding In Progress".equals(s) || "Idea Acquired / Funding In Progress".equals(s);
                })
                .count();
        long completedDeals = journeys.stream()
                .filter(j -> "Deal Completed".equals(j.get("communicationStatus")))
                .count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalStartups", totalStartups);
        summary.put("startupsWithInvestorActivity", startupsWithActivity);
        summary.put("totalInterests", totalInterests);
        summary.put("aiMatchedConnections", aiMatchedInterests);
        summary.put("connectionsWithMessages", connectionsWithMessages);
        summary.put("totalMessages", totalMessages);
        summary.put("connectionsWithInvestment", connectionsWithInvestment);
        summary.put("fundedConnections", fundedConnections);
        summary.put("interestToMessageRate", interestToMessageRate);
        summary.put("interestToInvestmentRate", interestToInvestmentRate);
        summary.put("ongoingCommunications", ongoingCommunications);
        summary.put("fundingInProgress", fundingInProgress);
        summary.put("completedDeals", completedDeals);
        summary.put("platformNarrative", buildPlatformNarrative(
                totalStartups, startupsWithActivity, totalInterests, connectionsWithMessages,
                totalMessages, connectionsWithInvestment, fundedConnections, interestToMessageRate, interestToInvestmentRate
        ));
        summary.put("aiFacilitationInsight", buildAiInsight(journeys, totalInterests, connectionsWithMessages, connectionsWithInvestment));
        return summary;
    }

    private Map<String, String> resolveJourneyStatus(
            boolean aiMatched,
            boolean hasInterest,
            long messageCount,
            String investmentStatus,
            StartupApplication startup
    ) {
        Map<String, String> result = new LinkedHashMap<>();
        String matchNote = aiMatched ? "AI facilitation match confirmed" : "Platform facilitation match confirmed";
        int progress = fundingProgress(startup);

        if (isFunded(startup) || ("Active".equals(investmentStatus) && progress >= 100)) {
            result.put("communicationStatus", "Deal Completed");
            result.put("statusComment",
                    "Startup fully funded — investor partnership secured through Innovation Hub. " +
                    matchNote + "; deal completed, communication journey closed.");
        } else if ("Active".equals(investmentStatus)) {
            result.put("communicationStatus", "Idea Acquired / Funding In Progress");
            result.put("statusComment",
                    "Investor has acquired stake in this startup — " + matchNote.toLowerCase() + ". " +
                    "Funding in progress (" + progress + "% of goal raised).");
        } else if ("Pending".equals(investmentStatus)) {
            result.put("communicationStatus", "Funding In Progress");
            result.put("statusComment", messageCount > 0
                    ? "Communication " + (messageCount > 2 ? "still ongoing" : "recorded") +
                    " — investment commitment submitted. " + matchNote + "; funding in progress."
                    : matchNote + " — investment pending approval. Funding in progress.");
        } else if (messageCount > 0) {
            result.put("communicationStatus", "Communication Ongoing");
            result.put("statusComment",
                    "Communication still ongoing — " + matchNote.toLowerCase() +
                    ". Entrepreneur and investor actively engaged (" + messageCount + " messages); funding in progress.");
        } else if (hasInterest) {
            result.put("communicationStatus", "Facilitation Matched");
            result.put("statusComment",
                    matchNote + " — investor expressed interest. Communication not yet started; funding pending.");
        } else {
            result.put("communicationStatus", "Facilitation Matched");
            result.put("statusComment",
                    matchNote + " — platform connection recorded. Engagement and funding in progress.");
        }
        return result;
    }

    private Map<String, String> resolveStartupSummaryStatus(
            List<Map<String, Object>> rows,
            Map<String, Object> first,
            long invested
    ) {
        Map<String, String> result = new LinkedHashMap<>();
        int progress = first.get("fundingProgress") != null ? ((Number) first.get("fundingProgress")).intValue() : 0;
        String startupStatus = String.valueOf(first.get("startupStatus"));
        long totalMessages = rows.stream().mapToLong(r -> ((Number) r.get("messageCount")).longValue()).sum();
        boolean anyCompleted = rows.stream().anyMatch(r -> "Deal Completed".equals(r.get("communicationStatus")));
        boolean anyAcquired = rows.stream().anyMatch(r -> "Idea Acquired / Funding In Progress".equals(r.get("communicationStatus")));
        boolean anyFunding = rows.stream().anyMatch(r -> "Funding In Progress".equals(r.get("communicationStatus")));
        boolean anyOngoing = rows.stream().anyMatch(r -> "Communication Ongoing".equals(r.get("communicationStatus")));

        if (anyCompleted || "Funded".equals(startupStatus) || "Graduated".equals(startupStatus) || progress >= 100) {
            result.put("communicationStatus", "Deal Completed");
            result.put("statusComment",
                    first.get("startupName") + ": Startup funded through platform facilitation — investor partnership secured. Communication journey complete.");
        } else if (anyAcquired || invested > 0) {
            result.put("communicationStatus", "Idea Acquired / Funding In Progress");
            result.put("statusComment",
                    first.get("startupName") + ": Investor(s) acquired stake — facilitation matched successfully. Funding in progress (" + progress + "% raised).");
        } else if (anyFunding) {
            result.put("communicationStatus", "Funding In Progress");
            result.put("statusComment",
                    first.get("startupName") + ": Investment commitment in progress — facilitation matched; funding pipeline active.");
        } else if (anyOngoing || totalMessages > 0) {
            result.put("communicationStatus", "Communication Ongoing");
            result.put("statusComment",
                    first.get("startupName") + ": Communication still ongoing between entrepreneur and investor(s). Facilitation matched; funding in progress.");
        } else {
            result.put("communicationStatus", "Facilitation Matched");
            result.put("statusComment",
                    first.get("startupName") + ": Facilitation matched — investor interest recorded. Awaiting communication to begin funding discussions.");
        }
        return result;
    }

    private String resolveStage(boolean hasInterest, long messageCount, String investmentStatus, StartupApplication startup) {
        if (isFunded(startup) || "Active".equals(investmentStatus)) return "Funded / Active Investment";
        if ("Pending".equals(investmentStatus)) return "Investment Pending";
        if (messageCount > 0) return "In Conversation";
        if (hasInterest) return "Interest Expressed";
        return "AI Matched / Connected";
    }

    private boolean isFunded(StartupApplication startup) {
        if ("Funded".equals(startup.getStatus()) || "Graduated".equals(startup.getStatus())) return true;
        Long goal = startup.getFundingGoal();
        Long raised = startup.getFundingRaised();
        return goal != null && goal > 0 && raised != null && raised >= goal;
    }

    private int fundingProgress(StartupApplication startup) {
        Long goal = startup.getFundingGoal();
        Long raised = startup.getFundingRaised();
        if (goal == null || goal <= 0 || raised == null) return 0;
        return (int) Math.min(100, Math.round(raised * 100.0 / goal));
    }

    private List<Map<String, String>> buildTimeline(
            StartupApplication startup,
            Optional<InvestorMatch> match,
            Optional<StartupInterest> interest,
            long messageCount,
            String firstContact,
            String lastContact,
            Optional<Investment> investment,
            CommunicationAnalysisService.CommunicationAnalysisResult aiAnalysis,
            String statusComment
    ) {
        List<Map<String, String>> timeline = new ArrayList<>();

        if (startup.getCreatedAt() != null) {
            timeline.add(step("Startup Registered", startup.getCreatedAt().format(DT),
                    "Entrepreneur submitted application on Innovation Hub Rwanda."));
        }
        if (startup.getAiAssessment() != null) {
            timeline.add(step("AI Evaluation Complete", startup.getCreatedAt() != null ? startup.getCreatedAt().format(DT) : "—",
                    "AI assessed business viability, risk, and investor fit."));
        }
        match.ifPresent(m -> timeline.add(step("AI Investor Match",
                startup.getCreatedAt() != null ? startup.getCreatedAt().format(DT) : "—",
                "Platform matched investor with " + (m.getMatchScore() != null ? m.getMatchScore() + "% compatibility" : "strong category fit") + ".")));
        interest.ifPresent(i -> timeline.add(step("Investor Interest",
                i.getCreatedAt().format(DT),
                "Investor expressed interest — founder contact shared securely via platform.")));
        if (messageCount > 0 && firstContact != null) {
            timeline.add(step("Direct Messaging",
                    firstContact,
                    messageCount + " message(s) exchanged through Innovation Hub messaging."
                            + (lastContact != null && !lastContact.equals(firstContact) ? " Last activity: " + lastContact + "." : "")));
        }
        if (aiAnalysis != null && aiAnalysis.aiSummary() != null && !aiAnalysis.aiSummary().isBlank()) {
            timeline.add(step("AI Communication Analysis",
                    lastContact != null ? lastContact : "—",
                    aiAnalysis.aiSummary()));
        }
        if (aiAnalysis != null && aiAnalysis.decisionDetected()) {
            timeline.add(step("Partnership Decision Detected",
                    lastContact != null ? lastContact : "—",
                    aiAnalysis.decisionSummary() != null && !aiAnalysis.decisionSummary().isBlank()
                            ? aiAnalysis.decisionSummary()
                            : "AI detected that investor and entrepreneur reached a decision in their communication."));
        }
        investment.ifPresent(inv -> timeline.add(step("Investment " + inv.getStatus(),
                inv.getDate() != null ? inv.getDate().format(DT) : "—",
                (inv.getAmount() != null ? "RWF " + String.format("%,d", inv.getAmount()) : "Investment") + " recorded on platform.")));
        timeline.add(step("Current Status", "—", statusComment));
        return timeline;
    }

    private Map<String, String> step(String stage, String date, String description) {
        Map<String, String> s = new LinkedHashMap<>();
        s.put("stage", stage);
        s.put("date", date);
        s.put("description", description);
        return s;
    }

    private String buildPlatformNarrative(
            long totalStartups, long startupsWithActivity, long totalInterests,
            int connectionsWithMessages, long totalMessages,
            int connectionsWithInvestment, int fundedConnections,
            int interestToMessageRate, int interestToInvestmentRate
    ) {
        return String.format(
                "Innovation Hub Rwanda's primary mission is connecting Rwandan entrepreneurs with investors. " +
                "Across %d registered startups, the platform has facilitated investor engagement on %d ventures. " +
                "%d investors expressed interest through the platform, leading to %d active messaging connections " +
                "(%d%% conversion) with %d total messages exchanged. %d connections progressed to investment " +
                "commitments (%d%%), and %d reached funded or active investment status. " +
                "This end-to-end trail — from AI evaluation and matching, through interest and secure contact sharing, " +
                "to direct messaging and funding — demonstrates how the system actively facilitates entrepreneur–investor partnerships.",
                totalStartups, startupsWithActivity, totalInterests, connectionsWithMessages,
                interestToMessageRate, totalMessages, connectionsWithInvestment, interestToInvestmentRate, fundedConnections
        );
    }

    private String buildAiInsight(
            List<Map<String, Object>> journeys,
            long totalInterests,
            int connectionsWithMessages,
            int connectionsWithInvestment
    ) {
        long aiMatched = journeys.stream().filter(j -> Boolean.TRUE.equals(j.get("aiMatched"))).count();
        return String.format(
                "AI analysis integrated with communication tracking: %d of %d investor connections originated from " +
                "AI-recommended matches. Messaging activity confirms platform-facilitated engagement beyond automated scoring — " +
                "%d conversations active, %d advancing to investment. Administrators should use this report to measure " +
                "Innovation Hub's impact in bridging entrepreneurs and capital partners.",
                aiMatched, Math.max(journeys.size(), 1), connectionsWithMessages, connectionsWithInvestment
        );
    }

    private String buildJourneyInsight(
            StartupApplication startup,
            User investor,
            boolean aiMatched,
            boolean hasInterest,
            long messageCount,
            String investmentStatus
    ) {
        return resolveJourneyStatus(aiMatched, hasInterest, messageCount, investmentStatus, startup).get("statusComment");
    }

    private record PairKey(Long startupId, Long investorId) {}
}
