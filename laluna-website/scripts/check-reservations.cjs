#!/usr/bin/env node
/**
 * Check for new La Luna reservations and send confirmation emails
 * Run via cron or heartbeat every few minutes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';
const SENT_FILE = path.join(process.env.HOME, '.openclaw/workspace/memory/reservations-sent.json');
const CONFIRM_SCRIPT = path.join(__dirname, 'send-confirmation.cjs');

async function main() {
  // Load sent tracking
  let sent = { coyol: [], laluna: [] };
  try {
    sent = JSON.parse(fs.readFileSync(SENT_FILE, 'utf8'));
  } catch (e) {
    // File doesn't exist, start fresh
  }

  // Ensure laluna array exists
  if (!sent.laluna) sent.laluna = [];

  // Fetch confirmed reservations from last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const url = `${SUPABASE_URL}/rest/v1/laluna_reservations?status=eq.confirmed&created_at=gte.${yesterday}&select=id,guest_name,guest_email,date`;
  
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  const reservations = await res.json();
  
  // Filter unsent
  const unsent = reservations.filter(r => !sent.laluna.includes(r.id) && r.guest_email);
  
  if (unsent.length === 0) {
    console.log('No new La Luna reservations to confirm');
    return;
  }

  console.log(`Found ${unsent.length} new La Luna reservation(s) to confirm`);

  // Check for same-day bookings
  const today = new Date().toISOString().split('T')[0];
  const sameDayBookings = unsent.filter(r => r.date === today);
  
  for (const reservation of unsent) {
    console.log(`Sending confirmation to ${reservation.guest_name} (${reservation.guest_email})...`);
    
    try {
      execSync(`node ${CONFIRM_SCRIPT} ${reservation.id}`, { 
        stdio: 'inherit',
        cwd: path.dirname(CONFIRM_SCRIPT)
      });
      
      // Mark as sent
      sent.laluna.push(reservation.id);
      fs.writeFileSync(SENT_FILE, JSON.stringify(sent, null, 2));
      
      console.log(`✓ Confirmed: ${reservation.id}`);
    } catch (e) {
      console.error(`✗ Failed to send confirmation for ${reservation.id}:`, e.message);
    }
  }

  // Return same-day bookings for alerting
  if (sameDayBookings.length > 0) {
    console.log(`\n⚠️  SAME-DAY BOOKINGS (alert Marion!):`);
    sameDayBookings.forEach(r => {
      console.log(`   - ${r.guest_name} for today`);
    });
  }

  console.log('Done!');
}

main().catch(console.error);
