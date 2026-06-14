import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Missing email or code' }), { status: 400 });
    }
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer re_YRmCrstr_2wLYtSHHncJDhq5JwTsQsc8U`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'מי בחוץ <noreply@mibahutz.com>',
        to: email,
        subject: 'קוד אימות - מי בחוץ',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background: #FFF9F9;">
            <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h1 style="color: #FF6B6B; margin-bottom: 10px;">מי בחוץ</h1>
              <p style="color: #666; margin-bottom: 30px;">הקוד שלך להתחברות:</p>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; background: #FFF0F0; border-radius: 12px; color: #FF6B6B; margin-bottom: 15px; user-select: all; cursor: pointer;" title="לחצי להעתקה">
                ${code}
              </div>
              <p style="color: #666; font-size: 14px; margin-bottom: 15px;">👆 לחצי על הקוד להעתקה</p>
              <p style="color: #999; font-size: 12px;">הקוד בתוקף ל-10 דקות</p>
            </div>
          </div>
        `
      })
    });
    
    if (!res.ok) {
      const err = await res.json();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
    
  } catch (err) {
    console.error('Send code error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
