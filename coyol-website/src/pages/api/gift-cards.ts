import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

export const GET: APIRoute = async ({ request }) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/laluna_gift_cards?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    });
    
    const data = await res.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to fetch gift cards' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { code, table, ...updates } = body;
    
    if (!code) {
      return new Response(JSON.stringify({ error: 'Code required' }), { status: 400 });
    }
    
    // Determine table: Coyol cards start with CYL-, otherwise La Luna
    const tableName = table || (code.startsWith('CYL-') ? 'coyol_gift_cards' : 'laluna_gift_cards');
    
    // Coyol table doesn't have 'notes' column - strip it
    const cleanUpdates = { ...updates };
    if (tableName === 'coyol_gift_cards' && cleanUpdates.notes) {
      delete cleanUpdates.notes;
    }
    
    console.log('Updating gift card:', code, 'table:', tableName, cleanUpdates);
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?code=eq.${code}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(cleanUpdates),
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.error('Supabase PATCH failed:', res.status, errText);
      return new Response(JSON.stringify({ error: 'Database update failed', details: errText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    console.error('PATCH error:', e);
    return new Response(JSON.stringify({ error: 'Failed to update', message: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
