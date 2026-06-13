-- Add email_verified column to moms_v2
ALTER TABLE moms_v2 ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Make email required and unique
ALTER TABLE moms_v2 ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS moms_v2_email_unique ON moms_v2 (email);

-- For production: Create Edge Function to send verification emails
-- See: supabase/functions/send-verification/index.ts

/*
Edge Function code (deploy to Supabase):

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { email, code } = await req.json()
  
  // Use Resend, SendGrid, or Supabase's built-in email
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'מי בחוץ <noreply@mibachutz.app>',
      to: email,
      subject: 'קוד אימות - מי בחוץ',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
          <h1 style="color: #FF6B6B;">מי בחוץ</h1>
          <p>הקוד שלך הוא:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background: #f5f5f5; border-radius: 10px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #888;">הקוד בתוקף ל-10 דקות</p>
        </div>
      `
    })
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
*/
