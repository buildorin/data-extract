DROP TRIGGER IF EXISTS update_scoring_formulas_updated_at ON scoring_formulas;
DROP INDEX IF EXISTS idx_scoring_formulas_user_id;
DROP INDEX IF EXISTS idx_scoring_formulas_deal_id;
DROP INDEX IF EXISTS idx_scoring_formulas_active;
DROP TABLE IF EXISTS scoring_formulas;
