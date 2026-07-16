import type { APIRoute } from 'astro';

// Morning reminder emails - runs daily at 8am Costa Rica time
// Sends confirmation emails to all guests with reservations TODAY

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng';
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

function formatTime12(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

async function sendRemindersForRestaurant(restaurant: 'laluna' | 'coyol', today: string) {
  const table = restaurant === 'laluna' ? 'laluna_reservations' : 'coyol_reservations';
  const restaurantName = restaurant === 'laluna' ? 'La Luna' : 'Coyol Restaurant';
  const fromEmail = restaurant === 'laluna' 
    ? 'La Luna <reservations@lalunanosara.com>'
    : 'Coyol Restaurant <reservations@coyolrestaurant.com>';
  const cancelUrl = restaurant === 'laluna' 
    ? 'https://coyolnosara.com/laluna/cancel' 
    : 'https://coyolnosara.com/restaurant/cancel';
  const logo = restaurant === 'laluna'
    ? 'https://coyolnosara.com/images/laluna-moon-white-real.png'
    : 'https://coyolnosara.com/images/coyol-logo.png';
  const bgColor = restaurant === 'laluna' ? '#A65D3F' : '#3D4F3D';

  // Fetch all confirmed reservations for today with email addresses
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?date=eq.${today}&status=neq.cancelled&select=*`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    }
  );

  if (!res.ok) {
    console.error(`Failed to fetch ${restaurant} reservations:`, await res.text());
    return { sent: 0, errors: [`Failed to fetch ${restaurant} reservations`] };
  }

  const reservations = await res.json();
  
  // Filter only those with valid emails
  const withEmail = reservations.filter((r: any) => 
    r.guest_email && 
    r.guest_email.includes('@') && 
    r.status !== 'cancelled'
  );

  let sent = 0;
  const errors: string[] = [];

  for (const reservation of withEmail) {
    try {
      const guestName = reservation.guest_name || reservation.name || 'Guest';
      const time = formatTime12(reservation.time);
      const partySize = reservation.guests || reservation.party_size || 2;
      const cancelLink = `${cancelUrl}?token=${reservation.cancel_token}`;
      // Don't include notes in morning reminders - they already know their request

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: reservation.guest_email,
          subject: `See you tonight! Your reservation at ${restaurantName}`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ef;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background-color: ${bgColor}; padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">
        ${restaurantName.toUpperCase()}
      </h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">
        Nosara, Costa Rica
      </p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1f16; margin: 0 0 20px; font-size: 24px; font-weight: 400;">
        ¡Nos vemos esta noche! 🌟
      </h2>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        Hola <strong>${guestName}</strong>,<br><br>
        Este es un recordatorio amigable de tu reservación para <strong>hoy</strong>.
      </p>
      
      <!-- Reservation Details Box -->
      <div style="background-color: #f8f7f5; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 14px;">Hora</td>
            <td style="padding: 8px 0; color: #1a1f16; font-size: 16px; font-weight: 600; text-align: right;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 14px;">Personas</td>
            <td style="padding: 8px 0; color: #1a1f16; font-size: 16px; font-weight: 600; text-align: right;">${partySize}</td>
          </tr>
          
        </table>
      </div>
      
      <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
        Si necesitas cancelar o modificar tu reservación, por favor avísanos lo antes posible.
      </p>
      
      <!-- Cancel Link -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${cancelLink}" style="color: #888; font-size: 13px; text-decoration: underline;">
          Cancelar reservación
        </a>
      </div>
      
      <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin: 0;">
        ¡Te esperamos! 🍽️<br><br>
        <strong>El equipo de ${restaurantName}</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #1a1f16; padding: 30px; text-align: center;">
      <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0; line-height: 1.8;">
        ${restaurantName} · Nosara, Costa Rica<br>
        ${restaurant === 'laluna' ? 'reservations@lalunanosara.com' : 'reservations@coyolrestaurant.com'}
      </p>
    </div>
    
  </div>
</body>
</html>
          `,
        })
      });

      if (emailRes.ok) {
        sent++;
        console.log(`✓ Sent reminder to ${reservation.guest_email} for ${restaurant}`);
      } else {
        const err = await emailRes.text();
        errors.push(`${reservation.guest_email}: ${err}`);
        console.error(`✗ Failed to send to ${reservation.guest_email}:`, err);
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 100));
      
    } catch (err: any) {
      errors.push(`${reservation.guest_email}: ${err.message}`);
    }
  }

  return { sent, total: withEmail.length, errors };
}

export const GET: APIRoute = async ({ request }) => {
  // Verify cron secret if provided
  const authHeader = request.headers.get('authorization');
  const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow without auth for testing, but log it
    console.log('Warning: Cron request without valid auth');
  }

  // Get today's date in Costa Rica timezone (UTC-6)
  const now = new Date();
  const costaRicaOffset = -6 * 60; // UTC-6 in minutes
  const localTime = new Date(now.getTime() + (costaRicaOffset - now.getTimezoneOffset()) * 60000);
  const today = localTime.toISOString().split('T')[0];

  console.log(`🌅 Morning reminders cron starting for ${today}`);

  try {
    // Send reminders for both restaurants
    const lalunaResult = await sendRemindersForRestaurant('laluna', today);
    const coyolResult = await sendRemindersForRestaurant('coyol', today);

    const summary = {
      success: true,
      date: today,
      laluna: lalunaResult,
      coyol: coyolResult,
      totalSent: lalunaResult.sent + coyolResult.sent,
    };

    console.log(`✅ Morning reminders complete:`, summary);

    return new Response(JSON.stringify(summary, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Morning reminders error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
