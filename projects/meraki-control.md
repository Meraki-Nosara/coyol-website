# Project: Meraki Control System

**Status:** 🟡 In Progress
**Location:** `~/.openclaw/workspace/meraki-control/`
**Dev Server:** http://192.168.110.42:4400

---

## Overview
Unified financial control system for Angelina's restaurant group (Meraki).

## Restaurants
| Name | Code | Emoji |
|------|------|-------|
| Esh | `esh` | 🍽️ |
| Coyol | `coyol` | 🌴 |
| La Luna | `laluna` | 🌙 |

## Features

### Core
- [x] Dashboard with summary cards
- [x] Restaurant sales comparison table
- [x] Daily sales entry form
- [x] Mobile-responsive design
- [x] Land Rover heritage colors

### Data Input
- [x] Manual sales entry (30-second form)
- [ ] Email parsing (facturas electrónicas)
- [ ] Bank statement import
- [ ] SINPE confirmation parsing

### Supplier Management
- [ ] Supplier database
- [ ] Price tracking over time
- [ ] Price comparison tool
- [ ] Alerts on price changes

### Intelligence
- [ ] Seasonal pattern analysis
- [ ] Labor cost recommendations
- [ ] Inventory suggestions
- [ ] Year-over-year comparisons

### Reports
- [ ] Daily summary (email/WhatsApp)
- [ ] Weekly digest
- [ ] Monthly analysis
- [ ] Custom date ranges

## Tech Stack
- **Framework:** Astro (SSR mode)
- **Styling:** Tailwind CSS
- **Database:** SQLite (via better-sqlite3)
- **Reports:** WhatsApp to Angelina

## Configuration
- **Bank:** One unified account for all 3 restaurants
- **POS:** Manual (no digital system)
- **Invoices:** Costa Rica factura electrónica
- **Reports Language:** English
- **Report Delivery:** Web dashboard + WhatsApp alerts

## Email Integration
- **Inbox:** marion@agentmail.to
- **Purpose:** Receive forwarded sales/payment emails
- **Guide:** `docs/guia-reenvio-emails.pdf`

## Database Schema
See: `schema.sql`

---

*Last updated: April 3, 2026*
