# MEMORY.md — Long-Term Memory

*Last updated: April 7, 2026*

---

## 👤 About Marion (My Human)

- **Name:** Marion Peri
- **Location:** Nosara, Costa Rica (Blue Zone, Nicoya Peninsula)
- **Timezone:** America/Costa_Rica (CST, UTC-6)
- **Email:** marionnosara@gmail.com
- **Telegram:** @MarionPeri (ID: 8733797637)

### Family
- **Wife:** Angelina Peri
  - WhatsApp: +506 8855-9146
  - Role: Administrator of Meraki (restaurant group)
  - Reports: English language, web dashboard preferred

---

## 🍽️ The Family Business

### Meraki — Restaurant Group (Angelina's company)
Three restaurants under unified management:

| Restaurant | Code | Color | Manager |
|------------|------|-------|--------|
| **Esh** | `esh` | Sand #C4A67C | Danny (shared) — smallest operation |
| **Coyol** | `coyol` | Keswick Green #3D4F3D | John |
| **La Luna** | `laluna` | Terracotta #A65D3F | Abner (staff) |

- **Accounting:** One unified bank account for all 3
- **POS:** Manual (no digital system)
- **Invoices:** Factura electrónica (Costa Rica Hacienda system)
- **Control System:** Meraki Control (building now)

### Meraki Team

| Person | Role | Notes |
|--------|------|-------|
| **Angelina** | Owner/Admin | Has bank statements & CC commissions. Not great at routine — ask nicely explaining why you need it |
| **Ingrid** | Daily closings | Photos of yesterday's closings + cash count for ALL 3 locations. If missing → ask Angelina to follow up |
| **John** | Coyol Manager | |
| **Abner** | La Luna Manager | Staff/manpower + payroll for all locations. Provides MDO (labor hours) data |
| **Silvia** | Cleaning & supplies | All locations, based at La Luna |
| **Danny** | Food & ordering | All 3 locations + oversees Esh |
| **Anlly Villegas Chinchilla** | Office/Admin | Handles merakinosara emails, sends gastos files |

### Meraki Reports
- **Daily** @ 8pm → Angelina (vailas78@yahoo.com)
- **Weekly** @ Sunday 7pm → Angelina
- **Monthly** @ 1st of month → Angelina
- **Language:** English only
- **Style:** Premium/slick, investor-presentation quality
  - **Daily:** Light mode (white/cream) — clean, daytime
  - **Weekly:** Dark mode + Keswick Green accent — growth vibe
  - **Monthly:** Dark mode + Terracotta/Gold accent — executive feel
- **Logos:** Black on white (inverted), Land Rover Heritage colors per restaurant
- **Charts:** Yes — but only when they clarify important info, not decoration
  - Bar charts for comparisons
  - Progress bars for targets
  - Trend lines for growth
  - Keep it clear and relevant
- **Design principle:** Make it easy and straightforward — Angelina should understand in 2 seconds, no complex tables

### Coyol Real Estate
Luxury real estate development company:

| Development | Status | KML Data |
|-------------|--------|----------|
| **Nosara Hills** | Active | ✅ 1,379 features |
| **Mar Azul** | Active | ✅ 2,856 features |
| **Los Coyoles** | Coming Soon | ❌ Need KML |

- **Website:** coyolrealestate.com (rebuilding)
- **Style:** Discovery Land Company / Zapotal-inspired
- **Colors:** Land Rover Heritage palette

---

## 🎨 Design Preferences

### Land Rover Heritage Palette
Marion loves the classic Land Rover colors — used for both projects:

| Color | Hex | Use |
|-------|-----|-----|
| Keswick Green | `#3D4F3D` | Primary dark |
| Coniston | `#4A5D4A` | Accent green |
| Limestone | `#D4C9B5` | Light background |
| Alaska White | `#F5F3EF` | Off-white |
| Santorini | `#1A1F16` | Text/dark |
| Sand | `#C4A67C` | Warm accent |
| Terracotta | `#A65D3F` | Alert/highlight |

### Website Style
- Parallax scrolling (Zapotal-style)
- Floating text over fixed backgrounds
- Large serif typography
- Smooth scroll animations
- Mobile-first responsive

---

## 📧 Email Configuration

### AgentMail
- **Inbox:** marion@agentmail.to
- **API Key:** `am_us_e66b9d779b060c4f69330f5c5d46bf0a7ee4b66bd8bc690ee2cc0de584847714`
- **Purpose:** Receive forwarded sales/payment emails, invoices

### Gmail
- **Address:** marionnosara@gmail.com
- **Forwarding:** Setting up auto-forward to marion@agentmail.to

### Meraki Email Accounts

| Email | Purpose | Forwards To |
|-------|---------|-------------|
| merakifamilylimitada@gmail.com | Facturas electrónicas | marionnosara ✅ |
| merakinosara@gmail.com | Retenciones & comisiones (bank/Visa fees) | marionnosara ✅ |
| familymeraki2022@gmail.com | POS sales reports | Direct sender |

---

## 🔧 Active Projects

### 1. Coyol Real Estate Website
- **Location:** `~/.openclaw/workspace/coyol-website/`
- **Stack:** Astro + Tailwind CSS + Cesium 3D
- **Dev Server:** Port 4321
- **Status:** Building 3D map, Mar Azul lots rendering
- **Full state:** See `projects/coyol-website-state.md`
- **Cesium Token:** Configured and working
- **8 architectural renders** added to gallery
- **Source files:** KML, Master Plan PDF, drone photos in Downloads
- **Map focus:** Mar Azul first (40 lots), then Nosara Hills, then Los Coyoles

### 2. Meraki Control System
- **Location:** `~/.openclaw/workspace/meraki-control/`
- **Stack:** Astro + Tailwind CSS + Chart.js
- **Dev Server:** Port 4400
- **Production URL:** https://meraki.livingnosara.com
- **Hosting:** DigitalOcean App Platform (auto-deploys from GitHub)
- **Auth:** Angelina / masro
- **Deployed:** April 5, 2026
- **Full state:** See `projects/meraki-control-state.md`
- **Sales Data:**
  - Q1 2026: ₡999.2M (Coyol ₡312.7M + Esh ₡51.9M + La Luna ₡634.6M)
  - 2025: La Luna & Esh complete, Coyol annual only (₡744.9M)
- **Gastos Data:**
  - 2025: All 3 restaurants (₡971M total)
  - 2026 Jan-Apr: All 3 restaurants (₡366M total)
  - Q1 2026 Gross Margin: 64% (₡639M profit)
- **Suppliers Database:** 20 suppliers loaded
  - 11 shared suppliers (visit all 3 restaurants) — need OCR for invoice tags
  - Categories: protein, seafood, produce, beverages, food-dist, groceries, services, supplies
- **Invoice Pipeline:** Planned (email → parse → OCR → categorize → dashboard)
- **Data Pending:**
  - Pagos (actual payments) — from Anlly/QuickBooks
  - MDO (labor hours) — from Abner
  - Coyol 2025 monthly breakdown — Marion getting it
  - Retenciones/Comisiones (bank card fees)
  - Payroll data for P&L
- **Features Live:**
  - Restaurant summary cards with logos
  - Food vs Drinks pie chart
  - Cash vs Card pie chart
  - Monthly trend bar chart
  - Currency toggle (CRC/USD @ ₡505)

---

## 📝 Preferences & Notes

- Prefers **web dashboards** over WhatsApp for detailed info
- Reports for Angelina in **English**
- Likes **smart Excel/Access** look — clean tables, well-organized
- Costa Rica blocked from Google AI Studio — use OpenRouter for Gemini
- Values **parallel work** — likes multiple projects running simultaneously

---

## 🚫 Things to Remember

- Don't share private info in group chats
- Ask before sending external communications
- `trash` > `rm` for file operations
- Commit changes to workspace after edits

---

*This file is my long-term memory. Update it as I learn more.*
