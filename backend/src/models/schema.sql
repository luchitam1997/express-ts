
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
    scheduled_at TIMESTAMPTZ,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipients (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_recipients (
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    recipient_id BIGINT NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    PRIMARY KEY (campaign_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_created_by_created_at
    ON campaigns (created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_status_scheduled_at
    ON campaigns (status, scheduled_at)
    WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign
    ON campaign_recipients (campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_status
    ON campaign_recipients (campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_opened
    ON campaign_recipients (campaign_id, opened_at);
