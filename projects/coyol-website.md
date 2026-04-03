# Project: Coyol Real Estate Website

**Status:** 🟡 In Progress
**Location:** `~/.openclaw/workspace/coyol-website/`
**Dev Server:** http://192.168.110.42:4321

---

## Overview
Rebuild coyolrealestate.com as a luxury destination website showcasing the family's real estate developments and lifestyle brands.

## Design Inspiration
- **Zapotal Beach Club** (zapotalbeachclub.com)
- Discovery Land Company style
- Parallax scrolling, floating text
- Land Rover heritage color palette

## Tech Stack
- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Map:** Mapbox GL JS (needs token)

## Developments Featured
| Name | KML Data | Features |
|------|----------|----------|
| Nosara Hills | ✅ | 1,379 |
| Mar Azul | ✅ | 2,856 |
| Los Coyoles | ❌ | Coming soon |

## Completed
- [x] Project setup (Astro + Tailwind)
- [x] Hero section with parallax
- [x] About section
- [x] Properties section
- [x] Developments showcase
- [x] Gallery
- [x] Contact form
- [x] Footer
- [x] Land Rover color palette
- [x] Zapotal-style floating text
- [x] Downloaded images from old site
- [x] Parsed KML to GeoJSON (4,235 features)
- [x] Built map page structure

## To Do
- [ ] Get Mapbox token from Marion
- [ ] Add real property photos
- [ ] Connect contact form to email
- [ ] Deploy to production
- [ ] Get Los Coyoles KML data
- [ ] Add lot inventory (status, prices)

## Files
- `/public/images/` — Downloaded from old site
- `/public/data/` — GeoJSON from KML files
- `/src/pages/map.astro` — Interactive 3D map

---

*Last updated: April 3, 2026*
