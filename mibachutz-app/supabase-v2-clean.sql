-- ================================================
-- MIBACHUTZ V2 - COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- ================================================

-- 1. CITIES
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he TEXT NOT NULL UNIQUE,
  name_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 2. NEIGHBORHOODS (linked to cities)
CREATE TABLE IF NOT EXISTS neighborhoods_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name_he TEXT NOT NULL,
  name_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, name_he)
);

INSERT INTO neighborhoods_v2 (city_id, name_he, name_en)
SELECT c.id, n.name_he, n.name_en FROM cities c, 
(VALUES 
  ('תל אביב', 'רמת אביב', 'Ramat Aviv'),
  ('תל אביב', 'תל אביב מרכז', 'Tel Aviv Center'),
  ('תל אביב', 'פלורנטין', 'Florentin'),
  ('תל אביב', 'נווה צדק', 'Neve Tzedek'),
  ('תל אביב', 'יפו', 'Jaffa'),
  ('תל אביב', 'רמת החייל', 'Ramat HaChayal'),
  ('תל אביב', 'הצפון הישן', 'Old North'),
  ('תל אביב', 'לב העיר', 'City Center'),
  ('הרצליה', 'הרצליה פיתוח', 'Herzliya Pituach'),
  ('הרצליה', 'הרצליה מרכז', 'Herzliya Center'),
  ('הרצליה', 'נווה אמירים', 'Neve Amirim'),
  ('רעננה', 'רעננה מרכז', 'Raanana Center'),
  ('רעננה', 'רעננה צפון', 'Raanana North'),
  ('רעננה', 'רעננה דרום', 'Raanana South'),
  ('כפר סבא', 'כפר סבא מרכז', 'Kfar Saba Center'),
  ('כפר סבא', 'כפר סבא הירוקה', 'Green Kfar Saba'),
  ('רמת גן', 'רמת גן מרכז', 'Ramat Gan Center'),
  ('רמת גן', 'בורסה', 'Diamond Exchange'),
  ('גבעתיים', 'גבעתיים מרכז', 'Givatayim Center'),
  ('ראשון לציון', 'ראשון מערב', 'Rishon West'),
  ('ראשון לציון', 'ראשון מרכז', 'Rishon Center')
) AS n(city_name, name_he, name_en)
WHERE c.name_he = n.city_name
ON CONFLICT (city_id, name_he) DO NOTHING;

-- 3. GROUPS
CREATE TABLE IF NOT EXISTS groups_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city_id UUID REFERENCES cities(id),
  neighborhood_id UUID REFERENCES neighborhoods_v2(id),
  member_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MOMS
CREATE TABLE IF NOT EXISTS moms_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  baby_birthday DATE NOT NULL,
  city_id UUID REFERENCES cities(id),
  neighborhood_id UUID REFERENCES neighborhoods_v2(id),
  group_id UUID REFERENCES groups_v2(id),
  status TEXT DEFAULT 'standby' CHECK (status IN ('standby', 'in_group', 'available', 'unavailable')),
  is_available BOOLEAN DEFAULT false,
  last_available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MESSAGES (group chat only)
CREATE TABLE IF NOT EXISTS messages_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups_v2(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES moms_v2(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUTO-GROUP TRIGGER (forms group when 8 moms register)
CREATE OR REPLACE FUNCTION check_group_formation()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
  v_group_id UUID;
  v_neighborhood_name TEXT;
  v_mom_ids UUID[];
BEGIN
  SELECT COUNT(*), ARRAY_AGG(id ORDER BY created_at)
  INTO v_count, v_mom_ids
  FROM moms_v2
  WHERE city_id = NEW.city_id 
    AND neighborhood_id = NEW.neighborhood_id
    AND status = 'standby';
  
  IF v_count >= 8 THEN
    SELECT name_he INTO v_neighborhood_name
    FROM neighborhoods_v2 WHERE id = NEW.neighborhood_id;
    
    INSERT INTO groups_v2 (name, city_id, neighborhood_id, member_count)
    VALUES (v_neighborhood_name || ' - קבוצה חדשה', NEW.city_id, NEW.neighborhood_id, 8)
    RETURNING id INTO v_group_id;
    
    UPDATE moms_v2
    SET group_id = v_group_id, status = 'in_group', updated_at = NOW()
    WHERE id = ANY(v_mom_ids[1:8]);
    
    INSERT INTO messages_v2 (group_id, content)
    VALUES (v_group_id, 'ברוכות הבאות! הקבוצה נוצרה - לחצו על הכפתור כשתצאו');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_group_formation ON moms_v2;
CREATE TRIGGER trigger_check_group_formation
  AFTER INSERT ON moms_v2
  FOR EACH ROW
  WHEN (NEW.status = 'standby')
  EXECUTE FUNCTION check_group_formation();

-- 7. RLS POLICIES
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE moms_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cities" ON cities;
DROP POLICY IF EXISTS "Public read neighborhoods" ON neighborhoods_v2;
DROP POLICY IF EXISTS "Allow all moms_v2" ON moms_v2;
DROP POLICY IF EXISTS "Allow all groups_v2" ON groups_v2;
DROP POLICY IF EXISTS "Allow all messages_v2" ON messages_v2;

CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read neighborhoods" ON neighborhoods_v2 FOR SELECT USING (true);
CREATE POLICY "Allow all moms_v2" ON moms_v2 FOR ALL USING (true);
CREATE POLICY "Allow all groups_v2" ON groups_v2 FOR ALL USING (true);
CREATE POLICY "Allow all messages_v2" ON messages_v2 FOR ALL USING (true);

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_moms_v2_neighborhood ON moms_v2(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_moms_v2_group ON moms_v2(group_id);
CREATE INDEX IF NOT EXISTS idx_moms_v2_status ON moms_v2(status);
CREATE INDEX IF NOT EXISTS idx_messages_v2_group ON messages_v2(group_id);
