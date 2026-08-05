import type { APIRoute } from 'astro';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

function formatTime12(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { reservation, restaurant } = await request.json();
    
    if (!reservation?.guest_email || !reservation.guest_email.includes('@')) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isLaLuna = restaurant === 'laluna';
    const restaurantName = isLaLuna ? 'La Luna' : 'Coyol Restaurant';
    const fromEmail = isLaLuna 
      ? 'La Luna <reservations@lalunanosara.com>'
      : 'Coyol Restaurant <reservations@coyolrestaurant.com>';
    const cancelUrl = isLaLuna 
      ? `https://coyolnosara.com/laluna/cancel?token=${reservation.cancel_token}`
      : `https://coyolnosara.com/restaurant/cancel?token=${reservation.cancel_token}`;
    const bgColor = isLaLuna ? '#A65D3F' : '#3D4F3D';
    
    const guestName = reservation.guest_name || 'Guest';
    const time = formatTime12(reservation.time);
    const partySize = reservation.guests || 2;
    const dateFormatted = new Date(reservation.date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const confirmationId = reservation.id?.slice(0, 8).toUpperCase() || 'RES-' + Date.now().toString(36).toUpperCase();
    const specialRequests = reservation.special_requests || '';

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: reservation.guest_email,
        subject: `Reservation Confirmed - ${restaurantName}`,
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
      ${isLaLuna 
        ? '<img src="https://coyolnosara.com/images/laluna-moon-white-real.png" alt="La Luna" style="width: 60px; height: auto; margin-bottom: 15px;"><h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">LA LUNA</h1><p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">Nosara, Costa Rica</p>' 
        : '<img src="https://coyolnosara.com/images/coyol-restaurant-logo.png" alt="Coyol Restaurant" style="width: 200px; height: auto;">'}
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1f16; margin: 0 0 20px; font-size: 24px; font-weight: 400;">
        Reservation Confirmed! ✓
      </h2>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        Hi <strong>${guestName}</strong>,<br><br>
        Thank you for your reservation! Your table is confirmed.
      </p>
      
      <!-- Confirmation ID -->
      <div style="background-color: ${bgColor}; color: white; padding: 15px 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">CONFIRMACIÓN</div>
        <div style="font-size: 24px; font-weight: 600; letter-spacing: 2px;">#${confirmationId}</div>
      </div>
      
      <!-- Reservation Details Box -->
      <div style="background-color: #f8f7f5; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 14px;">📅 Date</td>
            <td style="padding: 10px 0; color: #1a1f16; font-size: 16px; font-weight: 600; text-align: right;">${dateFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 14px;">🕐 Time</td>
            <td style="padding: 10px 0; color: #1a1f16; font-size: 16px; font-weight: 600; text-align: right;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 14px;">👥 Guests</td>
            <td style="padding: 10px 0; color: #1a1f16; font-size: 16px; font-weight: 600; text-align: right;">${partySize}</td>
          </tr>
          ${specialRequests ? `
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 14px;">📝 Notes</td>
            <td style="padding: 10px 0; color: #1a1f16; font-size: 14px; text-align: right;">${specialRequests}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin: 0 0 25px;">
        We look forward to seeing you! If you need to cancel or modify your reservation, use the button below or reply to this email.
      </p>
      
      <!-- Cancel Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${cancelUrl}" style="display: inline-block; background-color: #f8f7f5; color: #666; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; border: 1px solid #ddd;">
          Cancel or Modify Reservation
        </a>
      </div>
      
      <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin: 0;">
        See you soon! 🍽️<br><br>
        <strong>The ${restaurantName} Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #1a1f16; padding: 30px; text-align: center;">
      <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0; line-height: 1.8;">
        ${restaurantName} · Nosara, Costa Rica<br>
        ${isLaLuna ? 'reservations@lalunanosara.com · +506 8996-8221' : 'reservations@coyolrestaurant.com · +506 8888-8888'}
      </p>
    </div>
    
  </div>
</body>
</html>
        `,
      })
    });

    if (!emailRes.ok) {
      const error = await emailRes.text();
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ success: false, error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Send confirmation error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
