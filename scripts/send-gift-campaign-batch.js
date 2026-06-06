// Send gift card emails in batches via Resend
const fs = require('fs');
const path = require('path');

const RESEND_API_KEY = 're_H1F8VM9N_EJVMrXQXBwfeY5eauj3mEgHb';
const BATCH_SIZE = 100; // Resend batch limit
const TOTAL_TO_SEND = 2000;
const DELAY_BETWEEN_BATCHES = 1500; // ms

// Load email template
const templatePath = path.join(__dirname, '../coyol-website/emails/gift-card-announcement-v23-FINAL.html');
const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

// Load unsent list
const unsentPath = path.join(__dirname, 'unsent-emails.json');
const unsent = JSON.parse(fs.readFileSync(unsentPath, 'utf-8'));

// Load already sent (to update after)
const sentPath = path.join(__dirname, 'already-sent.txt');
let alreadySent = new Set();
if (fs.existsSync(sentPath)) {
  alreadySent = new Set(fs.readFileSync(sentPath, 'utf-8').split('\n').filter(e => e.trim()));
}

let marionCopySent = false;

async function sendBatch(emails) {
  const batch = emails.map((email, index) => {
    const msg = {
      from: 'Coyol Group <hello@coyolnosara.com>',
      to: [email],
      subject: 'A Gift for Someone Special — e-Gift Cards Now Available',
      html: emailTemplate
    };
    // Send ONE copy to Marion (first email of first batch only)
    if (!marionCopySent && index === 0) {
      msg.bcc = ['marionnosara@gmail.com'];
      marionCopySent = true;
    }
    return msg;
  });

  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batch)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${res.status} - ${err}`);
  }

  return await res.json();
}

async function main() {
  console.log(`Starting campaign: ${TOTAL_TO_SEND} emails`);
  console.log(`Unsent in queue: ${unsent.length}`);
  console.log(`Already sent: ${alreadySent.size}`);

  // Filter out any that might be in already sent
  const toSend = unsent.filter(e => !alreadySent.has(e.toLowerCase())).slice(0, TOTAL_TO_SEND);
  console.log(`Will send: ${toSend.length}`);

  let sent = 0;
  let failed = 0;
  const newlySent = [];

  for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
    const batch = toSend.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toSend.length / BATCH_SIZE);

    try {
      console.log(`Sending batch ${batchNum}/${totalBatches} (${batch.length} emails)...`);
      await sendBatch(batch);
      sent += batch.length;
      batch.forEach(e => newlySent.push(e.toLowerCase()));
      console.log(`  ✓ Batch ${batchNum} sent. Total: ${sent}/${toSend.length}`);
    } catch (err) {
      console.error(`  ✗ Batch ${batchNum} failed:`, err.message);
      failed += batch.length;
    }

    // Delay between batches
    if (i + BATCH_SIZE < toSend.length) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  // Update already-sent file
  newlySent.forEach(e => alreadySent.add(e));
  fs.writeFileSync(sentPath, [...alreadySent].join('\n'));

  // Update unsent list (remove sent)
  const remaining = unsent.filter(e => !alreadySent.has(e.toLowerCase()));
  fs.writeFileSync(unsentPath, JSON.stringify(remaining, null, 2));

  console.log('\n========== DONE ==========');
  console.log(`Sent: ${sent}`);
  console.log(`Failed: ${failed}`);
  console.log(`Remaining: ${remaining.length}`);
  console.log(`Already-sent file updated: ${sentPath}`);
}

main().catch(console.error);
