import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { firstName, lastName, email, message } = body;

    if (!firstName || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send via Resend (if configured)
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    
    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Coyol Real Estate <noreply@coyolnosara.com>',
          to: ['info@coyolrealestate.com'],
          reply_to: email,
          subject: `New Inquiry from ${firstName} ${lastName}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Message:</strong></p>
            <p>${message?.replace(/\n/g, '<br>') || '(no message)'}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Sent from coyolrealestate.com contact form</p>
          `,
          text: `New Contact Form Submission\n\nName: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message || '(no message)'}`
        })
      });

      if (res.ok) {
        return new Response(JSON.stringify({ success: true, method: 'resend' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      console.error('Resend error:', await res.text());
    }

    // Backup: Store in Supabase
    const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co/rest/v1';
    const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

    const supabaseRes = await fetch(`${SUPABASE_URL}/contact_submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        message: message || '',
        source: 'website_contact_form'
      })
    });

    if (supabaseRes.ok) {
      return new Response(JSON.stringify({ success: true, method: 'supabase' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If Supabase also failed, log it
    console.log('Contact form (fallback):', { firstName, lastName, email, message });
    return new Response(JSON.stringify({ success: true, method: 'logged' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
