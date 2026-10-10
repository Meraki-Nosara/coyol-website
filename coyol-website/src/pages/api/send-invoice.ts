import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { to, subject, invoiceHtml, meterName, month, amount } = await request.json();
    
    if (!to || !subject || !invoiceHtml) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create email HTML with invoice embedded
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: #0f172a; color: white; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 24px; }
          .invoice-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ Factura de Electricidad</h1>
          </div>
          <div class="content">
            <p>Estimado cliente,</p>
            <p>Adjunto encontrará su factura de electricidad correspondiente al periodo <strong>${month}</strong>.</p>
            
            <div class="invoice-box">
              ${invoiceHtml}
            </div>
            
            <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
            <p>Saludos cordiales,<br>Nosara Hills Limitada</p>
          </div>
          <div class="footer">
            Este es un mensaje automático generado por el sistema de facturación.
          </div>
        </div>
      </body>
      </html>
    `;
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Nosara Hills <noreply@coyolnosara.com>',
        to: [to],
        subject: subject,
        html: emailHtml
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email', detail: error }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await response.json();
    return new Response(JSON.stringify({ success: true, id: result.id }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Send invoice error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
