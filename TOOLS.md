# TOOLS.md — Local Configuration & Notes

## Email

### Primary Method: Himalaya CLI
Use Himalaya for all email operations — reading, attachments, marking read.

- **Account:** `meraki` (default)
- **Email:** marionnosara@gmail.com
- **Connected to:** Gmail IMAP/SMTP
- **Receives:** All Meraki emails (cierres, facturas, supplier lists, etc.)

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
