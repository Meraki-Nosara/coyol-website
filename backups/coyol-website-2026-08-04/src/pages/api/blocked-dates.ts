import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

export const GET: APIRoute = async ({ url }) => {
  const restaurant = url.searchParams.get('restaurant') || 'laluna';
  
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blocked_dates?restaurant=eq.${restaurant}&date=gte.${new Date().toISOString().split('T')[0]}&order=date.asc`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );
  
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { restaurant, date, reason, blocked_by, shift = 'all' } = body;
  
  if (!restaurant || !date) {
    return new Response(JSON.stringify({ error: 'Missing restaurant or date' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blocked_dates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ restaurant, date, reason, blocked_by, shift })
  });
  
  if (!res.ok) {
    const error = await res.text();
    return new Response(JSON.stringify({ error }), { 
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blocked_dates?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
