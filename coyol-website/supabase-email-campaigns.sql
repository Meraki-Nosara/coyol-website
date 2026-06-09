-- Email Campaign Pipeline Tables
-- Run this in Supabase SQL Editor

-- Contacts table (master list of all restaurant guests)
CREATE TABLE IF NOT EXISTS email_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source TEXT DEFAULT 'reservation', -- reservation, walkin, import
  restaurant TEXT, -- laluna, coyol, both
  last_visit DATE,
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, paused, completed
  sent_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sends table (tracks every email sent)
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id),
  contact_id UUID REFERENCES email_contacts(id),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'queued', -- queued, sent, failed, bounced
  queued_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_contact ON email_sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email);

-- Enable RLS
ALTER TABLE email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for anon for now - tighten later)
CREATE POLICY "Allow all for email_contacts" ON email_contacts FOR ALL USING (true);
CREATE POLICY "Allow all for email_campaigns" ON email_campaigns FOR ALL USING (true);
CREATE POLICY "Allow all for email_sends" ON email_sends FOR ALL USING (true);

-- Import existing contacts from the JSON list
-- (This will be done via script after table creation)
