use crate::data::schema::deals;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, ToSchema)]
#[diesel(table_name = deals)]
#[diesel(primary_key(deal_id))]
pub struct Deal {
    pub deal_id: String,
    pub user_id: String,
    pub deal_name: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub metadata: JsonValue,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, ToSchema)]
#[diesel(table_name = deals)]
pub struct NewDeal {
    pub deal_id: String,
    pub user_id: String,
    pub deal_name: String,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<JsonValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset, ToSchema)]
#[diesel(table_name = deals)]
pub struct UpdateDeal {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deal_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<JsonValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub enum DealStatus {
    Draft,
    ProcessingDocuments,
    FactReview,
    ReadyForUnderwriting,
    Complete,
}

impl DealStatus {
    pub fn as_str(&self) -> &str {
        match self {
            DealStatus::Draft => "draft",
            DealStatus::ProcessingDocuments => "processing_documents",
            DealStatus::FactReview => "fact_review",
            DealStatus::ReadyForUnderwriting => "ready_for_underwriting",
            DealStatus::Complete => "complete",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "draft" => Some(DealStatus::Draft),
            "processing_documents" => Some(DealStatus::ProcessingDocuments),
            "fact_review" => Some(DealStatus::FactReview),
            "ready_for_underwriting" => Some(DealStatus::ReadyForUnderwriting),
            "complete" => Some(DealStatus::Complete),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateDealRequest {
    pub deal_name: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DealResponse {
    pub deal_id: String,
    pub user_id: String,
    pub deal_name: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub metadata: JsonValue,
    pub document_count: Option<i64>,
    pub fact_count: Option<i64>,
}

impl From<Deal> for DealResponse {
    fn from(deal: Deal) -> Self {
        DealResponse {
            deal_id: deal.deal_id,
            user_id: deal.user_id,
            deal_name: deal.deal_name,
            status: deal.status,
            created_at: deal.created_at,
            updated_at: deal.updated_at,
            metadata: deal.metadata,
            document_count: None,
            fact_count: None,
        }
    }
}
