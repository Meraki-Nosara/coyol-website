#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import json
import sys
import os

NS = {'fe': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica'}

def parse_xml(filepath):
    tree = ET.parse(filepath)
    root = tree.getroot()
    
    def find(path):
        el = root.find(path, NS)
        return el.text if el is not None else None
    
    # Get line items
    items = []
    for line in root.findall('.//fe:LineaDetalle', NS):
        item = {
            'product': line.findtext('fe:Detalle', '', NS),
            'qty': float(line.findtext('fe:Cantidad', '0', NS)),
            'unit': line.findtext('fe:UnidadMedida', '', NS),
            'unit_price': float(line.findtext('fe:PrecioUnitario', '0', NS)),
            'total': float(line.findtext('fe:MontoTotalLinea', '0', NS))
        }
        items.append(item)
    
    # Get totals from ResumenFactura
    resumen = root.find('.//fe:ResumenFactura', NS)
    if resumen is not None:
        subtotal = float(resumen.findtext('fe:TotalVentaNeta', '0', NS))
        iva = float(resumen.findtext('fe:TotalImpuesto', '0', NS))
        total = float(resumen.findtext('fe:TotalComprobante', '0', NS))
    else:
        subtotal = iva = total = 0
    
    return {
        'clave': find('.//fe:Clave'),
        'consecutivo': find('.//fe:NumeroConsecutivo'),
        'date': find('.//fe:FechaEmision')[:10] if find('.//fe:FechaEmision') else None,
        'supplier': find('.//fe:Emisor/fe:Nombre'),
        'supplier_id': find('.//fe:Emisor/fe:Identificacion/fe:Numero'),
        'receiver': find('.//fe:Receptor/fe:Nombre'),
        'subtotal': subtotal,
        'iva': iva,
        'total': total,
        'items': items,
        'item_count': len(items)
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python parse_factura.py <xml_file>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        sys.exit(1)
    
    try:
        data = parse_xml(filepath)
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        sys.exit(1)
