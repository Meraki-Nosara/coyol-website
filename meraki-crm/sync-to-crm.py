#!/usr/bin/env python3
"""
Sync reservations from Coyol & La Luna to CRM
Run every 15-30 minutes via heartbeat
"""

import json
import requests
from datetime import datetime

SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co'
SUPABASE_KEY = 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng'

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
}

# Area code scoring for lead quality
TIER1_AREAS = {'212', '917', '646', '310', '323', '415', '305', '786', '416', '647', '604', '617', '312'}
TIER2_AREAS = {'858', '619', '949', '303', '970', '512', '206', '404', '514', '702', '203', '516', '914'}

AREA_TO_CITY = {
    '212': 'New York', '917': 'New York', '646': 'New York',
    '310': 'Los Angeles', '323': 'Los Angeles', '415': 'San Francisco',
    '305': 'Miami', '786': 'Miami', '416': 'Toronto', '647': 'Toronto',
    '604': 'Vancouver', '617': 'Boston', '312': 'Chicago',
    '858': 'San Diego', '949': 'Orange County', '303': 'Denver',
    '512': 'Austin', '206': 'Seattle', '404': 'Atlanta', '514': 'Montreal',
}

AREA_TO_REGION = {
    '212': 'US-East', '917': 'US-East', '646': 'US-East', '617': 'US-East',
    '310': 'US-West', '323': 'US-West', '415': 'US-West', '858': 'US-West',
    '619': 'US-West', '949': 'US-West', '206': 'US-West',
    '305': 'US-South', '786': 'US-South', '404': 'US-South', '512': 'US-South',
    '416': 'Canada', '647': 'Canada', '604': 'Canada', '514': 'Canada',
    '312': 'US-Central', '303': 'US-West',
}


def extract_area_code(phone):
    if not phone:
        return None
    digits = ''.join(filter(str.isdigit, str(phone)))
    if len(digits) >= 10:
        if digits.startswith('1') and len(digits) == 11:
            digits = digits[1:]
        return digits[:3] if len(digits) >= 3 else None
    return None


def normalize_phone(phone):
    if not phone:
        return None
    digits = ''.join(filter(str.isdigit, str(phone)))
    if len(digits) >= 10:
        if not digits.startswith('1') and len(digits) == 10:
            digits = '1' + digits
        return f'+{digits}'
    return None


def score_guest(email, phone, source):
    """Score guest based on area code and email domain."""
    score = 10
    city = None
    region = None
    tier = 4
    
    area_code = extract_area_code(phone)
    
    if area_code:
        if area_code in TIER1_AREAS:
            score += 35
            tier = 1
            city = AREA_TO_CITY.get(area_code)
            region = AREA_TO_REGION.get(area_code)
        elif area_code in TIER2_AREAS:
            score += 20
            tier = 2
            city = AREA_TO_CITY.get(area_code)
            region = AREA_TO_REGION.get(area_code)
    
    # Bonus for corporate email
    if email and '@' in email:
        domain = email.split('@')[-1].lower()
        free_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com']
        if domain not in free_domains and '.' in domain:
            score += 5
    
    return {
        'lead_score': min(score, 60),
        'tier': tier,
        'city': city,
        'region': region,
        'area_code': area_code,
        'segment': 'hot' if score >= 45 else 'warm' if score >= 30 else 'nurture'
    }


def get_existing_crm_emails():
    """Get all emails already in CRM to avoid duplicates."""
    try:
        res = requests.get(
            f'{SUPABASE_URL}/rest/v1/crm_guests?select=email',
            headers=HEADERS
        )
        if res.ok:
            return set(g['email'].lower() for g in res.json() if g.get('email'))
    except:
        pass
    return set()


def fetch_reservations(table, source):
    """Fetch confirmed reservations from a table."""
    try:
        res = requests.get(
            f'{SUPABASE_URL}/rest/v1/{table}?status=eq.confirmed&select=*',
            headers=HEADERS
        )
        if res.ok:
            return [(r, source) for r in res.json()]
    except Exception as e:
        print(f'Error fetching {table}: {e}')
    return []


def add_to_crm(guest_data):
    """Add a new guest to CRM."""
    try:
        res = requests.post(
            f'{SUPABASE_URL}/rest/v1/crm_guests',
            headers={**HEADERS, 'Prefer': 'return=representation'},
            json=guest_data
        )
        return res.ok
    except:
        return False


def sync_reservations():
    """Main sync: Pull reservations, score, add new ones to CRM."""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting CRM sync...")
    
    existing_emails = get_existing_crm_emails()
    print(f"  Existing CRM guests: {len(existing_emails)}")
    
    # Fetch from both restaurants
    reservations = []
    reservations.extend(fetch_reservations('coyol_reservations', 'coyol'))
    reservations.extend(fetch_reservations('laluna_reservations', 'laluna'))
    
    print(f"  Total reservations: {len(reservations)}")
    
    new_count = 0
    hot_leads = []
    
    for res, source in reservations:
        email = res.get('guest_email', '').strip().lower()
        
        # Skip if no email or already in CRM
        if not email or email in existing_emails:
            continue
        
        name = res.get('guest_name', '').strip()
        phone = res.get('guest_phone', '')
        
        # Score the guest
        scoring = score_guest(email, phone, source)
        
        # Build CRM record
        crm_record = {
            'name': name,
            'email': email,
            'phone': phone,
            'phone_normalized': normalize_phone(phone),
            'source': source,
            'source_type': 'reservation',
            'area_code': scoring['area_code'],
            'city': scoring['city'],
            'region': scoring['region'],
            'tier': scoring['tier'],
            'lead_score': scoring['lead_score'],
            'segment': scoring['segment'],
            'status': 'new',
        }
        
        if add_to_crm(crm_record):
            new_count += 1
            existing_emails.add(email)
            
            if scoring['lead_score'] >= 40:
                hot_leads.append({
                    'name': name,
                    'email': email,
                    'city': scoring['city'],
                    'score': scoring['lead_score'],
                    'source': source
                })
    
    print(f"  New guests added: {new_count}")
    print(f"  Hot leads (40+): {len(hot_leads)}")
    
    return hot_leads


if __name__ == '__main__':
    hot_leads = sync_reservations()
    
    if hot_leads:
        print("\n🔥 HOT LEADS DETECTED:")
        for lead in hot_leads:
            print(f"  - {lead['name']} ({lead['city'] or 'Unknown'}) - Score: {lead['score']} - {lead['source']}")
