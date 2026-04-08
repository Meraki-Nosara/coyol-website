#!/usr/bin/env python3
"""
Parse Costa Rica electronic invoices (facturas electrónicas)
Usage: python3 parse_factura.py invoice.xml [--output invoice.json]
"""

import xml.etree.ElementTree as ET
import json
import argparse
from datetime import datetime
from pathlib import Path

def parse_xml_factura(xml_path):
    """Parse a Costa Rica factura electrónica XML file"""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Helper to find elements with any namespace
    def find(xpath):
        elem = root.find(f'.//{{{root.tag.split("}")[0][1:]}}}' + xpath.replace('//', '').replace('/', f'}}/{{{root.tag.split("}")[0][1:]}}}'))
        if elem is None:
            elem = root.find(f'.//*[local-name()="{xpath.split("/")[-1]}"]')
        return elem
    
    def find_text(xpath, default=''):
        elem = root.find(f'.//{{{root.tag.split("}")[0][1:] if "{" in root.tag else ""}}}' + xpath) if '{' in root.tag else root.find(f'.//{xpath}')
        if elem is None:
            # Try with wildcard namespace
            for e in root.iter():
                if e.tag.endswith(xpath.split('/')[-1]):
                    return e.text or default
        return elem.text if elem is not None else default
    
    # Extract with namespace handling
    ns = root.tag.split('}')[0] + '}' if '}' in root.tag else ''
    
    def get(tag):
        elem = root.find(f'.//{ns}{tag}')
        return elem.text if elem is not None else None
    
    def get_float(tag):
        val = get(tag)
        return float(val) if val else 0.0
    
    # Parse line items
    items = []
    for linea in root.findall(f'.//{ns}LineaDetalle'):
        item = {
            'product': linea.findtext(f'{ns}Detalle', ''),
            'qty': float(linea.findtext(f'{ns}Cantidad', '0')),
            'unit': linea.findtext(f'{ns}UnidadMedida', 'Unid'),
            'unit_price': float(linea.findtext(f'{ns}PrecioUnitario', '0')),
            'total': float(linea.findtext(f'{ns}MontoTotalLinea', '0')),
        }
        items.append(item)
    
    # Build result
    result = {
        'clave': get('Clave') or '',
        'consecutivo': get('NumeroConsecutivo') or '',
        'supplier': get('Nombre') or '',  # First Nombre is usually Emisor
        'supplier_id': '',
        'receiver': '',
        'date': '',
        'subtotal': get_float('TotalVentaNeta'),
        'iva': get_float('TotalImpuesto'),
        'total': get_float('TotalComprobante'),
        'items': items,
        'source_file': str(xml_path),
        'parsed_at': datetime.now().isoformat()
    }
    
    # Get Emisor details
    emisor = root.find(f'.//{ns}Emisor')
    if emisor is not None:
        result['supplier'] = emisor.findtext(f'{ns}Nombre', '')
        ident = emisor.find(f'{ns}Identificacion')
        if ident is not None:
            result['supplier_id'] = ident.findtext(f'{ns}Numero', '')
    
    # Get Receptor details
    receptor = root.find(f'.//{ns}Receptor')
    if receptor is not None:
        result['receiver'] = receptor.findtext(f'{ns}NombreComercial', '') or receptor.findtext(f'{ns}Nombre', '')
    
    # Get date
    fecha = get('FechaEmision')
    if fecha:
        result['date'] = fecha[:10]  # Just the date part
    
    return result

def main():
    parser = argparse.ArgumentParser(description='Parse Costa Rica factura electrónica')
    parser.add_argument('input', help='XML file to parse')
    parser.add_argument('--output', '-o', help='Output JSON file (optional)')
    parser.add_argument('--pretty', '-p', action='store_true', help='Pretty print JSON')
    args = parser.parse_args()
    
    result = parse_xml_factura(args.input)
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2 if args.pretty else None, ensure_ascii=False)
        print(f"Saved to {args.output}")
    else:
        indent = 2 if args.pretty else None
        print(json.dumps(result, indent=indent, ensure_ascii=False))

if __name__ == '__main__':
    main()
