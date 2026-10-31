-- Legal Mar Azul - Folders Migration
-- Run this in Supabase SQL Editor to add subfolder support

-- Folders table (subfolders within cases)
CREATE TABLE IF NOT EXISTS legal_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT 'gray', -- gray, blue, green, yellow, red, purple
  icon VARCHAR(50) DEFAULT 'folder', -- folder, file, evidence, contract, correspondence, court
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES legal_users(id)
);

-- Add folder_id to documents table
ALTER TABLE legal_documents 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES legal_folders(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_folders_case ON legal_folders(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON legal_documents(folder_id);

-- Enable RLS
ALTER TABLE legal_folders ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Allow all for authenticated" ON legal_folders FOR ALL USING (true);

-- Default folders template (can be used when creating new cases)
-- These are just suggestions, not auto-created
COMMENT ON TABLE legal_folders IS 'Suggested folder names: Demandas, Contestaciones, Pruebas, Resoluciones, Notificaciones, Correspondencia, Contratos, Peritajes';
