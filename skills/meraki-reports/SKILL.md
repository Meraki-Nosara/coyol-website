---
name: meraki-reports
description: Generate daily, weekly, and monthly financial reports for Meraki restaurant group (La Luna, Coyol, Esh). Use when asked to create sales reports, send daily summaries, generate weekly analysis, or produce monthly P&L reports. Triggers on "daily report", "weekly report", "send report to Angelina", "Meraki summary", "restaurant performance".
---

# Meraki Reports

Generate professional financial reports for Meraki restaurants.

## Setup

```bash
pip install playwright pandas jinja2
playwright install chromium
```

## Report Types

| Report | Frequency | Recipient | Content |
|--------|-----------|-----------|---------|
| Daily | 8pm CST | Angelina | Yesterday's sales by restaurant |
| Weekly | Sunday 7pm | Angelina | Week totals, trends, alerts |
| Monthly | 1st of month | Angelina | Full P&L, YoY comparison |

## Data Sources

- Sales: `meraki-control/data/sales.json`
- Expenses: `meraki-control/data/sales.json` (gastos sections)
- Invoices: `meraki-control/data/invoices.json`
- Suppliers: `meraki-control/data/suppliers.json`

## Quick Start

### Generate Daily Report

```python
python3 scripts/daily_report.py --date 2026-04-07 --output report.png
```

### Send Report via Email

```bash
# macOS Mail
osascript scripts/send_email.scpt "vailas78@yahoo.com" "Daily Report" "report.png"
```

## Design Guidelines

**Colors (Land Rover Heritage):**
- Esh: Sand `#C4A67C`
- Coyol: Keswick Green `#3D4F3D`  
- La Luna: Terracotta `#A65D3F`
- Background: Alaska White `#F5F3EF`

**Report Modes:**
- Daily: Light mode (white/cream)
- Weekly: Dark mode + Keswick Green accent
- Monthly: Dark mode + Terracotta/Gold accent

**Principles:**
- Investor-presentation quality
- Angelina should understand in 2 seconds
- Charts only when they clarify, not decorate
- Language: English only

## Alerts to Include

**Labor Efficiency (when MDO data available):**
- ⚠️ If $/MDO dropping vs last week
- ⚠️ If sales down but MDO steady

**Price Creep (when invoice data available):**
- ⚠️ Product >5% above negotiated price
- ⚠️ 3+ price increases from same supplier

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/daily_report.py` | Generate daily PNG report |
| `scripts/weekly_report.py` | Generate weekly summary |
| `scripts/monthly_report.py` | Generate monthly P&L |
| `scripts/send_email.scpt` | Send via macOS Mail |

## References

- [references/templates.md](references/templates.md) — HTML templates
- [references/calculations.md](references/calculations.md) — Margin/efficiency formulas
