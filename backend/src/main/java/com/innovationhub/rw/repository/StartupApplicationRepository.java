package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.StartupApplication;
import com.innovationhub.rw.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StartupApplicationRepository extends JpaRepository<StartupApplication, Long> {
    List<StartupApplication> findByFounderId(Long founderId);
    Optional<StartupApplication> findFirstByFounderIdOrderByCreatedAtDesc(Long founderId);

    @Query("SELECT s FROM StartupApplication s LEFT JOIN FETCH s.aiAssessment LEFT JOIN FETCH s.founder WHERE s.id = :id")
    Optional<StartupApplication> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT s FROM StartupApplication s LEFT JOIN FETCH s.aiAssessment LEFT JOIN FETCH s.founder")
    List<StartupApplication> findAllWithDetails();

    List<StartupApplication> findByStatus(String status);
    long countByStatus(String status);
}
