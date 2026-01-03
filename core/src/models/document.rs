use crate::data::schema::documents;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Associations, ToSchema)]
#[diesel(table_name = documents)]
#[diesel(primary_key(document_id))]
#[diesel(belongs_to(crate::models::deal::Deal, foreign_key = deal_id))]
pub struct Document {
    pub document_id: String,
    pub deal_id: String,
    pub file_name: String,
    pub document_type: String,
    pub status: String,
    pub storage_location: Option<String>,
    pub page_count: Option<i32>,
    pub ocr_output: Option<JsonValue>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, ToSchema)]
#[diesel(table_name = documents)]
pub struct NewDocument {
    pub document_id: String,
    pub deal_id: String,
    pub file_name: String,
    pub document_type: String,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub storage_location: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ocr_output: Option<JsonValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset, ToSchema)]
#[diesel(table_name = documents)]
pub struct UpdateDocument {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub storage_location: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ocr_output: Option<JsonValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub enum DocumentType {
    RentRoll,
    ProfitAndLoss,
    MortgageStatement,
    TaxDocument,
    BankStatement,
    PropertyDeed,
    InsurancePolicy,
    Other,
}

impl DocumentType {
    pub fn as_str(&self) -> &str {
        match self {
            DocumentType::RentRoll => "rent_roll",
            DocumentType::ProfitAndLoss => "profit_and_loss",
            DocumentType::MortgageStatement => "mortgage_statement",
            DocumentType::TaxDocument => "tax_document",
            DocumentType::BankStatement => "bank_statement",
            DocumentType::PropertyDeed => "property_deed",
            DocumentType::InsurancePolicy => "insurance_policy",
            DocumentType::Other => "other",
        }
    }
    
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "rent_roll" => Some(DocumentType::RentRoll),
            "profit_and_loss" => Some(DocumentType::ProfitAndLoss),
            "mortgage_statement" => Some(DocumentType::MortgageStatement),
            "tax_document" => Some(DocumentType::TaxDocument),
            "bank_statement" => Some(DocumentType::BankStatement),
            "property_deed" => Some(DocumentType::PropertyDeed),
            "insurance_policy" => Some(DocumentType::InsurancePolicy),
            "other" => Some(DocumentType::Other),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub enum DocumentStatus {
    Pending,
    Processing,
    Completed,
    Failed,
}

impl DocumentStatus {
    pub fn as_str(&self) -> &str {
        match self {
            DocumentStatus::Pending => "pending",
            DocumentStatus::Processing => "processing",
            DocumentStatus::Completed => "completed",
            DocumentStatus::Failed => "failed",
        }
    }
    
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(DocumentStatus::Pending),
            "processing" => Some(DocumentStatus::Processing),
            "completed" => Some(DocumentStatus::Completed),
            "failed" => Some(DocumentStatus::Failed),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DocumentResponse {
    pub document_id: String,
    pub deal_id: String,
    pub file_name: String,
    pub document_type: String,
    pub status: String,
    pub storage_location: Option<String>,
    pub page_count: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub fact_count: Option<i64>,
}

impl From<Document> for DocumentResponse {
    fn from(doc: Document) -> Self {
        DocumentResponse {
            document_id: doc.document_id,
            deal_id: doc.deal_id,
            file_name: doc.file_name,
            document_type: doc.document_type,
            status: doc.status,
            storage_location: doc.storage_location,
            page_count: doc.page_count,
            created_at: doc.created_at,
            fact_count: None,
        }
    }
}

