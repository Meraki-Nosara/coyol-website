# HEARTBEAT.md — Periodic Checks

## Priority Checks

### 📧 Email — CHECK EVERY 30 MINUTES!
**Account:** marionnosara@gmail.com via Himalaya CLI

```bash
himalaya envelope list --page-size 30     # Check inbox
himalaya attachment download <ID>         # Get attachments  
himalaya flag add <ID> seen               # Mark read after processing
```

**What to look for:**
- 🧾 **Ingrid cierres** (daily closing photos) → OCR → sales.json
- 📋 **Silvia price lists** → Update suppliers.json
- 🧾 **Facturas electrónicas** → Parse for cost tracking
- 💳 **Lafise TCR reports** → Card commission data
- 👷 **MDO/Salary files** → Labor hours data

**After processing:**
1. Update `meraki-control/data/sales.json`
2. Mark email as read: `himalaya flag add <ID> seen`
3. Alert Marion if anything urgent

⚠️ **EVERY 30 MINUTES** — This is critical for daily operations!

### 📊 Meraki Daily Report (8pm Costa Rica) ⚠️ CRITICAL
- **At 8pm (20:00) SHARP**: Generate and send daily report to Angelina (vailas78@yahoo.com)
- **CHECK TIME EVERY HEARTBEAT** — if between 19:50 and 20:10 and report not sent today, SEND IT NOW
- Read data from `~/.openclaw/workspace/meraki-control/data/sales.json`
- Use HTML template with Land Rover colors:
  - Esh = Sand (#C4A67C)
  - Coyol = Keswick Green (#3D4F3D)
  - La Luna = Terracotta (#A65D3F)
- Generate PNG with playwright, send via macOS Mail
- If missing data, note which restaurants haven't reported
- **Labor Efficiency Warnings** (when weekly MDO data available):
  - If $/MDO dropping vs last week → ⚠️ warn
  - If sales down but MDO steady → ⚠️ warn "Sales down X% but payroll unchanged — consider reducing hours"
  - Example: "⚠️ La Luna: Sales down 18% but MDO same as last week. Overstaffed?"

### 📊 Projects Status
- Coyol website dev server (port 4321)
- Meraki control dev server (port 4400)
- Restart if down

---

## Weekly Tasks (Sunday evening)

### Meraki Weekly Report
- Generate weekly summary for Angelina
- Week totals by restaurant
- Best/worst days
- Week-over-week trends
- **Labor Efficiency Check** (when MDO data available):
  - Calculate $/MDO for each restaurant
  - ⚠️ WARN if below target (La Luna <$10, Esh <$3.50, Coyol <$8)
  - ⚠️ WARN if sales dropped but MDO stayed same
  - Include recommendation: "Consider reducing X hours next week"
- **Price Creep Alert** (when invoice data available):
  - Compare current prices vs negotiated/baseline prices
  - ⚠️ WARN if product >5% above negotiated price
  - ⚠️ WARN if 3+ price increases from same supplier in 3 months
  - **SEND SEPARATE EMAIL TO ANGELINA** with:
    ```
    ⚠️⚠️⚠️ PRICE CREEP ALERT ⚠️⚠️⚠️
    
    Supplier: [NAME]
    Product: [PRODUCT]
    
    Invoice #[OLD]: [DATE] - ₡X,XXX/kg
    Invoice #[NEW]: [DATE] - ₡X,XXX/kg
    
    INCREASE: +XX.X% (₡XXX more per kg)
    
    Monthly impact: ~$XXX extra
    
    Recommendation: Call supplier and negotiate
    back to original price or find alternative.
    ```
  - Send to: vailas78@yahoo.com
  - Subject: "⚠️ PRICE ALERT: [Supplier] raised [Product] +XX%"
- Send to vailas78@yahoo.com

### Monday
- Review weekend sales data
- Check supplier price changes

### Friday
- Review week's activity
- Update MEMORY.md with learnings
- Archive old daily memory files

---

## Monthly Tasks (1st of each month)

### Meraki Monthly Report
- Full month breakdown by restaurant
- Month-over-month comparison
- Supplier costs summary (when available)
- Recommendations
- Send to vailas78@yahoo.com

---

## Notes
- Don't check late night (23:00-08:00) unless urgent
- Angelina's WhatsApp: +506 8855-9146
- **Reports in English only**
- Angelina's email: vailas78@yahoo.com

## Team / Contacts

### Angelina Peri (Owner/Administrator)
- WhatsApp: +506 8855-9146
- Email: vailas78@yahoo.com
- Role: Receives all reports, coordinates staff
- **Has:** Bank statements, credit card commissions
- **Note:** Not great at routine — but will send if I explain why I need it for a report. Just ask nicely!

### Ingrid
- Role: Takes photos of daily closings for each restaurant, counts cash
- Sends: Yesterday's closing images for Esh, Coyol, La Luna
- **If data is missing → Ask Angelina to follow up with Ingrid**

### John
- Role: Manager of Coyol restaurant

### Abner
- Role: Manager of La Luna (staff/manpower)
- Also handles payroll across all locations

### Silvia
- Role: Cleaning & supplies (all locations, based at La Luna)

### Danny
- Role: Food control & ordering (all 3 locations)
- Also oversees Esh (smaller operation)
- Hired by Angelina
