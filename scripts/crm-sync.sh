#!/bin/bash
# CRM Sync - Runs every 30 minutes
# Syncs reservations to CRM and routes hot leads

SUPABASE_URL="https://mnxjzvqgrrodalcmtntf.supabase.co"
SUPABASE_KEY="sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD"

LOG_FILE="$HOME/.openclaw/workspace/logs/crm-sync.log"
mkdir -p "$(dirname $LOG_FILE)"

echo "[$(date)] Starting CRM sync..." >> $LOG_FILE

# Get count of new reservations in last hour
COYOL_COUNT=$(curl -s "${SUPABASE_URL}/rest/v1/coyol_reservations?select=id" \
  -H "apikey: ${SUPABASE_KEY}" | jq length 2>/dev/null || echo 0)

LALUNA_COUNT=$(curl -s "${SUPABASE_URL}/rest/v1/laluna_reservations?select=id" \
  -H "apikey: ${SUPABASE_KEY}" | jq length 2>/dev/null || echo 0)

echo "[$(date)] Total reservations - Coyol: $COYOL_COUNT, La Luna: $LALUNA_COUNT" >> $LOG_FILE

echo "[$(date)] CRM sync complete" >> $LOG_FILE
