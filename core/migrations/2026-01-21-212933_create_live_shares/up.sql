-- Live shareable deal links
CREATE TABLE live_shares (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    deal_id TEXT NOT NULL REFERENCES deals(deal_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    short_id TEXT NOT NULL UNIQUE, -- 8-12 char alphanumeric for URLs
    expires_at TIMESTAMPTZ NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Track anonymous views
CREATE TABLE share_views (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    live_share_id TEXT NOT NULL REFERENCES live_shares(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
);

-- Track investor interest
CREATE TABLE investor_interest (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    live_share_id TEXT NOT NULL REFERENCES live_shares(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12,2), -- Optional investment amount
    status TEXT NOT NULL CHECK (status IN ('Interested', 'Maybe', 'Passed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_live_shares_deal_id ON live_shares(deal_id);
CREATE INDEX idx_live_shares_user_id ON live_shares(user_id);
CREATE INDEX idx_live_shares_short_id ON live_shares(short_id);
CREATE INDEX idx_live_shares_expires_at ON live_shares(expires_at);
CREATE INDEX idx_share_views_live_share_id ON share_views(live_share_id);
CREATE INDEX idx_share_views_viewed_at ON share_views(viewed_at);
CREATE INDEX idx_investor_interest_live_share_id ON investor_interest(live_share_id);

COMMENT ON TABLE live_shares IS 'Shareable deal links with expiration and view tracking';
COMMENT ON TABLE share_views IS 'Anonymous view tracking for public share pages';
COMMENT ON TABLE investor_interest IS 'Investor interest entries tracked per live share';
