import type { APIRoute } from 'astro';

const API_KEY = 'OLHAS1puZW1R8ZKsTpWjESVSaMfXlyAspGOQaOcr7n4MSifl0yUr1LchTsC7FWGW';
const SITE_ID = 'coyolnosara.com';

export const GET: APIRoute = async ({ url }) => {
  const endpoint = url.searchParams.get('endpoint') || 'aggregate';
  const period = url.searchParams.get('period') || '30d';
  const metrics = url.searchParams.get('metrics') || 'visitors,pageviews';
  const property = url.searchParams.get('property') || '';
  const limit = url.searchParams.get('limit') || '10';

  const plausibleUrl = new URL(`https://plausible.io/api/v1/stats/${endpoint}`);
  plausibleUrl.searchParams.set('site_id', SITE_ID);
  plausibleUrl.searchParams.set('period', period);
  
  if (metrics) plausibleUrl.searchParams.set('metrics', metrics);
  if (property) plausibleUrl.searchParams.set('property', property);
  if (limit) plausibleUrl.searchParams.set('limit', limit);

  try {
    const res = await fetch(plausibleUrl.toString(), {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    
    const data = await res.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache 5 min
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
