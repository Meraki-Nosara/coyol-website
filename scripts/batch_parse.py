#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import json
import sys
import os
import glob

NS = {'fe': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica'}

def parse_xml(filepath):
    tree = ET.parse(filepath)
    root = tree.getroot()
    
    def find(path):
        el = root.find(path, NS)
        return el.text if el is not None else None
    
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

# Parse specific files
files = [
    os.path.expanduser('~/Downloads/50616042600060276013100100001010000000347100041769.xml'),
    os.path.expanduser('~/Downloads/50616042600060276013100100001010000000348100041769.xml'),
    os.path.expanduser('~/Downloads/50616042600060276013100100001010000000349100041769.xml'),
    os.path.expanduser('~/Downloads/50616042600310110918000200003010000100870116042670_1.xml'),
    os.path.expanduser('~/Downloads/50616042600310110918000200003010000100885116042685_1.xml'),
    os.path.expanduser('~/Downloads/50616042600310110918000200003010000100965116042665_1.xml'),
    os.path.expanduser('~/Downloads/50616042600310110918000200003010000100978116042678_1.xml'),
    os.path.expanduser('~/Downloads/FE-50616042615581547203100100001010000001636144122853.xml'),
    os.path.expanduser('~/Downloads/FE-50616042615581547203100100001010000001637178249477.xml'),
    os.path.expanduser('~/Downloads/50616042600310263070000100212010000075504100075504.xml'),
]

results = []
for f in files:
    if os.path.exists(f):
        try:
            data = parse_xml(f)
            results.append(data)
            print(f"✅ {data['date']} | {data['supplier'][:35]:35} | ₡{data['total']:>12,.0f}", file=sys.stderr)
        except Exception as e:
            print(f"❌ {f}: {e}", file=sys.stderr)

print(json.dumps(results, indent=2, ensure_ascii=False))
