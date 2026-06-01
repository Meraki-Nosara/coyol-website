# HEARTBEAT.md — Periodic Checks

## 🚨 NON-NEGOTIABLE DAILY TASKS (DO THESE FIRST!)

These tasks MUST be completed before any project work:

1. **Ingrid cierres** — Check marionnosara@gmail.com for closing photos, OCR immediately
2. **Facturas** — Parse any new electronic invoices, update invoices.json
3. **8pm Daily Report** — Generate and send to Angelina (vailas78@yahoo.com)
4. **Restaurant Reservations** — Check for new bookings, send confirmation emails
5. **CRM Lead Sync** — Run reservation → CRM pipeline, alert Marion on hot leads

**NO EXCUSES. If you get distracted by other work, STOP and do these first.**

---

## 🎁 La Luna Gift Cards — CHECK EVERY HEARTBEAT!

**Send pending gift card emails:**
```bash
bash ~/.openclaw/workspace/coyol-website/scripts/send-gift-emails.sh
```

This checks Supabase for purchased gift cards with `status=pending_email` and sends:
1. Beautiful HTML email to recipient with gift code
2. Confirmation email to sender

**If script fails:** Check that `laluna_gift_cards` table exists in Supabase.

---

## 🎯 CRM Lead Scoring — RUN EVERY 15-30 MINUTES!

**Script:** `bash ~/.openclaw/workspace/meraki-crm/run-score.sh`

This scores new restaurant reservations and adds them to the CRM:
- Checks Coyol + La Luna reservations
- Scores by area code (NYC, LA, SF, Toronto = hot)
- Adds to `crm_guests` table in Supabase
- **Hot leads (40+) → Alert Marion immediately**

**Run this script EVERY heartbeat to keep leads fresh.**

---

## 🍽️ Restaurant Reservations — CHECK EVERY HEARTBEAT!

### Coyol Restaurant — AUTOMATED!
**Supabase table:** `coyol_reservations`
**Email account:** `coyol-restaurant` (reservations@coyolrestaurant.com)

**Run the automated check script:**
```bash
node ~/.openclaw/workspace/coyol-website/scripts/check-reservations.cjs
```

This script automatically:
1. Fetches confirmed reservations from last 24 hours
2. Checks against `memory/reservations-sent.json`
3. Sends confirmation emails for any unsent reservations
4. Updates the tracking file

**If same-day booking, alert Marion!**

### La Luna Restaurant — AUTOMATED!
**Supabase table:** `laluna_reservations`
**Email account:** `laluna-restaurant` (reservations@lalunanosara.com)

**Run the automated check script:**
```bash
node ~/.openclaw/workspace/coyol-website/scripts/check-laluna-reservations.cjs
```

This script automatically:
1. Fetches confirmed reservations from last 24 hours
2. Checks against `memory/reservations-sent.json`
3. Sends confirmation emails for any unsent reservations
4. Updates the tracking file

**If same-day booking, alert Marion!**

### Track sent confirmations:
File: `~/.openclaw/workspace/memory/reservations-sent.json`
```json
{
  "coyol": ["uuid1", "uuid2"],
  "laluna": ["uuid3"]
}
```

---

## 🔥 CRM Lead Sync — EVERY HEARTBEAT!

**Sync new reservations to CRM and score them:**
```bash
python3 ~/.openclaw/workspace/meraki-crm/check-reservations.py
```

This script:
1. Checks Coyol + La Luna reservation tables
2. Scores new guests (area code → city → tier)
3. Adds to `crm_guests` table in Supabase
4. Identifies HOT leads (score 40+)

**If HOT lead detected → Alert Marion immediately!**

Hot lead alert format:
```
🔥 NEW HOT LEAD!
Name: [NAME]
Email: [EMAIL]
City: [CITY]
Score: [SCORE]
Source: [RESTAURANT]

Booked a table — potential Mar Azul buyer.
```

---

## 🏗️ Coyol Control Pipeline — AUTO-PROGRESSION

**When Olger uploads a plano:**
1. Update lot's `pipelineStep` from `plano-catastrado` → `escritura`
2. Send email to Alessia (alessia.aguirre@gmail.com) requesting escritura
3. Notify Marion that lot progressed

**When Alessia uploads an escritura:**
1. Update lot's `pipelineStep` from `escritura` → `complete`
2. Update lot's `pipelineComplete` = true
3. Notify Marion that lot is ready for sale

**Check for uploads:**
- Watch coyolcontrol@gmail.com for document submissions
- Check Supabase storage for new files in `coyol-control/` folder

---

## Priority Checks

### La Luna Gift Cards — CHECK EVERY HEARTBEAT!
**Script:** `bash ~/.openclaw/workspace/coyol-website/scripts/send-gift-emails.sh`

This checks for pending gift card purchases and sends confirmation emails:
- Recipient gets beautiful gift card email with code
- Sender gets purchase confirmation
- Updates status in Supabase to 'sent'

**Run this script EVERY heartbeat to keep gift cards flowing.**

---

### 🏗️ NC Control Orders — CHECK EVERY HEARTBEAT!
**Supabase URL:** https://mnxjzvqgrrodalcmtntf.supabase.co
**Anon Key:** sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD

**Check for new pending orders:**
```bash
curl -s "https://mnxjzvqgrrodalcmtntf.supabase.co/rest/v1/orders?status=eq.pending&select=*" \
  -H "apikey: sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD" \
  -H "Authorization: Bearer sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD"
```

**When NEW pending order found (not already notified):**
1. Send email to Anlly:
```bash
cat << 'EOF' | himalaya message send -a coyol
From: coyolcontrol@gmail.com
To: info@nosaraconstruction.com
Subject: 📦 Nueva Orden - [PROJECT_NAME]

Hola Anlly,

[CREATED_BY] acaba de crear una nueva orden de materiales.

Proyecto: [PROJECT_NAME]
Prioridad: [URGENCY]

Revisa los detalles en NC Control:
https://nc-control.vercel.app

Usuario: anlly
Contraseña: admin2026

Gracias!
EOF
```
2. Update order status to 'notified' or track in memory file
3. Notify Marion if urgent

---

### 🏠 Coyol Control — CHECK EVERY HEARTBEAT!
**Account:** coyolcontrol@gmail.com via Himalaya CLI (`-a coyol`)

**Watch for pipeline documents:**
- From Olger (fijoteolab@gmail.com) → Planos
- From Alessia (alessia.aguirre@gmail.com) → Escrituras  
- From Anlly (info@nosaraconstruction.com) → Cartas, admin docs

**When document received:**
1. Download attachment
2. Upload to Google Drive (`rclone copy`)
3. Get share link (`rclone link`)
4. Extract info from PDF (`pdftotext`)
5. Update lot data in JSON
6. Send handoff email to next person
7. Git commit + push
8. Notify Marion if lot reaches "Listo para Venta"

**Check command:**
```bash
himalaya envelope list -a coyol --page-size 10
```

---

### 📧 Meraki Email — CHECK EVERY 30 MINUTES!
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

---

## 📰 La Gaceta Monitor — CHECK DAILY!

**Script:** `bash ~/.openclaw/workspace/scripts/check-la-gaceta.sh`

Monitors Costa Rica's official gazette for mentions of:
- SFERA (legal case)
- Mar Azul (condominium)
- Maryon/Marion Peri
- La Luna Nosara
- ZMT Nosara (concession)
- Case number 26-000076-1632

**If script returns exit code 2 → ALERT MARION IMMEDIATELY!**

Government publishes permit applications, legal notifications, and concession updates in La Gaceta before granting them. Early detection = time to respond.

**Run once daily** (morning is best, new editions publish ~6am).
