import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

const SESSION_EXTEND = 30 * 60 * 1000; // 30 minutes

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if session exists and is not expired
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('*, legal_users(*)')
      .eq('token', sessionToken)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return new Response(JSON.stringify({ valid: false, reason: 'expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extend session on activity
    const newExpiry = new Date(Date.now() + SESSION_EXTEND);
    await supabase
      .from('user_sessions')
      .update({ 
        last_active: new Date().toISOString(),
        expires_at: newExpiry.toISOString()
      })
      .eq('id', session.id);

    return new Response(JSON.stringify({
      valid: true,
      user: {
        id: session.legal_users.id,
        name: session.legal_users.name,
        role: session.legal_users.role
      },
      expiresAt: newExpiry.toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Logout
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { sessionToken } = await request.json();

    if (sessionToken) {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('token', sessionToken);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
