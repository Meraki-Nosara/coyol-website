---
name: factura-parser
description: Parse Costa Rica electronic invoices (facturas electrónicas) from XML and PDF formats. Extract supplier, amounts, line items, and tax details. Use when processing invoices, importing supplier costs, analyzing spending, or building cost databases. Triggers on "parse factura", "extract invoice", "factura electrónica", "import invoices", "supplier costs".
---

# Factura Parser

Parse Costa Rica electronic invoices (Hacienda format) into structured data.

## Setup

```bash
pip install pdfplumber lxml pandas
```

## Quick Start

### Parse Single XML

```python
from scripts.parse_factura import parse_xml_factura

invoice = parse_xml_factura("factura.xml")
print(f"Supplier: {invoice['supplier']}")
print(f"Total: ₡{invoice['total']:,.0f}")
```

### Batch Parse Directory

```bash
python3 scripts/batch_parse.py /path/to/invoices --output invoices.json
```

## XML Structure

Costa Rica facturas follow the Hacienda v4.4 schema:

```xml
<FacturaElectronica>
  <Clave>50607042600310107490301...</Clave>
  <FechaEmision>2026-04-07T14:47:58</FechaEmision>
  <Emisor>
    <Nombre>EXPORTADORA PMT S.A.</Nombre>
    <Identificacion><Numero>3101074903</Numero></Identificacion>
  </Emisor>
  <Receptor>
    <Nombre>MERAKI FAMILY LTDA</Nombre>
  </Receptor>
  <DetalleServicio>
    <LineaDetalle>
      <Detalle>MOZZARELLA BLOQUE</Detalle>
      <Cantidad>43.740</Cantidad>
      <PrecioUnitario>3225.00</PrecioUnitario>
      <MontoTotalLinea>159399.50</MontoTotalLinea>
    </LineaDetalle>
  </DetalleServicio>
  <ResumenFactura>
    <TotalVentaNeta>312125.35</TotalVentaNeta>
    <TotalImpuesto>35937.10</TotalImpuesto>
    <TotalComprobante>348062.45</TotalComprobante>
  </ResumenFactura>
</FacturaElectronica>
```

## Key Fields

| Field | XPath | Description |
|-------|-------|-------------|
| Clave | `//Clave` | 50-digit unique ID |
| Supplier | `//Emisor/Nombre` | Supplier name |
| Supplier ID | `//Emisor/Identificacion/Numero` | Cédula jurídica |
| Date | `//FechaEmision` | ISO datetime |
| Subtotal | `//TotalVentaNeta` | Before tax |
| IVA | `//TotalImpuesto` | Tax amount |
| Total | `//TotalComprobante` | Final amount |
| Items | `//LineaDetalle` | Line items |

## Output Format

```json
{
  "clave": "50607042600310107490301...",
  "supplier": "EXPORTADORA PMT S.A.",
  "supplier_id": "3101074903",
  "receiver": "MERAKI FAMILY LTDA",
  "date": "2026-04-07",
  "subtotal": 312125.35,
  "iva": 35937.10,
  "total": 348062.45,
  "items": [
    {
      "product": "MOZZARELLA BLOQUE",
      "qty": 43.74,
      "unit": "Kg",
      "unit_price": 3225.00,
      "total": 159399.50
    }
  ]
}
```

## Common Suppliers

| Supplier | Cédula | Category |
|----------|--------|----------|
| PMT | 3101074903 | Food distributor |
| Mayca | 3101109180 | Food distributor |
| Guanapollos | 3101395115 | Chicken |
| Distribuidora Isleña | 3101109180 | Specialty foods |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/parse_factura.py` | Parse single XML/PDF |
| `scripts/batch_parse.py` | Batch parse directory |

## References

- [references/hacienda-schema.md](references/hacienda-schema.md) — Full XML schema details
- [references/supplier-mapping.md](references/supplier-mapping.md) — Known supplier IDs
