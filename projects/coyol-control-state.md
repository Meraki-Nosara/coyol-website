# Coyol Control — Project State

*Last updated: April 10, 2026*

---

## 🏗️ Development Types

### Mar Azul — CONDOMINIUM (since 2024)
- **Type:** Condominio
- **Parent Company:** Desarrollo Rancho Mar Azul Ltda
- **Total Lots:** 35 (no lot 13 for luck)
- **Status:** Already subdivided, all lots have planos
- **Pipeline:** ❌ NO — already a condominium, no segregation needed
- **Permits:** Project-level (SETENA, water letter, etc.) apply to all lots
- **Documents:** Each lot attaches shared condominium permits for due diligence

**Lot Statuses:**
| Status | Lots | Can Sell? | Notes |
|--------|------|-----------|-------|
| **Sold** | 1, 4, 12, 20, 28, 31, 32 | ❌ Already sold | Third party owners |
| **Holding** | 2, 14, 26, 30 | ✅ Ready to sell | Owned by Coyol Development S.A. |
| **Rancho MA** | All others | ✅ Ready to sell | Owned by Desarrollo Rancho Mar Azul Ltda |

**Known Owners:**
- Lot 1: Nigel Churcher (SA name TBD from Anlly)
- Lot 4: Casa Vida (owner TBD)
- Lot 12: Casa Eclipse (owner TBD)
- Lot 20: David & Erin
- Lot 28: Francisco Villalobos (tax adviser)
- Lot 31: Casa Beauty (owner TBD)
- Lot 32: Casa Modern Barn (owner TBD)

**House Names (all real):**
- Lot 1: Casa Churcher
- Lot 2: Casa Nispero
- Lot 4: Casa Vida
- Lot 12: Casa Eclipse
- Lot 14: Casa Elle
- Lot 18: Casa Cacao
- Lot 21: Casa Luz
- Lot 30: Villa Cazulini
- Lot 31: Casa Beauty
- Lot 32: Casa Modern Barn
- Lot 34: Casa Shou Sugi Ban

---

### Nosara Hills — PARCELAS AGRÍCOLAS
- **Type:** Parcelas Agrícolas (agricultural parcels)
- **Total Lots:** 21
- **Status:** Need individual segregation
- **Pipeline:** ✅ YES — each lot needs segregation process

**Pipeline Steps:**
1. **Plano en Proceso** — Olger creates plano catastrado
2. **Registro** — Alessia registers plano (cabeza propia)
3. **Cartas** — Anlly requests Carta de Agua + Uso de Suelo
4. **Listo para Venta** — All documents ready

**Known Status:**
- Lot 18: **SOLD** (completed, all documents done)
- All others: Available (need segregation before sale)

---

### Los Coyoles I, II, III — PLANNING
- **Type:** Finca (future development)
- **Status:** D1 SETENA in process
- **Pipeline:** Not yet — still in planning phase

---

## 📧 Email Workflow

**When Marion starts a lot (Nosara Hills only):**
1. Email sent to: Olger, Anlly, Alessia (all 3)
2. Subject: Segregación Lote #X - [Development]
3. Message: "Deseamos segregar Lote #X en [Desarrollo]. Coordinar visita al sitio si es necesario y preparar el plano."

**When plano is uploaded:**
1. Email to: Alessia (CC: Anlly)
2. Message: "El plano del Lote #X está listo. Preparar escritura y registrar en Registro Nacional."

**When plano is registered (cabeza propia):**
1. Email to: Anlly
2. Message: "El plano del Lote #X está registrado. Nuevo número: [#]. Solicitar Carta de Agua (AyA) y Uso de Suelo (Municipalidad)."

**Mar Azul (condominium):**
- NO segregation emails
- Anlly uploads existing condominium permits to each lot folder for due diligence

---

## 👥 Team

| Name | Role | Email | Responsibilities |
|------|------|-------|------------------|
| Olger | Topógrafo | fijoteolab@gmail.com | Plano catastrado |
| Alessia Aguirre | Abogada | alessia.aguirre@gmail.com | Cabeza Propia, Registro Nacional |
| Anlly Villegas | Admin | info@nosaraconstruction.com | Carta de Agua, Uso de Suelo, uploads |

---

## 📁 Document Storage

- **Google Drive:** Coyol Control folder (coyolcontrol@gmail.com)
- **Structure:** Development / Lot # / documents
- **Email:** coyolcontrol@gmail.com for document uploads
- **Access:** rclone configured (`rclone ls coyol:`)

### Document Types

**Condominium-level (shared by ALL Mar Azul lots):**
- SETENA (Viabilidad Ambiental)
- MUNI (Uso de Suelo)
- MINAET Aguas (Concesión de Pozo)

**Lot-specific:**
- Plano Catastrado
- Escritura
- Construction Permits (Permiso de Construcción)
- Sales Agreements (Contrato de Compraventa)

---

## 🔑 Key Rules

1. **Mar Azul = NO pipeline** (condominium since 2024)
2. **Nosara Hills = pipeline** (parcelas need segregation)
3. **Sold lots = NO pipeline** (already registered to third parties)
4. **Holding lots = NO pipeline** (already segregated by company)
5. **Documents can be uploaded anytime** (even without pipeline)
6. **Marion chooses which lot enters pipeline** (Nosara Hills only)

---

## 🌐 URLs

- **Production:** https://coyol-control.vercel.app
- **Mobile:** https://coyol-control.vercel.app/mobile
- **GitHub:** Meraki-Nosara/coyol-control (private)

---

## 📊 Data Sources

- **Lot areas:** From HOA budget spreadsheet (verified)
- **House names:** Real (verified by Marion)
- **Ownership:** Real (verified by Marion)
- **Everything else:** Only from Anlly's documents

---

*This file contains critical business rules. READ BEFORE MAKING CHANGES.*
