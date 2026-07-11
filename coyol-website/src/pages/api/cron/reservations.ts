import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = import.meta.env.SUPABASE_SERVICE_KEY || 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng';
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const CRON_SECRET = import.meta.env.CRON_SECRET;

function verifyCron(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return false;
  }
  return true;
}

async function getPendingReservations(table: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?status=eq.confirmed&email_sent=eq.false&select=*`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function markEmailSent(table: string, id: string) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_sent: true }),
    }
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${minutes} ${ampm}`;
}

function getConfirmationEmail(reservation: any, restaurant: 'laluna' | 'coyol') {
  const restaurantName = restaurant === 'laluna' ? 'La Luna' : 'Coyol';
  const restaurantEmail = restaurant === 'laluna' ? 'reservations@lalunanosara.com' : 'reservations@coyolrestaurant.com';
  const phone = restaurant === 'laluna' ? '+506 8996-8221' : '+506 8632-9590';
  const waPhone = restaurant === 'laluna' ? '50689968221' : '50686329590';
  const logoUrl = restaurant === 'laluna' 
    ? 'https://coyolnosara.com/images/luna-moon-black.png' 
    : 'https://coyolnosara.com/images/coyol-restaurant-logo-black.png';
  const mapsSearch = restaurant === 'laluna' 
    ? 'La+Luna+Restaurant+Nosara+Costa+Rica' 
    : 'Coyol+Restaurant+Nosara+Costa+Rica';

  const dateStr = formatDate(reservation.date);
  const timeStr = formatTime(reservation.time);
  const waText = encodeURIComponent(`Hi, I need to cancel my reservation. Name: ${reservation.guest_name}, Date: ${dateStr}, Time: ${timeStr}`);
  const cancelUrl = `https://wa.me/${waPhone}?text=${waText}`;

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#f5f3ef;font-family:Georgia,serif;"><table width="100%" style="background-color:#f5f3ef;padding:40px 20px;"><tr><td align="center"><table width="500" style="max-width:500px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);"><tr><td align="center" style="padding:40px 40px 20px 40px;"><img src="${logoUrl}" alt="${restaurantName}" width="60" height="60" style="margin-bottom:15px;" /><h1 style="color:#1A1F16;font-size:28px;margin:0;font-weight:normal;font-style:italic;">${restaurantName}</h1><p style="color:#666;margin:5px 0 0 0;font-size:14px;">Reservation Confirmed</p></td></tr><tr><td style="padding:20px 40px;"><p style="color:#1A1F16;font-size:16px;margin:0 0 10px 0;">Dear ${reservation.guest_name},</p><p style="color:#444;font-size:15px;line-height:1.6;margin:0;">Your reservation at ${restaurantName} has been confirmed. We look forward to welcoming you!</p></td></tr><tr><td style="padding:0 40px 30px 40px;"><table width="100%" style="background:#f9f8f6;border-radius:8px;"><tr><td style="padding:12px 15px;color:#888;font-size:14px;">Date</td><td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${dateStr}</td></tr><tr><td style="padding:12px 15px;color:#888;font-size:14px;">Time</td><td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${timeStr}</td></tr><tr><td style="padding:12px 15px;color:#888;font-size:14px;">Party Size</td><td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${reservation.guests || reservation.party_size} guests</td></tr></table></td></tr><tr><td align="center" style="padding:0 40px 30px 40px;"><a href="https://www.google.com/maps/search/${mapsSearch}" style="display:inline-block;background-color:#1A1F16;color:white;text-decoration:none;padding:14px 35px;border-radius:6px;font-size:15px;">Get Directions</a></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #eee;"><p style="color:#888;font-size:13px;margin:0 0 10px 0;"><strong>Need to cancel?</strong></p><a href="${cancelUrl}" style="color:#1A1F16;font-size:13px;">Message us on WhatsApp</a></td></tr><tr><td align="center" style="padding:20px 40px 30px 40px;background:#f9f8f6;"><p style="color:#888;font-size:12px;margin:0;">${restaurantName} Restaurant - Guiones, Nosara - ${phone}</p></td></tr></table></td></tr></table></body></html>`;

  return {
    from: `${restaurantName} Restaurant <${restaurantEmail}>`,
    to: reservation.guest_email,
    subject: `Reservation Confirmed - ${restaurantName} Restaurant`,
    html: html,
  };
}

export const GET: APIRoute = async ({ request }) => {
  if (!verifyCron(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
  }

  const resend = new Resend(RESEND_API_KEY);
  const results = { laluna: 0, coyol: 0, errors: [] as string[] };

  // Process La Luna reservations
  try {
    const lalunaRes = await getPendingReservations('laluna_reservations');
    for (const res of lalunaRes) {
      try {
        await resend.emails.send(getConfirmationEmail(res, 'laluna'));
        await markEmailSent('laluna_reservations', res.id);
        results.laluna++;
      } catch (err: any) {
        results.errors.push(`La Luna ${res.id}: ${err.message}`);
      }
    }
  } catch (err: any) {
    results.errors.push(`La Luna fetch error: ${err.message}`);
  }

  // Process Coyol reservations
  try {
    const coyolRes = await getPendingReservations('coyol_reservations');
    for (const res of coyolRes) {
      try {
        await resend.emails.send(getConfirmationEmail(res, 'coyol'));
        await markEmailSent('coyol_reservations', res.id);
        results.coyol++;
      } catch (err: any) {
        results.errors.push(`Coyol ${res.id}: ${err.message}`);
      }
    }
  } catch (err: any) {
    results.errors.push(`Coyol fetch error: ${err.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    sent: {
      laluna: results.laluna,
      coyol: results.coyol,
    },
    errors: results.errors,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
