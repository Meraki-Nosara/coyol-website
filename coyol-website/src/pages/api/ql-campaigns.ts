import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, type, description } = await request.json();

    const { data, error } = await supabase
      .from('ql_campaigns')
      .insert({
        name,
        type,
        description,
        status: 'draft',
        lead_count: 0,
        sent_count: 0,
        response_count: 0,
        leads: []
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return new Response(JSON.stringify({ error: 'Failed to create campaign' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    
    if (id) {
      const { data, error } = await supabase
        .from('ql_campaigns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('ql_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch campaigns' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Delete campaign
export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Campaign ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabase
      .from('ql_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete campaign' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Add leads to campaign
export const PUT: APIRoute = async ({ request }) => {
  try {
    const { campaignId, leadEmails, action } = await request.json();

    // Get current campaign
    const { data: campaign, error: fetchError } = await supabase
      .from('ql_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (fetchError) throw fetchError;

    let updatedLeads = campaign.leads || [];

    if (action === 'add') {
      // Add new leads (avoid duplicates)
      const existingEmails = new Set(updatedLeads.map((l: any) => l.email));
      const newLeads = leadEmails.filter((email: string) => !existingEmails.has(email));
      updatedLeads = [...updatedLeads, ...newLeads.map((email: string) => ({ email, status: 'pending' }))];
    } else if (action === 'remove') {
      updatedLeads = updatedLeads.filter((l: any) => !leadEmails.includes(l.email));
    }

    // Update campaign
    const { data, error } = await supabase
      .from('ql_campaigns')
      .update({
        leads: updatedLeads,
        lead_count: updatedLeads.length
      })
      .eq('id', campaignId)
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
