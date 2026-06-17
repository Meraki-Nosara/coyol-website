import csv
import json
import requests

SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co'
SUPABASE_KEY = 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng'

# City to score mapping
CITY_SCORES = {
    'New York': 50, 'NYC': 50,
    'Los Angeles': 45, 'LA': 45,
    'San Francisco': 45, 'SF': 45,
    'Miami': 45,
    'Toronto': 40
}

leads = []
with open('/Users/Coyol/.openclaw/workspace/meraki-crm/exports/meta-custom-audience.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        city = row.get('ct', '')
        score = CITY_SCORES.get(city, 40)  # Default 40 for other cities
        
        lead = {
            'email': row.get('email', '').lower().strip(),
            'name': f"{row.get('fn', '')} {row.get('ln', '')}".strip(),
            'phone': row.get('phone', ''),
            'city': city,
            'region': row.get('st', ''),
            'country_code': row.get('country', 'US'),
            'lead_score': score,
            'source': 'eatapp_historical',
            'segment': 'hot',
            'status': 'new'
        }
        if lead['email']:
            leads.append(lead)

print(f"Importing {len(leads)} leads...")

# Batch insert
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
}

# Insert in batches of 100
batch_size = 100
for i in range(0, len(leads), batch_size):
    batch = leads[i:i+batch_size]
    resp = requests.post(
        f'{SUPABASE_URL}/rest/v1/crm_guests',
        headers=headers,
        json=batch
    )
    if resp.status_code in [200, 201]:
        print(f"Batch {i//batch_size + 1}: OK ({len(batch)} leads)")
    else:
        print(f"Batch {i//batch_size + 1}: Error - {resp.status_code} {resp.text[:200]}")

print("Done!")
