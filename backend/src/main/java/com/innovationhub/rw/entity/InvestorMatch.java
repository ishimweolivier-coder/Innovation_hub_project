package com.innovationhub.rw.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "investor_matches")
public class InvestorMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private StartupApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investor_id", nullable = false)
    private User investor;

    private Integer matchScore;
    private String categoryFit;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StartupApplication getApplication() { return application; }
    public void setApplication(StartupApplication application) { this.application = application; }
    public User getInvestor() { return investor; }
    public void setInvestor(User investor) { this.investor = investor; }
    public Integer getMatchScore() { return matchScore; }
    public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }
    public String getCategoryFit() { return categoryFit; }
    public void setCategoryFit(String categoryFit) { this.categoryFit = categoryFit; }
}
