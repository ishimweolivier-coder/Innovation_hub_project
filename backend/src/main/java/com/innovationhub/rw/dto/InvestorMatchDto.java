package com.innovationhub.rw.dto;

import com.innovationhub.rw.entity.InvestorMatch;
import com.innovationhub.rw.entity.User;
import java.util.List;

public record InvestorMatchDto(
        Long id,
        String name,
        String company,
        String investorType,
        Integer minInnovation,
        Integer matchScore,
        String categoryFit
) {
    public static InvestorMatchDto from(InvestorMatch match) {
        User inv = match.getInvestor();
        return new InvestorMatchDto(
                inv.getId(),
                inv.getFullName(),
                inv.getCompany(),
                inv.getInvestorType(),
                inv.getMinInnovation(),
                match.getMatchScore(),
                match.getCategoryFit()
        );
    }

    public static List<InvestorMatchDto> fromList(List<InvestorMatch> matches) {
        return matches.stream().map(InvestorMatchDto::from).toList();
    }
}
