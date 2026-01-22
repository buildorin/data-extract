-- Add Orin Score fields to deals table
ALTER TABLE deals
ADD COLUMN orin_score INTEGER CHECK (orin_score >= 0 AND orin_score <= 100),
ADD COLUMN orin_score_breakdown JSONB,
ADD COLUMN orin_score_calculated_at TIMESTAMPTZ,
ADD COLUMN orin_score_tier TEXT CHECK (orin_score_tier IN ('strong', 'good', 'risky', 'pass'));

-- Add index for filtering by score
CREATE INDEX idx_deals_orin_score ON deals(orin_score) WHERE orin_score IS NOT NULL;
CREATE INDEX idx_deals_orin_score_tier ON deals(orin_score_tier) WHERE orin_score_tier IS NOT NULL;

COMMENT ON COLUMN deals.orin_score IS 'Orin Score (0-100) calculated by scoring agent';
COMMENT ON COLUMN deals.orin_score_breakdown IS 'JSON breakdown of score components: {dscr_health: 28, cap_rate: 23, ...}';
COMMENT ON COLUMN deals.orin_score_calculated_at IS 'Timestamp of last score calculation';
COMMENT ON COLUMN deals.orin_score_tier IS 'Score tier: strong (85-100), good (70-84), risky (50-69), pass (0-49)';
