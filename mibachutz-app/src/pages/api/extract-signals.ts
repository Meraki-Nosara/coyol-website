/**
 * API endpoint to extract signals from messages
 * Called by a background job or webhook when new messages arrive
 */

import type { APIRoute } from 'astro';

// Signal extraction prompt (condensed for API use)
const EXTRACTION_PROMPT = `Analyze this mom group chat message and extract market intelligence signals.

Return JSON only:
{
  "signals": [
    {
      "type": "purchase_intent|brand_mention|pain_point|recommendation|health_concern|life_transition",
      "category": "stroller|formula|daycare|pediatrician|clothing|feeding|sleep|toys|health|etc",
      "brand": "brand name if mentioned",
      "sentiment": "positive|negative|neutral|seeking",
      "price_tier": "budget|mid|premium|unknown",
      "urgency": "immediate|soon|researching|future",
      "keywords": ["key", "words"]
    }
  ],
  "response": "helpful response in Hebrew if appropriate, or null"
}

Message: `;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message, group_id, city, neighborhood, baby_age, language } = body;
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Quick local extraction first (no API cost)
    const quickSignals = quickExtract(message);
    
    // If nothing found locally and message is short, skip AI
    if (quickSignals.length === 0 && message.length < 50 && !message.includes('?')) {
      return new Response(JSON.stringify({ 
        signals: [], 
        response: null,
        quick_only: true 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Full AI extraction
    let aiSignals: any[] = [];
    let suggestedResponse: string | null = null;
    
    try {
      const aiResult = await callAI(EXTRACTION_PROMPT + `"${message}"`);
      const parsed = JSON.parse(aiResult);
      aiSignals = parsed.signals || [];
      suggestedResponse = parsed.response;
    } catch (e) {
      console.error('AI extraction failed:', e);
    }
    
    // Merge and deduplicate signals
    const allSignals = [...quickSignals, ...aiSignals];
    const uniqueSignals = deduplicateSignals(allSignals);
    
    // Save to Supabase if we have signals
    if (uniqueSignals.length > 0) {
      await saveSignalsToDb(uniqueSignals, { city, neighborhood, baby_age, language });
    }
    
    return new Response(JSON.stringify({
      signals: uniqueSignals,
      response: suggestedResponse,
      saved: uniqueSignals.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (e) {
    console.error('Extract signals error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Quick local extraction
function quickExtract(message: string): any[] {
  const signals: any[] = [];
  const lower = message.toLowerCase();
  
  // Brand detection
  const brands: Record<string, { category: string; tier: string }> = {
    'bugaboo': { category: 'stroller', tier: 'premium' },
    'yoyo': { category: 'stroller', tier: 'premium' },
    'cybex': { category: 'stroller', tier: 'premium' },
    'chicco': { category: 'stroller', tier: 'mid' },
    'similac': { category: 'formula', tier: 'mid' },
    'materna': { category: 'formula', tier: 'mid' },
    'pampers': { category: 'diapers', tier: 'mid' },
    'huggies': { category: 'diapers', tier: 'mid' },
  };
  
  for (const [brand, info] of Object.entries(brands)) {
    if (lower.includes(brand)) {
      signals.push({
        type: 'brand_mention',
        category: info.category,
        brand,
        price_tier: info.tier,
        sentiment: 'neutral',
        keywords: [brand],
      });
    }
  }
  
  // Purchase intent
  const buyKeywords = ['מחפשת', 'צריכה', 'רוצה לקנות', 'איפה אפשר', 'המלצות', 'looking for', 'need to buy'];
  if (buyKeywords.some(k => lower.includes(k))) {
    // Detect category
    const categories: Record<string, string[]> = {
      'stroller': ['עגלה', 'stroller'],
      'formula': ['תרכובת', 'פורמולה', 'formula'],
      'daycare': ['מעון', 'משפחתון', 'daycare'],
      'diapers': ['חיתולים', 'diapers'],
    };
    
    for (const [cat, kws] of Object.entries(categories)) {
      if (kws.some(k => lower.includes(k))) {
        signals.push({
          type: 'purchase_intent',
          category: cat,
          sentiment: 'seeking',
          keywords: buyKeywords.filter(k => lower.includes(k)),
        });
        break;
      }
    }
  }
  
  // Pain points
  const painKeywords = ['מתוסכלת', 'אי אפשר', 'אין מקום', 'קשה למצוא', 'frustrated', "can't find"];
  if (painKeywords.some(k => lower.includes(k))) {
    signals.push({
      type: 'pain_point',
      sentiment: 'negative',
      keywords: painKeywords.filter(k => lower.includes(k)),
    });
  }
  
  return signals;
}

function deduplicateSignals(signals: any[]): any[] {
  const seen = new Set<string>();
  return signals.filter(s => {
    const key = `${s.type}-${s.category || ''}-${s.brand || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function callAI(prompt: string): Promise<string> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('No API key');
  }
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 500,
    }),
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '{}';
}

async function saveSignalsToDb(signals: any[], context: any) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }
  
  const rows = signals.map(s => ({
    city: context.city,
    neighborhood: context.neighborhood,
    baby_age_range: context.baby_age,
    language: context.language,
    signal_type: s.type,
    category: s.category,
    brand_mentioned: s.brand,
    sentiment: s.sentiment,
    price_sensitivity: s.price_tier,
    urgency: s.urgency,
    keywords: s.keywords,
    confidence_score: 0.8,
  }));
  
  const response = await fetch(`${supabaseUrl}/rest/v1/intent_signals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(rows),
  });
  
  if (!response.ok) {
    console.error('Failed to save signals:', await response.text());
  }
}
