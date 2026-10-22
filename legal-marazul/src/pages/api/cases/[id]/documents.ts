import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    const { data: documents, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('case_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Generate signed URLs for each document (valid for 1 hour)
    const docsWithSignedUrls = await Promise.all(
      (documents || []).map(async (doc) => {
        // Extract file path from stored URL
        const urlParts = doc.file_url.split('/legal-documents/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { data: signedData } = await supabase.storage
            .from('legal-documents')
            .createSignedUrl(filePath, 3600); // 1 hour
          
          return {
            ...doc,
            file_url: signedData?.signedUrl || doc.file_url
          };
        }
        return doc;
      })
    );

    return new Response(JSON.stringify({ documents: docsWithSignedUrls }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load documents' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const docId = url.searchParams.get('id');
    if (!docId) {
      return new Response(JSON.stringify({ error: 'Document ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get document to find storage path
    const { data: doc } = await supabase
      .from('legal_documents')
      .select('file_url')
      .eq('id', docId)
      .single();

    if (doc?.file_url) {
      // Delete from storage
      const urlParts = doc.file_url.split('/legal-documents/');
      if (urlParts.length > 1) {
        await supabase.storage
          .from('legal-documents')
          .remove([urlParts[1]]);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('legal_documents')
      .delete()
      .eq('id', docId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to delete document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const userId = formData.get('userId') as string;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${id}/${timestamp}_${safeName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('legal-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('legal-documents')
      .getPublicUrl(filePath);

    // Create document record
    const { data: doc, error: docError } = await supabase
      .from('legal_documents')
      .insert({
        case_id: id,
        filename: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: userId || null,
        tags
      })
      .select()
      .single();

    if (docError) throw docError;

    // Update case updated_at
    await supabase
      .from('legal_cases')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return new Response(JSON.stringify({ success: true, document: doc }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
