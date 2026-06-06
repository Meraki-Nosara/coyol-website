-- Mibachutz Full Schema
-- Run this in Supabase SQL Editor

-- Users table (moms)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  baby_age TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  about TEXT NOT NULL,
  photo_url TEXT,
  push_token TEXT,
  status TEXT DEFAULT 'waiting', -- waiting, invited, in_group
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  name TEXT, -- e.g., "גן מאיר #4"
  status TEXT DEFAULT 'filling', -- filling, pre_meeting, locked, active
  meeting_location TEXT,
  meeting_time TIMESTAMPTZ,
  min_members INT DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  locked_at TIMESTAMPTZ
);

-- Group members (junction table)
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited', -- invited, confirmed, arrived, no_show
  confirmed_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Messages table (for both pre-meeting and permanent chats)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, image, intro, system
  image_url TEXT,
  is_intro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetups table (track Sunday meetings)
CREATE TABLE IF NOT EXISTS meetups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  location_name TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  attendee_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance check-ins
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meetup_id, user_id)
);

-- Function to count users per area and auto-create groups
CREATE OR REPLACE FUNCTION check_area_for_group()
RETURNS TRIGGER AS $$
DECLARE
  area_count INT;
  new_group_id UUID;
  waiting_user RECORD;
BEGIN
  -- Count waiting users in this area
  SELECT COUNT(*) INTO area_count
  FROM users
  WHERE city = NEW.city 
    AND area = NEW.area 
    AND status = 'waiting';
  
  -- If we have 10, create a group
  IF area_count >= 10 THEN
    -- Create the group
    INSERT INTO groups (city, area, name, status)
    VALUES (
      NEW.city, 
      NEW.area, 
      NEW.area || ' #' || (
        SELECT COUNT(*) + 1 FROM groups WHERE area = NEW.area
      ),
      'pre_meeting'
    )
    RETURNING id INTO new_group_id;
    
    -- Add all waiting users to the group
    FOR waiting_user IN 
      SELECT id FROM users 
      WHERE city = NEW.city 
        AND area = NEW.area 
        AND status = 'waiting'
      LIMIT 10
    LOOP
      INSERT INTO group_members (group_id, user_id, status)
      VALUES (new_group_id, waiting_user.id, 'invited');
      
      UPDATE users SET status = 'invited' WHERE id = waiting_user.id;
    END LOOP;
    
    -- Schedule meetup for next Sunday 11:00
    INSERT INTO meetups (group_id, scheduled_for, status)
    VALUES (
      new_group_id,
      (date_trunc('week', NOW()) + INTERVAL '7 days' + INTERVAL '11 hours')::TIMESTAMPTZ,
      'scheduled'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check after each new user
DROP TRIGGER IF EXISTS check_group_trigger ON users;
CREATE TRIGGER check_group_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_area_for_group();

-- Function to lock group when 8+ check in
CREATE OR REPLACE FUNCTION check_meetup_attendance()
RETURNS TRIGGER AS $$
DECLARE
  attendance INT;
  meetup_record RECORD;
BEGIN
  -- Get meetup info
  SELECT m.*, g.id as group_id INTO meetup_record
  FROM meetups m
  JOIN groups g ON m.group_id = g.id
  WHERE m.id = NEW.meetup_id;
  
  -- Count check-ins
  SELECT COUNT(*) INTO attendance
  FROM checkins
  WHERE meetup_id = NEW.meetup_id;
  
  -- If 8+, lock the group
  IF attendance >= 8 THEN
    UPDATE groups 
    SET status = 'locked', locked_at = NOW()
    WHERE id = meetup_record.group_id;
    
    UPDATE meetups
    SET status = 'completed', attendee_count = attendance
    WHERE id = NEW.meetup_id;
    
    -- Mark all who checked in as arrived
    UPDATE group_members gm
    SET status = 'arrived'
    FROM checkins c
    WHERE c.meetup_id = NEW.meetup_id
      AND c.user_id = gm.user_id
      AND gm.group_id = meetup_record.group_id;
    
    -- Update user status
    UPDATE users u
    SET status = 'in_group'
    FROM checkins c
    WHERE c.meetup_id = NEW.meetup_id
      AND c.user_id = u.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for check-ins
DROP TRIGGER IF EXISTS check_attendance_trigger ON checkins;
CREATE TRIGGER check_attendance_trigger
  AFTER INSERT ON checkins
  FOR EACH ROW
  EXECUTE FUNCTION check_meetup_attendance();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (tighten later with auth)
CREATE POLICY "Allow all" ON users FOR ALL USING (true);
CREATE POLICY "Allow all" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all" ON group_members FOR ALL USING (true);
CREATE POLICY "Allow all" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all" ON meetups FOR ALL USING (true);
CREATE POLICY "Allow all" ON checkins FOR ALL USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
