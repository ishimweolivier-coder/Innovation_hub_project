package com.innovationhub.rw.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "startup_applications")
public class StartupApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "founder_id", nullable = false)
    private User founder;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "Submitted";

    private Integer stage = 1;

    private Long fundingGoal = 0L;
    private Long fundingRaised = 0L;

    private LocalDate createdAt = LocalDate.now();

    private String image;

    private String businessPlan;
    private String budget;
    private Long budgetAmount = 0L;
    private Long projectedProfit = 0L;

    @Enumerated(EnumType.STRING)
    private WorkflowStage workflowStage = WorkflowStage.REGISTERED;

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private AiAssessment aiAssessment;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public User getFounder() { return founder; }
    public void setFounder(User founder) { this.founder = founder; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getStage() { return stage; }
    public void setStage(Integer stage) { this.stage = stage; }
    public Long getFundingGoal() { return fundingGoal; }
    public void setFundingGoal(Long fundingGoal) { this.fundingGoal = fundingGoal; }
    public Long getFundingRaised() { return fundingRaised; }
    public void setFundingRaised(Long fundingRaised) { this.fundingRaised = fundingRaised; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getBusinessPlan() { return businessPlan; }
    public void setBusinessPlan(String businessPlan) { this.businessPlan = businessPlan; }
    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }
    public Long getBudgetAmount() { return budgetAmount; }
    public void setBudgetAmount(Long budgetAmount) { this.budgetAmount = budgetAmount; }
    public Long getProjectedProfit() { return projectedProfit; }
    public void setProjectedProfit(Long projectedProfit) { this.projectedProfit = projectedProfit; }
    public WorkflowStage getWorkflowStage() { return workflowStage; }
    public void setWorkflowStage(WorkflowStage workflowStage) { this.workflowStage = workflowStage; }
    public AiAssessment getAiAssessment() { return aiAssessment; }
    public void setAiAssessment(AiAssessment aiAssessment) { this.aiAssessment = aiAssessment; }
}
