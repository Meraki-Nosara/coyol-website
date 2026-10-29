-- Due Diligence Portal Schema
-- Run this in Supabase SQL Editor

-- 1. DD Portals table (one per deal)
CREATE TABLE IF NOT EXISTS dd_portals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT UNIQUE NOT NULL,           -- e.g., 'espavel-niki'
  access_code TEXT UNIQUE NOT NULL,       -- e.g., 'NIKI2026'
  buyer_names TEXT NOT NULL,              -- e.g., 'Niki & Zack'
  development TEXT DEFAULT 'Mar Azul',
  properties TEXT DEFAULT 'Lots 19 & 36',
  total_land_m2 INTEGER DEFAULT 5358,
  land_price NUMERIC DEFAULT 1000000,
  construction_price NUMERIC DEFAULT 2829850,
  total_investment NUMERIC DEFAULT 3829850,
  user_role TEXT DEFAULT 'buyer',         -- buyer, buyer_legal, admin, coyol_legal
  verification_status JSONB DEFAULT '{
    "property_ownership": "pending",
    "condo_documentation": "pending",
    "water_electricity": "pending",
    "construction_rights": "pending",
    "financial_obligations": "pending",
    "purchase_agreements": "drafting",
    "construction_agreement": "drafting"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DD Documents table
CREATE TABLE IF NOT EXISTS dd_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_id UUID REFERENCES dd_portals(id) ON DELETE CASCADE,
  section TEXT NOT NULL,                  -- '01', '02', etc.
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf',           -- pdf, doc, xlsx, jpg, etc.
  lot TEXT,                               -- '19', '36', or NULL for both
  source TEXT,                            -- 'Registro Nacional', 'ICE', etc.
  issuing_authority TEXT,
  issue_date DATE,
  expiration_date DATE,
  version INTEGER DEFAULT 1,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  is_internal BOOLEAN DEFAULT FALSE,      -- Internal docs not visible to buyers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT
);

-- 3. DD Questions table
CREATE TABLE IF NOT EXISTS dd_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_id UUID REFERENCES dd_portals(id) ON DELETE CASCADE,
  section TEXT,                           -- Optional section reference
  document_id UUID REFERENCES dd_documents(id), -- Optional document reference
  question TEXT NOT NULL,
  asked_by TEXT NOT NULL,
  answer TEXT,
  answered_by TEXT,
  answered_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',          -- pending, answered, closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create storage bucket for DD documents (run separately in Storage settings)
-- Bucket name: dd-documents
-- Public: No (private)
-- Allowed MIME types: application/pdf, image/*, application/msword, application/vnd.openxmlformats-officedocument.*

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_dd_documents_portal ON dd_documents(portal_id);
CREATE INDEX IF NOT EXISTS idx_dd_documents_section ON dd_documents(section);
CREATE INDEX IF NOT EXISTS idx_dd_questions_portal ON dd_questions(portal_id);

-- 6. Insert the Espavel-Niki portal with different access codes per role
-- Each role gets their own access code to the same deal data
INSERT INTO dd_portals (deal_id, access_code, buyer_names, user_role) 
VALUES 
  ('espavel-niki', 'NIKI2026', 'Niki & Zack', 'buyer')
ON CONFLICT (access_code) DO NOTHING;

-- Access codes:
-- NIKI2026   - Buyer access (Niki & Zack)
-- Future: Add more codes for buyer_legal, admin, coyol_legal as needed
