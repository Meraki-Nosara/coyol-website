-- Run this in Supabase SQL Editor
-- Creates neighborhood_messages table for waiting room chat

CREATE TABLE IF NOT EXISTS neighborhood_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood_id uuid REFERENCES neighborhoods(id),
  sender_id uuid,
  sender_name text,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE neighborhood_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages
CREATE POLICY "Anyone can read neighborhood messages"
ON neighborhood_messages FOR SELECT
USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Anyone can insert neighborhood messages"
ON neighborhood_messages FOR INSERT
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_neighborhood_messages_neighborhood 
ON neighborhood_messages(neighborhood_id, created_at);
