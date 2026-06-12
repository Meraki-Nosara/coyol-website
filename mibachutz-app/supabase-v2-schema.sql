-- Mibachutz V2 Schema
-- New flow: Register → Standby → Auto-form group at 8 moms
-- Run this in Supabase SQL Editor

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he TEXT NOT NULL UNIQUE,
  name_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Israeli cities
INSERT INTO cities (name_he, name_en) VALUES
  ('תל אביב', 'Tel Aviv'),
  ('הרצליה', 'Herzliya'),
  ('רעננה', 'Raanana'),
  ('כפר סבא', 'Kfar Saba'),
  ('פתח תקווה', 'Petah Tikva'),
  ('ראשון לציון', 'Rishon LeZion'),
  ('חולון', 'Holon'),
  ('בת ים', 'Bat Yam'),
  ('רמת גן', 'Ramat Gan'),
  ('גבעתיים', 'Givatayim'),
  ('נתניה', 'Netanya'),
  ('אשדוד', 'Ashdod'),
  ('באר שבע', 'Beer Sheva'),
  ('חיפה', 'Haifa'),
  ('ירושלים', 'Jerusalem')
ON CONFLICT (name_he) DO NOTHING;

-- Neighborhoods table (linked to city)
DROP TABLE IF EXISTS neighborhoods_v2;
CREATE TABLE neighborhoods_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name_he TEXT NOT NULL,
  name_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, name_he)
);

-- Insert neighborhoods by city
INSERT INTO neighborhoods_v2 (city_id, name_he, name_en)
SELECT c.id, n.name_he, n.name_en FROM cities c, 
(VALUES 
  -- Tel Aviv
  ('תל אביב', 'רמת אביב', 'Ramat Aviv'),
  ('תל אביב', 'תל אביב מרכז', 'Tel Aviv Center'),
  ('תל אביב', 'פלורנטין', 'Florentin'),
  ('תל אביב', 'נווה צדק', 'Neve Tzedek'),
  ('תל אביב', 'יפו', 'Jaffa'),
  ('תל אביב', 'רמת החייל', 'Ramat HaChayal'),
  ('תל אביב', 'הצפון הישן', 'Old North'),
  ('תל אביב', 'לב העיר', 'City Center'),
  -- Herzliya
  ('הרצליה', 'הרצליה פיתוח', 'Herzliya Pituach'),
  ('הרצליה', 'הרצליה מרכז', 'Herzliya Center'),
  ('הרצליה', 'נווה אמירים', 'Neve Amirim'),
  -- Raanana
  ('רעננה', 'רעננה מרכז', 'Raanana Center'),
  ('רעננה', 'רעננה צפון', 'Raanana North'),
  ('רעננה', 'רעננה דרום', 'Raanana South'),
  -- Kfar Saba
  ('כפר סבא', 'כפר סבא מרכז', 'Kfar Saba Center'),
  ('כפר סבא', 'כפר סבא הירוקה', 'Green Kfar Saba'),
  -- Ramat Gan
  ('רמת גן', 'רמת גן מרכז', 'Ramat Gan Center'),
  ('רמת גן', 'בורסה', 'Diamond Exchange'),
  -- Givatayim
  ('גבעתיים', 'גבעתיים מרכז', 'Givatayim Center'),
  -- Rishon
  ('ראשון לציון', 'ראשון מערב', 'Rishon West'),
  ('ראשון לציון', 'ראשון מרכז', 'Rishon Center')
) AS n(city_name, name_he, name_en)
WHERE c.name_he = n.city_name
ON CONFLICT (city_id, name_he) DO NOTHING;

-- Moms V2 table with new fields
DROP TABLE IF EXISTS moms_v2 CASCADE;
CREATE TABLE moms_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  -- Baby info
  baby_birthday DATE NOT NULL,
  -- Location
  city_id UUID REFERENCES cities(id),
  neighborhood_id UUID REFERENCES neighborhoods_v2(id),
  -- Group assignment
  group_id UUID REFERENCES groups_v2(id),
  -- Status
  status TEXT DEFAULT 'standby' CHECK (status IN ('standby', 'in_group', 'available', 'unavailable')),
  is_available BOOLEAN DEFAULT false,
  last_available_at TIMESTAMPTZ,
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups V2 table
DROP TABLE IF EXISTS groups_v2 CASCADE;
CREATE TABLE groups_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city_id UUID REFERENCES cities(id),
  neighborhood_id UUID REFERENCES neighborhoods_v2(id),
  member_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate moms_v2 with proper reference
DROP TABLE IF EXISTS moms_v2 CASCADE;
CREATE TABLE moms_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  baby_birthday DATE NOT NULL,
  city_id UUID REFERENCES cities(id),
  neighborhood_id UUID REFERENCES neighborhoods_v2(id),
  group_id UUID,
  status TEXT DEFAULT 'standby' CHECK (status IN ('standby', 'in_group', 'available', 'unavailable')),
  is_available BOOLEAN DEFAULT false,
  last_available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages V2 (only for group chat, no DMs)
DROP TABLE IF EXISTS messages_v2 CASCADE;
CREATE TABLE messages_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups_v2(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES moms_v2(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standby pool view (moms waiting for group)
CREATE OR REPLACE VIEW standby_pool AS
SELECT 
  m.city_id,
  m.neighborhood_id,
  c.name_he as city_name,
  n.name_he as neighborhood_name,
  COUNT(*) as waiting_count,
  ARRAY_AGG(m.id ORDER BY m.created_at) as mom_ids
FROM moms_v2 m
JOIN cities c ON c.id = m.city_id
JOIN neighborhoods_v2 n ON n.id = m.neighborhood_id
WHERE m.status = 'standby'
GROUP BY m.city_id, m.neighborhood_id, c.name_he, n.name_he;

-- Function: Check if group should form (8 moms reached)
CREATE OR REPLACE FUNCTION check_group_formation()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
  v_group_id UUID;
  v_city_name TEXT;
  v_neighborhood_name TEXT;
  v_mom_ids UUID[];
BEGIN
  -- Count standby moms in same city + neighborhood
  SELECT COUNT(*), ARRAY_AGG(id ORDER BY created_at)
  INTO v_count, v_mom_ids
  FROM moms_v2
  WHERE city_id = NEW.city_id 
    AND neighborhood_id = NEW.neighborhood_id
    AND status = 'standby';
  
  -- If 8 or more, create group
  IF v_count >= 8 THEN
    -- Get names for group title
    SELECT c.name_he, n.name_he INTO v_city_name, v_neighborhood_name
    FROM cities c, neighborhoods_v2 n
    WHERE c.id = NEW.city_id AND n.id = NEW.neighborhood_id;
    
    -- Create the group
    INSERT INTO groups_v2 (name, city_id, neighborhood_id, member_count)
    VALUES (
      v_neighborhood_name || ' - קבוצה חדשה',
      NEW.city_id,
      NEW.neighborhood_id,
      8
    )
    RETURNING id INTO v_group_id;
    
    -- Assign first 8 moms to the group
    UPDATE moms_v2
    SET group_id = v_group_id,
        status = 'in_group',
        updated_at = NOW()
    WHERE id = ANY(v_mom_ids[1:8]);
    
    -- Add welcome message
    INSERT INTO messages_v2 (group_id, content)
    VALUES (v_group_id, 'ברוכות הבאות לקבוצה! הקבוצה נוצרה ועכשיו אפשר להתחיל להיפגש');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After mom registers, check if group should form
DROP TRIGGER IF EXISTS trigger_check_group_formation ON moms_v2;
CREATE TRIGGER trigger_check_group_formation
  AFTER INSERT ON moms_v2
  FOR EACH ROW
  WHEN (NEW.status = 'standby')
  EXECUTE FUNCTION check_group_formation();

-- Function: Toggle availability (only if in group)
CREATE OR REPLACE FUNCTION toggle_availability(mom_id UUID)
RETURNS TABLE(success BOOLEAN, new_status TEXT, error_message TEXT) AS $$
DECLARE
  v_mom RECORD;
BEGIN
  SELECT * INTO v_mom FROM moms_v2 WHERE id = mom_id;
  
  IF v_mom IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'Mom not found';
    RETURN;
  END IF;
  
  IF v_mom.status = 'standby' THEN
    RETURN QUERY SELECT false, 'standby'::TEXT, 'Still waiting for group to form';
    RETURN;
  END IF;
  
  -- Toggle
  IF v_mom.is_available THEN
    UPDATE moms_v2 SET is_available = false, status = 'in_group' WHERE id = mom_id;
    RETURN QUERY SELECT true, 'unavailable'::TEXT, NULL::TEXT;
  ELSE
    UPDATE moms_v2 SET is_available = true, status = 'available', last_available_at = NOW() WHERE id = mom_id;
    RETURN QUERY SELECT true, 'available'::TEXT, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE moms_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read neighborhoods" ON neighborhoods_v2 FOR SELECT USING (true);
CREATE POLICY "Allow all moms_v2" ON moms_v2 FOR ALL USING (true);
CREATE POLICY "Allow all groups_v2" ON groups_v2 FOR ALL USING (true);
CREATE POLICY "Allow all messages_v2" ON messages_v2 FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages_v2;
ALTER PUBLICATION supabase_realtime ADD TABLE moms_v2;

-- Indexes
CREATE INDEX idx_moms_v2_city ON moms_v2(city_id);
CREATE INDEX idx_moms_v2_neighborhood ON moms_v2(neighborhood_id);
CREATE INDEX idx_moms_v2_group ON moms_v2(group_id);
CREATE INDEX idx_moms_v2_status ON moms_v2(status);
CREATE INDEX idx_messages_v2_group ON messages_v2(group_id);
