#!/usr/bin/env python3
"""
Meraki CRM Email Integration
- Monitors reservation emails from Coyol & La Luna
- Auto-enriches new guests
- Updates CRM in Supabase
- Alerts Ruth on hot leads
"""

import subprocess
import json
import re
import os
from datetime import datetime, timedelta

SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co'
SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD'

# Area code mapping for scoring
TIER1_AREAS = {
    '212', '917', '646',  # NYC
    '310', '323',          # LA
    '415',                 # SF
    '305', '786',          # Miami
    '416', '647',          # Toronto
    '604',                 # Vancouver
    '617',                 # Boston
    '312',                 # Chicago
}

TIER2_AREAS = {
    '858', '619',          # San Diego
    '949',                 # Orange County
    '303', '970',          # Denver/Colorado
    '512',                 # Austin
    '206',                 # Seattle
    '404',                 # Atlanta
    '514',                 # Montreal
    '702',                 # Vegas
    '203', '516', '914',   # NYC suburbs
}

AREA_TO_CITY = {
    '212': 'New York', '917': 'New York', '646': 'New York',
    '310': 'Los Angeles', '323': 'Los Angeles',
    '415': 'San Francisco',
    '305': 'Miami', '786': 'Miami',
    '416': 'Toronto', '647': 'Toronto',
    '604': 'Vancouver',
    '617': 'Boston',
    '312': 'Chicago',
    '858': 'San Diego', '619': 'San Diego',
    '949': 'Orange County',
    '303': 'Denver', '970': 'Colorado',
    '512': 'Austin',
    '206': 'Seattle',
    '404': 'Atlanta',
    '514': 'Montreal',
    '702': 'Las Vegas',
    '506': 'Costa Rica',
}

PERSONAL_DOMAINS = {'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'live.com', 'me.com'}


def run_himalaya(args):
    """Run himalaya CLI command"""
    cmd = ['himalaya'] + args
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout, result.stderr


def get_recent_reservations(account, hours=24):
    """Fetch recent reservation emails"""
    # List recent emails
    stdout, _ = run_himalaya(['-a', account, 'envelope', 'list', '--page-size', '50'])
    
    reservations = []
    lines = stdout.strip().split('\n')
    
    for line in lines:
        # Look for reservation-related emails
        if any(kw in line.lower() for kw in ['reservation', 'booking', 'table for', 'party of']):
            # Extract email ID (first column)
            parts = line.split()
            if parts:
                email_id = parts[0]
                reservations.append(email_id)
    
    return reservations


def parse_reservation_email(account, email_id):
    """Parse a reservation email for guest data"""
    stdout, _ = run_himalaya(['-a', account, 'message', 'read', email_id])
    
    guest = {
        'name': None,
        'email': None,
        'phone': None,
        'party_size': None,
        'date': None,
        'source': account.replace('-restaurant', ''),
    }
    
    # Extract email address
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', stdout)
    if email_match:
        guest['email'] = email_match.group(0).lower()
    
    # Extract phone number
    phone_match = re.search(r'[\+]?1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})', stdout)
    if phone_match:
        area = phone_match.group(1)
        guest['phone'] = f"+1{phone_match.group(1)}{phone_match.group(2)}{phone_match.group(3)}"
        guest['area_code'] = area
    
    # Extract name (look for common patterns)
    name_patterns = [
        r'Name:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)',
        r'Guest:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)',
        r'Reservation for\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
    ]
    for pattern in name_patterns:
        match = re.search(pattern, stdout)
        if match:
            guest['name'] = match.group(1)
            break
    
    # Extract party size
    party_match = re.search(r'(?:party of|for)\s*(\d+)', stdout.lower())
    if party_match:
        guest['party_size'] = int(party_match.group(1))
    
    return guest


def enrich_guest(guest):
    """Add scoring and enrichment data"""
    score = 0
    
    # Location scoring
    area = guest.get('area_code')
    if area in TIER1_AREAS:
        score += 30
        guest['tier'] = 1
        guest['region'] = 'US-East' if area in ['212', '917', '646', '617', '305', '786'] else 'US-West' if area in ['310', '323', '415'] else 'Canada'
    elif area in TIER2_AREAS:
        score += 20
        guest['tier'] = 2
        guest['region'] = 'US-West' if area in ['858', '619', '949', '206', '702'] else 'US-East' if area in ['203', '516', '914', '404'] else 'US-Central' if area == '512' else 'Canada'
    elif area == '506':
        guest['tier'] = 4
        guest['region'] = 'LatAm'
    else:
        guest['tier'] = 3
        guest['region'] = 'Other'
    
    # City mapping
    guest['city'] = AREA_TO_CITY.get(area, None)
    
    # Email domain analysis
    if guest.get('email'):
        domain = guest['email'].split('@')[-1]
        guest['email_domain'] = domain
        if domain not in PERSONAL_DOMAINS:
            guest['is_corporate_email'] = True
            score += 15
        else:
            guest['is_corporate_email'] = False
    
    # Party size bonus
    if guest.get('party_size') and guest['party_size'] >= 4:
        score += 10
    
    # Source bonus (La Luna is higher-end)
    if guest.get('source') == 'laluna':
        score += 5
    
    guest['lead_score'] = score
    
    # Segment
    if guest.get('region') == 'LatAm':
        guest['segment'] = 'local'
    elif score >= 40:
        guest['segment'] = 'hot'
    elif score >= 25:
        guest['segment'] = 'warm'
    else:
        guest['segment'] = 'nurture'
    
    return guest


def upsert_to_supabase(guest):
    """Insert or update guest in Supabase"""
    import requests
    
    url = f'{SUPABASE_URL}/rest/v1/crm_guests'
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
    }
    
    data = {
        'name': guest.get('name'),
        'email': guest.get('email'),
        'phone': guest.get('phone'),
        'phone_normalized': guest.get('phone'),
        'source': guest.get('source'),
        'area_code': guest.get('area_code'),
        'country_code': 'US' if guest.get('area_code') != '506' else 'CR',
        'city': guest.get('city'),
        'region': guest.get('region'),
        'tier': guest.get('tier', 3),
        'email_domain': guest.get('email_domain'),
        'is_corporate_email': guest.get('is_corporate_email', False),
        'lead_score': guest.get('lead_score', 0),
        'segment': guest.get('segment', 'nurture'),
        'status': 'new',
        'updated_at': datetime.now().isoformat(),
    }
    
    # Only upsert if we have an email
    if not data['email']:
        return None
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code in [200, 201]:
        return response.json()
    else:
        print(f"Supabase error: {response.text}")
        return None


def alert_ruth(guest):
    """Send alert for hot leads"""
    # For now, just log. Later we can add WhatsApp/email alerts
    print(f"\n🔥 HOT LEAD ALERT!")
    print(f"   Name: {guest.get('name', 'Unknown')}")
    print(f"   Email: {guest.get('email')}")
    print(f"   Phone: {guest.get('phone')}")
    print(f"   City: {guest.get('city')}")
    print(f"   Score: {guest.get('lead_score')}")
    print(f"   Source: {guest.get('source')}")
    
    # Could add: send WhatsApp to Ruth, send email notification, etc.


def process_new_reservations():
    """Main function to process new reservation emails"""
    print(f"=== Meraki CRM Email Sync ===")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
    
    accounts = [
        ('coyol-restaurant', 'coyol'),
        ('laluna-restaurant', 'laluna'),
    ]
    
    new_guests = []
    hot_leads = []
    
    for account, source in accounts:
        print(f"Checking {account}...")
        
        try:
            # Get recent reservation emails
            reservations = get_recent_reservations(account)
            print(f"  Found {len(reservations)} potential reservations")
            
            for email_id in reservations[:10]:  # Process last 10
                guest = parse_reservation_email(account, email_id)
                
                if guest.get('email'):
                    guest = enrich_guest(guest)
                    result = upsert_to_supabase(guest)
                    
                    if result:
                        new_guests.append(guest)
                        
                        if guest.get('segment') == 'hot':
                            hot_leads.append(guest)
                            alert_ruth(guest)
        
        except Exception as e:
            print(f"  Error: {e}")
    
    print(f"\n=== Summary ===")
    print(f"New/updated guests: {len(new_guests)}")
    print(f"Hot leads: {len(hot_leads)}")
    
    return new_guests, hot_leads


def check_supabase_reservations():
    """Check Supabase reservation tables for new bookings"""
    import requests
    
    print("Checking Supabase reservations...")
    
    # Check last 24 hours of Coyol reservations
    yesterday = (datetime.now() - timedelta(days=1)).isoformat()
    
    tables = [
        ('coyol_reservations', 'coyol'),
        ('laluna_reservations', 'laluna'),
    ]
    
    new_guests = []
    
    for table, source in tables:
        url = f'{SUPABASE_URL}/rest/v1/{table}'
        params = {
            'created_at': f'gte.{yesterday}',
            'status': 'eq.confirmed',
            'select': 'name,email,phone,party_size,date,time',
        }
        
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                reservations = response.json()
                print(f"  {table}: {len(reservations)} new reservations")
                
                for res in reservations:
                    guest = {
                        'name': res.get('name'),
                        'email': res.get('email'),
                        'phone': res.get('phone'),
                        'party_size': res.get('party_size'),
                        'source': source,
                    }
                    
                    # Extract area code from phone
                    if guest['phone']:
                        digits = re.sub(r'\D', '', guest['phone'])
                        if len(digits) >= 10:
                            guest['area_code'] = digits[-10:-7] if digits.startswith('1') else digits[:3]
                    
                    if guest.get('email'):
                        guest = enrich_guest(guest)
                        result = upsert_to_supabase(guest)
                        
                        if result:
                            new_guests.append(guest)
                            
                            if guest.get('segment') == 'hot':
                                alert_ruth(guest)
            else:
                print(f"  {table}: Could not fetch ({response.status_code})")
        
        except Exception as e:
            print(f"  {table}: Error - {e}")
    
    return new_guests


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--supabase':
        # Check Supabase reservation tables
        guests = check_supabase_reservations()
    else:
        # Check email inboxes
        guests, hot = process_new_reservations()
    
    print("\nDone!")
