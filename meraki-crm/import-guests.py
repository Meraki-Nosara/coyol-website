#!/usr/bin/env python3
"""
Import 34K+ restaurant guests into Meraki CRM
Enriches with area codes, cities, regions, and initial scoring
"""

import pandas as pd
import re
import json
from datetime import datetime

# Area code mapping
AREA_CODES = {
    # Tier 1: High net worth
    '212': {'city': 'New York', 'state': 'NY', 'country': 'US', 'region': 'US-East', 'tier': 1},
    '917': {'city': 'New York', 'state': 'NY', 'country': 'US', 'region': 'US-East', 'tier': 1},
    '646': {'city': 'New York', 'state': 'NY', 'country': 'US', 'region': 'US-East', 'tier': 1},
    '310': {'city': 'Los Angeles', 'state': 'CA', 'country': 'US', 'region': 'US-West', 'tier': 1},
    '323': {'city': 'Los Angeles', 'state': 'CA', 'country': 'US', 'region': 'US-West', 'tier': 1},
    '415': {'city': 'San Francisco', 'state': 'CA', 'country': 'US', 'region': 'US-West', 'tier': 1},
    '305': {'city': 'Miami', 'state': 'FL', 'country': 'US', 'region': 'US-East', 'tier': 1},
    '786': {'city': 'Miami', 'state': 'FL', 'country': 'US', 'region': 'US-East', 'tier': 1},
    '416': {'city': 'Toronto', 'state': 'ON', 'country': 'CA', 'region': 'Canada', 'tier': 1},
    '604': {'city': 'Vancouver', 'state': 'BC', 'country': 'CA', 'region': 'Canada', 'tier': 1},
    '617': {'city': 'Boston', 'state': 'MA', 'country': 'US', 'region': 'US-East', 'tier': 1},
    '312': {'city': 'Chicago', 'state': 'IL', 'country': 'US', 'region': 'US-Central', 'tier': 1},
    
    # Tier 2: Strong markets
    '858': {'city': 'San Diego', 'state': 'CA', 'country': 'US', 'region': 'US-West', 'tier': 2},
    '949': {'city': 'Orange County', 'state': 'CA', 'country': 'US', 'region': 'US-West', 'tier': 2},
    '303': {'city': 'Denver', 'state': 'CO', 'country': 'US', 'region': 'US-West', 'tier': 2},
    '512': {'city': 'Austin', 'state': 'TX', 'country': 'US', 'region': 'US-Central', 'tier': 2},
    '206': {'city': 'Seattle', 'state': 'WA', 'country': 'US', 'region': 'US-West', 'tier': 2},
    '404': {'city': 'Atlanta', 'state': 'GA', 'country': 'US', 'region': 'US-East', 'tier': 2},
    '647': {'city': 'Toronto GTA', 'state': 'ON', 'country': 'CA', 'region': 'Canada', 'tier': 2},
    '514': {'city': 'Montreal', 'state': 'QC', 'country': 'CA', 'region': 'Canada', 'tier': 2},
    '702': {'city': 'Las Vegas', 'state': 'NV', 'country': 'US', 'region': 'US-West', 'tier': 2},
    '619': {'city': 'San Diego', 'state': 'CA', 'country': 'US', 'region': 'US-West', 'tier': 2},
    '970': {'city': 'Colorado Mountain', 'state': 'CO', 'country': 'US', 'region': 'US-West', 'tier': 2},
    '203': {'city': 'Connecticut', 'state': 'CT', 'country': 'US', 'region': 'US-East', 'tier': 2},
    '516': {'city': 'Long Island', 'state': 'NY', 'country': 'US', 'region': 'US-East', 'tier': 2},
    '631': {'city': 'Long Island', 'state': 'NY', 'country': 'US', 'region': 'US-East', 'tier': 2},
    '914': {'city': 'Westchester', 'state': 'NY', 'country': 'US', 'region': 'US-East', 'tier': 2},
    '201': {'city': 'New Jersey', 'state': 'NJ', 'country': 'US', 'region': 'US-East', 'tier': 2},
    
    # Tier 3: Other markets
    '713': {'city': 'Houston', 'state': 'TX', 'country': 'US', 'region': 'US-Central', 'tier': 3},
    '214': {'city': 'Dallas', 'state': 'TX', 'country': 'US', 'region': 'US-Central', 'tier': 3},
    '602': {'city': 'Phoenix', 'state': 'AZ', 'country': 'US', 'region': 'US-West', 'tier': 3},
    '503': {'city': 'Portland', 'state': 'OR', 'country': 'US', 'region': 'US-West', 'tier': 3},
    '403': {'city': 'Calgary', 'state': 'AB', 'country': 'CA', 'region': 'Canada', 'tier': 3},
    '613': {'city': 'Ottawa', 'state': 'ON', 'country': 'CA', 'region': 'Canada', 'tier': 3},
    
    # Local
    '506': {'city': 'Costa Rica', 'state': None, 'country': 'CR', 'region': 'LatAm', 'tier': 4},
}

# Corporate email domains
CORPORATE_DOMAINS = {
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'live.com', 'msn.com', 'me.com', 'mail.com', 'protonmail.com'
}


def normalize_phone(phone):
    """Normalize phone number to +1XXXXXXXXXX format"""
    if pd.isna(phone):
        return None, None
    
    phone = str(phone).strip()
    digits = re.sub(r'\D', '', phone)
    
    # Handle Costa Rica numbers (506)
    if digits.startswith('506') and len(digits) == 11:
        return f'+{digits}', '506'
    
    # Handle US/Canada numbers
    if len(digits) == 10:
        return f'+1{digits}', digits[:3]
    elif len(digits) == 11 and digits[0] == '1':
        return f'+{digits}', digits[1:4]
    elif len(digits) > 11:
        # Try to extract area code
        if digits.startswith('1'):
            return f'+{digits}', digits[1:4]
        return f'+{digits}', digits[:3]
    
    return None, None


def extract_email_domain(email):
    """Extract domain from email"""
    if pd.isna(email) or '@' not in str(email):
        return None, False
    
    domain = str(email).split('@')[-1].lower().strip()
    is_corporate = domain not in CORPORATE_DOMAINS
    return domain, is_corporate


def calculate_initial_score(row):
    """Calculate initial lead score based on available data"""
    score = 0
    
    # Location score (0-30)
    tier = row.get('tier', 4)
    if tier == 1:
        score += 30
    elif tier == 2:
        score += 20
    elif tier == 3:
        score += 10
    # tier 4 (local) = 0
    
    # Corporate email bonus (0-15)
    if row.get('is_corporate_email'):
        score += 15
    
    # Source bonus (0-10)
    # La Luna tends to be higher-end
    if row.get('source') == 'laluna':
        score += 5
    
    return score


def determine_segment(score, region, is_corporate):
    """Determine lead segment based on score and attributes"""
    if region == 'LatAm':
        return 'local'
    elif score >= 40:
        return 'hot'
    elif score >= 25:
        return 'warm'
    else:
        return 'nurture'


def process_guests(file_path):
    """Process guest list and prepare for import"""
    
    print(f"Loading {file_path}...")
    df = pd.read_excel(file_path, sheet_name="MASTER")
    print(f"Loaded {len(df):,} guests")
    
    processed = []
    
    for idx, row in df.iterrows():
        # Normalize phone
        phone_norm, area_code = normalize_phone(row.get('Teléfono'))
        
        # Get location info
        location = AREA_CODES.get(area_code, {})
        
        # Extract email domain
        email_domain, is_corporate = extract_email_domain(row.get('Correo'))
        
        # Build record
        guest = {
            'name': row.get('Nombre'),
            'email': str(row.get('Correo')).lower().strip() if pd.notna(row.get('Correo')) else None,
            'phone': row.get('Teléfono'),
            'phone_normalized': phone_norm,
            'source': row.get('Fuente', '').lower().replace(' ', ''),
            'source_type': row.get('Tipo de correo', 'personal').lower() if pd.notna(row.get('Tipo de correo')) else 'personal',
            'area_code': area_code,
            'country_code': location.get('country'),
            'city': location.get('city'),
            'region': location.get('region'),
            'tier': location.get('tier', 4),
            'email_domain': email_domain,
            'is_corporate_email': is_corporate,
        }
        
        # Calculate score
        guest['lead_score'] = calculate_initial_score(guest)
        guest['segment'] = determine_segment(guest['lead_score'], guest.get('region'), is_corporate)
        
        processed.append(guest)
    
    return processed


def generate_summary(guests):
    """Generate summary statistics"""
    df = pd.DataFrame(guests)
    
    summary = {
        'total_guests': len(df),
        'with_email': df['email'].notna().sum(),
        'with_phone': df['phone_normalized'].notna().sum(),
        'by_segment': df['segment'].value_counts().to_dict(),
        'by_region': df['region'].value_counts().to_dict(),
        'by_source': df['source'].value_counts().to_dict(),
        'corporate_emails': df['is_corporate_email'].sum(),
        'score_distribution': {
            'hot_50+': len(df[df['lead_score'] >= 50]),
            'warm_25-49': len(df[(df['lead_score'] >= 25) & (df['lead_score'] < 50)]),
            'nurture_0-24': len(df[df['lead_score'] < 25]),
        },
        'top_cities': df['city'].value_counts().head(15).to_dict(),
    }
    
    return summary


def main():
    file_path = "/Users/Coyol/Downloads/GUEST LIST RESTAURANTES FILTRADOS 2.xlsx"
    output_dir = "/Users/Coyol/.openclaw/workspace/meraki-crm/data"
    
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    # Process guests
    guests = process_guests(file_path)
    
    # Generate summary
    summary = generate_summary(guests)
    
    # Save processed data
    output_file = f"{output_dir}/guests-enriched.json"
    with open(output_file, 'w') as f:
        json.dump({
            'processed_at': datetime.now().isoformat(),
            'summary': summary,
            'guests': guests
        }, f, indent=2, default=str)
    
    print(f"\n=== PROCESSING COMPLETE ===")
    print(f"Total guests: {summary['total_guests']:,}")
    print(f"With email: {summary['with_email']:,}")
    print(f"With phone: {summary['with_phone']:,}")
    print(f"\nBy Segment:")
    for seg, count in summary['by_segment'].items():
        print(f"  {seg}: {count:,}")
    print(f"\nBy Region:")
    for region, count in summary['by_region'].items():
        print(f"  {region}: {count:,}")
    print(f"\nScore Distribution:")
    for score_range, count in summary['score_distribution'].items():
        print(f"  {score_range}: {count:,}")
    print(f"\nTop 10 Cities:")
    for city, count in list(summary['top_cities'].items())[:10]:
        print(f"  {city}: {count:,}")
    
    print(f"\nSaved to: {output_file}")
    
    # Also save hot leads separately for quick access
    hot_leads = [g for g in guests if g['segment'] in ['hot', 'warm'] and g['region'] != 'LatAm']
    hot_leads.sort(key=lambda x: x['lead_score'], reverse=True)
    
    hot_file = f"{output_dir}/hot-leads.json"
    with open(hot_file, 'w') as f:
        json.dump({
            'exported_at': datetime.now().isoformat(),
            'count': len(hot_leads),
            'leads': hot_leads[:500]  # Top 500
        }, f, indent=2, default=str)
    
    print(f"Hot leads saved to: {hot_file}")
    print(f"Top 500 leads ready for Ruth!")


if __name__ == "__main__":
    main()
