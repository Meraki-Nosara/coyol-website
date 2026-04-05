import { defineMiddleware } from 'astro:middleware';
import { getSessionCookie, validateSession } from './lib/auth';

// Pages that don't require authentication
const PUBLIC_PATHS = ['/login', '/api/login'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  
  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return next();
  }
  
  // Allow static assets
  if (pathname.startsWith('/_astro') || pathname.match(/\.(css|js|png|jpg|ico|svg|woff|woff2)$/)) {
    return next();
  }
  
  // Check authentication
  const sessionToken = getSessionCookie(context.request);
  const isAuthenticated = validateSession(sessionToken);
  
  if (!isAuthenticated) {
    // Redirect to login
    return context.redirect('/login');
  }
  
  // User is authenticated, continue
  return next();
});
