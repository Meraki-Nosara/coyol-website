// Supabase Edge Function: laluna-reservation
// Copy this entire code to your Supabase Edge Function editor

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_EJWDiPdh_DJZQhsSJUzyNwpLdzAfoVdgW'

interface Reservation {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  date: string
  time: string
  guests: number
  zone_preference?: string
  special_requests?: string
  cancel_token: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${minutes} ${ampm}`
}

function getEmailHtml(reservation: Reservation): string {
  const color = '#C4A67C' // La Luna sand/terracotta
  const cancelUrl = `https://coyolnosara.com/laluna/cancel?token=${reservation.cancel_token}`
  
  return `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: Georgia, serif;">
  <table width="100%" style="background-color: #f5f3ef; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" style="max-width: 500px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <img src="https://coyolnosara.com/images/laluna-moon-white-real.png" alt="La Luna" width="60" height="60" style="margin-bottom: 15px; filter: invert(48%) sepia(30%) saturate(500%) hue-rotate(350deg) brightness(85%);" />
              <h1 style="color: ${color}; font-size: 28px; margin: 0; font-weight: normal; font-style: italic;">La Luna</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Reservation Confirmed</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #1A1F16; font-size: 16px; margin: 0 0 10px 0;">Dear ${reservation.guest_name},</p>
              <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;">
                Your reservation at La Luna has been confirmed. We look forward to welcoming you!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" style="background: #f9f8f6; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 15px; color: #888; font-size: 14px;">Date</td>
                  <td style="padding: 8px 15px; text-align: right; color: #1A1F16; font-weight: bold; font-size: 14px;">${formatDate(reservation.date)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 15px; color: #888; font-size: 14px;">Time</td>
                  <td style="padding: 8px 15px; text-align: right; color: #1A1F16; font-weight: bold; font-size: 14px;">${formatTime(reservation.time)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 15px; color: #888; font-size: 14px;">Party Size</td>
                  <td style="padding: 8px 15px; text-align: right; color: #1A1F16; font-weight: bold; font-size: 14px;">${reservation.guests} ${reservation.guests === 1 ? 'guest' : 'guests'}</td>
                </tr>
                ${reservation.zone_preference && reservation.zone_preference !== 'any' ? `
                <tr>
                  <td style="padding: 8px 15px; color: #888; font-size: 14px;">Seating</td>
                  <td style="padding: 8px 15px; text-align: right; color: #1A1F16; font-size: 14px;">${reservation.zone_preference}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          ${reservation.special_requests ? `
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <p style="color: ${color}; font-size: 13px; margin: 0 0 5px 0;">Special Requests:</p>
              <p style="color: #666; font-size: 14px; margin: 0; font-style: italic;">"${reservation.special_requests}"</p>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td align="center" style="padding: 0 40px 30px 40px;">
              <a href="https://maps.app.goo.gl/QFZ9kFPgaHdPWUUU6" style="display: inline-block; background-color: ${color}; color: white; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-size: 15px;">Get Directions</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                <strong>Need to modify or cancel?</strong><br>
                Please contact us at +506 8996-8221 or use the link below.
              </p>
              <a href="${cancelUrl}" style="color: ${color}; font-size: 13px;">Cancel Reservation</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 40px 30px 40px; background: #f9f8f6;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                La Luna Restaurant<br>Guiones, Nosara, Costa Rica<br>+506 8996-8221
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

serve(async (req) => {
  try {
    const { record } = await req.json()
    const reservation = record as Reservation

    // Only send for confirmed reservations
    if (!reservation.guest_email) {
      return new Response(JSON.stringify({ error: 'No email address' }), { status: 400 })
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'La Luna Restaurant <reservations@lalunanosara.com>',
        to: reservation.guest_email,
        subject: 'Reservation Confirmed - La Luna Restaurant',
        html: getEmailHtml(reservation),
      }),
    })

    const data = await res.json()
    
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
