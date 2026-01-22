use crate::data::schema::scoring_formulas;
use crate::models::deal::DealType;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, ToSchema)]
#[diesel(table_name = scoring_formulas)]
#[diesel(primary_key(formula_id))]
pub struct ScoringFormula {
    pub formula_id: String,
    pub user_id: String,
    pub deal_id: Option<String>, // NULL = user-level default
    pub formula_name: String,
    pub formula_config: JsonValue,
    pub deal_type: DealType,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, ToSchema)]
#[diesel(table_name = scoring_formulas)]
pub struct NewScoringFormula {
    pub formula_id: String,
    pub user_id: String,
    pub deal_id: Option<String>,
    pub formula_name: String,
    pub formula_config: JsonValue,
    pub deal_type: DealType,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset, ToSchema)]
#[diesel(table_name = scoring_formulas)]
pub struct UpdateScoringFormula {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub formula_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub formula_config: Option<JsonValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_active: Option<bool>,
}

// Request/Response DTOs
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateFormulaRequest {
    pub formula_name: String,
    pub formula_config: JsonValue,
    pub deal_type: DealType,
    pub deal_id: Option<String>, // If provided, formula is deal-specific
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct FormulaResponse {
    pub formula_id: String,
    pub formula_name: String,
    pub formula_config: JsonValue,
    pub deal_type: DealType,
    pub deal_id: Option<String>,
    pub is_active: bool,
    pub created_at: String,
}
