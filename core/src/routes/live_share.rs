use actix_web::{web, HttpResponse, Result};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::auth::UserInfo;
use crate::models::live_share::{CreateLiveShareRequest, LiveShareResponse};
use crate::utils::clients::get_pg_client;

fn generate_short_id() -> String {
    // Use UUID and take first 10 chars for simplicity
    Uuid::new_v4().to_string().chars().filter(|c| c.is_alphanumeric()).take(10).collect()
}

// POST /api/v1/live-shares
pub async fn create_live_share_route(
    user_info: web::ReqData<UserInfo>,
    req: web::Json<CreateLiveShareRequest>,
) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();
    let id = Uuid::new_v4().to_string();
    let short_id = generate_short_id();
    let expires_at = Utc::now() + Duration::days(req.expires_in_days as i64);

    let client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    // Verify deal exists and belongs to user
    let deal_exists = client
        .query_opt(
            "SELECT deal_id FROM deals WHERE deal_id = $1 AND user_id = $2",
            &[&req.deal_id, &user_id],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Database error")
        })?;

    if deal_exists.is_none() {
        return Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Deal not found"
        })));
    }

    // Create live share
    let row = client
        .query_one(
            "INSERT INTO live_shares (id, deal_id, user_id, short_id, expires_at, view_count, created_at) VALUES ($1, $2, $3, $4, $5, 0, NOW()) RETURNING id, deal_id, user_id, short_id, expires_at, view_count, created_at",
            &[&id, &req.deal_id, &user_id, &short_id, &expires_at],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to create live share")
        })?;

    let base_url = std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let share_url = format!("{}/share/{}", base_url, short_id);

    let response = LiveShareResponse {
        id: row.get("id"),
        deal_id: row.get("deal_id"),
        short_id: row.get("short_id"),
        share_url,
        expires_at: row.get::<_, chrono::DateTime<Utc>>("expires_at").to_rfc3339(),
        view_count: row.get("view_count"),
        is_expired: expires_at < Utc::now(),
        created_at: row.get::<_, chrono::DateTime<Utc>>("created_at").to_rfc3339(),
    };

    Ok(HttpResponse::Ok().json(response))
}

// GET /api/v1/live-shares
pub async fn list_live_shares_route(user_info: web::ReqData<UserInfo>) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();

    let client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    let rows = client
        .query(
            "SELECT id, deal_id, user_id, short_id, expires_at, view_count, created_at FROM live_shares WHERE user_id = $1 ORDER BY created_at DESC",
            &[&user_id],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to fetch live shares")
        })?;

    let base_url = std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let mut shares = Vec::new();

    for row in rows {
        let short_id: String = row.get("short_id");
        let expires_at: chrono::DateTime<Utc> = row.get("expires_at");
        let created_at: chrono::DateTime<Utc> = row.get("created_at");
        
        shares.push(LiveShareResponse {
            id: row.get("id"),
            deal_id: row.get("deal_id"),
            short_id: short_id.clone(),
            share_url: format!("{}/share/{}", base_url, short_id),
            expires_at: expires_at.to_rfc3339(),
            view_count: row.get("view_count"),
            is_expired: expires_at < Utc::now(),
            created_at: created_at.to_rfc3339(),
        });
    }

    Ok(HttpResponse::Ok().json(shares))
}

// GET /api/v1/live-shares/:id
pub async fn get_live_share_route(
    user_info: web::ReqData<UserInfo>,
    id: web::Path<String>,
) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();
    let id = id.into_inner();

    let client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    let row = client
        .query_one(
            "SELECT id, deal_id, user_id, short_id, expires_at, view_count, created_at FROM live_shares WHERE id = $1 AND user_id = $2",
            &[&id, &user_id],
        )
        .await
        .map_err(|_| {
            actix_web::error::ErrorNotFound("Live share not found")
        })?;

    let base_url = std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let short_id: String = row.get("short_id");
    let expires_at: chrono::DateTime<Utc> = row.get("expires_at");
    let created_at: chrono::DateTime<Utc> = row.get("created_at");

    let response = LiveShareResponse {
        id: row.get("id"),
        deal_id: row.get("deal_id"),
        short_id: short_id.clone(),
        share_url: format!("{}/share/{}", base_url, short_id),
        expires_at: expires_at.to_rfc3339(),
        view_count: row.get("view_count"),
        is_expired: expires_at < Utc::now(),
        created_at: created_at.to_rfc3339(),
    };

    Ok(HttpResponse::Ok().json(response))
}

// DELETE /api/v1/live-shares/:id
pub async fn delete_live_share_route(
    user_info: web::ReqData<UserInfo>,
    id: web::Path<String>,
) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();
    let id = id.into_inner();

    let client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    let result = client
        .execute(
            "DELETE FROM live_shares WHERE id = $1 AND user_id = $2",
            &[&id, &user_id],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to delete live share")
        })?;

    if result == 0 {
        return Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Live share not found"
        })));
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Live share deleted successfully"
    })))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TrackViewRequest {
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

// POST /api/v1/share/:short_id/view
pub async fn track_view_route(
    short_id: web::Path<String>,
    req: web::Json<TrackViewRequest>,
) -> Result<HttpResponse> {
    let short_id = short_id.into_inner();

    let client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    // Get live share
    let share = client
        .query_opt(
            "SELECT id, expires_at FROM live_shares WHERE short_id = $1",
            &[&short_id],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Database error")
        })?;

    let share = match share {
        Some(s) => s,
        None => {
            return Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": "Share link not found"
            })));
        }
    };

    let live_share_id: String = share.get("id");
    let expires_at: chrono::DateTime<Utc> = share.get("expires_at");

    // Check if expired
    if expires_at < Utc::now() {
        return Ok(HttpResponse::Gone().json(serde_json::json!({
            "error": "Share link has expired"
        })));
    }

    // Track view
    let view_id = Uuid::new_v4().to_string();
    client
        .execute(
            "INSERT INTO share_views (id, live_share_id, viewed_at, ip_address, user_agent) VALUES ($1, $2, NOW(), $3, $4)",
            &[&view_id, &live_share_id, &req.ip_address, &req.user_agent],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to track view")
        })?;

    // Increment view count
    client
        .execute(
            "UPDATE live_shares SET view_count = view_count + 1 WHERE id = $1",
            &[&live_share_id],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to update view count")
        })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "View tracked successfully"
    })))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInterestRequest {
    pub name: String,
    pub amount: Option<f64>,
    pub status: String,
    pub notes: Option<String>,
}

// POST /api/v1/share/:short_id/interest
pub async fn submit_interest_route(
    short_id: web::Path<String>,
    req: web::Json<CreateInterestRequest>,
) -> Result<HttpResponse> {
    let short_id = short_id.into_inner();

    let client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    // Get live share
    let share = client
        .query_opt(
            "SELECT id, expires_at FROM live_shares WHERE short_id = $1",
            &[&short_id],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Database error")
        })?;

    let share = match share {
        Some(s) => s,
        None => {
            return Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": "Share link not found"
            })));
        }
    };

    let live_share_id: String = share.get("id");
    let expires_at: chrono::DateTime<Utc> = share.get("expires_at");

    // Check if expired
    if expires_at < Utc::now() {
        return Ok(HttpResponse::Gone().json(serde_json::json!({
            "error": "Share link has expired"
        })));
    }

    // Create interest record
    let interest_id = Uuid::new_v4().to_string();
    client
        .execute(
            "INSERT INTO investor_interest (id, live_share_id, name, amount, status, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
            &[&interest_id, &live_share_id, &req.name, &req.amount, &req.status, &req.notes],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to submit interest")
        })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "id": interest_id,
        "message": "Interest submitted successfully"
    })))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyticsResponse {
    pub view_count: i32,
    pub interest_count: i64,
    pub total_interest_amount: Option<f64>,
    pub is_expired: bool,
    pub expires_at: String,
}

// GET /api/v1/live-shares/:id/analytics
pub async fn get_analytics_route(
    user_info: web::ReqData<UserInfo>,
    id: web::Path<String>,
) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();
    let id = id.into_inner();

    let client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    // Get live share
    let share = client
        .query_one(
            "SELECT id, expires_at, view_count FROM live_shares WHERE id = $1 AND user_id = $2",
            &[&id, &user_id],
        )
        .await
        .map_err(|_| {
            actix_web::error::ErrorNotFound("Live share not found")
        })?;

    let live_share_id: String = share.get("id");
    let expires_at: chrono::DateTime<Utc> = share.get("expires_at");
    let view_count: i32 = share.get("view_count");

    // Get interest stats
    let interest_stats = client
        .query_one(
            "SELECT COUNT(*) as count, SUM(amount) as total FROM investor_interest WHERE live_share_id = $1",
            &[&live_share_id],
        )
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to fetch analytics")
        })?;

    let interest_count: i64 = interest_stats.get("count");
    let total_amount: Option<f64> = interest_stats.get("total");

    let response = AnalyticsResponse {
        view_count,
        interest_count,
        total_interest_amount: total_amount,
        is_expired: expires_at < Utc::now(),
        expires_at: expires_at.to_rfc3339(),
    };

    Ok(HttpResponse::Ok().json(response))
}
