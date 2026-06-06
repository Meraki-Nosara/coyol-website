#!/usr/bin/env python3
"""
Live Reservation Monitor for CRM
Checks Supabase reservation tables and adds new guests to CRM
"""

import json
import requests
import os
from datetime import datetime, timedelta

# Config
SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co'
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng')

HEADERS = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json',
}

# Area code scoring
TIER1_AREAS = {'212', '917', '646', '310', '323', '415', '305', '786', '416', '647', '604', '617', '312'}
TIER2_AREAS = {'858', '619', '949', '303', '970', '512', '206', '404', '514', '702', '203', '516', '914'}

AREA_TO_CITY = {
    '212': 'New York', '917': 'New York', '646': 'New York',
    '310': 'Los Angeles', '323': 'Los Angeles',
    '415': 'San Francisco', '305': 'Miami', '786': 'Miami',
    '416': 'Toronto', '647': 'Toronto', '604': 'Vancouver',
    '617': 'Boston', '312': 'Chicago', '858': 'San Diego',
    '949': 'Orange County', '303': 'Denver', '512': 'Austin',
    '206': 'Seattle', '404': 'Atlanta', '514': 'Montreal',
}

def extract_area_code(phone):
    """Extract area code from phone number."""
    if not phone:
        return None
    digits = ''.join(filter(str.isdigit, phone))
    if len(digits) >= 10:
        if digits.startswith('1'):
            digits = digits[1:]
        return digits[:3]
    return None

def score_guest(email, phone, source):
    """Calculate lead score based on area code and email."""
    score = 10  # Base score
    city = None
    tier = 3
    
    area_code = extract_area_code(phone)
    
    if area_code:
        if area_code in TIER1_AREAS:
            score += 30
            tier = 1
            city = AREA_TO_CITY.get(area_code)
        elif area_code in TIER2_AREAS:
            score += 20
            tier = 2
            city = AREA_TO_CITY.get(area_code)
    
    # Corporate email bonus
    if email:
        domain = email.split('@')[-1].lower() if '@' in email else ''
        if domain and domain not in ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'me.com', 'live.com']:
            score += 15
    
    # Source bonus
    if source and 'luna' in source.lower():
        score += 5  # La Luna = higher end
    
    # Determine segment
    if score >= 40:
        segment = 'hot'
    elif score >= 25:
        segment = 'warm'
    else:
        segment = 'nurture'
    
    return score, segment, city, tier

def get_new_reservations(table, source_name, hours=24):
    """Fetch recent reservations from Supabase."""
    since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
    
    try:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/{table}?created_at=gte.{since}&status=eq.confirmed&select=*',
            headers=HEADERS
        )
        
        if response.status_code == 200:
            return [(r, source_name) for r in response.json()]
        else:
            print(f"Error fetching {table}: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error: {e}")
        return []

def guest_exists(email):
    """Check if guest already exists in CRM."""
    try:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/crm_guests?email=eq.{email}&select=id',
            headers=HEADERS
        )
        return response.status_code == 200 and len(response.json()) > 0
    except:
        return False

def add_guest_to_crm(reservation, source):
    """Add new guest to CRM with scoring."""
    # Handle both column naming conventions
    email_raw = reservation.get('guest_email') or reservation.get('email') or ''
    email = email_raw.lower().strip() if email_raw else ''
    if not email:
        return None
    
    # Check if already exists
    if guest_exists(email):
        return 'exists'
    
    name = reservation.get('guest_name', reservation.get('name', ''))
    phone = reservation.get('guest_phone', reservation.get('phone', ''))
    
    score, segment, city, tier = score_guest(email, phone, source)
    
    guest = {
        'name': name,
        'email': email,
        'phone': phone,
        'source': source,
        'source_type': 'reservation',
        'city': city,
        'tier': tier,
        'lead_score': score,
        'segment': segment,
        'status': 'new',
    }
    
    try:
        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/crm_guests',
            headers={**HEADERS, 'Prefer': 'return=representation'},
            json=guest
        )
        
        if response.status_code in [200, 201]:
            return {'guest': guest, 'segment': segment, 'score': score}
        else:
            print(f"Error adding guest: {response.status_code} - {response.text[:100]}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print(f"🔍 Checking new reservations... ({datetime.now().strftime('%Y-%m-%d %H:%M')})")
    
    new_guests = []
    hot_leads = []
    
    # Check Coyol reservations
    coyol_reservations = get_new_reservations('coyol_reservations', 'Coyol')
    print(f"  Coyol: {len(coyol_reservations)} recent reservations")
    
    # Check La Luna reservations
    laluna_reservations = get_new_reservations('laluna_reservations', 'La Luna')
    print(f"  La Luna: {len(laluna_reservations)} recent reservations")
    
    # Process all reservations
    all_reservations = coyol_reservations + laluna_reservations
    
    for reservation, source in all_reservations:
        result = add_guest_to_crm(reservation, source)
        
        if result and result != 'exists':
            new_guests.append(result)
            if result['segment'] == 'hot':
                hot_leads.append(result)
    
    # Summary
    print(f"\n✅ Results:")
    print(f"  New guests added: {len(new_guests)}")
    print(f"  Hot leads: {len(hot_leads)}")
    
    if hot_leads:
        print(f"\n🔥 HOT LEADS:")
        for lead in hot_leads:
            g = lead['guest']
            print(f"  • {g['name']} ({g['email']}) - {g['city'] or 'Unknown'} - Score: {lead['score']}")
    
    # Return hot leads for alerting
    return hot_leads

if __name__ == '__main__':
    hot = main()
    
    # Output for shell processing
    if hot:
        print(f"\n---HOT_LEADS_JSON---")
        print(json.dumps(hot))
