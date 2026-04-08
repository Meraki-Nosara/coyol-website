# Meraki Financial Calculations

## Margin Calculations

### Gross Margin
```
Gross Margin = (Sales - COGS) / Sales × 100

Where:
- Sales = Total from cierres (food + bar)
- COGS = Sum of supplier invoices for the period
```

### Food Cost Percentage
```
Food Cost % = Food Purchases / Food Sales × 100
Target: 28-32%
```

### Beverage Cost Percentage
```
Beverage Cost % = Beverage Purchases / Bar Sales × 100
Target: 18-22%
```

## Labor Efficiency

### Revenue per MDO (Man-Day Worked)
```
$/MDO = Total Sales / Total MDO Hours

Targets by restaurant:
- La Luna: >$10/MDO
- Coyol: >$8/MDO  
- Esh: >$3.50/MDO
```

### Labor Cost Percentage
```
Labor % = Total Payroll / Total Sales × 100
Target: 25-30%
```

## Alerts & Thresholds

### Price Creep Alert
Trigger when:
- Product price increases >5% vs baseline
- Same supplier increases prices 3+ times in 3 months

### Labor Efficiency Alert
Trigger when:
- $/MDO drops >10% vs prior week
- Sales down >15% but MDO unchanged

### Cash vs Card Ratio
Normal range: 5-15% cash
Alert if cash >20% (potential underreporting)

## Currency

- All amounts in Costa Rican Colones (₡)
- USD conversion: ₡505 = $1 (approximate)
- Display as:
  - Under ₡1M: "₡XXX,XXX"
  - ₡1M-999M: "₡X.XM"
  - Over ₡1B: "₡X.XB"
