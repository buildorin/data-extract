use actix_web::{web, HttpResponse, Result};
use chrono::Utc;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

use crate::agents::chat_orchestrator::ChatOrchestratorAgent;
use crate::models::auth::UserInfo;
use crate::utils::clients::get_pg_client;

// POST /api/v1/conversations - Create new conversation
#[derive(Debug, Deserialize)]
pub struct CreateConversationRequest {
    pub deal_id: Option<String>,
    pub title: Option<String>,
}

pub async fn create_conversation(
    user_info: web::ReqData<UserInfo>,
    req: web::Json<CreateConversationRequest>,
) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();
    let conversation_id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();

    let new_conversation = NewConversation {
        conversation_id: conversation_id.clone(),
        user_id,
        deal_id: req.deal_id.clone(),
        title: req.title.clone(),
        context: None,
        created_at: now,
        updated_at: now,
    };

    let mut client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    use crate::data::schema::conversations;

    diesel::insert_into(conversations::table)
        .values(&new_conversation)
        .execute(&mut client)
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to create conversation")
        })?;

    Ok(HttpResponse::Ok().json(json!({
        "conversation_id": conversation_id,
        "deal_id": req.deal_id,
        "title": req.title,
    })))
}

// GET /api/v1/conversations - List user's conversations
pub async fn list_conversations(user_info: web::ReqData<UserInfo>) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();

    let mut client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    use crate::data::schema::conversations;

    let results: Vec<Conversation> = conversations::table
        .filter(conversations::user_id.eq(&user_id))
        .order(conversations::updated_at.desc())
        .load::<Conversation>(&mut client)
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to fetch conversations")
        })?;

    Ok(HttpResponse::Ok().json(results))
}

// GET /api/v1/conversations/:conversation_id - Get conversation details
pub async fn get_conversation(
    user_info: web::ReqData<UserInfo>,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();
    let conversation_id = path.into_inner();

    let mut client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    use crate::data::schema::{conversations, messages};

    // Get conversation
    let conversation: Conversation = conversations::table
        .filter(conversations::conversation_id.eq(&conversation_id))
        .filter(conversations::user_id.eq(&user_id))
        .first::<Conversation>(&mut client)
        .await
        .map_err(|_| actix_web::error::ErrorNotFound("Conversation not found"))?;

    // Get messages
    let msgs: Vec<Message> = messages::table
        .filter(messages::conversation_id.eq(&conversation_id))
        .order(messages::created_at.asc())
        .load::<Message>(&mut client)
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to fetch messages")
        })?;

    Ok(HttpResponse::Ok().json(json!({
        "conversation": conversation,
        "messages": msgs,
    })))
}

// POST /api/v1/conversations/:conversation_id/messages - Send message
#[derive(Debug, Deserialize)]
pub struct SendMessageRequest {
    pub content: String,
}

pub async fn send_message(
    user_info: web::ReqData<UserInfo>,
    path: web::Path<String>,
    req: web::Json<SendMessageRequest>,
) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();
    let conversation_id = path.into_inner();

    // Verify conversation belongs to user and get deal_id
    let mut client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    use crate::data::schema::conversations;

    let conversation: Conversation = conversations::table
        .filter(conversations::conversation_id.eq(&conversation_id))
        .filter(conversations::user_id.eq(&user_id))
        .first::<Conversation>(&mut client)
        .await
        .map_err(|_| actix_web::error::ErrorNotFound("Conversation not found"))?;

    // Process message with chat orchestrator
    let orchestrator = ChatOrchestratorAgent::new()
        .await
        .map_err(|e| {
            eprintln!("Failed to initialize chat orchestrator: {:?}", e);
            actix_web::error::ErrorInternalServerError("Chat service unavailable")
        })?;

    let result = orchestrator
        .process_message(
            &conversation_id,
            &req.content,
            &user_id,
            conversation.deal_id.clone(),
            true, // User is authenticated
        )
        .await
        .map_err(|e| {
            eprintln!("Chat processing error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to process message")
        })?;

    // Update conversation updated_at
    diesel::update(conversations::table.filter(conversations::conversation_id.eq(&conversation_id)))
        .set(conversations::updated_at.eq(Utc::now().naive_utc()))
        .execute(&mut client)
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to update conversation")
        })?;

    Ok(HttpResponse::Ok().json(json!({
        "response": result.response,
        "intent": result.intent,
        "action": result.action,
        "context_used": result.context_used,
    })))
}

// DELETE /api/v1/conversations/:conversation_id - Delete conversation
pub async fn delete_conversation(
    user_info: web::ReqData<UserInfo>,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let user_id = user_info.user_id.clone();
    let conversation_id = path.into_inner();

    let mut client = get_pg_client().await.map_err(|e| {
        eprintln!("Database connection error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Database connection failed")
    })?;

    use crate::data::schema::conversations;

    // Delete conversation (messages will cascade)
    let deleted = diesel::delete(
        conversations::table
            .filter(conversations::conversation_id.eq(&conversation_id))
            .filter(conversations::user_id.eq(&user_id)),
    )
    .execute(&mut client)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        actix_web::error::ErrorInternalServerError("Failed to delete conversation")
    })?;

    if deleted == 0 {
        return Err(actix_web::error::ErrorNotFound("Conversation not found"));
    }

    Ok(HttpResponse::Ok().json(json!({
        "success": true,
    })))
}

// POST /api/v1/conversations/public/message - Public chat (no auth required)
#[derive(Debug, Deserialize)]
pub struct PublicMessageRequest {
    pub content: String,
    pub session_id: Option<String>, // For tracking conversation without auth
}

pub async fn send_public_message(
    req: web::Json<PublicMessageRequest>,
) -> Result<HttpResponse> {
    let session_id = req.session_id.clone().unwrap_or_else(|| Uuid::new_v4().to_string());

    // For public chat, we don't store messages but still use the orchestrator
    let orchestrator = ChatOrchestratorAgent::new()
        .await
        .map_err(|e| {
            eprintln!("Failed to initialize chat orchestrator: {:?}", e);
            actix_web::error::ErrorInternalServerError("Chat service unavailable")
        })?;

    // Use a temporary conversation ID for public users
    let temp_conversation_id = format!("public-{}", session_id);

    let result = orchestrator
        .process_message(
            &temp_conversation_id,
            &req.content,
            "anonymous",
            None,
            false, // Not authenticated
        )
        .await
        .map_err(|e| {
            eprintln!("Chat processing error: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to process message")
        })?;

    Ok(HttpResponse::Ok().json(json!({
        "response": result.response,
        "session_id": session_id,
        "intent": result.intent,
    })))
}

// Diesel models
#[derive(Debug, Clone, Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::data::schema::conversations)]
struct Conversation {
    conversation_id: String,
    user_id: String,
    deal_id: Option<String>,
    title: Option<String>,
    context: Option<serde_json::Value>,
    created_at: chrono::NaiveDateTime,
    updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = crate::data::schema::conversations)]
struct NewConversation {
    conversation_id: String,
    user_id: String,
    deal_id: Option<String>,
    title: Option<String>,
    context: Option<serde_json::Value>,
    created_at: chrono::NaiveDateTime,
    updated_at: chrono::NaiveDateTime,
}

#[derive(Debug, Clone, Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::data::schema::messages)]
struct Message {
    message_id: String,
    conversation_id: String,
    role: String,
    content: String,
    metadata: Option<serde_json::Value>,
    embedding_id: Option<String>,
    created_at: chrono::NaiveDateTime,
}

