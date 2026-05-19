#!/usr/bin/env node
/**
 * Send reservation confirmation email for La Luna Restaurant
 * Usage: node send-confirmation.cjs <reservation-id>
 */

const { execSync } = require('child_process');

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

async function getReservation(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/laluna_reservations?id=eq.${id}&select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  return data[0];
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${h12}:${minutes} ${ampm}`;
}

function formatSeating(zone) {
  const zones = {
    'any': 'No Preference',
    'indoor': 'Indoor',
    'patio': 'Patio',
    'garden': 'Garden'
  };
  return zones[zone] || zone || 'No Preference';
}

function generateEmailHtml(reservation) {
  const confirmationCode = reservation.id.slice(0, 8).toUpperCase();
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f5f3ef;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #A65D3F; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: normal; letter-spacing: 2px; font-family: 'Playfair Display', Georgia, serif;">LA LUNA</h1>
              <p style="color: #D4C9B5; margin: 10px 0 0; font-size: 14px; letter-spacing: 1px;">PLAYA PELADA · NOSARA</p>
            </td>
          </tr>

          <!-- Confirmation Badge -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <p style="color: #A65D3F; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Reservation Confirmed</p>
              <p style="color: #1A1F16; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 3px;">${confirmationCode}</p>
            </td>
          </tr>

          <!-- Reservation Details -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FDFBF7; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #eee;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                          <p style="color: #1A1F16; margin: 0; font-size: 18px; font-weight: bold;">${formatDate(reservation.date)}</p>
                        </td>
                        <td width="50%" style="text-align: right;">
                          <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</p>
                          <p style="color: #1A1F16; margin: 0; font-size: 18px; font-weight: bold;">${formatTime(reservation.time)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Party Size</p>
                          <p style="color: #1A1F16; margin: 0; font-size: 18px; font-weight: bold;">${reservation.guests} guests</p>
                        </td>
                        <td width="50%" style="text-align: right;">
                          <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Seating</p>
                          <p style="color: #1A1F16; margin: 0; font-size: 18px; font-weight: bold;">${formatSeating(reservation.zone_preference)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest Name -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reserved for</p>
              <p style="color: #A65D3F; margin: 0; font-size: 28px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">${reservation.guest_name}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #A65D3F, transparent);"></div>
            </td>
          </tr>

          <!-- Restaurant Info -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <p style="color: #1A1F16; margin: 0 0 8px; font-size: 16px; font-weight: bold;">La Luna Restaurant</p>
              <p style="color: #57534e; margin: 0 0 4px; font-size: 14px;">Playa Pelada, Nosara</p>
              <p style="color: #57534e; margin: 0 0 4px; font-size: 14px;">Guanacaste, Costa Rica</p>
              <p style="color: #57534e; margin: 0; font-size: 14px;">+506 2682-0122</p>
              <a href="https://maps.google.com/?q=La+Luna+Restaurant+Nosara" style="color: #A65D3F; font-size: 14px; text-decoration: none; display: inline-block; margin-top: 12px;">View on Map →</a>
            </td>
          </tr>

          <!-- Important Notes -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEF9F6; border-left: 4px solid #A65D3F; padding: 16px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="color: #A65D3F; margin: 0 0 8px; font-size: 14px; font-weight: bold;">Please Note</p>
                    <p style="color: #57534e; margin: 0; font-size: 14px; line-height: 1.6;">Please arrive within 15 minutes of your reservation time. For parties of 6+, we may need to confirm by phone.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1A1F16; padding: 30px 40px; text-align: center;">
              <p style="color: #D4C9B5; margin: 0 0 8px; font-size: 16px; font-style: italic;">Where the ocean meets the table</p>
              <p style="color: #78716c; margin: 0; font-size: 12px;">Questions? Reply to this email or call +506 2682-0122</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function sendEmail(to, subject, htmlBody) {
  const mml = `From: "La Luna Restaurant" <reservations@lalunanosara.com>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=utf-8

${htmlBody}`;

  // Write to temp file and send via himalaya
  const fs = require('fs');
  const tmpFile = '/tmp/laluna-email.mml';
  fs.writeFileSync(tmpFile, mml);
  
  try {
    execSync(`himalaya message send -a laluna-restaurant < ${tmpFile}`, { stdio: 'inherit' });
    console.log('Email sent successfully!');
  } catch (e) {
    console.error('Failed to send email:', e.message);
  }
}

async function main() {
  const reservationId = process.argv[2];
  
  if (!reservationId) {
    console.error('Usage: node send-confirmation.cjs <reservation-id>');
    process.exit(1);
  }

  console.log('Fetching reservation:', reservationId);
  const reservation = await getReservation(reservationId);
  
  if (!reservation) {
    console.error('Reservation not found');
    process.exit(1);
  }

  if (!reservation.guest_email) {
    console.error('No email address for this reservation');
    process.exit(1);
  }

  console.log('Generating email for:', reservation.guest_name);
  const html = generateEmailHtml(reservation);
  
  console.log('Sending to:', reservation.guest_email);
  sendEmail(
    reservation.guest_email,
    'Your Reservation at La Luna is Confirmed ✓',
    html
  );
}

main();
