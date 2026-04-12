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

### Coyol Farm House Boutique Hotel — PLANNING
- **Type:** Boutique Hotel
- **Location:** Upper left portion of main farm (dense forest area)
- **Status:** Planning and permits in process
- **Pipeline:** Not yet — hotel project, not lot subdivision

---

## 📧 Email Workflow

### Step 1: Marion Starts a Lot
**Trigger:** Marion says "start lot X" or clicks button in system
**Action:** Email to Olger, Anlly, Alessia
**Subject:** Plano y Escritura Lote X - [Development]
**Message:**
> Necesitamos preparar el Lote X de [Development] para venta.
> - Olger: Preparar plano catastrado
> - Alessia: Preparar escritura de transferencia
> - Anlly: Coordinar y subir documentos a Google Drive

**System:** Lot status → "Plano en Proceso"

---

### Step 2: Olger Sends Plano
**Trigger:** Email received at coyolcontrol@gmail.com with plano attachment
**Action (AUTOMATIC, no approval needed):**
1. Download attachment
2. Upload to Google Drive (Development / Lot #X /)
3. Extract plano info (number, area)
4. Update lot in system
5. **IMMEDIATELY email Alessia + Anlly:**
   > Subject: Plano Listo - Lote X [Development]
   > El plano del Lote X está listo. Preparar escritura y registrar en Registro Nacional.
6. Move lot to next step: "Registro"
7. Notify Marion (optional update)

---

### Step 3: Alessia Registers & Sends Escritura
**Trigger:** Email received with escritura attachment
**Action (AUTOMATIC):**
1. Upload to Google Drive
2. Extract info (cédula jurídica, finca, date)
3. Update lot in system
4. **Email Anlly:**
   > Subject: Escritura Lista - Lote X [Development]
   > La escritura del Lote X está registrada. Solicitar Carta de Agua (AyA) y Uso de Suelo (Municipalidad).
5. Move lot to next step: "Cartas"

---

### Step 4: Anlly Sends Cartas
**Trigger:** Email received with Carta de Agua + Uso de Suelo
**Action (AUTOMATIC):**
1. Upload to Google Drive
2. Update lot in system
3. Move lot to: ✅ "Listo para Venta"
4. **Notify Marion:**
   > Lote X [Development] está listo para venta. Todos los documentos completos.

---

### Email Detection Rules
**Subject patterns to watch:**
- "Plano" + lot number → Step 2
- "Escritura" + lot number → Step 3
- "Carta" or "Uso de Suelo" + lot number → Step 4

**Sender trust:**
- fijoteolab@gmail.com (Olger) → Planos
- alessia.aguirre@gmail.com (Alessia) → Escrituras
- info@nosaraconstruction.com (Anlly) → Cartas, admin docs

---

## 👥 Team

| Name | Role | Email | Responsibilities |
|------|------|-------|------------------|
| Olger | Topógrafo | fijoteolab@gmail.com | Plano catastrado |
| Alessia Aguirre | Abogada | alessia.aguirre@gmail.com | Cabeza Propia, Registro Nacional |
| Anlly Villegas | Admin | info@nosaraconstruction.com | Carta de Agua, Uso de Suelo, uploads |
| Jorge Delgado | Ingeniero Responsable | (pending) | CFIA registered, Mar Azul obras civiles, construction control all developments |
| Milagro Castro | Arquitecta | design@nosaraconstruction.com | Construction permits, architectural plans |

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

## ❓ To Investigate

**Parcelas Agrícolas (Nosara Hills) — confirm with Olger/Alessia:**
- Do they need Carta de Agua + Disponibilidad Eléctrica BEFORE plano catastrado?
- If yes, pipeline needs to change: Cartas → Plano → Registro → Listo
- Sources: AyA/ASADA for water, ICE/Coopeguanacaste for electric?

---

## 🔑 Key Rules

1. **Mar Azul Rancho MA lots = CAN enter pipeline** (need plano + escritura to transfer from Rancho MA)
2. **Mar Azul Sold/Holding lots = NO pipeline** (already have plano + escritura)
3. **Nosara Hills = pipeline** (parcelas need segregation)
4. **Sold lots = NO pipeline** (already registered to third parties)
5. **Holding lots = NO pipeline** (already have documents)
6. **Documents can be uploaded anytime** (even without pipeline)
7. **Marion chooses which lot enters pipeline**
8. **NO DOCUMENT = NO MOVE** — lot cannot advance unless required document is received, uploaded to Drive, and linked in system
9. **Automatic handoffs** — once document is filed, auto-email next person and notify Marion

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
