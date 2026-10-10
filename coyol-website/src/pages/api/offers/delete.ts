import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();

    const { error } = await supabase
      .from('generated_offers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
