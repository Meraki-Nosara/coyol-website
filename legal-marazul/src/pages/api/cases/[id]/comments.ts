import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    const { data: comments, error } = await supabase
      .from('legal_comments')
      .select('*, legal_users(name)')
      .eq('case_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ comments }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load comments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const commentId = url.searchParams.get('id');
    if (!commentId) {
      return new Response(JSON.stringify({ error: 'Comment ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabase
      .from('legal_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to delete comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();

    const { data: comment, error } = await supabase
      .from('legal_comments')
      .insert({
        case_id: id,
        author_id: body.author_id,
        content: body.content
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, comment }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to post comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
