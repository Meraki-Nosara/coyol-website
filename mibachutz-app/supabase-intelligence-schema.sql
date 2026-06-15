-- Mibachutz Data Intelligence Schema
-- Run this in Supabase SQL Editor
-- IMPORTANT: This is for AGGREGATED intelligence, not individual tracking

-- =============================================
-- INTENT SIGNALS (The Gold)
-- Extracted from conversations by AI
-- =============================================

CREATE TABLE IF NOT EXISTS intent_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extracted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Anonymized source context (NO mom_id!)
  city TEXT,
  neighborhood TEXT,
  baby_age_range TEXT,  -- '0-3m', '3-6m', '6-12m', '1-2y'
  language TEXT,
  
  -- Signal classification
  signal_type TEXT NOT NULL,  -- 'purchase_intent', 'brand_mention', 'pain_point', 'recommendation', 'health_concern', 'life_transition'
  category TEXT NOT NULL,     -- 'stroller', 'formula', 'daycare', 'pediatrician', 'clothing', etc.
  subcategory TEXT,
  
  -- Details
  brand_mentioned TEXT,
  sentiment TEXT,             -- 'positive', 'negative', 'neutral', 'seeking'
  price_sensitivity TEXT,     -- 'budget', 'mid', 'premium', 'unknown'
  urgency TEXT,               -- 'immediate', 'soon', 'researching', 'future'
  
  -- Keywords for analysis
  keywords TEXT[],
  
  -- Audit (but anonymous)
  source_hash TEXT,           -- Hash of conversation, not the text
  confidence_score FLOAT      -- AI confidence 0-1
);

-- Index for fast aggregation queries
CREATE INDEX idx_signals_city ON intent_signals(city);
CREATE INDEX idx_signals_category ON intent_signals(category);
CREATE INDEX idx_signals_type ON intent_signals(signal_type);
CREATE INDEX idx_signals_date ON intent_signals(extracted_at);

-- =============================================
-- LOCATION PATTERNS
-- Where moms gather (aggregated)
-- =============================================

CREATE TABLE IF NOT EXISTS location_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Location
  city TEXT NOT NULL,
  neighborhood TEXT,
  location_name TEXT,         -- "Sarona Market", "Hayarkon Park"
  location_type TEXT,         -- 'park', 'cafe', 'mall', 'clinic', 'activity_center'
  
  -- Pattern (aggregated from multiple moms)
  visit_count INT DEFAULT 1,
  typical_day TEXT,           -- 'weekday', 'weekend', 'sunday', etc.
  typical_time TEXT,          -- 'morning', 'afternoon', 'evening'
  
  -- Segment
  primary_language TEXT,
  baby_age_range TEXT,
  
  -- Derived
  avg_group_size FLOAT,
  spend_estimate TEXT         -- 'low', 'medium', 'high'
);

CREATE INDEX idx_location_city ON location_patterns(city);
CREATE INDEX idx_location_type ON location_patterns(location_type);

-- =============================================
-- BRAND TRACKER
-- Aggregated brand mentions and sentiment
-- =============================================

CREATE TABLE IF NOT EXISTS brand_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Brand
  brand_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Metrics (aggregated weekly)
  week_start DATE,
  mention_count INT DEFAULT 0,
  positive_count INT DEFAULT 0,
  negative_count INT DEFAULT 0,
  neutral_count INT DEFAULT 0,
  recommendation_count INT DEFAULT 0,
  
  -- Segment breakdown
  city TEXT,
  baby_age_range TEXT,
  
  -- Computed
  sentiment_score FLOAT,      -- -1 to +1
  share_of_voice FLOAT        -- % of category mentions
);

CREATE INDEX idx_brand_name ON brand_tracker(brand_name);
CREATE INDEX idx_brand_category ON brand_tracker(category);
CREATE INDEX idx_brand_week ON brand_tracker(week_start);

-- =============================================
-- TREND ALERTS
-- Significant changes detected by AI
-- =============================================

CREATE TABLE IF NOT EXISTS trend_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Alert details
  alert_type TEXT NOT NULL,   -- 'surge', 'drop', 'new_trend', 'sentiment_shift'
  category TEXT,
  brand TEXT,
  
  -- Context
  city TEXT,
  segment TEXT,
  
  -- Metrics
  baseline_value FLOAT,
  current_value FLOAT,
  change_percent FLOAT,
  
  -- Status
  is_reviewed BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- =============================================
-- AGGREGATED REPORTS (Pre-computed for B2B)
-- =============================================

CREATE TABLE IF NOT EXISTS market_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Report metadata
  report_type TEXT NOT NULL,  -- 'weekly_pulse', 'category_deep_dive', 'brand_analysis', 'custom'
  period_start DATE,
  period_end DATE,
  
  -- Segment
  city TEXT,
  segment_filters JSONB,
  
  -- Content
  sample_size INT,
  report_data JSONB,          -- The actual aggregated insights
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  client_id TEXT              -- For paid custom reports
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE intent_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_reports ENABLE ROW LEVEL SECURITY;

-- Only service role can write (AI agent uses service key)
CREATE POLICY "Service role can insert signals" ON intent_signals
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can insert locations" ON location_patterns
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can manage brands" ON brand_tracker
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage alerts" ON trend_alerts
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage reports" ON market_reports
  FOR ALL TO service_role USING (true);

-- Authenticated users can only read public reports
CREATE POLICY "Public reports are readable" ON market_reports
  FOR SELECT TO authenticated USING (is_public = true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get category trends
CREATE OR REPLACE FUNCTION get_category_trends(
  p_category TEXT,
  p_city TEXT DEFAULT NULL,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  week_start DATE,
  total_signals BIGINT,
  positive_pct FLOAT,
  top_brands TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('week', extracted_at)::DATE as week_start,
    COUNT(*) as total_signals,
    (COUNT(*) FILTER (WHERE sentiment = 'positive'))::FLOAT / NULLIF(COUNT(*), 0) as positive_pct,
    ARRAY_AGG(DISTINCT brand_mentioned) FILTER (WHERE brand_mentioned IS NOT NULL) as top_brands
  FROM intent_signals
  WHERE category = p_category
    AND extracted_at > NOW() - (p_days || ' days')::INTERVAL
    AND (p_city IS NULL OR city = p_city)
  GROUP BY DATE_TRUNC('week', extracted_at)
  ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get segment profile
CREATE OR REPLACE FUNCTION get_segment_profile(
  p_city TEXT,
  p_baby_age TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_signals', COUNT(*),
    'top_categories', (
      SELECT jsonb_agg(cat) FROM (
        SELECT jsonb_build_object('category', category, 'count', COUNT(*)) as cat
        FROM intent_signals
        WHERE city = p_city AND (p_baby_age IS NULL OR baby_age_range = p_baby_age)
        GROUP BY category ORDER BY COUNT(*) DESC LIMIT 5
      ) t
    ),
    'top_pain_points', (
      SELECT jsonb_agg(pp) FROM (
        SELECT jsonb_build_object('category', category, 'count', COUNT(*)) as pp
        FROM intent_signals
        WHERE city = p_city AND signal_type = 'pain_point'
          AND (p_baby_age IS NULL OR baby_age_range = p_baby_age)
        GROUP BY category ORDER BY COUNT(*) DESC LIMIT 5
      ) t
    ),
    'price_distribution', jsonb_build_object(
      'budget', COUNT(*) FILTER (WHERE price_sensitivity = 'budget'),
      'mid', COUNT(*) FILTER (WHERE price_sensitivity = 'mid'),
      'premium', COUNT(*) FILTER (WHERE price_sensitivity = 'premium')
    )
  ) INTO result
  FROM intent_signals
  WHERE city = p_city AND (p_baby_age IS NULL OR baby_age_range = p_baby_age);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Uncomment to insert test data:
/*
INSERT INTO intent_signals (city, neighborhood, baby_age_range, language, signal_type, category, brand_mentioned, sentiment, price_sensitivity, urgency, keywords)
VALUES 
  ('Tel Aviv', 'North', '3-6m', 'Hebrew', 'purchase_intent', 'stroller', 'Bugaboo', 'positive', 'premium', 'researching', ARRAY['stroller', 'bugaboo', 'quality']),
  ('Tel Aviv', 'North', '0-3m', 'Hebrew', 'purchase_intent', 'stroller', 'Yoyo', 'positive', 'mid', 'immediate', ARRAY['stroller', 'yoyo', 'compact']),
  ('Tel Aviv', 'Center', '6-12m', 'Russian', 'pain_point', 'daycare', NULL, 'negative', 'mid', 'immediate', ARRAY['daycare', 'waiting list', 'frustrated']),
  ('Raanana', NULL, '3-6m', 'Hebrew', 'recommendation', 'pediatrician', 'Dr. Cohen', 'positive', NULL, NULL, ARRAY['pediatrician', 'recommend', 'great']),
  ('Herzliya', NULL, '0-3m', 'English', 'purchase_intent', 'formula', 'Similac', 'neutral', 'mid', 'soon', ARRAY['formula', 'similac', 'organic']);
*/
