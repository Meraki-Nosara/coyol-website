import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

function generateInviteToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Generate new invite link (admin only)
export const POST: APIRoute = async ({ request }) => {
  try {
    const { userId, expiresInHours = 24, adminId } = await request.json();

    // Verify admin
    const { data: admin } = await supabase
      .from('legal_users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (!admin || admin.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = generateInviteToken();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const { data: invite, error } = await supabase
      .from('invite_links')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log invite creation
    await supabase.from('legal_audit_log').insert({
      user_id: adminId,
      action: 'invite_created',
      details: { for_user: userId, expires_at: expiresAt.toISOString() }
    });

    return new Response(JSON.stringify({
      success: true,
      inviteUrl: `/login?invite=${token}`,
      token,
      expiresAt: expiresAt.toISOString()
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Error creating invite' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
