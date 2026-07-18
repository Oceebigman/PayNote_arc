-- PayNote canonical schema
-- Source of truth for the database structure. Matches the code's
-- expectations exactly. If the code and this file drift, the code
-- wins and this file gets updated.
--
-- Apply to a fresh database:
--   sudo -u postgres psql -d paynote_db -f schema.sql
--
-- Verified against code as of commit 89a655e.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- payment_requests: the core table. One row per payment request.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           VARCHAR(20) UNIQUE NOT NULL,
  amount         NUMERIC(20,6) NOT NULL,
  token          VARCHAR(20) DEFAULT 'USDC',
  reason         TEXT NOT NULL,
  to_address     VARCHAR(42) NOT NULL,
  status         VARCHAR(20) DEFAULT 'pending',   -- pending | completed | failed | expired
  tx_hash        VARCHAR(66),
  sender_address VARCHAR(42),
  note           TEXT,
  display_name   VARCHAR(100),
  expires_at     TIMESTAMPTZ,
  recurring      VARCHAR(20),                     -- daily | weekly | monthly | null
  metadata       JSONB,
  signature      TEXT,                            -- EIP-191 signed intent (optional)
  signed_by      VARCHAR(42),                     -- recovered signer address
  verified       BOOLEAN DEFAULT false,           -- true if signature verified
  archived       BOOLEAN DEFAULT false,           -- hide from /history without deleting
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  completed_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payment_requests_slug       ON payment_requests(slug);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status     ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_to_address ON payment_requests(to_address);

-- ---------------------------------------------------------------------------
-- api_keys: bearer tokens for /api/agent/pay and admin routes.
-- Key values are hashed (SHA-256) before storage — plaintext never persisted.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255),
  key_hash     VARCHAR(64) UNIQUE NOT NULL,      -- sha256 of the pn_ token
  key_prefix   VARCHAR(20) NOT NULL,             -- first 8 chars + ellipsis for display
  active       BOOLEAN DEFAULT true,             -- deactivation, not deletion
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- ---------------------------------------------------------------------------
-- webhooks: user-registered callback URLs. Secret is stored plaintext
-- because HMAC verification requires the plaintext at signing time.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhooks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url        TEXT NOT NULL,
  secret     VARCHAR(255),                                       -- for HMAC-SHA256 signing
  events     TEXT[] DEFAULT ARRAY['payment.completed'],          -- payment.created, .completed, .failed, .expired
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- webhook_deliveries: one row per delivery attempt for observability.
-- Retries create new rows rather than updating in place.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id      UUID REFERENCES webhooks(id),
  event           VARCHAR(50),
  payload         JSONB,                                          -- full JSON body sent
  response_status INTEGER,                                        -- HTTP status returned
  success         BOOLEAN,                                        -- 2xx = true
  delivered_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- templates: pre-filled payment request templates for /templates page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(200) NOT NULL,
  category       VARCHAR(50) NOT NULL,                            -- invoice, freelance, retainer, bounty, expense, prediction_market
  default_amount NUMERIC(20,6),
  note           TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- Seed with 6 categories. Idempotent — only inserts if empty.
INSERT INTO templates (title, category, default_amount, note)
SELECT * FROM (VALUES
  ('Invoice payment',         'invoice',           500.00, 'Standard invoice payment request'),
  ('Freelance milestone',     'freelance',         750.00, 'Payment for completed milestone'),
  ('Monthly retainer',        'retainer',         2000.00, 'Recurring monthly retainer'),
  ('Bug bounty',              'bounty',            250.00, 'Reward for finding a bug'),
  ('Reimbursable expense',    'expense',           120.00, 'Receipt-backed expense reimbursement'),
  ('Prediction market payout','prediction_market', 100.00, 'Payout for resolved position')
) AS v(title, category, default_amount, note)
WHERE NOT EXISTS (SELECT 1 FROM templates);
