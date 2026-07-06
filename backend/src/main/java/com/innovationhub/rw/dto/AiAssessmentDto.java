package com.innovationhub.rw.dto;

import com.innovationhub.rw.entity.AiAssessment;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

public record AiAssessmentDto(
        Integer marketUniqueness,
        Integer productUniqueness,
        Integer overallInnovation,
        String riskLevel,
        Integer riskScore,
        Long expectedProfit,
        Integer expectedROI,
        String evaluatedAt,
        String engineVersion,
        String aiSummary,
        Boolean documentsValid,
        String validationIssues,
        String investorAdvice
) {
    public static AiAssessmentDto from(AiAssessment a) {
        if (a == null) return null;
        return new AiAssessmentDto(
                a.getMarketUniqueness(),
                a.getProductUniqueness(),
                a.getOverallInnovation(),
                a.getRiskLevel(),
                a.getRiskScore(),
                a.getExpectedProfit(),
                a.getExpectedROI(),
                a.getEvaluatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                a.getEngineVersion(),
                a.getAiSummary(),
                a.getDocumentsValid(),
                a.getValidationIssues(),
                a.getInvestorAdvice()
        );
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("marketUniqueness", marketUniqueness);
        map.put("productUniqueness", productUniqueness);
        map.put("overallInnovation", overallInnovation);
        map.put("riskLevel", riskLevel);
        map.put("riskScore", riskScore);
        map.put("expectedProfit", expectedProfit);
        map.put("expectedROI", expectedROI);
        map.put("evaluatedAt", evaluatedAt);
        map.put("engineVersion", engineVersion);
        map.put("aiSummary", aiSummary);
        map.put("documentsValid", documentsValid);
        map.put("validationIssues", validationIssues);
        map.put("investorAdvice", investorAdvice);
        return map;
    }
}
