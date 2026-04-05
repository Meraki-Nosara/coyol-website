# Coyol Website Project State

*Last updated: April 4, 2026 @ 22:10 CST*

## Project Overview
- **Goal:** Premium real estate website for Coyol (coyolrealestate.com)
- **Stack:** Astro + Tailwind CSS + Cesium 3D maps
- **Location:** `~/.openclaw/workspace/coyol-website/`
- **Dev Server:** Port 4321

## Developments Layout (from Master Plan)

```
┌─────────────────────────────────────────────────────────┐
│  CONDOMINIUM (top left)                                 │
│  - Tennis court, Horse arena, Playground                │
├─────────────────────────────────────────────────────────┤
│  MAR AZUL (center-left)        │  LOS COYOLES 1        │
│  - Smaller lots                │  - Large lots 1-12    │
│  - Winding roads               │                       │
├────────────────────────────────┼───────────────────────┤
│  NOSARA HILLS (bottom-left)    │  LOS COYOLES 2 & 3    │
│  - Lots 20-30+                 │  - Large estate lots  │
└─────────────────────────────────────────────────────────┘
```

## API Keys & Tokens

### Cesium Ion
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4M2E5NTU4OS02ZjhiLTQ0ODItOGM0Zi00MzFhZGJlOWVlMjciLCJpZCI6NDEzNTMzLCJpYXQiOjE3NzUyNjMxMDV9.3vO61DPftOwtsluGJgtwchTXBmgJYu8AWa8fvbF-isQ`
- **Account:** Marion's Cesium Ion account

### Mapbox (if needed)
- **Status:** Not configured yet

## Source Files

### KML Data
- `source-files/Nosara Hills.kml` — Nosara Hills lot boundaries
- `source-files/MAR AZUL PRUEBA1.kml` — Mar Azul lot boundaries (5.3MB, 627 features)

### Processed GeoJSON
- `public/data/mar-azul-lots.geojson` — 40 filtered Mar Azul lots
- `public/data/mar-azul-new.geojson` — Full Mar Azul data (627 features)
- `public/data/nosara-hills.geojson` — Nosara Hills data
- `public/data/all-developments.geojson` — Combined (4,235 features)

### Master Plan
- `source-files/Master Plan NH-MA.pdf` — Full master plan (136MB)
- `source-files/master-plan-overview.jpg` — Overview image with development zones

### Photos & Videos (from SwissTransfer)
Located in `~/Downloads/swisstransfer_9072feab-4b7f-4186-bf05-3239e4d9b57a/`:

**Drone Photos:**
- `DJI_20250326130411_0403_D.jpg` — Hillside aerial view
- `DJI_20250326172126_0411_D.jpg` — La Luna beachfront dining (top-down)
- `DJI_20250326172154_0413_D.jpg` — Coastal overview with rocks

**Videos:**
- `COYOL 1.mov`, `COYOL 2.mov`, `COYOL 22.mp4` — Coyol property videos
- `NOSARA Mar Azul1.mp4`, `NOSARA Mar Azul 2.mp4` — Mar Azul drone footage
- `IMG_7254.mov`, `IMG_7255.mov` — Additional footage
- `WhatsApp Video 2026-03-02 at 08.51.35.mp4` — WhatsApp video

**Other:**
- `ELLE HOME.zip` — Casa Elle package (1.2GB) - in first SwissTransfer
- `wetransfer_img_7256-jpeg_2026-03-02_1439.zip` — Additional images

## Architectural Renders (8 total)
All in `public/images/`:

| File | Description |
|------|-------------|
| `render-glass-jungle.jpg` | Glass pavilion cantilevered over jungle (HERO) |
| `render-mountain-view.jpg` | Mountain sunset with pool |
| `mar-azul-lot34-render.jpg` | Jungle infinity pool |
| `render-hacienda.jpg` | Stone hacienda style |
| `render-interior-bedroom.jpg` | Bedroom with exposed beams |
| `render-interior-greatroom.jpg` | Great room with cathedral ceiling |
| `render-kitchen.jpg` | Chef's kitchen, verde marble |
| `render-master-suite.jpg` | Master suite with woven pendants |

## Map Configuration

### Mar Azul Focus (current)
```javascript
center: { lng: -85.637, lat: 10.002, height: 800 }
bounds: { west: -85.645, south: 9.995, east: -85.630, north: 10.010 }
zoom: min 100m, max 2000m
```

### Full Nosara Area (for later)
```javascript
center: { lng: -85.638, lat: 9.976, height: 2500 }
bounds: { west: -85.72, south: 9.90, east: -85.55, north: 10.05 }
```

## Design System

### Land Rover Heritage Palette
| Color | Hex | Use |
|-------|-----|-----|
| Keswick Green | `#3D4F3D` | Primary dark |
| Coniston | `#4A5D4A` | Accent green |
| Limestone | `#D4C9B5` | Light background |
| Alaska White | `#F5F3EF` | Off-white |
| Santorini | `#1A1F16` | Text/dark |
| Sand | `#C4A67C` | Warm accent |
| Terracotta | `#A65D3F` | Alert/highlight |

### Typography
- **Serif:** For headings (elegant, editorial)
- **Sans:** For body text

## Website Structure

### Pages
- `/` — Homepage (parallax sections, gallery, contact)
- `/map-cesium` — 3D interactive map

### Components
- `Navigation.astro` — Fixed nav with logo
- `ParallaxSection.astro` — Full-width parallax backgrounds
- `RenderGallery.astro` — Architectural renders grid
- `FamilyBrands.astro` — La Luna, Coyol Restaurant, Esh
- `Contact.astro` — Contact form
- `Footer.astro` — Footer

## Next Steps

### Immediate (3D Map)
1. [ ] Verify 40 Mar Azul lots display correctly
2. [ ] Add lot click interaction with info panel
3. [ ] Add tree/vegetation rendering
4. [ ] Add water effects for nearby coast
5. [ ] Add Nosara Hills lots

### Later
1. [ ] Add Los Coyoles lots (need KML)
2. [ ] Lot status management (available/reserved/sold)
3. [ ] Integration with CMS (Sanity.io)
4. [ ] Deploy to Vercel with custom domain

## SwissTransfer Links
- **Link 1:** https://www.swisstransfer.com/d/3ca69d1f-7f3c-4dcb-921c-2b825b93ec64 (Casa Elle, 92 files)
- **Link 2:** https://www.swisstransfer.com/d/a288ad68-1f4c-461f-98a6-2303f5b95fb5 (Drone footage, downloaded)

## Contact
- **Marion:** marionnosara@gmail.com, Telegram @MarionPeri
- **AgentMail:** marion@agentmail.to
