use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UnderwritingInput {
    pub unit_count: Option<i32>,
    pub occupancy_rate: Option<f64>,
    pub gross_scheduled_rent: Option<f64>,
    pub collected_rent: f64,
    pub operating_expenses: f64,
    pub debt_service: Option<f64>,
    pub property_value: Option<f64>,
    pub mortgage_balance: Option<f64>,
    pub interest_rate: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UnderwritingResult {
    pub noi: f64,
    pub dscr: Option<f64>,
    pub cash_flow_after_debt: Option<f64>,
    pub cap_rate: Option<f64>,
    pub ltv: Option<f64>,
    pub gross_rent_multiplier: Option<f64>,
    pub audit_trail: Vec<CalculationStep>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CalculationStep {
    pub metric: String,
    pub formula: String,
    pub inputs: Vec<(String, f64)>,
    pub result: f64,
    pub sources: Vec<String>, // fact_ids that contributed to this calculation
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct StressTestInput {
    pub base_result: UnderwritingResult,
    pub occupancy_adjustment: Option<f64>, // percentage change
    pub rent_adjustment: Option<f64>,      // percentage change
    pub expense_adjustment: Option<f64>,   // percentage change
    pub interest_rate_adjustment: Option<f64>, // basis points
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct StressTestResult {
    pub stressed_noi: f64,
    pub stressed_dscr: Option<f64>,
    pub stressed_cash_flow: Option<f64>,
    pub comparison: StressTestComparison,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct StressTestComparison {
    pub noi_change: f64,
    pub noi_change_pct: f64,
    pub dscr_change: Option<f64>,
    pub cash_flow_change: Option<f64>,
}

/// Calculate underwriting metrics from input facts
pub fn calculate_underwriting(input: UnderwritingInput) -> UnderwritingResult {
    let mut audit_trail = Vec::new();
    let mut warnings = Vec::new();

    // Calculate NOI
    let noi = input.collected_rent - input.operating_expenses;
    audit_trail.push(CalculationStep {
        metric: "NOI (Net Operating Income)".to_string(),
        formula: "Collected Rent - Operating Expenses".to_string(),
        inputs: vec![
            ("Collected Rent".to_string(), input.collected_rent),
            ("Operating Expenses".to_string(), input.operating_expenses),
        ],
        result: noi,
        sources: vec![], // Would be populated with actual fact_ids
    });

    // Calculate DSCR if debt service is available
    let dscr = input.debt_service.map(|ds| {
        let ratio = if ds > 0.0 { noi / ds } else { 0.0 };

        audit_trail.push(CalculationStep {
            metric: "DSCR (Debt Service Coverage Ratio)".to_string(),
            formula: "NOI / Annual Debt Service".to_string(),
            inputs: vec![
                ("NOI".to_string(), noi),
                ("Annual Debt Service".to_string(), ds),
            ],
            result: ratio,
            sources: vec![],
        });

        if ratio < 1.0 {
            warnings.push(format!(
                "Critical: DSCR of {:.2} is below 1.0 - property cannot cover debt service",
                ratio
            ));
        } else if ratio < 1.25 {
            warnings.push(format!(
                "Warning: DSCR of {:.2} is below recommended 1.25 threshold",
                ratio
            ));
        }

        ratio
    });

    // Calculate cash flow after debt
    let cash_flow_after_debt = input.debt_service.map(|ds| {
        let cash_flow = noi - ds;

        audit_trail.push(CalculationStep {
            metric: "Cash Flow After Debt".to_string(),
            formula: "NOI - Annual Debt Service".to_string(),
            inputs: vec![
                ("NOI".to_string(), noi),
                ("Annual Debt Service".to_string(), ds),
            ],
            result: cash_flow,
            sources: vec![],
        });

        if cash_flow < 0.0 {
            warnings.push(format!(
                "Critical: Negative cash flow of ${:.2}",
                cash_flow.abs()
            ));
        }

        cash_flow
    });

    // Calculate cap rate if property value is available
    let cap_rate = input.property_value.map(|value| {
        let rate = if value > 0.0 {
            (noi / value) * 100.0
        } else {
            0.0
        };

        audit_trail.push(CalculationStep {
            metric: "Cap Rate".to_string(),
            formula: "(NOI / Property Value) * 100".to_string(),
            inputs: vec![
                ("NOI".to_string(), noi),
                ("Property Value".to_string(), value),
            ],
            result: rate,
            sources: vec![],
        });

        if rate < 4.0 {
            warnings.push(format!("Note: Cap rate of {:.2}% is relatively low", rate));
        } else if rate > 12.0 {
            warnings.push(format!(
                "Note: Cap rate of {:.2}% is relatively high - may indicate higher risk",
                rate
            ));
        }

        rate
    });

    // Calculate LTV if both mortgage balance and property value are available
    let ltv = match (input.mortgage_balance, input.property_value) {
        (Some(mortgage), Some(value)) if value > 0.0 => {
            let ratio = (mortgage / value) * 100.0;

            audit_trail.push(CalculationStep {
                metric: "LTV (Loan-to-Value)".to_string(),
                formula: "(Mortgage Balance / Property Value) * 100".to_string(),
                inputs: vec![
                    ("Mortgage Balance".to_string(), mortgage),
                    ("Property Value".to_string(), value),
                ],
                result: ratio,
                sources: vec![],
            });

            if ratio > 80.0 {
                warnings.push(format!("Warning: LTV of {:.2}% is above 80%", ratio));
            }

            Some(ratio)
        }
        _ => None,
    };

    // Calculate Gross Rent Multiplier if available
    let gross_rent_multiplier = match (input.gross_scheduled_rent, input.property_value) {
        (Some(gsr), Some(value)) if gsr > 0.0 => {
            let grm = value / gsr;

            audit_trail.push(CalculationStep {
                metric: "Gross Rent Multiplier".to_string(),
                formula: "Property Value / Gross Scheduled Rent".to_string(),
                inputs: vec![
                    ("Property Value".to_string(), value),
                    ("Gross Scheduled Rent".to_string(), gsr),
                ],
                result: grm,
                sources: vec![],
            });

            Some(grm)
        }
        _ => None,
    };

    // Check for missing critical data
    if input.debt_service.is_none() {
        warnings.push("Note: Debt service not provided - DSCR cannot be calculated".to_string());
    }
    if input.property_value.is_none() {
        warnings.push(
            "Note: Property value not provided - Cap Rate and LTV cannot be calculated".to_string(),
        );
    }

    UnderwritingResult {
        noi,
        dscr,
        cash_flow_after_debt,
        cap_rate,
        ltv,
        gross_rent_multiplier,
        audit_trail,
        warnings,
    }
}

/// Apply stress test scenarios to underwriting results
pub fn apply_stress_test(input: StressTestInput) -> StressTestResult {
    let base = &input.base_result;

    // Get base values
    let mut collected_rent = 0.0;
    let mut operating_expenses = 0.0;
    let mut debt_service = 0.0;

    // Extract from audit trail
    for step in &base.audit_trail {
        for (name, value) in &step.inputs {
            if name == "Collected Rent" {
                collected_rent = *value;
            } else if name == "Operating Expenses" {
                operating_expenses = *value;
            } else if name == "Annual Debt Service" {
                debt_service = *value;
            }
        }
    }

    // Apply stress adjustments
    if let Some(rent_adj) = input.rent_adjustment {
        collected_rent *= 1.0 + (rent_adj / 100.0);
    }

    if let Some(expense_adj) = input.expense_adjustment {
        operating_expenses *= 1.0 + (expense_adj / 100.0);
    }

    if let Some(interest_adj) = input.interest_rate_adjustment {
        // Simplified: adjust debt service proportionally to interest rate change
        // In reality, this would require loan balance and term
        debt_service *= 1.0 + (interest_adj / 10000.0);
    }

    // Calculate stressed metrics
    let stressed_noi = collected_rent - operating_expenses;
    let stressed_dscr = if debt_service > 0.0 {
        Some(stressed_noi / debt_service)
    } else {
        None
    };
    let stressed_cash_flow = Some(stressed_noi - debt_service);

    // Calculate changes
    let noi_change = stressed_noi - base.noi;
    let noi_change_pct = if base.noi != 0.0 {
        (noi_change / base.noi) * 100.0
    } else {
        0.0
    };

    let dscr_change = match (stressed_dscr, base.dscr) {
        (Some(stressed), Some(base_dscr)) => Some(stressed - base_dscr),
        _ => None,
    };

    let cash_flow_change = match (stressed_cash_flow, base.cash_flow_after_debt) {
        (Some(stressed), Some(base_cf)) => Some(stressed - base_cf),
        _ => None,
    };

    StressTestResult {
        stressed_noi,
        stressed_dscr,
        stressed_cash_flow,
        comparison: StressTestComparison {
            noi_change,
            noi_change_pct,
            dscr_change,
            cash_flow_change,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_underwriting() {
        let input = UnderwritingInput {
            unit_count: Some(10),
            occupancy_rate: Some(95.0),
            gross_scheduled_rent: Some(120000.0),
            collected_rent: 114000.0,
            operating_expenses: 45000.0,
            debt_service: Some(50000.0),
            property_value: Some(1000000.0),
            mortgage_balance: Some(700000.0),
            interest_rate: Some(4.5),
        };

        let result = calculate_underwriting(input);

        assert_eq!(result.noi, 69000.0);
        assert!(result.dscr.is_some());
        assert_eq!(result.dscr.unwrap(), 1.38);
        assert!(result.cash_flow_after_debt.is_some());
        assert_eq!(result.cash_flow_after_debt.unwrap(), 19000.0);
        assert!(result.cap_rate.is_some());
        assert_eq!(result.cap_rate.unwrap(), 6.9);
        assert!(result.ltv.is_some());
        assert_eq!(result.ltv.unwrap(), 70.0);
    }

    #[test]
    fn test_low_dscr_warning() {
        let input = UnderwritingInput {
            unit_count: None,
            occupancy_rate: None,
            gross_scheduled_rent: None,
            collected_rent: 60000.0,
            operating_expenses: 45000.0,
            debt_service: Some(20000.0),
            property_value: None,
            mortgage_balance: None,
            interest_rate: None,
        };

        let result = calculate_underwriting(input);

        assert!(result.warnings.iter().any(|w| w.contains("DSCR")));
    }

    #[test]
    fn test_stress_test() {
        let base_input = UnderwritingInput {
            unit_count: None,
            occupancy_rate: None,
            gross_scheduled_rent: None,
            collected_rent: 100000.0,
            operating_expenses: 40000.0,
            debt_service: Some(45000.0),
            property_value: None,
            mortgage_balance: None,
            interest_rate: None,
        };

        let base_result = calculate_underwriting(base_input);

        let stress_input = StressTestInput {
            base_result: base_result.clone(),
            occupancy_adjustment: None,
            rent_adjustment: Some(-10.0),  // 10% rent decrease
            expense_adjustment: Some(5.0), // 5% expense increase
            interest_rate_adjustment: None,
        };

        let stress_result = apply_stress_test(stress_input);

        assert!(stress_result.stressed_noi < base_result.noi);
        assert!(stress_result.comparison.noi_change < 0.0);
    }
}
