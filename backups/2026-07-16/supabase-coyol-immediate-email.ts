import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_EJWDiPdh_DJZQhsSJUzyNwpLdzAfoVdgW' // This is a fallback key, ensure env var is set

serve(async (req) => {
  try {
    const { record } = await req.json();

    // Skip if no guest email or status is not 'confirmed'
    // (Ensure the trigger sets the status to 'confirmed' on INSERT)
    if (!record.guest_email || record.status !== 'confirmed') {
      return new Response(JSON.stringify({ skipped: true, reason: 'No guest email or status not confirmed' }), { status: 200 });
    }

    const dateObj = new Date(record.date + 'T12:00:00');
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    
    const [hours, minutes] = record.time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const timeStr = h12 + ':' + minutes + ' ' + ampm;

    // Reservation code from record.id
    const reservationCode = record.id ? record.id.slice(0, 8).toUpperCase() : 'COY-' + Date.now().toString(36).toUpperCase();

    // WhatsApp cancel message
    const waText = encodeURIComponent('Hi, I need to cancel my reservation. Name: ' + record.guest_name + ', Date: ' + dateStr + ', Time: ' + timeStr + ', Code: ' + reservationCode);
    const cancelUrl = 'https://wa.me/50686329590?text=' + waText; // Coyol's WhatsApp number

    // Gift a Friend link
    const giftFriendUrl = 'https://coyolnosara.com/coyol/gift'; // Corrected URL

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#f5f3ef;font-family:Georgia,serif;">
      <table width="100%" style="background-color:#f5f3ef;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="500" style="max-width:500px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba[0,0,0,0.1);">
              <tr>
                <td align="center" style="padding:40px 40px 20px 40px;">
                  <img src="https://coyolnosara.com/images/logos/coyol-restaurant-text-logo-green.png" alt="Coyol" width="120" style="margin-bottom:15px;" />
                  <p style="color:#666;margin:5px 0 0 0;font-size:14px;">Reservation Confirmed</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px;">
                  <p style="color:#1A1F16;font-size:16px;margin:0 0 10px 0;">Dear ${record.guest_name},</p>
                  <p style="color:#444;font-size:15px;line-height:1.6;margin:0;">Your reservation at Coyol Restaurant has been confirmed. We look forward to welcoming you!</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 40px 30px 40px;">
                  <table width="100%" style="background:#f9f8f6;border-radius:8px;">
                    <tr><td style="padding:12px 15px;color:#888;font-size:14px;">Date</td><td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${dateStr}</td></tr>
                    <tr><td style="padding:12px 15px;color:#888;font-size:14px;">Time</td><td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${timeStr}</td></tr>
                    <tr><td style="padding:12px 15px;color:#888;font-size:14px;">Party Size</td><td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${record.guests || record.party_size} guests</td></tr>
                    <tr><td style="padding:12px 15px;color:#888;font-size:14px;">Confirmation Code</td><td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${reservationCode}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:0 40px 30px 40px;">
                  <a href="https://www.google.com/maps/search/Coyol+Restaurant+Nosara+Costa+Rica" style="display:inline-block;background-color:#3D4F3D;color:white;text-decoration:none;padding:14px 35px;border-radius:6px;font-size:15px;">Get Directions</a>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:20px 40px;">
                  <a href="${giftFriendUrl}" style="display:inline-block;background-color:#C4A67C;color:#1A1F16;text-decoration:none;padding:14px 35px;border-radius:6px;font-size:15px;">Gift a Friend</a>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #eee;">
                  <p style="color:#888;font-size:13px;margin:0 0 10px 0;"><strong>Need to cancel?</strong></p>
                  <a href="${cancelUrl}" style="color:#1A1F16;font-size:13px;">Message us on WhatsApp</a>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:20px 40px 30px 40px;background:#f9f8f6;">
                  <p style="color:#888;font-size:12px;margin:0;">Coyol Restaurant - Mar Azul, Nosara - +506 8632-9590</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body></html>`;
    
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Coyol Restaurant <reservations@coyolrestaurant.com>',
        to: record.guest_email,
        subject: 'Your Reservation at Coyol Restaurant is Confirmed',
        html: html
      })
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})
