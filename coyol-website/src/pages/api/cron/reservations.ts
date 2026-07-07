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
  // Get confirmed reservations from last 24 hours that haven't been emailed
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?status=eq.confirmed&confirmation_sent=is.null&created_at=gte.${yesterday}&select=*`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  return res.json();
}

async function markConfirmationSent(table: string, id: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      confirmation_sent: new Date().toISOString(),
    }),
  });
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
  const color = restaurant === 'laluna' ? '#C4A67C' : '#3D4F3D';
  const phone = restaurant === 'laluna' ? '+506 8996-8221' : '+506 8632-9590';
  const domain = restaurant === 'laluna' ? 'lalunanosara.com' : 'coyolrestaurant.com';
  const mapUrl = restaurant === 'laluna' 
    ? 'https://maps.app.goo.gl/QFZ9kFPgaHdPWUUU6' 
    : 'https://maps.app.goo.gl/coyolnosara';

  return {
    from: `${restaurantName} Restaurant <${restaurantEmail}>`,
    to: reservation.guest_email,
    subject: `Reservation Confirmed - ${restaurantName} Restaurant`,
    html: `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #1A1F16; font-family: Georgia, serif;">
  <table width="100%" style="background-color: #1A1F16; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" style="max-width: 500px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: ${color}; font-size: 28px; margin: 0; font-weight: normal; font-style: italic;">${restaurantName}</h1>
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Reservation Confirmed</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 30px;">
              <p style="color: #F5F3EF; font-size: 18px; margin: 0 0 10px 0;">Dear ${reservation.guest_name},</p>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                Your reservation at ${restaurantName} has been confirmed. We look forward to welcoming you!
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <table width="100%" style="font-size: 14px; color: #F5F3EF;">
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Date</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatDate(reservation.date)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Time</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatTime(reservation.time)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Party Size</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${reservation.party_size} ${reservation.party_size === 1 ? 'guest' : 'guests'}</td>
                </tr>
                ${reservation.seating_preference ? `
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Seating</td>
                  <td style="padding: 8px 0; text-align: right;">${reservation.seating_preference}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          ${reservation.special_requests ? `
          <tr>
            <td style="padding: 20px 0 0 0;">
              <p style="color: ${color}; font-size: 14px; margin: 0 0 5px 0;">Special Requests:</p>
              <p style="color: #F5F3EF; opacity: 0.8; font-size: 14px; margin: 0; font-style: italic;">"${reservation.special_requests}"</p>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="${mapUrl}" style="display: inline-block; background-color: ${color}; color: #1A1F16; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Get Directions</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #F5F3EF; opacity: 0.7; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong>Need to modify or cancel?</strong><br>
                Please contact us at ${phone} or reply to this email at least 2 hours before your reservation.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px;">
              <p style="color: #F5F3EF; opacity: 0.5; font-size: 12px; margin: 0;">
                ${restaurantName} Restaurant<br>Guiones, Nosara, Costa Rica<br>${phone}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
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
        await markConfirmationSent('laluna_reservations', res.id);
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
        await markConfirmationSent('coyol_reservations', res.id);
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
