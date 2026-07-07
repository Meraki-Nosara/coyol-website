# HEARTBEAT.md — Periodic Checks (Lite Mode)

**Status:** Marion traveling (Greece until September). Minimal heartbeat.

## Automated via Cron (NO LLM needed)
These run every 15 minutes automatically:
- Gift card emails (La Luna + Coyol)
- Reservation confirmations (both restaurants)  
- CRM lead sync

**Logs:** `/tmp/gift-cards.log`, `/tmp/reservations.log`, `/tmp/crm-sync.log`

---

## Heartbeat Tasks (2-3x per day max)

### Check Cron Health
Verify cron jobs are running:
```bash
tail -5 /tmp/gift-cards.log
tail -5 /tmp/reservations.log
```
If logs are stale (>1 hour), alert Marion.

### La Gaceta Monitor (once daily, morning)
```bash
bash ~/.openclaw/workspace/scripts/check-la-gaceta.sh
```
If exit code 2 → Alert Marion immediately.

### Weekly Report (Sunday 7pm Costa Rica)
Only if data available in sales.json.

---

## NOT doing while traveling:
- Daily reports to Angelina (no consistent cierre data)
- Meraki email monitoring (Ingrid not sending)
- Hot lead alerts (not selling from Greece)
- NC Control orders (low priority)
- Coyol Control pipeline (can wait)

---

## Notes
- Heartbeat interval: 3-4 hours (not 30 min)
- Don't check 23:00-08:00 Costa Rica time
- If nothing to do → HEARTBEAT_OK
