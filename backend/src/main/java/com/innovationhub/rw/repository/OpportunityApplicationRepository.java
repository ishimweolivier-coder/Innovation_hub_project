package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.OpportunityApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OpportunityApplicationRepository extends JpaRepository<OpportunityApplication, Long> {
    List<OpportunityApplication> findByUserId(Long userId);
    Optional<OpportunityApplication> findByUserIdAndOpportunityId(Long userId, Long opportunityId);
    boolean existsByUserIdAndOpportunityId(Long userId, Long opportunityId);

    @Query("SELECT a FROM OpportunityApplication a JOIN FETCH a.user JOIN FETCH a.opportunity ORDER BY a.appliedAt DESC")
    List<OpportunityApplication> findAllWithDetails();
}
