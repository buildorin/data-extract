DROP INDEX IF EXISTS idx_deals_deal_type;
ALTER TABLE deals DROP COLUMN IF EXISTS deal_type;
DROP TYPE IF EXISTS deal_type_enum;
