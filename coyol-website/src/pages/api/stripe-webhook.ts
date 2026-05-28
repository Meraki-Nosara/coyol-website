import type { APIRoute } from 'astro';

const STRIPE_WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

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
      const giftCard = {
        code: giftCode,
        amount: parseInt(amount),
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
