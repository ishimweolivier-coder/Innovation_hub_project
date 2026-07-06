package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.Investment;
import com.innovationhub.rw.entity.StartupApplication;
import com.innovationhub.rw.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByInvestor(User investor);

    @Query("SELECT i FROM Investment i JOIN FETCH i.startup JOIN FETCH i.investor")
    List<Investment> findAllWithDetails();

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Investment i WHERE i.startup.id = :startupId AND i.status = 'Active'")
    long sumActiveAmountByStartupId(@Param("startupId") Long startupId);

    Optional<Investment> findByStartupAndInvestor(StartupApplication startup, User investor);
}
