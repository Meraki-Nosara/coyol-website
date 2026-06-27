#!/usr/bin/env node
/**
 * Send reservation confirmation email for La Luna Restaurant
 * Usage: node send-laluna-confirmation.js <reservation-id>
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

function generateEmailHtml(reservation) {
  const confirmationCode = reservation.id.slice(0, 8).toUpperCase();
  const cancelUrl = `https://coyolnosara.com/laluna/cancel?token=${reservation.cancel_token}`;
  
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 2px;">RESERVATION CONFIRMED</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 16px;">La Luna Restaurant</p>
            </td>
          </tr>

          <!-- Confirmation Code -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #eee;">
              <p style="color: #888; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Confirmation Code</p>
              <p style="color: #A65D3F; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 3px;">${confirmationCode}</p>
            </td>
          </tr>

          <!-- Reservation Details -->
          <tr>
            <td style="padding: 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Date</p>
                    <p style="color: #333; margin: 0; font-size: 20px;">${formatDate(reservation.date)}</p>
                  </td>
                  <td width="50%" style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Time</p>
                    <p style="color: #333; margin: 0; font-size: 20px;">${formatTime(reservation.time)}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 15px 0;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Party Size</p>
                    <p style="color: #333; margin: 0; font-size: 20px;">${reservation.guests} guests</p>
                  </td>
                  <td width="50%" style="padding: 15px 0; text-align: right;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Reserved for</p>
                    <p style="color: #333; margin: 0; font-size: 20px;">${reservation.guest_name}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Restaurant Info -->
          <tr>
            <td style="padding: 20px 40px 30px; text-align: center; background: #faf9f7;">
              <p style="color: #333; margin: 0 0 8px; font-size: 16px; font-weight: bold;">La Luna Restaurant</p>
              <p style="color: #666; margin: 0 0 4px; font-size: 14px;">Guiones, Nosara, Costa Rica</p>
              <p style="color: #666; margin: 0; font-size: 14px;">+506 8996-8221</p>
            </td>
          </tr>

          <!-- Buttons -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center;">
              <a href="${cancelUrl}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #A65D3F; text-decoration: none; border-radius: 4px; font-size: 14px; border: 2px solid #A65D3F; font-weight: bold;">Cancel Reservation</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #A65D3F; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 8px; font-size: 14px; opacity: 0.9;">We look forward to welcoming you</p>
              <p style="color: #ffffff; margin: 0; font-size: 12px; opacity: 0.7;">Questions? Reply to this email or call +506 8996-8221</p>
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
    console.error('Usage: node send-laluna-confirmation.js <reservation-id>');
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
    'Your Reservation at La Luna Restaurant is Confirmed',
    html
  );
}

main();
