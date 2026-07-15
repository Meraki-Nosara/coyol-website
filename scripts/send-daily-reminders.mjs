#!/usr/bin/env node
/**
 * Daily Reservation Reminder Emails - 8am Costa Rica
 * Purpose: Remind guests about tonight's reservation
 * Goal: Get no-shows to cancel so we can free up tables
 */

const RESEND_API_KEY = 're_EJWDiPdh_DJZQhsSJUzyNwpLdzAfoVdgW';
const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng';

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${minutes} ${ampm}`;
}

function getLaLunaEmailHtml(r) {
  const color = '#A65D3F';
  const waCancel = `https://wa.me/50689968221?text=${encodeURIComponent(`Hi, I need to cancel my reservation tonight. Name: ${r.guest_name}`)}`;
  
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f5f3ef;font-family:Georgia,serif;">
  <table width="100%" style="background-color:#f5f3ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="500" style="max-width:500px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <tr><td align="center" style="padding:40px 40px 20px 40px;">
          <img src="https://coyolnosara.com/images/laluna-moon-white-real.png" alt="La Luna" width="60" height="60" style="margin-bottom:15px;" />
          <h1 style="color:${color};font-size:28px;margin:0;font-weight:normal;font-style:italic;">La Luna</h1>
          <p style="color:#666;margin:5px 0 0 0;font-size:14px;">Reminder: Tonight's Reservation</p>
        </td></tr>
        <tr><td style="padding:20px 40px;">
          <p style="color:#1A1F16;font-size:16px;margin:0 0 15px 0;">Hi ${r.guest_name.split(' ')[0]},</p>
          <p style="color:#444;font-size:15px;line-height:1.6;margin:0;">
            Just a friendly reminder — we have you down for <strong>${formatTime(r.time)} tonight</strong> (party of ${r.guests}).
          </p>
          <p style="color:#444;font-size:15px;line-height:1.6;margin:15px 0 0 0;">
            We're looking forward to seeing you! If your plans have changed, please let us know so we can open the table for other guests.
          </p>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <table width="100%" style="background:#f9f8f6;border-radius:8px;">
            <tr>
              <td style="padding:15px;color:#888;font-size:14px;">Tonight at</td>
              <td style="padding:15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:16px;">${formatTime(r.time)}</td>
            </tr>
            <tr>
              <td style="padding:15px;color:#888;font-size:14px;">Party of</td>
              <td style="padding:15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:16px;">${r.guests}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 15px 40px;">
          <a href="https://maps.app.goo.gl/QFZ9kFPgaHdPWUUU6" style="display:inline-block;background-color:${color};color:white;text-decoration:none;padding:14px 35px;border-radius:6px;font-size:15px;">Get Directions</a>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 30px 40px;">
          <a href="${waCancel}" style="display:inline-block;background-color:#f5f3ef;color:#666;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;border:1px solid #ddd;">Can't make it? Let us know</a>
        </td></tr>
        <tr><td align="center" style="padding:20px 40px 30px 40px;background:#f9f8f6;">
          <p style="color:#888;font-size:12px;margin:0;">La Luna · Playa Guiones, Nosara · +506 8996-8221</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function getCoyolEmailHtml(r) {
  const color = '#3D4F3D';
  const waCancel = `https://wa.me/50688187775?text=${encodeURIComponent(`Hi, I need to cancel my reservation tonight. Name: ${r.guest_name}`)}`;
  
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f5f3ef;font-family:Georgia,serif;">
  <table width="100%" style="background-color:#f5f3ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="500" style="max-width:500px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <tr><td align="center" style="padding:40px 40px 20px 40px;">
          <img src="https://coyolnosara.com/images/logos/coyol-restaurant-text-logo-green.png" alt="Coyol" width="120" style="margin-bottom:15px;" />
          <p style="color:#666;margin:5px 0 0 0;font-size:14px;">Reminder: Tonight's Reservation</p>
        </td></tr>
        <tr><td style="padding:20px 40px;">
          <p style="color:#1A1F16;font-size:16px;margin:0 0 15px 0;">Hi ${r.guest_name.split(' ')[0]},</p>
          <p style="color:#444;font-size:15px;line-height:1.6;margin:0;">
            Just a friendly reminder — we have you down for <strong>${formatTime(r.time)} tonight</strong> (party of ${r.guests}).
          </p>
          <p style="color:#444;font-size:15px;line-height:1.6;margin:15px 0 0 0;">
            We're looking forward to seeing you! If your plans have changed, please let us know so we can open the table for other guests.
          </p>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <table width="100%" style="background:#f9f8f6;border-radius:8px;">
            <tr>
              <td style="padding:15px;color:#888;font-size:14px;">Tonight at</td>
              <td style="padding:15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:16px;">${formatTime(r.time)}</td>
            </tr>
            <tr>
              <td style="padding:15px;color:#888;font-size:14px;">Party of</td>
              <td style="padding:15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:16px;">${r.guests}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 15px 40px;">
          <a href="https://www.google.com/maps/search/Coyol+Restaurant+Nosara+Costa+Rica" style="display:inline-block;background-color:${color};color:white;text-decoration:none;padding:14px 35px;border-radius:6px;font-size:15px;">Get Directions</a>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 30px 40px;">
          <a href="${waCancel}" style="display:inline-block;background-color:#f5f3ef;color:#666;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;border:1px solid #ddd;">Can't make it? Let us know</a>
        </td></tr>
        <tr><td align="center" style="padding:20px 40px 30px 40px;background:#f9f8f6;">
          <p style="color:#888;font-size:12px;margin:0;">Coyol Restaurant · Mar Azul, Nosara · +506 8818-7775</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function getTodayReservations(restaurant) {
  const table = restaurant === 'laluna' ? 'laluna_reservations' : 'coyol_reservations';
  const today = new Date().toISOString().split('T')[0];
  
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?select=*&date=eq.${today}&status=eq.confirmed`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  );
  
  const data = await res.json();
  // Only those with valid email AND not already reminded
  return data.filter(r => r.guest_email && r.guest_email.includes('@') && !r.email_sent);
}

async function sendEmail(to, subject, html, from) {
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
      console.error(`  ❌ Failed ${to}: ${error.substring(0, 100)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`  ❌ Error ${to}: ${e.message}`);
    return false;
  }
}

async function markEmailSent(restaurant, id) {
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
  console.log(`\n📧 Daily Reminder Emails - ${today} @ 8am\n`);
  
  let totalSent = 0;
  
  // La Luna
  const lalunaRes = await getTodayReservations('laluna');
  console.log(`🌙 La Luna: ${lalunaRes.length} guests to remind`);
  
  for (const r of lalunaRes) {
    const html = getLaLunaEmailHtml(r);
    const ok = await sendEmail(
      r.guest_email,
      `Reminder: La Luna tonight at ${formatTime(r.time)}`,
      html,
      'La Luna Restaurant <reservations@lalunanosara.com>'
    );
    
    if (ok) {
      await markEmailSent('laluna', r.id);
      console.log(`  ✅ ${r.guest_name}`);
      totalSent++;
    }
    await new Promise(r => setTimeout(r, 150));
  }
  
  // Coyol
  const coyolRes = await getTodayReservations('coyol');
  console.log(`\n🌿 Coyol: ${coyolRes.length} guests to remind`);
  
  for (const r of coyolRes) {
    const html = getCoyolEmailHtml(r);
    const ok = await sendEmail(
      r.guest_email,
      `Reminder: Coyol tonight at ${formatTime(r.time)}`,
      html,
      'Coyol Restaurant <reservations@coyolrestaurant.com>'
    );
    
    if (ok) {
      await markEmailSent('coyol', r.id);
      console.log(`  ✅ ${r.guest_name}`);
      totalSent++;
    }
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log(`\n✉️  Total sent: ${totalSent}\n`);
}

main().catch(console.error);
