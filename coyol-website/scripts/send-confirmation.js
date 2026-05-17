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
  const cancelUrl = `https://coyolrealestate.com/restaurant/cancel?token=${reservation.cancel_token}`;
  
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
              <img src="https://coyolrealestate.com/images/logos/coyol-white.png" alt="Coyol" style="height: 60px; margin-bottom: 16px;">
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
                    <p style="color: #888; margin: 0 0 4px; font-size: 12px; text-transform: uppercase;">Date</p>
                    <p style="color: #333; margin: 0; font-size: 18px;">${formatDate(reservation.date)}</p>
                  </td>
                  <td width="50%" style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 12px; text-transform: uppercase;">Time</p>
                    <p style="color: #333; margin: 0; font-size: 18px;">${formatTime(reservation.time)}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 15px 0;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 12px; text-transform: uppercase;">Party Size</p>
                    <p style="color: #333; margin: 0; font-size: 18px;">${reservation.guests} guests</p>
                  </td>
                  <td width="50%" style="padding: 15px 0; text-align: right;">
                    <p style="color: #888; margin: 0 0 4px; font-size: 12px; text-transform: uppercase;">Seating</p>
                    <p style="color: #333; margin: 0; font-size: 18px;">${formatSeating(reservation.zone_preference)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest Name -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <p style="color: #888; margin: 0 0 4px; font-size: 12px; text-transform: uppercase;">Reserved for</p>
              <p style="color: #3D4F3D; margin: 0; font-size: 22px; font-weight: bold;">${reservation.guest_name}</p>
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
                    <a href="https://coyolrealestate.com/restaurant/gift" style="display: inline-block; padding: 14px 28px; background-color: #C4A67C; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: bold;">Gift a Friend</a>
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
