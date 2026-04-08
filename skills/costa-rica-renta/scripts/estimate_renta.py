#!/usr/bin/env python3
"""
Estimate Costa Rica annual income tax (Renta) for Meraki
Usage: python3 estimate_renta.py --sales-path meraki-control/data/sales.json
"""

import json
import argparse
from datetime import datetime

# 2026 Tax brackets (based on gross income)
TAX_BRACKETS = [
    (5_761_000, 0.05),
    (8_643_000, 0.10),
    (11_524_000, 0.15),
    (120_962_000, 0.20),
    (float('inf'), 0.30),
]

def load_json(path):
    with open(path) as f:
        return json.load(f)

def calculate_annual_sales(data, year):
    """Sum monthly sales for fiscal year (Oct prev - Sep current)"""
    total = 0
    
    # Get monthly data key
    monthly_key = f"monthly{year}" if f"monthly{year}" in data else "monthly2025"
    
    for restaurant in ['esh', 'coyol', 'laluna']:
        rest_data = data.get(monthly_key, {}).get(restaurant, {})
        
        for month, values in rest_data.items():
            if month == 'annual':
                continue
            if isinstance(values, dict):
                total += values.get('sales', 0)
            else:
                total += values
    
    return total

def calculate_annual_gastos(data, year):
    """Sum monthly expenses for fiscal year"""
    total = 0
    
    gastos_key = f"gastos{year}" if f"gastos{year}" in data else "gastos2025"
    
    for restaurant in ['esh', 'coyol', 'laluna']:
        rest_data = data.get(gastos_key, {}).get(restaurant, {})
        
        for month, value in rest_data.items():
            if isinstance(value, (int, float)):
                total += value
    
    return total

def get_tax_rate(gross_income):
    """Get tax rate based on gross income bracket"""
    for threshold, rate in TAX_BRACKETS:
        if gross_income <= threshold:
            return rate
    return 0.30

def estimate_renta(gross_sales, gastos, payroll_estimate=None, cogs_percent=0.32):
    """
    Estimate annual renta
    
    Args:
        gross_sales: Total gross sales
        gastos: Operating expenses (from gastos data)
        payroll_estimate: Payroll if known, otherwise estimate
        cogs_percent: Cost of goods sold as % of sales (default 32%)
    """
    # Cost of goods sold
    cogs = gross_sales * cogs_percent
    
    # Payroll estimate (if not provided, estimate 24% of sales for restaurants)
    if payroll_estimate is None:
        payroll_estimate = gross_sales * 0.24
    
    # Add CCSS patronal (26.5% on top of salaries)
    payroll_with_ccss = payroll_estimate * 1.265
    
    # Net taxable income
    net_income = gross_sales - cogs - gastos - payroll_with_ccss
    
    # Tax rate based on gross
    tax_rate = get_tax_rate(gross_sales)
    
    # Renta estimate
    renta = max(0, net_income * tax_rate)
    
    return {
        'gross_sales': gross_sales,
        'cogs': cogs,
        'cogs_percent': cogs_percent,
        'gastos': gastos,
        'payroll': payroll_estimate,
        'payroll_with_ccss': payroll_with_ccss,
        'net_income': net_income,
        'tax_rate': tax_rate,
        'renta_estimate': renta,
        'renta_usd': renta / 505,  # Approximate USD
    }

def format_colones(amount):
    if amount >= 1_000_000_000:
        return f"₡{amount/1_000_000_000:.2f}B"
    elif amount >= 1_000_000:
        return f"₡{amount/1_000_000:.1f}M"
    else:
        return f"₡{amount:,.0f}"

def main():
    parser = argparse.ArgumentParser(description='Estimate Costa Rica Renta')
    parser.add_argument('--sales-path', default='meraki-control/data/sales.json')
    parser.add_argument('--year', type=int, default=2025, help='Fiscal year')
    parser.add_argument('--payroll', type=float, help='Annual payroll (optional)')
    parser.add_argument('--cogs', type=float, default=0.32, help='COGS as decimal (default 0.32)')
    args = parser.parse_args()
    
    # Load data
    data = load_json(args.sales_path)
    
    # Calculate totals
    gross_sales = calculate_annual_sales(data, args.year)
    gastos = calculate_annual_gastos(data, args.year)
    
    # Estimate
    result = estimate_renta(
        gross_sales=gross_sales,
        gastos=gastos,
        payroll_estimate=args.payroll,
        cogs_percent=args.cogs
    )
    
    # Print report
    print(f"\n{'='*50}")
    print(f"  MERAKI RENTA ESTIMATE - FY {args.year}")
    print(f"{'='*50}\n")
    
    print(f"Gross Sales:        {format_colones(result['gross_sales'])}")
    print(f"COGS ({result['cogs_percent']*100:.0f}%):          {format_colones(result['cogs'])}")
    print(f"Operating Expenses: {format_colones(result['gastos'])}")
    print(f"Payroll + CCSS:     {format_colones(result['payroll_with_ccss'])}")
    print(f"{'-'*50}")
    print(f"Net Taxable Income: {format_colones(result['net_income'])}")
    print(f"Tax Rate:           {result['tax_rate']*100:.0f}%")
    print(f"{'-'*50}")
    print(f"RENTA ESTIMATE:     {format_colones(result['renta_estimate'])}")
    print(f"                    (~${result['renta_usd']:,.0f} USD)")
    print(f"\nQuarterly Payment:  {format_colones(result['renta_estimate']/4)}")
    print()

if __name__ == '__main__':
    main()
