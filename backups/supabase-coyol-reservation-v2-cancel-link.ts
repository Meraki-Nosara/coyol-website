// Supabase Edge Function: coyol-reservation
// v2: Uses cancel page link instead of WhatsApp
// Deploy to: Supabase Dashboard → Edge Functions → coyol-reservation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_EJWDiPdh_DJZQhsSJUzyNwpLdzAfoVdgW'

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    if (!record.guest_email || record.status !== 'confirmed') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }
    
    // Format date
    const dateObj = new Date(record.date + 'T12:00:00')
    const dateStr = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    })
    
    // Format time
    const [hours, minutes] = record.time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    const timeStr = h12 + ':' + minutes + ' ' + ampm
    
    // Cancel URL - now uses cancel page with token
    const cancelUrl = `https://coyolnosara.com/restaurant/cancel?token=${record.cancel_token}`
    
    const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f5f3ef;font-family:Georgia,serif;">
<table width="100%" style="background-color:#f5f3ef;padding:40px 20px;">
<tr><td align="center">
<table width="500" style="max-width:500px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

<!-- Header -->
<tr><td align="center" style="padding:40px 40px 20px 40px;">
  <img src="https://coyolnosara.com/images/coyol-palm-black.png" alt="Coyol" width="60" height="60" style="margin-bottom:15px;" />
  <h1 style="color:#1A1F16;font-size:28px;margin:0;font-weight:normal;font-style:italic;">Coyol</h1>
  <p style="color:#666;margin:5px 0 0 0;font-size:14px;">Reservation Confirmed</p>
</td></tr>

<!-- Greeting -->
<tr><td style="padding:20px 40px;">
  <p style="color:#1A1F16;font-size:16px;margin:0 0 10px 0;">Dear ${record.guest_name},</p>
  <p style="color:#444;font-size:15px;line-height:1.6;margin:0;">Your reservation at Coyol has been confirmed. We look forward to welcoming you!</p>
</td></tr>

<!-- Details -->
<tr><td style="padding:0 40px 30px 40px;">
  <table width="100%" style="background:#f9f8f6;border-radius:8px;">
    <tr>
      <td style="padding:12px 15px;color:#888;font-size:14px;">Date</td>
      <td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${dateStr}</td>
    </tr>
    <tr>
      <td style="padding:12px 15px;color:#888;font-size:14px;">Time</td>
      <td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${timeStr}</td>
    </tr>
    <tr>
      <td style="padding:12px 15px;color:#888;font-size:14px;">Party Size</td>
      <td style="padding:12px 15px;text-align:right;color:#1A1F16;font-weight:bold;font-size:14px;">${record.guests} guests</td>
    </tr>
  </table>
</td></tr>

<!-- Directions Button -->
<tr><td align="center" style="padding:0 40px 30px 40px;">
  <a href="https://www.google.com/maps/search/Coyol+Restaurant+Nosara+Costa+Rica" 
     style="display:inline-block;background-color:#1A1F16;color:white;text-decoration:none;padding:14px 35px;border-radius:6px;font-size:15px;">
    Get Directions
  </a>
</td></tr>

<!-- Cancel Link -->
<tr><td style="padding:20px 40px;border-top:1px solid #eee;">
  <p style="color:#888;font-size:13px;margin:0 0 10px 0;"><strong>Need to cancel?</strong></p>
  <a href="${cancelUrl}" style="color:#3D4F3D;font-size:13px;text-decoration:underline;">Click here to cancel your reservation</a>
</td></tr>

<!-- Footer -->
<tr><td align="center" style="padding:20px 40px 30px 40px;background:#f9f8f6;">
  <p style="color:#888;font-size:12px;margin:0;">Coyol Restaurant · Guiones, Nosara · +506 8632-9590</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    // Send email via Resend
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Coyol Restaurant <reservations@coyolrestaurant.com>',
        to: record.guest_email,
        subject: 'Reservation Confirmed - Coyol Restaurant',
        html: html
      })
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
