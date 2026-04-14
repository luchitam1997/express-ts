-- Demo seed data for local development.
-- Safe to run multiple times.

-- 1) Users
INSERT INTO users (email, name)
VALUES
    ('demo@northstar-mail.com', 'Demo User'),
    ('growth@northstar-mail.com', 'Growth Lead')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name;

-- 2) Recipients
INSERT INTO recipients (email, name)
VALUES
    ('alex@acme.dev', 'Alex'),
    ('sam@acme.dev', 'Sam'),
    ('morgan@acme.dev', 'Morgan'),
    ('jamie@acme.dev', 'Jamie'),
    ('taylor@acme.dev', 'Taylor'),
    ('casey@acme.dev', 'Casey')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name;

-- 3) Campaigns (insert only if missing by creator + name)
WITH seed_campaigns AS (
    SELECT
        u.id AS created_by,
        v.name,
        v.subject,
        v.body,
        v.status,
        v.scheduled_at
    FROM (
        VALUES
            (
                'demo@northstar-mail.com',
                'April Product Update',
                'What shipped this month',
                'Hello team, here is the monthly product update with highlights and next steps.',
                'draft'::VARCHAR,
                NULL::TIMESTAMPTZ
            ),
            (
                'demo@northstar-mail.com',
                'Weekend Offer Blast',
                'Limited weekend discount',
                'Hi there, enjoy 20% off this weekend only. Offer expires Sunday night.',
                'scheduled'::VARCHAR,
                NOW() + INTERVAL '2 hours'
            ),
            (
                'demo@northstar-mail.com',
                'Spring Launch Recap',
                'Thanks for joining our launch',
                'Thank you for joining the launch. Here is a short recap and links to resources.',
                'sent'::VARCHAR,
                NOW() - INTERVAL '2 days'
            ),
            (
                'growth@northstar-mail.com',
                'Retention Check-in',
                'How can we improve your experience?',
                'We value your feedback. Please reply with what would help your team most this quarter.',
                'draft'::VARCHAR,
                NULL::TIMESTAMPTZ
            )
    ) AS v(owner_email, name, subject, body, status, scheduled_at)
    JOIN users u ON u.email = v.owner_email
)
INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by)
SELECT
    sc.name,
    sc.subject,
    sc.body,
    sc.status,
    sc.scheduled_at,
    sc.created_by
FROM seed_campaigns sc
WHERE NOT EXISTS (
    SELECT 1
    FROM campaigns c
    WHERE c.created_by = sc.created_by AND c.name = sc.name
);

-- 4) Campaign recipient statuses
WITH recipient_map AS (
    SELECT
        c.id AS campaign_id,
        r.id AS recipient_id,
        m.status,
        m.sent_at,
        m.opened_at
    FROM (
        VALUES
            ('demo@northstar-mail.com', 'April Product Update', 'alex@acme.dev',   'pending'::VARCHAR, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ),
            ('demo@northstar-mail.com', 'April Product Update', 'sam@acme.dev',    'pending'::VARCHAR, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ),
            ('demo@northstar-mail.com', 'April Product Update', 'morgan@acme.dev', 'pending'::VARCHAR, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ),

            ('demo@northstar-mail.com', 'Weekend Offer Blast', 'alex@acme.dev',  'pending'::VARCHAR, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ),
            ('demo@northstar-mail.com', 'Weekend Offer Blast', 'jamie@acme.dev', 'pending'::VARCHAR, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ),
            ('demo@northstar-mail.com', 'Weekend Offer Blast', 'taylor@acme.dev','pending'::VARCHAR, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ),

            ('demo@northstar-mail.com', 'Spring Launch Recap', 'alex@acme.dev',   'sent'::VARCHAR,   NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 20 hours'),
            ('demo@northstar-mail.com', 'Spring Launch Recap', 'sam@acme.dev',    'sent'::VARCHAR,   NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 22 hours'),
            ('demo@northstar-mail.com', 'Spring Launch Recap', 'morgan@acme.dev', 'failed'::VARCHAR, NOW() - INTERVAL '3 days', NULL::TIMESTAMPTZ),
            ('demo@northstar-mail.com', 'Spring Launch Recap', 'casey@acme.dev',  'sent'::VARCHAR,   NOW() - INTERVAL '3 days', NULL::TIMESTAMPTZ),

            ('growth@northstar-mail.com', 'Retention Check-in', 'jamie@acme.dev', 'pending'::VARCHAR, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ),
            ('growth@northstar-mail.com', 'Retention Check-in', 'taylor@acme.dev','pending'::VARCHAR, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ)
    ) AS m(owner_email, campaign_name, recipient_email, status, sent_at, opened_at)
    JOIN users u ON u.email = m.owner_email
    JOIN campaigns c ON c.created_by = u.id AND c.name = m.campaign_name
    JOIN recipients r ON r.email = m.recipient_email
)
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT
    rm.campaign_id,
    rm.recipient_id,
    rm.status,
    rm.sent_at,
    rm.opened_at
FROM recipient_map rm
ON CONFLICT (campaign_id, recipient_id) DO UPDATE
SET
    status = EXCLUDED.status,
    sent_at = EXCLUDED.sent_at,
    opened_at = EXCLUDED.opened_at;
