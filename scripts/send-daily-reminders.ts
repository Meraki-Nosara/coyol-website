#!/usr/bin/env npx ts-node
/**
 * Daily Reservation Reminder Emails
 * Runs at 8am Costa Rica time
 * Sends reminder to all guests with reservations TODAY
 */

const RESEND_API_KEY = 're_EJWDiPdh_DJZQhsSJUzyNwpLdzAfoVdgW';
const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng';

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  date: string;
  time: string;
  guests: number;
  zone_preference?: string;
  special_requests?: string;
  email_sent: boolean;
  status: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${minutes} ${ampm}`;
}

function getLaLunaEmailHtml(r: Reservation): string {
  const color = '#A65D3F'; // Terracotta
  const waText = encodeURIComponent(`Hi, I need to modify my reservation. Name: ${r.guest_name}, Date: ${formatDate(r.date)}, Time: ${formatTime(r.time)}`);
  const cancelUrl = `https://wa.me/50689968221?text=${waText}`;
  
  return `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: Georgia, serif;">
  <table width="100%" style="background-color: #f5f3ef; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" style="max-width: 500px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <img src="https://coyolnosara.com/images/laluna-moon-white-real.png" alt="La Luna" width="60" height="60" style="margin-bottom: 15px;" />
              <h1 style="color: ${color}; font-size: 28px; margin: 0; font-weight: normal; font-style: italic;">La Luna</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Reservation Reminder</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #1A1F16; font-size: 16px; margin: 0 0 10px 0;">Dear ${r.guest_name.split(' ')[0]},</p>
              <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">
                This is a friendly reminder about your reservation <strong>tonight</strong> at La Luna. We look forward to welcoming you!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" style="background: #f9f8f6; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 15px; color: #888; font-size: 14px;">Time</td>
                  <td style="padding: 12px 15px; text-align: right; color: #1A1F16; font-weight: bold; font-size: 14px;">${formatTime(r.time)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #888; font-size: 14px;">Party Size</td>
                  <td style="padding: 12px 15px; text-align: right; color: #1A1F16; font-weight: bold; font-size: 14px;">${r.guests} ${r.guests === 1 ? 'guest' : 'guests'}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 30px 40px;">
              <a href="https://maps.app.goo.gl/QFZ9kFPgaHdPWUUU6" style="display: inline-block; background-color: ${color}; color: white; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-size: 15px;">Get Directions</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 13px; margin: 0 0 10px 0;"><strong>Need to cancel or modify?</strong></p>
              <a href="${cancelUrl}" style="color: ${color}; font-size: 13px;">Message us on WhatsApp</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 40px 30px 40px; background: #f9f8f6;">
              <p style="color: #888; font-size: 12px; margin: 0;">La Luna Restaurant · Playa Guiones, Nosara · +506 8996-8221</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getCoyolEmailHtml(r: Reservation): string {
  const color = '#3D4F3D'; // Keswick Green
  const waText = encodeURIComponent(`Hi, I need to modify my reservation. Name: ${r.guest_name}, Date: ${formatDate(r.date)}, Time: ${formatTime(r.time)}`);
  const cancelUrl = `https://wa.me/50688187775?text=${waText}`;
  
  return `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: Georgia, serif;">
  <table width="100%" style="background-color: #f5f3ef; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" style="max-width: 500px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <img src="https://coyolnosara.com/images/logos/coyol-restaurant-text-logo-green.png" alt="Coyol" width="120" style="margin-bottom: 15px;" />
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Reservation Reminder</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #1A1F16; font-size: 16px; margin: 0 0 10px 0;">Dear ${r.guest_name.split(' ')[0]},</p>
              <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">
                This is a friendly reminder about your reservation <strong>tonight</strong> at Coyol Restaurant. We look forward to welcoming you!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" style="background: #f9f8f6; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 15px; color: #888; font-size: 14px;">Time</td>
                  <td style="padding: 12px 15px; text-align: right; color: #1A1F16; font-weight: bold; font-size: 14px;">${formatTime(r.time)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; color: #888; font-size: 14px;">Party Size</td>
                  <td style="padding: 12px 15px; text-align: right; color: #1A1F16; font-weight: bold; font-size: 14px;">${r.guests} ${r.guests === 1 ? 'guest' : 'guests'}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 30px 40px;">
              <a href="https://www.google.com/maps/search/Coyol+Restaurant+Nosara+Costa+Rica" style="display: inline-block; background-color: ${color}; color: white; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-size: 15px;">Get Directions</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 13px; margin: 0 0 10px 0;"><strong>Need to cancel or modify?</strong></p>
              <a href="${cancelUrl}" style="color: ${color}; font-size: 13px;">Message us on WhatsApp</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 40px 30px 40px; background: #f9f8f6;">
              <p style="color: #888; font-size: 12px; margin: 0;">Coyol Restaurant · Mar Azul, Nosara · +506 8818-7775</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function getTodayReservations(restaurant: 'laluna' | 'coyol'): Promise<Reservation[]> {
  const table = restaurant === 'laluna' ? 'laluna_reservations' : 'coyol_reservations';
  const today = new Date().toISOString().split('T')[0];
  
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?select=*&date=eq.${today}&status=eq.confirmed&email_sent=eq.false`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  );
  
  const data = await res.json();
  // Filter only those with valid email addresses
  return data.filter((r: Reservation) => r.guest_email && r.guest_email.includes('@'));
}

async function sendEmail(to: string, subject: string, html: string, from: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html })
    });
    
    if (!res.ok) {
      const error = await res.text();
      console.error(`Failed to send to ${to}:`, error);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`Error sending to ${to}:`, e);
    return false;
  }
}

async function markEmailSent(restaurant: 'laluna' | 'coyol', id: string): Promise<void> {
  const table = restaurant === 'laluna' ? 'laluna_reservations' : 'coyol_reservations';
  
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ email_sent: true })
  });
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n📧 Daily Reminder Emails - ${today}\n`);
  
  let totalSent = 0;
  let totalFailed = 0;
  
  // La Luna
  const lalunaReservations = await getTodayReservations('laluna');
  console.log(`La Luna: ${lalunaReservations.length} reservations to remind`);
  
  for (const r of lalunaReservations) {
    const html = getLaLunaEmailHtml(r);
    const success = await sendEmail(
      r.guest_email,
      `Reminder: Your La Luna Reservation Tonight at ${formatTime(r.time)}`,
      html,
      'La Luna Restaurant <reservations@lalunanosara.com>'
    );
    
    if (success) {
      await markEmailSent('laluna', r.id);
      console.log(`  ✅ ${r.guest_name} <${r.guest_email}>`);
      totalSent++;
    } else {
      console.log(`  ❌ ${r.guest_name} <${r.guest_email}>`);
      totalFailed++;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Coyol
  const coyolReservations = await getTodayReservations('coyol');
  console.log(`\nCoyol: ${coyolReservations.length} reservations to remind`);
  
  for (const r of coyolReservations) {
    const html = getCoyolEmailHtml(r);
    const success = await sendEmail(
      r.guest_email,
      `Reminder: Your Coyol Reservation Tonight at ${formatTime(r.time)}`,
      html,
      'Coyol Restaurant <reservations@coyolrestaurant.com>'
    );
    
    if (success) {
      await markEmailSent('coyol', r.id);
      console.log(`  ✅ ${r.guest_name} <${r.guest_email}>`);
      totalSent++;
    } else {
      console.log(`  ❌ ${r.guest_name} <${r.guest_email}>`);
      totalFailed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 Summary: ${totalSent} sent, ${totalFailed} failed\n`);
}

main().catch(console.error);
