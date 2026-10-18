import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const { accessCode, inviteToken, verificationCode } = await request.json();
    const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limiting
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();
    const { data: attempts } = await supabase
      .from('login_attempts')
      .select('id')
      .eq('ip_address', ip)
      .eq('success', false)
      .gte('attempted_at', oneHourAgo);

    if (attempts && attempts.length >= RATE_LIMIT_ATTEMPTS) {
      // Log blocked attempt
      await supabase.from('legal_audit_log').insert({
        action: 'login_blocked',
        details: { ip, reason: 'rate_limit' }
      });

      return new Response(JSON.stringify({ 
        error: 'Demasiados intentos fallidos. Intenta de nuevo en 1 hora.',
        blocked: true 
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle invite link login
    if (inviteToken) {
      const { data: invite } = await supabase
        .from('invite_links')
        .select('*, legal_users(*)')
        .eq('token', inviteToken)
        .is('used_at', null)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!invite) {
        return new Response(JSON.stringify({ error: 'Enlace de invitación inválido o expirado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Mark invite as used
      await supabase
        .from('invite_links')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION);

      await supabase.from('user_sessions').insert({
        user_id: invite.user_id,
        token,
        ip_address: ip,
        expires_at: expiresAt.toISOString()
      });

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: invite.legal_users.id,
          name: invite.legal_users.name,
          role: invite.legal_users.role
        },
        sessionToken: token,
        expiresAt: expiresAt.toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Standard access code login
    const { data: user, error } = await supabase
      .from('legal_users')
      .select('*')
      .eq('access_code', accessCode)
      .eq('is_active', true)
      .single();

    // Log attempt
    await supabase.from('login_attempts').insert({
      ip_address: ip,
      success: !!user
    });

    if (error || !user) {
      await supabase.from('legal_audit_log').insert({
        action: 'login_failed',
        details: { ip, code_prefix: accessCode?.substring(0, 4) }
      });

      return new Response(JSON.stringify({ error: 'Código de acceso inválido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create session token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await supabase.from('user_sessions').insert({
      user_id: user.id,
      token,
      ip_address: ip,
      expires_at: expiresAt.toISOString()
    });

    // Log successful login
    await supabase.from('legal_audit_log').insert({
      user_id: user.id,
      action: 'login_success',
      details: { ip }
    });

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      sessionToken: token,
      expiresAt: expiresAt.toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Error de autenticación' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
