import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  try {
    const filter = url.searchParams.get('filter') || 'all';
    const category = url.searchParams.get('category') || '';
    
    let query = supabase
      .from('legal_cases')
      .select('*, legal_documents(count)')
      .order('updated_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data: cases, error } = await query;

    if (error) throw error;

    // Get stats
    const { data: stats } = await supabase
      .from('legal_cases')
      .select('status');

    const { data: events } = await supabase
      .from('legal_events')
      .select('id')
      .gte('event_date', new Date().toISOString())
      .lte('event_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    const casesWithCount = cases?.map(c => ({
      ...c,
      document_count: c.legal_documents?.[0]?.count || 0
    }));

    return new Response(JSON.stringify({
      cases: casesWithCount || [],
      stats: {
        active: stats?.filter(s => s.status === 'active').length || 0,
        urgent: stats?.filter(s => s.status === 'urgent').length || 0,
        events: events?.length || 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Cases error:', err);
    return new Response(JSON.stringify({ error: 'Failed to load cases' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { case_number, title, description, status, priority } = body;

    if (!case_number || !title) {
      return new Response(JSON.stringify({ error: 'Case number and title required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('legal_cases')
      .insert({
        case_number,
        title,
        description,
        status: status || 'active',
        priority: priority || 'medium'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, case: data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Create case error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to create case' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
