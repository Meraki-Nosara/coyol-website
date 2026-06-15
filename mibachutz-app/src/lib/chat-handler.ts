/**
 * Mibachutz Chat Handler
 * 
 * Processes incoming messages, extracts intelligence, and generates helpful responses.
 * This is the main integration point between the chat system and AI extraction.
 */

import { extractSignals, quickExtract, saveSignals, type ExtractionResult } from './ai-extraction';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key (for writing to intelligence tables)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY; // Not the anon key!

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Message context for a group
interface GroupContext {
  group_id: string;
  city: string;
  neighborhood?: string;
  language: string;
  recent_messages: { sender: string; text: string; timestamp: Date }[];
  member_baby_ages: string[];  // Array of age ranges in the group
}

// In-memory context cache (would use Redis in production)
const groupContextCache = new Map<string, GroupContext>();

/**
 * Main message handler - call this for every incoming message
 */
export async function handleMessage(
  message: {
    id: string;
    group_id: string;
    sender_id: string;
    sender_name: string;
    text: string;
    timestamp: Date;
  },
  groupInfo: {
    city: string;
    neighborhood?: string;
    language: string;
    baby_age_range?: string;
  }
): Promise<{
  should_respond: boolean;
  response?: string;
  signals_extracted: number;
}> {
  
  // Get or create group context
  let context = groupContextCache.get(message.group_id);
  if (!context) {
    context = {
      group_id: message.group_id,
      city: groupInfo.city,
      neighborhood: groupInfo.neighborhood,
      language: groupInfo.language,
      recent_messages: [],
      member_baby_ages: groupInfo.baby_age_range ? [groupInfo.baby_age_range] : [],
    };
    groupContextCache.set(message.group_id, context);
  }
  
  // Add message to context
  context.recent_messages.push({
    sender: message.sender_name,
    text: message.text,
    timestamp: message.timestamp,
  });
  
  // Keep only last 20 messages
  if (context.recent_messages.length > 20) {
    context.recent_messages = context.recent_messages.slice(-20);
  }
  
  // Step 1: Quick local extraction (fast, no API call)
  const quickSignals = quickExtract(message.text);
  
  // Step 2: Full AI extraction if message seems interesting
  let extraction: ExtractionResult = {
    signals: quickSignals,
    should_respond: false,
  };
  
  if (shouldDoFullExtraction(message.text, quickSignals)) {
    try {
      extraction = await extractSignals(message.text, {
        city: context.city,
        neighborhood: context.neighborhood,
        baby_age_range: context.member_baby_ages[0],
        language: context.language,
        recent_messages: context.recent_messages.slice(-5).map(m => `${m.sender}: ${m.text}`),
      });
    } catch (e) {
      console.error('AI extraction failed:', e);
      // Fall back to quick extraction results
    }
  }
  
  // Step 3: Save signals to database (async, don't wait)
  const allSignals = [...quickSignals, ...extraction.signals];
  const uniqueSignals = deduplicateSignals(allSignals);
  
  if (uniqueSignals.length > 0) {
    saveSignals(uniqueSignals, {
      city: context.city,
      neighborhood: context.neighborhood,
      baby_age_range: context.member_baby_ages[0],
      language: context.language,
    }, supabase).catch(e => console.error('Failed to save signals:', e));
  }
  
  // Step 4: Return response if appropriate
  return {
    should_respond: extraction.should_respond,
    response: extraction.suggested_response,
    signals_extracted: uniqueSignals.length,
  };
}

/**
 * Decide if we should do full AI extraction (costs money)
 */
function shouldDoFullExtraction(text: string, quickSignals: any[]): boolean {
  // Always do full extraction if:
  // 1. Quick extraction found something
  if (quickSignals.length > 0) return true;
  
  // 2. Message is a question
  if (text.includes('?') || text.includes('מישהי') || text.includes('מישהו')) return true;
  
  // 3. Message is longer than average (likely substantive)
  if (text.length > 100) return true;
  
  // 4. Contains keywords that suggest valuable content
  const triggerWords = [
    'ממליצה', 'המלצה', 'שווה', 'לא שווה', 'הכי טוב', 'גרוע',
    'קניתי', 'הזמנתי', 'מחיר', 'יקר', 'זול',
    'recommend', 'best', 'worst', 'bought', 'price',
  ];
  
  const lowerText = text.toLowerCase();
  if (triggerWords.some(w => lowerText.includes(w))) return true;
  
  return false;
}

/**
 * Remove duplicate signals
 */
function deduplicateSignals(signals: any[]): any[] {
  const seen = new Set<string>();
  return signals.filter(s => {
    const key = `${s.signal_type}-${s.category}-${s.brand_mentioned || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Get aggregated insights for a location (for internal dashboards)
 */
export async function getLocationInsights(city: string, neighborhood?: string) {
  const { data, error } = await supabase.rpc('get_segment_profile', {
    p_city: city,
    p_baby_age: null,
  });
  
  if (error) {
    console.error('Failed to get insights:', error);
    return null;
  }
  
  return data;
}

/**
 * Get trending categories for a time period
 */
export async function getTrendingCategories(days: number = 7) {
  const { data, error } = await supabase
    .from('intent_signals')
    .select('category')
    .gte('extracted_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .limit(1000);
  
  if (error) {
    console.error('Failed to get trends:', error);
    return [];
  }
  
  // Count categories
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.category] = (counts[row.category] || 0) + 1;
  }
  
  // Sort by count
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));
}

/**
 * Export for testing
 */
export const _internal = {
  shouldDoFullExtraction,
  deduplicateSignals,
};
