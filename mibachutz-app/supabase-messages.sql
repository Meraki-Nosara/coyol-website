-- Messages table for real chat
CREATE TABLE IF NOT EXISTS mibachutz_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES mibachutz_moms(id),
  receiver_id UUID REFERENCES mibachutz_moms(id),
  group_id UUID, -- for group chats later
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_messages_sender ON mibachutz_messages(sender_id);
CREATE INDEX idx_messages_receiver ON mibachutz_messages(receiver_id);
CREATE INDEX idx_messages_created ON mibachutz_messages(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE mibachutz_messages;
