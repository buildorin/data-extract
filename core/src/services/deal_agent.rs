use crate::models::fact::Fact;
use crate::services::underwriting::UnderwritingResult;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub enum Severity {
    Info,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct AgentRecommendation {
    pub severity: Severity,
    pub category: String,
    pub message: String,
    pub recommended_action: Option<String>,
    pub details: Option<String>,
}

/// Analyze a deal and provide recommendations
pub fn analyze_deal(
    facts: &[Fact],
    underwriting: Option<&UnderwritingResult>,
) -> Vec<AgentRecommendation> {
    let mut recommendations = Vec::new();

    // Check for missing critical documents
    recommendations.extend(check_missing_documents(facts));

    // Analyze underwriting metrics if available
    if let Some(uw) = underwriting {
        recommendations.extend(analyze_underwriting_metrics(uw));
        recommendations.extend(analyze_leverage_ratios(uw));
    }

    // Check fact quality and completeness
    recommendations.extend(check_fact_quality(facts));

    recommendations
}

fn check_missing_documents(facts: &[Fact]) -> Vec<AgentRecommendation> {
    let mut recommendations = Vec::new();

    // Check for critical fact types
    let has_collected_rent = facts.iter().any(|f| f.fact_type == "collected_rent");
    let has_operating_expenses = facts.iter().any(|f| f.fact_type == "operating_expenses");
    let has_mortgage = facts
        .iter()
        .any(|f| f.fact_type == "mortgage_balance" || f.fact_type == "debt_service");
    let has_property_value = facts.iter().any(|f| f.fact_type == "property_value");
    let has_unit_count = facts.iter().any(|f| f.fact_type == "unit_count");
    let has_occupancy = facts.iter().any(|f| f.fact_type == "occupancy_rate");

    if !has_collected_rent {
        recommendations.push(AgentRecommendation {
            severity: Severity::Critical,
            category: "Missing Data".to_string(),
            message: "No rental income data found".to_string(),
            recommended_action: Some(
                "Upload rent roll or P&L statement showing collected rent".to_string(),
            ),
            details: Some(
                "Collected rent is essential for calculating NOI and evaluating property performance"
                    .to_string(),
            ),
        });
    }

    if !has_operating_expenses {
        recommendations.push(AgentRecommendation {
            severity: Severity::Critical,
            category: "Missing Data".to_string(),
            message: "No operating expenses data found".to_string(),
            recommended_action: Some("Upload P&L statement with operating expenses breakdown".to_string()),
            details: Some(
                "Operating expenses are required to calculate NOI and understand property profitability"
                    .to_string(),
            ),
        });
    }

    if !has_mortgage {
        recommendations.push(AgentRecommendation {
            severity: Severity::Warning,
            category: "Missing Data".to_string(),
            message: "No mortgage or debt service information found".to_string(),
            recommended_action: Some(
                "Upload mortgage statement to enable DSCR calculation".to_string(),
            ),
            details: Some(
                "Debt service coverage ratio (DSCR) cannot be calculated without mortgage information"
                    .to_string(),
            ),
        });
    }

    if !has_property_value {
        recommendations.push(AgentRecommendation {
            severity: Severity::Info,
            category: "Missing Data".to_string(),
            message: "No property value found".to_string(),
            recommended_action: Some("Upload tax assessment or appraisal document".to_string()),
            details: Some("Property value enables calculation of Cap Rate and LTV".to_string()),
        });
    }

    if !has_unit_count {
        recommendations.push(AgentRecommendation {
            severity: Severity::Info,
            category: "Missing Data".to_string(),
            message: "No unit count information found".to_string(),
            recommended_action: Some("Ensure rent roll includes total unit count".to_string()),
            details: Some(
                "Unit count helps assess property size and per-unit economics".to_string(),
            ),
        });
    }

    if !has_occupancy {
        recommendations.push(AgentRecommendation {
            severity: Severity::Info,
            category: "Missing Data".to_string(),
            message: "No occupancy rate found".to_string(),
            recommended_action: Some("Include occupancy percentage in rent roll".to_string()),
            details: Some(
                "Occupancy rate is important for understanding property performance and risk"
                    .to_string(),
            ),
        });
    }

    recommendations
}

fn analyze_underwriting_metrics(uw: &UnderwritingResult) -> Vec<AgentRecommendation> {
    let mut recommendations = Vec::new();

    // Analyze DSCR
    if let Some(dscr) = uw.dscr {
        if dscr < 1.0 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Critical,
                category: "Debt Coverage".to_string(),
                message: format!(
                    "DSCR of {:.2} is below 1.0 - property cannot cover debt service",
                    dscr
                ),
                recommended_action: Some(
                    "Consider higher coupon rate, lower leverage, or refinancing options".to_string(),
                ),
                details: Some(
                    "DSCR below 1.0 means the property generates insufficient income to cover debt payments"
                        .to_string(),
                ),
            });
        } else if dscr < 1.25 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Warning,
                category: "Debt Coverage".to_string(),
                message: format!("DSCR of {:.2} is below recommended 1.25 threshold", dscr),
                recommended_action: Some(
                    "Consider increasing down payment or negotiating better loan terms".to_string(),
                ),
                details: Some(
                    "Most lenders require DSCR of 1.25 or higher for comfortable debt service coverage"
                        .to_string(),
                ),
            });
        } else if dscr >= 1.5 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Info,
                category: "Debt Coverage".to_string(),
                message: format!("Strong DSCR of {:.2} provides good safety margin", dscr),
                recommended_action: None,
                details: Some(
                    "Property has healthy cash flow to cover debt service with room for unexpected expenses"
                        .to_string(),
                ),
            });
        }
    }

    // Analyze NOI
    if uw.noi < 0.0 {
        recommendations.push(AgentRecommendation {
            severity: Severity::Critical,
            category: "Operating Performance".to_string(),
            message: format!(
                "Negative NOI of ${:.2} indicates operating loss",
                uw.noi.abs()
            ),
            recommended_action: Some(
                "Review operating expenses for reduction opportunities or increase rents"
                    .to_string(),
            ),
            details: Some(
                "Property is not generating positive operating income after expenses".to_string(),
            ),
        });
    }

    // Analyze Cash Flow
    if let Some(cf) = uw.cash_flow_after_debt {
        if cf < 0.0 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Critical,
                category: "Cash Flow".to_string(),
                message: format!("Negative cash flow of ${:.2} per year", cf.abs()),
                recommended_action: Some(
                    "Property requires capital injection. Consider debt restructuring or operational improvements"
                        .to_string(),
                ),
                details: Some(
                    "Negative cash flow means owner must contribute additional capital to cover shortfall"
                        .to_string(),
                ),
            });
        } else if cf < 5000.0 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Warning,
                category: "Cash Flow".to_string(),
                message: "Low cash flow provides minimal safety margin".to_string(),
                recommended_action: Some(
                    "Consider stress testing for rent decreases or expense increases".to_string(),
                ),
                details: Some(
                    "Low cash flow leaves little buffer for unexpected expenses or vacancies"
                        .to_string(),
                ),
            });
        }
    }

    // Analyze Cap Rate
    if let Some(cap_rate) = uw.cap_rate {
        if cap_rate < 3.0 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Warning,
                category: "Returns".to_string(),
                message: format!("Low cap rate of {:.2}% suggests limited income potential", cap_rate),
                recommended_action: Some(
                    "Verify property value is accurate and consider if appreciation potential justifies low yield"
                        .to_string(),
                ),
                details: Some("Cap rates below 3% are typically seen in premium locations with strong appreciation potential".to_string()),
            });
        } else if cap_rate > 10.0 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Warning,
                category: "Returns".to_string(),
                message: format!("High cap rate of {:.2}% may indicate higher risk", cap_rate),
                recommended_action: Some(
                    "Investigate property condition, location, and tenant quality".to_string(),
                ),
                details: Some(
                    "Cap rates above 10% often reflect higher risk properties or markets"
                        .to_string(),
                ),
            });
        }
    }

    recommendations
}

fn analyze_leverage_ratios(uw: &UnderwritingResult) -> Vec<AgentRecommendation> {
    let mut recommendations = Vec::new();

    // Analyze LTV
    if let Some(ltv) = uw.ltv {
        if ltv > 85.0 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Warning,
                category: "Leverage".to_string(),
                message: format!("LTV of {:.2}% exceeds 85% threshold", ltv),
                recommended_action: Some(
                    "Consider increasing equity contribution to reduce leverage risk".to_string(),
                ),
                details: Some(
                    "High LTV limits equity buffer and increases sensitivity to property value declines"
                        .to_string(),
                ),
            });
        } else if ltv > 80.0 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Info,
                category: "Leverage".to_string(),
                message: format!("LTV of {:.2}% is above 80%", ltv),
                recommended_action: Some(
                    "Monitor property value and maintain cash reserves".to_string(),
                ),
                details: Some("LTV above 80% may require PMI or higher interest rates".to_string()),
            });
        } else if ltv < 60.0 {
            recommendations.push(AgentRecommendation {
                severity: Severity::Info,
                category: "Leverage".to_string(),
                message: format!("Conservative LTV of {:.2}%", ltv),
                recommended_action: Some(
                    "Consider if higher leverage could improve returns without excessive risk"
                        .to_string(),
                ),
                details: Some(
                    "Low LTV provides strong equity position but may limit returns on equity"
                        .to_string(),
                ),
            });
        }
    }

    recommendations
}

fn check_fact_quality(facts: &[Fact]) -> Vec<AgentRecommendation> {
    let mut recommendations = Vec::new();

    // Count unlocked facts
    let unlocked_count = facts.iter().filter(|f| !f.locked).count();
    if unlocked_count > 0 {
        recommendations.push(AgentRecommendation {
            severity: Severity::Warning,
            category: "Data Quality".to_string(),
            message: format!("{} facts pending approval", unlocked_count),
            recommended_action: Some(
                "Review and approve all facts before finalizing underwriting".to_string(),
            ),
            details: Some(
                "Unlocked facts may change, affecting underwriting calculations".to_string(),
            ),
        });
    }

    // Check for low confidence facts
    let low_confidence: Vec<&Fact> = facts
        .iter()
        .filter(|f| f.confidence_score.map_or(false, |s| s < 0.7))
        .collect();

    if !low_confidence.is_empty() {
        recommendations.push(AgentRecommendation {
            severity: Severity::Info,
            category: "Data Quality".to_string(),
            message: format!("{} facts have low confidence scores", low_confidence.len()),
            recommended_action: Some("Manually verify facts with confidence below 70%".to_string()),
            details: Some(
                "Low confidence scores may indicate OCR errors or ambiguous source data"
                    .to_string(),
            ),
        });
    }

    recommendations
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::underwriting::CalculationStep;

    #[test]
    fn test_low_dscr_warning() {
        let uw = UnderwritingResult {
            noi: 50000.0,
            dscr: Some(1.1),
            cash_flow_after_debt: Some(5000.0),
            cap_rate: Some(6.0),
            ltv: Some(75.0),
            gross_rent_multiplier: None,
            audit_trail: vec![],
            warnings: vec![],
        };

        let recommendations = analyze_underwriting_metrics(&uw);

        assert!(recommendations
            .iter()
            .any(|r| matches!(r.severity, Severity::Warning) && r.category == "Debt Coverage"));
    }

    #[test]
    fn test_negative_cash_flow() {
        let uw = UnderwritingResult {
            noi: 50000.0,
            dscr: Some(0.8),
            cash_flow_after_debt: Some(-10000.0),
            cap_rate: None,
            ltv: None,
            gross_rent_multiplier: None,
            audit_trail: vec![],
            warnings: vec![],
        };

        let recommendations = analyze_underwriting_metrics(&uw);

        assert!(recommendations
            .iter()
            .any(|r| matches!(r.severity, Severity::Critical) && r.category == "Cash Flow"));
    }
}
