import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

export const GET: APIRoute = async () => {
  if (!SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Service key not configured' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [hotRes, todayRes, totalRes, targetRes, corpRes] = await Promise.all([
      // Hot leads (score 40+)
      fetch(`${SUPABASE_URL}/rest/v1/crm_guests?lead_score=gte.40&select=count`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'count=exact'
        }
      }),
      // New hot leads today
      fetch(`${SUPABASE_URL}/rest/v1/crm_guests?lead_score=gte.40&created_at=gte.${today}&select=count`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'count=exact'
        }
      }),
      // Total guests
      fetch(`${SUPABASE_URL}/rest/v1/crm_guests?select=count`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'count=exact'
        }
      }),
      // Target markets (US, CA, EU tier 1-2)
      fetch(`${SUPABASE_URL}/rest/v1/crm_guests?tier=lte.2&select=count`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'count=exact'
        }
      }),
      // Corporate emails
      fetch(`${SUPABASE_URL}/rest/v1/crm_guests?is_corporate_email=eq.true&select=count`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'count=exact'
        }
      })
    ]);

    const [hot, newToday, total, target, corp] = await Promise.all([
      hotRes.json(),
      todayRes.json(),
      totalRes.json(),
      targetRes.json(),
      corpRes.json()
    ]);

    return new Response(JSON.stringify({
      hotLeads: hot[0]?.count || 0,
      newToday: newToday[0]?.count || 0,
      totalGuests: total[0]?.count || 0,
      targetMarkets: target[0]?.count || 0,
      corporateEmails: corp[0]?.count || 0
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
