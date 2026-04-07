# Meraki Control System — State Document

*Last updated: April 7, 2026*

---

## 📊 Project Overview

| Item | Value |
|------|-------|
| **Location** | `~/.openclaw/workspace/meraki-control/` |
| **Stack** | Astro + Tailwind CSS + Chart.js |
| **Dev Server** | Port 4400 |
| **Production URL** | https://meraki.livingnosara.com |
| **Hosting** | DigitalOcean App Platform (auto-deploys from GitHub) |
| **Auth** | Angelina / masro |
| **First Deploy** | April 5, 2026 |

---

## 💰 Sales Data Loaded

### Q1 2026 (Complete)
| Restaurant | Total | Status |
|------------|-------|--------|
| Coyol | ₡312.7M | ✅ |
| Esh | ₡51.9M | ✅ |
| La Luna | ₡634.6M | ✅ |
| **Q1 Total** | **₡999.2M** | ✅ |

### 2025 Data
| Restaurant | Status | Notes |
|------------|--------|-------|
| La Luna | ✅ 12 months | Complete |
| Esh | ✅ 12 months | Complete |
| Coyol | ⚠️ Annual only | ₡744.9M — NEED monthly breakdown |

### Gastos (Expenses)
| Period | Status |
|--------|--------|
| 2025 (all 3 restaurants) | ✅ Complete |
| 2026 Jan-Apr (all 3 restaurants) | ✅ Complete |

---

## 🏪 Suppliers Database

**Total suppliers: 20**

### Shared Suppliers (Visit All 3 — Need OCR Tag)
These 11 suppliers deliver to multiple restaurants. Invoices need handwritten tag (COYOL/LUNA/ESH):

1. **Distribuidora Isleña** — Food distributor
2. **Priscermat** — Food distributor
3. **Green Solutions** — Cleaning supplies
4. **Guanapollos** — Chicken
5. **Carnes La Anexion** — Beef
6. **Carnes San Martin** — Beef
7. **Licorera Herrera** — Liquor
8. **Belca** — Food distributor
9. **PMT** — Food exporter
10. **Mayca** — Food distributor
11. **Mariscos Paulo** — Seafood

### Other Suppliers in Database
| Supplier | Category | Restaurant |
|----------|----------|------------|
| Frutas Nosara (Rangel) | Produce | Shared |
| Agro Los Cartagos | Produce | Shared |
| Organico Grocer | Organic groceries | Shared |
| Super Nosara | General groceries | Shared |
| Alpiste | Food distributor | Shared |
| Reciclaje Nosara | Waste/Recycling | Shared |
| NCQ Solutions | Services | Unknown |
| Wally Fonseca | Unknown | Unknown |
| Karla Martinez | Unknown | Unknown |

### Supplier Categories
- 🥩 Protein (beef, chicken)
- 🐟 Seafood
- 🥬 Produce
- 📦 Food Distributor
- 🍷 Beverages
- 🛒 Groceries
- 🔧 Services
- 🧹 Supplies (cleaning)

---

## 📧 Invoice Processing Pipeline

### Email Sources
| Email | Purpose | Status |
|-------|---------|--------|
| merakifamilylimitada@gmail.com | Facturas electrónicas | Forwards to marionnosara ✅ |
| merakinosara@gmail.com | Retenciones & commissions | Forwards to marionnosara ✅ |
| familymeraki2022@gmail.com | POS sales reports | Direct sender |

### Invoice Workflow (Planned)
1. **Email arrives** → AgentMail (marion@agentmail.to)
2. **Extract PDF/XML** → Parse with himalaya
3. **OCR scan** → Detect restaurant tag for shared suppliers
4. **Map supplier** → Match cedula to suppliers.json
5. **Store** → Add to invoices.json with restaurant assignment
6. **Dashboard** → Display in Meraki Control

---

## 🎨 Design System

### Restaurant Colors (Land Rover Heritage)
| Restaurant | Color | Hex |
|------------|-------|-----|
| Esh | Sand | #C4A67C |
| Coyol | Keswick Green | #3D4F3D |
| La Luna | Terracotta | #A65D3F |

### Report Themes
| Report | Theme | Notes |
|--------|-------|-------|
| Daily | Light mode | White/cream, clean daytime feel |
| Weekly | Dark + Green | Keswick Green accent, growth vibe |
| Monthly | Dark + Gold | Terracotta/Gold accent, executive feel |

### Logos
- Black on white (inverted)
- Located in `public/images/logos/`

---

## 📋 Dashboard Features (Live)

- ✅ Restaurant summary cards with logos
- ✅ Food vs Drinks pie chart
- ✅ Cash vs Card pie chart
- ✅ Monthly trend bar chart
- ✅ Currency toggle (CRC/USD @ ₡505)
- ✅ Authentication (basic)
- ✅ Responsive design

---

## ⏳ Pending Data

| Data | Source | Status |
|------|--------|--------|
| MDO (labor hours) | Abner | Not started |
| Coyol 2025 monthly | Marion | Requested |
| Retenciones/Comisiones | Bank statements | Not started |
| Payroll data | Abner | Not started |

---

## 🎯 Roadmap

### Phase 1 — Sales Dashboard ✅
- [x] Basic dashboard with sales data
- [x] Restaurant comparison
- [x] Food/Drinks breakdown
- [x] Cash/Card breakdown
- [x] Currency toggle
- [x] Deploy to production

### Phase 2 — Expenses & P&L
- [x] Gastos data structure
- [ ] Expense tracking dashboard
- [ ] P&L calculations
- [ ] Margin analysis

### Phase 3 — Invoice Processing
- [ ] Email ingestion pipeline
- [ ] PDF/XML parsing
- [ ] OCR for restaurant tags
- [ ] Supplier matching
- [ ] Auto-categorization

### Phase 4 — Supplier Management
- [x] Suppliers database
- [ ] Price tracking
- [ ] Invoice history per supplier
- [ ] Price alerts

### Phase 5 — Advanced Analytics
- [ ] YoY comparison
- [ ] Forecasting
- [ ] Anomaly detection
- [ ] Custom reports

---

## 👥 Team Contacts

| Person | Role | Data Provided |
|--------|------|---------------|
| Angelina | Owner | Bank statements, CC commissions |
| Ingrid | Daily closings | Photos of daily sales (all 3) |
| John | Coyol Manager | — |
| Abner | La Luna + Payroll | MDO (labor hours) |
| Silvia | Supplies | Price lists from suppliers |
| Danny | Food ordering | Product/ordering info |
| Anlly Villegas | Admin | Gastos files, invoice management |

---

## 📝 Technical Notes

### Data Files
```
meraki-control/data/
├── sales.json          # Daily sales data
├── suppliers.json      # Supplier database (20 suppliers)
├── invoices.json       # Invoice records (pending)
├── gastos/             # Expense files by restaurant
└── products.json       # Product catalog (pending)
```

### Himalaya Email Config
- Account: marionnosara@gmail.com
- Status: Configured and working

---

*This document tracks the current state of Meraki Control. Update as changes are made.*
