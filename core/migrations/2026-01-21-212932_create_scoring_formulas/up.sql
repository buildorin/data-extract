-- Table to store user-customizable scoring formulas
CREATE TABLE scoring_formulas (
    formula_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    deal_id TEXT REFERENCES deals(deal_id) ON DELETE CASCADE, -- NULL = user-level default
    formula_name TEXT NOT NULL,
    formula_config JSONB NOT NULL, -- Stores weights, thresholds, custom logic
    deal_type deal_type_enum NOT NULL DEFAULT 'rental_income',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_scoring_formulas_user_id ON scoring_formulas(user_id);
CREATE INDEX idx_scoring_formulas_deal_id ON scoring_formulas(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_scoring_formulas_active ON scoring_formulas(is_active) WHERE is_active = TRUE;

-- Ensure only one active formula per user/deal combo using partial unique index
CREATE UNIQUE INDEX unique_active_formula 
ON scoring_formulas(user_id, deal_id, deal_type) 
WHERE is_active = TRUE;

-- Example formula_config structure:
COMMENT ON COLUMN scoring_formulas.formula_config IS 
'JSON config: {
  "components": [
    {"name": "dscr_health", "weight": 30, "threshold": 1.75, "scale": "linear"},
    {"name": "cap_rate_vs_market", "weight": 25, "market_multiplier": 1.2},
    {"name": "occupancy_stability", "weight": 20, "min_occupancy": 0.90},
    {"name": "cash_flow_sustainability", "weight": 15, "min_cash_flow": 0},
    {"name": "location_score", "weight": 10, "placeholder": true}
  ],
  "custom_logic": "optional natural language description for LLM interpretation"
}';

-- Trigger to update updated_at
CREATE TRIGGER update_scoring_formulas_updated_at
BEFORE UPDATE ON scoring_formulas
FOR EACH ROW
EXECUTE FUNCTION update_deals_updated_at(); -- Reuse existing trigger function
