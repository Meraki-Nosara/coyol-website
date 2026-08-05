import type { APIRoute } from 'astro';

const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { amount, recipientName, recipientEmail, message, senderName, senderEmail } = data;

    if (!amount || amount < 25 || amount > 500) {
      return new Response(JSON.stringify({ error: 'Invalid amount. Must be between $25 and $500.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!recipientName || !recipientEmail || !senderName || !senderEmail) {
      return new Response(JSON.stringify({ error: 'Please fill in all required fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const origin = new URL(request.url).origin;

    // Use fetch instead of SDK
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `Coyol Restaurant Gift Card - $${amount}`,
        'line_items[0][price_data][product_data][description]': `Gift card for ${recipientName}`,
        'line_items[0][price_data][unit_amount]': String(amount * 100),
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${origin}/coyol/gift/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${origin}/coyol/gift`,
        'customer_email': senderEmail,
        'metadata[recipientName]': recipientName,
        'metadata[recipientEmail]': recipientEmail,
        'metadata[message]': message || '',
        'metadata[senderName]': senderName,
        'metadata[senderEmail]': senderEmail,
        'metadata[amount]': String(amount),
        'metadata[type]': 'coyol_gift_card',
      }).toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', session);
      return new Response(JSON.stringify({ error: session.error?.message || 'Failed to create checkout' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
