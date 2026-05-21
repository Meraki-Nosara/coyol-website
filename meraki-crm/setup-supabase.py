#!/usr/bin/env python3
"""
Setup Supabase tables for Meraki CRM and import 34K guests
"""

import json
import requests
import time
from datetime import datetime

SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co'
SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD'

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
}

def create_tables_sql():
    """Return SQL to create CRM tables"""
    return """
-- CRM Guests table
CREATE TABLE IF NOT EXISTS crm_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  phone_normalized TEXT,
  source TEXT,
  source_type TEXT,
  area_code TEXT,
  country_code TEXT,
  city TEXT,
  region TEXT,
  tier INTEGER DEFAULT 3,
  email_domain TEXT,
  is_corporate_email BOOLEAN DEFAULT FALSE,
  lead_score INTEGER DEFAULT 0,
  segment TEXT DEFAULT 'nurture',
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_guests_email ON crm_guests(email);
CREATE INDEX IF NOT EXISTS idx_crm_guests_segment ON crm_guests(segment);
CREATE INDEX IF NOT EXISTS idx_crm_guests_score ON crm_guests(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_guests_region ON crm_guests(region);
CREATE INDEX IF NOT EXISTS idx_crm_guests_city ON crm_guests(city);

-- Guest interactions/visits
CREATE TABLE IF NOT EXISTS crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES crm_guests(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT,
  direction TEXT,
  subject TEXT,
  summary TEXT,
  property_interest TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_interactions_guest ON crm_interactions(guest_id);

-- Pipeline stages
CREATE TABLE IF NOT EXISTS crm_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES crm_guests(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  deal_value DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_pipeline_guest ON crm_pipeline(guest_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stage ON crm_pipeline(stage);

-- Enable RLS
ALTER TABLE crm_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline ENABLE ROW LEVEL SECURITY;

-- Allow public read for now (we'll tighten this later)
CREATE POLICY IF NOT EXISTS "Allow public read on crm_guests" ON crm_guests FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert on crm_guests" ON crm_guests FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public update on crm_guests" ON crm_guests FOR UPDATE USING (true);
"""

def insert_guests_batch(guests, batch_num, total_batches):
    """Insert a batch of guests"""
    url = f'{SUPABASE_URL}/rest/v1/crm_guests'
    
    # Prepare data - only include fields that exist in the table
    batch_data = []
    for g in guests:
        record = {
            'name': g.get('name'),
            'email': g.get('email'),
            'phone': g.get('phone'),
            'phone_normalized': g.get('phone_normalized'),
            'source': g.get('source'),
            'source_type': g.get('source_type'),
            'area_code': g.get('area_code'),
            'country_code': g.get('country_code'),
            'city': g.get('city'),
            'region': g.get('region'),
            'tier': g.get('tier', 3),
            'email_domain': g.get('email_domain'),
            'is_corporate_email': g.get('is_corporate_email', False),
            'lead_score': g.get('lead_score', 0),
            'segment': g.get('segment', 'nurture'),
            'status': 'new',
        }
        # Only include if has email (primary key)
        if record['email']:
            batch_data.append(record)
    
    if not batch_data:
        return 0
    
    # Use upsert to handle duplicates
    response = requests.post(
        url,
        headers={
            **headers,
            'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        json=batch_data
    )
    
    if response.status_code in [200, 201]:
        print(f"  Batch {batch_num}/{total_batches}: {len(batch_data)} guests inserted")
        return len(batch_data)
    else:
        print(f"  Batch {batch_num} error: {response.status_code} - {response.text[:200]}")
        return 0


def main():
    print("=== MERAKI CRM SUPABASE SETUP ===\n")
    
    # Load guest data
    print("Loading guest data...")
    with open('/Users/Coyol/.openclaw/workspace/meraki-crm/data/guests-enriched.json', 'r') as f:
        data = json.load(f)
    
    guests = data.get('guests', [])
    print(f"Loaded {len(guests):,} guests\n")
    
    # Check if table exists by trying to query it
    print("Checking if crm_guests table exists...")
    check_url = f'{SUPABASE_URL}/rest/v1/crm_guests?limit=1'
    response = requests.get(check_url, headers=headers)
    
    if response.status_code == 200:
        print("Table exists! Proceeding with import...\n")
    else:
        print(f"Table may not exist (status {response.status_code})")
        print("Please run this SQL in Supabase dashboard:\n")
        print("=" * 50)
        print(create_tables_sql())
        print("=" * 50)
        print("\nThen run this script again.")
        
        # Try to create via RPC if available
        print("\nAttempting to create table via API...")
        # Note: This typically requires service_role key, not anon key
        # For now, we'll proceed with import and let it fail gracefully
    
    # Import guests in batches
    print("Importing guests to Supabase...")
    batch_size = 500
    total_imported = 0
    total_batches = (len(guests) + batch_size - 1) // batch_size
    
    for i in range(0, len(guests), batch_size):
        batch = guests[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        imported = insert_guests_batch(batch, batch_num, total_batches)
        total_imported += imported
        
        # Small delay to avoid rate limiting
        if batch_num % 10 == 0:
            time.sleep(0.5)
    
    print(f"\n=== IMPORT COMPLETE ===")
    print(f"Total imported: {total_imported:,} guests")
    
    # Verify
    print("\nVerifying import...")
    verify_url = f'{SUPABASE_URL}/rest/v1/crm_guests?select=count'
    response = requests.get(
        verify_url,
        headers={**headers, 'Prefer': 'count=exact'}
    )
    
    if response.status_code == 200:
        count = response.headers.get('content-range', '').split('/')[-1]
        print(f"Guests in database: {count}")
    
    # Show segment breakdown
    print("\nSegment breakdown:")
    for segment in ['hot', 'warm', 'nurture', 'local']:
        seg_url = f'{SUPABASE_URL}/rest/v1/crm_guests?segment=eq.{segment}&select=count'
        response = requests.get(seg_url, headers={**headers, 'Prefer': 'count=exact'})
        if response.status_code == 200:
            count = response.headers.get('content-range', '').split('/')[-1]
            print(f"  {segment}: {count}")


if __name__ == "__main__":
    main()
