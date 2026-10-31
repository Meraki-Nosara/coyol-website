import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    const { data: folders, error } = await supabase
      .from('legal_folders')
      .select('*')
      .eq('case_id', id)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ folders: folders || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load folders' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, color, icon, created_by } = body;

    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: 'Folder name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: folder, error } = await supabase
      .from('legal_folders')
      .insert({
        case_id: id,
        name: name.trim(),
        description: description || null,
        color: color || 'gray',
        icon: icon || 'folder',
        created_by: created_by || null
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, folder }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to create folder' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ url, params }) => {
  try {
    const folderId = url.searchParams.get('id');
    const { id: caseId } = params;
    
    if (!folderId) {
      return new Response(JSON.stringify({ error: 'Folder ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Move all documents in this folder to root (null folder_id)
    await supabase
      .from('legal_documents')
      .update({ folder_id: null })
      .eq('folder_id', folderId);

    // Delete the folder
    const { error } = await supabase
      .from('legal_folders')
      .delete()
      .eq('id', folderId)
      .eq('case_id', caseId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to delete folder' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, description, color, icon, sort_order } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Folder ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { error } = await supabase
      .from('legal_folders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to update folder' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
