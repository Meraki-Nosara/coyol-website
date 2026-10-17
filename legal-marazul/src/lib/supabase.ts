import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface LegalCase {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'closed' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface LegalDocument {
  id: string;
  case_id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  tags: string[];
  created_at: string;
}

export interface LegalEvent {
  id: string;
  case_id: string;
  event_type: 'court_date' | 'deadline' | 'meeting' | 'filing' | 'other';
  title: string;
  description: string;
  event_date: string;
  created_at: string;
}

export interface LegalComment {
  id: string;
  case_id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface LegalUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lawyer' | 'viewer';
  access_code: string;
  last_login: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  created_at: string;
}
