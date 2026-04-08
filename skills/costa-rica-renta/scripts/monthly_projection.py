#!/usr/bin/env python3
"""
Project monthly tax liability based on prior year patterns
Usage: python3 monthly_projection.py --sales-path meraki-control/data/sales.json
"""

import json
from datetime import datetime

def load_json(path):
    with open(path) as f:
        return json.load(f)

def get_monthly_sales(data, year, restaurant):
    """Get monthly sales for a restaurant"""
    key = f"monthly{year}"
    rest_data = data.get(key, {}).get(restaurant, {})
    
    monthly = {}
    for month in ['01','02','03','04','05','06','07','08','09','10','11','12']:
        if month in rest_data:
            val = rest_data[month]
            if isinstance(val, dict):
                monthly[month] = val.get('sales', 0)
            else:
                monthly[month] = val
        elif 'annual' in rest_data and isinstance(rest_data['annual'], dict):
            # Estimate from annual if monthly not available
            monthly[month] = rest_data['annual'].get('sales', 0) / 12
    return monthly

def get_monthly_gastos(data, year, restaurant):
    """Get monthly expenses for a restaurant"""
    key = f"gastos{year}"
    rest_data = data.get(key, {}).get(restaurant, {})
    
    monthly = {}
    for month in ['01','02','03','04','05','06','07','08','09','10','11','12']:
        if month in rest_data:
            monthly[month] = rest_data[month]
    return monthly

def calculate_monthly_projection(data, base_year=2025, projection_year=2026, growth_rate=0.05):
    """
    Project monthly tax liability
    
    Uses prior year patterns with optional growth adjustment
    """
    months = ['01','02','03','04','05','06','07','08','09','10','11','12']
    month_names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    
    # Fiscal year runs Oct-Sep, so we need to map correctly
    # FY 2025-2026: Oct 2025 → Sep 2026
    fiscal_months = ['10','11','12','01','02','03','04','05','06','07','08','09']
    fiscal_labels = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep']
    
    results = []
    cumulative_sales = 0
    cumulative_gastos = 0
    cumulative_tax = 0
    
    for i, (month, label) in enumerate(zip(fiscal_months, fiscal_labels)):
        # Determine which calendar year this month falls in
        if month in ['10','11','12']:
            cal_year = base_year
        else:
            cal_year = base_year + 1
        
        # Get base year data for this month
        month_sales = 0
        month_gastos = 0
        
        for rest in ['esh', 'coyol', 'laluna']:
            # Sales
            sales_data = get_monthly_sales(data, base_year, rest)
            month_sales += sales_data.get(month, 0)
            
            # Gastos
            gastos_data = get_monthly_gastos(data, base_year, rest)
            month_gastos += gastos_data.get(month, 0)
        
        # Apply growth rate for projection
        projected_sales = month_sales * (1 + growth_rate)
        projected_gastos = month_gastos * (1 + growth_rate * 0.5)  # Expenses grow slower
        
        # Estimate COGS and payroll
        cogs = projected_sales * 0.32
        payroll = projected_sales * 0.24 * 1.265  # Including CCSS
        
        # Monthly net income
        monthly_net = projected_sales - cogs - projected_gastos - payroll
        
        # Monthly tax (30% of net)
        monthly_tax = max(0, monthly_net * 0.30)
        
        # Cumulative
        cumulative_sales += projected_sales
        cumulative_gastos += projected_gastos
        cumulative_tax += monthly_tax
        
        results.append({
            'month': label,
            'cal_year': cal_year if month in ['10','11','12'] else cal_year,
            'sales': projected_sales,
            'gastos': projected_gastos,
            'net_income': monthly_net,
            'monthly_tax': monthly_tax,
            'cumulative_tax': cumulative_tax,
        })
    
    return results

def format_colones(amount):
    if abs(amount) >= 1_000_000:
        return f"₡{amount/1_000_000:.1f}M"
    elif abs(amount) >= 1000:
        return f"₡{amount/1000:.0f}K"
    return f"₡{amount:,.0f}"

def print_projection(results, fiscal_year):
    print(f"\n{'='*80}")
    print(f"  MERAKI RENTA PROJECTION - FY {fiscal_year}-{fiscal_year+1}")
    print(f"  (Based on FY {fiscal_year-1}-{fiscal_year} + 5% growth)")
    print(f"{'='*80}\n")
    
    print(f"{'Month':<8} {'Sales':>12} {'Gastos':>12} {'Net Income':>12} {'Month Tax':>12} {'YTD Tax':>12}")
    print(f"{'-'*80}")
    
    for r in results:
        print(f"{r['month']:<8} {format_colones(r['sales']):>12} {format_colones(r['gastos']):>12} {format_colones(r['net_income']):>12} {format_colones(r['monthly_tax']):>12} {format_colones(r['cumulative_tax']):>12}")
    
    print(f"{'-'*80}")
    
    total_tax = results[-1]['cumulative_tax']
    print(f"\n{'ANNUAL RENTA ESTIMATE:':<30} {format_colones(total_tax):>12}")
    print(f"{'In USD (~₡505):':<30} {'${:,.0f}'.format(total_tax/505):>12}")
    print(f"\n{'Quarterly payments:':<30}")
    print(f"  Q1 (Oct-Dec):                {format_colones(sum(r['monthly_tax'] for r in results[0:3])):>12}")
    print(f"  Q2 (Jan-Mar):                {format_colones(sum(r['monthly_tax'] for r in results[3:6])):>12}")
    print(f"  Q3 (Apr-Jun):                {format_colones(sum(r['monthly_tax'] for r in results[6:9])):>12}")
    print(f"  Q4 (Jul-Sep):                {format_colones(sum(r['monthly_tax'] for r in results[9:12])):>12}")
    print()

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Project monthly tax liability')
    parser.add_argument('--sales-path', default='meraki-control/data/sales.json')
    parser.add_argument('--base-year', type=int, default=2025)
    parser.add_argument('--growth', type=float, default=0.05, help='YoY growth rate (default 5%)')
    args = parser.parse_args()
    
    data = load_json(args.sales_path)
    results = calculate_monthly_projection(data, args.base_year, growth_rate=args.growth)
    print_projection(results, args.base_year)

if __name__ == '__main__':
    main()
