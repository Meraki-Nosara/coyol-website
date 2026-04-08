---
name: cierre-ocr
description: Extract sales data from restaurant closing photos (cierres de caja). OCR handwritten or printed daily closing reports from La Luna, Coyol, and Esh restaurants. Use when processing closing images, extracting daily sales from photos, updating sales data from Ingrid's emails, or parsing register closeout images. Triggers on "parse cierre", "extract sales from image", "OCR closing", "process Ingrid email", "daily closing photo".
---

# Cierre OCR

Extract sales data from restaurant closing photos.

## Overview

Ingrid sends daily closing photos (cierres de caja) for all three Meraki restaurants. These contain:
- Total sales
- Food vs bar breakdown
- Cash vs card split
- Service tax and IVA
- Card terminal details

## Image Analysis

Use vision model to extract data:

```python
# Using Claude/GPT-4 Vision
prompt = """Extract the sales data from this restaurant closing report:
1. Restaurant name (Coyol, La Luna, or Esh)
2. Date
3. Net sales (Ventas Netas)
4. Service tax 10%
5. IVA 13%
6. Total (Sub Total)
7. Cash amount (Efectivo)
8. Card amount (Tarjeta)

Return as JSON."""
```

## Expected Output

```json
{
  "restaurant": "coyol",
  "date": "2026-04-07",
  "netSales": 3491100,
  "service10": 349110,
  "iva13": 453843,
  "total": 4345113,
  "cash": 396500,
  "card": 3948613,
  "food": 2219400,
  "bar": 1271600
}
```

## Restaurant Identification

| Clue | Restaurant |
|------|------------|
| "Restaurante El Coyol" | Coyol |
| "La Luna (Restaurante)" | La Luna |
| "Panadería ESH" or "Cafetería ESH" | Esh |
| Keswick Green theme | Coyol |
| High totals (>₡8M) | Usually La Luna |

## Key Fields to Extract

### Sales Breakdown
- `Ventas totales` — Gross sales
- `Subtotal de la comida` — Food sales
- `Subtotal del bar` — Bar/drinks sales
- `Descuentos` — Discounts (subtract)
- `Ventas Netas` — Net sales after discounts

### Taxes
- `Service Tax 10%` or `Servicio 10%`
- `IVA 13%`
- `Sub Total` — Total with taxes

### Payment Methods
- `Total en efectivo` — Cash (may include USD converted)
- `Dólares` — USD cash (multiply by ~505)
- `Total en tarjetas` — Card payments
- `LAFISE` / `BCR` — Card processor totals

## Workflow

1. **Download images** from email via Himalaya
2. **Copy to workspace** (for vision model access)
3. **Extract with vision** — prompt for JSON output
4. **Validate totals** — cash + card ≈ total
5. **Update sales.json** — append to daily array
6. **Mark email read** — `himalaya flag add <ID> seen`

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/process_cierre.py` | Process single image |
| `scripts/batch_process.py` | Process multiple images |
| `scripts/update_sales.py` | Update sales.json |

## Common Issues

**Blurry images**: Request re-send from Ingrid via Angelina

**Missing restaurants**: Some days may only have 2 of 3 restaurants

**USD cash**: Convert dollars to colones (check "Dólares" field)

**Multiple terminals**: La Luna often has 2 LAFISE terminals

## References

- [references/field-mapping.md](references/field-mapping.md) — POS field names by restaurant
- [references/validation.md](references/validation.md) — Data validation rules
