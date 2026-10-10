-- Fix for large group table assignment
-- Allow multiple tables per reservation

-- Add table_ids column (array of UUIDs)
ALTER TABLE laluna_reservations ADD COLUMN IF NOT EXISTS table_ids uuid[] DEFAULT '{}';

-- Migrate existing table_id to table_ids
UPDATE laluna_reservations 
SET table_ids = ARRAY[table_id]::uuid[]
WHERE table_id IS NOT NULL AND (table_ids IS NULL OR table_ids = '{}');

-- Note: Keep table_id for backward compatibility, but prefer table_ids going forward
