// @generated automatically by Diesel CLI.

pub mod sql_types {
    #[derive(diesel::query_builder::QueryId, diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "deal_type_enum"))]
    pub struct DealTypeEnum;
}

diesel::table! {
    agent_executions (execution_id) {
        #[max_length = 255]
        execution_id -> Varchar,
        #[max_length = 100]
        agent_type -> Varchar,
        #[max_length = 255]
        entity_id -> Nullable<Varchar>,
        #[max_length = 100]
        entity_type -> Nullable<Varchar>,
        input -> Jsonb,
        output -> Nullable<Jsonb>,
        #[max_length = 50]
        status -> Varchar,
        error -> Nullable<Text>,
        #[max_length = 50]
        llm_provider -> Nullable<Varchar>,
        #[max_length = 100]
        model -> Nullable<Varchar>,
        tokens_used -> Nullable<Int4>,
        execution_time_ms -> Nullable<Int4>,
        created_at -> Timestamp,
        completed_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    api_keys (key) {
        key -> Text,
        user_id -> Nullable<Text>,
        dataset_id -> Nullable<Text>,
        org_id -> Nullable<Text>,
        access_level -> Nullable<Text>,
        active -> Nullable<Bool>,
        deleted -> Nullable<Bool>,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        expires_at -> Nullable<Timestamptz>,
        deleted_at -> Nullable<Timestamptz>,
        deleted_by -> Nullable<Text>,
    }
}

diesel::table! {
    conversations (conversation_id) {
        #[max_length = 255]
        conversation_id -> Varchar,
        #[max_length = 255]
        user_id -> Varchar,
        #[max_length = 255]
        deal_id -> Nullable<Varchar>,
        #[max_length = 500]
        title -> Nullable<Varchar>,
        context -> Nullable<Jsonb>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::DealTypeEnum;

    deals (deal_id) {
        deal_id -> Text,
        user_id -> Text,
        deal_name -> Text,
        status -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        metadata -> Nullable<Jsonb>,
        deal_type -> DealTypeEnum,
        orin_score -> Nullable<Int4>,
        orin_score_breakdown -> Nullable<Jsonb>,
        orin_score_calculated_at -> Nullable<Timestamptz>,
        orin_score_tier -> Nullable<Text>,
    }
}

diesel::table! {
    documents (document_id) {
        document_id -> Text,
        deal_id -> Text,
        file_name -> Text,
        document_type -> Text,
        status -> Text,
        storage_location -> Nullable<Text>,
        page_count -> Nullable<Int4>,
        ocr_output -> Nullable<Jsonb>,
        created_at -> Nullable<Timestamptz>,
        ocr_completed_at -> Nullable<Timestamp>,
        #[max_length = 50]
        fact_extraction_status -> Nullable<Varchar>,
        fact_extraction_completed_at -> Nullable<Timestamp>,
        #[max_length = 255]
        embedding_id -> Nullable<Varchar>,
    }
}

diesel::table! {
    facts (fact_id) {
        fact_id -> Text,
        document_id -> Text,
        deal_id -> Text,
        fact_type -> Text,
        label -> Text,
        value -> Text,
        unit -> Nullable<Text>,
        source_citation -> Jsonb,
        status -> Text,
        confidence_score -> Nullable<Float8>,
        approved_at -> Nullable<Timestamptz>,
        approved_by -> Nullable<Text>,
        locked -> Nullable<Bool>,
        created_at -> Nullable<Timestamptz>,
        #[max_length = 50]
        extraction_method -> Nullable<Varchar>,
        reviewed_by_user -> Nullable<Bool>,
        #[max_length = 255]
        embedding_id -> Nullable<Varchar>,
    }
}

diesel::table! {
    investor_interest (id) {
        id -> Text,
        live_share_id -> Text,
        name -> Text,
        amount -> Nullable<Numeric>,
        status -> Text,
        notes -> Nullable<Text>,
        created_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    investor_memos (memo_id) {
        #[max_length = 255]
        memo_id -> Varchar,
        #[max_length = 255]
        deal_id -> Varchar,
        #[max_length = 500]
        title -> Nullable<Varchar>,
        content -> Text,
        sections -> Nullable<Jsonb>,
        version -> Nullable<Int4>,
        #[max_length = 50]
        status -> Nullable<Varchar>,
        created_by_agent -> Nullable<Bool>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    invoices (invoice_id) {
        invoice_id -> Text,
        user_id -> Text,
        tasks -> Array<Nullable<Text>>,
        date_created -> Timestamp,
        date_paid -> Nullable<Timestamp>,
        invoice_status -> Text,
        amount_due -> Float8,
        total_pages -> Int4,
        stripe_invoice_id -> Nullable<Text>,
        bill_date -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    live_shares (id) {
        id -> Text,
        deal_id -> Text,
        user_id -> Text,
        short_id -> Text,
        expires_at -> Timestamptz,
        view_count -> Int4,
        created_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    messages (message_id) {
        #[max_length = 255]
        message_id -> Varchar,
        #[max_length = 255]
        conversation_id -> Varchar,
        #[max_length = 50]
        role -> Varchar,
        content -> Text,
        metadata -> Nullable<Jsonb>,
        #[max_length = 255]
        embedding_id -> Nullable<Varchar>,
        created_at -> Timestamp,
    }
}

diesel::table! {
    monthly_usage (id) {
        id -> Int4,
        user_id -> Text,
        usage -> Nullable<Int4>,
        usage_type -> Text,
        year -> Int4,
        month -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        overage_usage -> Nullable<Int4>,
        tier -> Nullable<Text>,
        usage_limit -> Nullable<Int4>,
        billing_cycle_start -> Nullable<Timestamptz>,
        billing_cycle_end -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    pre_applied_free_pages (id) {
        email -> Nullable<Text>,
        consumed -> Nullable<Bool>,
        usage_type -> Text,
        amount -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        id -> Int4,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::DealTypeEnum;

    scoring_formulas (formula_id) {
        formula_id -> Text,
        user_id -> Text,
        deal_id -> Nullable<Text>,
        formula_name -> Text,
        formula_config -> Jsonb,
        deal_type -> DealTypeEnum,
        is_active -> Nullable<Bool>,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    segment_process (id) {
        id -> Text,
        user_id -> Nullable<Text>,
        task_id -> Nullable<Text>,
        segment_id -> Nullable<Text>,
        process_type -> Nullable<Text>,
        model_name -> Nullable<Text>,
        base_url -> Nullable<Text>,
        input_tokens -> Nullable<Int4>,
        output_tokens -> Nullable<Int4>,
        input_price -> Nullable<Float8>,
        output_price -> Nullable<Float8>,
        total_cost -> Nullable<Float8>,
        detail -> Nullable<Text>,
        latency -> Nullable<Float8>,
        avg_ocr_confidence -> Nullable<Float8>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    share_views (id) {
        id -> Text,
        live_share_id -> Text,
        viewed_at -> Nullable<Timestamptz>,
        ip_address -> Nullable<Text>,
        user_agent -> Nullable<Text>,
    }
}

diesel::table! {
    subscriptions (user_id) {
        user_id -> Text,
        stripe_subscription_id -> Nullable<Text>,
        tier -> Text,
        last_paid_date -> Nullable<Timestamptz>,
        last_paid_status -> Nullable<Text>,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    task_invoices (task_id) {
        task_id -> Text,
        invoice_id -> Text,
        usage_type -> Text,
        pages -> Int4,
        cost -> Float8,
        created_at -> Timestamp,
        bill_date -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    tasks (task_id) {
        task_id -> Text,
        user_id -> Nullable<Text>,
        api_key -> Nullable<Text>,
        file_name -> Nullable<Text>,
        file_size -> Nullable<Int8>,
        page_count -> Nullable<Int4>,
        segment_count -> Nullable<Int4>,
        created_at -> Nullable<Timestamptz>,
        expires_at -> Nullable<Timestamptz>,
        finished_at -> Nullable<Timestamptz>,
        status -> Nullable<Text>,
        task_url -> Nullable<Text>,
        input_location -> Nullable<Text>,
        output_location -> Nullable<Text>,
        configuration -> Nullable<Text>,
        message -> Nullable<Text>,
        image_folder_location -> Nullable<Text>,
        pdf_location -> Nullable<Text>,
        #[max_length = 255]
        mime_type -> Nullable<Varchar>,
        started_at -> Nullable<Timestamptz>,
        #[max_length = 255]
        version -> Nullable<Varchar>,
    }
}

diesel::table! {
    tiers (tier) {
        tier -> Text,
        price_per_month -> Float8,
        usage_limit -> Int4,
        overage_rate -> Float8,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    usage (id) {
        id -> Int4,
        user_id -> Nullable<Text>,
        #[sql_name = "usage"]
        usage_value -> Nullable<Int4>,
        usage_type -> Nullable<Text>,
        unit -> Nullable<Text>,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    usage_type (id) {
        id -> Text,
        #[sql_name = "type"]
        type_ -> Text,
        description -> Text,
        unit -> Nullable<Text>,
        cost_per_unit_dollars -> Nullable<Float8>,
    }
}

diesel::table! {
    users (user_id) {
        user_id -> Text,
        customer_id -> Nullable<Text>,
        email -> Nullable<Text>,
        first_name -> Nullable<Text>,
        last_name -> Nullable<Text>,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        tier -> Nullable<Text>,
        invoice_status -> Nullable<Text>,
        task_count -> Nullable<Int4>,
    }
}

diesel::joinable!(conversations -> deals (deal_id));
diesel::joinable!(conversations -> users (user_id));
diesel::joinable!(deals -> users (user_id));
diesel::joinable!(documents -> deals (deal_id));
diesel::joinable!(facts -> deals (deal_id));
diesel::joinable!(facts -> documents (document_id));
diesel::joinable!(investor_interest -> live_shares (live_share_id));
diesel::joinable!(investor_memos -> deals (deal_id));
diesel::joinable!(live_shares -> deals (deal_id));
diesel::joinable!(live_shares -> users (user_id));
diesel::joinable!(messages -> conversations (conversation_id));
diesel::joinable!(monthly_usage -> tiers (tier));
diesel::joinable!(scoring_formulas -> deals (deal_id));
diesel::joinable!(scoring_formulas -> users (user_id));
diesel::joinable!(share_views -> live_shares (live_share_id));
diesel::joinable!(subscriptions -> tiers (tier));
diesel::joinable!(subscriptions -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    agent_executions,
    api_keys,
    conversations,
    deals,
    documents,
    facts,
    investor_interest,
    investor_memos,
    invoices,
    live_shares,
    messages,
    monthly_usage,
    pre_applied_free_pages,
    scoring_formulas,
    segment_process,
    share_views,
    subscriptions,
    task_invoices,
    tasks,
    tiers,
    usage,
    usage_type,
    users,
);
