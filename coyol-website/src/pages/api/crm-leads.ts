import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

export const GET: APIRoute = async ({ request }) => {
  // Check for auth (simple token check from Command)
  const authHeader = request.headers.get('x-command-auth');
  if (authHeader !== 'coyol-command-2026') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Service key not configured' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_guests?lead_score=gte.40&select=*&order=lead_score.desc`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const guests = await response.json();
    
    return new Response(JSON.stringify(guests), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
