use crate::data::schema::{investor_interest, live_shares, share_views};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use bigdecimal::BigDecimal;

// Live Share
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, ToSchema)]
#[diesel(table_name = live_shares)]
#[diesel(primary_key(id))]
pub struct LiveShare {
    pub id: String,
    pub deal_id: String,
    pub user_id: String,
    pub short_id: String,
    pub expires_at: DateTime<Utc>,
    pub view_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, ToSchema)]
#[diesel(table_name = live_shares)]
pub struct NewLiveShare {
    pub id: String,
    pub deal_id: String,
    pub user_id: String,
    pub short_id: String,
    pub expires_at: DateTime<Utc>,
}

// Share View
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, ToSchema)]
#[diesel(table_name = share_views)]
#[diesel(primary_key(id))]
pub struct ShareView {
    pub id: String,
    pub live_share_id: String,
    pub viewed_at: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, ToSchema)]
#[diesel(table_name = share_views)]
pub struct NewShareView {
    pub id: String,
    pub live_share_id: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

// Investor Interest
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, ToSchema)]
#[diesel(table_name = investor_interest)]
#[diesel(primary_key(id))]
pub struct InvestorInterest {
    pub id: String,
    pub live_share_id: String,
    pub name: String,
    #[serde(skip)]
    pub amount: Option<BigDecimal>,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, ToSchema)]
#[diesel(table_name = investor_interest)]
pub struct NewInvestorInterest {
    pub id: String,
    pub live_share_id: String,
    pub name: String,
    #[serde(skip)]
    pub amount: Option<BigDecimal>,
    pub status: String,
    pub notes: Option<String>,
}

// Request/Response DTOs
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateLiveShareRequest {
    pub deal_id: String,
    pub expires_in_days: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct LiveShareResponse {
    pub id: String,
    pub deal_id: String,
    pub short_id: String,
    pub share_url: String, // Constructed: {base_url}/share/{short_id}
    pub expires_at: String,
    pub view_count: i32,
    pub is_expired: bool,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateInterestRequest {
    pub name: String,
    pub amount: Option<f64>,
    pub status: String, // 'Interested', 'Maybe', 'Passed'
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct InterestResponse {
    pub id: String,
    pub live_share_id: String,
    pub name: String,
    pub amount: Option<f64>,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: String,
}
