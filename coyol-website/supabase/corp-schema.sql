-- =====================================================
-- CORPORATE STRUCTURE PLATFORM - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing tables if recreating (comment out in production)
-- DROP TABLE IF EXISTS corp_document_links CASCADE;
-- DROP TABLE IF EXISTS corp_transactions CASCADE;
-- DROP TABLE IF EXISTS corp_documents CASCADE;
-- DROP TABLE IF EXISTS corp_relationships CASCADE;
-- DROP TABLE IF EXISTS corp_companies CASCADE;
-- DROP TABLE IF EXISTS corp_access_codes CASCADE;

-- =====================================================
-- ACCESS CONTROL
-- =====================================================

CREATE TABLE IF NOT EXISTS corp_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer', -- admin, editor, viewer
  email TEXT,
  active BOOLEAN DEFAULT true,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Insert initial access code (Marion only)
INSERT INTO corp_access_codes (code, name, role, email) 
VALUES ('COYOL2026', 'Marion Peri', 'admin', 'marionnosara@gmail.com')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- COMPANIES
-- =====================================================

CREATE TABLE IF NOT EXISTS corp_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cedula TEXT,
  type TEXT NOT NULL DEFAULT 'operating', 
  -- Types: holding, operating, realestate, planned, inactive
  activity TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  -- Status: active, planned, inactive, dissolved
  incorporation_date DATE,
  registered_address TEXT,
  legal_rep TEXT,
  share_capital TEXT,
  notes TEXT,
  -- Canvas position
  x NUMERIC DEFAULT 100,
  y NUMERIC DEFAULT 100,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- =====================================================
-- SHAREHOLDERS (ownership records)
-- =====================================================

CREATE TABLE IF NOT EXISTS corp_shareholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES corp_companies(id) ON DELETE CASCADE,
  shareholder_type TEXT NOT NULL, -- person, company
  shareholder_name TEXT NOT NULL,
  shareholder_id TEXT, -- cedula or company id
  shares_percent NUMERIC,
  shares_amount NUMERIC,
  share_type TEXT, -- common, preferred
  effective_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RELATIONSHIPS (between companies)
-- =====================================================

CREATE TABLE IF NOT EXISTS corp_relationships (
  id TEXT PRIMARY KEY,
  from_company TEXT NOT NULL REFERENCES corp_companies(id) ON DELETE CASCADE,
  to_company TEXT NOT NULL REFERENCES corp_companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  -- Types: ownership, financing, services, property, management, other
  description TEXT,
  amount TEXT,
  amount_numeric NUMERIC,
  currency TEXT DEFAULT 'CRC',
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status: verified, planned, pending, historical
  effective_date DATE,
  end_date DATE,
  legal_basis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS corp_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  -- Categories: acta, contract, certificate, deed, invoice, bank_statement, 
  -- tax_filing, power_of_attorney, corporate_resolution, registry_cert, other
  document_date DATE,
  effective_date DATE,
  -- AI-generated fields
  ai_summary TEXT,
  ai_extracted_data JSONB DEFAULT '{}',
  -- Status
  status TEXT DEFAULT 'pending', -- pending, reviewed, verified, archived
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  -- Metadata
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT LINKS (many-to-many)
-- =====================================================

CREATE TABLE IF NOT EXISTS corp_document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES corp_documents(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL, -- company, relationship, property, transaction, shareholder
  link_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRANSACTIONS (financial movements)
-- =====================================================

CREATE TABLE IF NOT EXISTS corp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id TEXT REFERENCES corp_relationships(id),
  from_company TEXT REFERENCES corp_companies(id),
  to_company TEXT REFERENCES corp_companies(id),
  type TEXT NOT NULL,
  -- Types: loan_advance, loan_repayment, capital_contribution, capital_reimbursement,
  -- dividend, service_payment, property_transfer, debt_compensation
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'CRC',
  exchange_rate NUMERIC,
  transaction_date DATE NOT NULL,
  description TEXT,
  bank_reference TEXT,
  accounting_reference TEXT,
  -- Tax
  tax_treatment TEXT,
  taxable_amount NUMERIC,
  tax_rate NUMERIC,
  tax_amount NUMERIC,
  -- Status
  status TEXT DEFAULT 'pending', -- pending, verified, disputed, cancelled
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROPERTIES (for real estate tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS corp_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  property_number TEXT, -- Registro Nacional number
  cadastral_plan TEXT,
  lot_number TEXT,
  development TEXT, -- Mar Azul, Nosara Hills, Los Coyoles
  area_m2 NUMERIC,
  owner_company TEXT REFERENCES corp_companies(id),
  owner_person TEXT,
  -- Valuation
  acquisition_date DATE,
  acquisition_value NUMERIC,
  current_value NUMERIC,
  valuation_date DATE,
  -- Tax group (for Mar Azul)
  tax_group TEXT, -- A (historical), B (transferred), C (future)
  -- Status
  status TEXT DEFAULT 'active', -- active, sold, transferred, pending
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE corp_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_document_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp_properties ENABLE ROW LEVEL SECURITY;

-- Policies: Allow access with valid API key
-- In production, you would use Supabase Auth and check auth.uid()
-- For now, we use anon key with RLS that allows all (protected by access code in app)

CREATE POLICY "corp_access_codes_policy" ON corp_access_codes FOR ALL USING (true);
CREATE POLICY "corp_companies_policy" ON corp_companies FOR ALL USING (true);
CREATE POLICY "corp_shareholders_policy" ON corp_shareholders FOR ALL USING (true);
CREATE POLICY "corp_relationships_policy" ON corp_relationships FOR ALL USING (true);
CREATE POLICY "corp_documents_policy" ON corp_documents FOR ALL USING (true);
CREATE POLICY "corp_document_links_policy" ON corp_document_links FOR ALL USING (true);
CREATE POLICY "corp_transactions_policy" ON corp_transactions FOR ALL USING (true);
CREATE POLICY "corp_properties_policy" ON corp_properties FOR ALL USING (true);

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_corp_companies_type ON corp_companies(type);
CREATE INDEX IF NOT EXISTS idx_corp_companies_status ON corp_companies(status);
CREATE INDEX IF NOT EXISTS idx_corp_relationships_from ON corp_relationships(from_company);
CREATE INDEX IF NOT EXISTS idx_corp_relationships_to ON corp_relationships(to_company);
CREATE INDEX IF NOT EXISTS idx_corp_relationships_type ON corp_relationships(type);
CREATE INDEX IF NOT EXISTS idx_corp_documents_category ON corp_documents(category);
CREATE INDEX IF NOT EXISTS idx_corp_document_links_doc ON corp_document_links(document_id);
CREATE INDEX IF NOT EXISTS idx_corp_document_links_link ON corp_document_links(link_type, link_id);
CREATE INDEX IF NOT EXISTS idx_corp_transactions_date ON corp_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_corp_properties_owner ON corp_properties(owner_company);
CREATE INDEX IF NOT EXISTS idx_corp_properties_development ON corp_properties(development);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert initial companies
INSERT INTO corp_companies (id, name, cedula, type, activity, status, x, y) VALUES
  ('holding', 'Sociedad 3-102-861529', '3-102-861529', 'holding', 'Holding Company', 'active', 400, 100),
  ('meraki', 'Meraki Family Ltda.', NULL, 'operating', 'Restaurant Operations', 'active', 200, 300),
  ('drma', 'Desarrollo Rancho Mar Azul S.A.', NULL, 'realestate', 'Real Estate Development', 'active', 600, 300),
  ('coyolgroup', 'Coyol Group', NULL, 'planned', 'Development Company', 'planned', 600, 500)
ON CONFLICT (id) DO NOTHING;

-- Insert initial relationships
INSERT INTO corp_relationships (id, from_company, to_company, type, description, amount, status) VALUES
  ('r1', 'holding', 'meraki', 'ownership', 'Acquisition of 100% of Meraki', '₡100M', 'verified'),
  ('r2', 'holding', 'drma', 'financing', 'Intercompany financing up to ₡500M', '₡500M authorized', 'verified'),
  ('r3', 'drma', 'coyolgroup', 'property', 'Planned sale of development lots', 'TBD', 'planned')
ON CONFLICT (id) DO NOTHING;

-- Insert Marion and Angelina as shareholders of Holding
INSERT INTO corp_shareholders (company_id, shareholder_type, shareholder_name, shares_percent, effective_date) VALUES
  ('holding', 'person', 'Marion Peri', 50, '2020-01-01'),
  ('holding', 'person', 'Angelina Fraser', 50, '2020-01-01')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STORAGE BUCKET (run separately in Supabase Dashboard)
-- =====================================================
-- Go to Storage > Create new bucket
-- Name: corp-documents
-- Public: OFF (private)
-- File size limit: 50MB
-- Allowed MIME types: application/pdf, image/*, application/msword, 
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--   application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

-- =====================================================
-- DONE! 
-- =====================================================
-- After running this SQL:
-- 1. Create the 'corp-documents' storage bucket (private)
-- 2. Test at: https://coyolnosara.com/corporate/
-- 3. Access code: COYOL2026
