# Coyol System Architecture & Technical Inventory

**Document Version:** 1.0  
**Generated:** September 18, 2026  
**Classification:** Internal Technical Documentation  
**Author:** OpenClaw AI Assistant  

> ⚠️ **Security Notice:** This document intentionally omits all passwords, API keys, tokens, and secrets. Credential storage locations are noted instead.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Project Inventory](#3-project-inventory)
4. [Infrastructure](#4-infrastructure)
5. [Databases](#5-databases)
6. [Meraki Reservation System (Complete Lifecycle)](#6-meraki-reservation-system)
7. [Deployment Processes](#7-deployment-processes)
8. [Telegram Services](#8-telegram-services)
9. [Automation & Scheduling](#9-automation--scheduling)
10. [Third-Party Dependencies](#10-third-party-dependencies)
11. [Security Architecture](#11-security-architecture)
12. [Technical Debt & Known Issues](#12-technical-debt--known-issues)
13. [YAML Inventory](#13-yaml-inventory)

---

## 1. Executive Summary

### Business Context
This infrastructure supports two primary business lines for Marion Peri in Nosara, Costa Rica:

1. **Coyol Real Estate** — Luxury real estate development (Mar Azul, Nosara Hills, Los Coyoles)
2. **Meraki Restaurant Group** — Three restaurants (La Luna, Coyol, Esh) managed by Angelina Peri

### Technology Stack Summary
- **Frontend Framework:** Astro 4.x with Tailwind CSS
- **Backend:** Astro serverless functions (Vercel Edge)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Hosting:** Vercel (primary), DigitalOcean App Platform (Meraki Control)
- **AI/Automation:** OpenClaw (Claude Opus 4.5)
- **Email:** Gmail (via Himalaya CLI), macOS Mail.app
- **Messaging:** Telegram bots

### Key Metrics
- **Active Production Systems:** 4
- **Supabase Tables:** 18+
- **Cron Jobs:** 7 (3 system, 4 OpenClaw)
- **Telegram Bots:** 3
- **Total Lines of Code:** ~50,000+ (estimated)

---

## 2. System Architecture Overview

### Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL USERS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Website Visitors    Restaurant Staff    Real Estate Clients    Marion/Team │
│        │                   │                    │                    │      │
│        ▼                   ▼                    ▼                    ▼      │
├─────────────────────────────────────────────────────────────────────────────┤
│                           FRONTEND LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  coyolnosara.com │  │ meraki.living    │  │  Client Portals  │          │
│  │  (Vercel)        │  │ nosara.com       │  │  /portal/[name]  │          │
│  │                  │  │ (DO App Platform)│  │  (Vercel)        │          │
│  │  • Homepage      │  │                  │  │                  │          │
│  │  • Property list │  │  • Sales dash    │  │  • Const. photos │          │
│  │  • Reservations  │  │  • Expense track │  │  • Documents     │          │
│  │  • Gift cards    │  │  • Reports       │  │  • Milestones    │          │
│  │  • Offer gen     │  │                  │  │                  │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                     │                     │
│           ▼                     ▼                     ▼                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                            API LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    /api/* (Vercel Serverless Functions)               │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │  RESERVATIONS           REAL ESTATE           OPERATIONS              │   │
│  │  ├─ laluna-reservations ├─ generate-offer     ├─ gift-cards          │   │
│  │  ├─ coyol-reservations  ├─ house-models       ├─ crm-leads           │   │
│  │  ├─ send-confirmation   ├─ crm-stats          ├─ chat-support        │   │
│  │  ├─ send-reminders      ├─ plausible          ├─ ocr-meter           │   │
│  │  └─ blocked-dates       └─ ql-campaigns       ├─ stripe-webhook      │   │
│  │                                               └─ contact             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
│                                     ▼                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                          DATABASE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │              SUPABASE (PostgreSQL) - mnxjzvqgrrodalcmtntf            │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │  RESTAURANT TABLES          REAL ESTATE TABLES     SHARED TABLES     │   │
│  │  ├─ laluna_reservations     ├─ mar_azul_leads      ├─ chat_logs      │   │
│  │  ├─ laluna_guests           ├─ mar_azul_lots       ├─ crm_guests     │   │
│  │  ├─ laluna_gift_cards       ├─ house_models        └─ blocked_dates  │   │
│  │  ├─ laluna_shifts           ├─ generated_offers                      │   │
│  │  ├─ coyol_reservations      ├─ client_portals                        │   │
│  │  ├─ coyol_guests            └─ ql_campaigns                          │   │
│  │  ├─ coyol_gift_cards                                                 │   │
│  │  ├─ coyol_shifts                                                     │   │
│  │  └─ restaurant_settings                                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                        EXTERNAL SERVICES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Stripe   │  │  Telegram  │  │   Gmail    │  │  Plausible │            │
│  │  Payments  │  │    Bots    │  │ (Himalaya) │  │  Analytics │            │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                        LOCAL INFRASTRUCTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                  MacBook Pro (Marion's Machine)                       │   │
│  │                       192.168.110.42                                  │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │  OPENCLAW GATEWAY        CRON JOBS              TELEGRAM BOTS        │   │
│  │  └─ Port 18789           ├─ sync-leads.py       ├─ Marion Bot        │   │
│  │                          ├─ check-reservations  ├─ Angelina Bot      │   │
│  │  EMAIL ACCESS            ├─ send-reminders.mjs  └─ Ruth Bot          │   │
│  │  └─ Himalaya IMAP        └─ OpenClaw cron jobs                       │   │
│  │                                                                       │   │
│  │  WORKSPACE: ~/.openclaw/workspace                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Communication Flows

1. **Website → Supabase:** Direct REST API calls with publishable key
2. **Admin Panels → API → Supabase:** Routed through serverless functions for validation
3. **OpenClaw → Everything:** Full system access via exec, web tools, and direct API
4. **Cron → Scripts → Supabase:** Scheduled data sync and notifications
5. **Telegram → OpenClaw Gateway → AI:** Message processing and automation

---

## 3. Project Inventory

### 3.1 coyol-website (PRIMARY)

**Purpose:** Main website for Coyol Real Estate + La Luna & Coyol restaurant reservation systems

| Property | Value |
|----------|-------|
| **Absolute Path** | `/Users/Coyol/.openclaw/workspace/coyol-website` |
| **Git Remote** | `https://github.com/Meraki-Nosara/coyol-website.git` |
| **Branch** | `main` |
| **Framework** | Astro 4.x |
| **Language** | TypeScript |
| **Package Manager** | npm |
| **Node Version** | >=22.12.0 |
| **Deployment** | Vercel |
| **Production URL** | https://coyolnosara.com |
| **Vercel Project ID** | `prj_8qi5YhSWvrVu6l1J5KS1maDCnlMA` |

**Key Directories:**
```
coyol-website/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Homepage
│   │   ├── homesites/               # Property listings
│   │   │   ├── casa-cacao.astro
│   │   │   ├── casa-espavel.astro   # NEW (Sept 2026)
│   │   │   └── [id].astro           # Dynamic property pages
│   │   ├── laluna/
│   │   │   └── admin/index.astro    # La Luna reservation admin (v2.6)
│   │   ├── restaurant/
│   │   │   └── admin/index.astro    # Coyol reservation admin (v2.8)
│   │   ├── portal/
│   │   │   └── [client].astro       # Dynamic client portals
│   │   ├── command/
│   │   │   └── offers/              # Offer generator
│   │   ├── proposals/
│   │   │   └── [slug].astro         # Generated offers display
│   │   └── api/                     # API endpoints
│   ├── components/                  # Reusable UI components
│   ├── layouts/                     # Page layouts
│   └── lib/
│       └── supabase.ts              # Supabase client
├── public/
│   └── images/                      # Static assets
├── package.json
├── astro.config.mjs
└── tailwind.config.mjs
```

**Entry Points:**
- `src/pages/index.astro` — Homepage
- `src/pages/laluna/admin/index.astro` — La Luna reservation system
- `src/pages/restaurant/admin/index.astro` — Coyol reservation system

**Configuration Files:**
- `astro.config.mjs` — Astro configuration
- `tailwind.config.mjs` — Tailwind CSS configuration
- `.vercel/project.json` — Vercel project binding

---

### 3.2 meraki-control

**Purpose:** Financial dashboard for Meraki restaurant group (Angelina's admin panel)

| Property | Value |
|----------|-------|
| **Absolute Path** | `/Users/Coyol/.openclaw/workspace/meraki-control` |
| **Git Remote** | `https://github.com/Meraki-Nosara/coyol-website.git` (shared) |
| **Branch** | `main` |
| **Framework** | Astro 4.x |
| **Language** | TypeScript |
| **Package Manager** | npm |
| **Deployment** | DigitalOcean App Platform |
| **Production URL** | https://meraki.livingnosara.com |
| **Vercel Project ID** | `prj_lIR3Yb8J2BxtTvTv1kHFyTi4QT2g` |
| **Auth** | Username: `Angelina`, Password: stored in `.env` |

**Key Directories:**
```
meraki-control/
├── src/
│   ├── pages/
│   │   └── index.astro              # Main dashboard
│   └── components/
├── data/
│   ├── sales.json                   # Daily sales data (all 3 restaurants)
│   ├── invoices.json                # Parsed supplier invoices
│   └── suppliers.json               # Supplier database
└── package.json
```

**Data Files:**
- `data/sales.json` — Primary sales database (updated via OCR/manual)
- `data/invoices.json` — Parsed factura electrónica data

---

### 3.3 coyol-control

**Purpose:** Internal admin panel for Coyol Real Estate operations

| Property | Value |
|----------|-------|
| **Absolute Path** | `/Users/Coyol/.openclaw/workspace/coyol-control` |
| **Git Remote** | `https://github.com/Meraki-Nosara/coyol-control.git` |
| **Branch** | `main` |
| **Framework** | Astro 4.x |
| **Language** | TypeScript |
| **Package Manager** | npm |
| **Deployment** | Vercel |
| **Vercel Project ID** | `prj_bqN3L21Uc0kBxTJDudUYxpe3xc3e` |

**Key Features:**
- Client portal management
- Lead tracking
- Task/milestone tracking
- Document management

---

### 3.4 laluna-website

**Purpose:** La Luna restaurant public website (separate from reservation system)

| Property | Value |
|----------|-------|
| **Absolute Path** | `/Users/Coyol/.openclaw/workspace/laluna-website` |
| **Git Remote** | `https://github.com/Meraki-Nosara/laluna-website.git` |
| **Branch** | `main` |
| **Framework** | Astro 4.x |
| **Status** | Active but secondary |

---

### 3.5 Other Projects (Inactive/Secondary)

| Project | Path | Status | Notes |
|---------|------|--------|-------|
| `mibachutz-app` | `~/.openclaw/workspace/mibachutz-app` | Inactive | Hebrew real estate app |
| `mar-azul-admin` | `~/.openclaw/workspace/mar-azul-admin` | Inactive | Legacy admin |
| `mar-azul-legal` | `~/.openclaw/workspace/mar-azul-legal` | Archive | Legal documents |
| `nosara-construction` | `~/.openclaw/workspace/nosara-construction` | Inactive | Construction tracking |
| `nosara-go` | `~/.openclaw/workspace/nosara-go` | Inactive | Nosara guide app |
| `coyol-farmhouse` | `~/.openclaw/workspace/coyol-farmhouse` | Archive | Property microsite |
| `coyol-portal` | `~/.openclaw/workspace/coyol-portal` | Deprecated | Replaced by dynamic portals |

---

## 4. Infrastructure

### 4.1 Hosting & Servers

#### Vercel (Primary)

| Project | URL | Environment |
|---------|-----|-------------|
| coyol-nosara | https://coyolnosara.com | Production |
| coyol-control | https://coyol-control.vercel.app | Production |

**Vercel Configuration:**
- **Organization ID:** `team_KNfaY3gBftPiYIndz0oGZHUy`
- **Node Runtime:** 22.x
- **Serverless Region:** iad1 (Washington DC)
- **Build Command:** `astro build`
- **Output Directory:** `dist/`

#### DigitalOcean App Platform

| Project | URL | Environment |
|---------|-----|-------------|
| meraki-control | https://meraki.livingnosara.com | Production |

**DO Configuration:**
- Auto-deploys from GitHub
- Basic auth enabled

#### Local Machine (Marion's MacBook Pro)

| Component | Details |
|-----------|---------|
| **OS** | macOS (Darwin 25.5.0) |
| **Architecture** | arm64 (Apple Silicon) |
| **Local IP** | 192.168.110.42 (DHCP) |
| **OpenClaw Gateway** | Port 18789 (loopback) |
| **Node.js** | v22.22.2 |

### 4.2 Domains

| Domain | Registrar | DNS | SSL | Points To |
|--------|-----------|-----|-----|-----------|
| coyolnosara.com | GoDaddy | Vercel | Auto | Vercel |
| coyolrealestate.com | GoDaddy | GoDaddy | Auto | Vercel |
| livingnosara.com | GoDaddy | GoDaddy | Auto | DO App Platform |

### 4.3 Development Servers

| Project | Port | URL |
|---------|------|-----|
| coyol-website | 4321 | http://localhost:4321 |
| meraki-control | 4400 | http://localhost:4400 |

---

## 5. Databases

### 5.1 Supabase (Primary Database)

| Property | Value |
|----------|-------|
| **Project ID** | `mnxjzvqgrrodalcmtntf` |
| **URL** | https://mnxjzvqgrrodalcmtntf.supabase.co |
| **Region** | AWS (inferred) |
| **Engine** | PostgreSQL |
| **Connection** | REST API (PostgREST) |
| **Auth** | API Key (publishable) |

**API Key Storage:**
- Publishable key: Hardcoded in frontend code (safe for read operations)
- Secret key: NOT in codebase (admin-only access)

### 5.2 Table Inventory

#### Restaurant Operations

| Table | Purpose | Primary Users | Row Estimate |
|-------|---------|---------------|--------------|
| `laluna_reservations` | La Luna bookings | laluna/admin | ~5,000 |
| `laluna_guests` | Guest CRM for La Luna | laluna/admin | ~3,000 |
| `laluna_gift_cards` | Gift card purchases | Stripe webhook | ~200 |
| `laluna_shifts` | Staff scheduling | Admin | ~100 |
| `coyol_reservations` | Coyol bookings | restaurant/admin | ~3,000 |
| `coyol_guests` | Guest CRM for Coyol | restaurant/admin | ~2,000 |
| `coyol_gift_cards` | Gift card purchases | Stripe webhook | ~100 |
| `coyol_shifts` | Staff scheduling | Admin | ~50 |
| `restaurant_settings` | Config (hours, etc.) | Admin | 2 |
| `blocked_dates` | Holiday closures | Admin | ~20 |

#### Real Estate Operations

| Table | Purpose | Primary Users | Row Estimate |
|-------|---------|---------------|--------------|
| `mar_azul_leads` | CRM leads | Offer generator, coyol-control | ~500 |
| `mar_azul_lots` | Lot inventory | Offer generator | ~50 |
| `house_models` | Home designs | Offer generator | 15 |
| `generated_offers` | Saved proposals | Offer generator | ~100 |
| `client_portals` | Portal config | coyol-control | ~10 |
| `ql_campaigns` | Marketing campaigns | Campaign manager | ~50 |

#### Shared

| Table | Purpose | Primary Users |
|-------|---------|---------------|
| `chat_logs` | Support chat history | Chat support API |
| `crm_guests` | Combined guest database | CRM sync |

### 5.3 Schema Location

- **Schema Definitions:** Not versioned (Supabase GUI managed)
- **Migrations:** None (schema changes via Supabase dashboard)
- **Backups:** Automatic Supabase backups (7-day retention on free tier)

### 5.4 Connection Details

```typescript
// Connection Pattern (from src/lib/supabase.ts)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const supabaseKey = 'sb_publishable_...'; // Publishable key OK for frontend
export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## 6. Meraki Reservation System

### 6.1 Complete Reservation Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RESERVATION LIFECYCLE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PHASE 1: CUSTOMER DISCOVERY                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Customer finds restaurant via:                                   │    │
│  │  • Google Search → coyolnosara.com/laluna or /coyol             │    │
│  │  • Instagram link                                                │    │
│  │  • Word of mouth                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  PHASE 2: AVAILABILITY CHECK                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Customer selects:                                                │    │
│  │  • Date (calendar widget)                                        │    │
│  │  • Time slot                                                     │    │
│  │  • Party size                                                    │    │
│  │                                                                  │    │
│  │ System checks:                                                   │    │
│  │  1. GET /api/blocked-dates?restaurant=laluna                    │    │
│  │     → Returns dates restaurant is closed                         │    │
│  │  2. GET /api/laluna-reservations?date=YYYY-MM-DD                │    │
│  │     → Returns existing bookings for capacity check               │    │
│  │  3. Client-side: calculates remaining capacity per slot          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  PHASE 3: BOOKING SUBMISSION                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Customer submits form with:                                      │    │
│  │  • Name, Email, Phone                                            │    │
│  │  • Special requests (dietary, occasion, etc.)                    │    │
│  │                                                                  │    │
│  │ POST /api/laluna-reservations                                   │    │
│  │ Body: { date, time, guests, guest_name, guest_phone, ... }      │    │
│  │                                                                  │    │
│  │ API performs:                                                    │    │
│  │  1. Conflict validation (90-120 min window)                     │    │
│  │  2. Auto table assignment (if not specified)                    │    │
│  │  3. Insert to laluna_reservations                               │    │
│  │  4. Upsert to laluna_guests (CRM)                               │    │
│  │                                                                  │    │
│  │ Returns: { id, status: 'confirmed', table_id, ... }             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  PHASE 4: CONFIRMATION                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Immediate:                                                       │    │
│  │  • Customer sees confirmation page                               │    │
│  │  • Email sent via /api/send-confirmation                        │    │
│  │    → Uses macOS Mail.app or SMTP                                │    │
│  │                                                                  │    │
│  │ Same-day (if applicable):                                        │    │
│  │  • WhatsApp reminder at 2pm (cron: send-daily-reminders)        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  PHASE 5: RESTAURANT OPERATIONS                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Admin Panel (laluna/admin or restaurant/admin):                  │    │
│  │                                                                  │    │
│  │  VIEW: Floor plan shows tables with reservations                 │    │
│  │  MANAGE: Drag-drop table assignment                             │    │
│  │  UPDATE: Change status (confirmed → seated → completed)         │    │
│  │                                                                  │    │
│  │ Table conflict validation:                                       │    │
│  │  • PATCH /api/laluna-reservations?id=UUID                       │    │
│  │  • checkTableTimeConflict() prevents double-booking             │    │
│  │  • 2-hour window for La Luna, 90-min for Coyol                  │    │
│  │                                                                  │    │
│  │ Walk-ins:                                                        │    │
│  │  • Created directly in admin panel                              │    │
│  │  • Same API validation applies                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  PHASE 6: POST-SERVICE                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Status updated to 'completed' or 'no-show'                       │    │
│  │ Guest record updated with visit count                            │    │
│  │ Data available for:                                              │    │
│  │  • CRM campaigns (ql_campaigns)                                  │    │
│  │  • Analytics (reservation counts, popular times)                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Key Modules

#### API Endpoints (coyol-website/src/pages/api/)

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `laluna-reservations.ts` | GET, POST, PATCH, DELETE | La Luna CRUD + validation |
| `coyol-reservations.ts` | GET, POST, PATCH, DELETE | Coyol CRUD + validation |
| `send-confirmation.ts` | POST | Email confirmations |
| `send-reminders.ts` | POST | Batch reminder dispatch |
| `blocked-dates.ts` | GET, POST, DELETE | Holiday management |
| `gift-cards.ts` | GET, POST | Gift card management |
| `stripe-webhook.ts` | POST | Payment processing |

#### Admin Panels

| Panel | Path | Version | Features |
|-------|------|---------|----------|
| La Luna | `/laluna/admin` | v2.6 | Floor plan, multi-table, conflict detection |
| Coyol | `/restaurant/admin` | v2.8 | Floor plan, multi-table, conflict detection |

#### Database Tables

```sql
-- Core reservation table structure (both restaurants identical)
laluna_reservations / coyol_reservations:
  id UUID PRIMARY KEY
  date DATE NOT NULL
  time TIME NOT NULL
  guests INTEGER NOT NULL
  guest_name TEXT NOT NULL
  guest_phone TEXT
  guest_email TEXT
  table_id TEXT                    -- Comma-separated for multi-table
  zone_preference TEXT
  special_requests TEXT
  status TEXT DEFAULT 'confirmed'  -- confirmed/seated/completed/cancelled/no-show
  created_at TIMESTAMP
  updated_at TIMESTAMP

-- Guest CRM
laluna_guests / coyol_guests:
  id UUID PRIMARY KEY
  phone TEXT UNIQUE
  name TEXT
  email TEXT
  visit_count INTEGER DEFAULT 0
  last_visit DATE
  notes TEXT
  created_at TIMESTAMP
```

### 6.3 Conflict Detection Algorithm

```typescript
// From laluna-reservations.ts (same logic in coyol-reservations.ts)

function checkTableTimeConflict(
  tableId: string,       // Comma-separated table IDs
  date: string,
  time: string,
  existingReservations: any[]
): { hasConflict: boolean; conflictWith?: any; conflictingTable?: string } {
  
  const resMinutes = parseTime(time);
  const tablesToCheck = getBlockedTables(tableId);  // Handles comma-separated
  
  for (const r of existingReservations) {
    if (r.status === 'cancelled' || r.status === 'no-show') continue;
    
    const reservationBlockedTables = getBlockedTables(r.table_id || '');
    const hasTableOverlap = tablesToCheck.some(t => reservationBlockedTables.includes(t));
    if (!hasTableOverlap) continue;
    
    const rMinutes = parseTime(r.time);
    const conflictWindow = 120; // 2 hours for La Luna, 90 for Coyol
    
    if (Math.abs(rMinutes - resMinutes) < conflictWindow) {
      return { hasConflict: true, conflictWith: r, conflictingTable: r.table_id };
    }
  }
  
  return { hasConflict: false };
}
```

### 6.4 External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Stripe** | Gift card payments | Webhook → creates gift_card record |
| **Gmail** | Confirmation emails | Himalaya CLI (IMAP/SMTP) |
| **WhatsApp** | Reminders | Manual or via reminder script |

---

## 7. Deployment Processes

### 7.1 Vercel Deployments (coyol-website, coyol-control)

**Standard Deployment:**
```bash
cd ~/.openclaw/workspace/coyol-website
git add -A
git commit -m "Description"
npx vercel --prod --yes
```

**Build Process:**
1. Vercel detects Astro framework
2. Runs `npm install`
3. Runs `astro build`
4. Deploys serverless functions to edge
5. Deploys static assets to CDN
6. Updates production alias

**Preview Deployments:**
- Every push to non-main branch creates preview URL
- Pattern: `https://coyol-nosara-{hash}-coyol-realestate.vercel.app`

**Rollback:**
```bash
npx vercel rollback [deployment-url]
```

### 7.2 DigitalOcean (meraki-control)

**Deployment:**
- Auto-deploys on push to `main` branch
- GitHub integration configured

**Manual Redeploy:**
- Via DigitalOcean dashboard → App Platform → Redeploy

### 7.3 Environment Variables

**Vercel:**
- Set via Vercel dashboard or `vercel env` CLI
- Stored in Vercel's secure vault
- Available to serverless functions as `process.env`

**Key Variables (names only):**
- `SUPABASE_URL`
- `SUPABASE_KEY` (publishable)
- `SUPABASE_SERVICE_KEY` (secret, if used)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

## 8. Telegram Services

### 8.1 Bot Inventory

| Bot | Handle | Purpose | Token Storage |
|-----|--------|---------|---------------|
| Marion Bot | @[default] | Primary assistant | ~/.openclaw/openclaw.json |
| Angelina Bot | @angibot | Restaurant notifications | ~/.openclaw/openclaw.json |
| Ruth Bot | @rubtbot | Real estate assistant | ~/.openclaw/openclaw.json |

### 8.2 Configuration

```json
// From ~/.openclaw/openclaw.json
{
  "channels": {
    "telegram": {
      "accounts": {
        "default": {
          "botToken": "[REDACTED]",
          "groupAllowFrom": ["8733797637"]  // Marion's Telegram ID
        },
        "angibot": {
          "botToken": "[REDACTED]",
          "enabled": true,
          "name": "Angelina Bot"
        },
        "rubtbot": {
          "botToken": "[REDACTED]",
          "enabled": true,
          "name": "Rubt Bot"
        }
      },
      "enabled": true
    }
  }
}
```

### 8.3 Message Flow

```
Telegram User → Telegram API → OpenClaw Gateway (port 18789) → Claude Opus → Response
```

**Polling Mode:** Long polling (not webhooks)
**Message Handling:** OpenClaw processes all incoming messages through AI

---

## 9. Automation & Scheduling

### 9.1 System Crontab

```crontab
# Sync leads from external sources (Sundays 6am)
0 6 * * 0 /usr/bin/python3 /Users/Coyol/.openclaw/workspace/scripts/sync-leads.py

# CRM reservation sync (every 15 minutes)
*/15 * * * * cd /Users/Coyol/.openclaw/workspace/meraki-crm && /usr/bin/python3 check-reservations.py

# Daily reservation reminders (2pm Costa Rica)
0 14 * * * /opt/homebrew/bin/node /Users/Coyol/.openclaw/workspace/scripts/send-daily-reminders.mjs
```

### 9.2 OpenClaw Cron Jobs

```json
// From ~/.openclaw/cron.json
[
  {
    "id": "meraki-daily-report",
    "cron": "0 20 * * *",
    "tz": "America/Costa_Rica",
    "enabled": true,
    "description": "Daily sales report to Angelina at 8pm"
  },
  {
    "id": "meraki-weekly-report",
    "cron": "0 19 * * 0",
    "tz": "America/Costa_Rica",
    "enabled": true,
    "description": "Weekly summary on Sunday 7pm"
  },
  {
    "id": "meraki-monthly-report",
    "cron": "0 10 1 * *",
    "tz": "America/Costa_Rica",
    "enabled": true,
    "description": "Monthly report on 1st at 10am"
  },
  {
    "id": "meraki-morning-check",
    "cron": "0 8 * * *",
    "tz": "America/Costa_Rica",
    "enabled": true,
    "description": "Morning email check, OCR cierres, parse facturas"
  }
]
```

### 9.3 Heartbeat System

**File:** `~/.openclaw/workspace/HEARTBEAT.md`
**Status:** DISABLED (as of Sept 2026)

**When Enabled:**
- OpenClaw polls every 3-4 hours
- Checks for tasks in HEARTBEAT.md
- Performs email checks, calendar scans, etc.

### 9.4 Memory System

**Daily Logs:** `~/.openclaw/workspace/memory/YYYY-MM-DD.md`
**Long-term:** `~/.openclaw/workspace/MEMORY.md`
**State Files:**
- `memory/heartbeat-state.json` — Last check timestamps
- `memory/crm-last-check.json` — CRM sync state
- `memory/reservations-sent.json` — Sent confirmation tracking

---

## 10. Third-Party Dependencies

### 10.1 NPM Packages (Key Dependencies)

| Package | Version | Used By | Purpose |
|---------|---------|---------|---------|
| astro | 4.x | All projects | Framework |
| @astrojs/vercel | latest | All projects | Vercel adapter |
| tailwindcss | 3.x | All projects | CSS framework |
| @supabase/supabase-js | latest | All projects | Database client |
| stripe | latest | coyol-website | Payments |
| chart.js | latest | meraki-control | Charts |
| qrcode | latest | coyol-website | QR generation |

### 10.2 External Services

| Service | Purpose | Systems Using | Auth Storage |
|---------|---------|---------------|--------------|
| Supabase | Database | All | Hardcoded (publishable key) |
| Vercel | Hosting | coyol-website, coyol-control | ~/.vercel/auth.json |
| Stripe | Payments | coyol-website | Vercel env vars |
| GitHub | Version control | All | ~/.gitconfig, SSH keys |
| Telegram | Messaging | OpenClaw | ~/.openclaw/openclaw.json |
| Gmail | Email | Scripts, reports | ~/.himalaya/config.toml |
| Plausible | Analytics | coyol-website | API key in code |

### 10.3 System Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.22.2 | JavaScript runtime |
| npm | 10.x | Package manager |
| Python | 3.x | Scripts |
| Himalaya | latest | Email CLI |
| ImageMagick | 7.1.2 | Image processing |
| Git | 2.x | Version control |

---

## 11. Security Architecture

### 11.1 Access Levels

| Component | Production Access | DB Write | Deploy | Server | DNS |
|-----------|------------------|----------|--------|--------|-----|
| coyol-website | ✅ | ✅ (via API) | ✅ | ❌ | ❌ |
| coyol-control | ✅ | ✅ | ✅ | ❌ | ❌ |
| meraki-control | ✅ | ❌ (read only) | ✅ | ❌ | ❌ |
| OpenClaw | ✅ | ✅ | ✅ | ✅ (local) | ❌ |
| Admin panels | ✅ | ✅ | ❌ | ❌ | ❌ |

### 11.2 Credential Storage

| Credential Type | Storage Location | Access Method |
|-----------------|------------------|---------------|
| Supabase API Key (pub) | Hardcoded in source | Direct use |
| Supabase Service Key | Vercel env vars | process.env |
| Stripe Keys | Vercel env vars | process.env |
| Telegram Tokens | ~/.openclaw/openclaw.json | Config file |
| GitHub Token | ~/.gitconfig or SSH | Git operations |
| Gmail/Himalaya | ~/.himalaya/config.toml | Himalaya CLI |
| Vercel Token | ~/.vercel/auth.json | Vercel CLI |

### 11.3 API Security

| API | Auth Method | Rate Limiting |
|-----|-------------|---------------|
| Supabase REST | API Key header | Supabase-managed |
| Vercel Functions | None (public) | Vercel-managed |
| Stripe Webhook | Signature verification | Stripe-managed |
| Admin Panels | Session-based (basic) | None |

### 11.4 Known Security Concerns

1. **Publishable Supabase key in frontend** — Standard practice but allows read access
2. **Admin panels lack strong auth** — Basic auth only on meraki-control
3. **No WAF** — Relies on Vercel/Supabase protections
4. **API endpoints publicly accessible** — Input validation critical

---

## 12. Technical Debt & Known Issues

### 12.1 Bugs

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| None currently tracked | — | — | — |

### 12.2 Fragile Components

| Component | Risk | Mitigation Needed |
|-----------|------|-------------------|
| sales.json manual updates | Data loss if file corrupted | Automated backups |
| OCR cierre parsing | Unreliable with poor photos | Error handling, manual fallback |
| Gmail polling | Himalaya auth can expire | Re-auth process documented |

### 12.3 Temporary Fixes

| Fix | Location | Proper Solution |
|-----|----------|-----------------|
| Hardcoded Supabase key | Various | Environment variables |
| Combined tables disabled | Reservation APIs | Re-implement with proper UI |

### 12.4 Unfinished Work

| Feature | Status | Priority |
|---------|--------|----------|
| Email automation for facturas | 80% | Medium |
| MDO (labor hours) integration | Not started | Low |
| Coyol 2025 monthly breakdown | Waiting on data | Medium |
| Gift card automation tests | Pending | Low |

### 12.5 Undocumented Dependencies

| Dependency | Used By | Documentation |
|------------|---------|---------------|
| macOS Mail.app | Report sending | None (AppleScript) |
| Local timezone (CST) | Cron jobs | Assumed |
| WiFi connectivity | All operations | No offline mode |

---

## 13. YAML Inventory

```yaml
# Coyol System Inventory
# Generated: 2026-09-18
# Version: 1.0

metadata:
  owner: Marion Peri
  location: Nosara, Costa Rica
  timezone: America/Costa_Rica
  primary_contact: marionnosara@gmail.com

projects:
  coyol-website:
    type: web-application
    path: /Users/Coyol/.openclaw/workspace/coyol-website
    git:
      remote: https://github.com/Meraki-Nosara/coyol-website.git
      branch: main
    technology:
      framework: astro
      version: "4.x"
      language: typescript
      package_manager: npm
      node_version: ">=22.12.0"
    deployment:
      platform: vercel
      project_id: prj_8qi5YhSWvrVu6l1J5KS1maDCnlMA
      production_url: https://coyolnosara.com
    features:
      - real-estate-website
      - laluna-reservation-admin
      - coyol-reservation-admin
      - offer-generator
      - client-portals
      - gift-cards
    dependencies:
      databases:
        - supabase
      services:
        - stripe
        - plausible
    status: production

  meraki-control:
    type: web-application
    path: /Users/Coyol/.openclaw/workspace/meraki-control
    git:
      remote: https://github.com/Meraki-Nosara/coyol-website.git
      branch: main
    technology:
      framework: astro
      version: "4.x"
      language: typescript
      package_manager: npm
    deployment:
      platform: digitalocean-app-platform
      production_url: https://meraki.livingnosara.com
    features:
      - sales-dashboard
      - expense-tracking
      - supplier-management
    dependencies:
      data_files:
        - data/sales.json
        - data/invoices.json
    status: production

  coyol-control:
    type: web-application
    path: /Users/Coyol/.openclaw/workspace/coyol-control
    git:
      remote: https://github.com/Meraki-Nosara/coyol-control.git
      branch: main
    technology:
      framework: astro
      version: "4.x"
      language: typescript
      package_manager: npm
    deployment:
      platform: vercel
      project_id: prj_bqN3L21Uc0kBxTJDudUYxpe3xc3e
    features:
      - client-portal-management
      - lead-tracking
      - task-milestones
    dependencies:
      databases:
        - supabase
    status: production

  laluna-website:
    type: web-application
    path: /Users/Coyol/.openclaw/workspace/laluna-website
    git:
      remote: https://github.com/Meraki-Nosara/laluna-website.git
      branch: main
    technology:
      framework: astro
      version: "4.x"
    status: active-secondary

databases:
  supabase:
    project_id: mnxjzvqgrrodalcmtntf
    url: https://mnxjzvqgrrodalcmtntf.supabase.co
    engine: postgresql
    connection_method: rest-api
    credential_storage: hardcoded-publishable-key
    tables:
      restaurant:
        - laluna_reservations
        - laluna_guests
        - laluna_gift_cards
        - laluna_shifts
        - coyol_reservations
        - coyol_guests
        - coyol_gift_cards
        - coyol_shifts
        - restaurant_settings
        - blocked_dates
      real_estate:
        - mar_azul_leads
        - mar_azul_lots
        - house_models
        - generated_offers
        - client_portals
        - ql_campaigns
      shared:
        - chat_logs
        - crm_guests

infrastructure:
  hosting:
    vercel:
      organization: team_KNfaY3gBftPiYIndz0oGZHUy
      projects:
        - coyol-nosara
        - coyol-control
    digitalocean:
      app_platform:
        - meraki-control

  local:
    machine: macbook-pro
    os: darwin-25.5.0
    arch: arm64
    ip: 192.168.110.42
    openclaw_port: 18789

  domains:
    - domain: coyolnosara.com
      registrar: godaddy
      dns: vercel
      target: vercel
    - domain: livingnosara.com
      registrar: godaddy
      dns: godaddy
      target: digitalocean

automation:
  system_cron:
    - name: sync-leads
      schedule: "0 6 * * 0"
      script: /Users/Coyol/.openclaw/workspace/scripts/sync-leads.py
    - name: check-reservations
      schedule: "*/15 * * * *"
      script: /Users/Coyol/.openclaw/workspace/meraki-crm/check-reservations.py
    - name: send-daily-reminders
      schedule: "0 14 * * *"
      script: /Users/Coyol/.openclaw/workspace/scripts/send-daily-reminders.mjs

  openclaw_cron:
    - id: meraki-daily-report
      schedule: "0 20 * * *"
      timezone: America/Costa_Rica
      enabled: true
    - id: meraki-weekly-report
      schedule: "0 19 * * 0"
      timezone: America/Costa_Rica
      enabled: true
    - id: meraki-monthly-report
      schedule: "0 10 1 * *"
      timezone: America/Costa_Rica
      enabled: true
    - id: meraki-morning-check
      schedule: "0 8 * * *"
      timezone: America/Costa_Rica
      enabled: true

telegram:
  bots:
    - name: Marion Bot
      account: default
      purpose: primary-assistant
    - name: Angelina Bot
      account: angibot
      purpose: restaurant-notifications
    - name: Ruth Bot
      account: rubtbot
      purpose: real-estate-assistant
  credential_storage: ~/.openclaw/openclaw.json

external_services:
  - name: stripe
    purpose: payments
    used_by:
      - coyol-website
    credential_storage: vercel-env-vars

  - name: plausible
    purpose: analytics
    used_by:
      - coyol-website
    dashboard: https://plausible.io/coyolnosara.com

  - name: gmail
    purpose: email
    used_by:
      - scripts
      - openclaw
    access_method: himalaya-cli
    credential_storage: ~/.himalaya/config.toml

  - name: github
    purpose: version-control
    repositories:
      - Meraki-Nosara/coyol-website
      - Meraki-Nosara/coyol-control
      - Meraki-Nosara/laluna-website
    credential_storage: ssh-keys

security:
  access_matrix:
    openclaw:
      production: true
      database_write: true
      deploy: true
      server: true
      dns: false
    admin_panels:
      production: true
      database_write: true
      deploy: false
      server: false
      dns: false

  credential_locations:
    supabase_key: hardcoded
    stripe_keys: vercel-env-vars
    telegram_tokens: ~/.openclaw/openclaw.json
    github_auth: ssh-keys
    gmail_auth: ~/.himalaya/config.toml
    vercel_auth: ~/.vercel/auth.json

technical_debt:
  fragile:
    - sales.json-manual-updates
    - ocr-cierre-parsing
    - gmail-himalaya-auth-expiry
  unfinished:
    - email-automation-facturas
    - mdo-labor-hours-integration
    - coyol-2025-monthly-breakdown
  undocumented:
    - macos-mail-applescript
    - local-timezone-assumptions

version_info:
  document_version: "1.0"
  last_updated: "2026-09-18"
  generated_by: openclaw-ai
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-09-18 | OpenClaw AI | Initial comprehensive documentation |

---

*End of Document*
