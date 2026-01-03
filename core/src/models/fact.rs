use crate::data::schema::facts;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Associations, ToSchema)]
#[diesel(table_name = facts)]
#[diesel(primary_key(fact_id))]
#[diesel(belongs_to(crate::models::deal::Deal, foreign_key = deal_id))]
#[diesel(belongs_to(crate::models::document::Document, foreign_key = document_id))]
pub struct Fact {
    pub fact_id: String,
    pub document_id: String,
    pub deal_id: String,
    pub fact_type: String,
    pub label: String,
    pub value: String,
    pub unit: Option<String>,
    pub source_citation: JsonValue,
    pub status: String,
    pub confidence_score: Option<f64>,
    pub approved_at: Option<DateTime<Utc>>,
    pub approved_by: Option<String>,
    pub locked: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, ToSchema)]
#[diesel(table_name = facts)]
pub struct NewFact {
    pub fact_id: String,
    pub document_id: String,
    pub deal_id: String,
    pub fact_type: String,
    pub label: String,
    pub value: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub unit: Option<String>,
    pub source_citation: JsonValue,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub confidence_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset, ToSchema)]
#[diesel(table_name = facts)]
pub struct UpdateFact {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub unit: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub approved_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub approved_by: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locked: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct SourceCitation {
    pub document: String,
    pub page: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bbox: Option<BoundingBox>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct BoundingBox {
    pub left: f64,
    pub top: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub enum FactType {
    UnitCount,
    OccupancyRate,
    GrossScheduledRent,
    CollectedRent,
    OperatingExpenses,
    NetOperatingIncome,
    DebtService,
    PropertyValue,
    MortgageBalance,
    InterestRate,
    Other,
}

impl FactType {
    pub fn as_str(&self) -> &str {
        match self {
            FactType::UnitCount => "unit_count",
            FactType::OccupancyRate => "occupancy_rate",
            FactType::GrossScheduledRent => "gross_scheduled_rent",
            FactType::CollectedRent => "collected_rent",
            FactType::OperatingExpenses => "operating_expenses",
            FactType::NetOperatingIncome => "net_operating_income",
            FactType::DebtService => "debt_service",
            FactType::PropertyValue => "property_value",
            FactType::MortgageBalance => "mortgage_balance",
            FactType::InterestRate => "interest_rate",
            FactType::Other => "other",
        }
    }
    
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "unit_count" => Some(FactType::UnitCount),
            "occupancy_rate" => Some(FactType::OccupancyRate),
            "gross_scheduled_rent" => Some(FactType::GrossScheduledRent),
            "collected_rent" => Some(FactType::CollectedRent),
            "operating_expenses" => Some(FactType::OperatingExpenses),
            "net_operating_income" => Some(FactType::NetOperatingIncome),
            "debt_service" => Some(FactType::DebtService),
            "property_value" => Some(FactType::PropertyValue),
            "mortgage_balance" => Some(FactType::MortgageBalance),
            "interest_rate" => Some(FactType::InterestRate),
            "other" => Some(FactType::Other),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub enum FactStatus {
    PendingApproval,
    Approved,
    Rejected,
}

impl FactStatus {
    pub fn as_str(&self) -> &str {
        match self {
            FactStatus::PendingApproval => "pending_approval",
            FactStatus::Approved => "approved",
            FactStatus::Rejected => "rejected",
        }
    }
    
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending_approval" => Some(FactStatus::PendingApproval),
            "approved" => Some(FactStatus::Approved),
            "rejected" => Some(FactStatus::Rejected),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct FactResponse {
    pub fact_id: String,
    pub document_id: String,
    pub deal_id: String,
    pub fact_type: String,
    pub label: String,
    pub value: String,
    pub unit: Option<String>,
    pub source_citation: SourceCitation,
    pub status: String,
    pub confidence_score: Option<f64>,
    pub approved_at: Option<DateTime<Utc>>,
    pub approved_by: Option<String>,
    pub locked: bool,
    pub created_at: DateTime<Utc>,
}

impl Fact {
    pub fn to_response(&self) -> Result<FactResponse, serde_json::Error> {
        Ok(FactResponse {
            fact_id: self.fact_id.clone(),
            document_id: self.document_id.clone(),
            deal_id: self.deal_id.clone(),
            fact_type: self.fact_type.clone(),
            label: self.label.clone(),
            value: self.value.clone(),
            unit: self.unit.clone(),
            source_citation: serde_json::from_value(self.source_citation.clone())?,
            status: self.status.clone(),
            confidence_score: self.confidence_score,
            approved_at: self.approved_at,
            approved_by: self.approved_by.clone(),
            locked: self.locked,
            created_at: self.created_at,
        })
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateFactValueRequest {
    pub value: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub unit: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ApproveFactsRequest {
    pub fact_ids: Vec<String>,
}

