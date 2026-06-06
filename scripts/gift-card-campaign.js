#!/usr/bin/env node
/**
 * Gift Card Email Campaign - Resend
 * Sends 2,000 emails/day from the guest list
 */

const fs = require('fs');
const path = require('path');

const RESEND_API_KEY = 're_H1F8VM9N_EJVMrXQXBwfeY5eauj3mEgHb';
const BATCH_SIZE = 100; // Resend batch limit
const DAILY_LIMIT = 2000;
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F5F3EF; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #D4C9B5; padding: 25px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="70" valign="middle">
                    <img src="https://coyolnosara.com/images/logos/coyol-palm-square.png" 
                         alt="Coyol" 
                         width="60" 
                         height="60"
                         style="display: block;" />
                  </td>
                  <td valign="middle" style="padding-left: 20px;">
                    <p style="color: #3D4F3D; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: normal;">COYOL GROUP</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Personal Greeting -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <p style="color: #1A1F16; font-size: 16px; line-height: 1.7; margin: 0;">
                Dear Friend,
              </p>
              <p style="color: #1A1F16; font-size: 16px; line-height: 1.7; margin: 20px 0 0 0;">
                You're receiving this email as you've dined with us at La Luna or Coyol in Nosara. We do hope you enjoyed your visit.
              </p>
              <p style="color: #1A1F16; font-size: 16px; line-height: 1.7; margin: 20px 0 0 0;">
                We wanted to let you know that e-Gift Cards are now available for both restaurants. If you'd like to share a Nosara dining experience with someone special, you can purchase a digital gift card through our website.
              </p>
            </td>
          </tr>
          
          <!-- Both restaurants side by side -->
          <tr>
            <td style="padding: 30px 40px 35px 40px; border-top: 1px solid #E8E4DC;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- La Luna -->
                  <td width="50%" align="center" valign="bottom" style="padding: 10px; height: 120px;">
                    <table cellpadding="0" cellspacing="0" style="height: 100%;">
                      <tr>
                        <td align="center" valign="middle" style="height: 70px;">
                          <img src="https://coyolnosara.com/images/logos/laluna-square.png" 
                               alt="La Luna" 
                               width="55" 
                               height="55"
                               style="display: block;" />
                        </td>
                      </tr>
                      <tr>
                        <td align="center" valign="bottom" style="padding-top: 15px;">
                          <a href="https://coyolnosara.com/laluna/gift" 
                             style="display: inline-block; background-color: #1A1F16; color: #C4A67C; padding: 12px 20px; text-decoration: none; font-size: 11px; letter-spacing: 1px; border-radius: 4px;">
                            LA LUNA GIFT CARDS
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Coyol -->
                  <td width="50%" align="center" valign="bottom" style="padding: 10px; height: 120px;">
                    <table cellpadding="0" cellspacing="0" style="height: 100%;">
                      <tr>
                        <td align="center" valign="middle" style="height: 70px;">
                          <img src="https://coyolnosara.com/images/logos/coyol-text-wide.png" 
                               alt="Coyol" 
                               width="100" 
                               height="40"
                               style="display: block;" />
                        </td>
                      </tr>
                      <tr>
                        <td align="center" valign="bottom" style="padding-top: 15px;">
                          <a href="https://coyolnosara.com/coyol/gift" 
                             style="display: inline-block; background-color: #1A1F16; color: #C4A67C; padding: 12px 20px; text-decoration: none; font-size: 11px; letter-spacing: 1px; border-radius: 4px;">
                            COYOL GIFT CARDS
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Details -->
          <tr>
            <td style="padding: 25px 40px 40px 40px; border-top: 1px solid #E8E4DC;">
              <p style="color: #1A1F16; font-size: 16px; line-height: 1.7; margin: 0;">
                e-Gift Cards from $50. The recipient receives a digital card by email, ready to redeem on their next visit to Nosara.
              </p>
              <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 20px 0 0 0;">
                Questions? Simply reply to this email or ring us on +506 8996-8221.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F3EF; padding: 30px 40px; text-align: center; border-top: 1px solid #E8E4DC;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <a href="https://www.instagram.com/lalunanosara" style="color: #666; text-decoration: none;">@lalunanosara</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="https://www.instagram.com/coyolnosara" style="color: #666; text-decoration: none;">@coyolnosara</a>
              </p>
              <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">
                Coyol Group<br>
                Playa Guiones, Nosara, Costa Rica<br>
                +506 8996-8221
              </p>
              <p style="color: #999; font-size: 11px; margin: 20px 0 0 0;">
                You received this email as you made a reservation at one of our restaurants.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// State file to track progress
const STATE_FILE = path.join(__dirname, 'campaign-state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { sentCount: 0, lastIndex: 0, sentEmails: [], lastRun: null };
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
    throw new Error(`Resend API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCampaign(emailList, dryRun = false) {
  const state = loadState();
  
  // Check if we already ran today
  const today = new Date().toISOString().split('T')[0];
  if (state.lastRun === today) {
    console.log(`Already sent ${state.sentCount} emails today. Run again tomorrow.`);
    return;
  }

  // Reset daily counter if new day
  if (state.lastRun !== today) {
    state.sentCount = 0;
    state.lastRun = today;
  }

  // Get emails to send (skip already sent)
  const remainingEmails = emailList.filter(e => !state.sentEmails.includes(e));
  const toSend = remainingEmails.slice(0, DAILY_LIMIT);

  console.log(`\n=== Gift Card Campaign ===`);
  console.log(`Total in list: ${emailList.length}`);
  console.log(`Already sent: ${state.sentEmails.length}`);
  console.log(`Remaining: ${remainingEmails.length}`);
  console.log(`Sending today: ${toSend.length}`);
  console.log(`Dry run: ${dryRun}\n`);

  if (toSend.length === 0) {
    console.log('No more emails to send!');
    return;
  }

  let sentToday = 0;

  for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
    const batch = toSend.slice(i, i + BATCH_SIZE);
    
    console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1}: Sending ${batch.length} emails...`);

    if (dryRun) {
      console.log(`  [DRY RUN] Would send to: ${batch.slice(0, 3).join(', ')}...`);
    } else {
      try {
        const result = await sendBatch(batch);
        console.log(`  Sent! IDs: ${result.data?.slice(0, 2).map(r => r.id).join(', ')}...`);
        
        // Update state
        state.sentEmails.push(...batch);
        state.sentCount += batch.length;
        sentToday += batch.length;
        saveState(state);
      } catch (error) {
        console.error(`  ERROR: ${error.message}`);
        console.log('  Stopping campaign due to error.');
        break;
      }
    }

    // Rate limit
    if (i + BATCH_SIZE < toSend.length) {
      console.log(`  Waiting ${DELAY_BETWEEN_BATCHES/1000}s...`);
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Sent today: ${sentToday}`);
  console.log(`Total sent: ${state.sentEmails.length}`);
  console.log(`Remaining: ${emailList.length - state.sentEmails.length}`);
}

// Export for use as module
module.exports = { runCampaign, loadState };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const testEmail = args.find(a => a.startsWith('--test='));
  
  if (testEmail) {
    // Send single test email
    const email = testEmail.split('=')[1];
    console.log(`Sending test email to ${email}...`);
    sendBatch([email])
      .then(r => console.log('Sent!', r))
      .catch(e => console.error('Error:', e.message));
  } else {
    // Load email list from CSV
    const csvFile = args.find(a => a.endsWith('.csv')) || 
      '/Users/Coyol/.openclaw/workspace/data/campaign-emails.csv';
    
    if (!fs.existsSync(csvFile)) {
      console.error(`Email list not found: ${csvFile}`);
      console.log('Usage: node gift-card-campaign.js [emails.csv] [--dry-run] [--test=email@example.com]');
      process.exit(1);
    }

    const emails = fs.readFileSync(csvFile, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes('@'));

    runCampaign(emails, dryRun);
  }
}
