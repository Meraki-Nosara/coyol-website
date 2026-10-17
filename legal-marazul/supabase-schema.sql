-- Legal Mar Azul Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with access codes
CREATE TABLE legal_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'lawyer', 'viewer')),
  access_code VARCHAR(64) UNIQUE NOT NULL,
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases table
CREATE TABLE legal_cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed', 'urgent')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES legal_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE legal_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  uploaded_by UUID REFERENCES legal_users(id),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (court dates, deadlines, meetings)
CREATE TABLE legal_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
  event_type VARCHAR(20) DEFAULT 'other' CHECK (event_type IN ('court_date', 'deadline', 'meeting', 'filing', 'other')),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  reminder_sent BOOLEAN DEFAULT false,
  created_by UUID REFERENCES legal_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE legal_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
  author_id UUID REFERENCES legal_users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for security
CREATE TABLE legal_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES legal_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cases_status ON legal_cases(status);
CREATE INDEX idx_cases_priority ON legal_cases(priority);
CREATE INDEX idx_documents_case ON legal_documents(case_id);
CREATE INDEX idx_events_case ON legal_events(case_id);
CREATE INDEX idx_events_date ON legal_events(event_date);
CREATE INDEX idx_comments_case ON legal_comments(case_id);
CREATE INDEX idx_audit_user ON legal_audit_log(user_id);
CREATE INDEX idx_audit_created ON legal_audit_log(created_at);

-- Row Level Security
ALTER TABLE legal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies (allow authenticated access - we handle auth via access codes)
CREATE POLICY "Allow all for authenticated" ON legal_users FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON legal_cases FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON legal_documents FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON legal_events FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON legal_comments FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON legal_audit_log FOR ALL USING (true);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('legal-documents', 'legal-documents', false);

-- Storage policy
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'legal-documents');
CREATE POLICY "Allow authenticated downloads" ON storage.objects FOR SELECT USING (bucket_id = 'legal-documents');
