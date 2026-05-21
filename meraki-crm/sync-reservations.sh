#!/bin/bash
# Meraki CRM - Sync new reservations to CRM
# Runs every 30 minutes via cron or heartbeat

cd ~/.openclaw/workspace/meraki-crm

# Check Supabase reservation tables first (faster, more reliable)
echo "Syncing from Supabase reservations..."
python3 email-integration.py --supabase

# Log
echo "$(date): CRM sync complete" >> ~/.openclaw/logs/crm-sync.log
