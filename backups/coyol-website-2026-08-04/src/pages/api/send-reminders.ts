import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = import.meta.env.SUPABASE_SERVICE_KEY || 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng';
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || 're_123'; // You'll need to add this

export const POST: APIRoute = async ({ request }) => {
  try {
    const { restaurant, date } = await request.json();
    
    if (!restaurant || !date) {
      return new Response(JSON.stringify({ error: 'Missing restaurant or date' }), { status: 400 });
    }
    
    const table = restaurant === 'laluna' ? 'laluna_reservations' : 'coyol_reservations';
    const restaurantName = restaurant === 'laluna' ? 'La Luna' : 'Coyol Restaurant';
    const cancelUrl = restaurant === 'laluna' 
      ? 'https://coyolnosara.com/laluna/cancel' 
      : 'https://coyolnosara.com/restaurant/cancel';
    
    // Fetch all confirmed reservations for the date with email addresses
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?date=eq.${date}&status=eq.confirmed&guest_email=neq.&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    
    if (!res.ok) {
      throw new Error('Failed to fetch reservations');
    }
    
    const reservations = await res.json();
    
    // Filter only those with valid emails
    const withEmail = reservations.filter((r: any) => r.guest_email && r.guest_email.includes('@'));
    
    if (withEmail.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        sent: 0, 
        message: 'No reservations with email addresses found' 
      }));
    }
    
    // Send emails
    let sent = 0;
    const errors: string[] = [];
    
    for (const reservation of withEmail) {
      try {
        const cancelLink = `${cancelUrl}?token=${reservation.cancel_token}`;
        const time = formatTime12(reservation.time);
        const dateFormatted = new Date(reservation.date + 'T12:00:00').toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // Send via Resend API
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: restaurant === 'laluna' 
              ? 'La Luna <reservations@lalunanosara.com>'
              : 'Coyol Restaurant <reservations@coyolrestaurant.com>',
            to: reservation.guest_email,
            subject: `Confirm your reservation at ${restaurantName} - ${dateFormatted}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1a1f16; margin: 0; font-size: 24px;">Your Reservation</h1>
                </div>
                
                <div style="background: #f8f6f3; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                  <p style="color: #666; margin: 0 0 5px 0; font-size: 14px;">GUEST</p>
                  <p style="color: #1a1f16; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">${reservation.guest_name}</p>
                  
                  <p style="color: #666; margin: 0 0 5px 0; font-size: 14px;">DATE & TIME</p>
                  <p style="color: #1a1f16; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">${dateFormatted} at ${time}</p>
                  
                  <p style="color: #666; margin: 0 0 5px 0; font-size: 14px;">PARTY SIZE</p>
                  <p style="color: #1a1f16; margin: 0; font-size: 18px; font-weight: 600;">${reservation.guests} guests</p>
                </div>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  We're looking forward to seeing you! If your plans have changed, please let us know so we can offer your table to other guests.
                </p>
                
                <div style="text-align: center;">
                  <a href="${cancelLink}" style="display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    Cancel My Reservation
                  </a>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
                  ${restaurantName} • Nosara, Costa Rica
                </p>
              </div>
            `
          })
        });
        
        if (emailRes.ok) {
          sent++;
          
          // Mark as reminder sent in database
          await fetch(
            `${SUPABASE_URL}/rest/v1/${table}?id=eq.${reservation.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
            }
          );
        } else {
          const errData = await emailRes.text();
          errors.push(`${reservation.guest_email}: ${errData}`);
        }
      } catch (e: any) {
        errors.push(`${reservation.guest_email}: ${e.message}`);
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      sent,
      total: withEmail.length,
      errors: errors.length > 0 ? errors : undefined
    }));
    
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

function formatTime12(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}
