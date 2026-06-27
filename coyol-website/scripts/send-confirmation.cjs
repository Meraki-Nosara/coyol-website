#!/usr/bin/env node
/**
 * Send reservation confirmation email for Coyol Restaurant
 * Usage: node send-confirmation.js <reservation-id>
 * 
 * This script is called by a Supabase webhook or manually to send confirmation emails
 */

const { execSync } = require('child_process');

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

async function getReservation(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/coyol_reservations?id=eq.${id}&select=*`, {
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
    'terrace': 'Terrace',
    'bar': 'Bar'
  };
  return zones[zone] || zone || 'No Preference';
}

function generateEmailHtml(reservation) {
  const confirmationCode = reservation.id.slice(0, 8).toUpperCase();
  const cancelUrl = `https://coyolnosara.com/restaurant/cancel?token=${reservation.cancel_token}`;
  
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
            <td style="background-color: #3D4F3D; padding: 40px; text-align: center;">
              <img src="data:image/png;base64,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" alt="Coyol" style="height: 60px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 2px;">RESERVATION CONFIRMED</h1>
            </td>
          </tr>

          <!-- Confirmation Code -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #eee;">
              <p style="color: #888; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Confirmation Code</p>
              <p style="color: #3D4F3D; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 3px;">${confirmationCode}</p>
            </td>
          </tr>

          <!-- Reservation Details -->
          <tr>
            <td style="padding: 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Date</p>
                    <p style="color: #333; margin: 0; font-size: 22px;">${formatDate(reservation.date)}</p>
                  </td>
                  <td width="50%" style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Time</p>
                    <p style="color: #333; margin: 0; font-size: 22px;">${formatTime(reservation.time)}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 15px 0;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Party Size</p>
                    <p style="color: #333; margin: 0; font-size: 22px;">${reservation.guests} guests</p>
                  </td>
                  <td width="50%" style="padding: 15px 0; text-align: right;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Seating</p>
                    <p style="color: #333; margin: 0; font-size: 22px;">${formatSeating(reservation.zone_preference)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest Name -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <p style="color: #888; margin: 0 0 4px; font-size: 14px; text-transform: uppercase;">Reserved for</p>
              <p style="color: #3D4F3D; margin: 0; font-size: 26px; font-weight: bold;">${reservation.guest_name}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #3D4F3D, transparent);"></div>
            </td>
          </tr>

          <!-- Restaurant Info -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <p style="color: #333; margin: 0 0 8px; font-size: 16px; font-weight: bold;">Coyol Restaurant</p>
              <p style="color: #666; margin: 0 0 4px; font-size: 14px;">Nosara, Guanacaste, Costa Rica</p>
              <p style="color: #666; margin: 0; font-size: 14px;">+506 2682-1280</p>
              <a href="https://maps.google.com/?q=Coyol+Restaurant+Nosara" style="color: #3D4F3D; font-size: 14px; text-decoration: none; display: inline-block; margin-top: 12px;">View on Map</a>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="text-align: center;">
                    <a href="${cancelUrl}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #3D4F3D; text-decoration: none; border-radius: 4px; font-size: 14px; border: 2px solid #3D4F3D; font-weight: bold;">Cancel Reservation</a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="text-align: center;">
                    <a href="https://coyolrealestate.com/restaurant/gift" style="display: inline-block; padding: 14px 28px; background-color: #C4A67C; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Gift a Friend</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #3D4F3D; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 8px; font-size: 14px; opacity: 0.9;">We look forward to welcoming you</p>
              <p style="color: #ffffff; margin: 0; font-size: 12px; opacity: 0.7;">Questions? Reply to this email or call +506 2682-1280</p>
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
  const mml = `From: "Coyol Restaurant" <reservations@coyolrestaurant.com>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=utf-8

${htmlBody}`;

  // Write to temp file and send via himalaya
  const fs = require('fs');
  const tmpFile = '/tmp/coyol-email.mml';
  fs.writeFileSync(tmpFile, mml);
  
  try {
    execSync(`himalaya message send -a coyol-restaurant < ${tmpFile}`, { stdio: 'inherit' });
    console.log('Email sent successfully!');
  } catch (e) {
    console.error('Failed to send email:', e.message);
  }
}

async function main() {
  const reservationId = process.argv[2];
  
  if (!reservationId) {
    console.error('Usage: node send-confirmation.js <reservation-id>');
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
    'Your Reservation at Coyol Restaurant is Confirmed',
    html
  );
}

main();
