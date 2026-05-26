import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng';

export const GET: APIRoute = async ({ url }) => {
  try {
    const today = url.searchParams.get('today');
    let query = `${SUPABASE_URL}/rest/v1/laluna_reservations?select=*`;
    
    if (today === 'true') {
      const todayDate = new Date().toISOString().split('T')[0];
      query += `&date=eq.${todayDate}`;
    }
    
    const res = await fetch(query, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    });
    
    const data = await res.json();
    
    return new Response(JSON.stringify(Array.isArray(data) ? data : []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
