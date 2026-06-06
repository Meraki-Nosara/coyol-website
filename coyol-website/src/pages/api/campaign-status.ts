import type { APIRoute } from 'astro';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = '/Users/Coyol/.openclaw/workspace/scripts';

function getLineCount(filepath: string): number {
  try {
    if (!existsSync(filepath)) return 0;
    const content = readFileSync(filepath, 'utf-8');
    return content.trim().split('\n').filter(l => l.trim()).length;
  } catch {
    return 0;
  }
}

function getRecentSent(limit = 20): string[] {
  try {
    const sentFile = join(SCRIPTS_DIR, 'already-sent.txt');
    if (!existsSync(sentFile)) return [];
    const lines = readFileSync(sentFile, 'utf-8').trim().split('\n');
    return lines.slice(-limit);
  } catch {
    return [];
  }
}

function getTodaySent(): number {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayFile = join(SCRIPTS_DIR, `sent-today-${today}.txt`);
    return getLineCount(todayFile);
  } catch {
    return 0;
  }
}

function getPendingCount(): number {
  try {
    const unsentFile = join(SCRIPTS_DIR, 'unsent-emails.json');
    if (!existsSync(unsentFile)) return 0;
    const data = JSON.parse(readFileSync(unsentFile, 'utf-8'));
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function getHotLeadsCount(): number {
  try {
    const hotFile = join(SCRIPTS_DIR, 'hot-leads-reserved.json');
    if (!existsSync(hotFile)) return 0;
    const data = JSON.parse(readFileSync(hotFile, 'utf-8'));
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function getSentDays(): { date: string; count: number }[] {
  try {
    const files = readdirSync(SCRIPTS_DIR).filter(f => f.startsWith('sent-today-'));
    return files.map(f => {
      const date = f.replace('sent-today-', '').replace('.txt', '');
      const count = getLineCount(join(SCRIPTS_DIR, f));
      return { date, count };
    }).sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export const GET: APIRoute = async () => {
  const totalSent = getLineCount(join(SCRIPTS_DIR, 'already-sent.txt'));
  const pending = getPendingCount();
  const hotLeads = getHotLeadsCount();
  const todaySent = getTodaySent();
  const recentSent = getRecentSent(20);
  const sentByDay = getSentDays();
  
  const total = totalSent + pending + hotLeads;
  
  const data = {
    campaign: 'Gift Card Announcement',
    status: pending > 0 ? 'paused' : 'complete',
    note: 'Gmail daily limit reached - resumes tomorrow',
    stats: {
      totalEmails: total,
      sent: totalSent,
      pending: pending,
      hotLeadsReserved: hotLeads,
      todaySent: todaySent,
      percentComplete: total > 0 ? Math.round((totalSent / total) * 100) : 0
    },
    sentByDay,
    recentSent,
    lastUpdated: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
    }
    
    const emailLower = email.toLowerCase().trim();
    const sentFile = join(SCRIPTS_DIR, 'already-sent.txt');
    
    let status = 'unknown';
    if (existsSync(sentFile)) {
      const sent = readFileSync(sentFile, 'utf-8').toLowerCase();
      if (sent.includes(emailLower)) {
        status = 'sent';
      }
    }
    
    if (status === 'unknown') {
      const unsentFile = join(SCRIPTS_DIR, 'unsent-emails.json');
      if (existsSync(unsentFile)) {
        const unsent = JSON.parse(readFileSync(unsentFile, 'utf-8'));
        if (unsent.includes(emailLower)) {
          status = 'pending';
        }
      }
    }
    
    if (status === 'unknown') {
      const hotFile = join(SCRIPTS_DIR, 'hot-leads-reserved.json');
      if (existsSync(hotFile)) {
        const hot = JSON.parse(readFileSync(hotFile, 'utf-8'));
        if (hot.includes(emailLower)) {
          status = 'hot-lead-reserved';
        }
      }
    }
    
    return new Response(JSON.stringify({
      email: emailLower,
      status
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
