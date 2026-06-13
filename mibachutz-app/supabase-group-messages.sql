-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS group_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid,
  sender_id uuid,
  sender_name text,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read" ON group_messages FOR SELECT USING (true);
CREATE POLICY "insert" ON group_messages FOR INSERT WITH CHECK (true);
