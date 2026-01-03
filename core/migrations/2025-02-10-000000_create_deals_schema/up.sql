-- Create deals table
CREATE TABLE deals (
    deal_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    deal_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create documents table
CREATE TABLE documents (
    document_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    deal_id TEXT NOT NULL REFERENCES deals(deal_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    storage_location TEXT,
    page_count INTEGER,
    ocr_output JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create facts table
CREATE TABLE facts (
    fact_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id TEXT NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    deal_id TEXT NOT NULL REFERENCES deals(deal_id) ON DELETE CASCADE,
    fact_type TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    source_citation JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_approval',
    confidence_score FLOAT8,
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_documents_deal_id ON documents(deal_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_facts_deal_id ON facts(deal_id);
CREATE INDEX idx_facts_document_id ON facts(document_id);
CREATE INDEX idx_facts_status ON facts(status);
CREATE INDEX idx_facts_locked ON facts(locked);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deals table
CREATE TRIGGER deals_updated_at_trigger
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_deals_updated_at();

