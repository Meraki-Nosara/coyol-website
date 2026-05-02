#!/usr/bin/env python3
"""
Parse Meraki payroll files (planillas) from Excel.
Extracts employee hours, wages by restaurant.
"""

import json
import os
import re
from pathlib import Path
from datetime import datetime
import pandas as pd
from collections import defaultdict

def detect_restaurant(text):
    """Detect restaurant from text."""
    text = str(text).upper()
    if 'LA LUNA' in text or 'LALUNA' in text:
        return 'laluna'
    elif 'COYOL' in text:
        return 'coyol'
    elif 'ESH' in text:
        return 'esh'
    return None

def parse_planilla_file(filepath):
    """Parse a single planilla Excel file."""
    try:
        df = pd.read_excel(filepath, header=None)
        filename = os.path.basename(filepath)
        
        # Detect restaurant from first cell or filename
        current_restaurant = None
        for i in range(min(5, len(df))):
            for j in range(min(5, len(df.columns))):
                val = df.iloc[i, j]
                if pd.notna(val):
                    r = detect_restaurant(val)
                    if r:
                        current_restaurant = r
                        break
            if current_restaurant:
                break
        
        # Also check filename
        if not current_restaurant:
            current_restaurant = detect_restaurant(filename)
        
        # Find columns by header names
        # Row 1 usually has the column descriptions
        header_row = None
        for i in range(min(10, len(df))):
            row_vals = [str(x).upper() for x in df.iloc[i].values if pd.notna(x)]
            row_str = ' '.join(row_vals)
            if 'SALARIO' in row_str or 'HORAS' in row_str:
                header_row = i
                break
        
        if header_row is None:
            return None
        
        # Map column indices
        cols = df.iloc[header_row]
        col_map = {}
        for idx, val in enumerate(cols):
            val_str = str(val).upper() if pd.notna(val) else ''
            if 'MONTO A PAGAR' in val_str or 'NETO' in val_str:
                col_map['net_pay'] = idx
            elif 'SALARIO BRUTO' in val_str or 'BRUTO' in val_str:
                col_map['gross'] = idx
            elif 'HORAS REGULARES' in val_str:
                col_map['regular_hours'] = idx
            elif 'HORAS EXTRAS' in val_str:
                col_map['extra_hours'] = idx
        
        # Name is usually first column
        name_col = 0
        
        records = []
        total_paid = 0
        total_gross = 0
        total_hours = 0
        employees = set()
        
        # Parse data rows (after header)
        for i in range(header_row + 1, len(df)):
            row = df.iloc[i]
            name = row.iloc[name_col]
            
            if pd.isna(name):
                continue
            
            name = str(name).strip()
            
            # Skip headers, totals, empty
            if not name or len(name) < 3:
                continue
            if any(x in name.upper() for x in ['TOTAL', 'SUBTOTAL', 'NOMINA', 'GRAN', 'SUMA']):
                continue
            
            # Check if this is a restaurant header row
            r = detect_restaurant(name)
            if r:
                current_restaurant = r
                continue
            
            # Get values
            record = {
                'name': name,
                'restaurant': current_restaurant or 'unknown',
            }
            
            # Net pay (Monto a pagar)
            if 'net_pay' in col_map:
                try:
                    val = row.iloc[col_map['net_pay']]
                    if pd.notna(val):
                        record['net_pay'] = float(val)
                        total_paid += float(val)
                except:
                    pass
            
            # Gross salary
            if 'gross' in col_map:
                try:
                    val = row.iloc[col_map['gross']]
                    if pd.notna(val):
                        record['gross'] = float(val)
                        total_gross += float(val)
                except:
                    pass
            
            # Regular hours
            if 'regular_hours' in col_map:
                try:
                    # Hours are usually 2 columns before the amount
                    hours_col = col_map['regular_hours'] - 1
                    val = row.iloc[hours_col]
                    if pd.notna(val):
                        record['hours'] = float(val)
                        total_hours += float(val)
                except:
                    pass
            
            if record.get('net_pay', 0) > 0 or record.get('gross', 0) > 0:
                records.append(record)
                employees.add(name)
        
        return {
            'filename': filename,
            'restaurant': current_restaurant,
            'records': records,
            'total_paid': total_paid,
            'total_gross': total_gross,
            'total_hours': total_hours,
            'employee_count': len(employees),
        }
        
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        import traceback
        traceback.print_exc()
        return None

def extract_date_from_filename(filename):
    """Extract date range from filename."""
    # Look for patterns like "24 ABRIL 2026" or "24-30 ABRIL"
    months = {
        'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
        'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
        'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
    }
    
    filename_upper = filename.upper()
    for month_name, month_num in months.items():
        if month_name in filename_upper:
            # Find year
            year_match = re.search(r'20\d{2}', filename)
            year = year_match.group() if year_match else '2026'
            return f"{year}-{month_num}"
    return None

def main():
    downloads_dir = Path.home() / 'Downloads'
    
    # Find planilla files
    planilla_files = []
    for pattern in ['PLANILLA*.xls', 'PLANILLA*.xlsx', 'SALARIOS*.xls', 'SALARIOS*.xlsx']:
        planilla_files.extend(downloads_dir.glob(pattern))
    
    # Remove duplicates and temp files
    planilla_files = [f for f in planilla_files if not f.name.startswith('~$')]
    
    # Remove _1, _2 duplicates
    unique_files = {}
    for f in planilla_files:
        base = re.sub(r'_\d+\.', '.', f.name)
        if base not in unique_files or f.stat().st_mtime > unique_files[base].stat().st_mtime:
            unique_files[base] = f
    
    planilla_files = list(unique_files.values())
    
    print(f"Found {len(planilla_files)} unique planilla files")
    
    all_results = []
    by_restaurant = defaultdict(lambda: {'paid': 0, 'gross': 0, 'hours': 0, 'employees': set()})
    by_month = defaultdict(lambda: {'paid': 0, 'gross': 0, 'count': 0})
    
    for f in sorted(planilla_files, key=lambda x: x.name):
        result = parse_planilla_file(f)
        if result and result.get('total_paid', 0) > 0:
            all_results.append(result)
            
            rest = result.get('restaurant', 'unknown')
            by_restaurant[rest]['paid'] += result['total_paid']
            by_restaurant[rest]['gross'] += result['total_gross']
            by_restaurant[rest]['hours'] += result['total_hours']
            for rec in result['records']:
                by_restaurant[rest]['employees'].add(rec['name'])
            
            month = extract_date_from_filename(result['filename'])
            if month:
                by_month[month]['paid'] += result['total_paid']
                by_month[month]['gross'] += result['total_gross']
                by_month[month]['count'] += 1
            
            print(f"✅ {result['filename'][:50]:<50} | {result['employee_count']:>2} emp | ₡{result['total_paid']:>12,.0f}")
    
    print(f"\n{'='*70}")
    print(f"📊 SUMMARY BY RESTAURANT")
    print(f"{'='*70}")
    
    grand_paid = 0
    grand_gross = 0
    grand_hours = 0
    
    for rest in ['laluna', 'coyol', 'esh', 'unknown']:
        if rest in by_restaurant:
            data = by_restaurant[rest]
            grand_paid += data['paid']
            grand_gross += data['gross']
            grand_hours += data['hours']
            print(f"\n{rest.upper()}:")
            print(f"  Unique Employees: {len(data['employees'])}")
            print(f"  Total Hours: {data['hours']:,.1f}")
            print(f"  Total Gross: ₡{data['gross']:,.0f}")
            print(f"  Total Paid: ₡{data['paid']:,.0f}")
    
    print(f"\n{'='*70}")
    print(f"📅 BY MONTH")
    print(f"{'='*70}")
    
    for month in sorted(by_month.keys()):
        data = by_month[month]
        print(f"{month}: ₡{data['paid']:,.0f} ({data['count']} files)")
    
    print(f"\n{'='*70}")
    print(f"💰 GRAND TOTAL PAYROLL")
    print(f"{'='*70}")
    print(f"  Total Gross: ₡{grand_gross:,.0f}")
    print(f"  Total Paid: ₡{grand_paid:,.0f}")
    print(f"  Total Hours: {grand_hours:,.1f}")
    
    # Save
    output_path = Path.home() / '.openclaw/workspace/meraki-control/data/payroll_parsed.json'
    
    summary = {
        'by_restaurant': {},
        'by_month': dict(by_month),
        'grand_total_paid': grand_paid,
        'grand_total_gross': grand_gross,
        'grand_total_hours': grand_hours,
        'files_parsed': len(all_results),
    }
    for rest, data in by_restaurant.items():
        summary['by_restaurant'][rest] = {
            'paid': data['paid'],
            'gross': data['gross'],
            'hours': data['hours'],
            'employee_count': len(data['employees']),
            'employees': list(data['employees']),
        }
    
    with open(output_path, 'w') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n📁 Saved to {output_path}")

if __name__ == '__main__':
    main()
