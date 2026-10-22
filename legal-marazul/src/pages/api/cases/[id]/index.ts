import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    const { data: caseData, error } = await supabase
      .from('legal_cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ case: caseData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Case not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    // Delete related records first (cascade should handle this, but being explicit)
    await supabase.from('legal_events').delete().eq('case_id', id);
    await supabase.from('legal_comments').delete().eq('case_id', id);
    
    // Get documents to delete from storage
    const { data: docs } = await supabase
      .from('legal_documents')
      .select('file_url')
      .eq('case_id', id);
    
    // Delete documents from storage
    if (docs?.length) {
      const paths = docs.map(d => {
        const parts = d.file_url.split('/legal-documents/');
        return parts.length > 1 ? parts[1] : null;
      }).filter(Boolean);
      
      if (paths.length) {
        await supabase.storage.from('legal-documents').remove(paths);
      }
    }
    
    // Delete document records
    await supabase.from('legal_documents').delete().eq('case_id', id);
    
    // Finally delete the case
    const { error } = await supabase
      .from('legal_cases')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Delete failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('legal_cases')
      .update({
        case_number: body.case_number,
        title: body.title,
        case_date: body.case_date,
        status: body.status,
        priority: body.priority,
        category: body.category,
        assigned_lawyer: body.assigned_lawyer,
        description: body.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, case: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Update failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
