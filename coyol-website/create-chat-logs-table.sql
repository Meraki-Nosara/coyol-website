-- Chat Logs table for AI Support Widget analytics
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant TEXT NOT NULL CHECK (restaurant IN ('laluna', 'coyol')),
  user_message TEXT NOT NULL,
  bot_reply TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by restaurant and date
CREATE INDEX IF NOT EXISTS idx_chat_logs_restaurant ON chat_logs(restaurant);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_category ON chat_logs(category);

-- Enable RLS but allow service role to insert
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Policy for service role (API) to insert
CREATE POLICY "Service role can insert chat logs" ON chat_logs
  FOR INSERT WITH CHECK (true);

-- Policy for service role to read (for analytics)
CREATE POLICY "Service role can read chat logs" ON chat_logs
  FOR SELECT USING (true);

-- Comment for documentation
COMMENT ON TABLE chat_logs IS 'Logs all AI support widget conversations for analytics and improvement';
COMMENT ON COLUMN chat_logs.category IS 'Auto-categorized: how-to, issue, table-assign, cancellation, walk-in, search, stats, table-combine, general';
