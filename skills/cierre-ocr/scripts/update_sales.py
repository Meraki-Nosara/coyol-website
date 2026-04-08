#!/usr/bin/env python3
"""
Update sales.json with new daily cierre data
Usage: python3 update_sales.py --date 2026-04-07 --restaurant coyol --total 4345113 --cash 396500 --card 3948613
"""

import json
import argparse
from datetime import datetime
from pathlib import Path

DEFAULT_SALES_PATH = "meraki-control/data/sales.json"

def load_sales(path):
    """Load existing sales.json"""
    with open(path) as f:
        return json.load(f)

def save_sales(data, path):
    """Save sales.json"""
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def add_daily_entry(data, entry):
    """Add or update a daily entry"""
    if 'daily' not in data:
        data['daily'] = []
    
    # Check if entry exists for this date/restaurant
    existing_idx = None
    for i, e in enumerate(data['daily']):
        if e.get('date') == entry['date'] and e.get('restaurant') == entry['restaurant']:
            existing_idx = i
            break
    
    if existing_idx is not None:
        # Update existing
        data['daily'][existing_idx].update(entry)
        print(f"Updated existing entry for {entry['restaurant']} on {entry['date']}")
    else:
        # Add new
        data['daily'].insert(0, entry)  # Add at beginning
        print(f"Added new entry for {entry['restaurant']} on {entry['date']}")
    
    # Update timestamp
    data['lastUpdated'] = datetime.now().isoformat()
    
    return data

def main():
    parser = argparse.ArgumentParser(description='Update sales.json with cierre data')
    parser.add_argument('--date', required=True, help='Date YYYY-MM-DD')
    parser.add_argument('--restaurant', required=True, choices=['esh', 'coyol', 'laluna'])
    parser.add_argument('--total', type=float, required=True, help='Total sales')
    parser.add_argument('--cash', type=float, default=0, help='Cash amount')
    parser.add_argument('--card', type=float, default=0, help='Card amount')
    parser.add_argument('--food', type=float, help='Food sales')
    parser.add_argument('--bar', type=float, help='Bar sales')
    parser.add_argument('--net-sales', type=float, help='Net sales before tax')
    parser.add_argument('--service10', type=float, help='10% service tax')
    parser.add_argument('--iva13', type=float, help='13% IVA')
    parser.add_argument('--source', default='manual', help='Data source')
    parser.add_argument('--sales-path', default=DEFAULT_SALES_PATH, help='Path to sales.json')
    
    args = parser.parse_args()
    
    # Build entry
    entry = {
        'date': args.date,
        'restaurant': args.restaurant,
        'total': int(args.total),
        'cash': int(args.cash),
        'card': int(args.card),
        'source': args.source
    }
    
    if args.food:
        entry['food'] = int(args.food)
    if args.bar:
        entry['bar'] = int(args.bar)
    if args.net_sales:
        entry['netSales'] = int(args.net_sales)
    if args.service10:
        entry['service10'] = int(args.service10)
    if args.iva13:
        entry['iva13'] = int(args.iva13)
    
    # Load, update, save
    data = load_sales(args.sales_path)
    data = add_daily_entry(data, entry)
    save_sales(data, args.sales_path)
    
    print(f"Saved to {args.sales_path}")

if __name__ == '__main__':
    main()
