import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    const { data: events, error } = await supabase
      .from('legal_events')
      .select('*')
      .eq('case_id', id)
      .order('event_date', { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ events }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();

    const { data: event, error } = await supabase
      .from('legal_events')
      .insert({
        case_id: id,
        title: body.title,
        event_type: body.event_type,
        event_date: body.event_date,
        description: body.description,
        created_by: body.user_id || null
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, event }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to create event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
