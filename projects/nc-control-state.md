# NC Control System — Project State

*Last updated: April 14, 2026*

---

## Overview

**NC Control** is a mobile-first construction order management system for Nosara Construction (NC Build & Design).

**URL:** https://nc-control.vercel.app
**Repo:** `~/.openclaw/workspace/nosara-construction/`
**Hosting:** Vercel (project: `nc-control`)

---

## Features Implemented

### Login Page
- 3D concrete logo (logo-3d.jpg) on black background
- Centered username/password fields (white underlines, no boxes)
- White "ENTER" button
- "Private access only" footer
- Professional, matches Coyol Control style

### Dashboard
- Black header with "NC Control" text
- Black NC logo (logo.png) centered
- **+ New Order** — Big black button (primary action)
- **Find Orders** — Search existing orders
- **Order Status** — Pipeline view (Pending → Quoting → Purchased)
- **Projects** — Create/manage projects
- Stats footer: Pending / Quoting / Done counts

### New Order Flow (3 steps)
1. **Select Project** — Big tappable buttons
2. **Upload Material List** — Upload file OR take photo
3. **Confirm & Send** — Choose Normal (24h) or Urgent (ASAP) → Send to Anlly

### Projects Page
- **+ New Project** button
- Create projects with: Name, Client, Location
- Projects stored in localStorage
- Projects appear in New Order selector

### Order Status / Pipeline
- **Pending Review** (amber) — Waiting for approval
- **Getting Quotes** (blue) — Anlly working on quotes
- **Purchased** (green) — Order complete

### Find Orders Page
- Filter tabs: All / Pending / Approved / Quoting / Purchased
- Order cards with status, urgency, project name

---

## User Accounts

| User | Password | Role | Responsibility |
|------|----------|------|----------------|
| marion | nc2026 | Admin | Full access, oversight |
| jorge | ing2026 | Engineer | Reviews/approves material requests |
| anlly | admin2026 | Office | Gets quotes (24h normal, ASAP urgent) |
| milagro | arq2026 | Architect | Project design |

---

## App Icon
- **Black background** with white NC logo
- 550px logo on 512px canvas (fills the icon)
- Shows properly on iPhone homescreen alongside Coyol Control and Meraki Control

---

## Files Structure

```
nosara-construction/
├── public/
│   ├── logo.png          # Black NC logo (for inside pages)
│   ├── logo-3d.jpg       # 3D concrete logo (for login)
│   ├── logo-simple.jpg   # White logo on black (header use)
│   ├── apple-touch-icon.png  # App icon (black bg, white logo)
│   └── ...
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro       # Login page
│   │   ├── dashboard.astro   # Main dashboard
│   │   ├── projects.astro    # Projects CRUD
│   │   ├── orders.astro      # Find orders
│   │   ├── pipeline.astro    # Order status view
│   │   ├── payments.astro    # Payments tracking
│   │   └── orders/
│   │       └── new.astro     # New order flow (3 steps)
│   └── styles/
│       └── global.css
├── docs/
│   ├── welcome-jorge.html/pdf   # Onboarding doc for Jorge
│   ├── welcome-anlly.html/pdf   # Onboarding doc for Anlly
│   ├── qr-nc-control.png        # QR code for app
│   └── logo.png
└── package.json
```

---

## Workflow

### Order Pipeline
1. **Manager/Engineer** creates order (uploads material list photo/file)
2. **Order → Pending** — Waiting for Jorge's review
3. **Jorge approves** → Order moves to Quoting
4. **Anlly gets quotes** (24h for normal, ASAP for urgent)
5. **Winner selected** → Payment created
6. **Purchased** → Order complete

### Urgency Levels
- **Normal** — 24 hours for Anlly to quote
- **Urgent (ASAP)** — Priority, quote immediately

---

## Onboarding

PDFs created for Jorge and Anlly (Spanish):
- NC logo at top
- QR code to scan
- Login credentials
- Role explanation
- Instructions

Files:
- `~/.openclaw/workspace/NC-Control-Jorge.pdf`
- `~/.openclaw/workspace/NC-Control-Anlly.pdf`

---

## Technical Details

- **Stack:** Astro + Tailwind CSS
- **Storage:** localStorage (client-side for now)
- **Auth:** Session-based (sessionStorage)
- **Mobile-first:** Large buttons, touch-friendly
- **PWA-ready:** apple-touch-icon, meta tags for homescreen

---

## Design

### Colors
- **Primary:** Black (#000000, zinc-900)
- **Background:** Light gray (zinc-100)
- **Cards:** White with zinc-200 borders
- **Accents:** 
  - Amber (pending)
  - Blue (quoting)
  - Green (complete)
  - Red (urgent)

### Logo Usage
- **Login page:** 3D concrete logo (logo-3d.jpg)
- **Inside pages:** Black flat logo (logo.png)
- **App icon:** White logo on black background

---

## Next Steps (TODO)

1. **Email notifications** — When order submitted, email Anlly
2. **Backend/database** — Move from localStorage to real DB
3. **Quote upload** — Anlly uploads quotes to orders
4. **Project dashboards** — Per-project view with all orders/docs
5. **Connect to Coyol Control** — Link NC projects to Coyol lots
6. **Payment tracking** — Full payment workflow

---

## Team Contacts

| Name | Role | Contact |
|------|------|---------|
| Marion Peri | Admin | marionnosara@gmail.com |
| Jorge Delgado | Engineer | fijoteolab@gmail.com |
| Anlly Villegas | Office | info@nosaraconstruction.com |
| Milagro Castro | Architect | — |

---

*This file tracks the NC Control system state. Update after major changes.*
