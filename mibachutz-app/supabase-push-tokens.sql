-- Add push notification columns to moms_v2
ALTER TABLE moms_v2 ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE moms_v2 ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false;
