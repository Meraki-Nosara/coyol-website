# TOOLS.md — Local Configuration & Notes

## Email

### Primary Method: Himalaya CLI
Use Himalaya for all email operations — reading, attachments, marking read.

**Meraki (restaurants):**
- **Account:** `meraki`
- **Email:** marionnosara@gmail.com
- **Use for:** Restaurant operations, cierres, facturas, Angelina reports

**Coyol (real estate):**
- **Account:** `coyol`
- **Email:** coyolcontrol@gmail.com
- **Use for:** Mar Azul, Nosara Hills, Los Coyoles, team communication (Milagro, Alessia, Anlly, Olger, Ruth)

**Common commands:**
```bash
himalaya envelope list                    # List inbox
himalaya envelope list --page-size 50     # More results
himalaya message read <ID>                # Read email body
himalaya attachment download <ID>         # Download attachments
himalaya flag add <ID> seen               # Mark as read
```

### AgentMail (NOT for Meraki)
- **Inbox:** marion@agentmail.to
- **API Key:** `am_us_e66b9d779b060c4f69330f5c5d46bf0a7ee4b66bd8bc690ee2cc0de584847714`
- **Note:** NOT connected to Meraki operations. Use only for other projects.

## API Keys
- **OpenRouter:** Configured in ~/.openclaw/.env
- **Mapbox:** ⚠️ NEEDED — Ask Marion for token

## Supabase (Coyol Website)
**Project:** mnxjzvqgrrodalcmtntf
**URL:** https://mnxjzvqgrrodalcmtntf.supabase.co

**✅ CORRECT KEY (use this!):**
```
sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD
```

**❌ WRONG KEY (don't use):**
```
sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng
```

**Tables:**
- `mar_azul_leads` — Qualified Leads
- `coyol_reservations` — Coyol Restaurant
- `laluna_reservations` — La Luna Restaurant

**Note:** The publishable key works for BOTH read AND write. Don't change it to "secret" keys — those are placeholders that don't work.

## Dev Servers
| Project | Port | URL |
|---------|------|-----|
| Coyol Website | 4321 | http://192.168.110.42:4321 |
| Meraki Control | 4400 | http://192.168.110.42:4400 |

## Production URLs
| Project | URL |
|---------|-----|
| Meraki Control | https://meraki.livingnosara.com |

## Models Available
- `anthropic/claude-opus-4-5` (default)
- `openrouter/google/gemini-2.5-pro`
- `openrouter/google/gemini-2.5-flash`
- `openrouter/perplexity/sonar-deep-research`

## Local Network
- **Mac IP:** 192.168.110.42 (may change)
- **Timezone:** America/Costa_Rica

## Costa Rica Notes
- Google AI Studio blocked — use OpenRouter for Gemini
- Currency: Colones (₡) — CRC
- Invoice system: Factura electrónica (Hacienda)

## File Locations
- **KML Files:** `~/Downloads/` and `coyol-website/`
- **Images:** `coyol-website/public/images/`
- **GeoJSON:** `coyol-website/public/data/`

---

*Add tool-specific notes here as needed.*
