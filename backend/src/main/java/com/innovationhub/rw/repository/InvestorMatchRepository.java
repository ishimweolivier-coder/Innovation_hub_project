package com.innovationhub.rw.repository;

import com.innovationhub.rw.entity.InvestorMatch;
import com.innovationhub.rw.entity.StartupApplication;
import com.innovationhub.rw.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvestorMatchRepository extends JpaRepository<InvestorMatch, Long> {
    List<InvestorMatch> findByApplication(StartupApplication application);
    Optional<InvestorMatch> findByApplicationAndInvestor(StartupApplication application, User investor);
    void deleteByApplication(StartupApplication application);
}
