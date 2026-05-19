import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface Reservation {
  id: string
  date: string
  time: string
  guests: number
  guest_name: string
  guest_email: string | null
  guest_phone: string
  zone_preference: string
  special_requests: string | null
  status: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h)
  return `${h12}:${minutes} ${ampm}`
}

function formatSeating(zone: string): string {
  const zones: Record<string, string> = {
    'any': 'No Preference',
    'indoor': 'Indoor',
    'patio': 'Patio',
    'garden': 'Garden'
  }
  return zones[zone] || zone || 'No Preference'
}

function generateEmailHtml(reservation: Reservation): string {
  const confirmationCode = reservation.id.slice(0, 8).toUpperCase()
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f5f3ef;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #A65D3F; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: normal; letter-spacing: 2px; font-family: Georgia, serif;">LA LUNA</h1>
              <p style="color: #D4C9B5; margin: 10px 0 0; font-size: 14px; letter-spacing: 1px;">PLAYA PELADA · NOSARA</p>
            </td>
          </tr>

          <!-- Confirmation Badge -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <p style="color: #A65D3F; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Reservation Confirmed</p>
              <p style="color: #1A1F16; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 3px;">${confirmationCode}</p>
            </td>
          </tr>

          <!-- Reservation Details -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FDFBF7; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #eee;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                          <p style="color: #1A1F16; margin: 0; font-size: 18px; font-weight: bold;">${formatDate(reservation.date)}</p>
                        </td>
                        <td width="50%" style="text-align: right;">
                          <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</p>
                          <p style="color: #1A1F16; margin: 0; font-size: 18px; font-weight: bold;">${formatTime(reservation.time)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Party Size</p>
                          <p style="color: #1A1F16; margin: 0; font-size: 18px; font-weight: bold;">${reservation.guests} guests</p>
                        </td>
                        <td width="50%" style="text-align: right;">
                          <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Seating</p>
                          <p style="color: #1A1F16; margin: 0; font-size: 18px; font-weight: bold;">${formatSeating(reservation.zone_preference)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest Name -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <p style="color: #78716c; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reserved for</p>
              <p style="color: #A65D3F; margin: 0; font-size: 28px; font-weight: bold; font-family: Georgia, serif;">${reservation.guest_name}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #A65D3F, transparent);"></div>
            </td>
          </tr>

          <!-- Restaurant Info -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <p style="color: #1A1F16; margin: 0 0 8px; font-size: 16px; font-weight: bold;">La Luna Restaurant</p>
              <p style="color: #57534e; margin: 0 0 4px; font-size: 14px;">Playa Pelada, Nosara</p>
              <p style="color: #57534e; margin: 0 0 4px; font-size: 14px;">Guanacaste, Costa Rica</p>
              <p style="color: #57534e; margin: 0; font-size: 14px;">+506 2682-0122</p>
            </td>
          </tr>

          <!-- Important Notes -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEF9F6; border-left: 4px solid #A65D3F;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="color: #A65D3F; margin: 0 0 8px; font-size: 14px; font-weight: bold;">Please Note</p>
                    <p style="color: #57534e; margin: 0; font-size: 14px; line-height: 1.6;">Please arrive within 15 minutes of your reservation time. For parties of 6+, we may need to confirm by phone.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1A1F16; padding: 30px 40px; text-align: center;">
              <p style="color: #D4C9B5; margin: 0 0 8px; font-size: 16px; font-style: italic;">Where the ocean meets the table</p>
              <p style="color: #78716c; margin: 0; font-size: 12px;">Questions? Reply to this email or call +506 2682-0122</p>
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
    
    // Skip if no email
    if (!reservation.guest_email) {
      return new Response(JSON.stringify({ message: 'No email address' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Skip if not confirmed
    if (reservation.status !== 'confirmed') {
      return new Response(JSON.stringify({ message: 'Not confirmed status' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const html = generateEmailHtml(reservation)

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'La Luna Restaurant <reservations@lalunanosara.com>',
        to: reservation.guest_email,
        subject: 'Your Reservation at La Luna is Confirmed ✓',
        html: html
      })
    })

    const result = await res.json()
    
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
