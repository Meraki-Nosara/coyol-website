-- Mibachutz Database Schema
-- Run this in Alina's Supabase SQL editor

-- Users (moms)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  email TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  baby_birthdate DATE,
  due_date DATE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'active')),
  group_id UUID REFERENCES groups(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'archived')),
  founding_mom_id UUID REFERENCES users(id),
  max_size INT DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key after both tables exist
ALTER TABLE users ADD CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES groups(id);

-- Messages (group chat)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetups
CREATE TABLE meetups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  proposed_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  datetime TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_neighborhood ON users(neighborhood, city);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_group ON users(group_id);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_messages_group ON messages(group_id);
CREATE INDEX idx_meetups_group ON meetups(group_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;

-- Policies (basic - users can read their own data and group data)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view group members" ON users
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM users WHERE id::text = auth.uid()::text)
  );

CREATE POLICY "Users can view own group" ON groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM users WHERE id::text = auth.uid()::text)
  );

CREATE POLICY "Users can view group messages" ON messages
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM users WHERE id::text = auth.uid()::text)
  );

CREATE POLICY "Users can send messages to own group" ON messages
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM users WHERE id::text = auth.uid()::text)
  );

CREATE POLICY "Users can view group meetups" ON meetups
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM users WHERE id::text = auth.uid()::text)
  );

CREATE POLICY "Users can propose meetups" ON meetups
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM users WHERE id::text = auth.uid()::text)
  );

-- Function: Auto-match users to groups
CREATE OR REPLACE FUNCTION match_user_to_group()
RETURNS TRIGGER AS $$
DECLARE
  matching_group_id UUID;
  group_count INT;
BEGIN
  -- Find a forming group in same neighborhood
  SELECT id INTO matching_group_id
  FROM groups
  WHERE neighborhood = NEW.neighborhood
    AND city = NEW.city
    AND status = 'forming'
  LIMIT 1;
  
  IF matching_group_id IS NOT NULL THEN
    -- Add user to existing group
    NEW.group_id := matching_group_id;
    NEW.status := 'matched';
    
    -- Check if group is now full
    SELECT COUNT(*) INTO group_count FROM users WHERE group_id = matching_group_id;
    IF group_count >= 7 THEN -- 7 + this new user = 8
      UPDATE groups SET status = 'active' WHERE id = matching_group_id;
      UPDATE users SET status = 'active' WHERE group_id = matching_group_id;
      NEW.status := 'active';
    END IF;
  ELSE
    -- Create new group, user becomes founding mom
    INSERT INTO groups (name, neighborhood, city, founding_mom_id)
    VALUES (
      NEW.neighborhood || ' #' || (
        SELECT COALESCE(MAX(CAST(SUBSTRING(name FROM '#(\d+)$') AS INT)), 0) + 1
        FROM groups WHERE neighborhood = NEW.neighborhood
      ),
      NEW.neighborhood,
      NEW.city,
      NEW.id
    )
    RETURNING id INTO matching_group_id;
    
    NEW.group_id := matching_group_id;
    NEW.status := 'matched';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Run matching on new user signup
CREATE TRIGGER on_user_signup
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION match_user_to_group();
