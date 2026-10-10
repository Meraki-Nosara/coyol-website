import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

// GET - Fetch single model by ID
export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  
  if (!id) {
    const { data } = await supabase
      .from('house_models')
      .select('*')
      .order('interior_sqm');
    return new Response(JSON.stringify(data));
  }

  const { data } = await supabase
    .from('house_models')
    .select('*')
    .eq('id', id)
    .single();
    
  return new Response(JSON.stringify(data));
};

// POST - Create new model
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('house_models')
    .insert(body)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
  
  return new Response(JSON.stringify(data));
};

// PUT - Update existing model
export const PUT: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { id, ...updates } = body;
  
  const { data, error } = await supabase
    .from('house_models')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
  
  return new Response(JSON.stringify(data));
};

// PATCH - Partial update (for turnkey toggle)
export const PATCH: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { id, ...updates } = body;
  
  const { data, error } = await supabase
    .from('house_models')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
  
  return new Response(JSON.stringify(data));
};

// DELETE - Remove model
export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  
  const { error } = await supabase
    .from('house_models')
    .delete()
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
  
  return new Response(JSON.stringify({ success: true }));
};
