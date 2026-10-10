import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true,
  auth: {
    user: 'info@coyolrealestate.com',
    pass: process.env.COYOL_EMAIL_PASS || 'Sell4homes2026!'
  }
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { campaignId, subject, body, leadEmails } = await request.json();

    if (!subject || !body || !leadEmails || leadEmails.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = [];
    
    for (const email of leadEmails) {
      try {
        await transporter.sendMail({
          from: '"Ruth Tal - Coyol Real Estate" <info@coyolrealestate.com>',
          to: email,
          subject: subject,
          html: body,
          text: body.replace(/<[^>]*>/g, '') // Plain text version
        });
        
        results.push({ email, status: 'sent' });
      } catch (err: any) {
        console.error(`Failed to send to ${email}:`, err.message);
        results.push({ email, status: 'failed', error: err.message });
      }
    }

    // Update campaign with sent count
    const sentCount = results.filter(r => r.status === 'sent').length;
    
    // Get current campaign to update leads
    const { data: campaign } = await supabase
      .from('ql_campaigns')
      .select('leads, sent_count')
      .eq('id', campaignId)
      .single();

    if (campaign) {
      // Update lead statuses in the campaign
      const updatedLeads = (campaign.leads || []).map((lead: any) => {
        const result = results.find(r => r.email === lead.email);
        if (result && result.status === 'sent') {
          return { ...lead, status: 'sent', sent_at: new Date().toISOString() };
        }
        return lead;
      });

      await supabase
        .from('ql_campaigns')
        .update({ 
          leads: updatedLeads,
          sent_count: (campaign.sent_count || 0) + sentCount
        })
        .eq('id', campaignId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sent: sentCount,
      failed: results.filter(r => r.status === 'failed').length,
      results 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error sending emails:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to send emails' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
