-- =============================================
-- MERAKI CRM TABLES
-- Run this in Supabase SQL Editor
-- Project: mnxjzvqgrrodalcmtntf
-- =============================================

-- Main guests table
CREATE TABLE IF NOT EXISTS crm_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  phone_normalized TEXT,
  source TEXT,
  source_type TEXT,
  area_code TEXT,
  country_code TEXT,
  city TEXT,
  region TEXT,
  tier INTEGER DEFAULT 3,
  email_domain TEXT,
  is_corporate_email BOOLEAN DEFAULT FALSE,
  lead_score INTEGER DEFAULT 0,
  segment TEXT DEFAULT 'nurture',
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_crm_guests_email ON crm_guests(email);
CREATE INDEX IF NOT EXISTS idx_crm_guests_segment ON crm_guests(segment);
CREATE INDEX IF NOT EXISTS idx_crm_guests_score ON crm_guests(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_guests_region ON crm_guests(region);
CREATE INDEX IF NOT EXISTS idx_crm_guests_city ON crm_guests(city);
CREATE INDEX IF NOT EXISTS idx_crm_guests_source ON crm_guests(source);

-- Interactions table (visits, emails, calls)
CREATE TABLE IF NOT EXISTS crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES crm_guests(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT,
  direction TEXT,
  subject TEXT,
  summary TEXT,
  property_interest TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_interactions_guest ON crm_interactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_type ON crm_interactions(type);

-- Pipeline tracking
CREATE TABLE IF NOT EXISTS crm_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES crm_guests(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  deal_value DECIMAL(12,2),
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_pipeline_guest ON crm_pipeline(guest_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stage ON crm_pipeline(stage);

-- Enable RLS but allow all operations for now
ALTER TABLE crm_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline ENABLE ROW LEVEL SECURITY;

-- SECURITY: Strict policies - service_role key required for automation
-- anon key has NO access to CRM tables

-- Block anon completely
REVOKE ALL ON crm_guests FROM anon;
REVOKE ALL ON crm_interactions FROM anon;
REVOKE ALL ON crm_pipeline FROM anon;

-- Service role bypasses RLS (used for automation)
-- Authenticated users need explicit whitelist
CREATE POLICY "Service role full access" ON crm_guests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON crm_interactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON crm_pipeline
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Useful views
CREATE OR REPLACE VIEW crm_hot_leads AS
SELECT * FROM crm_guests 
WHERE segment = 'hot' OR lead_score >= 45
ORDER BY lead_score DESC;

CREATE OR REPLACE VIEW crm_pipeline_summary AS
SELECT 
  stage,
  COUNT(*) as count,
  SUM(deal_value) as total_value
FROM crm_pipeline
WHERE exited_at IS NULL
GROUP BY stage;
