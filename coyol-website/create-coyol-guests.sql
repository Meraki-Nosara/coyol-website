-- Create coyol_guests table (same structure as laluna_guests)
CREATE TABLE IF NOT EXISTS public.coyol_guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  visit_count INTEGER DEFAULT 1,
  last_visit DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coyol_guests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write (same as other tables)
CREATE POLICY "Allow anonymous select" ON public.coyol_guests FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.coyol_guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.coyol_guests FOR UPDATE USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_coyol_guests_phone ON public.coyol_guests(phone);
CREATE INDEX IF NOT EXISTS idx_coyol_guests_email ON public.coyol_guests(email);
CREATE INDEX IF NOT EXISTS idx_coyol_guests_name ON public.coyol_guests(name);
