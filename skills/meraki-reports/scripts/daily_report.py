#!/usr/bin/env python3
"""
Generate Meraki Daily Sales Report as PNG
Usage: python3 daily_report.py --date 2026-04-07 --output report.png
"""

import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# Land Rover Heritage Colors
COLORS = {
    'esh': '#C4A67C',      # Sand
    'coyol': '#3D4F3D',    # Keswick Green
    'laluna': '#A65D3F',   # Terracotta
    'background': '#F5F3EF', # Alaska White
    'text': '#1A1F16',     # Santorini
}

RESTAURANT_NAMES = {
    'esh': 'Esh',
    'coyol': 'Coyol', 
    'laluna': 'La Luna'
}

def load_sales_data(data_path):
    """Load sales.json"""
    with open(data_path) as f:
        return json.load(f)

def get_daily_sales(data, target_date):
    """Extract sales for a specific date"""
    results = {}
    for entry in data.get('daily', []):
        if entry.get('date') == target_date:
            rest = entry.get('restaurant')
            results[rest] = {
                'total': entry.get('total', 0),
                'cash': entry.get('cash', 0),
                'card': entry.get('card', 0),
                'food': entry.get('food', 0),
                'bar': entry.get('bar', 0),
            }
    return results

def format_colones(amount):
    """Format as Costa Rican colones"""
    if amount >= 1_000_000:
        return f"₡{amount/1_000_000:.1f}M"
    elif amount >= 1000:
        return f"₡{amount/1000:.0f}K"
    return f"₡{amount:,.0f}"

def generate_html(date_str, sales_data):
    """Generate HTML report"""
    total_all = sum(s.get('total', 0) for s in sales_data.values())
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: {COLORS['background']};
            color: {COLORS['text']};
            padding: 40px;
            width: 800px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            font-size: 28px;
            font-weight: 300;
            letter-spacing: 2px;
        }}
        .header .date {{
            font-size: 18px;
            color: #666;
            margin-top: 8px;
        }}
        .total-banner {{
            background: {COLORS['coyol']};
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }}
        .total-banner .amount {{
            font-size: 42px;
            font-weight: 600;
        }}
        .total-banner .label {{
            font-size: 14px;
            opacity: 0.8;
        }}
        .restaurants {{
            display: flex;
            gap: 20px;
        }}
        .restaurant {{
            flex: 1;
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }}
        .restaurant .name {{
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding-bottom: 12px;
            margin-bottom: 12px;
            border-bottom: 3px solid;
        }}
        .restaurant .amount {{
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 15px;
        }}
        .restaurant .breakdown {{
            font-size: 13px;
            color: #666;
        }}
        .restaurant .breakdown div {{
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
        }}
        .esh .name {{ border-color: {COLORS['esh']}; color: {COLORS['esh']}; }}
        .coyol .name {{ border-color: {COLORS['coyol']}; color: {COLORS['coyol']}; }}
        .laluna .name {{ border-color: {COLORS['laluna']}; color: {COLORS['laluna']}; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>MERAKI DAILY REPORT</h1>
        <div class="date">{date_str}</div>
    </div>
    
    <div class="total-banner">
        <div class="label">TOTAL SALES</div>
        <div class="amount">{format_colones(total_all)}</div>
    </div>
    
    <div class="restaurants">
"""
    
    for rest_id in ['laluna', 'coyol', 'esh']:
        data = sales_data.get(rest_id, {})
        total = data.get('total', 0)
        cash = data.get('cash', 0)
        card = data.get('card', 0)
        
        html += f"""
        <div class="restaurant {rest_id}">
            <div class="name">{RESTAURANT_NAMES[rest_id]}</div>
            <div class="amount">{format_colones(total)}</div>
            <div class="breakdown">
                <div><span>Cash</span><span>{format_colones(cash)}</span></div>
                <div><span>Card</span><span>{format_colones(card)}</span></div>
            </div>
        </div>
"""
    
    html += """
    </div>
</body>
</html>
"""
    return html

def render_to_png(html, output_path):
    """Render HTML to PNG using Playwright"""
    from playwright.sync_api import sync_playwright
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 800, 'height': 600})
        page.set_content(html)
        page.screenshot(path=output_path, full_page=True)
        browser.close()
    
    print(f"Report saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Generate Meraki Daily Report')
    parser.add_argument('--date', required=True, help='Date in YYYY-MM-DD format')
    parser.add_argument('--output', default='daily-report.png', help='Output PNG path')
    parser.add_argument('--data', default='meraki-control/data/sales.json', help='Path to sales.json')
    args = parser.parse_args()
    
    # Load data
    data = load_sales_data(args.data)
    
    # Get sales for date
    sales = get_daily_sales(data, args.date)
    
    if not sales:
        print(f"No sales data found for {args.date}")
        return
    
    # Generate HTML
    html = generate_html(args.date, sales)
    
    # Render to PNG
    render_to_png(html, args.output)

if __name__ == '__main__':
    main()
