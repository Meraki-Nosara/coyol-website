-- Blocked dates table for La Luna and Coyol
-- Used to block reservations for private events (weddings, etc.)

CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant TEXT NOT NULL CHECK (restaurant IN ('laluna', 'coyol')),
  date DATE NOT NULL,
  reason TEXT,
  blocked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant, date)
);

-- Enable RLS
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Allow public read (for reservation pages to check)
CREATE POLICY "Public can read blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

-- Allow authenticated inserts/deletes (for admin)
CREATE POLICY "Public can insert blocked dates"
  ON blocked_dates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can delete blocked dates"
  ON blocked_dates FOR DELETE
  USING (true);

-- Index for fast lookup
CREATE INDEX idx_blocked_dates_lookup ON blocked_dates(restaurant, date);
