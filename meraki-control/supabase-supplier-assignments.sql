-- Create supplier_assignments table
CREATE TABLE IF NOT EXISTS supplier_assignments (
  supplier_id TEXT PRIMARY KEY,
  supplier_name TEXT,
  restaurant TEXT NOT NULL CHECK (restaurant IN ('laluna', 'coyol', 'esh', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE supplier_assignments ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (for now - tighten later if needed)
CREATE POLICY "Allow public read" ON supplier_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON supplier_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON supplier_assignments FOR UPDATE USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_supplier_assignments_restaurant ON supplier_assignments(restaurant);
