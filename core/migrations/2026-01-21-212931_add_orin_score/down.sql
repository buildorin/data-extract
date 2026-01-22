DROP INDEX IF EXISTS idx_deals_orin_score;
DROP INDEX IF EXISTS idx_deals_orin_score_tier;
ALTER TABLE deals 
DROP COLUMN IF EXISTS orin_score,
DROP COLUMN IF EXISTS orin_score_breakdown,
DROP COLUMN IF EXISTS orin_score_calculated_at,
DROP COLUMN IF EXISTS orin_score_tier;
