-- Activities table (for meetups created by moms)
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  datetime TIMESTAMPTZ NOT NULL,
  type TEXT DEFAULT 'social' CHECK (type IN ('coffee', 'wellness', 'outdoor', 'class', 'social')),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  max_spots INT DEFAULT 8,
  is_class BOOLEAN DEFAULT false,
  price TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity participants (who's going)
CREATE TABLE activity_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Activity chat messages (separate from group chat)
CREATE TABLE activity_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_group ON activities(group_id);
CREATE INDEX idx_activities_datetime ON activities(datetime);
CREATE INDEX idx_activity_participants ON activity_participants(activity_id);
CREATE INDEX idx_activity_messages ON activity_messages(activity_id);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_messages ENABLE ROW LEVEL SECURITY;
