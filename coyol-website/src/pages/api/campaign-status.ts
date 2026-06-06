import type { APIRoute } from 'astro';
import campaignData from '../../data/campaign-status.json';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(campaignData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
    }
    
    const emailLower = email.toLowerCase().trim();
    const found = campaignData.recentSent?.includes(emailLower) || false;
    
    // For full search, we'd need the complete sent list
    // This is a simplified check against recent
    return new Response(JSON.stringify({
      email: emailLower,
      status: found ? 'sent' : 'unknown',
      note: 'Search checks recent 20 sent only'
    }), {
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
