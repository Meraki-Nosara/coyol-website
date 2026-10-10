#!/usr/bin/env python3
"""
Weekly CRM Leads Sync
Pulls new reservations from La Luna + Coyol and adds to leads database
Runs via cron - no LLM/API costs
"""

import json
import re
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

SUPABASE_URL = "https://mnxjzvqgrrodalcmtntf.supabase.co/rest/v1"
SUPABASE_KEY = "sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD"
LEADS_FILE = Path.home() / ".openclaw/workspace/coyol-website/src/data/guests-enriched.json"
LOG_FILE = Path("/tmp/leads-sync.log")

# US/Canada area code to city mapping
AREA_CODES = {
    '212': ('New York', 'NY', 'US'),
    '213': ('Los Angeles', 'CA', 'US'),
    '305': ('Miami', 'FL', 'US'),
    '310': ('Los Angeles', 'CA', 'US'),
    '312': ('Chicago', 'IL', 'US'),
    '323': ('Los Angeles', 'CA', 'US'),
    '404': ('Atlanta', 'GA', 'US'),
    '415': ('San Francisco', 'CA', 'US'),
    '416': ('Toronto', 'ON', 'CA'),
    '469': ('Dallas', 'TX', 'US'),
    '510': ('Oakland', 'CA', 'US'),
    '512': ('Austin', 'TX', 'US'),
    '514': ('Montreal', 'QC', 'CA'),
    '604': ('Vancouver', 'BC', 'CA'),
    '617': ('Boston', 'MA', 'US'),
    '619': ('San Diego', 'CA', 'US'),
    '646': ('New York', 'NY', 'US'),
    '647': ('Toronto', 'ON', 'CA'),
    '702': ('Las Vegas', 'NV', 'US'),
    '713': ('Houston', 'TX', 'US'),
    '718': ('New York', 'NY', 'US'),
    '720': ('Denver', 'CO', 'US'),
    '786': ('Miami', 'FL', 'US'),
    '818': ('Los Angeles', 'CA', 'US'),
    '832': ('Houston', 'TX', 'US'),
    '847': ('Chicago', 'IL', 'US'),
    '858': ('San Diego', 'CA', 'US'),
    '904': ('Jacksonville', 'FL', 'US'),
    '917': ('New York', 'NY', 'US'),
    '949': ('Orange County', 'CA', 'US'),
    '954': ('Fort Lauderdale', 'FL', 'US'),
    '972': ('Dallas', 'TX', 'US'),
}

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")

def fetch_reservations(table, since_days=14):
    """Fetch recent reservations from Supabase"""
    import urllib.request
    
    since_date = (datetime.now() - timedelta(days=since_days)).strftime("%Y-%m-%d")
    url = f"{SUPABASE_URL}/{table}?select=guest_name,guest_email,guest_phone,date,status&date=gte.{since_date}&limit=1000"
    
    req = urllib.request.Request(url)
    req.add_header("apikey", SUPABASE_KEY)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        log(f"Error fetching {table}: {e}")
        return []

def parse_phone(phone):
    """Extract country code and area code from phone"""
    if not phone:
        return None, None, None
    
    phone = re.sub(r'[^\d+]', '', phone)
    
    if phone.startswith('+1') or (phone.startswith('1') and len(phone) == 11):
        phone = phone.lstrip('+')
        if phone.startswith('1'):
            area = phone[1:4]
            return 'US', area, phone
    
    if phone.startswith('+506') or phone.startswith('506'):
        return 'CR', None, phone
    
    if len(phone) == 10 and phone[0] in '2345678':
        return 'US', phone[:3], phone
    
    return None, None, phone

def enrich_lead(lead, source):
    """Enrich a lead with phone data"""
    country, area, phone_clean = parse_phone(lead.get('guest_phone', ''))
    
    enriched = {
        'id': f"{source[:2]}-{datetime.now().strftime('%Y%m%d')}-{hash(lead.get('guest_email','')) % 10000}",
        'name': lead.get('guest_name', ''),
        'email': (lead.get('guest_email') or '').lower().strip(),
        'phone': lead.get('guest_phone', ''),
        'phone_normalized': phone_clean,
        'source': source,
        'source_type': 'reservation',
        'country_code': country,
        'area_code': area,
        'created_at': lead.get('date', ''),
        'status': 'new',
        'lead_score': 40,
        'segment': 'COLD'
    }
    
    # Lookup city from area code
    if area and area in AREA_CODES:
        city, region, country = AREA_CODES[area]
        enriched['city'] = city
        enriched['region'] = region
        enriched['country_code'] = country
    
    # Score adjustment
    if enriched['country_code'] in ('US', 'CA'):
        enriched['lead_score'] = 45
        if enriched.get('city'):
            enriched['lead_score'] = 50
    
    # Set segment
    if enriched['lead_score'] >= 50:
        enriched['segment'] = 'HOT'
    elif enriched['lead_score'] >= 45:
        enriched['segment'] = 'WARM'
    
    return enriched

def main():
    log("Starting weekly leads sync...")
    
    # Load current leads
    try:
        with open(LEADS_FILE) as f:
            data = json.load(f)
        current_emails = set(g.get('email', '').lower() for g in data['guests'] if g.get('email'))
        log(f"Current leads: {len(data['guests'])}")
    except Exception as e:
        log(f"Error loading leads file: {e}")
        return
    
    # Fetch recent reservations
    laluna = fetch_reservations('laluna_reservations')
    coyol = fetch_reservations('coyol_reservations')
    log(f"Fetched: {len(laluna)} La Luna, {len(coyol)} Coyol reservations")
    
    # Find and enrich new leads
    new_leads = []
    
    for r in laluna:
        email = (r.get('guest_email') or '').lower().strip()
        if email and email not in current_emails:
            current_emails.add(email)
            new_leads.append(enrich_lead(r, 'laluna'))
    
    for r in coyol:
        email = (r.get('guest_email') or '').lower().strip()
        if email and email not in current_emails:
            current_emails.add(email)
            new_leads.append(enrich_lead(r, 'coyol'))
    
    if not new_leads:
        log("No new leads found")
        return
    
    log(f"New leads to add: {len(new_leads)}")
    
    # Add to data
    data['guests'].extend(new_leads)
    data['summary']['total'] = len(data['guests'])
    
    # Save
    with open(LEADS_FILE, 'w') as f:
        json.dump(data, f)
    log(f"Saved {len(data['guests'])} total leads")
    
    # Deploy
    try:
        result = subprocess.run(
            ['npx', 'vercel', '--prod', '--yes'],
            cwd=str(LEADS_FILE.parent.parent.parent),
            capture_output=True,
            text=True,
            timeout=180
        )
        if result.returncode == 0:
            log("Deployed successfully")
        else:
            log(f"Deploy failed: {result.stderr[:200]}")
    except Exception as e:
        log(f"Deploy error: {e}")
    
    log("Sync complete")

if __name__ == "__main__":
    main()
