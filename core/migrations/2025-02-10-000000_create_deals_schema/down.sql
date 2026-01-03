-- Drop trigger and function
DROP TRIGGER IF EXISTS deals_updated_at_trigger ON deals;
DROP FUNCTION IF EXISTS update_deals_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_facts_locked;
DROP INDEX IF EXISTS idx_facts_status;
DROP INDEX IF EXISTS idx_facts_document_id;
DROP INDEX IF EXISTS idx_facts_deal_id;
DROP INDEX IF EXISTS idx_documents_status;
DROP INDEX IF EXISTS idx_documents_deal_id;
DROP INDEX IF EXISTS idx_deals_status;
DROP INDEX IF EXISTS idx_deals_user_id;

-- Drop tables (in reverse order of creation due to foreign keys)
DROP TABLE IF EXISTS facts;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS deals;

