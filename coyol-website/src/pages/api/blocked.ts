import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response('Access denied', { 
    status: 403,
    headers: { 'Content-Type': 'text/plain' }
  });
};

export const POST: APIRoute = GET;
export const PUT: APIRoute = GET;
export const DELETE: APIRoute = GET;
