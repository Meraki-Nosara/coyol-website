---
name: costa-rica-renta
description: Estimate and calculate Costa Rica annual income tax (Impuesto sobre la Renta) for businesses. Covers D-101 filing, tax brackets, deductible expenses, quarterly estimates, and year-end projections. Use when asked about "renta", "income tax Costa Rica", "D-101", "tax estimate", "cuanto debo de renta", "impuesto sobre la renta", or annual tax planning.
---

# Costa Rica Renta (Income Tax)

Estimate annual income tax for Costa Rica businesses.

## Tax Year

- **Fiscal year:** October 1 → September 30
- **Filing deadline:** December 15 (D-101 form)
- **Payment:** Can be split into 3 quarterly payments

## Corporate Tax Rates (2026)

### Standard Rates by Gross Income

| Gross Annual Income | Rate |
|---------------------|------|
| Up to ₡5,761,000 | 5% |
| ₡5,761,001 - ₡8,643,000 | 10% |
| ₡8,643,001 - ₡11,524,000 | 15% |
| ₡11,524,001 - ₡120,962,000 | 20% |
| Over ₡120,962,000 | 30% |

**Note:** Rates apply to NET taxable income (after deductions), but brackets are based on GROSS income.

### Simplified Formula

For businesses with gross income over ₡120M (like Meraki):
```
Renta = Net Taxable Income × 30%
```

## Calculating Net Taxable Income

```
Gross Sales (Ventas Brutas)
- Cost of Goods Sold (Costo de Ventas)
- Operating Expenses (Gastos Operativos)
- Depreciation (Depreciación)
- Interest Expenses (Gastos Financieros)
= Net Taxable Income (Renta Neta)
```

## Deductible Expenses

### ✅ Fully Deductible
- Salaries and wages (with CCSS paid)
- Rent (local comercial)
- Utilities (electricity, water, internet)
- Supplies and inventory
- Professional services (accounting, legal)
- Insurance
- Bank fees and interest
- Marketing and advertising
- Vehicle expenses (business use %)
- Depreciation on assets

### ⚠️ Partially Deductible
- Meals and entertainment (50%)
- Vehicle depreciation (max ₡20M value)
- Travel (must be business-related)

### ❌ Not Deductible
- Personal expenses
- Fines and penalties
- Income tax itself
- Donations over 10% of net income
- Expenses without factura electrónica

## Quick Estimate

```python
# Meraki Example (FY 2025-2026)
gross_sales = 2_500_000_000  # ₡2.5B annual sales
cogs = gross_sales * 0.32    # ~32% food/bev cost
gastos = 970_000_000         # Operating expenses
payroll = 600_000_000        # Salaries + CCSS

net_income = gross_sales - cogs - gastos - payroll
# net_income ≈ ₡130M

renta_estimate = net_income * 0.30
# renta ≈ ₡39M (~$77K USD)
```

## Quarterly Estimates

To avoid year-end surprise, estimate quarterly:

| Quarter | Period | Estimate Due |
|---------|--------|--------------|
| Q1 | Oct-Dec | January 15 |
| Q2 | Jan-Mar | April 15 |
| Q3 | Apr-Jun | July 15 |
| Q4 | Jul-Sep | October 15 |

```
Quarterly Payment = (Estimated Annual Renta) / 4
```

## Meraki-Specific Notes

### Data Sources
- **Sales:** `meraki-control/data/sales.json`
- **Expenses:** `meraki-control/data/sales.json` (gastos sections)
- **Invoices:** `meraki-control/data/invoices.json`

### Three Restaurants, One Company
Meraki Family Ltda files ONE D-101 combining:
- La Luna
- Coyol
- Esh

### Key Deductions to Track
1. **Payroll** — Salaries + CCSS patronal (~26.5% on top)
2. **Suppliers** — All facturas electrónicas
3. **Rent** — Local comercial for each restaurant
4. **Utilities** — ICE, AyA, internet
5. **Bank fees** — Card processing commissions (Lafise, BCR)

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/estimate_renta.py` | Calculate annual estimate |
| `scripts/monthly_projection.py` | Month-by-month tax projection |
| `scripts/quarterly_report.py` | Generate quarterly projection |

## Monthly Tracking

Track tax liability monthly to avoid year-end surprises:

```
Month    Sales      Gastos     Net        Tax       YTD Tax
-------  ---------  ---------  ---------  --------  --------
Oct      ₡63M       ₡28M       ₡-4M       ₡0        ₡0
Nov      ₡181M      ₡85M       ₡-17M      ₡0        ₡0
Dec      ₡322M      ₡138M      ₡-17M      ₡0        ₡0
Jan      ₡352M      ₡133M      ₡-1M       ₡0        ₡0
Feb      ₡302M      ₡105M      ₡9M        ₡3M       ₡3M
... (continues)
```

**Key insight:** High-expense months (Dec, Jan) often show losses. Tax liability builds in moderate months (Feb, Mar, Aug).

## References

- [references/deductions.md](references/deductions.md) — Full deduction guide
- [references/d101-form.md](references/d101-form.md) — D-101 filing instructions
- [references/rates-history.md](references/rates-history.md) — Historical tax rates

## Common Mistakes

1. **Forgetting CCSS patronal** — 26.5% on salaries is deductible
2. **Missing facturas** — No factura = no deduction
3. **Wrong fiscal year** — Oct-Sep, not Jan-Dec
4. **Ignoring depreciation** — Equipment, vehicles, improvements
5. **Late payments** — Penalties + interest add up
