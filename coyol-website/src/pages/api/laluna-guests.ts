import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.get('search');
    
    if (!search || search.length < 2) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Search by name, phone, or email
    const query = `${SUPABASE_URL}/rest/v1/laluna_guests?or=(name.ilike.*${encodeURIComponent(search)}*,phone.ilike.*${encodeURIComponent(search)}*,email.ilike.*${encodeURIComponent(search)}*)&order=visit_count.desc&limit=10`;
    
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
