
import os
import json
import xml.etree.ElementTree as ET
from datetime import datetime

def parse_xml_invoice(xml_content):
    root = ET.fromstring(xml_content)
    namespaces = {
        'fe': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica',
        'ds': 'http://www.w3.org/2000/09/xmldsig#'
    }

    invoice = {}

    # Extract header info
    invoice['clave'] = root.find('fe:Clave', namespaces).text
    invoice['date'] = root.find('fe:FechaEmision', namespaces).text.split('T')[0]
    
    # Emisor (Supplier)
    emisor = root.find('fe:Emisor', namespaces)
    invoice['supplier'] = emisor.find('fe:Nombre', namespaces).text
    invoice['supplier_id'] = emisor.find('fe:Identificacion/fe:Numero', namespaces).text

    # Receptor (Recipient) - Assuming Meraki Family Ltda, can be refined if needed
    # For now, it's not critical to extract the recipient for invoices.json

    # Items
    items = []
    for line_detalle in root.findall('fe:DetalleServicio/fe:LineaDetalle', namespaces):
        item = {
            'product': line_detalle.find('fe:Detalle', namespaces).text,
            'qty': float(line_detalle.find('fe:Cantidad', namespaces).text),
            'unit': line_detalle.find('fe:UnidadMedida', namespaces).text,
            'unit_price': float(line_detalle.find('fe:PrecioUnitario', namespaces).text),
            'total': float(line_detalle.find('fe:MontoTotalLinea', namespaces).text)
        }
        items.append(item)
    invoice['items'] = items

    # Summary
    resumen = root.find('fe:ResumenFactura', namespaces)
    invoice['subtotal'] = float(resumen.find('fe:TotalVentaNeta', namespaces).text)
    invoice['iva'] = float(resumen.find('fe:TotalImpuesto', namespaces).text)
    invoice['total'] = float(resumen.find('fe:TotalComprobante', namespaces).text)
    invoice['currency'] = resumen.find('fe:CodigoTipoMoneda/fe:CodigoMoneda', namespaces).text

    invoice['restaurant'] = None # This info is often not in the invoice XML itself, needs manual tagging or ML
    invoice['source_file'] = f"{invoice['clave']}.xml"
    invoice['parsed_at'] = datetime.now().isoformat()

    return invoice

def update_invoices_json(new_invoice_data, json_file_path):
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {'invoices': []}

    # Check for duplicate before adding
    existing_claves = {inv['clave'] for inv in data['invoices']}
    if new_invoice_data['clave'] not in existing_claves:
        data['invoices'].append(new_invoice_data)
        print(f"Added invoice {new_invoice_data['clave']} to {json_file_path}")
    else:
        print(f"Invoice {new_invoice_data['clave']} already exists in {json_file_path}")

    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# --- Main execution ---
import argparse

# --- Main execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Parse an XML invoice and update a JSON database.')
    parser.add_argument('--xml-path', required=True, help='Path to the XML invoice file.')
    args = parser.parse_args()
    xml_file_path = args.xml_path
    invoices_json_path = os.path.expanduser('~/.openclaw/workspace/meraki-control/data/invoices.json')
invoices_json_path = os.path.expanduser('~/.openclaw/workspace/meraki-control/data/invoices.json')

with open(xml_file_path, 'r', encoding='utf-8') as f:
    xml_content = f.read()

new_invoice = parse_xml_invoice(xml_content)
update_invoices_json(new_invoice, invoices_json_path)
