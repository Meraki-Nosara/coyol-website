import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { campaignId, emails, status = 'sent' } = await request.json();

    // Get current campaign
    const { data: campaign, error: fetchError } = await supabase
      .from('ql_campaigns')
      .select('leads, sent_count')
      .eq('id', campaignId)
      .single();

    if (fetchError) throw fetchError;

    // Update lead statuses
    const updatedLeads = (campaign.leads || []).map((lead: any) => {
      if (emails.includes(lead.email)) {
        if (status === 'sent') {
          return { ...lead, status: 'sent', sent_at: new Date().toISOString() };
        } else {
          return { ...lead, status: 'pending', sent_at: null };
        }
      }
      return lead;
    });

    // Calculate new sent count
    const sentCount = updatedLeads.filter((l: any) => l.status === 'sent').length;

    // Update campaign
    const { error: updateError } = await supabase
      .from('ql_campaigns')
      .update({ 
        leads: updatedLeads,
        sent_count: sentCount
      })
      .eq('id', campaignId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, sentCount }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error marking leads:', error);
    return new Response(JSON.stringify({ error: 'Failed to update leads' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
