-- Run this in Supabase SQL Editor
ALTER TABLE moms_v2 ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT false;
