#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RESEND_API_KEY = 're_H1F8VM9N_EJVMrXQXBwfeY5eauj3mEgHb';
const BATCH_SIZE = 100;
const DAILY_LIMIT = 2000;
const DELAY_MS = 2000;

// Load the template from v2 script
const v2Script = fs.readFileSync(path.join(__dirname, 'gift-card-campaign-v2.js'), 'utf8');
const templateMatch = v2Script.match(/const EMAIL_TEMPLATE = `([\s\S]*?)`;/);
const EMAIL_TEMPLATE = templateMatch ? templateMatch[1] : '';

const STATE_FILE = path.join(__dirname, 'campaign-state.json');
const EMAIL_FILE = '/Users/Coyol/.openclaw/workspace/data/campaign-emails.csv';

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { sentEmails: [], lastRun: null, totalSent: 0 };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function sendBatch(emails) {
  const response = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emails.map(email => ({
      from: 'Coyol Group <reservations@lalunanosara.com>',
      to: email,
      subject: 'Gift Cards Now Available - La Luna & Coyol',
      html: EMAIL_TEMPLATE
    })))
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }
  return response.json();
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const state = loadState();
  const today = new Date().toISOString().split('T')[0];
  
  // Load email list
  const allEmails = fs.readFileSync(EMAIL_FILE, 'utf8')
    .split('\n')
    .map(e => e.trim())
    .filter(e => e && e.includes('@'));

  // Filter out already sent
  const remaining = allEmails.filter(e => !state.sentEmails.includes(e));
  const toSend = remaining.slice(0, DAILY_LIMIT);

  console.log('=== Gift Card Campaign ===');
  console.log(`Total emails: ${allEmails.length}`);
  console.log(`Already sent: ${state.sentEmails.length}`);
  console.log(`Remaining: ${remaining.length}`);
  console.log(`Sending today: ${toSend.length}`);
  console.log('');

  if (toSend.length === 0) {
    console.log('Nothing to send!');
    return;
  }

  let sentToday = 0;
  
  for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
    const batch = toSend.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toSend.length / BATCH_SIZE);
    
    console.log(`Batch ${batchNum}/${totalBatches}: Sending ${batch.length} emails...`);
    
    try {
      const result = await sendBatch(batch);
      console.log(`  OK - ${result.data?.length || batch.length} sent`);
      
      state.sentEmails.push(...batch);
      state.totalSent += batch.length;
      state.lastRun = today;
      sentToday += batch.length;
      saveState(state);
      
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      console.log('Stopping due to error.');
      break;
    }
    
    if (i + BATCH_SIZE < toSend.length) {
      console.log(`  Waiting ${DELAY_MS/1000}s...`);
      await sleep(DELAY_MS);
    }
  }

  console.log('');
  console.log('=== Done ===');
  console.log(`Sent today: ${sentToday}`);
  console.log(`Total sent: ${state.sentEmails.length}`);
  console.log(`Remaining: ${allEmails.length - state.sentEmails.length}`);
}

main().catch(console.error);
