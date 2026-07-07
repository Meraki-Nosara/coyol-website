import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = import.meta.env.SUPABASE_SERVICE_KEY || 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng';
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const CRON_SECRET = import.meta.env.CRON_SECRET;

// Verify cron request (Vercel sends this header)
function verifyCron(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return false;
  }
  return true;
}

async function getPendingGiftCards(table: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?or=(status.eq.pending_email,and(status.eq.sent,sent_at.is.null))&select=*`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  return res.json();
}

async function markAsSent(table: string, code: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?code=eq.${code}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'sent',
      sent_at: new Date().toISOString(),
    }),
  });
}

function getRecipientEmail(card: any, restaurant: 'laluna' | 'coyol') {
  const restaurantName = restaurant === 'laluna' ? 'La Luna' : 'Coyol';
  const restaurantEmail = restaurant === 'laluna' ? 'reservations@lalunanosara.com' : 'reservations@coyolrestaurant.com';
  const color = restaurant === 'laluna' ? '#C4A67C' : '#3D4F3D';
  const phone = restaurant === 'laluna' ? '+506 8996-8221' : '+506 8632-9590';
  const domain = restaurant === 'laluna' ? 'lalunanosara.com' : 'coyolrestaurant.com';
  
  return {
    from: `${restaurantName} Restaurant <${restaurantEmail}>`,
    to: card.recipient_email,
    subject: `You have received a ${restaurantName} Gift Card from ${card.sender_name}`,
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
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Nosara, Costa Rica</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <img src="https://coyolnosara.com/api/gift-card-image?code=${card.code}&amount=${card.amount}&name=${encodeURIComponent(card.recipient_name)}&restaurant=${restaurant}" 
                   alt="${restaurantName} Gift Card - $${card.amount}" 
                   width="500" 
                   style="max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);" />
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 0;">
              <p style="color: #F5F3EF; font-size: 18px; margin: 0 0 10px 0;">Dear ${card.recipient_name},</p>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                ${card.sender_name} has gifted you a dining experience at ${restaurantName} Restaurant.
              </p>
              ${card.message ? `<p style="color: ${color}; font-style: italic; font-size: 16px; margin: 20px 0; padding: 15px; border-left: 3px solid ${color};">"${card.message}"</p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <h3 style="color: ${color}; font-size: 16px; margin: 0 0 15px 0; font-weight: normal;">How to Redeem</h3>
              <ol style="color: #F5F3EF; opacity: 0.9; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Visit ${restaurantName} Restaurant in Guiones, Nosara</li>
                <li>Show this email or mention code: <strong>${card.code}</strong></li>
                <li>Enjoy your meal</li>
              </ol>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="https://${domain}" style="display: inline-block; background-color: ${color}; color: #1A1F16; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Book a Table</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
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

function getSenderEmail(card: any, restaurant: 'laluna' | 'coyol') {
  const restaurantName = restaurant === 'laluna' ? 'La Luna' : 'Coyol';
  const restaurantEmail = restaurant === 'laluna' ? 'reservations@lalunanosara.com' : 'reservations@coyolrestaurant.com';
  const color = restaurant === 'laluna' ? '#C4A67C' : '#3D4F3D';
  
  return {
    from: `${restaurantName} Restaurant <${restaurantEmail}>`,
    to: card.sender_email,
    subject: `Your ${restaurantName} Gift Card Purchase - ${card.code}`,
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
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Gift Card Confirmation</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 30px;">
              <h2 style="color: #F5F3EF; font-size: 22px; margin: 0 0 15px 0; font-weight: normal;">Thank you for your purchase</h2>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                Your ${restaurantName} gift card has been sent to ${card.recipient_name} at ${card.recipient_email}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <table width="100%" style="font-size: 14px; color: #F5F3EF;">
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Gift Card Code</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${card.code}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Amount</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${card.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Recipient</td>
                  <td style="padding: 8px 0; text-align: right;">${card.recipient_name}</td>
                </tr>
              </table>
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
  // Verify cron request
  if (!verifyCron(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
  }

  const resend = new Resend(RESEND_API_KEY);
  const results = { laluna: 0, coyol: 0, errors: [] as string[] };

  // Process La Luna gift cards
  try {
    const lalunaCards = await getPendingGiftCards('laluna_gift_cards');
    for (const card of lalunaCards) {
      try {
        // Send to recipient
        await resend.emails.send(getRecipientEmail(card, 'laluna'));
        // Send to sender
        await resend.emails.send(getSenderEmail(card, 'laluna'));
        // Mark as sent
        await markAsSent('laluna_gift_cards', card.code);
        results.laluna++;
      } catch (err: any) {
        results.errors.push(`La Luna ${card.code}: ${err.message}`);
      }
    }
  } catch (err: any) {
    results.errors.push(`La Luna fetch error: ${err.message}`);
  }

  // Process Coyol gift cards
  try {
    const coyolCards = await getPendingGiftCards('coyol_gift_cards');
    for (const card of coyolCards) {
      try {
        // Send to recipient
        await resend.emails.send(getRecipientEmail(card, 'coyol'));
        // Send to sender
        await resend.emails.send(getSenderEmail(card, 'coyol'));
        // Mark as sent
        await markAsSent('coyol_gift_cards', card.code);
        results.coyol++;
      } catch (err: any) {
        results.errors.push(`Coyol ${card.code}: ${err.message}`);
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
