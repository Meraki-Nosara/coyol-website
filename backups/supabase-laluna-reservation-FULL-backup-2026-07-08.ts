// FULL BACKUP - laluna-reservation Edge Function
// Backed up: July 8, 2026 07:24 AM before modification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    if (!record.guest_email) {
      return new Response(JSON.stringify({ error: 'No email' }), { status: 400 })
    }

    const cancelUrl = 'https://reserve.lalunanosara.com/cancel?id=${record.id}'

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: Georgia, serif; background: #f5f3ef; margin: 0; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://reserve.lalunanosara.com/images/logo.png" alt="La Luna" style="height: 60px; margin-bottom: 15px;">
          <h1 style="color: #C4A67C; font-size: 24px; margin: 0;">Reservation Confirmed</h1>
        </div>
        
        <p style="color: #1A1F16; font-size: 16px;">Dear ${record.guest_name},</p>
        
        <p style="color: #444; line-height: 1.6;">Your reservation at La Luna has been confirmed.</p>
        
        <div style="background: #f9f8f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Date:</strong> ${record.date}</p>
          <p style="margin: 8px 0;"><strong>Time:</strong> ${record.time}</p>
          <p style="margin: 8px 0;"><strong>Guests:</strong> ${record.guests}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://maps.app.goo.gl/QFZ9kFPgaHdPWUUU6" style="background: #C4A67C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Get Directions</a>
        </div>
        
        <p style="color: #888; font-size: 13px; border-top: 1px solid #eee; padding-top: 20px;">
          Need to cancel? <a href="${cancelUrl}" style="color: #C4A67C;">Cancel Reservation</a>
        </p>
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          La Luna Restaurant · Guiones, Nosara · +506 8996-8221
        </p>
      </div>
    </body>
    </html>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'La Luna Restaurant <reservations@lalunanosara.com>',
        to: record.guest_email,
        subject: 'Your Reservation at La Luna is Confirmed ✓',
        html: html
      })
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
