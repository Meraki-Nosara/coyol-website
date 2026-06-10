-- Mibachutz Complete Schema
-- Run this in Supabase SQL Editor

-- Neighborhoods (areas in Israel)
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he TEXT NOT NULL,
  name_en TEXT,
  city TEXT DEFAULT 'תל אביב',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some neighborhoods
INSERT INTO neighborhoods (name_he, city) VALUES
  ('רמת אביב', 'תל אביב'),
  ('תל אביב מרכז', 'תל אביב'),
  ('פלורנטין', 'תל אביב'),
  ('נווה צדק', 'תל אביב'),
  ('יפו', 'תל אביב'),
  ('רמת החייל', 'תל אביב'),
  ('הרצליה פיתוח', 'הרצליה'),
  ('רעננה', 'רעננה'),
  ('כפר סבא', 'כפר סבא'),
  ('פתח תקווה', 'פתח תקווה'),
  ('ראשון לציון', 'ראשון לציון'),
  ('חולון', 'חולון'),
  ('בת ים', 'בת ים')
ON CONFLICT DO NOTHING;

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  neighborhood_id UUID REFERENCES neighborhoods(id),
  age_range TEXT DEFAULT '0-12m',
  max_members INT DEFAULT 12,
  is_active BOOLEAN DEFAULT true,
  is_full BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moms table (main users)
CREATE TABLE IF NOT EXISTS moms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  baby_name TEXT,
  baby_birth_date DATE,
  baby_age_range TEXT,
  neighborhood_id UUID REFERENCES neighborhoods(id),
  group_id UUID REFERENCES groups(id),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT false,
  always_available BOOLEAN DEFAULT false,
  last_available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES moms(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin logs (for audit trail)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  mom_id UUID REFERENCES moms(id),
  from_group UUID,
  to_group UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Broadcast messages (for admin announcements)
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'notification',
  target_groups UUID[],
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_moms_group ON moms(group_id);
CREATE INDEX IF NOT EXISTS idx_moms_neighborhood ON moms(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_moms_phone ON moms(phone);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE moms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now, tighten later)
CREATE POLICY "Allow all on neighborhoods" ON neighborhoods FOR ALL USING (true);
CREATE POLICY "Allow all on groups" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all on moms" ON moms FOR ALL USING (true);
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Function to auto-assign moms to groups
CREATE OR REPLACE FUNCTION auto_assign_group()
RETURNS TRIGGER AS $$
BEGIN
  -- Find a group in the same neighborhood with space
  SELECT id INTO NEW.group_id
  FROM groups
  WHERE neighborhood_id = NEW.neighborhood_id
    AND is_active = true
    AND is_full = false
  ORDER BY created_at
  LIMIT 1;
  
  -- If no group found, create one
  IF NEW.group_id IS NULL THEN
    INSERT INTO groups (name, neighborhood_id)
    VALUES (
      (SELECT name_he FROM neighborhoods WHERE id = NEW.neighborhood_id) || ' #1',
      NEW.neighborhood_id
    )
    RETURNING id INTO NEW.group_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign
DROP TRIGGER IF EXISTS auto_assign_mom_group ON moms;
CREATE TRIGGER auto_assign_mom_group
  BEFORE INSERT ON moms
  FOR EACH ROW
  WHEN (NEW.group_id IS NULL AND NEW.neighborhood_id IS NOT NULL)
  EXECUTE FUNCTION auto_assign_group();

-- Function to update group full status
CREATE OR REPLACE FUNCTION update_group_full_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the old group's full status
  IF TG_OP = 'UPDATE' AND OLD.group_id IS NOT NULL THEN
    UPDATE groups SET is_full = (
      SELECT COUNT(*) >= max_members FROM moms WHERE group_id = OLD.group_id
    ) WHERE id = OLD.group_id;
  END IF;
  
  -- Update the new group's full status
  IF NEW.group_id IS NOT NULL THEN
    UPDATE groups SET is_full = (
      SELECT COUNT(*) >= max_members FROM moms WHERE group_id = NEW.group_id
    ) WHERE id = NEW.group_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_group_full ON moms;
CREATE TRIGGER check_group_full
  AFTER INSERT OR UPDATE OF group_id ON moms
  FOR EACH ROW
  EXECUTE FUNCTION update_group_full_status();
