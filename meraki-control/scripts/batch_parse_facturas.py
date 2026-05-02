#!/usr/bin/env python3
"""
Batch parse Costa Rica facturas electrónicas from XML files.
Outputs JSON with supplier, date, totals, and line items.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
import xml.etree.ElementTree as ET
from collections import defaultdict

# Namespace for Hacienda XML
NS = {
    'fe': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica',
    'fe44': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica',
    'nc': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/notaCreditoElectronica',
}

def find_text(root, paths, default=''):
    """Try multiple XPath patterns to find text."""
    for path in paths:
        # Try with each namespace
        for prefix, uri in NS.items():
            try:
                elem = root.find(path.replace('fe:', f'{{{uri}}}'), NS)
                if elem is not None and elem.text:
                    return elem.text.strip()
            except:
                pass
        # Try without namespace
        try:
            # Remove namespace prefixes for plain search
            plain_path = path.replace('fe:', '').replace('//', './/')
            for elem in root.iter():
                tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
                if tag == plain_path.split('/')[-1]:
                    if elem.text:
                        return elem.text.strip()
        except:
            pass
    return default

def parse_factura_xml(filepath):
    """Parse a single factura XML file."""
    try:
        tree = ET.parse(filepath)
        root = tree.getroot()
        
        # Check if this is a factura (not a response/acknowledgment)
        root_tag = root.tag.split('}')[-1] if '}' in root.tag else root.tag
        if root_tag in ['MensajeHacienda', 'MensajeReceptor', 'RespuestaHacienda']:
            return None  # Skip response files
        
        # Extract key fields by iterating through elements
        data = {}
        
        for elem in root.iter():
            tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
            text = elem.text.strip() if elem.text else ''
            
            if tag == 'Clave' and not data.get('clave'):
                data['clave'] = text
            elif tag == 'NumeroConsecutivo' and not data.get('consecutivo'):
                data['consecutivo'] = text
            elif tag == 'FechaEmision' and not data.get('date'):
                data['date'] = text[:10] if text else ''
            elif tag == 'TotalComprobante' and not data.get('total'):
                try:
                    data['total'] = float(text)
                except:
                    pass
            elif tag == 'TotalVentaNeta' and not data.get('subtotal'):
                try:
                    data['subtotal'] = float(text)
                except:
                    pass
            elif tag == 'TotalImpuesto' and not data.get('iva'):
                try:
                    data['iva'] = float(text)
                except:
                    pass
            elif tag == 'TotalDescuentos' and not data.get('discount'):
                try:
                    data['discount'] = float(text)
                except:
                    pass
            elif tag == 'CodigoTipoMoneda':
                # Look for currency code
                for child in elem:
                    child_tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                    if child_tag == 'CodigoMoneda' and child.text:
                        data['currency'] = child.text.strip()
        
        # Find Emisor (supplier)
        for emisor in root.iter():
            tag = emisor.tag.split('}')[-1] if '}' in emisor.tag else emisor.tag
            if tag == 'Emisor':
                for child in emisor.iter():
                    child_tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                    if child_tag == 'Nombre' and child.text and not data.get('supplier'):
                        data['supplier'] = child.text.strip()
                    elif child_tag == 'Numero' and child.text and not data.get('supplier_id'):
                        data['supplier_id'] = child.text.strip()
        
        # Find Receptor
        for receptor in root.iter():
            tag = receptor.tag.split('}')[-1] if '}' in receptor.tag else receptor.tag
            if tag == 'Receptor':
                for child in receptor.iter():
                    child_tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                    if child_tag == 'Nombre' and child.text and not data.get('receiver'):
                        data['receiver'] = child.text.strip()
        
        # Parse line items
        items = []
        for linea in root.iter():
            tag = linea.tag.split('}')[-1] if '}' in linea.tag else linea.tag
            if tag == 'LineaDetalle':
                item = {}
                for child in linea.iter():
                    child_tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                    text = child.text.strip() if child.text else ''
                    if child_tag == 'Detalle':
                        item['product'] = text
                    elif child_tag == 'Cantidad':
                        try:
                            item['qty'] = float(text)
                        except:
                            pass
                    elif child_tag == 'UnidadMedida':
                        item['unit'] = text
                    elif child_tag == 'PrecioUnitario':
                        try:
                            item['unit_price'] = float(text)
                        except:
                            pass
                    elif child_tag == 'MontoTotalLinea':
                        try:
                            item['total'] = float(text)
                        except:
                            pass
                if item.get('product'):
                    items.append(item)
        
        data['items'] = items
        data['item_count'] = len(items)
        data['source_file'] = os.path.basename(filepath)
        
        # Only return if we have essential fields
        if data.get('total') and data.get('supplier'):
            return data
        elif data.get('total'):
            return data  # Return even without supplier name
        return None
        
    except ET.ParseError as e:
        return None
    except Exception as e:
        return None

def main():
    downloads_dir = Path.home() / 'Downloads'
    xml_files = list(downloads_dir.glob('*.xml'))
    
    print(f"Found {len(xml_files)} XML files in Downloads")
    
    parsed = []
    skipped = 0
    errors = 0
    
    for f in xml_files:
        result = parse_factura_xml(f)
        if result:
            parsed.append(result)
        elif result is None:
            skipped += 1
        else:
            errors += 1
    
    # Sort by date
    parsed.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    # Summary by supplier
    by_supplier = defaultdict(lambda: {'count': 0, 'total': 0})
    for inv in parsed:
        supplier = inv.get('supplier', 'Unknown')
        by_supplier[supplier]['count'] += 1
        by_supplier[supplier]['total'] += inv.get('total', 0)
    
    print(f"\n✅ Parsed {len(parsed)} facturas")
    print(f"⏭️  Skipped {skipped} non-factura files (responses, etc)")
    
    print(f"\n📊 Top Suppliers:")
    sorted_suppliers = sorted(by_supplier.items(), key=lambda x: x[1]['total'], reverse=True)[:15]
    for supplier, data in sorted_suppliers:
        print(f"  {supplier[:40]:<40} {data['count']:>3} invoices  ₡{data['total']:>12,.0f}")
    
    # Calculate total
    total_all = sum(inv.get('total', 0) for inv in parsed)
    print(f"\n💰 Total: ₡{total_all:,.0f}")
    
    # Save to JSON
    output_path = Path.home() / '.openclaw/workspace/meraki-control/data/invoices_batch.json'
    with open(output_path, 'w') as f:
        json.dump(parsed, f, indent=2, ensure_ascii=False)
    print(f"\n📁 Saved to {output_path}")
    
    # Also print date range
    dates = [inv.get('date') for inv in parsed if inv.get('date')]
    if dates:
        print(f"📅 Date range: {min(dates)} to {max(dates)}")

if __name__ == '__main__':
    main()
