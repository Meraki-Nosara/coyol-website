import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const STRIPE_KEY = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!STRIPE_KEY) {
  console.error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(STRIPE_KEY || '');

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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `La Luna Gift Card - $${amount}`,
              description: `Gift card for ${recipientName}`,
              images: ['https://coyolnosara.com/images/logos/laluna-logo-white.png'],
            },
            unit_amount: amount * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${new URL(request.url).origin}/laluna/gift/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(request.url).origin}/laluna/gift`,
      customer_email: senderEmail,
      metadata: {
        recipientName,
        recipientEmail,
        message: message || '',
        senderName,
        senderEmail,
        amount: amount.toString(),
        type: 'laluna_gift_card',
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Stripe error:', error);
    const errorMessage = error.message || 'Failed to create checkout session';
    const isKeyMissing = !STRIPE_KEY || errorMessage.includes('Invalid API Key');
    return new Response(JSON.stringify({ 
      error: isKeyMissing ? 'Payment system is being configured. Please try again shortly.' : errorMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
// redeploy 1779756349
// 1779756467
