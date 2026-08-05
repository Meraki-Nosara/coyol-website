import { defineMiddleware } from 'astro:middleware';

const BAD_BOTS = /semrushbot|ahrefsbot|dotbot|petalbot|mj12bot|dataforseo|serpstat|seokicks|blexbot|linkfluence|megaindex|majestic|rogerbot|domaincrawler|netcraft|censys|zgrab|screaming frog|sitebulb/i;

// Block specific hostile parties
const BLOCKED_IPS = new Set([
  '206.223.180.218', // David Riabov / Scratch Agency infrastructure (from architect report)
]);

const BLOCKED_REFERRERS = /scratchagency\.ca/i;

// Simple rate limiting (in-memory, resets on deploy)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  
  record.count++;
  return record.count > RATE_LIMIT;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const userAgent = context.request.headers.get('user-agent') || '';
  const clientIP = getClientIP(context.request);
  const referer = context.request.headers.get('referer') || '';
  
  // Block specific IPs
  if (BLOCKED_IPS.has(clientIP)) {
    return new Response('Access denied', { status: 403 });
  }
  
  // Block hostile referrers
  if (BLOCKED_REFERRERS.test(referer)) {
    return new Response('Access denied', { status: 403 });
  }
  
  // Block known bad bots
  if (BAD_BOTS.test(userAgent)) {
    return new Response('Access denied', { status: 403 });
  }
  
  // Rate limiting
  if (isRateLimited(clientIP)) {
    return new Response('Too many requests', { status: 429 });
  }
  
  const response = await next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
});
