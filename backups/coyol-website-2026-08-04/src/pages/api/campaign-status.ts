import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

async function supabaseQuery(endpoint: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

export const GET: APIRoute = async () => {
  try {
    // Get total contacts
    const contacts = await supabaseQuery('email_contacts?select=id');
    const totalContacts = contacts.length;
    
    // Get campaign info
    const campaigns = await supabaseQuery('email_campaigns?status=eq.active&limit=1');
    const campaign = campaigns[0] || { name: 'Gift Card Campaign', sent_count: 0, pending_count: 0 };
    
    // Get sent count from email_sends
    const sent = await supabaseQuery('email_sends?status=eq.sent&select=id');
    const sentCount = sent.length;
    
    // Get pending (contacts not yet sent)
    const pendingCount = totalContacts - sentCount;
    
    // Get recent sends (last 20)
    const recentSends = await supabaseQuery('email_sends?status=eq.sent&order=sent_at.desc&limit=20&select=email,sent_at');
    const recentSent = recentSends.map((s: any) => s.email);
    
    // Get next up (pending contacts not in sends)
    const allSentEmails = await supabaseQuery('email_sends?select=email');
    const sentEmailSet = new Set(allSentEmails.map((s: any) => s.email.toLowerCase()));
    
    const nextContacts = await supabaseQuery('email_contacts?select=email&limit=50');
    const nextUp = nextContacts
      .filter((c: any) => !sentEmailSet.has(c.email.toLowerCase()))
      .slice(0, 20)
      .map((c: any) => c.email);
    
    const data = {
      campaign: campaign.name || 'Gift Card Campaign',
      status: pendingCount > 0 ? 'active' : 'complete',
      note: pendingCount > 0 ? `${pendingCount.toLocaleString()} remaining` : 'All sent!',
      stats: {
        totalEmails: totalContacts,
        sent: sentCount,
        pending: pendingCount,
        hotLeadsReserved: 0,
        todaySent: 0,
        percentComplete: totalContacts > 0 ? Math.round((sentCount / totalContacts) * 100) : 0
      },
      sentByDay: [],
      recentSent,
      nextUp,
      lastUpdated: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Campaign status error:', error);
    return new Response(JSON.stringify({
      campaign: 'Gift Card Campaign',
      status: 'error',
      note: 'Failed to load from database',
      stats: { totalEmails: 0, sent: 0, pending: 0, percentComplete: 0 },
      recentSent: [],
      nextUp: [],
      lastUpdated: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Check if sent
    const sent = await supabaseQuery(`email_sends?email=ilike.${encodeURIComponent(emailLower)}&status=eq.sent&limit=1`);
    if (sent.length > 0) {
      return new Response(JSON.stringify({ email: emailLower, status: 'sent' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if in contacts (pending)
    const contacts = await supabaseQuery(`email_contacts?email=ilike.${encodeURIComponent(emailLower)}&limit=1`);
    if (contacts.length > 0) {
      return new Response(JSON.stringify({ email: emailLower, status: 'pending' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ email: emailLower, status: 'unknown' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
