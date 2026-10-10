import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, type, status, description, email_subject, email_body } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (email_subject !== undefined) updateData.email_subject = email_subject;
    if (email_body !== undefined) updateData.email_body = email_body;

    const { data, error } = await supabase
      .from('ql_campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return new Response(JSON.stringify({ error: 'Failed to update campaign' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
