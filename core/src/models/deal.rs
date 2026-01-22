use crate::data::schema::deals;
use crate::data::schema::sql_types::DealTypeEnum;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use utoipa::ToSchema;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema, diesel::deserialize::FromSqlRow, diesel::expression::AsExpression)]
#[diesel(sql_type = DealTypeEnum)]
#[serde(rename_all = "snake_case")]
pub enum DealType {
    #[serde(rename = "rental_income")]
    RentalIncome,
    #[serde(rename = "value_add")]
    ValueAdd,
}

impl diesel::serialize::ToSql<DealTypeEnum, diesel::pg::Pg> for DealType {
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, diesel::pg::Pg>) -> diesel::serialize::Result {
        use std::io::Write;
        match *self {
            DealType::RentalIncome => out.write_all(b"rental_income")?,
            DealType::ValueAdd => out.write_all(b"value_add")?,
        }
        Ok(diesel::serialize::IsNull::No)
    }
}

impl diesel::deserialize::FromSql<DealTypeEnum, diesel::pg::Pg> for DealType {
    fn from_sql(bytes: diesel::pg::PgValue) -> diesel::deserialize::Result<Self> {
        match bytes.as_bytes() {
            b"rental_income" => Ok(DealType::RentalIncome),
            b"value_add" => Ok(DealType::ValueAdd),
            _ => Err("Unrecognized enum variant".into()),
        }
    }
}

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
    pub deal_type: DealType,
    pub orin_score: Option<i32>,
    pub orin_score_breakdown: Option<JsonValue>,
    pub orin_score_calculated_at: Option<DateTime<Utc>>,
    pub orin_score_tier: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, ToSchema)]
#[diesel(table_name = deals)]
pub struct NewDeal {
    pub deal_id: String,
    pub user_id: String,
    pub deal_name: String,
    pub status: String,
    pub deal_type: DealType,
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
    pub deal_type: Option<DealType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orin_score: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orin_score_breakdown: Option<JsonValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orin_score_calculated_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orin_score_tier: Option<String>,
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
    #[serde(default = "default_deal_type")]
    pub deal_type: DealType,
}

fn default_deal_type() -> DealType {
    DealType::RentalIncome
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DealResponse {
    pub deal_id: String,
    pub user_id: String,
    pub deal_name: String,
    pub status: String,
    pub deal_type: DealType,
    pub orin_score: Option<i32>,
    pub orin_score_breakdown: Option<JsonValue>,
    pub orin_score_calculated_at: Option<DateTime<Utc>>,
    pub orin_score_tier: Option<String>,
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
            deal_type: deal.deal_type,
            orin_score: deal.orin_score,
            orin_score_breakdown: deal.orin_score_breakdown,
            orin_score_calculated_at: deal.orin_score_calculated_at,
            orin_score_tier: deal.orin_score_tier,
            created_at: deal.created_at,
            updated_at: deal.updated_at,
            metadata: deal.metadata,
            document_count: None,
            fact_count: None,
        }
    }
}

