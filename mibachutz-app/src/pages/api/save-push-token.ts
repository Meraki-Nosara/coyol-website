import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://fkikzryelozciailbryh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZOLf9xFyix_92BjpOggZxw_PID3uDli';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { momId, token } = await request.json();
    
    if (!momId || !token) {
      return new Response(JSON.stringify({ error: 'Missing momId or token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update mom's push token
    const response = await fetch(`${SUPABASE_URL}/rest/v1/moms_v2?id=eq.${momId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        push_token: token,
        push_enabled: true
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save token');
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Save push token error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
