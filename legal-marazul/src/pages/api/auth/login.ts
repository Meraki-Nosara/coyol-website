import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const { accessCode } = await request.json();

    if (!accessCode) {
      return new Response(JSON.stringify({ success: false, error: 'Access code required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Look up user by access code
    const { data: user, error } = await supabase
      .from('legal_users')
      .select('id, name, email, role, is_active')
      .eq('access_code', accessCode)
      .eq('is_active', true)
      .single();

    // Log the attempt
    await supabase.from('legal_audit_log').insert({
      user_id: user?.id || null,
      action: user ? 'login_success' : 'login_failed',
      resource_type: 'auth',
      details: { attempted_code_prefix: accessCode.substring(0, 4) + '****' },
      ip_address: clientAddress || 'unknown'
    });

    if (error || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid access code' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update last login
    await supabase
      .from('legal_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Auth error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
