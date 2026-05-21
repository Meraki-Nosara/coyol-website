-- =============================================
-- MERAKI CRM - SECURITY CONFIGURATION
-- Run this AFTER creating the tables
-- =============================================

-- 1. REVOKE PUBLIC ACCESS (default Supabase allows anon access)
REVOKE ALL ON crm_guests FROM anon;
REVOKE ALL ON crm_interactions FROM anon;
REVOKE ALL ON crm_pipeline FROM anon;

-- 2. DROP OPEN POLICIES (we created permissive ones initially)
DROP POLICY IF EXISTS "Allow all on crm_guests" ON crm_guests;
DROP POLICY IF EXISTS "Allow all on crm_interactions" ON crm_interactions;
DROP POLICY IF EXISTS "Allow all on crm_pipeline" ON crm_pipeline;

-- 3. CREATE STRICT RLS POLICIES

-- Only authenticated users with 'crm_admin' role can access
CREATE POLICY "CRM admins only - select" ON crm_guests
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'marionnosara@gmail.com',
      'ruth@coyolrealestate.com',
      'angelina@merakinosara.com'
    )
  );

CREATE POLICY "CRM admins only - insert" ON crm_guests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'marionnosara@gmail.com',
      'ruth@coyolrealestate.com'
    )
  );

CREATE POLICY "CRM admins only - update" ON crm_guests
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'marionnosara@gmail.com',
      'ruth@coyolrealestate.com'
    )
  );

CREATE POLICY "CRM admins only - delete" ON crm_guests
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'marionnosara@gmail.com'
  );

-- Same for interactions
CREATE POLICY "CRM admins only - interactions" ON crm_interactions
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'marionnosara@gmail.com',
      'ruth@coyolrealestate.com'
    )
  );

-- Same for pipeline
CREATE POLICY "CRM admins only - pipeline" ON crm_pipeline
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'marionnosara@gmail.com',
      'ruth@coyolrealestate.com'
    )
  );

-- 4. CREATE SERVICE ROLE FOR AUTOMATION
-- The automation scripts will use a service_role key (not anon)
-- This bypasses RLS but should be kept secure

-- 5. AUDIT LOGGING
CREATE TABLE IF NOT EXISTS crm_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  user_email TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION crm_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO crm_audit_log (table_name, action, record_id, old_data, new_data, user_email)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.jwt() ->> 'email'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers
DROP TRIGGER IF EXISTS crm_guests_audit ON crm_guests;
CREATE TRIGGER crm_guests_audit
  AFTER INSERT OR UPDATE OR DELETE ON crm_guests
  FOR EACH ROW EXECUTE FUNCTION crm_audit_trigger();

DROP TRIGGER IF EXISTS crm_pipeline_audit ON crm_pipeline;
CREATE TRIGGER crm_pipeline_audit
  AFTER INSERT OR UPDATE OR DELETE ON crm_pipeline
  FOR EACH ROW EXECUTE FUNCTION crm_audit_trigger();

-- 6. DATA ENCRYPTION (for sensitive fields)
-- Note: Supabase encrypts at rest by default
-- For extra protection on email/phone, we can use pgcrypto:

-- Enable extension if not already
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 7. RATE LIMITING VIEW (detect suspicious access patterns)
CREATE OR REPLACE VIEW crm_access_stats AS
SELECT 
  user_email,
  DATE(created_at) as access_date,
  COUNT(*) as access_count,
  COUNT(DISTINCT record_id) as unique_records
FROM crm_audit_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_email, DATE(created_at)
ORDER BY access_date DESC, access_count DESC;

-- 8. BLOCK BULK EXPORTS (limit query size for anon/auth)
-- This is done via Supabase dashboard: Settings > API > Max Rows = 100

-- 9. SENSITIVE COLUMNS - CREATE MASKED VIEW FOR REPORTS
CREATE OR REPLACE VIEW crm_guests_masked AS
SELECT 
  id,
  name,
  -- Mask email: show only domain
  CONCAT('***@', split_part(email, '@', 2)) as email_masked,
  -- Mask phone: show only area code
  CONCAT(LEFT(phone, 5), '***-****') as phone_masked,
  city,
  region,
  lead_score,
  segment,
  source,
  created_at
FROM crm_guests;

-- Grant access to masked view for reporting
-- (Less sensitive for dashboards)
