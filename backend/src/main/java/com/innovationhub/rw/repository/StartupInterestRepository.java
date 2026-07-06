package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.StartupInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StartupInterestRepository extends JpaRepository<StartupInterest, Long> {
    boolean existsByStartupIdAndInvestorId(Long startupId, Long investorId);
    Optional<StartupInterest> findByStartupIdAndInvestorId(Long startupId, Long investorId);

    @Query("SELECT si FROM StartupInterest si JOIN FETCH si.startup s JOIN FETCH s.founder JOIN FETCH si.investor ORDER BY si.createdAt DESC")
    List<StartupInterest> findAllWithDetails();

    List<StartupInterest> findByStartupId(Long startupId);
}
