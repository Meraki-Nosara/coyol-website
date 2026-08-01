import { defineMiddleware } from 'astro:middleware';

const BAD_BOTS = /semrushbot|ahrefsbot|dotbot|petalbot|mj12bot|dataforseo|serpstat|seokicks|blexbot|linkfluence|megaindex|majestic|rogerbot|domaincrawler|netcraft|censys|zgrab|screaming frog|sitebulb/i;

export const onRequest = defineMiddleware(async (context, next) => {
  const userAgent = context.request.headers.get('user-agent') || '';
  
  // Block known bad bots
  if (BAD_BOTS.test(userAgent)) {
    return new Response('Access denied', { status: 403 });
  }
  
  return next();
});
