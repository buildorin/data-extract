use crate::agents::common::{AgentContext, AgentResult};
use crate::models::deal::{Deal, DealType};
use crate::models::fact::Fact;
use crate::services::ai::claude_client::ClaudeClient;
use crate::utils::clients::get_pg_client;
use chrono::Utc;
use serde_json::json;
use std::error::Error;

pub struct ScoringAgent {
    claude_client: ClaudeClient,
}

impl ScoringAgent {
    pub async fn new() -> Result<Self, Box<dyn Error + Send + Sync>> {
        let claude_client = ClaudeClient::new().await?;
        Ok(Self { claude_client })
    }

    /// Main entry point: Calculate Orin Score for a deal
    pub async fn calculate_score(
        &self,
        deal_id: &str,
        user_id: &str,
        _context: AgentContext,
    ) -> Result<AgentResult, Box<dyn Error + Send + Sync>> {
        let start_time = std::time::Instant::now();
        
        // Step 1: Load deal and facts
        let client = get_pg_client().await?;
        
        // Get deal
        let deal_row = client
            .query_one(
                "SELECT deal_id, user_id, deal_name, status, deal_type, created_at, updated_at, metadata FROM deals WHERE deal_id = $1 AND user_id = $2",
                &[&deal_id, &user_id],
            )
            .await?;
        
        let deal_type_str: String = deal_row.get("deal_type");
        let deal_type = if deal_type_str == "rental_income" {
            DealType::RentalIncome
        } else {
            DealType::ValueAdd
        };
        
        // Get approved facts
        let fact_rows = client
            .query(
                "SELECT label, value FROM facts WHERE deal_id = $1 AND locked = true",
                &[&deal_id],
            )
            .await?;
        
        let mut fact_values = serde_json::Map::new();
        for row in fact_rows {
            let label: String = row.get("label");
            let value: String = row.get("value");
            if let Ok(num_value) = value.parse::<f64>() {
                fact_values.insert(label, json!(num_value));
            }
        }
        
        // Step 2: Calculate score using default formula
        let score_result = match deal_type {
            DealType::RentalIncome => self.calculate_rental_income_score(&fact_values)?,
            DealType::ValueAdd => {
                // For Phase 2, return placeholder
                json!({
                    "score": null,
                    "tier": null,
                    "breakdown": {},
                    "message": "Value-add scoring coming in Phase 2"
                })
            }
        };
        
        // Step 3: Update deal with score
        if score_result["score"].as_i64().is_some() {
            client
                .execute(
                    "UPDATE deals SET orin_score = $1, orin_score_breakdown = $2, orin_score_calculated_at = $3, orin_score_tier = $4 WHERE deal_id = $5",
                    &[
                        &score_result["score"].as_i64().map(|v| v as i32),
                        &score_result["breakdown"],
                        &Utc::now(),
                        &score_result["tier"].as_str(),
                        &deal_id,
                    ],
                )
                .await?;
        }
        
        let execution_time = start_time.elapsed().as_millis() as i32;
        
        Ok(AgentResult::success(
            score_result,
            None,
            execution_time,
        ))
    }

    fn calculate_rental_income_score(
        &self,
        fact_values: &serde_json::Map<String, serde_json::Value>,
    ) -> Result<serde_json::Value, Box<dyn Error + Send + Sync>> {
        let mut total_score = 0.0;
        let mut breakdown = serde_json::Map::new();
        
        // Component 1: DSCR Health (30 points)
        let dscr_score = self.calculate_dscr_health(fact_values);
        breakdown.insert("dscr_health".to_string(), json!(dscr_score));
        total_score += dscr_score;
        
        // Component 2: Cap Rate vs Market (25 points)
        let cap_rate_score = self.calculate_cap_rate_score(fact_values);
        breakdown.insert("cap_rate_vs_market".to_string(), json!(cap_rate_score));
        total_score += cap_rate_score;
        
        // Component 3: Occupancy Stability (20 points)
        let occupancy_score = self.calculate_occupancy_score(fact_values);
        breakdown.insert("occupancy_stability".to_string(), json!(occupancy_score));
        total_score += occupancy_score;
        
        // Component 4: Cash Flow Sustainability (15 points)
        let cash_flow_score = self.calculate_cash_flow_score(fact_values);
        breakdown.insert("cash_flow_sustainability".to_string(), json!(cash_flow_score));
        total_score += cash_flow_score;
        
        // Component 5: Location Score (10 points) - Placeholder
        let location_score = 5.0;
        breakdown.insert("location_score".to_string(), json!(location_score));
        total_score += location_score;
        
        let tier = self.determine_tier(total_score as i32);
        
        Ok(json!({
            "score": total_score as i32,
            "tier": tier,
            "breakdown": breakdown,
        }))
    }

    fn calculate_dscr_health(&self, facts: &serde_json::Map<String, serde_json::Value>) -> f64 {
        // Extract NOI and Debt Service from facts
        let rental_income = facts.get("Annual Rental Income")
            .or_else(|| facts.get("Gross Rent"))
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let operating_expenses = facts.get("T12 Operating Expenses")
            .or_else(|| facts.get("Operating Expenses"))
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let noi = rental_income - operating_expenses;
        
        let loan_amount = facts.get("Loan Amount")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let interest_rate = facts.get("Interest Rate")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0) / 100.0;
        
        // Simplified annual debt service calculation
        let debt_service = if loan_amount > 0.0 && interest_rate > 0.0 {
            loan_amount * interest_rate
        } else {
            0.0
        };
        
        if debt_service == 0.0 {
            return 0.0;
        }
        
        let dscr = noi / debt_service;
        let threshold = 1.75;
        let weight = 30.0;
        
        if dscr >= threshold {
            weight
        } else if dscr >= 1.25 {
            ((dscr - 1.25) / (threshold - 1.25)) * weight
        } else {
            0.0
        }
    }

    fn calculate_cap_rate_score(&self, facts: &serde_json::Map<String, serde_json::Value>) -> f64 {
        let market_cap_rate = 6.5; // Placeholder
        let weight = 25.0;
        
        let rental_income = facts.get("Annual Rental Income")
            .or_else(|| facts.get("Gross Rent"))
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let operating_expenses = facts.get("T12 Operating Expenses")
            .or_else(|| facts.get("Operating Expenses"))
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let noi = rental_income - operating_expenses;
        
        let purchase_price = facts.get("Purchase Price")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        if purchase_price == 0.0 {
            return 0.0;
        }
        
        let deal_cap_rate = (noi / purchase_price) * 100.0;
        
        if deal_cap_rate >= market_cap_rate * 1.2 {
            weight
        } else if deal_cap_rate >= market_cap_rate {
            ((deal_cap_rate - market_cap_rate) / (market_cap_rate * 0.2)) * weight
        } else {
            0.0
        }
    }

    fn calculate_occupancy_score(&self, facts: &serde_json::Map<String, serde_json::Value>) -> f64 {
        let occupancy = facts.get("Occupancy Rate")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0) / 100.0;
        
        let min_occupancy = 0.90;
        let weight = 20.0;
        
        if occupancy >= min_occupancy {
            weight
        } else {
            (occupancy / min_occupancy) * weight
        }
    }

    fn calculate_cash_flow_score(&self, facts: &serde_json::Map<String, serde_json::Value>) -> f64 {
        let rental_income = facts.get("Annual Rental Income")
            .or_else(|| facts.get("Gross Rent"))
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let operating_expenses = facts.get("T12 Operating Expenses")
            .or_else(|| facts.get("Operating Expenses"))
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let noi = rental_income - operating_expenses;
        
        let loan_amount = facts.get("Loan Amount")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let interest_rate = facts.get("Interest Rate")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0) / 100.0;
        
        let debt_service = if loan_amount > 0.0 && interest_rate > 0.0 {
            loan_amount * interest_rate
        } else {
            0.0
        };
        
        let cash_flow = noi - debt_service;
        let weight = 15.0;
        
        if cash_flow > 0.0 {
            weight
        } else {
            0.0
        }
    }

    fn determine_tier(&self, score: i32) -> String {
        match score {
            85..=100 => "strong".to_string(),
            70..=84 => "good".to_string(),
            50..=69 => "risky".to_string(),
            _ => "pass".to_string(),
        }
    }
}
