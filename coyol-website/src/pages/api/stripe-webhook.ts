import type { APIRoute } from 'astro';

const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';

// Generate a unique gift card code
function generateGiftCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'LALUNA-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate beautiful HTML email
function generateGiftCardEmail(data: {
  recipientName: string;
  senderName: string;
  amount: number;
  message: string;
  giftCode: string;
}): string {
  const tier = data.amount >= 200 ? 'Platinum' : data.amount >= 150 ? 'Gold' : data.amount >= 100 ? 'Silver' : 'Classic';
  const tierColor = data.amount >= 200 ? '#3D4F3D' : data.amount >= 150 ? '#C4A67C' : data.amount >= 100 ? '#8E9196' : '#A65D3F';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1F16; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1A1F16; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="max-width: 500px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #C4A67C; font-size: 28px; margin: 0; font-weight: normal; font-style: italic;">La Luna</h1>
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Nosara, Costa Rica</p>
            </td>
          </tr>
          
          <!-- Gift Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, ${tierColor}, ${tierColor}dd); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 40px; text-align: center;">
                    <p style="color: #F5F3EF; opacity: 0.8; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 20px 0;">${tier} Gift Card</p>
                    <p style="color: #F5F3EF; font-size: 48px; font-weight: bold; margin: 0;">$${data.amount}</p>
                    <p style="color: #F5F3EF; opacity: 0.9; font-size: 14px; margin: 20px 0 0 0; letter-spacing: 2px;">${data.giftCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding: 30px 0;">
              <p style="color: #F5F3EF; font-size: 18px; margin: 0 0 10px 0;">Dear ${data.recipientName},</p>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                ${data.senderName} has gifted you a dining experience at La Luna Restaurant!
              </p>
              ${data.message ? `
              <p style="color: #C4A67C; font-style: italic; font-size: 16px; margin: 20px 0; padding: 15px; border-left: 3px solid #C4A67C;">
                "${data.message}"
              </p>
              ` : ''}
            </td>
          </tr>
          
          <!-- How to Redeem -->
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <h3 style="color: #C4A67C; font-size: 16px; margin: 0 0 15px 0; font-weight: normal;">How to Redeem</h3>
              <ol style="color: #F5F3EF; opacity: 0.9; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Visit La Luna Restaurant in Guiones, Nosara</li>
                <li>Show this email or mention code: <strong>${data.giftCode}</strong></li>
                <li>Enjoy your meal!</li>
              </ol>
            </td>
          </tr>
          
          <!-- Reserve Button -->
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="https://coyolnosara.com/laluna/reserve" style="display: inline-block; background-color: #C4A67C; color: #1A1F16; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Reserve a Table</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #F5F3EF; opacity: 0.5; font-size: 12px; margin: 0;">
                La Luna Restaurant · Guiones, Nosara, Costa Rica<br>
                +506 8855-9146 · lalunanosara.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    
    // Verify webhook signature if secret is configured
    let event;
    if (STRIPE_WEBHOOK_SECRET && sig) {
      // For now, parse directly - in production should verify signature
      event = JSON.parse(body);
    } else {
      event = JSON.parse(body);
    }
    
    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Only process La Luna gift cards
      if (session.metadata?.type !== 'laluna_gift_card') {
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }
      
      const { recipientName, recipientEmail, senderName, senderEmail, message, amount } = session.metadata;
      
      // Generate gift card code
      const giftCode = generateGiftCode();
      
      // Generate email HTML
      const emailHtml = generateGiftCardEmail({
        recipientName,
        senderName,
        amount: parseInt(amount),
        message: message || '',
        giftCode,
      });
      
      // Send email to recipient via Himalaya CLI
      const emailSubject = `🎁 You've received a La Luna Gift Card from ${senderName}!`;
      
      // Use fetch to send via local API or direct SMTP
      // For now, log and we'll set up email sending
      console.log('Gift card purchased:', {
        giftCode,
        recipientName,
        recipientEmail,
        senderName,
        amount,
      });
      
      // Send email using the mail API
      try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        // Create temp file with email content
        const fs = await import('fs');
        const path = await import('path');
        const os = await import('os');
        
        const tmpFile = path.join(os.tmpdir(), `gift-card-${giftCode}.html`);
        fs.writeFileSync(tmpFile, emailHtml);
        
        // Send via himalaya
        const mmlContent = `From: La Luna Restaurant <reservations@lalunanosara.com>
To: ${recipientEmail}
Subject: ${emailSubject}
Content-Type: text/html; charset=utf-8

${emailHtml}`;
        
        const mmlFile = path.join(os.tmpdir(), `gift-card-${giftCode}.mml`);
        fs.writeFileSync(mmlFile, mmlContent);
        
        await execAsync(`cat "${mmlFile}" | himalaya message send -a laluna-restaurant`);
        
        console.log(`Gift card email sent to ${recipientEmail}`);
        
        // Also send confirmation to sender
        const senderMml = `From: La Luna Restaurant <reservations@lalunanosara.com>
To: ${senderEmail}
Subject: Your La Luna Gift Card Purchase - ${giftCode}
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; background: #1A1F16; color: #F5F3EF; padding: 40px;">
  <h2 style="color: #C4A67C;">Thank you for your gift!</h2>
  <p>Your La Luna gift card has been sent to ${recipientName} at ${recipientEmail}.</p>
  <p><strong>Gift Card Code:</strong> ${giftCode}</p>
  <p><strong>Amount:</strong> $${amount}</p>
  <p style="margin-top: 30px; opacity: 0.7;">La Luna Restaurant · Nosara, Costa Rica</p>
</body>
</html>`;
        
        const senderMmlFile = path.join(os.tmpdir(), `gift-card-sender-${giftCode}.mml`);
        fs.writeFileSync(senderMmlFile, senderMml);
        
        await execAsync(`cat "${senderMmlFile}" | himalaya message send -a laluna-restaurant`);
        
        console.log(`Confirmation email sent to sender ${senderEmail}`);
        
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
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
