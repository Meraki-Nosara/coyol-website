# Coyol Control System — State Documentation

*Last updated: April 8, 2026 — 10:49 PM*

---

## Overview

**Purpose:** Internal property management system for Coyol Real Estate
**URL:** https://coyol-control.vercel.app
**Repo:** https://github.com/Meraki-Nosara/coyol-control (private)
**Local:** `~/.openclaw/workspace/coyol-control/`
**Stack:** Astro + Tailwind CSS + GSAP

---

## Authentication

| User | Password | Role | Access |
|------|----------|------|--------|
| `marion` | `coyol2026` | Admin | Full access |
| `office` | `manager2026` | Manager | All properties, no financials |
| `realtor` | `ventas2026` | Realtor | Limited developments |
| `guest` | `visitor2026` | Guest | Mar Azul only |

---

## Developments

### Mar Azul
- **35 lots** (1-12, 14-36 — no #13 for luck)
- **Status breakdown:**
  - Habitada (occupied): 1, 4, 12, 20, 31, 32
  - Holding (company): 2, 14, 26, 28
  - Rancho MA (available): Rest
  - Sold: Lot 28 (2026)
- **Houses with names:** Casa Churcher, Casa Nispero, Casa Vida, Casa Eclipse, Casa Elle, Casa Cacao, Casa Luz, Casa Cazulinni, Casa Beauty, Casa Modern Barn, Casa Shou Sugi Ban

### Nosara Hills — Etapa 1
- **21 lots** (1-21)
- **Sold lots:**
  - Lot 1 → Verena
  - Lots 2, 3, 4 → David & Geri
  - Lot 7 → Mary
  - Lot 15 → John & Trisha
  - Lot 18 → Anton (FULLY READY ✅)
- **Reserved:** Lot 8 → Mary (pending)
- **Available:** 5, 6, 9-14, 16, 17, 19, 20, 21

### Other Developments (placeholders)
- Los Coyoles I (18 lots)
- Los Coyoles II (15 lots)
- Los Coyoles III (12 lots)

---

## Lot Preparation Pipeline

Each lot goes through these steps before sale:

1. **Segregación** — Separate from mother farm (Topógrafo)
2. **Plano Catastrado** — Survey plan (Topógrafo)
3. **Cabeza Propia** — Own title registration (Abogado)
4. **Carta de Agua** — Water letter from AyA (Anlly)
5. **Uso de Suelo** — Land use permit (Anlly)
6. **Registro Nacional** — Final registration (Abogado)

### Team Assignments
- **Topógrafo:** Segregación, Plano
- **Abogado:** Cabeza Propia, Registro
- **Anlly (Admin):** Carta de Agua, Uso de Suelo

---

## Current Priority Tasks

**HIGH (Sold lots waiting for Plano):**
- NH #1 (Verena)
- NH #2, 3, 4 (David & Geri)
- NH #7 (Mary)
- NH #15 (John & Trisha)

**MEDIUM (Reserved):**
- NH #8 (Mary) — needs Segregación first

---

## Documents Stored

### Mar Azul (`/public/documents/mar-azul/`)
- 41 PDFs including:
  - Planos for lots 2, 3, 4, 12, 14, 20, 26, 28, 30, 31, 32
  - Contratos de compra/venta
  - Contratos de construcción
  - Escrituras
  - Aprobaciones municipales
  - Permisos de construcción
  - Tomos/Asientos (registry records)

### Nosara Hills (`/public/documents/nosara-hills/`)
- 20+ PDFs including:
  - Planos for lots 5, 6, 8, 9, 10, 11, 12, 13, 17, 18, 19, 20
  - Lot 18 complete: Escritura, Carta de Agua, Visado, Uso de Suelo, Registro

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/` | Authentication |
| Dashboard | `/dashboard` | Interactive masterplan map |
| Pipeline | `/pipeline` | Kanban view of lot preparation |
| Tasks | `/tasks` | Team task management |
| Development | `/development/[id]` | Lot grid for a development |
| Lot Detail | `/lot/[id]` | Full lot info + documents |

---

## Data Files

| File | Content |
|------|---------|
| `src/data/mar-azul-lots.json` | Mar Azul lot data (35 lots) |
| `src/data/nosara-hills-lots.json` | NH lot data with preparation status |
| `src/data/lot-preparation-steps.json` | Pipeline step definitions |
| `src/data/team.json` | Team members + assignments |
| `src/data/tasks.json` | Active tasks |
| `src/data/users.json` | Login credentials |
| `src/data/document-types.json` | Document access levels |

---

## Design

- **Colors:** Land Rover Heritage palette
  - Mar Azul: #5B8FAD (Ocean Blue)
  - Nosara Hills: #5C6B5C (Moss Green)
  - Los Coyoles I: #C4A67C (Sand)
  - Los Coyoles II: #A65D3F (Terracotta)
  - Los Coyoles III: #8B7355 (Bronze)
- **Animation:** GSAP for smooth map zoom
- **Map:** SVG polygons over masterplan image

---

## To Do

- [ ] **Get lot preparation status from Marion** — which lots have what documents
- [ ] Add lot sizes to Nosara Hills (from planos or Excel)
- [ ] Set up email reminders to team (Topógrafo, Abogado, Anlly)
- [ ] Add contact info for Topógrafo, Abogado, Anlly
- [ ] Fix polygon shapes to match actual boundaries precisely
- [ ] Add other Nosara Hills etapas (2, 3, 4)
- [ ] Add Los Coyoles lot data
- [ ] Set up obscure domain for security

## Key Notes

- **Mar Azul** = Condominio (shared infrastructure, HOA)
- **Nosara Hills** = Parcelas Agrícolas (individual agricultural parcels)
- **Main priority** = Get lots READY TO SELL (fully permitted)

---

## Source Files

- **Masterplan:** Downloaded from `~/Downloads/Master Plan NH-MA (1).pdf`
- **Mar Azul data:** `HOA_budget_Calculation_sheet.xlsx`
- **Documents:** `~/Downloads/Mar Azul /Condominio Mar Azul/`
- **Nosara Hills docs:** `~/Downloads/Nosara Hills 2/Nosara Hills Etapa 1/`
