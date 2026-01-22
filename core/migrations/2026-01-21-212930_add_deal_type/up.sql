-- Add deal_type enum column to deals table
CREATE TYPE deal_type_enum AS ENUM ('rental_income', 'value_add');

ALTER TABLE deals 
ADD COLUMN deal_type deal_type_enum DEFAULT 'rental_income' NOT NULL;

-- Backfill existing deals as rental_income (already default)
-- No action needed as DEFAULT handles this

-- Add index for filtering by deal type
CREATE INDEX idx_deals_deal_type ON deals(deal_type);

COMMENT ON COLUMN deals.deal_type IS 'Type of real estate deal strategy: rental_income (buy & hold) or value_add (rehab)';
