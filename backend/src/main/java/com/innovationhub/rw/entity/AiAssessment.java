package com.innovationhub.rw.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_assessments")
public class AiAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private StartupApplication application;

    private Integer marketUniqueness;
    private Integer productUniqueness;
    private Integer overallInnovation;
    private String riskLevel;
    private Integer riskScore;
    private Long expectedProfit;
    private Integer expectedROI;
    private Integer descBonus;
    private Double rawRoi;
    private String engineVersion = "1.0-rules";

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    private Boolean documentsValid = true;

    @Column(columnDefinition = "TEXT")
    private String validationIssues;

    @Column(columnDefinition = "TEXT")
    private String investorAdvice;

    @Column(nullable = false)
    private LocalDateTime evaluatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StartupApplication getApplication() { return application; }
    public void setApplication(StartupApplication application) { this.application = application; }
    public Integer getMarketUniqueness() { return marketUniqueness; }
    public void setMarketUniqueness(Integer marketUniqueness) { this.marketUniqueness = marketUniqueness; }
    public Integer getProductUniqueness() { return productUniqueness; }
    public void setProductUniqueness(Integer productUniqueness) { this.productUniqueness = productUniqueness; }
    public Integer getOverallInnovation() { return overallInnovation; }
    public void setOverallInnovation(Integer overallInnovation) { this.overallInnovation = overallInnovation; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public Long getExpectedProfit() { return expectedProfit; }
    public void setExpectedProfit(Long expectedProfit) { this.expectedProfit = expectedProfit; }
    public Integer getExpectedROI() { return expectedROI; }
    public void setExpectedROI(Integer expectedROI) { this.expectedROI = expectedROI; }
    public Integer getDescBonus() { return descBonus; }
    public void setDescBonus(Integer descBonus) { this.descBonus = descBonus; }
    public Double getRawRoi() { return rawRoi; }
    public void setRawRoi(Double rawRoi) { this.rawRoi = rawRoi; }
    public String getEngineVersion() { return engineVersion; }
    public void setEngineVersion(String engineVersion) { this.engineVersion = engineVersion; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    public Boolean getDocumentsValid() { return documentsValid; }
    public void setDocumentsValid(Boolean documentsValid) { this.documentsValid = documentsValid; }
    public String getValidationIssues() { return validationIssues; }
    public void setValidationIssues(String validationIssues) { this.validationIssues = validationIssues; }
    public String getInvestorAdvice() { return investorAdvice; }
    public void setInvestorAdvice(String investorAdvice) { this.investorAdvice = investorAdvice; }
    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
