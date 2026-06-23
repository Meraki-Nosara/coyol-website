import type { APIRoute } from 'astro';

const STRIPE_WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY || '';

// Send gift card emails via Resend
async function sendGiftCardEmails(data: {
  code: string;
  amount: number;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  message: string;
  isCoyol: boolean;
}) {
  const { code, amount, recipientName, recipientEmail, senderName, senderEmail, message, isCoyol } = data;
  
  const restaurant = isCoyol ? 'Coyol' : 'La Luna';
  const domain = isCoyol ? 'coyolnosara.com' : 'lalunanosara.com';
  const fromEmail = isCoyol ? 'reservations@coyolrestaurant.com' : 'reservations@lalunanosara.com';
  const color = isCoyol ? '#C4A67C' : '#A65D3F';
  const bgColor = '#1A1F16';
  
  const messageHtml = message ? `<p style="color: ${color}; font-style: italic; font-size: 16px; margin: 20px 0; padding: 15px; border-left: 3px solid ${color};">&ldquo;${message}&rdquo;</p>` : '';
  
  // Recipient email HTML
  const recipientHtml = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: Georgia, serif;">
  <table width="100%" style="background-color: ${bgColor}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" style="max-width: 500px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: ${color}; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 4px;">${restaurant.toUpperCase()}</h1>
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Nosara, Costa Rica</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="background: linear-gradient(135deg, ${color}22 0%, ${color}11 100%); border: 2px solid ${color}; border-radius: 16px; padding: 30px; text-align: center;">
                <p style="color: ${color}; font-size: 14px; margin: 0 0 10px 0; letter-spacing: 2px;">GIFT CARD</p>
                <p style="color: #F5F3EF; font-size: 48px; margin: 0; font-weight: bold;">$${amount}</p>
                <p style="color: #F5F3EF; opacity: 0.7; font-size: 14px; margin: 15px 0 0 0;">Code: <strong>${code}</strong></p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 0;">
              <p style="color: #F5F3EF; font-size: 18px; margin: 0 0 10px 0;">Dear ${recipientName},</p>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                ${senderName} has gifted you a dining experience at ${restaurant}.
              </p>
              ${messageHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <h3 style="color: ${color}; font-size: 16px; margin: 0 0 15px 0; font-weight: normal;">How to Redeem</h3>
              <ol style="color: #F5F3EF; opacity: 0.9; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Visit ${restaurant} in Nosara</li>
                <li>Show this email or mention code: <strong>${code}</strong></li>
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
                ${restaurant}<br>Nosara, Costa Rica
              </p>
              <p style="color: #F5F3EF; opacity: 0.35; font-size: 10px; margin: 15px 0 0 0;">
                Gift cards are non-refundable. No expiration date.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Sender confirmation HTML
  const senderHtml = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: Georgia, serif;">
  <table width="100%" style="background-color: ${bgColor}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" style="max-width: 500px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: ${color}; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 4px;">${restaurant.toUpperCase()}</h1>
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Gift Card Confirmation</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 30px;">
              <h2 style="color: #F5F3EF; font-size: 22px; margin: 0 0 15px 0; font-weight: normal;">Thank you for your purchase!</h2>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                Your gift card has been sent to ${recipientName} at ${recipientEmail}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <table width="100%" style="font-size: 14px; color: #F5F3EF;">
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Gift Card Code</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${code}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Amount</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Recipient</td>
                  <td style="padding: 8px 0; text-align: right;">${recipientName}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #F5F3EF; opacity: 0.5; font-size: 12px; margin: 0;">
                ${restaurant}<br>Nosara, Costa Rica
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Send both emails via Resend
  const sendEmail = async (to: string, subject: string, html: string) => {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${restaurant} <${fromEmail}>`,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend failed: ${await res.text()}`);
    }
    return res.json();
  };

  await Promise.all([
    sendEmail(recipientEmail, `You've received a ${restaurant} Gift Card from ${senderName}!`, recipientHtml),
    sendEmail(senderEmail, `Your ${restaurant} Gift Card Purchase - ${code}`, senderHtml),
  ]);
}

// Generate a unique gift card code
function generateGiftCode(prefix: string = 'LL'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = `${prefix}-`;
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    
    // Parse the event
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }
    
    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Process gift cards for both restaurants
      const giftType = session.metadata?.type;
      if (giftType !== 'laluna_gift_card' && giftType !== 'coyol_gift_card') {
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }
      
      const { recipientName, recipientEmail, senderName, senderEmail, message, amount } = session.metadata;
      
      // Generate gift card code with restaurant prefix
      const isCoyol = giftType === 'coyol_gift_card';
      const giftCode = generateGiftCode(isCoyol ? 'CYL' : 'LL');
      const tableName = isCoyol ? 'coyol_gift_cards' : 'laluna_gift_cards';
      
      // Save to Supabase for tracking and email queue
      const amountNum = parseInt(amount);
      const giftCard = {
        code: giftCode,
        amount: amountNum,
        remaining_balance: amountNum, // Track partial redemptions
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        sender_name: senderName,
        sender_email: senderEmail,
        message: message || null,
        stripe_session_id: session.id,
        status: 'pending_email',
        created_at: new Date().toISOString(),
      };
      
      // Insert into Supabase
      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(giftCard),
      });
      
      if (!insertResponse.ok) {
        console.error('Failed to save gift card:', await insertResponse.text());
      } else {
        console.log('Gift card saved:', giftCode);
        
        // Send emails immediately
        try {
          await sendGiftCardEmails({
            code: giftCode,
            amount: amountNum,
            recipientName,
            recipientEmail,
            senderName,
            senderEmail,
            message: message || '',
            isCoyol,
          });
          
          // Update status to sent with timestamp
          await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?code=eq.${giftCode}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'sent', sent_at: new Date().toISOString() }),
          });
          console.log('Gift card emails sent:', giftCode);
        } catch (emailError: any) {
          console.error('Failed to send gift card emails:', emailError?.message || emailError);
          // Keep status as pending_email - heartbeat will retry
          // Also log the recipient for debugging
          console.error('Failed for recipient:', recipientEmail, 'sender:', senderEmail);
        }
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
