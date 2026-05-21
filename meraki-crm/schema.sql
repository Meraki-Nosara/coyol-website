-- MERAKI CRM SCHEMA
-- Hybrid pipeline: Restaurant guests → Real estate leads

-- ============================================
-- GUESTS (Master table - all 34K+ contacts)
-- ============================================
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name TEXT,
  email TEXT,
  phone TEXT,
  phone_normalized TEXT, -- Cleaned: +15551234567
  
  -- Source tracking
  source TEXT, -- 'laluna', 'coyol', 'esh', 'website', 'referral'
  source_type TEXT, -- 'personal', 'corporate'
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Enrichment (auto-populated)
  area_code TEXT,
  country_code TEXT,
  city TEXT,
  region TEXT, -- 'US-West', 'US-East', 'Canada', 'LatAm', 'Europe'
  email_domain TEXT,
  is_corporate_email BOOLEAN DEFAULT FALSE,
  
  -- Scoring
  lead_score INTEGER DEFAULT 0,
  score_updated_at TIMESTAMPTZ,
  
  -- Segments
  segment TEXT, -- 'hot', 'warm', 'nurture', 'local', 'concierge'
  
  -- Status
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'opportunity', 'customer', 'lost'
  assigned_to TEXT, -- 'ruth', 'marion', etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(email)
);

-- ============================================
-- VISITS (Restaurant visit history)
-- ============================================
CREATE TABLE guest_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  
  restaurant TEXT NOT NULL, -- 'laluna', 'coyol', 'esh'
  visit_date DATE,
  party_size INTEGER,
  spend_amount DECIMAL(10,2),
  spend_currency TEXT DEFAULT 'CRC',
  
  -- Reservation details
  reservation_type TEXT, -- 'walkin', 'reservation', 'event'
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INTERACTIONS (All touchpoints)
-- ============================================
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'email_received', 'email_sent', 'call', 'whatsapp', 'website_visit', 'property_view'
  channel TEXT, -- 'email', 'phone', 'whatsapp', 'website'
  direction TEXT, -- 'inbound', 'outbound'
  
  subject TEXT,
  summary TEXT,
  
  -- For property interest tracking
  property_interest TEXT[], -- ['mar-azul-lot-12', 'nosara-hills']
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEAD SCORES (Scoring breakdown)
-- ============================================
CREATE TABLE lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  
  -- Score components
  location_score INTEGER DEFAULT 0, -- NYC/LA/Toronto = high
  visit_score INTEGER DEFAULT 0, -- Frequency + recency
  spend_score INTEGER DEFAULT 0, -- High spenders
  engagement_score INTEGER DEFAULT 0, -- Email opens, website visits
  intent_score INTEGER DEFAULT 0, -- Asked about real estate
  
  total_score INTEGER GENERATED ALWAYS AS (
    location_score + visit_score + spend_score + engagement_score + intent_score
  ) STORED,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PIPELINE STAGES
-- ============================================
CREATE TABLE pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  
  stage TEXT NOT NULL, -- 'new', 'contacted', 'tour_scheduled', 'tour_completed', 'offer', 'negotiation', 'closed_won', 'closed_lost'
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  
  notes TEXT,
  deal_value DECIMAL(12,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKETING CAMPAIGNS
-- ============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT, -- 'drip', 'blast', 'trigger'
  
  segment_filter JSONB, -- {"region": "US-West", "min_score": 50}
  
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'opened', 'clicked', 'bounced'
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_phone ON guests(phone_normalized);
CREATE INDEX idx_guests_score ON guests(lead_score DESC);
CREATE INDEX idx_guests_segment ON guests(segment);
CREATE INDEX idx_guests_region ON guests(region);
CREATE INDEX idx_guests_status ON guests(status);
CREATE INDEX idx_visits_guest ON guest_visits(guest_id);
CREATE INDEX idx_visits_date ON guest_visits(visit_date DESC);
CREATE INDEX idx_interactions_guest ON interactions(guest_id);
CREATE INDEX idx_pipeline_guest ON pipeline(guest_id);

-- ============================================
-- VIEWS
-- ============================================
CREATE VIEW hot_leads AS
SELECT 
  g.*,
  ls.total_score,
  ls.location_score,
  ls.visit_score,
  ls.spend_score
FROM guests g
LEFT JOIN lead_scores ls ON g.id = ls.guest_id
WHERE g.segment = 'hot' OR ls.total_score >= 50
ORDER BY ls.total_score DESC;

CREATE VIEW pipeline_summary AS
SELECT 
  stage,
  COUNT(*) as count,
  SUM(deal_value) as total_value
FROM pipeline
WHERE exited_at IS NULL
GROUP BY stage;

-- ============================================
-- AREA CODE → CITY MAPPING
-- ============================================
CREATE TABLE area_code_map (
  area_code TEXT PRIMARY KEY,
  city TEXT,
  state TEXT,
  country TEXT,
  region TEXT, -- 'US-West', 'US-East', 'Canada', 'LatAm', 'Europe', 'Other'
  tier INTEGER DEFAULT 3 -- 1 = high value, 2 = medium, 3 = standard
);

-- Insert key area codes
INSERT INTO area_code_map (area_code, city, state, country, region, tier) VALUES
-- Tier 1: High net worth markets
('212', 'New York', 'NY', 'US', 'US-East', 1),
('917', 'New York', 'NY', 'US', 'US-East', 1),
('646', 'New York', 'NY', 'US', 'US-East', 1),
('310', 'Los Angeles', 'CA', 'US', 'US-West', 1),
('415', 'San Francisco', 'CA', 'US', 'US-West', 1),
('305', 'Miami', 'FL', 'US', 'US-East', 1),
('416', 'Toronto', 'ON', 'CA', 'Canada', 1),
('604', 'Vancouver', 'BC', 'CA', 'Canada', 1),
('617', 'Boston', 'MA', 'US', 'US-East', 1),
('312', 'Chicago', 'IL', 'US', 'US-Central', 1),

-- Tier 2: Strong markets
('858', 'San Diego', 'CA', 'US', 'US-West', 2),
('949', 'Orange County', 'CA', 'US', 'US-West', 2),
('303', 'Denver', 'CO', 'US', 'US-West', 2),
('512', 'Austin', 'TX', 'US', 'US-Central', 2),
('206', 'Seattle', 'WA', 'US', 'US-West', 2),
('404', 'Atlanta', 'GA', 'US', 'US-East', 2),
('647', 'Toronto GTA', 'ON', 'CA', 'Canada', 2),
('514', 'Montreal', 'QC', 'CA', 'Canada', 2),
('702', 'Las Vegas', 'NV', 'US', 'US-West', 2),

-- Tier 3: Secondary
('713', 'Houston', 'TX', 'US', 'US-Central', 3),
('214', 'Dallas', 'TX', 'US', 'US-Central', 3),
('602', 'Phoenix', 'AZ', 'US', 'US-West', 3),
('503', 'Portland', 'OR', 'US', 'US-West', 3),

-- Costa Rica (local)
('506', 'Costa Rica', NULL, 'CR', 'LatAm', 3);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
